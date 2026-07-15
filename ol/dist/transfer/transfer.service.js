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
exports.TransferService = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class TransferService {
    transfer(userId, from, to, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            if (from === to) {
                throw new Error("Cannot transfer to the same account");
            }
            if (amount <= 0) {
                throw new Error("Amount must be greater than zero");
            }
            return prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Auto-create source account if missing (balance = 0, will fail below)
                yield tx.accountBalance.upsert({
                    where: { user_id_type: { user_id: userId, type: from } },
                    create: { user_id: userId, type: from, balance: 0 },
                    update: {},
                });
                // Auto-create destination account if missing
                yield tx.accountBalance.upsert({
                    where: { user_id_type: { user_id: userId, type: to } },
                    create: { user_id: userId, type: to, balance: 0 },
                    update: {},
                });
                const fromBal = yield tx.accountBalance.findUnique({
                    where: { user_id_type: { user_id: userId, type: from } },
                });
                if (!fromBal) {
                    throw new Error("Source account not found");
                }
                if (Number(fromBal.balance) < amount) {
                    throw new Error("Insufficient balance");
                }
                const toBal = yield tx.accountBalance.findUnique({
                    where: { user_id_type: { user_id: userId, type: to } },
                });
                if (!toBal) {
                    throw new Error("Destination account not found");
                }
                yield tx.accountBalance.update({
                    where: { id: fromBal.id },
                    data: {
                        balance: {
                            decrement: amount,
                        },
                    },
                });
                yield tx.accountBalance.update({
                    where: { id: toBal.id },
                    data: {
                        balance: {
                            increment: amount,
                        },
                    },
                });
                // User.balance remains unchanged (total stays same for internal transfer)
                yield tx.transaction.create({
                    data: {
                        user_id: userId,
                        type: "transfer",
                        amount: amount,
                        balance: Number(fromBal.balance) - amount,
                        description: "Transfer " + amount + " from " + from + " to " + to,
                    },
                });
                return true;
            }));
        });
    }
}
exports.TransferService = TransferService;
