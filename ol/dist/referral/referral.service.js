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
exports.ReferralService = void 0;
const prisma_1 = require("../prisma");
const logger_1 = require("../utils/logger");
class ReferralService {
    getMyReferralInfo(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield prisma_1.default.profile.findFirst({
                where: { user_id: userId },
                include: {
                    referred_by: {
                        include: { user: { select: { name: true, email: true } } },
                    },
                },
            });
            if (!profile) {
                return null;
            }
            const commissions = yield prisma_1.default.referralCommission.findMany({
                where: { referrer_profile_id: profile.id },
                orderBy: { created_at: "desc" },
            });
            const totalCommissions = commissions.reduce((sum, c) => sum + Number(c.commission_amount), 0);
            return {
                inviteCode: profile.invite_code,
                referralCount: profile.referral_count,
                totalCommissionsEarned: totalCommissions,
                referredBy: profile.referred_by
                    ? {
                        name: profile.referred_by.user.name,
                        email: profile.referred_by.user.email,
                    }
                    : null,
                commissions: commissions.map((c) => ({
                    id: Number(c.id),
                    depositAmount: Number(c.deposit_amount),
                    commissionAmount: Number(c.commission_amount),
                    status: c.status,
                    paidAt: c.paid_at,
                    createdAt: c.created_at,
                })),
            };
        });
    }
    getAdminReferralStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const [totalCommissions, pendingCommissions, paidCommissions, totalReferrers] = yield Promise.all([
                prisma_1.default.referralCommission.aggregate({ _sum: { commission_amount: true } }),
                prisma_1.default.referralCommission.findMany({ where: { status: "pending" } }),
                prisma_1.default.referralCommission.findMany({ where: { status: "paid" } }),
                prisma_1.default.profile.count({ where: { referral_count: { gt: 0 } } }),
            ]);
            return {
                totalCommissionAmount: Number(totalCommissions._sum.commission_amount || 0),
                pendingCount: pendingCommissions.length,
                pendingAmount: pendingCommissions.reduce((s, c) => s + Number(c.commission_amount), 0),
                paidCount: paidCommissions.length,
                paidAmount: paidCommissions.reduce((s, c) => s + Number(c.commission_amount), 0),
                totalReferrers,
            };
        });
    }
    getAdminReferrals(status) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = status ? { status } : {};
            const commissions = yield prisma_1.default.referralCommission.findMany({
                where,
                include: {
                    referrer: {
                        include: { user: { select: { id: true, name: true, email: true } } },
                    },
                    referred_user: { select: { id: true, name: true, email: true } },
                    deposit: { select: { id: true, amount: true, created_at: true } },
                },
                orderBy: { created_at: "desc" },
            });
            return commissions.map((c) => ({
                id: Number(c.id),
                referrer: {
                    profileId: Number(c.referrer.id),
                    userId: Number(c.referrer.user.id),
                    name: c.referrer.user.name,
                    email: c.referrer.user.email,
                },
                referredUser: {
                    id: Number(c.referred_user.id),
                    name: c.referred_user.name,
                    email: c.referred_user.email,
                },
                depositAmount: Number(c.deposit_amount),
                commissionAmount: Number(c.commission_amount),
                status: c.status,
                paidAt: c.paid_at,
                createdAt: c.created_at,
            }));
        });
    }
    getUserReferralInfo(targetUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield prisma_1.default.profile.findFirst({
                where: { user_id: targetUserId },
                include: {
                    referred_by: {
                        include: { user: { select: { id: true, name: true, email: true } } },
                    },
                },
            });
            if (!profile) {
                return null;
            }
            const commissions = yield prisma_1.default.referralCommission.findMany({
                where: { referrer_profile_id: profile.id },
                include: {
                    referred_user: { select: { id: true, name: true, email: true } },
                },
                orderBy: { created_at: "desc" },
            });
            const totalCommissions = commissions.reduce((sum, c) => sum + Number(c.commission_amount), 0);
            return {
                inviteCode: profile.invite_code,
                referralCount: profile.referral_count,
                totalCommissionsEarned: totalCommissions,
                referredBy: profile.referred_by
                    ? {
                        profileId: Number(profile.referred_by.id),
                        userId: Number(profile.referred_by.user.id),
                        name: profile.referred_by.user.name,
                        email: profile.referred_by.user.email,
                    }
                    : null,
                commissions: commissions.map((c) => ({
                    id: Number(c.id),
                    referredUser: {
                        id: Number(c.referred_user.id),
                        name: c.referred_user.name,
                        email: c.referred_user.email,
                    },
                    depositAmount: Number(c.deposit_amount),
                    commissionAmount: Number(c.commission_amount),
                    status: c.status,
                    paidAt: c.paid_at,
                    createdAt: c.created_at,
                })),
            };
        });
    }
    approveCommission(commissionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const commission = yield prisma_1.default.referralCommission.findUnique({
                where: { id: commissionId },
            });
            if (!commission) {
                throw new Error("Commission not found");
            }
            if (commission.status !== "pending") {
                throw new Error("Commission is already " + commission.status);
            }
            const updated = yield prisma_1.default.referralCommission.update({
                where: { id: commissionId },
                data: { status: "paid", paid_at: new Date() },
            });
            // Credit the referrer's balance
            const referrerProfile = yield prisma_1.default.profile.findUnique({
                where: { id: commission.referrer_profile_id },
            });
            if (referrerProfile) {
                yield prisma_1.default.user.update({
                    where: { id: referrerProfile.user_id },
                    data: { balance: { increment: commission.commission_amount } },
                });
            }
            return updated;
        });
    }
    generateNewInviteCode(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const crypto = require("crypto");
            const newCode = crypto.randomBytes(4).toString("hex");
            yield prisma_1.default.profile.updateMany({
                where: { user_id: userId },
                data: { invite_code: newCode },
            });
            return { inviteCode: newCode };
        });
    }
}
exports.ReferralService = ReferralService;
