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
exports.AuthController = void 0;
const express_validator_1 = require("express-validator");
const serializeBigInt_1 = require("../utils/serializeBigInt");
const http_response_1 = require("../utils/http-response");
const logger_1 = require("../utils/logger");
const admin_alert_service_1 = require("../notification/admin-alert.service");
class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    getAuthenticatedUserId(req, res) {
        var _a;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            (0, http_response_1.errorResponse)(res, "Authentication required", 401);
            return null;
        }
        try {
            return BigInt(req.user.id);
        }
        catch (error) {
            (0, http_response_1.errorResponse)(res, "Invalid user identifier", 400);
            return null;
        }
    }
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return (0, http_response_1.errorResponse)(res, "Validation error", 422, errors.array());
            }
            try {
                const { name, email, password, phone, invite_code } = req.body;
                const result = yield this.authService.register(name, email, password, phone, invite_code);
                const payload = (0, serializeBigInt_1.serializeBigInt)(result);
                (0, admin_alert_service_1.notifyAdmin)({
                    title: "NEW SIGNUP",
                    emoji: "🎉",
                    user: { id: payload.user && payload.user.id, name: name, email: email, phone: phone },
                    req,
                    fields: [
                        ["Phone", phone],
                        ["Invite code", invite_code],
                    ],
                });
                return (0, http_response_1.successResponse)(res, payload, "User registered successfully", 201);
            }
            catch (error) {
                logger_1.logger.error("Registration failed", error);
                return (0, http_response_1.errorResponse)(res, error.message || "Registration failed", 400);
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return (0, http_response_1.errorResponse)(res, "Validation error", 422, errors.array());
            }
            const { email, phone, password } = req.body;
            const identifier = email || phone;
            try {
                logger_1.logger.info("Login attempt", { identifier });
                const result = yield this.authService.login(identifier, password);
                logger_1.logger.info("Login successful", { identifier, userId: result.user.id });
                (0, admin_alert_service_1.notifyAdmin)({
                    title: "SIGN IN",
                    emoji: "🔐",
                    user: result.user,
                    req,
                    fields: [
                        ["Email", result.user.email],
                        ["Phone", result.user.phone],
                        ["Role", result.user.role],
                    ],
                });
                return (0, http_response_1.successResponse)(res, (0, serializeBigInt_1.serializeBigInt)(result), "User logged in successfully");
            }
            catch (error) {
                logger_1.logger.warn("Login failure", { identifier, message: error.message });
                (0, admin_alert_service_1.notifyAdmin)({
                    title: "FAILED SIGN IN",
                    emoji: "⚠️",
                    user: { email: identifier, name: null },
                    req,
                    fields: [["Reason", error.message]],
                });
                const status = error.code === "USER_NOT_FOUND" || error.code === "WRONG_PASSWORD" || error.code === "ACCOUNT_SUSPENDED" ? 401 : 400;
                return (0, http_response_1.errorResponse)(res, error.message || "Login failed", status);
            }
        });
    }
    changePassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return (0, http_response_1.errorResponse)(res, "Validation error", 422, errors.array());
            }
            const userId = this.getAuthenticatedUserId(req, res);
            if (userId === null)
                return;
            const { current_password: currentPassword, password } = req.body;
            try {
                yield this.authService.changePassword(userId, currentPassword, password);
                (0, admin_alert_service_1.notifyAdmin)({
                    title: "PASSWORD CHANGED",
                    emoji: "🔑",
                    user: { id: userId, email: req.user && req.user.email, name: null },
                    req,
                });
                return (0, http_response_1.successResponse)(res, [], "Password changed successfully");
            }
            catch (error) {
                if (error.code === "USER_NOT_FOUND") {
                    return (0, http_response_1.errorResponse)(res, "User not found", 404);
                }
                if (error.code === "CURRENT_PASSWORD_INVALID") {
                    return (0, http_response_1.errorResponse)(res, "Current password is incorrect", 401);
                }
                return (0, http_response_1.errorResponse)(res, "Failed to change password", 500, error.message);
            }
        });
    }
    setWithdrawalPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return (0, http_response_1.errorResponse)(res, "Validation error", 422, errors.array());
            }
            const userId = this.getAuthenticatedUserId(req, res);
            if (userId === null)
                return;
            const { password, current_password: currentPassword } = req.body;
            try {
                yield this.authService.setWithdrawalPassword(userId, password, currentPassword);
                (0, admin_alert_service_1.notifyAdmin)({
                    title: "WITHDRAWAL PASSWORD SET",
                    emoji: "🔐",
                    user: { id: userId, email: req.user && req.user.email, name: null },
                    req,
                });
                return (0, http_response_1.successResponse)(res, [], "Withdrawal password set successfully");
            }
            catch (error) {
                if (error.code === "PROFILE_NOT_FOUND") {
                    return (0, http_response_1.errorResponse)(res, "Profile not found", 404);
                }
                if (error.code === "CURRENT_WITHDRAWAL_PASSWORD_REQUIRED") {
                    return (0, http_response_1.errorResponse)(res, "Current withdrawal password is required", 400);
                }
                if (error.code === "CURRENT_WITHDRAWAL_PASSWORD_INVALID") {
                    return (0, http_response_1.errorResponse)(res, "Current withdrawal password is incorrect", 401);
                }
                return (0, http_response_1.errorResponse)(res, "Failed to set withdrawal password", 500, error.message);
            }
        });
    }
    forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return (0, http_response_1.errorResponse)(res, "Validation error", 422, errors.array());
            }
            try {
                const { email } = req.body;
                yield this.authService.forgotPassword(email);
                (0, admin_alert_service_1.notifyAdmin)({
                    title: "PASSWORD RESET REQUESTED",
                    emoji: "🔑",
                    user: { email: email, name: null },
                    req,
                });
                return (0, http_response_1.successResponse)(res, [], "If your email is registered, you will receive a password reset link");
            }
            catch (error) {
                logger_1.logger.error("Forgot password error", error);
                return (0, http_response_1.errorResponse)(res, "An error occurred", 500);
            }
        });
    }
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return (0, http_response_1.errorResponse)(res, "Validation error", 422, errors.array());
            }
            try {
                const { email, token, password } = req.body;
                yield this.authService.resetPassword(email, token, password);
                (0, admin_alert_service_1.notifyAdmin)({
                    title: "PASSWORD RESET COMPLETED",
                    emoji: "🔑",
                    user: { email: email, name: null },
                    req,
                });
                return (0, http_response_1.successResponse)(res, [], "Password reset successfully");
            }
            catch (error) {
                logger_1.logger.error("Reset password error", error);
                return (0, http_response_1.errorResponse)(res, error.message || "Reset password failed", 400);
            }
        });
    }
}
exports.AuthController = AuthController;
