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
exports.deleteDeposit = exports.updateDepositStatus = exports.createDeposit = exports.getDepositById = exports.getDeposits = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma_1 = __importDefault(require("../prisma"));
const prisma_2 = require("../generated/prisma");
const logger_1 = require("../utils/logger");
const blob_storage_1 = require("../utils/blob-storage");
const toPlainObject = (input) => {
    if (input === null || input === undefined) {
        return input;
    }
    if (typeof input === "bigint") {
        return Number(input);
    }
    if (input instanceof prisma_2.Prisma.Decimal) {
        return input.toString();
    }
    if (input instanceof Date) {
        return input.toISOString();
    }
    if (Array.isArray(input)) {
        return input.map((value) => toPlainObject(value));
    }
    if (typeof input === "object") {
        const entries = Object.entries(input).map(([key, value]) => [key, toPlainObject(value)]);
        return Object.fromEntries(entries);
    }
    return input;
};
const sanitizeUser = (user) => {
    const cloned = Object.assign({}, user);
    delete cloned.password;
    delete cloned.remember_token;
    delete cloned.fund_password;
    return cloned;
};
const formatDeposit = (deposit) => {
    const plain = toPlainObject(deposit);
    if (deposit.user) {
        plain.user = sanitizeUser(toPlainObject(deposit.user));
    }
    if (deposit.processor) {
        plain.processor = sanitizeUser(toPlainObject(deposit.processor));
    }
    return plain;
};
const getDeposits = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, isAdmin, status, page, perPage } = params;
    const skip = (page - 1) * perPage;
    const where = {};
    if (!isAdmin) {
        where.user_id = userId;
    }
    if (status && ["pending", "approved", "rejected"].includes(status)) {
        where.status = status;
    }
    const include = isAdmin
        ? { user: true, processor: true }
        : undefined;
    const [records, total] = yield Promise.all([
        prisma_1.default.deposit.findMany({
            where,
            include,
            skip,
            take: perPage,
            orderBy: { created_at: "desc" },
        }),
        prisma_1.default.deposit.count({ where }),
    ]);
    return {
        deposits: records.map((deposit) => formatDeposit(deposit)),
        pagination: {
            page,
            perPage,
            total,
        },
    };
});
exports.getDeposits = getDeposits;
const getDepositById = (depositId, userId, isAdmin) => __awaiter(void 0, void 0, void 0, function* () {
    const deposit = yield prisma_1.default.deposit.findUnique({
        where: { id: depositId },
        include: isAdmin ? { user: true, processor: true } : undefined,
    });
    if (!deposit) {
        return null;
    }
    if (!isAdmin && deposit.user_id !== userId) {
        return null;
    }
    return formatDeposit(deposit);
});
exports.getDepositById = getDepositById;
const createDeposit = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const deposit = yield prisma_1.default.deposit.create({
        data: {
            user_id: userId,
            currency: data.currency,
            amount: new prisma_2.Prisma.Decimal(data.amount),
            payment_method: (_a = data.paymentMethod) !== null && _a !== void 0 ? _a : "crypto",
            proof_image: (_b = data.proofReference) !== null && _b !== void 0 ? _b : null,
            status: "pending",
        },
    });
    return formatDeposit(deposit);
});
exports.createDeposit = createDeposit;
const updateDepositStatus = (depositId, adminId, status, rejectionReason) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield prisma_1.default.deposit.findUnique({
        where: { id: depositId },
    });
    if (!existing) {
        throw new Error("Deposit not found");
    }
    if (existing.status !== "pending") {
        throw new Error("This deposit has already been processed");
    }
    return prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const updated = yield tx.deposit.update({
            where: { id: depositId },
            data: {
                status,
                processed_by: adminId,
                processed_at: new Date(),
                rejection_reason: status === "rejected" ? rejectionReason !== null && rejectionReason !== void 0 ? rejectionReason : null : null,
            },
        });
        if (status === "approved") {
            const depositUser = yield tx.user.findUnique({
                where: { id: existing.user_id },
                include: { profiles: true },
            });
            if (!depositUser) {
                throw new Error("User not found");
            }
            let bonusAmount = new prisma_2.Prisma.Decimal(0);
            const rawAmount = Number(existing.amount);
            if (existing.payment_method === "crypto" &&
                existing.currency !== "USDT") {
                // Placeholder log for asset updates handled by upstream services.
                logger_1.logger.info("Asset update required for crypto deposit", {
                    depositId: existing.id,
                    userId: depositUser.id,
                });
            }
            else {
                let totalIncrement = existing.amount;
                if (rawAmount >= 5000) {
                    bonusAmount = existing.amount.mul(0.10);
                    totalIncrement = existing.amount.add(bonusAmount);
                }
                yield tx.accountBalance.upsert({
                    where: { user_id_type: { user_id: existing.user_id, type: "fast_trade" } },
                    create: { user_id: existing.user_id, type: "fast_trade", balance: totalIncrement },
                    update: { balance: { increment: totalIncrement } },
                });
            }
            const fastTradeAccount = yield tx.accountBalance.findUnique({
                where: { user_id_type: { user_id: existing.user_id, type: "fast_trade" } },
            });
            const balanceSnapshot = fastTradeAccount ? fastTradeAccount.balance : new prisma_2.Prisma.Decimal(0);
            yield tx.transaction.create({
                data: {
                    user_id: existing.user_id,
                    type: "deposit",
                    amount: existing.amount,
                    currency: existing.currency,
                    balance: balanceSnapshot,
                    description: `Deposit of ${existing.amount} ${existing.currency} via ${existing.payment_method} approved`,
                },
            });
            if (bonusAmount.gt(0)) {
                yield tx.transaction.create({
                    data: {
                        user_id: existing.user_id,
                        type: "bonus",
                        amount: bonusAmount,
                        currency: existing.currency,
                        balance: balanceSnapshot,
                        description: `10% deposit bonus on $${rawAmount.toFixed(2)} deposit`,
                    },
                });
            }
            const profileTotalIncrement = existing.amount.add(bonusAmount);
            if (depositUser.profiles[0]) {
                yield tx.profile.update({
                    where: { id: depositUser.profiles[0].id },
                    data: { total_assets: { increment: profileTotalIncrement } },
                });
                // Auto-create referral commission if the user was referred
                if (depositUser.profiles[0].referred_by_id && rawAmount >= 5000) {
                    const commissionAmount = existing.amount.mul(0.10);
                    yield tx.referralCommission.create({
                        data: {
                            referrer_profile_id: depositUser.profiles[0].referred_by_id,
                            referred_user_id: existing.user_id,
                            deposit_id: existing.id,
                            deposit_amount: existing.amount,
                            commission_amount: commissionAmount,
                            status: "pending",
                        },
                    });
                    logger_1.logger.info("Referral commission created", {
                        referrerProfileId: depositUser.profiles[0].referred_by_id,
                        userId: existing.user_id,
                        depositId: existing.id,
                        commissionAmount,
                    });
                }
            }
        }
        const refreshed = yield tx.deposit.findUnique({
            where: { id: depositId },
            include: { user: true, processor: true },
        });
        return formatDeposit(refreshed);
    }));
});
exports.updateDepositStatus = updateDepositStatus;
const deleteDeposit = (depositId, userId, isAdmin) => __awaiter(void 0, void 0, void 0, function* () {
    const where = { id: depositId };
    if (!isAdmin) {
        where.user_id = userId;
        where.status = "pending";
    }
    const deposit = yield prisma_1.default.deposit.findFirst({ where });
    if (!deposit) {
        throw new Error("Deposit not found or cannot be deleted");
    }
    if (deposit.proof_image) {
        if (!/^https?:\/\//i.test(deposit.proof_image)) {
            if (fs_1.default.existsSync(deposit.proof_image)) {
                try {
                    fs_1.default.unlinkSync(path_1.default.resolve(deposit.proof_image));
                }
                catch (error) {
                    logger_1.logger.warn("Failed to delete deposit proof image", {
                        depositId: deposit.id,
                        error: error instanceof Error ? error.message : String(error),
                    });
                }
            }
        }
        else {
            yield (0, blob_storage_1.deleteBlobObject)(deposit.proof_image);
        }
    }
    yield prisma_1.default.deposit.delete({ where: { id: depositId } });
});
exports.deleteDeposit = deleteDeposit;
