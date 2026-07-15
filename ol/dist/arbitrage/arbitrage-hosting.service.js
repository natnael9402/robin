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
exports.ArbitrageHostingService = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class ArbitrageHostingService {
    findUserHostings(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.arbitrageHosting.findMany({
                where: { user_id: BigInt(userId) },
                include: { product: true },
                orderBy: { created_at: "desc" },
            });
        });
    }
    findAllHostings(queryParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if (queryParams === null || queryParams === void 0 ? void 0 : queryParams.status) {
                where.status = queryParams.status;
            }
            if (queryParams === null || queryParams === void 0 ? void 0 : queryParams.user_id) {
                where.user_id = BigInt(queryParams.user_id);
            }
            return prisma_1.default.arbitrageHosting.findMany({
                where,
                include: {
                    product: true,
                    user: true,
                },
                orderBy: { created_at: "desc" },
            });
        });
    }
    findAdminHostingById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.arbitrageHosting.findUnique({
                where: { id: BigInt(id) },
                include: { product: true, user: true },
            });
        });
    }
    findHostingById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.arbitrageHosting.findUnique({
                where: { id: BigInt(id) },
                include: { product: true, user: true },
            });
        });
    }
    createHosting(userId, productId, amount, currency) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const user = yield tx.user.findUnique({ where: { id: BigInt(userId) } });
                if (!user)
                    throw new Error("User not found");
                const accountBal = yield tx.accountBalance.findUnique({
                    where: { user_id_type: { user_id: BigInt(userId), type: "fast_trade" } },
                });
                const fastTradeBalance = (accountBal === null || accountBal === void 0 ? void 0 : accountBal.balance.toNumber()) || 0;
                if (fastTradeBalance < amount) {
                    throw new Error("Insufficient balance");
                }
                const product = yield tx.arbitrageProduct.findUnique({
                    where: { id: BigInt(productId) },
                });
                if (!product)
                    throw new Error("Product not found");
                if (!product.is_active) {
                    throw new Error("Product is not available");
                }
                if (amount < product.min_amount.toNumber() ||
                    amount > product.max_amount.toNumber()) {
                    throw new Error(`Amount must be between ${product.min_amount} and ${product.max_amount}`);
                }
                if (product.supported_currencies &&
                    !product.supported_currencies.includes(currency)) {
                    throw new Error(`Currency ${currency} is not supported for this product`);
                }
                const endDate = new Date();
                endDate.setDate(endDate.getDate() + product.days);
                const updatedBal = yield tx.accountBalance.update({
                    where: { user_id_type: { user_id: BigInt(userId), type: "fast_trade" } },
                    data: { balance: { decrement: amount } },
                });
                const hosting = yield tx.arbitrageHosting.create({
                    data: {
                        user_id: BigInt(userId),
                        product_id: BigInt(productId),
                        amount,
                        status: "running",
                        currency,
                        start_date: new Date(),
                        end_date: endDate,
                    },
                });
                yield tx.transaction.create({
                    data: {
                        user_id: BigInt(userId),
                        type: "arbitrage_purchase",
                        amount: -amount,
                        balance: updatedBal.balance,
                    },
                });
                return { hosting, newBalance: updatedBal.balance.toNumber() };
            }));
        });
    }
    updateHosting(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.arbitrageHosting.update({
                where: { id: BigInt(id) },
                data: updateData,
            });
        });
    }
    deleteHosting(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const hosting = yield this.findHostingById(id);
            if (!hosting)
                return false;
            if (hosting.status === "running") {
                throw new Error("Cannot delete a running hosting");
            }
            const result = yield prisma_1.default.arbitrageHosting.delete({
                where: { id: BigInt(id) },
            });
            return !!result;
        });
    }
    cancelHosting(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const hosting = yield tx.arbitrageHosting.findUnique({
                    where: { id: BigInt(id) },
                    include: { product: true },
                });
                if (!hosting)
                    throw new Error("Hosting not found");
                if (hosting.user_id !== BigInt(userId)) {
                    throw new Error("Unauthorized");
                }
                if (hosting.status !== "running") {
                    throw new Error("Only running hostings can be cancelled");
                }
                const updatedHosting = yield tx.arbitrageHosting.update({
                    where: { id: BigInt(id) },
                    data: {
                        status: "cancelled",
                        end_date: new Date(),
                    },
                });
                const daysElapsed = Math.floor((new Date().getTime() - hosting.start_date.getTime()) /
                    (1000 * 60 * 60 * 24));
                const totalDays = hosting.product.days;
                const refundPercentage = Math.max(0, (totalDays - daysElapsed) / totalDays);
                const refundAmount = hosting.amount.toNumber() * refundPercentage * 0.9; // 10% cancellation fee
                let newBalance = 0;
                if (refundAmount > 0) {
                    const updatedBal = yield tx.accountBalance.update({
                        where: { user_id_type: { user_id: BigInt(userId), type: "fast_trade" } },
                        data: { balance: { increment: refundAmount } },
                    });
                    newBalance = updatedBal.balance.toNumber();
                    yield tx.transaction.create({
                        data: {
                            user_id: BigInt(userId),
                            type: "arbitrage_refund",
                            amount: refundAmount,
                            balance: updatedBal.balance,
                        },
                    });
                }
                return {
                    hosting: updatedHosting,
                    refundAmount,
                    newBalance,
                };
            }));
        });
    }
    finalizeHosting(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const hosting = yield tx.arbitrageHosting.findUnique({
                    where: { id: BigInt(id) },
                    include: { product: true },
                });
                if (!hosting) {
                    return { status: "not_found", totalProfit: 0 };
                }
                if (hosting.status !== "running") {
                    return { status: "already_finalized", totalProfit: 0 };
                }
                const now = new Date();
                const endDate = (_a = hosting.end_date) !== null && _a !== void 0 ? _a : now;
                if (endDate.getTime() > now.getTime()) {
                    return {
                        status: "not_due",
                        totalProfit: 0,
                        nextRunAt: endDate,
                    };
                }
                const lastProfitDate = (_b = hosting.last_profit_date) !== null && _b !== void 0 ? _b : hosting.start_date;
                const effectiveEndDate = endDate.getTime() < now.getTime() ? endDate : now;
                const daysSinceLastProfit = Math.floor((effectiveEndDate.getTime() - new Date(lastProfitDate).getTime()) /
                    (1000 * 3600 * 24));
                let totalProfit = 0;
                if (daysSinceLastProfit > 0) {
                    const dailyProfit = hosting.amount.toNumber() *
                        (hosting.product.daily_rate.toNumber() / 100);
                    totalProfit = dailyProfit * daysSinceLastProfit;
                    if (totalProfit > 0) {
                        const updatedBal = yield tx.accountBalance.update({
                            where: { user_id_type: { user_id: hosting.user_id, type: "fast_trade" } },
                            data: { balance: { increment: totalProfit + hosting.amount.toNumber() } },
                        });
                        yield tx.transaction.create({
                            data: {
                                user_id: hosting.user_id,
                                type: "arbitrage_profit",
                                amount: totalProfit,
                                balance: updatedBal.balance,
                            },
                        });
                    }
                }
                const updateData = {
                    status: "ended",
                    last_profit_date: effectiveEndDate,
                    updated_at: now,
                };
                if (!hosting.end_date) {
                    updateData.end_date = effectiveEndDate;
                }
                if (totalProfit > 0) {
                    updateData.total_earned = { increment: totalProfit };
                }
                yield tx.arbitrageHosting.update({
                    where: { id: BigInt(id) },
                    data: updateData,
                });
                return { status: "completed", totalProfit };
            }));
        });
    }
    processPendingProfitsAdmin(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const hosting = yield tx.arbitrageHosting.findUnique({
                    where: { id: BigInt(id) },
                    include: { product: true },
                });
                if (!hosting) {
                    throw new Error("Hosting not found");
                }
                const lastProfitDate = (_a = hosting.last_profit_date) !== null && _a !== void 0 ? _a : hosting.start_date;
                const currentDate = new Date();
                const endDate = (_b = hosting.end_date) !== null && _b !== void 0 ? _b : currentDate;
                const effectiveEndDate = endDate.getTime() < currentDate.getTime() ? endDate : currentDate;
                const daysSinceLastProfit = Math.floor((effectiveEndDate.getTime() - new Date(lastProfitDate).getTime()) /
                    (1000 * 3600 * 24));
                if (daysSinceLastProfit <= 0) {
                    return {
                        totalProfit: 0,
                        hosting: yield this.findAdminHostingById(id),
                    };
                }
                const dailyProfit = hosting.amount.toNumber() *
                    (hosting.product.daily_rate.toNumber() / 100);
                const totalProfit = dailyProfit * daysSinceLastProfit;
                if (totalProfit <= 0) {
                    return {
                        totalProfit: 0,
                        hosting: yield this.findAdminHostingById(id),
                    };
                }
                const updatedBal = yield tx.accountBalance.update({
                    where: { user_id_type: { user_id: hosting.user_id, type: "fast_trade" } },
                    data: { balance: { increment: totalProfit } },
                });
                yield tx.arbitrageHosting.update({
                    where: { id: BigInt(id) },
                    data: {
                        total_earned: { increment: totalProfit },
                        last_profit_date: effectiveEndDate,
                    },
                });
                yield tx.transaction.create({
                    data: {
                        user_id: hosting.user_id,
                        type: "arbitrage_profit",
                        amount: totalProfit,
                        balance: updatedBal.balance,
                    },
                });
                return {
                    totalProfit,
                    hosting: yield this.findAdminHostingById(id),
                };
            }));
        });
    }
    updateHostingStatusAdmin(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const hosting = yield tx.arbitrageHosting.findUnique({
                    where: { id: BigInt(id) },
                    include: { product: true },
                });
                if (!hosting) {
                    throw new Error("Hosting not found");
                }
                yield this.processPendingProfitsAdmin(id);
                const updated = yield tx.arbitrageHosting.update({
                    where: { id: BigInt(id) },
                    data: {
                        status: status,
                        end_date: status !== "running" ? new Date() : hosting.end_date,
                    },
                    include: { product: true, user: true },
                });
                return updated;
            }));
        });
    }
}
exports.ArbitrageHostingService = ArbitrageHostingService;
