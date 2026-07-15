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
exports.LoanController = void 0;
const loan_service_1 = require("./loan.service");
const express_validator_1 = require("express-validator");
const blob_storage_1 = require("../utils/blob-storage");
const loanService = new loan_service_1.LoanService();
class LoanController {
    applyLoan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            try {
                const userId = BigInt(req.user.id);
                const { amount, duration, document_type } = req.body;
                const files = req.files;
                const blob_upload_route_1 = require("../utils/blob-upload-route");
                const resolveImageUrl = (fieldName) => __awaiter(this, void 0, void 0, function* () {
                    const urlValue = req.body[`${fieldName}_url`];
                    if (typeof urlValue === "string" && urlValue.trim().length > 0) {
                        const trimmed = urlValue.trim();
                        if (!blob_upload_route_1.isAllowedBlobUrl(trimmed)) {
                            throw new Error(`Invalid ${fieldName} URL: must be a Vercel Blob URL`);
                        }
                        return trimmed;
                    }
                    const fileArray = files === null || files === void 0 ? void 0 : files[fieldName];
                    const file = fileArray === null || fileArray === void 0 ? void 0 : fileArray[0];
                    if (!file) return "";
                    const uploadResult = yield (0, blob_storage_1.uploadBufferToBlob)(file.buffer, file.mimetype, file.originalname);
                    return uploadResult.url;
                });
                const frontImageUrl = yield resolveImageUrl("front_image");
                const backImageUrl = yield resolveImageUrl("back_image");
                if (!frontImageUrl || !backImageUrl) {
                    return res
                        .status(400)
                        .json({ message: "Both front and back images are required." });
                }
                const loan = yield loanService.applyLoan(userId, Number(amount), Number(duration), document_type, frontImageUrl, backImageUrl);
                res.status(201).json(loan);
            }
            catch (error) {
                res.status(500).json({
                    message: "Failed to apply for loan",
                    error: error.message,
                });
            }
        });
    }
    getLoans(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = BigInt(req.user.id);
                const loans = yield loanService.getLoans(userId);
                res.json(loans);
            }
            catch (error) {
                res.status(500).json({ message: "Failed to fetch loans", error });
            }
        });
    }
    repayLoan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = BigInt(req.user.id);
                const loanId = BigInt(req.params.id);
                const loan = yield loanService.repayLoan(loanId, userId);
                res.json(loan);
            }
            catch (error) {
                res.status(500).json({
                    message: "Failed to repay loan",
                    error: error.message,
                });
            }
        });
    }
    submitRepayment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = BigInt(req.user.id);
                const loanId = BigInt(req.params.id);
                const { amount } = req.body;
                let proofImageUrl = "";
                const blob_upload_route_1 = require("../utils/blob-upload-route");
                const urlValue = req.body.proof_image_url;
                if (typeof urlValue === "string" && urlValue.trim().length > 0) {
                    const trimmed = urlValue.trim();
                    if (!blob_upload_route_1.isAllowedBlobUrl(trimmed)) {
                        return res.status(400).json({ message: "Invalid proof image URL: must be a Vercel Blob URL" });
                    }
                    proofImageUrl = trimmed;
                }
                const file = req.file;
                if (!proofImageUrl && file) {
                    const uploadResult = yield (0, blob_storage_1.uploadBufferToBlob)(file.buffer, file.mimetype, file.originalname);
                    proofImageUrl = uploadResult.url;
                }
                if (!amount || !proofImageUrl) {
                    return res
                        .status(400)
                        .json({ message: "Amount and proof image are required" });
                }
                const repayment = yield loanService.submitRepayment(loanId, userId, Number(amount), proofImageUrl);
                res.status(201).json(repayment);
            }
            catch (error) {
                res.status(500).json({
                    message: "Failed to submit repayment",
                    error: error.message,
                });
            }
        });
    }
    getRepayments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = BigInt(req.user.id);
                const loanId = BigInt(req.params.id);
                const repayments = yield loanService.getRepayments(loanId, userId);
                res.json(repayments);
            }
            catch (error) {
                res.status(500).json({
                    message: "Failed to fetch repayments",
                    error: error.message,
                });
            }
        });
    }
}
exports.LoanController = LoanController;
