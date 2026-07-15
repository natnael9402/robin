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
exports.destroy = exports.update = exports.show = exports.store = exports.index = void 0;
const kyc_submission_service_1 = require("./kyc-submission.service");
const http_response_1 = require("../utils/http-response");
const pagination_1 = require("../utils/pagination");
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
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = ensureAuthenticated(req, res);
    if (userId === null)
        return;
    try {
        const query = req.query;
        const page = (0, pagination_1.getNumericQueryValue)(query.page, 1, { min: 1 });
        const perPage = (0, pagination_1.getNumericQueryValue)((_a = query.per_page) !== null && _a !== void 0 ? _a : query.perPage, 15, { min: 1, max: 100 });
        const rawStatus = Array.isArray(query.status)
            ? query.status[query.status.length - 1]
            : query.status;
        const status = typeof rawStatus === "string" && rawStatus.trim().length > 0
            ? rawStatus.trim()
            : undefined;
        const isAdmin = req.user.role === "admin";
        const result = yield (0, kyc_submission_service_1.listSubmissions)({
            userId,
            isAdmin,
            page,
            perPage,
            status: isAdmin ? status : undefined,
        });
        const paginator = (0, pagination_1.buildLengthAwarePaginator)(req, result.submissions, {
            page: result.pagination.page,
            perPage: result.pagination.perPage,
            total: result.pagination.total,
        });
        const message = isAdmin
            ? "KYC submissions retrieved successfully"
            : "Your KYC submissions retrieved successfully";
        return (0, http_response_1.successResponse)(res, {
            submissions: paginator,
        }, message);
    }
    catch (error) {
        return (0, http_response_1.errorResponse)(res, "Failed to retrieve KYC submissions", 500, error.message);
    }
});
exports.index = index;
const store = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = ensureAuthenticated(req, res);
    if (userId === null)
        return;
    try {
        const body = req.body;
        const files = req.files || {};

        const blob_storage_1 = require("../utils/blob-storage");
        const blob_upload_route_1 = require("../utils/blob-upload-route");

        const resolveImageUrl = (fieldName, fileArray) => __awaiter(void 0, void 0, void 0, function* () {
            const urlValue = body[`${fieldName}_url`];
            if (typeof urlValue === "string" && urlValue.trim().length > 0) {
                const trimmed = urlValue.trim();
                if (!blob_upload_route_1.isAllowedBlobUrl(trimmed)) {
                    throw new Error(`Invalid ${fieldName} URL: must be a Vercel Blob URL`);
                }
                return trimmed;
            }
            if (fileArray && fileArray.length > 0) {
                const file = fileArray[0];
                const uploadResult = yield (0, blob_storage_1.uploadBufferToBlob)(
                    file.buffer,
                    file.mimetype || "application/octet-stream",
                    file.originalname,
                    { folder: "kyc-proofs", filenamePrefix: `${userId}-kyc` }
                );
                return uploadResult.url;
            }
            return "";
        });

        const [frontImageUrl, backImageUrl, selfieImageUrl] = yield Promise.all([
            resolveImageUrl("front_image", files['front_image']),
            resolveImageUrl("back_image", files['back_image']),
            resolveImageUrl("selfie_image", files['selfie_image']),
        ]);

        const submission = yield (0, kyc_submission_service_1.createSubmission)(userId, {
            document_type: String((_a = body.document_type) !== null && _a !== void 0 ? _a : "").trim(),
            document_number: String((_b = body.document_number) !== null && _b !== void 0 ? _b : "").trim(),
            front_image_url: frontImageUrl,
            back_image_url: backImageUrl,
            selfie_image_url: selfieImageUrl,
        });
        return (0, http_response_1.successResponse)(res, { submission }, "KYC submission created successfully", 201);
    }
    catch (error) {
        const err = error;
        if (err.code === "KYC_EXISTS") {
            return (0, http_response_1.errorResponse)(res, err.message, 409);
        }
        return (0, http_response_1.errorResponse)(res, "Failed to create KYC submission", 500, err.message);
    }
});
exports.store = store;
const show = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = ensureAuthenticated(req, res);
    if (userId === null)
        return;
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
            return (0, http_response_1.errorResponse)(res, "KYC submission not found", 404);
        }
        const isAdmin = req.user.role === "admin";
        const submission = yield (0, kyc_submission_service_1.getSubmissionById)(id, userId, isAdmin);
        if (!submission) {
            return (0, http_response_1.errorResponse)(res, "KYC submission not found", 404);
        }
        return (0, http_response_1.successResponse)(res, { submission }, "KYC submission retrieved successfully");
    }
    catch (error) {
        return (0, http_response_1.errorResponse)(res, "Failed to retrieve KYC submission", 500, error.message);
    }
});
exports.show = show;
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = ensureAuthenticated(req, res);
    if (userId === null)
        return;
    if (req.user.role !== "admin") {
        return (0, http_response_1.errorResponse)(res, "Unauthorized access", 403);
    }
    try {
        const body = req.body;
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
            return (0, http_response_1.errorResponse)(res, "KYC submission not found", 404);
        }
        const rawStatus = body.status;
        const statusValue = typeof rawStatus === "string"
            ? rawStatus.trim()
            : typeof rawStatus === "number"
                ? String(rawStatus)
                : "";
        const rejectionReason = typeof body.rejection_reason === "string" &&
            body.rejection_reason.trim().length > 0
            ? body.rejection_reason.trim()
            : undefined;
        const submission = yield (0, kyc_submission_service_1.updateSubmissionStatus)(id, {
            status: statusValue,
            rejection_reason: rejectionReason,
            processorId: userId,
        });
        return (0, http_response_1.successResponse)(res, { submission }, `KYC submission ${statusValue} successfully`);
    }
    catch (error) {
        const err = error;
        if (err.code === "NOT_FOUND") {
            return (0, http_response_1.errorResponse)(res, err.message, 404);
        }
        if (err.code === "ALREADY_PROCESSED") {
            return (0, http_response_1.errorResponse)(res, err.message, 409);
        }
        return (0, http_response_1.errorResponse)(res, "Failed to update KYC submission", 500, err.message);
    }
});
exports.update = update;
const destroy = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = ensureAuthenticated(req, res);
    if (userId === null)
        return;
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
            return (0, http_response_1.errorResponse)(res, "KYC submission not found", 404);
        }
        const isAdmin = req.user.role === "admin";
        yield (0, kyc_submission_service_1.deleteSubmission)(id, userId, isAdmin);
        return (0, http_response_1.successResponse)(res, [], "KYC submission deleted successfully");
    }
    catch (error) {
        const err = error;
        if (err.code === "NOT_FOUND" || err.code === "FORBIDDEN") {
            return (0, http_response_1.errorResponse)(res, "KYC submission not found", 404);
        }
        return (0, http_response_1.errorResponse)(res, "Failed to delete KYC submission", 500, err.message);
    }
});
exports.destroy = destroy;
