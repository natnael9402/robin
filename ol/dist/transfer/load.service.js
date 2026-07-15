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
exports.LoadService = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class LoadService {
    loadFromMain(userId, to, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            if (amount <= 0) {
                throw new Error("Amount must be greater than zero");
            }
            const validTypes = ["spot", "trading", "fast_trade"];
            if (!validTypes.includes(to)) {
                throw new Error("Invalid target account type");
            }
            if (to === "fast_trade") {
                throw new Error("Cannot load from options to options");
            }
            return prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Auto-create source account if missing
                yield tx.accountBalance.upsert({
                    where: { user_id_type: { user_id: userId, type: "fast_trade" } },
                    create: { user_id: userId, type: "fast_trade", balance: 0 },
                    update: {},
                });
                const sourceAccount = yield tx.accountBalance.findUnique({
                    where: { user_id_type: { user_id: userId, type: "fast_trade" } },
                });
                const sourceBalance = sourceAccount ? Number(sourceAccount.balance) : 0;
                if (sourceBalance < amount) {
                    throw new Error("Insufficient options balance");
                }
                yield tx.accountBalance.update({
                    where: { user_id_type: { user_id: userId, type: "fast_trade" } },
                    data: { balance: { decrement: amount } },
                });
                yield tx.accountBalance.upsert({
                    where: { user_id_type: { user_id: userId, type: to } },
                    create: { user_id: userId, type: to, balance: amount },
                    update: { balance: { increment: amount } },
                });
                yield tx.transaction.create({
                    data: {
                        user_id: userId,
                        type: "transfer",
                        amount: amount,
                        balance: sourceBalance - amount,
                        description: "Load " + amount + " from options to " + to,
                    },
                });
                return true;
            }));
        });
    }
    transferToMain(userId, from, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            if (amount <= 0) {
                throw new Error("Amount must be greater than zero");
            }
            const validTypes = ["spot", "trading", "fast_trade"];
            if (!validTypes.includes(from)) {
                throw new Error("Invalid source account type");
            }
            if (from === "fast_trade") {
                throw new Error("Already in options account");
            }
            return prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Auto-create source account if missing
                yield tx.accountBalance.upsert({
                    where: { user_id_type: { user_id: userId, type: from } },
                    create: { user_id: userId, type: from, balance: 0 },
                    update: {},
                });
                // Also ensure destination account exists
                yield tx.accountBalance.upsert({
                    where: { user_id_type: { user_id: userId, type: "fast_trade" } },
                    create: { user_id: userId, type: "fast_trade", balance: 0 },
                    update: {},
                });
                const account = yield tx.accountBalance.findUnique({
                    where: { user_id_type: { user_id: userId, type: from } },
                });
                if (!account) {
                    throw new Error(from + " account not found");
                }
                if (Number(account.balance) < amount) {
                    throw new Error("Insufficient " + from + " balance");
                }
                yield tx.accountBalance.update({
                    where: { user_id_type: { user_id: userId, type: from } },
                    data: { balance: { decrement: amount } },
                });
                yield tx.accountBalance.upsert({
                    where: { user_id_type: { user_id: userId, type: "fast_trade" } },
                    create: { user_id: userId, type: "fast_trade", balance: amount },
                    update: { balance: { increment: amount } },
                });
                yield tx.transaction.create({
                    data: {
                        user_id: userId,
                        type: "transfer",
                        amount: amount,
                        balance: Number(account.balance) - amount,
                        description: "Transfer " + amount + " from " + from + " to options",
                    },
                });
                return true;
            }));
        });
    }
}
exports.LoadService = LoadService;
