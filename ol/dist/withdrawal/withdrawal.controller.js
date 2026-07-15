"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.calculateFee = exports.deleteWithdrawal = exports.updateWithdrawal = exports.createWithdrawal = exports.getWithdrawal = exports.listWithdrawals = void 0;
const withdrawalService = __importStar(require("./withdrawal.service"));
const withdrawal_service_1 = require("./withdrawal.service");
const http_response_1 = require("../utils/http-response");
const ensureAuthenticated = (req, res) => {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
        (0, http_response_1.errorResponse)(res, "Authentication required", 401);
        return null;
    }
    try {
        return BigInt(req.user.id);
    }
    catch (error) {
        (0, http_response_1.errorResponse)(res, "Invalid user id", 400);
        return null;
    }
};
const handleError = (res, error, fallback) => {
    if (error instanceof withdrawal_service_1.WithdrawalError) {
        return (0, http_response_1.errorResponse)(res, error.message, error.statusCode);
    }
    return (0, http_response_1.errorResponse)(res, fallback, 500);
};
const listWithdrawals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = ensureAuthenticated(req, res);
    if (userId === null)
        return;
    const parsePositiveInt = (value, fallback) => {
        if (value === undefined || value === null) {
            return fallback;
        }
        const raw = Array.isArray(value) ? value[0] : value;
        const parsed = Number.parseInt(String(raw), 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    };
    const extractQueryValue = (value) => Array.isArray(value) ? value[0] : value;
    try {
        const isAdmin = req.user.role === "admin";
        const statusQuery = extractQueryValue(req.query.status);
        const perPageRaw = extractQueryValue(((_a = req.query.per_page) !== null && _a !== void 0 ? _a : req.query.perPage));
        const pageRaw = extractQueryValue(req.query.page);
        const perPage = Math.min(parsePositiveInt(perPageRaw, 15), 100);
        const requestedPage = parsePositiveInt(pageRaw, 1);
        const statusFilter = typeof statusQuery === "string" && statusQuery.length > 0
            ? statusQuery
            : undefined;
        let page = requestedPage;
        let { data, total } = yield withdrawalService.getWithdrawals(userId, isAdmin, {
            status: statusFilter,
            page,
            perPage,
        });
        const totalPages = Math.max(1, Math.ceil(total / perPage));
        const currentPage = Math.min(page, totalPages);
        if (total > 0 && currentPage !== page) {
            page = currentPage;
            const fallback = yield withdrawalService.getWithdrawals(userId, isAdmin, {
                status: statusFilter,
                page,
                perPage,
            });
            data = fallback.data;
            total = fallback.total;
        }
        else {
            page = currentPage;
        }
        const skip = (page - 1) * perPage;
        const from = total === 0 ? null : skip + 1;
        const to = total === 0 ? null : skip + data.length;
        const basePath = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
        const baseParams = new URLSearchParams();
        if (statusFilter) {
            baseParams.set("status", statusFilter);
        }
        if (perPageRaw) {
            baseParams.set("per_page", String(perPageRaw));
        }
        const buildPageUrl = (pageNumber) => {
            const params = new URLSearchParams(baseParams.toString());
            params.set("page", pageNumber.toString());
            return `${basePath}?${params.toString()}`;
        };
        const paginationLinks = [
            {
                url: page > 1 ? buildPageUrl(page - 1) : null,
                label: "&laquo; Previous",
                active: false,
            },
            ...Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                return {
                    url: buildPageUrl(pageNumber),
                    label: pageNumber.toString(),
                    active: pageNumber === page,
                };
            }),
            {
                url: page < totalPages ? buildPageUrl(page + 1) : null,
                label: "Next &raquo;",
                active: false,
            },
        ];
        const withdrawals = {
            current_page: page,
            data,
            first_page_url: buildPageUrl(1),
            from,
            last_page: totalPages,
            last_page_url: buildPageUrl(totalPages),
            links: paginationLinks,
            next_page_url: page < totalPages ? buildPageUrl(page + 1) : null,
            path: basePath,
            per_page: perPage,
            prev_page_url: page > 1 ? buildPageUrl(page - 1) : null,
            to,
            total,
        };
        const message = isAdmin
            ? "Withdrawals retrieved successfully"
            : "Your withdrawals retrieved successfully";
        return (0, http_response_1.successResponse)(res, { withdrawals }, message);
    }
    catch (error) {
        handleError(res, error, "Failed to retrieve withdrawals");
    }
});
exports.listWithdrawals = listWithdrawals;
const getWithdrawal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = ensureAuthenticated(req, res);
    if (userId === null)
        return;
    try {
        const withdrawalId = BigInt(req.params.id);
        const isAdmin = req.user.role === "admin";
        const withdrawal = yield withdrawalService.getWithdrawalById(withdrawalId, userId, isAdmin);
        if (!withdrawal) {
            return (0, http_response_1.errorResponse)(res, "Withdrawal not found", 404);
        }
        return (0, http_response_1.successResponse)(res, { withdrawal }, "Withdrawal retrieved successfully");
    }
    catch (error) {
        if (error instanceof RangeError) {
            return (0, http_response_1.errorResponse)(res, "Invalid withdrawal id", 400);
        }
        handleError(res, error, "Failed to retrieve withdrawal");
    }
});
exports.getWithdrawal = getWithdrawal;
const createWithdrawal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = ensureAuthenticated(req, res);
    if (userId === null)
        return;
    try {
        const payload = {
            currency: req.body.currency,
            amount: Number(req.body.amount),
            walletAddress: ((_a = req.body.wallet_address) !== null && _a !== void 0 ? _a : req.body.walletAddress),
            network: req.body.network,
            withdrawalPassword: ((_b = req.body.withdrawal_password) !== null && _b !== void 0 ? _b : req.body.withdrawalPassword),
        };
        const withdrawal = yield withdrawalService.createWithdrawal(userId, payload);
        return (0, http_response_1.successResponse)(res, { withdrawal }, "Withdrawal request created successfully", 201);
    }
    catch (error) {
        handleError(res, error, "Failed to create withdrawal request");
    }
});
exports.createWithdrawal = createWithdrawal;
const updateWithdrawal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = ensureAuthenticated(req, res);
    if (userId === null)
        return;
    if (req.user.role !== "admin") {
        return (0, http_response_1.errorResponse)(res, "Unauthorized action", 403);
    }
    try {
        const withdrawalId = BigInt(req.params.id);
        const payload = {
            status: req.body.status,
            rejectionReason: (_a = req.body.rejectionReason) !== null && _a !== void 0 ? _a : req.body.rejection_reason,
        };
        const withdrawal = yield withdrawalService.updateWithdrawalStatus(withdrawalId, userId, payload);
        return (0, http_response_1.successResponse)(res, { withdrawal }, `Withdrawal ${payload.status} successfully`);
    }
    catch (error) {
        if (error instanceof RangeError) {
            return (0, http_response_1.errorResponse)(res, "Invalid withdrawal id", 400);
        }
        handleError(res, error, "Failed to update withdrawal");
    }
});
exports.updateWithdrawal = updateWithdrawal;
const deleteWithdrawal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = ensureAuthenticated(req, res);
    if (userId === null)
        return;
    try {
        const withdrawalId = BigInt(req.params.id);
        const isAdmin = req.user.role === "admin";
        yield withdrawalService.deleteWithdrawal(withdrawalId, userId, isAdmin);
        return (0, http_response_1.successResponse)(res, [], "Withdrawal deleted successfully");
    }
    catch (error) {
        if (error instanceof RangeError) {
            return (0, http_response_1.errorResponse)(res, "Invalid withdrawal id", 400);
        }
        handleError(res, error, "Failed to delete withdrawal");
    }
});
exports.deleteWithdrawal = deleteWithdrawal;
const calculateFee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = ensureAuthenticated(req, res);
    if (userId === null)
        return;
    try {
        const payload = {
            currency: req.body.currency,
            amount: Number(req.body.amount),
            network: req.body.network,
        };
        const result = yield withdrawalService.previewWithdrawalFee(userId, payload);
        return (0, http_response_1.successResponse)(res, {
            fee: result.fee.toNumber(),
            total: result.total.toNumber(),
            currency: result.currency,
        }, "Fee calculated successfully");
    }
    catch (error) {
        handleError(res, error, "Failed to calculate withdrawal fee");
    }
});
exports.calculateFee = calculateFee;
