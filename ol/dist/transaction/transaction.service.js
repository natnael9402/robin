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
exports.getTransactionStats = exports.getTransactionById = exports.getTransactions = void 0;
const library_1 = require("@prisma/client/runtime/library");
const prisma_1 = __importDefault(require("../prisma"));
const transaction_classification_1 = require("./transaction.classification");
const createEmptyCategoryStats = () => ({
    DEPOSIT: { amount: new library_1.Decimal(0), count: 0 },
    WITHDRAWAL: { amount: new library_1.Decimal(0), count: 0 },
    TRADE: { amount: new library_1.Decimal(0), count: 0 },
    FEE: { amount: new library_1.Decimal(0), count: 0 },
    ARBITRAGE: { amount: new library_1.Decimal(0), count: 0 },
    MINING: { amount: new library_1.Decimal(0), count: 0 },
    OTHER: { amount: new library_1.Decimal(0), count: 0 },
});
const addCategory = (transaction) => (Object.assign(Object.assign({}, transaction), { category: (0, transaction_classification_1.getTransactionCategory)(transaction.type) }));
const getTransactions = (userId, isAdmin, type, category) => __awaiter(void 0, void 0, void 0, function* () {
    const whereClause = {};
    if (!isAdmin) {
        whereClause.user_id = userId;
    }
    const normalizedType = type === null || type === void 0 ? void 0 : type.trim();
    const categoryTypes = !normalizedType && category ? [...(0, transaction_classification_1.getTypesForCategory)(category)] : [];
    if (normalizedType) {
        whereClause.type = normalizedType;
    }
    else if (categoryTypes.length > 0) {
        whereClause.type =
            categoryTypes.length === 1 ? categoryTypes[0] : { in: categoryTypes };
    }
    const transactions = yield prisma_1.default.transaction.findMany({
        where: whereClause,
        include: {
            user: isAdmin, // Only include user for admins
            trade: true,
        },
        orderBy: {
            created_at: "desc",
        },
    });
    return transactions.map(addCategory);
});
exports.getTransactions = getTransactions;
const getTransactionById = (transactionId, userId, isAdmin) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield prisma_1.default.transaction.findUnique({
        where: { id: transactionId },
        include: {
            user: isAdmin,
            trade: true,
        },
    });
    if (!transaction) {
        return null;
    }
    if (!isAdmin && transaction.user_id !== userId) {
        return null; // Or throw an unauthorized error
    }
    return addCategory(transaction);
});
exports.getTransactionById = getTransactionById;
const getTransactionStats = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const aggregations = yield prisma_1.default.transaction.groupBy({
        by: ["type"],
        _sum: {
            amount: true,
        },
        _count: {
            _all: true,
        },
        where: {
            user_id: userId,
        },
    });
    const categoryStats = createEmptyCategoryStats();
    for (const group of aggregations) {
        const count = group._count._all;
        const sum = (_a = group._sum.amount) !== null && _a !== void 0 ? _a : new library_1.Decimal(0);
        const category = (0, transaction_classification_1.getTransactionCategory)(group.type);
        const bucket = categoryStats[category];
        bucket.amount = bucket.amount.add(sum);
        bucket.count += count;
    }
    return {
        totalDeposits: categoryStats.DEPOSIT.amount,
        totalWithdrawals: categoryStats.WITHDRAWAL.amount,
        totalTrades: categoryStats.TRADE.count,
        totalFees: categoryStats.FEE.amount,
        totalArbitrage: categoryStats.ARBITRAGE.amount,
        totalMining: categoryStats.MINING.amount,
        byType: {
            deposits: categoryStats.DEPOSIT.count,
            withdrawals: categoryStats.WITHDRAWAL.count,
            trades: categoryStats.TRADE.count,
            fees: categoryStats.FEE.count,
            arbitrage: categoryStats.ARBITRAGE.count,
            mining: categoryStats.MINING.count,
            other: categoryStats.OTHER.count,
        },
        byCategory: categoryStats,
    };
});
exports.getTransactionStats = getTransactionStats;
