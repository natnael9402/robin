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
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("../prisma"));
const logger_1 = require("../utils/logger");
const mailer_1 = require("../utils/mailer");
const email_service_1 = require("../email/service");
const sites_1 = require("../email/sites");
const email_mailer_1 = require("../email/mailer");
class AuthService {
    register(name, email, password, phone, invite_code, site) {
        return __awaiter(this, void 0, void 0, function* () {
            const finalEmail = email || null;
            const finalPhone = phone || null;
            if (!finalEmail && !finalPhone) {
                throw new Error("Either email or phone must be provided");
            }
            const existingUser = yield prisma_1.default.user.findUnique({
                where: finalEmail ? { email: finalEmail } : { phone: finalPhone },
            });
            if (existingUser) {
                throw new Error("User already exists");
            }
            const signupSiteId = (0, sites_1.normalizeSiteId)(site);
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            let referredByProfile = null;
            if (invite_code) {
                referredByProfile = yield prisma_1.default.profile.findUnique({
                    where: { invite_code },
                });
            }
            const user = yield prisma_1.default.user.create({
                data: {
                    name,
                    email: finalEmail,
                    password: hashedPassword,
                    phone: finalPhone,
                    signup_site: signupSiteId,
                    profiles: {
                        create: {
                            uuid: crypto_1.default.randomUUID(),
                            level: 1,
                            kyc_status: "unverified",
                            referred_by_id: referredByProfile ? referredByProfile.id : undefined,
                        },
                    },
                },
            });
            // Create all 3 trading account balance rows for new users
            const accountTypes = ["fast_trade", "spot", "trading"];
            yield prisma_1.default.accountBalance.createMany({
                data: accountTypes.map((type) => ({ user_id: user.id, type, balance: 0 })),
            });
            if (referredByProfile) {
                yield prisma_1.default.profile.update({
                    where: { id: referredByProfile.id },
                    data: { referral_count: { increment: 1 } },
                });
                logger_1.logger.debug("Referral link created", {
                    referrerProfileId: referredByProfile.id,
                    newUserId: user.id,
                });
            }
            // Email confirmation happens after KYC submission, while the identity
            // review is pending. Signup must stay fast and must never depend on SMTP.
            const verificationSent = false;
            const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
                expiresIn: "180d",
            });
            logger_1.logger.debug("Generated JWT token for user", {
                userId: user.id,
            });
            return { access_token: token, user, verificationSent };
        });
    }
    login(identifier, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const isEmail = identifier.includes('@');
            const user = yield prisma_1.default.user.findUnique({
                where: isEmail ? { email: identifier } : { phone: identifier },
            });
            logger_1.logger.debug("User fetched for login", { identifier, found: Boolean(user) });
            if (!user) {
                const notFoundError = new Error(isEmail ? "No account found with this email" : "No account found with this phone number");
                notFoundError.code = "USER_NOT_FOUND";
                throw notFoundError;
            }
            if (user.status !== "active") {
                const suspendedError = new Error("Account has been suspended");
                suspendedError.code = "ACCOUNT_SUSPENDED";
                throw suspendedError;
            }
            const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                const wrongPwError = new Error("Incorrect password");
                wrongPwError.code = "WRONG_PASSWORD";
                throw wrongPwError;
            }
            const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "180d" });
            return { access_token: token, user };
        });
    }
    changePassword(userId, currentPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_1.default.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                const error = new Error("User not found");
                error.code = "USER_NOT_FOUND";
                throw error;
            }
            const isPasswordValid = yield bcryptjs_1.default.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                const error = new Error("Current password is incorrect");
                error.code = "CURRENT_PASSWORD_INVALID";
                throw error;
            }
            const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
            yield prisma_1.default.user.update({
                where: { id: userId },
                data: { password: hashedPassword },
            });
        });
    }
    setWithdrawalPassword(userId, newPassword, currentPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield prisma_1.default.profile.findFirst({
                where: { user_id: userId },
            });
            if (!profile) {
                const error = new Error("Profile not found");
                error.code = "PROFILE_NOT_FOUND";
                throw error;
            }
            if (profile.withdrawal_password_enabled) {
                if (!currentPassword) {
                    const error = new Error("Current withdrawal password is required");
                    error.code = "CURRENT_WITHDRAWAL_PASSWORD_REQUIRED";
                    throw error;
                }
                const storedPassword = profile.withdrawal_password;
                if (!storedPassword) {
                    const error = new Error("Current withdrawal password is incorrect");
                    error.code = "CURRENT_WITHDRAWAL_PASSWORD_INVALID";
                    throw error;
                }
                const isPasswordValid = yield bcryptjs_1.default.compare(currentPassword, storedPassword);
                if (!isPasswordValid) {
                    const error = new Error("Current withdrawal password is incorrect");
                    error.code = "CURRENT_WITHDRAWAL_PASSWORD_INVALID";
                    throw error;
                }
            }
            const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
            yield prisma_1.default.profile.update({
                where: { id: profile.id },
                data: {
                    withdrawal_password: hashedPassword,
                    withdrawal_password_enabled: true,
                },
            });
        });
    }
    forgotPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_1.default.user.findUnique({ where: { email } });
            if (!user) {
                return;
            }
            const token = crypto_1.default.randomBytes(32).toString("hex");
            yield prisma_1.default.passwordResetToken.upsert({
                where: { email },
                update: { token, created_at: new Date() },
                create: { email, token, created_at: new Date() },
            });
            const site = (0, sites_1.resolveSite)(user.signup_site);
            const configuredFrontend = String(process.env.FRONT_END_URL || "").replace(/\/$/, "");
            const frontendBase = configuredFrontend && user.signup_site !== "lab" && !configuredFrontend.includes("paxoralab")
                ? configuredFrontend
                : site.url;
            const resetLink = `${frontendBase}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
            logger_1.logger.info(`[FORGOT PASSWORD] Email: ${email}`);
            logger_1.logger.info(`[FORGOT PASSWORD] Token: ${token}`);
            logger_1.logger.info(`[FORGOT PASSWORD] Reset link: ${resetLink}`);
            try {
                const rendered = email_service_1.renderPasswordResetEmail({
                    site,
                    name: user.name,
                    resetUrl: resetLink,
                    token,
                });
                yield (0, email_mailer_1.sendRawEmail)({
                    to: email,
                    subject: rendered.subject,
                    html: rendered.html,
                    text: rendered.text,
                });
            }
            catch (emailError) {
                logger_1.logger.warn(`Email send failed for ${email}, token logged to console: ${emailError.message}`);
            }
        });
    }
    resetPassword(email, token, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const resetToken = yield prisma_1.default.passwordResetToken.findUnique({
                where: { email },
            });
            if (!resetToken || resetToken.token !== token) {
                throw new Error("Invalid token");
            }
            const now = new Date();
            const tokenTime = resetToken.created_at
                ? new Date(resetToken.created_at)
                : new Date(0);
            const diff = now.getTime() - tokenTime.getTime();
            if (diff > 3600000) {
                // 1 hour
                throw new Error("Token expired");
            }
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            yield prisma_1.default.user.update({
                where: { email },
                data: { password: hashedPassword },
            });
            yield prisma_1.default.passwordResetToken.delete({ where: { email } });
        });
    }
}
exports.AuthService = AuthService;
