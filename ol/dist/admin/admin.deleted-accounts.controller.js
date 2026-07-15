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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeletedAccount = exports.listDeletedAccounts = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const http_response_1 = require("../utils/http-response");
const pagination_1 = require("../utils/pagination");
const listDeletedAccounts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const query = req.query;
        const page = (0, pagination_1.getNumericQueryValue)(query.page, 1, { min: 1 });
        const perPage = (0, pagination_1.getNumericQueryValue)((_a = query.perPage) !== null && _a !== void 0 ? _a : query.per_page, 20, {
            min: 1,
            max: 100,
        });
        const rawSearch = query.search;
        const search = typeof rawSearch === "string" && rawSearch.trim().length > 0
            ? rawSearch.trim()
            : undefined;
        const skip = (page - 1) * perPage;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
            ];
        }
        const [records, total] = yield Promise.all([
            prisma_1.default.deletedAccount.findMany({
                where,
                skip,
                take: perPage,
                orderBy: { deletedAt: "desc" },
            }),
            prisma_1.default.deletedAccount.count({ where }),
        ]);
        const paginator = (0, pagination_1.buildLengthAwarePaginator)(req, records, {
            page,
            perPage,
            total,
        });
        return (0, http_response_1.successResponse)(res, { deleted_accounts: paginator }, "Deleted accounts retrieved successfully");
    }
    catch (error) {
        return (0, http_response_1.errorResponse)(res, "Failed to retrieve deleted accounts", 500, error.message);
    }
});
exports.listDeletedAccounts = listDeletedAccounts;
const getDeletedAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id) || id <= 0) {
            return (0, http_response_1.errorResponse)(res, "Deleted account not found", 404);
        }
        const record = yield prisma_1.default.deletedAccount.findUnique({
            where: { id: BigInt(id) },
        });
        if (!record) {
            return (0, http_response_1.errorResponse)(res, "Deleted account not found", 404);
        }
        return (0, http_response_1.successResponse)(res, { deleted_account: record }, "Deleted account retrieved successfully");
    }
    catch (error) {
        return (0, http_response_1.errorResponse)(res, "Failed to retrieve deleted account", 500, error.message);
    }
});
exports.getDeletedAccount = getDeletedAccount;
