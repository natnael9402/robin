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
exports.deleteCryptoAddress = exports.updateCryptoAddress = exports.createCryptoAddress = exports.getCryptoAddressById = exports.listCryptoAddresses = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const prisma_2 = require("../generated/prisma");
const toPlainObject = (input) => {
    if (input === null || input === undefined) {
        return input;
    }
    if (typeof input === "bigint") {
        return Number(input);
    }
    if (input instanceof prisma_2.Prisma.Decimal) {
        return input.toString();
    }
    if (input instanceof Date) {
        return input.toISOString();
    }
    if (Array.isArray(input)) {
        return input.map((value) => toPlainObject(value));
    }
    if (typeof input === "object") {
        const entries = Object.entries(input).map(([key, value]) => [key, toPlainObject(value)]);
        return Object.fromEntries(entries);
    }
    return input;
};
const sanitizeUser = (user) => {
    const sanitized = Object.assign({}, user);
    delete sanitized.password;
    delete sanitized.remember_token;
    delete sanitized.fund_password;
    return sanitized;
};
const formatAddress = (address) => {
    const plain = toPlainObject(address);
    if (address.creator) {
        plain.creator = sanitizeUser(toPlainObject(address.creator));
    }
    if (address.updater) {
        plain.updater = sanitizeUser(toPlainObject(address.updater));
    }
    return plain;
};
const listCryptoAddresses = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, perPage, currency, network } = params;
    const skip = (page - 1) * perPage;
    const where = {};
    if (currency) {
        where.currency = currency.toUpperCase();
    }
    if (network) {
        where.network = network.toUpperCase();
    }
    const [records, total] = yield Promise.all([
        prisma_1.default.cryptoAddress.findMany({
            where,
            include: { creator: true, updater: true },
            skip,
            take: perPage,
            orderBy: { created_at: "desc" },
        }),
        prisma_1.default.cryptoAddress.count({ where }),
    ]);
    return {
        addresses: records.map((record) => formatAddress(record)),
        pagination: {
            page,
            perPage,
            total,
        },
    };
});
exports.listCryptoAddresses = listCryptoAddresses;
const getCryptoAddressById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const address = yield prisma_1.default.cryptoAddress.findUnique({
        where: { id },
        include: { creator: true, updater: true },
    });
    if (!address) {
        return null;
    }
    return formatAddress(address);
});
exports.getCryptoAddressById = getCryptoAddressById;
const createCryptoAddress = (adminId, data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const currency = data.currency.toUpperCase();
    const network = data.network.toUpperCase();
    const timestamp = new Date();
    yield prisma_1.default.cryptoAddress.updateMany({
        where: {
            currency,
            network,
            is_active: true,
        },
        data: {
            is_active: false,
            updated_by: adminId,
            last_updated: timestamp,
        },
    });
    const created = yield prisma_1.default.cryptoAddress.create({
        data: {
            currency,
            network,
            address: data.address,
            qr_code: (_a = data.qrCode) !== null && _a !== void 0 ? _a : null,
            notes: (_b = data.notes) !== null && _b !== void 0 ? _b : null,
            is_active: true,
            created_by: adminId,
            updated_by: adminId,
            last_updated: timestamp,
        },
        include: { creator: true, updater: true },
    });
    return formatAddress(created);
});
exports.createCryptoAddress = createCryptoAddress;
const updateCryptoAddress = (id, adminId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield prisma_1.default.cryptoAddress.findUnique({ where: { id } });
    if (!existing) {
        throw new Error("Crypto address not found");
    }
    const timestamp = new Date();
    const updateData = Object.assign(Object.assign({}, data), { last_updated: timestamp, updated_by: adminId });
    const updated = yield prisma_1.default.cryptoAddress.update({
        where: { id },
        data: updateData,
        include: { creator: true, updater: true },
    });
    return formatAddress(updated);
});
exports.updateCryptoAddress = updateCryptoAddress;
const deleteCryptoAddress = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.cryptoAddress.delete({ where: { id } });
});
exports.deleteCryptoAddress = deleteCryptoAddress;
