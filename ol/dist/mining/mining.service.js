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
exports.getProfits = exports.getStats = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getStats = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userIdBigInt = BigInt(userId);
    const totalInvested = yield prisma_1.default.miningHosting.aggregate({
        _sum: {
            amount: true,
        },
        where: {
            user_id: userIdBigInt,
        },
    });
    const totalEarned = yield prisma_1.default.miningHosting.aggregate({
        _sum: {
            total_earned: true,
        },
        where: {
            user_id: userIdBigInt,
        },
    });
    const activeHostings = yield prisma_1.default.miningHosting.count({
        where: {
            user_id: userIdBigInt,
            status: "running",
        },
    });
    const pausedHostings = yield prisma_1.default.miningHosting.count({
        where: {
            user_id: userIdBigInt,
            status: "paused",
        },
    });
    return {
        totalInvested: Number((_a = totalInvested._sum.amount) !== null && _a !== void 0 ? _a : 0),
        totalEarned: Number((_b = totalEarned._sum.total_earned) !== null && _b !== void 0 ? _b : 0),
        activeHostings,
        pausedHostings,
    };
});
exports.getStats = getStats;
const getProfits = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const userIdBigInt = BigInt(userId);
    return prisma_1.default.transaction.findMany({
        where: {
            user_id: userIdBigInt,
            type: "mining_profit",
        },
        orderBy: {
            created_at: "desc",
        },
    });
});
exports.getProfits = getProfits;
