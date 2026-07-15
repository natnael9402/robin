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
exports.ProfileController = void 0;
const library_1 = require("@prisma/client/runtime/library");
const profile_service_1 = __importDefault(require("./profile.service"));
const kyc_submission_service_1 = require("../kyc/kyc-submission.service");
const http_response_1 = require("../utils/http-response");
const serializeDecimal = (value) => value instanceof library_1.Decimal ? value.toString() : value;
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
class ProfileController {
    constructor(service = profile_service_1.default) {
        this.service = service;
    }
    getProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ensureAuthenticated(req, res);
            if (userId === null)
                return;
            try {
                const profile = yield this.service.getUserProfile(userId);
                if (!profile) {
                    return (0, http_response_1.errorResponse)(res, "Profile not found", 404);
                }
                return (0, http_response_1.successResponse)(res, { profile }, "Profile retrieved successfully");
            }
            catch (error) {
                return (0, http_response_1.errorResponse)(res, "Failed to retrieve profile", 500, error.message);
            }
        });
    }
    getProfileWithUserData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ensureAuthenticated(req, res);
            if (userId === null)
                return;
            try {
                const data = yield this.service.getProfileWithUserData(userId);
                return (0, http_response_1.successResponse)(res, {
                    profile: data.profile,
                    balance: serializeDecimal(data.balance),
                    assets: data.assets,
                    assets_value: serializeDecimal(data.assetsValue),
                    total_assets_value: serializeDecimal(data.totalAssetsValue),
                    user: data.user,
                }, "User data retrieved successfully");
            }
            catch (error) {
                const err = error;
                if (err.message === "Profile not found" ||
                    err.message === "User not found") {
                    return (0, http_response_1.errorResponse)(res, err.message, 401);
                }
                return (0, http_response_1.errorResponse)(res, "Failed to retrieve profile data", 500, err.message);
            }
        });
    }
    updateProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ensureAuthenticated(req, res);
            if (userId === null)
                return;
            try {
                const payload = req.body;
                const profile = yield this.service.updateUserProfile(userId, payload);
                return (0, http_response_1.successResponse)(res, { profile }, "Profile updated successfully");
            }
            catch (error) {
                const err = error;
                if (err.message === "Profile not found") {
                    return (0, http_response_1.errorResponse)(res, err.message, 404);
                }
                return (0, http_response_1.errorResponse)(res, "Failed to update profile", 500, err.message);
            }
        });
    }
    enableGoogleAuth(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ensureAuthenticated(req, res);
            if (userId === null)
                return;
            try {
                const result = yield this.service.enableGoogleAuth(userId);
                return (0, http_response_1.successResponse)(res, {
                    google_auth_enabled: result.googleAuthEnabled,
                    google_auth_secret: result.googleAuthSecret,
                }, "Google Authenticator enabled successfully", 201);
            }
            catch (error) {
                const err = error;
                if (err.message === "Profile not found") {
                    return (0, http_response_1.errorResponse)(res, err.message, 404);
                }
                return (0, http_response_1.errorResponse)(res, "Failed to enable Google Authenticator", 500, err.message);
            }
        });
    }
    upgradeLevel(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ensureAuthenticated(req, res);
            if (userId === null)
                return;
            try {
                const result = yield this.service.upgradeLevel(userId);
                return (0, http_response_1.successResponse)(res, {
                    level: result.level,
                    tier: result.tier,
                }, "Level upgraded successfully");
            }
            catch (error) {
                const err = error;
                if (err.message === "Profile not found") {
                    return (0, http_response_1.errorResponse)(res, err.message, 404);
                }
                if (err.code === "KYC_REQUIRED") {
                    return (0, http_response_1.errorResponse)(res, "KYC verification required for level upgrade", 400);
                }
                if (err.code === "MAX_LEVEL") {
                    return (0, http_response_1.errorResponse)(res, "Already at maximum level", 400);
                }
                return (0, http_response_1.errorResponse)(res, "Failed to upgrade level", 500, err.message);
            }
        });
    }
    createKycSubmissionAlias(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const userId = ensureAuthenticated(req, res);
            if (userId === null)
                return;
            try {
                const body = req.body;
                const submission = yield (0, kyc_submission_service_1.createSubmission)(userId, {
                    document_type: String((_a = body.document_type) !== null && _a !== void 0 ? _a : "").trim(),
                    document_number: String((_b = body.document_number) !== null && _b !== void 0 ? _b : "").trim(),
                    front_image_url: String((_c = body.front_image_url) !== null && _c !== void 0 ? _c : "").trim(),
                    back_image_url: String((_d = body.back_image_url) !== null && _d !== void 0 ? _d : "").trim(),
                    selfie_image_url: String((_e = body.selfie_image_url) !== null && _e !== void 0 ? _e : "").trim(),
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
    }
}
exports.ProfileController = ProfileController;
exports.default = new ProfileController();
