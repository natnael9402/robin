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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.previewWithdrawalFee = exports.deleteWithdrawal = exports.updateWithdrawalStatus = exports.createWithdrawal = exports.getWithdrawalById = exports.getWithdrawals = exports.calculateWithdrawalFee = exports.WithdrawalError = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const library_1 = require("@prisma/client/runtime/library");
const prisma_1 = __importDefault(require("../prisma"));
const NETWORK_MULTIPLIERS = {
    TRC20: 1,
    ERC20: 5,
    BEP20: 0.5,
    SOL: 0.2,
    DEFAULT: 1,
};
class WithdrawalError extends Error {
    constructor(message, statusCode = 400, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = "WithdrawalError";
    }
}
exports.WithdrawalError = WithdrawalError;
const normalizeSymbol = (value) => value.trim().toUpperCase();
const serializeDecimal = (value) => value === null || value === undefined ? null : value.toString();
const serializeDate = (value) => value ? value.toISOString() : null;
const serializeBigInt = (value) => value === null || value === undefined ? null : Number(value.toString());
const formatUser = (user) => {
    var _a, _b, _c, _d;
    if (!user) {
        return undefined;
    }
    return Object.assign(Object.assign({}, user), { id: serializeBigInt((_a = user.id) !== null && _a !== void 0 ? _a : null), balance: user.balance !== undefined && user.balance !== null
            ? serializeDecimal(user.balance)
            : user.balance, created_at: serializeDate((_b = user.created_at) !== null && _b !== void 0 ? _b : null), updated_at: serializeDate((_c = user.updated_at) !== null && _c !== void 0 ? _c : null), email_verified_at: serializeDate((_d = user.email_verified_at) !== null && _d !== void 0 ? _d : null) });
};
const formatWithdrawal = (withdrawal) => {
    if (!withdrawal) {
        return null;
    }
    const { amount, fee, id, user_id, processed_by, created_at, updated_at, processed_at, deleted_at, user, processor } = withdrawal, rest = __rest(withdrawal, ["amount", "fee", "id", "user_id", "processed_by", "created_at", "updated_at", "processed_at", "deleted_at", "user", "processor"]);
    return Object.assign(Object.assign(Object.assign(Object.assign({}, rest), { id: serializeBigInt(id !== null && id !== void 0 ? id : null), user_id: serializeBigInt(user_id !== null && user_id !== void 0 ? user_id : null), processed_by: serializeBigInt(processed_by !== null && processed_by !== void 0 ? processed_by : null), amount: serializeDecimal(amount !== null && amount !== void 0 ? amount : null), fee: serializeDecimal(fee !== null && fee !== void 0 ? fee : null), created_at: serializeDate(created_at !== null && created_at !== void 0 ? created_at : null), updated_at: serializeDate(updated_at !== null && updated_at !== void 0 ? updated_at : null), processed_at: serializeDate(processed_at !== null && processed_at !== void 0 ? processed_at : null), deleted_at: serializeDate(deleted_at !== null && deleted_at !== void 0 ? deleted_at : null) }), (user ? { user: formatUser(user) } : {})), (processor ? { processor: formatUser(processor) } : {}));
};
const calculateWithdrawalFee = (currency, amount, network) => {
    var _a;
    const amountDecimal = new library_1.Decimal(amount);
    const baseFee = new library_1.Decimal(1);
    const multiplier = new library_1.Decimal((_a = NETWORK_MULTIPLIERS[normalizeSymbol(network)]) !== null && _a !== void 0 ? _a : NETWORK_MULTIPLIERS.DEFAULT);
    const percentageFee = amountDecimal.gt(100)
        ? amountDecimal.mul(0.005)
        : new library_1.Decimal(0);
    const fee = baseFee.mul(multiplier).add(percentageFee);
    return fee.gt(20) ? new library_1.Decimal(20) : fee;
};
exports.calculateWithdrawalFee = calculateWithdrawalFee;
const getWithdrawals = (userId, isAdmin, options) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const where = {};
    if (!isAdmin) {
        where.user_id = userId;
    }
    const normalizedStatus = (_a = options.status) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    if (normalizedStatus) {
        where.status =
            normalizedStatus;
    }
    const skip = Math.max(0, (options.page - 1) * options.perPage);
    const [withdrawals, total] = yield Promise.all([
        prisma_1.default.withdrawal.findMany({
            where,
            include: {
                user: isAdmin,
                processor: isAdmin,
            },
            orderBy: { created_at: "desc" },
            skip,
            take: options.perPage,
        }),
        prisma_1.default.withdrawal.count({ where }),
    ]);
    return {
        data: withdrawals.map((record) => formatWithdrawal(record)),
        total,
    };
});
exports.getWithdrawals = getWithdrawals;
const getWithdrawalById = (withdrawalId, userId, isAdmin) => __awaiter(void 0, void 0, void 0, function* () {
    const withdrawal = yield prisma_1.default.withdrawal.findUnique({
        where: { id: withdrawalId },
        include: {
            user: isAdmin,
            processor: isAdmin,
        },
    });
    if (!withdrawal)
        return null;
    if (!isAdmin && withdrawal.user_id !== userId)
        return null;
    return formatWithdrawal(withdrawal);
});
exports.getWithdrawalById = getWithdrawalById;
const createWithdrawal = (userId, input) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new WithdrawalError("User not found", 404, "USER_NOT_FOUND");
    }
    const profile = yield prisma_1.default.profile.findFirst({
        where: { user_id: userId },
    });
    if (!profile) {
        throw new WithdrawalError("Profile not found", 404, "PROFILE_NOT_FOUND");
    }
    if (profile.kyc_status !== "verified") {
        throw new WithdrawalError("Your KYC must be verified to make withdrawals", 403, "KYC_NOT_VERIFIED");
    }
    if (!profile.withdrawal_password_enabled || !profile.withdrawal_password) {
        throw new WithdrawalError("Withdrawal password not set up", 403, "WITHDRAWAL_PASSWORD_NOT_SET");
    }
    const passwordMatches = yield bcryptjs_1.default.compare(input.withdrawalPassword, profile.withdrawal_password);
    if (!passwordMatches) {
        throw new WithdrawalError("Invalid withdrawal password", 401, "INVALID_WITHDRAWAL_PASSWORD");
    }
    const normalizedCurrency = normalizeSymbol(input.currency);
    const normalizedNetwork = normalizeSymbol(input.network);
    const amountDecimal = new library_1.Decimal(input.amount);
    const fee = (0, exports.calculateWithdrawalFee)(normalizedCurrency, input.amount, normalizedNetwork);
    const totalRequired = amountDecimal.add(fee);
    const fastTradeAccount = yield prisma_1.default.accountBalance.findUnique({
        where: { user_id_type: { user_id: userId, type: "fast_trade" } },
    });
    const fastTradeBalance = fastTradeAccount ? fastTradeAccount.balance : new library_1.Decimal(0);
    if (normalizedCurrency === "USDT") {
        if (fastTradeBalance.lt(totalRequired)) {
            throw new WithdrawalError(`Insufficient balance. Required: ${totalRequired.toString()}, Available: ${fastTradeBalance.toString()}`, 400, "INSUFFICIENT_BALANCE");
        }
    }
    else {
        const asset = yield prisma_1.default.asset.findUnique({
            where: {
                user_id_symbol: {
                    user_id: userId,
                    symbol: normalizedCurrency,
                },
            },
        });
        if (!asset) {
            throw new WithdrawalError(`You don't have any ${normalizedCurrency} assets to withdraw`, 400, "ASSET_NOT_FOUND");
        }
        if (asset.amount.lt(amountDecimal)) {
            throw new WithdrawalError(`Insufficient ${normalizedCurrency} balance. Required: ${amountDecimal.toString()}, Available: ${asset.amount.toString()}`, 400, "ASSET_INSUFFICIENT");
        }
        if (fee.gt(0) && fastTradeBalance.lt(fee)) {
            throw new WithdrawalError(`Insufficient balance to cover the withdrawal fee of ${fee.toString()} USDT`, 400, "FEE_INSUFFICIENT");
        }
    }
    const withdrawal = yield prisma_1.default.withdrawal.create({
        data: {
            user_id: userId,
            currency: normalizedCurrency,
            amount: amountDecimal,
            fee,
            wallet_address: input.walletAddress,
            network: normalizedNetwork,
            status: "pending",
        },
    });
    return formatWithdrawal(withdrawal);
});
exports.createWithdrawal = createWithdrawal;
const updateWithdrawalStatus = (withdrawalId, adminId, input) => __awaiter(void 0, void 0, void 0, function* () {
    if (input.status === "rejected" && !input.rejectionReason) {
        throw new WithdrawalError("Rejection reason is required when rejecting a withdrawal", 400, "REJECTION_REASON_REQUIRED");
    }
    return prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const withdrawal = yield tx.withdrawal.findUnique({
            where: { id: withdrawalId },
            include: {
                user: true,
            },
        });
        if (!withdrawal) {
            throw new WithdrawalError("Withdrawal not found", 404, "WITHDRAWAL_NOT_FOUND");
        }
        if (withdrawal.status !== "pending") {
            throw new WithdrawalError("Withdrawal has already been processed", 400, "WITHDRAWAL_PROCESSED");
        }
        const amount = new library_1.Decimal(withdrawal.amount);
        const fee = new library_1.Decimal((_a = withdrawal.fee) !== null && _a !== void 0 ? _a : 0);
        if (input.status === "approved") {
            if (!withdrawal.user) {
                throw new WithdrawalError("Withdrawal user not found", 404, "USER_NOT_FOUND");
            }
            if (withdrawal.currency === "USDT") {
                const fastAccount = yield tx.accountBalance.findUnique({
                    where: { user_id_type: { user_id: withdrawal.user_id, type: "fast_trade" } },
                });
                const balance = fastAccount ? fastAccount.balance : new library_1.Decimal(0);
                const totalRequired = amount.add(fee);
                if (balance.lt(totalRequired)) {
                    throw new WithdrawalError("User has insufficient balance", 400, "INSUFFICIENT_BALANCE");
                }
                const updatedAccount = yield tx.accountBalance.update({
                    where: { user_id_type: { user_id: withdrawal.user_id, type: "fast_trade" } },
                    data: {
                        balance: { decrement: totalRequired },
                    },
                });
                yield tx.transaction.create({
                    data: {
                        user_id: withdrawal.user_id,
                        type: "withdrawal",
                        amount: amount.mul(-1),
                        currency: withdrawal.currency,
                        balance: updatedAccount.balance,
                        description: `Withdrawal of ${amount.toString()} ${withdrawal.currency} via ${withdrawal.network} to ${(_b = withdrawal.wallet_address) !== null && _b !== void 0 ? _b : ""}`,
                    },
                });
                if (fee.gt(0)) {
                    yield tx.transaction.create({
                        data: {
                            user_id: withdrawal.user_id,
                            type: "fee",
                            amount: fee.mul(-1),
                            currency: withdrawal.currency,
                            balance: updatedAccount.balance,
                            description: `Fee for withdrawal of ${amount.toString()} ${withdrawal.currency} via ${withdrawal.network}`,
                        },
                    });
                }
            }
            else {
                const asset = yield tx.asset.findUnique({
                    where: {
                        user_id_symbol: {
                            user_id: withdrawal.user_id,
                            symbol: withdrawal.currency,
                        },
                    },
                });
                if (!asset) {
                    throw new WithdrawalError(`User has insufficient ${withdrawal.currency} balance`, 400, "ASSET_NOT_FOUND");
                }
                if (asset.amount.lt(amount)) {
                    throw new WithdrawalError(`User has insufficient ${withdrawal.currency} balance`, 400, "ASSET_INSUFFICIENT");
                }
                const newAmount = asset.amount.sub(amount);
                if (newAmount.lte(0)) {
                    yield tx.asset.delete({ where: { id: asset.id } });
                }
                else {
                    const updateData = {
                        amount: newAmount,
                    };
                    if (asset.current_price) {
                        updateData.current_value = newAmount.mul(asset.current_price);
                    }
                    yield tx.asset.update({
                        where: { id: asset.id },
                        data: updateData,
                    });
                }
                if (fee.gt(0)) {
                    const feeAccount = yield tx.accountBalance.findUnique({
                        where: { user_id_type: { user_id: withdrawal.user_id, type: "fast_trade" } },
                    });
                    const balance = feeAccount ? feeAccount.balance : new library_1.Decimal(0);
                    if (balance.lt(fee)) {
                        throw new WithdrawalError("User has insufficient balance to cover the fee", 400, "FEE_INSUFFICIENT");
                    }
                    const updatedFeeAccount = yield tx.accountBalance.update({
                        where: { user_id_type: { user_id: withdrawal.user_id, type: "fast_trade" } },
                        data: {
                            balance: { decrement: fee },
                        },
                    });
                    yield tx.transaction.create({
                        data: {
                            user_id: withdrawal.user_id,
                            type: "fee",
                            amount: fee.mul(-1),
                            currency: "USDT",
                            balance: updatedFeeAccount.balance,
                            description: `Fee for withdrawal of ${amount.toString()} ${withdrawal.currency} via ${withdrawal.network}`,
                        },
                    });
                }
            }
            const profile = yield tx.profile.findFirst({
                where: { user_id: withdrawal.user_id },
            });
            if (profile) {
                const totalAssets = new library_1.Decimal((_c = profile.total_assets) !== null && _c !== void 0 ? _c : 0);
                const deduction = amount.add(fee);
                const updatedTotal = totalAssets.sub(deduction);
                yield tx.profile.update({
                    where: { id: profile.id },
                    data: {
                        total_assets: updatedTotal.gt(0) ? updatedTotal : new library_1.Decimal(0),
                    },
                });
            }
        }
        const updatedWithdrawal = yield tx.withdrawal.update({
            where: { id: withdrawalId },
            data: {
                status: input.status,
                processed_by: adminId,
                processed_at: new Date(),
                rejection_reason: input.status === "rejected" ? (_d = input.rejectionReason) !== null && _d !== void 0 ? _d : null : null,
            },
            include: {
                user: true,
                processor: true,
            },
        });
        return formatWithdrawal(updatedWithdrawal);
    }));
});
exports.updateWithdrawalStatus = updateWithdrawalStatus;
const deleteWithdrawal = (withdrawalId, userId, isAdmin) => __awaiter(void 0, void 0, void 0, function* () {
    const where = { id: withdrawalId };
    if (!isAdmin) {
        where.user_id = userId;
        where.status = "pending";
    }
    const withdrawal = yield prisma_1.default.withdrawal.findFirst({ where });
    if (!withdrawal) {
        throw new WithdrawalError("Withdrawal not found or cannot be deleted", 404, "WITHDRAWAL_NOT_FOUND");
    }
    yield prisma_1.default.withdrawal.delete({ where: { id: withdrawalId } });
});
exports.deleteWithdrawal = deleteWithdrawal;
const previewWithdrawalFee = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield prisma_1.default.profile.findFirst({
        where: { user_id: userId },
    });
    if (!profile) {
        throw new WithdrawalError("Profile not found", 404, "PROFILE_NOT_FOUND");
    }
    if (profile.kyc_status !== "verified") {
        throw new WithdrawalError("Your KYC must be verified to make withdrawals", 403, "KYC_NOT_VERIFIED");
    }
    const fee = (0, exports.calculateWithdrawalFee)(payload.currency, payload.amount, payload.network);
    return {
        fee,
        total: new library_1.Decimal(payload.amount).add(fee),
        currency: normalizeSymbol(payload.currency),
    };
});
exports.previewWithdrawalFee = previewWithdrawalFee;
