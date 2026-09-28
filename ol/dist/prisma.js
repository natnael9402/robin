"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("./generated/prisma");
/**
 * Centralised soft-delete filter.
 *
 * Admin user deletion is an archive (`users.deleted_at`), not a SQL DELETE, so
 * every read of a User must skip archived rows. Rather than touch the ~48 user
 * query call sites scattered across the codebase, the filter is injected here
 * once for every read operation.
 *
 * ESCAPE HATCH: when a caller passes `deleted_at` explicitly in `where`, the
 * filter does not run. That is how the admin restore/purge/impact paths reach
 * archived users:
 *   prisma.user.findFirst({ where: { id, deleted_at: { not: null } } })
 * Keep it that way - silently re-injecting `deleted_at: null` would make
 * archived users permanently unreachable.
 *
 * Only read operations are filtered. `create` is left untouched because Prisma
 * rejects a `where` argument on create, and writes (`update`, `updateMany`,
 * `delete`) must be able to target archived rows.
 */
const SOFT_DELETE_MODEL = "User";
const SOFT_DELETE_FIELD = "deleted_at";
const withSoftDeleteFilter = (model, args) => {
    if (model !== SOFT_DELETE_MODEL) {
        return args;
    }
    if (!args || typeof args !== "object") {
        return args;
    }
    const where = args.where;
    if (where && typeof where === "object" &&
        Object.prototype.hasOwnProperty.call(where, SOFT_DELETE_FIELD)) {
        return args;
    }
    args.where = Object.assign({}, where || {}, { [SOFT_DELETE_FIELD]: null });
    return args;
};
const prisma = new prisma_1.PrismaClient({
    transactionOptions: {
        maxWait: 10000, // wait for connection (ms)
        timeout: 20000, // transaction timeout (ms)
    },
}).$extends({
    query: {
        $allModels: {
            create(_a) {
                return __awaiter(this, arguments, void 0, function* ({ model, args, query }) {
                    var _b;
                    const modelFields = (_b = prisma_1.Prisma.dmmf.datamodel.models.find((m) => m.name === model)) === null || _b === void 0 ? void 0 : _b.fields;
                    const data = Object.assign({}, args.data);
                    if (modelFields === null || modelFields === void 0 ? void 0 : modelFields.some((f) => f.name === "created_at")) {
                        data.created_at = new Date();
                    }
                    if (modelFields === null || modelFields === void 0 ? void 0 : modelFields.some((f) => f.name === "updated_at")) {
                        data.updated_at = new Date();
                    }
                    args.data = data;
                    return query(args);
                });
            },
            update(_a) {
                return __awaiter(this, arguments, void 0, function* ({ model, args, query }) {
                    var _b;
                    const modelFields = (_b = prisma_1.Prisma.dmmf.datamodel.models.find((m) => m.name === model)) === null || _b === void 0 ? void 0 : _b.fields;
                    if (modelFields === null || modelFields === void 0 ? void 0 : modelFields.some((f) => f.name === "updated_at")) {
                        args.data = Object.assign(Object.assign({}, args.data), { updated_at: new Date() });
                    }
                    return query(args);
                });
            },
            updateMany(_a) {
                return __awaiter(this, arguments, void 0, function* ({ model, args, query }) {
                    var _b;
                    const modelFields = (_b = prisma_1.Prisma.dmmf.datamodel.models.find((m) => m.name === model)) === null || _b === void 0 ? void 0 : _b.fields;
                    if (args.data && (modelFields === null || modelFields === void 0 ? void 0 : modelFields.some((f) => f.name === "updated_at"))) {
                        args.data = Object.assign(Object.assign({}, args.data), { updated_at: new Date() });
                    }
                    return query(args);
                });
            },
            count(_a) {
                return __awaiter(this, arguments, void 0, function* ({ model, args, query }) {
                    return query(withSoftDeleteFilter(model, args));
                });
            },
            aggregate(_a) {
                return __awaiter(this, arguments, void 0, function* ({ model, args, query }) {
                    return query(withSoftDeleteFilter(model, args));
                });
            },
            groupBy(_a) {
                return __awaiter(this, arguments, void 0, function* ({ model, args, query }) {
                    return query(withSoftDeleteFilter(model, args));
                });
            },
            findMany(_a) {
                return __awaiter(this, arguments, void 0, function* ({ model, args, query }) {
                    if (model === "ArbitrageProduct") {
                        const results = yield query(args);
                        return results.map((product) => (Object.assign(Object.assign({}, product), { supported_currencies: JSON.parse(product.supported_currencies) })));
                    }
                    return query(withSoftDeleteFilter(model, args));
                });
            },
            findFirst(_a) {
                return __awaiter(this, arguments, void 0, function* ({ model, args, query }) {
                    if (model === "ArbitrageProduct") {
                        const result = yield query(args);
                        if (result) {
                            return Object.assign(Object.assign({}, result), { supported_currencies: JSON.parse(result.supported_currencies) });
                        }
                        return result;
                    }
                    return query(withSoftDeleteFilter(model, args));
                });
            },
            findFirstOrThrow(_a) {
                return __awaiter(this, arguments, void 0, function* ({ model, args, query }) {
                    if (model === "ArbitrageProduct") {
                        const result = yield query(args);
                        if (result) {
                            return Object.assign(Object.assign({}, result), { supported_currencies: JSON.parse(result.supported_currencies) });
                        }
                        throw new Error("Product not found");
                    }
                    return query(withSoftDeleteFilter(model, args));
                });
            },
            findUniqueOrThrow(_a) {
                return __awaiter(this, arguments, void 0, function* ({ model, args, query }) {
                    if (model === "ArbitrageProduct") {
                        const result = yield query(args);
                        if (result) {
                            return Object.assign(Object.assign({}, result), { supported_currencies: JSON.parse(result.supported_currencies) });
                        }
                        throw new Error("Product not found");
                    }
                    return query(withSoftDeleteFilter(model, args));
                });
            },
            findUnique(_a) {
                return __awaiter(this, arguments, void 0, function* ({ model, args, query }) {
                    if (model === "ArbitrageProduct") {
                        const result = yield query(args);
                        if (result) {
                            return Object.assign(Object.assign({}, result), { supported_currencies: JSON.parse(result.supported_currencies) });
                        }
                        return result;
                    }
                    return query(withSoftDeleteFilter(model, args));
                });
            },
        },
    },
});
exports.default = prisma;
