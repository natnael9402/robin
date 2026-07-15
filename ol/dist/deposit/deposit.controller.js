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
exports.deleteDeposit = exports.updateDeposit = exports.createDeposit = exports.getDeposit = exports.getDeposits = void 0;
const depositService = __importStar(require("./deposit.service"));
const http_response_1 = require("../utils/http-response");
const pagination_1 = require("../utils/pagination");
const blob_storage_1 = require("../utils/blob-storage");
const extractStatusFilter = (value) => {
    if (Array.isArray(value) && value.length > 0) {
        return extractStatusFilter(value[value.length - 1]);
    }
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : undefined;
    }
    return undefined;
};
const getDeposits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const isAdmin = req.user.role === "admin";
        const query = req.query;
        const page = (0, pagination_1.getNumericQueryValue)(query.page, 1, { min: 1 });
        const perPage = (0, pagination_1.getNumericQueryValue)((_a = query.per_page) !== null && _a !== void 0 ? _a : query.perPage, 15, { min: 1, max: 100 });
        const status = extractStatusFilter(query.status);
        const result = yield depositService.getDeposits({
            userId: req.user.id,
            isAdmin,
            status: isAdmin ? status : undefined,
            page,
            perPage,
        });
        const paginator = (0, pagination_1.buildLengthAwarePaginator)(req, result.deposits, {
            page: result.pagination.page,
            perPage: result.pagination.perPage,
            total: result.pagination.total,
        });
        const message = isAdmin
            ? "Deposits retrieved successfully"
            : "Your deposits retrieved successfully";
        return (0, http_response_1.successResponse)(res, { deposits: paginator }, message);
    }
    catch (error) {
        return (0, http_response_1.errorResponse)(res, "Failed to retrieve deposits", 500, error.message);
    }
});
exports.getDeposits = getDeposits;
const getDeposit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const depositId = BigInt(req.params.id);
        const isAdmin = req.user.role === "admin";
        const deposit = yield depositService.getDepositById(depositId, req.user.id, isAdmin);
        if (!deposit) {
            return (0, http_response_1.errorResponse)(res, "Deposit not found", 404);
        }
        return (0, http_response_1.successResponse)(res, { deposit }, "Deposit retrieved successfully");
    }
    catch (error) {
        return (0, http_response_1.errorResponse)(res, "Failed to retrieve deposit", 500, error.message);
    }
});
exports.getDeposit = getDeposit;
const createDeposit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const body = req.body;
        const currency = typeof body.currency === "string" ? body.currency.trim() : "";
        const amount = typeof body.amount === "number"
            ? body.amount
            : Number((_a = body.amount) !== null && _a !== void 0 ? _a : 0);
        const paymentMethodRaw = (_b = body.paymentMethod) !== null && _b !== void 0 ? _b : body.payment_method;
        const paymentMethod = typeof paymentMethodRaw === "string" && paymentMethodRaw.trim().length > 0
            ? paymentMethodRaw.trim()
            : undefined;
        const proofImageUrl = typeof body.proof_image_url === "string" &&
            body.proof_image_url.trim().length > 0
            ? body.proof_image_url.trim()
            : undefined;
        let proofReference = proofImageUrl !== null && proofImageUrl !== void 0 ? proofImageUrl : null;
        const file = req.file;
        if (!proofReference && file) {
            const uploadResult = yield (0, blob_storage_1.uploadBufferToBlob)(file.buffer, file.mimetype || "application/octet-stream", file.originalname, { folder: "deposit-proofs", filenamePrefix: `${req.user.id}-proof` });
            proofReference = uploadResult.url;
        }
        const deposit = yield depositService.createDeposit(req.user.id, {
            currency,
            amount,
            paymentMethod,
            proofReference,
        });
        return (0, http_response_1.successResponse)(res, { deposit }, "Deposit request created successfully", 201);
    }
    catch (error) {
        return (0, http_response_1.errorResponse)(res, "Failed to create deposit request", 500, error.message);
    }
});
exports.createDeposit = createDeposit;
const updateDeposit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (req.user.role !== "admin") {
            return (0, http_response_1.errorResponse)(res, "Unauthorized access", 403);
        }
        const body = req.body;
        const depositId = BigInt(req.params.id);
        const statusInput = typeof body.status === "string"
            ? body.status.trim()
            : typeof body.status === "number"
                ? String(body.status)
                : undefined;
        const rejectionInput = (_a = body.rejectionReason) !== null && _a !== void 0 ? _a : body.rejection_reason;
        const rejectionReason = typeof rejectionInput === "string" && rejectionInput.trim().length > 0
            ? rejectionInput.trim()
            : undefined;
        if (statusInput !== "approved" && statusInput !== "rejected") {
            return (0, http_response_1.errorResponse)(res, "Validation error", 422, { status: ["The selected status is invalid."] });
        }
        const deposit = yield depositService.updateDepositStatus(depositId, req.user.id, statusInput, rejectionReason);
        return (0, http_response_1.successResponse)(res, { deposit }, `Deposit ${statusInput} successfully`);
    }
    catch (error) {
        const message = error.message;
        if (message === "Deposit not found") {
            return (0, http_response_1.errorResponse)(res, message, 404);
        }
        if (message === "This deposit has already been processed") {
            return (0, http_response_1.errorResponse)(res, message, 409);
        }
        return (0, http_response_1.errorResponse)(res, "Failed to update deposit", 500, message);
    }
});
exports.updateDeposit = updateDeposit;
const deleteDeposit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const depositId = BigInt(req.params.id);
        const isAdmin = req.user.role === "admin";
        yield depositService.deleteDeposit(depositId, req.user.id, isAdmin);
        return (0, http_response_1.successResponse)(res, [], "Deposit deleted successfully");
    }
    catch (error) {
        const message = error.message;
        if (message === "Deposit not found or cannot be deleted") {
            return (0, http_response_1.errorResponse)(res, message, 404);
        }
        return (0, http_response_1.errorResponse)(res, "Failed to delete deposit", 500, message);
    }
});
exports.deleteDeposit = deleteDeposit;
