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
exports.deleteAdmin = exports.updateAdmin = exports.createAdmin = exports.listAdmins = void 0;
const admin_accounts_service_1 = require("./admin.accounts.service");
const http_response_1 = require("../utils/http-response");
const pagination_1 = require("../utils/pagination");
const normalizeStatus = (value) => {
    if (typeof value !== "string") {
        return undefined;
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
        return undefined;
    }
    if (trimmed === "active" ||
        trimmed === "inactive" ||
        trimmed === "suspended") {
        return trimmed;
    }
    return undefined;
};
const extractPasswordConfirmation = (body) => {
    var _a;
    const confirmation = (_a = body.password_confirmation) !== null && _a !== void 0 ? _a : body.passwordConfirmation;
    return typeof confirmation === "string" ? confirmation : undefined;
};
const listAdmins = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const query = req.query;
        const page = (0, pagination_1.getNumericQueryValue)(query.page, 1, { min: 1 });
        const perPage = (0, pagination_1.getNumericQueryValue)((_a = query.perPage) !== null && _a !== void 0 ? _a : query.per_page, 10, {
            min: 1,
            max: 100,
        });
        const rawSearch = query.search;
        const search = typeof rawSearch === "string" && rawSearch.trim().length > 0
            ? rawSearch.trim()
            : undefined;
        const result = yield (0, admin_accounts_service_1.listAdminAccounts)({ page, perPage, search });
        const paginator = (0, pagination_1.buildLengthAwarePaginator)(req, result.admins, {
            page: result.pagination.page,
            perPage: result.pagination.perPage,
            total: result.pagination.total,
        });
        return (0, http_response_1.successResponse)(res, { admins: paginator }, "Admins retrieved successfully");
    }
    catch (error) {
        return (0, http_response_1.errorResponse)(res, "Failed to retrieve admins", 500, error.message);
    }
});
exports.listAdmins = listAdmins;
const createAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const name = typeof body.name === "string" ? body.name.trim() : "";
        const email = typeof body.email === "string" ? body.email.trim() : "";
        const password = typeof body.password === "string" ? body.password : undefined;
        const status = normalizeStatus(body.status);
        const confirmation = extractPasswordConfirmation(body);
        if (password && confirmation && password !== confirmation) {
            return (0, http_response_1.errorResponse)(res, "Password confirmation does not match password", 422);
        }
        if (!name) {
            return (0, http_response_1.errorResponse)(res, "Name is required", 422);
        }
        if (!email) {
            return (0, http_response_1.errorResponse)(res, "Email is required", 422);
        }
        if (!password) {
            return (0, http_response_1.errorResponse)(res, "Password is required", 422);
        }
        const admin = yield (0, admin_accounts_service_1.createAdminAccount)({
            name,
            email,
            password,
            status,
        });
        return (0, http_response_1.successResponse)(res, { admin }, "Admin created successfully", 201);
    }
    catch (error) {
        const err = error;
        if (err.code === "EMAIL_IN_USE") {
            return (0, http_response_1.errorResponse)(res, err.message, 409);
        }
        return (0, http_response_1.errorResponse)(res, "Failed to create admin", 500, err.message);
    }
});
exports.createAdmin = createAdmin;
const updateAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminId = Number(req.params.id);
        if (!Number.isFinite(adminId) || adminId <= 0) {
            return (0, http_response_1.errorResponse)(res, "Admin not found", 404);
        }
        const body = req.body;
        const payload = {};
        if (typeof body.name === "string") {
            payload.name = body.name.trim();
        }
        if (typeof body.email === "string") {
            payload.email = body.email.trim();
        }
        else if (body.email === null) {
            payload.email = null;
        }
        const status = normalizeStatus(body.status);
        if (status) {
            payload.status = status;
        }
        if (typeof body.password === "string" && body.password.length > 0) {
            const confirmation = extractPasswordConfirmation(body);
            if (confirmation && confirmation !== body.password) {
                return (0, http_response_1.errorResponse)(res, "Password confirmation does not match password", 422);
            }
            payload.password = body.password;
        }
        const admin = yield (0, admin_accounts_service_1.updateAdminAccount)(adminId, payload, req.user);
        return (0, http_response_1.successResponse)(res, { admin }, "Admin updated successfully");
    }
    catch (error) {
        const err = error;
        if (err.code === "NOT_FOUND") {
            return (0, http_response_1.errorResponse)(res, err.message, 404);
        }
        if (err.code === "EMAIL_IN_USE") {
            return (0, http_response_1.errorResponse)(res, err.message, 409);
        }
        if (err.code === "FORBIDDEN") {
            return (0, http_response_1.errorResponse)(res, err.message, 403);
        }
        return (0, http_response_1.errorResponse)(res, "Failed to update admin", 500, err.message);
    }
});
exports.updateAdmin = updateAdmin;
const deleteAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminId = Number(req.params.id);
        if (!Number.isFinite(adminId) || adminId <= 0) {
            return (0, http_response_1.errorResponse)(res, "Admin not found", 404);
        }
        yield (0, admin_accounts_service_1.deleteAdminAccount)(adminId);
        return (0, http_response_1.successResponse)(res, [], "Admin deleted successfully");
    }
    catch (error) {
        const err = error;
        if (err.code === "NOT_FOUND") {
            return (0, http_response_1.errorResponse)(res, err.message, 404);
        }
        if (err.code === "FORBIDDEN") {
            return (0, http_response_1.errorResponse)(res, err.message, 403);
        }
        return (0, http_response_1.errorResponse)(res, "Failed to delete admin", 500, err.message);
    }
});
exports.deleteAdmin = deleteAdmin;
