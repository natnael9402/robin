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
exports.AssetService = void 0;
const library_1 = require("@prisma/client/runtime/library");
const prisma_1 = __importDefault(require("../prisma"));
const market_data_service_1 = __importDefault(require("../trade/market-data.service"));
const trade_service_1 = __importDefault(require("../trade/trade.service"));
const logger_1 = require("../utils/logger");
const ASSET_NAME_MAP = {
    BTC: "Bitcoin",
    ETH: "Ethereum",
    XRP: "Ripple",
    BCH: "Bitcoin Cash",
    LTC: "Litecoin",
    ADA: "Cardano",
    DOT: "Polkadot",
    LINK: "Chainlink",
    BNB: "Binance Coin",
    XLM: "Stellar",
    DOGE: "Dogecoin",
    USDT: "Tether",
    USDC: "USD Coin",
    SOL: "Solana",
};
class AssetService {
    constructor(marketData = market_data_service_1.default) {
        this.marketData = marketData;
    }
    getUserAssets(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.asset.findMany({
                where: { user_id: userId },
                orderBy: [{ updated_at: "desc" }, { created_at: "desc" }],
            });
        });
    }
    getTotalAssetValue(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const aggregate = yield prisma_1.default.asset.aggregate({
                where: { user_id: userId },
                _sum: { current_value: true },
            });
            return (_a = aggregate._sum.current_value) !== null && _a !== void 0 ? _a : new library_1.Decimal(0);
        });
    }
    updateAssetPrices(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const assets = yield prisma_1.default.asset.findMany({ where: { user_id: userId } });
            if (assets.length === 0) {
                return {
                    assets: [],
                    totalValue: new library_1.Decimal(0),
                    count: 0,
                };
            }
            const updatedAssets = [];
            let totalValue = new library_1.Decimal(0);
            for (const asset of assets) {
                try {
                    const formattedSymbol = this.marketData.formatSymbolForBinance(asset.symbol);
                    const currentPrice = yield this.marketData.getCurrentPrice(formattedSymbol);
                    const current_value = currentPrice.mul(asset.amount);
                    const updated = yield prisma_1.default.asset.update({
                        where: { id: asset.id },
                        data: {
                            current_price: currentPrice,
                            current_value: current_value,
                            last_updated_at: new Date(),
                        },
                    });
                    totalValue = totalValue.add(current_value);
                    updatedAssets.push(updated);
                }
                catch (error) {
                    logger_1.logger.error("Failed to update asset price", {
                        userId: userId.toString(),
                        assetId: asset.id.toString(),
                        symbol: asset.symbol,
                        error: error instanceof Error ? error.message : String(error),
                    });
                }
            }
            return {
                assets: updatedAssets,
                totalValue,
                count: updatedAssets.length,
            };
        });
    }
    processSpotTrade(userId, tradeId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const trade = yield prisma_1.default.trade.findFirst({
                where: {
                    id: tradeId,
                    user_id: userId,
                    type: "spot",
                    status: "open",
                },
                include: {
                    spots: true,
                },
            });
            if (!trade) {
                throw new Error("Trade not found or not eligible for processing");
            }
            const spot = trade.spots[0];
            if (!spot) {
                throw new Error("Spot trade details not found");
            }
            const fromCoin = (_a = spot.from_coin) !== null && _a !== void 0 ? _a : undefined;
            const toCoin = (_b = spot.to_coin) !== null && _b !== void 0 ? _b : undefined;
            if (!toCoin) {
                throw new Error("Destination coin missing for spot trade");
            }
            yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                if (fromCoin && fromCoin !== "USDT") {
                    yield this.decreaseAsset(tx, userId, fromCoin, trade.amount);
                }
                yield this.increaseAsset(tx, userId, toCoin, spot.quantity, spot.market_price);
                yield tx.trade.update({
                    where: { id: tradeId },
                    data: {
                        status: "closed",
                        exit_price: spot.market_price,
                        closed_at: new Date(),
                    },
                });
            }));
            return trade_service_1.default.getTrade(userId, tradeId);
        });
    }
    decreaseAsset(tx, userId, symbol, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const asset = yield tx.asset.findUnique({
                where: {
                    user_id_symbol: {
                        user_id: userId,
                        symbol,
                    },
                },
                select: {
                    id: true,
                    amount: true,
                    current_price: true,
                },
            });
            if (!asset) {
                throw new Error(`User does not have ${symbol} assets`);
            }
            if (asset.amount.lt(amount)) {
                throw new Error(`Insufficient ${symbol} balance. Required: ${amount.toString()}, available: ${asset.amount.toString()}`);
            }
            const newAmount = asset.amount.sub(amount);
            if (newAmount.lte(0)) {
                yield tx.asset.delete({ where: { id: asset.id } });
                return;
            }
            const currentValue = asset.current_price
                ? newAmount.mul(asset.current_price)
                : new library_1.Decimal(0);
            yield tx.asset.update({
                where: { id: asset.id },
                data: {
                    amount: newAmount,
                    current_value: currentValue,
                },
            });
        });
    }
    increaseAsset(tx, userId, symbol, amount, price) {
        return __awaiter(this, void 0, void 0, function* () {
            const asset = yield tx.asset.findUnique({
                where: {
                    user_id_symbol: {
                        user_id: userId,
                        symbol,
                    },
                },
                select: {
                    id: true,
                    amount: true,
                    avg_purchase_price: true,
                },
            });
            if (!asset) {
                yield tx.asset.create({
                    data: {
                        user_id: userId,
                        symbol,
                        name: this.getCryptoName(symbol),
                        amount,
                        current_price: price,
                        current_value: amount.mul(price),
                        avg_purchase_price: price,
                    },
                });
                return;
            }
            const previousAmount = asset.amount;
            const newAmount = previousAmount.add(amount);
            const previousValue = asset.avg_purchase_price
                ? previousAmount.mul(asset.avg_purchase_price)
                : new library_1.Decimal(0);
            const newValue = amount.mul(price);
            const avgPrice = newAmount.gt(0)
                ? previousValue.add(newValue).div(newAmount)
                : price;
            yield tx.asset.update({
                where: { id: asset.id },
                data: {
                    amount: newAmount,
                    current_price: price,
                    current_value: newAmount.mul(price),
                    avg_purchase_price: avgPrice,
                },
            });
        });
    }
    getCryptoName(symbol) {
        var _a;
        const normalized = symbol
            .replace(/USDT|USDC|BTC|ETH|USD/gi, "")
            .toUpperCase();
        return (_a = ASSET_NAME_MAP[normalized]) !== null && _a !== void 0 ? _a : normalized;
    }
}
exports.AssetService = AssetService;
exports.default = new AssetService();
