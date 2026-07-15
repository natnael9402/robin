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
exports.deleteUserAccount = exports.updateUser = exports.setLevel = exports.upgradeLevel = exports.resetWithdrawal = exports.setTradeStatus = exports.setKycStatus = exports.getProfile = exports.listProfiles = void 0;
const profile_admin_service_1 = require("./profile.admin.service");
const http_response_1 = require("../utils/http-response");
const pagination_1 = require("../utils/pagination");
const coerceEnum = (value) => typeof value === "string" ? value : undefined;
const mapLevelToTier = (level) => {
    switch (level) {
        case 3:
            return "Gold";
        case 2:
            return "Silver";
        default:
            return "Bronze";
    }
};
const listProfiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const query = req.query;
        const page = (0, pagination_1.getNumericQueryValue)(query.page, 1, { min: 1 });
        const perPage = (0, pagination_1.getNumericQueryValue)((_a = query.perPage) !== null && _a !== void 0 ? _a : query.per_page, 15, {
            min: 1,
            max: 100,
        });
        const rawKyc = ((_b = query.kycStatus) !== null && _b !== void 0 ? _b : query.kyc_status);
        const rawTrade = ((_c = query.tradeStatus) !== null && _c !== void 0 ? _c : query.trade_status);
        const searchValue = typeof query.search === "string" ? query.search.trim() : undefined;
        const search = searchValue && searchValue.length > 0 ? searchValue : undefined;
        const result = yield (0, profile_admin_service_1.getProfiles)({
            page,
            perPage,
            kyc_status: coerceEnum(rawKyc),
            trade_status: coerceEnum(rawTrade),
            search,
        });
        const paginator = (0, pagination_1.buildLengthAwarePaginator)(req, result.profiles, {
            page: result.pagination.page,
            perPage: result.pagination.perPage,
            total: result.pagination.total,
        });
        return (0, http_response_1.successResponse)(res, {
            profiles: paginator,
        }, "Profiles retrieved successfully");
    }
    catch (error) {
        return (0, http_response_1.errorResponse)(res, "Failed to retrieve profiles", 500, error.message);
    }
});
exports.listProfiles = listProfiles;
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profileId = Number(req.params.id);
        const profile = yield (0, profile_admin_service_1.getProfileById)(profileId);
        if (!profile) {
            return (0, http_response_1.errorResponse)(res, "Profile not found", 404);
        }
        return (0, http_response_1.successResponse)(res, { profile }, "Profile retrieved successfully");
    }
    catch (error) {
        return (0, http_response_1.errorResponse)(res, "Failed to retrieve profile", 500, error.message);
    }
});
exports.getProfile = getProfile;
const setKycStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const profileId = Number(req.params.id);
        const body = req.body;
        const rawStatusInput = (_a = body.status) !== null && _a !== void 0 ? _a : body.kyc_status;
        const normalizedStatus = typeof rawStatusInput === "string" ? rawStatusInput.trim() : undefined;
        if (!normalizedStatus || normalizedStatus.length === 0) {
            return (0, http_response_1.errorResponse)(res, "Validation error", 422, {
                status: ["The status field is required."],
            });
        }
        const status = coerceEnum(normalizedStatus);
        if (!status) {
            return (0, http_response_1.errorResponse)(res, "Validation error", 422, {
                status: ["The selected status is invalid."],
            });
        }
        const rawReason = body.reason;
        const trimmedReason = typeof rawReason === "string" ? rawReason.trim() : undefined;
        const reason = trimmedReason && trimmedReason.length > 0 ? trimmedReason : undefined;
        if (status === "rejected" && !reason) {
            return (0, http_response_1.errorResponse)(res, "Validation error", 422, {
                reason: ["The reason field is required when status is rejected."],
            });
        }
        const profile = yield (0, profile_admin_service_1.updateKycStatus)(profileId, status, reason);
        return (0, http_response_1.successResponse)(res, { profile }, "KYC status updated successfully");
    }
    catch (error) {
        const message = error.message;
        if (message === "Profile not found") {
            return (0, http_response_1.errorResponse)(res, message, 404);
        }
        return (0, http_response_1.errorResponse)(res, "Failed to update KYC status", 500, message);
    }
});
exports.setKycStatus = setKycStatus;
const setTradeStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const profileId = Number(req.params.id);
        const body = req.body;
        const rawTradeInput = (_a = body.tradeStatus) !== null && _a !== void 0 ? _a : body.trade_status;
        const normalizedTrade = typeof rawTradeInput === "string" ? rawTradeInput.trim() : undefined;
        if (!normalizedTrade || normalizedTrade.length === 0) {
            return (0, http_response_1.errorResponse)(res, "Validation error", 422, {
                trade_status: ["The trade status field is required."],
            });
        }
        const tradeStatus = coerceEnum(normalizedTrade);
        if (!tradeStatus) {
            return (0, http_response_1.errorResponse)(res, "Validation error", 422, {
                trade_status: ["The selected trade status is invalid."],
            });
        }
        const profile = yield (0, profile_admin_service_1.updateTradeStatus)(profileId, tradeStatus);
        return (0, http_response_1.successResponse)(res, {
            profile,
            message: `User's trade status set to ${tradeStatus}`,
        }, "Trade status updated successfully");
    }
    catch (error) {
        const message = error.message;
        if (message === "Profile not found") {
            return (0, http_response_1.errorResponse)(res, message, 404);
        }
        return (0, http_response_1.errorResponse)(res, "Failed to update trade status", 500, message);
    }
});
exports.setTradeStatus = setTradeStatus;
const resetWithdrawal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profileId = Number(req.params.id);
        yield (0, profile_admin_service_1.resetWithdrawalPassword)(profileId);
        return (0, http_response_1.successResponse)(res, [], 'Withdrawal password has been reset to "12345678"');
    }
    catch (error) {
        const message = error.message;
        if (message === "Profile not found") {
            return (0, http_response_1.errorResponse)(res, message, 404);
        }
        return (0, http_response_1.errorResponse)(res, "Failed to reset withdrawal password", 500, message);
    }
});
exports.resetWithdrawal = resetWithdrawal;
const upgradeLevel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profileId = Number(req.params.id);
        const profile = yield (0, profile_admin_service_1.upgradeProfileLevel)(profileId);
        const rawLevel = profile === null || profile === void 0 ? void 0 : profile.level;
        const level = typeof rawLevel === "bigint" ? Number(rawLevel) : rawLevel !== null && rawLevel !== void 0 ? rawLevel : 0;
        const tier = mapLevelToTier(level);
        return (0, http_response_1.successResponse)(res, {
            level,
            tier,
        }, "User level has been upgraded successfully");
    }
    catch (error) {
        const message = error.message;
        if (message === "Profile not found") {
            return (0, http_response_1.errorResponse)(res, message, 404);
        }
        if (message === "User is already at maximum level") {
            return (0, http_response_1.errorResponse)(res, message, 400);
        }
        return (0, http_response_1.errorResponse)(res, "Failed to upgrade user level", 500, message);
    }
});
exports.upgradeLevel = upgradeLevel;
const setLevel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profileId = Number(req.params.id);
        const level = Number(req.body.level);
        if (!Number.isInteger(level) || level < 1 || level > 3) {
            return (0, http_response_1.errorResponse)(res, "Validation error", 422, {
                level: ["Level must be an integer between 1 and 3."],
            });
        }
        const profile = yield profile_admin_service_1.setProfileLevel(profileId, level);
        const tier = mapLevelToTier(profile.level);
        return (0, http_response_1.successResponse)(res, {
            level: profile.level,
            tier,
        }, "User level has been set successfully");
    }
    catch (error) {
        const message = error.message;
        if (message === "Profile not found") {
            return (0, http_response_1.errorResponse)(res, message, 404);
        }
        return (0, http_response_1.errorResponse)(res, "Failed to set user level", 500, message);
    }
});
exports.setLevel = setLevel;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = Number(req.params.id);
        const { name, email, phone, balance, status, password, password_confirmation, passwordConfirmation, } = req.body;
        const passwordValue = typeof password === "string" ? password : undefined;
        const confirmation = typeof passwordConfirmation === "string"
            ? passwordConfirmation
            : typeof password_confirmation === "string"
                ? password_confirmation
                : undefined;
        if (passwordValue && confirmation && passwordValue !== confirmation) {
            return (0, http_response_1.errorResponse)(res, "Password confirmation does not match password", 400);
        }
        const payload = {};
        if (typeof name === "string") {
            payload.name = name;
        }
        if (typeof email === "string" || email === null) {
            payload.email = email;
        }
        if (typeof phone === "string" && phone.length >= 10) {
            payload.phone = phone;
        }
        if (typeof balance === "string" || typeof balance === "number") {
            payload.balance = balance;
        }
        if (typeof status === "string") {
            payload.status = status;
        }
        if (passwordValue && passwordValue.length > 0) {
            payload.password = passwordValue;
        }
        const user = yield (0, profile_admin_service_1.updateUserByAdmin)(userId, payload);
        return (0, http_response_1.successResponse)(res, { user }, "User updated successfully");
    }
    catch (error) {
        const err = error;
        if (err.statusCode === 409) {
            return (0, http_response_1.errorResponse)(res, err.message, 409);
        }
        const message = err.message || "Failed to update user";
        if (message === "User not found") {
            return (0, http_response_1.errorResponse)(res, message, 404);
        }
        return (0, http_response_1.errorResponse)(res, "Failed to update user", 500, message);
    }
});
exports.updateUser = updateUser;
const deleteUserAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = Number(req.params.id);
        if (!Number.isFinite(userId) || userId <= 0) {
            return (0, http_response_1.errorResponse)(res, "User not found", 404);
        }
        yield (0, profile_admin_service_1.deleteUserByAdmin)(userId);
        return (0, http_response_1.successResponse)(res, [], "User deleted successfully");
    }
    catch (error) {
        const err = error;
        if (err.statusCode === 403) {
            return (0, http_response_1.errorResponse)(res, err.message, 403);
        }
        if (err.statusCode === 404 || err.message === "User not found") {
            return (0, http_response_1.errorResponse)(res, "User not found", 404);
        }
        return (0, http_response_1.errorResponse)(res, "Failed to delete user", 500, err.message);
    }
});
exports.deleteUserAccount = deleteUserAccount;
