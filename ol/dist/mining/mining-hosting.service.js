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
exports.processHostingProfitsByAdmin = exports.deleteHostingAsAdmin = exports.updateHostingStatusAsAdmin = exports.processPendingProfits = exports.finalizeHosting = exports.resumeHosting = exports.pauseHosting = exports.cancelHosting = exports.createHosting = exports.getHostingById = exports.getAdminHostingById = exports.getAdminHostings = exports.getHostings = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const logger_1 = require("../utils/logger");
const getHostings = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.miningHosting.findMany({
        where: { user_id: BigInt(userId) },
        include: { product: true },
        orderBy: { created_at: "desc" },
    });
});
exports.getHostings = getHostings;
const getAdminHostings = (status, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.miningHosting.findMany({
        where: {
            status: status ? status : undefined,
            user_id: userId ? BigInt(userId) : undefined,
        },
        include: { product: true, user: true },
        orderBy: { created_at: "desc" },
    });
});
exports.getAdminHostings = getAdminHostings;
const getAdminHostingById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.miningHosting.findUnique({
        where: { id: BigInt(id) },
        include: { product: true, user: true },
    });
});
exports.getAdminHostingById = getAdminHostingById;
const getHostingById = (id, userId, isAdmin) => __awaiter(void 0, void 0, void 0, function* () {
    const hosting = yield prisma_1.default.miningHosting.findUnique({
        where: { id: BigInt(id) },
        include: { product: true },
    });
    if (!hosting) {
        return null;
    }
    if (hosting.user_id !== BigInt(userId) && !isAdmin) {
        throw new Error("Unauthorized");
    }
    return hosting;
});
exports.getHostingById = getHostingById;
const createHosting = (userId, productId, amount, currency) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield prisma_1.default.miningProduct.findUnique({
        where: { id: BigInt(productId) },
    });
    if (!product || !product.is_active) {
        throw new Error("Selected mining product is not available");
    }
    if (amount < Number(product.min_amount) ||
        amount > Number(product.max_amount)) {
        throw new Error("Amount is outside the allowed limits for this product");
    }
    const existingCount = yield prisma_1.default.miningHosting.count({
        where: {
            user_id: BigInt(userId),
            product_id: BigInt(productId),
        },
    });
    if (existingCount >= product.limit_times) {
        throw new Error("You have reached the maximum number of allowed purchases for this product");
    }
    const user = yield prisma_1.default.user.findUnique({ where: { id: BigInt(userId) } });
    logger_1.logger.info(user ? JSON.parse(JSON.stringify(user)) : "user not found");
    logger_1.logger.info(product ? JSON.parse(JSON.stringify(product)) : "product not found");
    const accountBal = yield prisma_1.default.accountBalance.findUnique({
        where: { user_id_type: { user_id: BigInt(userId), type: "fast_trade" } },
    });
    const fastTradeBalance = (accountBal === null || accountBal === void 0 ? void 0 : accountBal.balance.toNumber()) || 0;
    if (!user || fastTradeBalance < amount) {
        throw new Error("Insufficient balance");
    }
    return prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const updatedBal = yield tx.accountBalance.update({
            where: { user_id_type: { user_id: BigInt(userId), type: "fast_trade" } },
            data: { balance: { decrement: amount } },
        });
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + product.days);
        const hosting = yield tx.miningHosting.create({
            data: {
                user_id: BigInt(userId),
                product_id: BigInt(productId),
                amount,
                currency,
                status: "running",
                start_date: new Date(),
                end_date: endDate,
            },
            include: { product: true },
        });
        yield tx.transaction.create({
            data: {
                user_id: BigInt(userId),
                type: "mining_purchase",
                amount: -amount,
                balance: updatedBal.balance,
            },
        });
        return { hosting, newBalance: updatedBal.balance };
    }));
});
exports.createHosting = createHosting;
const cancelHosting = (hostingId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const hosting = yield prisma_1.default.miningHosting.findUnique({
        where: { id: BigInt(hostingId) },
        include: { product: true },
    });
    if (!hosting || hosting.user_id !== BigInt(userId)) {
        throw new Error("Hosting not found or unauthorized");
    }
    if (hosting.status !== "running" && hosting.status !== "paused") {
        throw new Error("Only running or paused hostings can be cancelled");
    }
    return prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Process pending profits before cancellation
        const { totalProfit } = yield (0, exports.processPendingProfits)(hosting, tx);
        const updatedHosting = yield tx.miningHosting.update({
            where: { id: BigInt(hostingId) },
            data: {
                status: "cancelled",
                end_date: new Date(),
            },
            include: { product: true },
        });
        const daysElapsed = Math.floor((new Date().getTime() - new Date(hosting.start_date).getTime()) /
            (1000 * 3600 * 24));
        const totalDays = hosting.product.days;
        const refundPercentage = Math.max(0, (totalDays - daysElapsed) / totalDays);
        const refundAmount = Number(hosting.amount) * refundPercentage * 0.9; // 10% cancellation fee
        let finalBal = 0;
        if (refundAmount > 0) {
            const updatedBal = yield tx.accountBalance.update({
                where: { user_id_type: { user_id: BigInt(userId), type: "fast_trade" } },
                data: { balance: { increment: refundAmount } },
            });
            finalBal = updatedBal.balance.toNumber();
            yield tx.transaction.create({
                data: {
                    user_id: BigInt(userId),
                    type: "mining_refund",
                    amount: refundAmount,
                    balance: updatedBal.balance,
                },
            });
        }
        return {
            hosting: updatedHosting,
            refundAmount,
            newBalance: finalBal,
        };
    }));
});
exports.cancelHosting = cancelHosting;
const pauseHosting = (hostingId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const hosting = yield prisma_1.default.miningHosting.findUnique({
        where: { id: BigInt(hostingId) },
        include: { product: true },
    });
    if (!hosting || hosting.user_id !== BigInt(userId)) {
        throw new Error("Hosting not found or unauthorized");
    }
    if (hosting.status !== "running") {
        throw new Error("Only running hostings can be paused");
    }
    // Process any pending profits before pausing
    yield (0, exports.processPendingProfits)(hosting, prisma_1.default);
    const updatedHosting = yield prisma_1.default.miningHosting.update({
        where: { id: BigInt(hostingId) },
        data: { status: "paused" },
        include: { product: true },
    });
    return { hosting: updatedHosting };
});
exports.pauseHosting = pauseHosting;
const resumeHosting = (hostingId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const hosting = yield prisma_1.default.miningHosting.findUnique({
        where: { id: BigInt(hostingId) },
        include: { product: true },
    });
    if (!hosting || hosting.user_id !== BigInt(userId)) {
        throw new Error("Hosting not found or unauthorized");
    }
    if (hosting.status !== "paused") {
        throw new Error("Only paused hostings can be resumed");
    }
    const updatedHosting = yield prisma_1.default.miningHosting.update({
        where: { id: BigInt(hostingId) },
        data: { status: "running" },
        include: { product: true },
    });
    return { hosting: updatedHosting };
});
exports.resumeHosting = resumeHosting;
const finalizeHosting = (hostingId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const hosting = yield tx.miningHosting.findUnique({
            where: { id: BigInt(hostingId) },
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
        const { totalProfit } = yield (0, exports.processPendingProfits)(hosting, tx);
        yield tx.miningHosting.update({
            where: { id: BigInt(hostingId) },
            data: {
                status: "ended",
                end_date: (_b = hosting.end_date) !== null && _b !== void 0 ? _b : now,
                updated_at: now,
            },
        });
        return { status: "completed", totalProfit };
    }));
});
exports.finalizeHosting = finalizeHosting;
const processPendingProfits = (hosting, tx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const last_profit_date = (_a = hosting.last_profit_date) !== null && _a !== void 0 ? _a : hosting.start_date;
    const currentDate = new Date();
    const endDate = (_b = hosting.end_date) !== null && _b !== void 0 ? _b : currentDate;
    const effectiveEndDate = endDate.getTime() < currentDate.getTime() ? endDate : currentDate;
    const daysSinceLastProfit = Math.floor((effectiveEndDate.getTime() - new Date(last_profit_date).getTime()) /
        (1000 * 3600 * 24));
    if (daysSinceLastProfit <= 0) {
        return { totalProfit: 0 };
    }
    const dailyProfit = Number(hosting.amount) * (Number(hosting.product.daily_rate) / 100);
    const totalProfit = dailyProfit * daysSinceLastProfit;
    if (totalProfit <= 0) {
        return { totalProfit: 0 };
    }
    const updatedBal = yield tx.accountBalance.update({
        where: { user_id_type: { user_id: hosting.user_id, type: "fast_trade" } },
        data: { balance: { increment: totalProfit + Number(hosting.amount) } },
    });
    yield tx.miningHosting.update({
        where: { id: hosting.id },
        data: {
            total_earned: { increment: totalProfit },
            last_profit_date: effectiveEndDate,
        },
    });
    yield tx.transaction.create({
        data: {
            user_id: hosting.user_id,
            type: "mining_profit",
            amount: totalProfit,
            balance: updatedBal.balance,
        },
    });
    return { totalProfit };
});
exports.processPendingProfits = processPendingProfits;
const updateHostingStatusAsAdmin = (hostingId, status) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const hosting = yield tx.miningHosting.findUnique({
            where: { id: BigInt(hostingId) },
            include: { product: true },
        });
        if (!hosting) {
            throw new Error("Hosting not found");
        }
        yield (0, exports.processPendingProfits)(hosting, tx);
        const oldStatus = hosting.status;
        const updatedHosting = yield tx.miningHosting.update({
            where: { id: BigInt(hostingId) },
            data: {
                status,
                end_date: status !== "running" ? new Date() : hosting.end_date,
            },
        });
        return {
            hosting: updatedHosting,
            oldStatus,
            newStatus: updatedHosting.status,
        };
    }));
});
exports.updateHostingStatusAsAdmin = updateHostingStatusAsAdmin;
const deleteHostingAsAdmin = (hostingId) => __awaiter(void 0, void 0, void 0, function* () {
    const hosting = yield prisma_1.default.miningHosting.findUnique({
        where: { id: BigInt(hostingId) },
    });
    if (!hosting) {
        throw new Error("Hosting not found");
    }
    if (hosting.status === "running") {
        throw new Error("Cannot delete a running hosting");
    }
    return prisma_1.default.miningHosting.delete({ where: { id: BigInt(hostingId) } });
});
exports.deleteHostingAsAdmin = deleteHostingAsAdmin;
const processHostingProfitsByAdmin = (hostingId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const hosting = yield tx.miningHosting.findUnique({
            where: { id: BigInt(hostingId) },
            include: { product: true },
        });
        if (!hosting) {
            throw new Error("Hosting not found");
        }
        const { totalProfit } = yield (0, exports.processPendingProfits)(hosting, tx);
        const refreshedHosting = yield tx.miningHosting.findUnique({
            where: { id: BigInt(hostingId) },
            include: { product: true, user: true },
        });
        return {
            totalProfit,
            hosting: refreshedHosting,
        };
    }));
});
exports.processHostingProfitsByAdmin = processHostingProfitsByAdmin;
