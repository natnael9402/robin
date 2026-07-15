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
exports.ReferralController = void 0;
const referral_service_1 = require("./referral.service");
const serializeBigInt_1 = require("../utils/serializeBigInt");
const http_response_1 = require("../utils/http-response");
const logger_1 = require("../utils/logger");
class ReferralController {
    constructor(service = new referral_service_1.ReferralService()) {
        this.service = service;
    }
    getMyInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = BigInt((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            try {
                const info = yield this.service.getMyReferralInfo(userId);
                if (!info) {
                    return (0, http_response_1.errorResponse)(res, "Profile not found", 404);
                }
                return (0, http_response_1.successResponse)(res, (0, serializeBigInt_1.serializeBigInt)(info));
            }
            catch (error) {
                logger_1.logger.error("Failed to get referral info", error);
                return (0, http_response_1.errorResponse)(res, "Failed to get referral info", 500);
            }
        });
    }
    getAdminStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stats = yield this.service.getAdminReferralStats();
                return (0, http_response_1.successResponse)(res, (0, serializeBigInt_1.serializeBigInt)(stats));
            }
            catch (error) {
                logger_1.logger.error("Failed to get referral stats", error);
                return (0, http_response_1.errorResponse)(res, "Failed to get referral stats", 500);
            }
        });
    }
    getAdminReferrals(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const status = req.query.status || undefined;
                const referrals = yield this.service.getAdminReferrals(status);
                return (0, http_response_1.successResponse)(res, (0, serializeBigInt_1.serializeBigInt)({ referrals }));
            }
            catch (error) {
                logger_1.logger.error("Failed to get referrals", error);
                return (0, http_response_1.errorResponse)(res, "Failed to get referrals", 500);
            }
        });
    }
    getUserReferral(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const targetUserId = BigInt(req.params.userId);
                const info = yield this.service.getUserReferralInfo(targetUserId);
                return (0, http_response_1.successResponse)(res, (0, serializeBigInt_1.serializeBigInt)({ referral: info }));
            }
            catch (error) {
                logger_1.logger.error("Failed to get user referral", error);
                return (0, http_response_1.errorResponse)(res, "Failed to get user referral info", 500);
            }
        });
    }
    approveCommission(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const commissionId = BigInt(req.params.id);
                const result = yield this.service.approveCommission(commissionId);
                return (0, http_response_1.successResponse)(res, (0, serializeBigInt_1.serializeBigInt)(result), "Commission approved successfully");
            }
            catch (error) {
                logger_1.logger.error("Failed to approve commission", error);
                return (0, http_response_1.errorResponse)(res, error.message || "Failed to approve commission", 400);
            }
        });
    }
    generateCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = BigInt((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            try {
                const result = yield this.service.generateNewInviteCode(userId);
                return (0, http_response_1.successResponse)(res, (0, serializeBigInt_1.serializeBigInt)(result), "New referral code generated");
            }
            catch (error) {
                logger_1.logger.error("Failed to generate referral code", error);
                return (0, http_response_1.errorResponse)(res, "Failed to generate referral code", 500);
            }
        });
    }
}
exports.ReferralController = ReferralController;
