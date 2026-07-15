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
exports.ArbitrageController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const logger_1 = require("../utils/logger");
class ArbitrageController {
    constructor() {
        this.getStats = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = BigInt(req.user.id);
                const hostings = yield prisma_1.default.arbitrageHosting.findMany({
                    where: { user_id: userId },
                    include: {
                        product: true,
                    },
                    orderBy: { created_at: "desc" },
                });
                const totals = hostings.reduce((acc, hosting) => {
                    var _a;
                    const amount = Number(hosting.amount);
                    const earned = Number((_a = hosting.total_earned) !== null && _a !== void 0 ? _a : 0);
                    acc.totalInvested += amount;
                    acc.totalEarned += earned;
                    switch (hosting.status) {
                        case "running":
                            acc.running += 1;
                            acc.runningInvested += amount;
                            break;
                        case "ended":
                            acc.ended += 1;
                            break;
                        case "cancelled":
                            acc.cancelled += 1;
                            break;
                        default:
                            break;
                    }
                    const currencyKey = hosting.currency.toUpperCase();
                    acc.byCurrency[currencyKey] =
                        (acc.byCurrency[currencyKey] || 0) + amount;
                    return acc;
                }, {
                    totalInvested: 0,
                    runningInvested: 0,
                    totalEarned: 0,
                    running: 0,
                    ended: 0,
                    cancelled: 0,
                    byCurrency: {},
                });
                const nextMaturity = (_a = hostings
                    .filter((hosting) => hosting.status === "running" && hosting.end_date)
                    .map((hosting) => hosting.end_date)
                    .sort((a, b) => a.getTime() - b.getTime())[0]) !== null && _a !== void 0 ? _a : null;
                res.json({
                    success: true,
                    message: "Arbitrage stats retrieved successfully",
                    data: {
                        totals,
                        nextMaturityDate: nextMaturity,
                        hostingsCount: hostings.length,
                    },
                });
            }
            catch (error) {
                logger_1.logger.error("Error fetching arbitrage stats", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch arbitrage stats",
                });
            }
        });
        this.getProfits = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = BigInt(req.user.id);
                const [transactions, hostings] = yield Promise.all([
                    prisma_1.default.transaction.findMany({
                        where: {
                            user_id: userId,
                            type: {
                                in: [
                                    "arbitrage_profit",
                                    "arbitrage_refund",
                                    "arbitrage_purchase",
                                ],
                            },
                        },
                        orderBy: { created_at: "desc" },
                        take: 100,
                    }),
                    prisma_1.default.arbitrageHosting.findMany({
                        where: { user_id: userId },
                    }),
                ]);
                const summary = transactions.reduce((acc, tx) => {
                    const amount = Number(tx.amount);
                    if (tx.type === "arbitrage_profit") {
                        acc.totalProfit += amount;
                    }
                    else if (tx.type === "arbitrage_refund") {
                        acc.totalRefund += amount;
                    }
                    else if (tx.type === "arbitrage_purchase") {
                        acc.totalInvested += Math.abs(amount);
                    }
                    return acc;
                }, {
                    totalProfit: 0,
                    totalRefund: 0,
                    totalInvested: 0,
                });
                const realizedEarnings = hostings.reduce((acc, hosting) => { var _a; return acc + Number((_a = hosting.total_earned) !== null && _a !== void 0 ? _a : 0); }, 0);
                res.json({
                    success: true,
                    message: "Arbitrage profit history retrieved successfully",
                    data: {
                        summary: Object.assign(Object.assign({}, summary), { realizedEarnings, netProfit: summary.totalProfit + summary.totalRefund - summary.totalInvested }),
                        history: transactions.map((tx) => ({
                            id: tx.id,
                            type: tx.type,
                            amount: Number(tx.amount),
                            balanceAfter: Number(tx.balance),
                            createdAt: tx.created_at,
                        })),
                    },
                });
            }
            catch (error) {
                logger_1.logger.error("Error fetching arbitrage profit history", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch arbitrage profit history",
                });
            }
        });
    }
}
exports.ArbitrageController = ArbitrageController;
