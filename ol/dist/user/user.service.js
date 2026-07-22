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
exports.UserService = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class UserService {
    findUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.user.findUnique({
                where: { id },
                include: {
                    profiles: true,
                    accountBalances: true,
                    arbitrageHostings: true,
                    assets: true,
                    deposits: true,
                    kycSubmissions: true,
                    miningHostings: true,
                    supportTickets: true,
                    trades: true,
                    transactions: true,
                    withdrawals: true,
                },
            });
        });
    }
    findAllUsers(queryParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, role, kyc_status, date_from, date_to } = queryParams;
            const where = {};
            if (name) {
                where.name = { contains: name };
            }
            if (email) {
                where.email = { contains: email };
            }
            if (role) {
                where.role = role;
            }
            if (kyc_status) {
                where.kycSubmissions = {
                    some: {
                        status: kyc_status,
                    },
                };
            }
            if (date_from || date_to) {
                where.created_at = {};
                if (date_from) {
                    where.created_at.gte = new Date(date_from);
                }
                if (date_to) {
                    const endDate = new Date(date_to);
                    endDate.setHours(23, 59, 59, 999);
                    where.created_at.lte = endDate;
                }
            }
            return prisma_1.default.user.findMany({
                where,
                include: {
                    profiles: true,
                    accountBalances: true,
                    kycSubmissions: true,
                },
            });
        });
    }
    updateUser(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { balance, accountType, ...rest } = updateData;
            const user = yield prisma_1.default.user.update({
                where: { id },
                data: rest,
            });
            if (balance !== undefined && balance !== null) {
                const targetBalance = Number(balance);
                const validTypes = ["fast_trade", "spot", "trading"];
                const type = validTypes.includes(accountType) ? accountType : "fast_trade";
                yield prisma_1.default.accountBalance.upsert({
                    where: { user_id_type: { user_id: BigInt(id), type } },
                    create: { user_id: BigInt(id), type, balance: targetBalance },
                    update: { balance: targetBalance },
                });
                yield prisma_1.default.transaction.create({
                    data: {
                        user_id: BigInt(id),
                        type: "balance_adjustment",
                        amount: targetBalance,
                        currency: "USDT",
                        balance: targetBalance,
                        description: `Admin balance adjustment (${type})`,
                    },
                });
            }
            return user;
        });
    }
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma_1.default.user.delete({ where: { id } });
        });
    }
}
exports.UserService = UserService;
