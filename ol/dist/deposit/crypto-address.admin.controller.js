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
exports.deleteAddress = exports.updateAddress = exports.createAddress = exports.getAddress = exports.listAddresses = void 0;
const crypto_address_admin_service_1 = require("./crypto-address.admin.service");
const http_response_1 = require("../utils/http-response");
const pagination_1 = require("../utils/pagination");
const getAdminId = (req) => {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
        throw new Error("Unauthorized. Admin access required.");
    }
    return BigInt(req.user.id);
};
const normalizeString = (value) => {
    if (Array.isArray(value) && value.length > 0) {
        return normalizeString(value[value.length - 1]);
    }
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : undefined;
    }
    return undefined;
};
const listAddresses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const query = req.query;
        const page = (0, pagination_1.getNumericQueryValue)(query.page, 1, { min: 1 });
        const perPage = (0, pagination_1.getNumericQueryValue)((_a = query.per_page) !== null && _a !== void 0 ? _a : query.perPage, 10, {
            min: 1,
            max: 100,
        });
        const currency = normalizeString(query.currency);
        const network = normalizeString(query.network);
        const result = yield (0, crypto_address_admin_service_1.listCryptoAddresses)({
            page,
            perPage,
            currency,
            network,
        });
        const paginator = (0, pagination_1.buildLengthAwarePaginator)(req, result.addresses, {
            page: result.pagination.page,
            perPage: result.pagination.perPage,
            total: result.pagination.total,
        });
        return (0, http_response_1.successResponse)(res, { addresses: paginator }, "Crypto addresses retrieved successfully");
    }
    catch (error) {
        return (0, http_response_1.errorResponse)(res, "Failed to retrieve crypto addresses", 500, error.message);
    }
});
exports.listAddresses = listAddresses;
const getAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
            return (0, http_response_1.errorResponse)(res, "Crypto address not found", 404);
        }
        const address = yield (0, crypto_address_admin_service_1.getCryptoAddressById)(id);
        if (!address) {
            return (0, http_response_1.errorResponse)(res, "Crypto address not found", 404);
        }
        return (0, http_response_1.successResponse)(res, { address }, "Crypto address retrieved successfully");
    }
    catch (error) {
        return (0, http_response_1.errorResponse)(res, "Failed to retrieve crypto address", 500, error.message);
    }
});
exports.getAddress = getAddress;
const createAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    try {
        const adminId = getAdminId(req);
        const body = req.body;
        const currency = (_b = (_a = body.currency) !== null && _a !== void 0 ? _a : body.Currency) !== null && _b !== void 0 ? _b : "";
        const network = (_d = (_c = body.network) !== null && _c !== void 0 ? _c : body.Network) !== null && _d !== void 0 ? _d : "";
        const address = (_f = (_e = body.address) !== null && _e !== void 0 ? _e : body.Address) !== null && _f !== void 0 ? _f : "";
        const qrCode = (_h = (_g = body.qrCode) !== null && _g !== void 0 ? _g : body.qr_code) !== null && _h !== void 0 ? _h : undefined;
        const notes = (_k = (_j = body.notes) !== null && _j !== void 0 ? _j : body.Notes) !== null && _k !== void 0 ? _k : undefined;
        const created = yield (0, crypto_address_admin_service_1.createCryptoAddress)(adminId, {
            currency: currency.trim(),
            network: network.trim(),
            address: address.trim(),
            qrCode: (_l = qrCode === null || qrCode === void 0 ? void 0 : qrCode.trim()) !== null && _l !== void 0 ? _l : null,
            notes: (_m = notes === null || notes === void 0 ? void 0 : notes.trim()) !== null && _m !== void 0 ? _m : null,
        });
        return (0, http_response_1.successResponse)(res, { address: created }, "Crypto address created successfully", 201);
    }
    catch (error) {
        const message = error.message;
        if (message === "Unauthorized. Admin access required.") {
            return (0, http_response_1.errorResponse)(res, message, 403);
        }
        return (0, http_response_1.errorResponse)(res, "Failed to create crypto address", 500, message);
    }
});
exports.createAddress = createAddress;
const updateAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminId = getAdminId(req);
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
            return (0, http_response_1.errorResponse)(res, "Crypto address not found", 404);
        }
        const { address, qr_code, notes, is_active } = req.body;
        const updated = yield (0, crypto_address_admin_service_1.updateCryptoAddress)(id, adminId, {
            address,
            qr_code,
            notes,
            is_active,
        });
        return (0, http_response_1.successResponse)(res, { address: updated }, "Crypto address updated successfully");
    }
    catch (error) {
        const message = error.message;
        if (message === "Unauthorized. Admin access required.") {
            return (0, http_response_1.errorResponse)(res, message, 403);
        }
        if (message === "Crypto address not found") {
            return (0, http_response_1.errorResponse)(res, message, 404);
        }
        return (0, http_response_1.errorResponse)(res, "Failed to update crypto address", 500, message);
    }
});
exports.updateAddress = updateAddress;
const deleteAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
            return (0, http_response_1.errorResponse)(res, "Crypto address not found", 404);
        }
        yield (0, crypto_address_admin_service_1.deleteCryptoAddress)(id);
        return (0, http_response_1.successResponse)(res, [], "Crypto address deleted successfully");
    }
    catch (error) {
        const message = error.message;
        if (message.includes("Record to delete does not exist")) {
            return (0, http_response_1.errorResponse)(res, "Crypto address not found", 404);
        }
        return (0, http_response_1.errorResponse)(res, "Failed to delete crypto address", 500, message);
    }
});
exports.deleteAddress = deleteAddress;
