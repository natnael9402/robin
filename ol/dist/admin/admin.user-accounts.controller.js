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
exports.AdminUserAccountsController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const http_response_1 = require("../utils/http-response");
const logger_1 = require("../utils/logger");
const VALID_ACCOUNT_TYPES = ["fast_trade", "spot", "trading"];
class AdminUserAccountsController {
    getUserAccounts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = BigInt(req.params.userId);
                const accounts = yield prisma_1.default.accountBalance.findMany({
                    where: { user_id: userId },
                });
                const result = { fast_trade: 0, spot: 0, trading: 0, total: 0 };
                for (const a of accounts) {
                    if (result.hasOwnProperty(a.type)) {
                        result[a.type] = Number(a.balance);
                    }
                }
                result.total = result.fast_trade + result.spot + result.trading;
                return (0, http_response_1.successResponse)(res, result, "Account balances retrieved");
            }
            catch (error) {
                logger_1.logger.error("Error fetching user accounts", error);
                return (0, http_response_1.errorResponse)(res, "Failed to fetch account balances", 500);
            }
        });
    }
    setAccountBalance(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = BigInt(req.params.userId);
                const { type } = req.params;
                const { balance } = req.body;
                if (!VALID_ACCOUNT_TYPES.includes(type)) {
                    return (0, http_response_1.errorResponse)(res, "Invalid account type. Must be fast_trade, spot, or trading", 400);
                }
                if (balance === undefined || balance === null || isNaN(Number(balance))) {
                    return (0, http_response_1.errorResponse)(res, "Balance must be a valid number", 400);
                }
                const targetBalance = Number(balance);
                const existing = yield prisma_1.default.accountBalance.findUnique({
                    where: { user_id_type: { user_id: userId, type } },
                });
                let account;
                if (existing) {
                    account = yield prisma_1.default.accountBalance.update({
                        where: { id: existing.id },
                        data: { balance: targetBalance },
                    });
                }
                else {
                    account = yield prisma_1.default.accountBalance.create({
                        data: { user_id: userId, type, balance: targetBalance },
                    });
                }
                yield prisma_1.default.transaction.create({
                    data: {
                        user_id: userId,
                        type: "balance_adjustment",
                        amount: targetBalance,
                        currency: "USDT",
                        balance: targetBalance,
                        description: `Admin adjusted ${type} account balance to $${targetBalance.toFixed(2)}`,
                    },
                });
                logger_1.logger.info("Admin set account balance", {
                    userId: userId.toString(),
                    type,
                    amount: targetBalance,
                });
                return (0, http_response_1.successResponse)(res, { type, balance: Number(account.balance) }, `${type} balance updated successfully`);
            }
            catch (error) {
                logger_1.logger.error("Error setting account balance", error);
                return (0, http_response_1.errorResponse)(res, "Failed to update account balance", 500);
            }
        });
    }
    getUserAssets(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = BigInt(req.params.userId);
                const assets = yield prisma_1.default.asset.findMany({
                    where: { user_id: userId },
                    orderBy: { updated_at: "desc" },
                });
                let totalValue = 0;
                for (const a of assets) {
                    totalValue += Number(a.current_value || 0);
                }
                return (0, http_response_1.successResponse)(res, {
                    assets: assets.map((a) => ({
                        id: Number(a.id),
                        symbol: a.symbol,
                        name: a.name,
                        amount: Number(a.amount),
                        current_price: Number(a.current_price || 0),
                        current_value: Number(a.current_value || 0),
                        avg_purchase_price: Number(a.avg_purchase_price || 0),
                        last_updated_at: a.last_updated_at,
                        created_at: a.created_at,
                        updated_at: a.updated_at,
                    })),
                    total_value: totalValue,
                    count: assets.length,
                }, "User assets retrieved");
            }
            catch (error) {
                logger_1.logger.error("Error fetching user assets", error);
                return (0, http_response_1.errorResponse)(res, "Failed to fetch user assets", 500);
            }
        });
    }
    createAsset(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = BigInt(req.params.userId);
                const { symbol, name, amount, current_price, avg_purchase_price } = req.body;
                if (!symbol || amount === undefined) {
                    return (0, http_response_1.errorResponse)(res, "Symbol and amount are required", 400);
                }
                const numAmount = Number(amount);
                const numPrice = Number(current_price || avg_purchase_price || 0);
                const existing = yield prisma_1.default.asset.findUnique({
                    where: { user_id_symbol: { user_id: userId, symbol: symbol.toUpperCase() } },
                });
                if (existing) {
                    return (0, http_response_1.errorResponse)(res, `Asset ${symbol.toUpperCase()} already exists for this user. Use update instead.`, 409);
                }
                const asset = yield prisma_1.default.asset.create({
                    data: {
                        user_id: userId,
                        symbol: symbol.toUpperCase(),
                        name: name || symbol.toUpperCase(),
                        amount: numAmount,
                        current_price: numPrice,
                        current_value: numAmount * numPrice,
                        avg_purchase_price: Number(avg_purchase_price || numPrice),
                        last_updated_at: new Date(),
                    },
                });
                logger_1.logger.info("Admin created asset", {
                    userId: userId.toString(),
                    symbol: asset.symbol,
                    amount: numAmount,
                });
                return (0, http_response_1.successResponse)(res, {
                    id: Number(asset.id),
                    symbol: asset.symbol,
                    name: asset.name,
                    amount: Number(asset.amount),
                    current_price: Number(asset.current_price),
                    current_value: Number(asset.current_value),
                    avg_purchase_price: Number(asset.avg_purchase_price),
                }, "Asset created successfully");
            }
            catch (error) {
                logger_1.logger.error("Error creating asset", error);
                return (0, http_response_1.errorResponse)(res, "Failed to create asset", 500);
            }
        });
    }
    updateAsset(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = BigInt(req.params.userId);
                const assetId = BigInt(req.params.assetId);
                const { amount, current_price, avg_purchase_price, name } = req.body;
                const existing = yield prisma_1.default.asset.findFirst({
                    where: { id: assetId, user_id: userId },
                });
                if (!existing) {
                    return (0, http_response_1.errorResponse)(res, "Asset not found", 404);
                }
                const updateData = {};
                if (amount !== undefined) updateData.amount = Number(amount);
                if (current_price !== undefined) updateData.current_price = Number(current_price);
                if (avg_purchase_price !== undefined) updateData.avg_purchase_price = Number(avg_purchase_price);
                if (name !== undefined) updateData.name = name;
                updateData.last_updated_at = new Date();
                const finalAmount = updateData.amount !== undefined ? updateData.amount : Number(existing.amount);
                const finalPrice = updateData.current_price !== undefined ? updateData.current_price : Number(existing.current_price || 0);
                updateData.current_value = finalAmount * finalPrice;
                const asset = yield prisma_1.default.asset.update({
                    where: { id: assetId },
                    data: updateData,
                });
                logger_1.logger.info("Admin updated asset", {
                    userId: userId.toString(),
                    assetId: assetId.toString(),
                    symbol: asset.symbol,
                });
                return (0, http_response_1.successResponse)(res, {
                    id: Number(asset.id),
                    symbol: asset.symbol,
                    name: asset.name,
                    amount: Number(asset.amount),
                    current_price: Number(asset.current_price),
                    current_value: Number(asset.current_value),
                    avg_purchase_price: Number(asset.avg_purchase_price),
                }, "Asset updated successfully");
            }
            catch (error) {
                logger_1.logger.error("Error updating asset", error);
                return (0, http_response_1.errorResponse)(res, "Failed to update asset", 500);
            }
        });
    }
    deleteAsset(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = BigInt(req.params.userId);
                const assetId = BigInt(req.params.assetId);
                const existing = yield prisma_1.default.asset.findFirst({
                    where: { id: assetId, user_id: userId },
                });
                if (!existing) {
                    return (0, http_response_1.errorResponse)(res, "Asset not found", 404);
                }
                yield prisma_1.default.asset.delete({ where: { id: assetId } });
                logger_1.logger.info("Admin deleted asset", {
                    userId: userId.toString(),
                    assetId: assetId.toString(),
                    symbol: existing.symbol,
                });
                return (0, http_response_1.successResponse)(res, { deleted: true }, "Asset deleted successfully");
            }
            catch (error) {
                logger_1.logger.error("Error deleting asset", error);
                return (0, http_response_1.errorResponse)(res, "Failed to delete asset", 500);
            }
        });
    }
}
exports.AdminUserAccountsController = AdminUserAccountsController;
exports.default = new AdminUserAccountsController();
