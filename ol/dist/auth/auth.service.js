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
class AuthService {
    register(name, email, password, phone, invite_code) {
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
            const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
                expiresIn: "180d",
            });
            logger_1.logger.debug("Generated JWT token for user", {
                userId: user.id,
            });
            return { access_token: token, user };
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
            const frontendUrl = process.env.FRONT_END_URL || "http://localhost:3000";
            const resetLink = `${frontendUrl.replace(/\/$/, "")}/reset-password?token=${token}&email=${email}`;
            logger_1.logger.info(`[FORGOT PASSWORD] Email: ${email}`);
            logger_1.logger.info(`[FORGOT PASSWORD] Token: ${token}`);
            logger_1.logger.info(`[FORGOT PASSWORD] Reset link: ${resetLink}`);
            try {
                yield (0, mailer_1.sendEmail)(email, "Password Reset Request", `You requested a password reset. Your token is: ${token}. Or click here: ${resetLink}`, `
      <div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background-color: #007bff; color: #ffffff; padding: 25px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 500;">Password Reset Request</h1>
        </div>
        <div style="padding: 30px 40px;">
        <p style="font-size: 16px;">Hello,</p>
        <p style="font-size: 16px;">We received a request to reset the password for your account. To proceed, please click the button below.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #007bff; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-size: 18px; font-weight: bold; display: inline-block;">Reset Your Password</a>
        </div>
        <p style="font-size: 16px;">If you're having trouble with the button, you can use the token below on the reset page:</p>
        <p style="background-color: #e9ecef; border: 1px solid #ced4da; padding: 12px; font-size: 20px; text-align: center; border-radius: 4px; letter-spacing: 3px; font-family: 'Courier New', Courier, monospace;">
          <b>${token}</b>
        </p>
        <p style="font-size: 14px; color: #6c757d;">This password reset link and token are valid for one hour.</p>
        <hr style="border: 0; border-top: 1px solid #e9ecef; margin: 30px 0;">
        <p style="font-size: 14px; color: #6c757d;">If you did not request a password reset, please disregard this email. Your account is secure.</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px 40px; text-align: center; font-size: 12px; color: #6c757d;">
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
        </div>
      </div>
      </div>
      `);
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
