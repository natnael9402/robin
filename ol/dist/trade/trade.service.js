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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeService = void 0;
const library_1 = require("@prisma/client/runtime/library");
const prisma_1 = __importDefault(require("../prisma"));
const market_data_service_1 = __importDefault(require("./market-data.service"));
const market_service_1 = __importDefault(require("../market/market.service"));
const stock_service_1 = __importDefault(require("./stock.service"));
const logger_1 = require("../utils/logger");
const trade_rules_1 = require("../utils/trade-rules");
const tradeInclude = {
    options: true,
    contracts: true,
    spots: true,
    transactions: true,
};
const DEFAULT_OPTION_TRADE_RULES = {
    60: { returnRate: 14 },
    90: { returnRate: 21 },
    120: { returnRate: 30 },
    180: { returnRate: 47 },
};
function parseOptionTradeRules(rawRules, fallback) {
    if (!rawRules) {
        return fallback;
    }
    try {
        const parsed = JSON.parse(rawRules);
        if (typeof parsed !== "object" ||
            parsed === null ||
            Array.isArray(parsed)) {
            throw new Error("OPTION_TRADE_RULES must be a JSON object");
        }
        const normalized = Object.entries(parsed).reduce((acc, [durationKey, ruleValue]) => {
            const duration = Number(durationKey);
            if (!Number.isInteger(duration) || duration <= 0) {
                return acc;
            }
            if (!ruleValue ||
                typeof ruleValue !== "object" ||
                Array.isArray(ruleValue)) {
                return acc;
            }
            const { returnRate, minAmount, maxAmount } = ruleValue;
            if (typeof returnRate !== "number") {
                return acc;
            }
            acc[duration] = Object.assign(Object.assign({ returnRate }, (typeof minAmount === "number" ? { minAmount } : {})), (typeof maxAmount === "number" ? { maxAmount } : {}));
            return acc;
        }, {});
        if (Object.keys(normalized).length === 0) {
            throw new Error("No valid option trade rules found");
        }
        return normalized;
    }
    catch (error) {
        logger_1.logger.warn("Invalid OPTION_TRADE_RULES value. Using default rules.", {
            error: error instanceof Error ? error.message : error,
        });
        return fallback;
    }
}
// const OPTION_TRADE_RULES = parseOptionTradeRules(
//   process.env.OPTION_TRADE_RULES,
//   DEFAULT_OPTION_TRADE_RULES
// );
const CONTRACT_LEVERAGE_OPTIONS = [2, 5, 10, 20, 50, 100, 125];
const TRANSACTION_FEE_RATE = new library_1.Decimal("0.02");
const MIN_OPTION_TRADE_AMOUNT = 100;
class TradeService {
    constructor(marketData = market_data_service_1.default, marketService = market_service_1.default, stockData = stock_service_1.default) {
        this.marketData = marketData;
        this.marketService = marketService;
        this.stockData = stockData;
    }
    createOptionTrade(userId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const userAccount = yield prisma_1.default.accountBalance.findUnique({
                where: { user_id_type: { user_id: userId, type: "fast_trade" } },
            });
            const fastTradeBalance = userAccount ? userAccount.balance : new library_1.Decimal(0);
            this.validateOptionTradeData(fastTradeBalance, payload);
            const marketType = this.normalizeMarketType(payload.marketType, payload.symbol);
            let normalizedSymbol, entryPrice;
            if (payload.price && Number(payload.price) > 0) {
                normalizedSymbol = (payload.symbol || "").replace(/\/USD(T)?$/i, "").trim().toUpperCase();
                entryPrice = new library_1.Decimal(payload.price);
                console.log(`Using frontend price for ${normalizedSymbol}: ${entryPrice}`);
            } else {
                const result = yield this.getSymbolAndPrice(payload.symbol, marketType);
                normalizedSymbol = result.symbol;
                entryPrice = result.price;
            }
            const amount = new library_1.Decimal(payload.amount);
            const fee = amount.mul(TRANSACTION_FEE_RATE);
            const totalDeduction = amount.add(fee);
            const rule = trade_rules_1.OPTION_TRADE_RULES[payload.duration];
            const expectedReturn = amount.add(amount.mul(new library_1.Decimal(rule.returnRate).div(100)));
            const trade = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const currentAccount = yield tx.accountBalance.findUnique({
                    where: { user_id_type: { user_id: userId, type: "fast_trade" } },
                });
                const currentBalance = currentAccount ? currentAccount.balance : new library_1.Decimal(0);
                this.ensureSufficientBalance(currentBalance, totalDeduction);
                const updatedAccount = yield tx.accountBalance.update({
                    where: { user_id_type: { user_id: userId, type: "fast_trade" } },
                    data: {
                        balance: {
                            decrement: totalDeduction,
                        },
                    },
                });
                const tradeRecord = yield tx.trade.create({
                    data: {
                        user_id: userId,
                        symbol: normalizedSymbol,
                        type: "option",
                        market_type: marketType,
                        direction: payload.direction,
                        amount,
                        entry_price: entryPrice,
                        fee,
                    },
                });
                yield tx.tradeOption.create({
                    data: {
                        trade_id: tradeRecord.id,
                        duration: payload.duration,
                        return_rate: new library_1.Decimal(rule.returnRate),
                        expected_return: expectedReturn,
                    },
                });
                const balanceAfterAmount = updatedAccount.balance.add(fee);
                yield tx.transaction.createMany({
                    data: [
                        {
                            user_id: userId,
                            trade_id: tradeRecord.id,
                            type: "trade_amount",
                            amount: amount.neg(),
                            balance: balanceAfterAmount,
                            description: `Amount for ${payload.direction} option trade on ${normalizedSymbol}`,
                        },
                        {
                            user_id: userId,
                            trade_id: tradeRecord.id,
                            type: "fee",
                            amount: fee.neg(),
                            balance: updatedAccount.balance,
                            description: `Fee for ${payload.direction} option trade on ${normalizedSymbol}`,
                        },
                    ],
                });
                return tradeRecord.id;
            }));
            return this.loadTrade(trade);
        });
    }
    createContractTrade(userId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const userAccount = yield prisma_1.default.accountBalance.findUnique({
                where: { user_id_type: { user_id: userId, type: "trading" } },
            });
            const tradingBalance = userAccount ? userAccount.balance : new library_1.Decimal(0);
            this.validateContractTradeData(tradingBalance, payload);
            const marketType = payload.marketType
                ? this.normalizeMarketType(payload.marketType, payload.symbol)
                : this.normalizeMarketTypeBySymbol(payload.symbol);
            const { symbol: formattedSymbol, price: entryPrice } = yield this.getSymbolAndPrice(payload.symbol, marketType);
            const amount = new library_1.Decimal(payload.amount);
            const fee = amount.mul(TRANSACTION_FEE_RATE);
            const totalDeduction = amount.add(fee);
            const leverage = new library_1.Decimal(payload.leverage);
            const quantity = amount.mul(leverage).div(entryPrice);
            const liquidationPrice = this.calculateLiquidationPrice(entryPrice, payload.direction, leverage);
            const takeProfit = payload.takeProfit
                ? new library_1.Decimal(payload.takeProfit)
                : null;
            const stopLoss = payload.stopLoss ? new library_1.Decimal(payload.stopLoss) : null;
            const trade = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const currentAccount = yield tx.accountBalance.findUnique({
                    where: { user_id_type: { user_id: userId, type: "trading" } },
                });
                const currentBalance = currentAccount ? currentAccount.balance : new library_1.Decimal(0);
                this.ensureSufficientBalance(currentBalance, totalDeduction);
                const updatedAccount = yield tx.accountBalance.update({
                    where: { user_id_type: { user_id: userId, type: "trading" } },
                    data: { balance: { decrement: totalDeduction } },
                });
                const tradeRecord = yield tx.trade.create({
                    data: {
                        user_id: userId,
                        symbol: formattedSymbol,
                        type: "contract",
                        market_type: marketType,
                        direction: payload.direction,
                        amount,
                        entry_price: entryPrice,
                        fee,
                    },
                });
                yield tx.tradeContract.create({
                    data: {
                        trade_id: tradeRecord.id,
                        quantity,
                        leverage: payload.leverage,
                        liquidation_price: liquidationPrice,
                        take_profit: takeProfit,
                        stop_loss: stopLoss,
                    },
                });
                const balanceAfterAmount = updatedAccount.balance.add(fee);
                yield tx.transaction.createMany({
                    data: [
                        {
                            user_id: userId,
                            trade_id: tradeRecord.id,
                            type: "trade_amount",
                            amount: amount.neg(),
                            balance: balanceAfterAmount,
                            description: `Amount for ${payload.direction} contract trade on ${formattedSymbol} with ${payload.leverage}x leverage`,
                        },
                        {
                            user_id: userId,
                            trade_id: tradeRecord.id,
                            type: "fee",
                            amount: fee.neg(),
                            balance: updatedAccount.balance,
                            description: `Fee for ${payload.direction} contract trade on ${formattedSymbol}`,
                        },
                    ],
                });
                return tradeRecord.id;
            }));
            return this.loadTrade(trade);
        });
    }
    createSpotTrade(userId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fromCoin, toCoin } = this.resolveSpotCoins(payload);
            const formattedSymbol = this.marketData.formatSymbolForBinance(payload.symbol);
            const marketType = this.normalizeMarketType(payload.marketType || payload.market_type, payload.symbol);
            let exchangeRate;
            let marketPrice;
            if (payload.exchangeRate && payload.exchangeRate > 0) {
                marketPrice = new library_1.Decimal(payload.exchangeRate);
                if (marketType === "metals") {
                    exchangeRate = new library_1.Decimal(1).div(marketPrice);
                } else {
                    exchangeRate = marketPrice;
                }
            }
            else if (marketType === "metals") {
                try {
                    const normalizedSymbol = payload.symbol.trim().toUpperCase();
                    const priceInfo = yield this.marketService.getCurrentPrice(normalizedSymbol, "metals");
                    marketPrice = new library_1.Decimal(priceInfo.price);
                    exchangeRate = new library_1.Decimal(1).div(marketPrice);
                }
                catch (_a) {
                    try {
                        const rateInfo = yield this.marketData.getExchangeRate(fromCoin, toCoin);
                        exchangeRate = rateInfo.exchangeRate;
                        marketPrice = rateInfo.marketPrice;
                    } catch (_c) {
                        if (payload.exchangeRate && payload.exchangeRate > 0) {
                            marketPrice = new library_1.Decimal(payload.exchangeRate);
                            exchangeRate = new library_1.Decimal(1).div(marketPrice);
                        } else {
                            throw new Error(`Unable to fetch exchange rate for ${fromCoin}/${toCoin}`);
                        }
                    }
                }
            }
            else {
                try {
                    const rateInfo = yield this.marketData.getExchangeRate(fromCoin, toCoin);
                    exchangeRate = rateInfo.exchangeRate;
                    marketPrice = rateInfo.marketPrice;
                }
                catch (_b) {
                    if (payload.exchangeRate && payload.exchangeRate > 0) {
                        exchangeRate = new library_1.Decimal(payload.exchangeRate);
                        marketPrice = new library_1.Decimal(payload.exchangeRate);
                    }
                    else {
                        throw new Error(`Unable to fetch exchange rate for ${fromCoin}/${toCoin}`);
                    }
                }
            }
            const amount = new library_1.Decimal(payload.amount);
            const fee = amount.mul(TRANSACTION_FEE_RATE);
            const quantity = amount.mul(exchangeRate);
            const tradeId = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                let updatedBalance;
                const pendingTransactions = [];
                if (fromCoin === "USDT") {
                    const account = yield tx.accountBalance.findUnique({
                        where: { user_id_type: { user_id: userId, type: "spot" } },
                    });
                    const spotBalance = account ? account.balance : new library_1.Decimal(0);
                    this.ensureSufficientBalance(spotBalance, amount.add(fee));
                    const totalDeduction = amount.add(fee);
                    const updatedAccount = yield tx.accountBalance.update({
                        where: { user_id_type: { user_id: userId, type: "spot" } },
                        data: { balance: { decrement: totalDeduction } },
                    });
                    updatedBalance = updatedAccount.balance;
                    const balanceAfterAmount = updatedAccount.balance.add(fee);
                    pendingTransactions.push({
                        user_id: userId,
                        trade_id: null,
                        type: "trade_amount",
                        amount: amount.neg(),
                        balance: balanceAfterAmount,
                        currency: fromCoin,
                        description: `Amount for ${payload.direction} spot trade ${fromCoin} to ${toCoin}`,
                    }, {
                        user_id: userId,
                        trade_id: null,
                        type: "fee",
                        amount: fee.neg(),
                        balance: updatedAccount.balance,
                        currency: fromCoin,
                        description: `Fee for ${payload.direction} spot trade ${fromCoin} to ${toCoin}`,
                    });
                }
                else {
                    const totalDeduction = amount.add(fee);
                    yield this.decreaseAsset(tx, userId, fromCoin, totalDeduction);
                    pendingTransactions.push({
                        user_id: userId,
                        trade_id: null,
                        type: "fee",
                        amount: fee.neg(),
                        balance: new library_1.Decimal(0),
                        currency: fromCoin,
                        description: `Fee for ${payload.direction} spot trade ${fromCoin} to ${toCoin}`,
                    });
                }
                const tradeRecord = yield tx.trade.create({
                    data: {
                        user_id: userId,
                        symbol: formattedSymbol,
                        type: "spot",
                        market_type: marketType,
                        direction: payload.direction,
                        amount,
                        entry_price: marketPrice,
                        fee,
                        exchange_rate: exchangeRate,
                        from_coin: fromCoin,
                        to_coin: toCoin,
                    },
                });
                yield tx.tradeSpot.create({
                    data: {
                        trade_id: tradeRecord.id,
                        quantity,
                        market_price: marketPrice,
                        exchange_rate: exchangeRate,
                        from_coin: fromCoin,
                        to_coin: toCoin,
                    },
                });
                yield this.increaseAsset(tx, userId, toCoin, quantity, marketPrice);
                yield tx.trade.update({
                    where: { id: tradeRecord.id },
                    data: {
                        status: "closed",
                        exit_price: marketPrice,
                        closed_at: new Date(),
                    },
                });
                if (pendingTransactions.length > 0) {
                    yield tx.transaction.createMany({
                        data: pendingTransactions.map((transaction) => (Object.assign(Object.assign({}, transaction), { trade_id: tradeRecord.id }))),
                    });
                }
                return tradeRecord.id;
            }));
            return this.loadTrade(tradeId);
        });
    }
    createStockTrade(userId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const shares = new library_1.Decimal(payload.shares);
            if (shares.lte(0)) {
                throw new Error("Shares must be greater than zero");
            }
            const direction = payload.direction === "sell" ? "sell" : "buy";
            const normalizedSymbol = payload.symbol.trim().toUpperCase();
            let quote;
            try {
                quote = yield this.stockData.getQuote(payload.symbol);
            }
            catch (quoteError) {
                if (payload.exchangeRate && payload.exchangeRate > 0) {
                    quote = {
                        symbol: normalizedSymbol,
                        price: new library_1.Decimal(payload.exchangeRate),
                        open: new library_1.Decimal(payload.exchangeRate),
                        high: new library_1.Decimal(payload.exchangeRate),
                        low: new library_1.Decimal(payload.exchangeRate),
                        previousClose: new library_1.Decimal(payload.exchangeRate),
                        timestamp: new Date(),
                        currency: "USD",
                        name: normalizedSymbol,
                        exchange: null,
                    };
                }
                else {
                    throw quoteError;
                }
            }
            const tradeAmount = shares.mul(quote.price);
            const fee = tradeAmount.mul(TRANSACTION_FEE_RATE);
            const currency = (_a = quote.currency) !== null && _a !== void 0 ? _a : "USD";
            const action = direction === "buy" ? "purchase" : "sale";
            const baseDescription = `${shares.toString()} share${shares.eq(1) ? "" : "s"} of ${quote.symbol} at ${quote.price.toFixed(2)} ${currency}`;
            const tradeId = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                if (direction === "buy") {
                    const account = yield tx.accountBalance.findUnique({
                        where: { user_id_type: { user_id: userId, type: "fast_trade" } },
                    });
                    const accountBalance = account ? account.balance : new library_1.Decimal(0);
                    const totalDeduction = tradeAmount.add(fee);
                    this.ensureSufficientBalance(accountBalance, totalDeduction);
                    const updatedAccount = yield tx.accountBalance.update({
                        where: { user_id_type: { user_id: userId, type: "fast_trade" } },
                        data: {
                            balance: {
                                decrement: totalDeduction,
                            },
                        },
                    });
                    const tradeRecord = yield tx.trade.create({
                        data: {
                            user_id: userId,
                            symbol: quote.symbol,
                            type: "stock",
                            direction,
                            amount: tradeAmount,
                            entry_price: quote.price,
                            fee,
                            from_coin: currency,
                            to_coin: quote.symbol,
                            status: "closed",
                        },
                    });
                    yield tx.tradeSpot.create({
                        data: {
                            trade_id: tradeRecord.id,
                            quantity: shares,
                            market_price: quote.price,
                            from_coin: currency,
                            to_coin: quote.symbol,
                        },
                    });
                    yield this.increaseAsset(tx, userId, quote.symbol, shares, quote.price);
                    const balanceAfterAmount = updatedAccount.balance.add(fee);
                    const transactions = [
                        {
                            user_id: userId,
                            trade_id: tradeRecord.id,
                            type: "trade_amount",
                            amount: tradeAmount.mul(-1),
                            currency,
                            balance: balanceAfterAmount,
                            description: `Stock ${action}: ${baseDescription}`,
                        },
                    ];
                    if (fee.gt(0)) {
                        transactions.push({
                            user_id: userId,
                            trade_id: tradeRecord.id,
                            type: "fee",
                            amount: fee.mul(-1),
                            currency,
                            balance: updatedAccount.balance,
                            description: `Stock trade fee for ${quote.symbol}`,
                        });
                    }
                    yield tx.transaction.createMany({ data: transactions });
                    return tradeRecord.id;
                }
                yield this.decreaseAsset(tx, userId, quote.symbol, shares);
                const sellAccount = yield tx.accountBalance.findUnique({
                    where: { user_id_type: { user_id: userId, type: "fast_trade" } },
                });
                const beforeBalance = sellAccount ? sellAccount.balance : new library_1.Decimal(0);
                const updatedSellAccount = yield tx.accountBalance.update({
                    where: { user_id_type: { user_id: userId, type: "fast_trade" } },
                    data: {
                        balance: {
                            increment: tradeAmount,
                        },
                    },
                });
                const tradeRecord = yield tx.trade.create({
                    data: {
                        user_id: userId,
                        symbol: quote.symbol,
                        type: "stock",
                        direction,
                        amount: tradeAmount,
                        entry_price: quote.price,
                        fee,
                        from_coin: quote.symbol,
                        to_coin: currency,
                        status: "closed",
                        pnl: tradeAmount.sub(fee),
                    },
                });
                yield tx.tradeSpot.create({
                    data: {
                        trade_id: tradeRecord.id,
                        quantity: shares,
                        market_price: quote.price,
                        from_coin: quote.symbol,
                        to_coin: currency,
                    },
                });
                let finalBalance = updatedSellAccount.balance;
                if (fee.gt(0)) {
                    const afterFee = yield tx.accountBalance.update({
                        where: { user_id_type: { user_id: userId, type: "fast_trade" } },
                        data: {
                            balance: {
                                decrement: fee,
                            },
                        },
                    });
                    finalBalance = afterFee.balance;
                }
                const transactions = [
                    {
                        user_id: userId,
                        trade_id: tradeRecord.id,
                        type: "trade_amount",
                        amount: tradeAmount,
                        currency,
                        balance: updatedSellAccount.balance,
                        description: `Stock ${action}: ${baseDescription}`,
                    },
                ];
                if (fee.gt(0)) {
                    transactions.push({
                        user_id: userId,
                        trade_id: tradeRecord.id,
                        type: "fee",
                        amount: fee.mul(-1),
                        currency,
                        balance: finalBalance,
                        description: `Stock trade fee for ${quote.symbol}`,
                    });
                }
                yield tx.transaction.createMany({ data: transactions });
                return tradeRecord.id;
            }));
            return this.loadTrade(tradeId);
        });
    }
    getUserTrades(userId, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const where = this.buildTradeWhere(Object.assign(Object.assign({}, filters), { userId }));
            const page = filters.page && filters.page > 0 ? filters.page : 1;
            const perPage = filters.perPage && filters.perPage > 0 ? filters.perPage : 15;
            const skip = (page - 1) * perPage;
            const orderByField = (_a = filters.sortBy) !== null && _a !== void 0 ? _a : "created_at";
            const orderByDirection = (_b = filters.sortDir) !== null && _b !== void 0 ? _b : "desc";
            const [total, trades] = yield prisma_1.default.$transaction([
                prisma_1.default.trade.count({ where }),
                prisma_1.default.trade.findMany({
                    where,
                    include: tradeInclude,
                    orderBy: { [orderByField]: orderByDirection },
                    skip,
                    take: perPage,
                }),
            ]);
            return {
                data: trades.map((trade) => this.mapTrade(trade)),
                meta: {
                    page,
                    perPage,
                    total,
                    totalPages: Math.ceil(total / perPage),
                },
            };
        });
    }
    getAllTrades(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const where = this.buildTradeWhere(filters);
            const page = filters.page && filters.page > 0 ? filters.page : 1;
            const perPage = filters.perPage && filters.perPage > 0 ? filters.perPage : 15;
            const skip = (page - 1) * perPage;
            const orderByField = (_a = filters.sortBy) !== null && _a !== void 0 ? _a : "created_at";
            const orderByDirection = (_b = filters.sortDir) !== null && _b !== void 0 ? _b : "desc";
            const [total, trades] = yield prisma_1.default.$transaction([
                prisma_1.default.trade.count({ where }),
                prisma_1.default.trade.findMany({
                    where,
                    include: Object.assign(Object.assign({}, tradeInclude), { user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            },
                        } }),
                    orderBy: { [orderByField]: orderByDirection },
                    skip,
                    take: perPage,
                }),
            ]);
            return {
                data: trades.map((trade) => this.mapTrade(trade)),
                meta: {
                    page,
                    perPage,
                    total,
                    totalPages: Math.ceil(total / perPage),
                },
            };
        });
    }
    getAdminTrade(tradeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const trade = yield prisma_1.default.trade.findUnique({
                where: { id: tradeId },
                include: Object.assign(Object.assign({}, tradeInclude), { user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    } }),
            });
            return trade ? this.mapTrade(trade) : null;
        });
    }
    getTrade(userId, tradeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const trade = yield prisma_1.default.trade.findFirst({
                where: {
                    id: tradeId,
                    user_id: userId,
                },
                include: tradeInclude,
            });
            if (!trade) {
                return null;
            }
            return this.mapTrade(trade);
        });
    }
    getTradeStats(userId, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {
                user_id: userId,
            };
            if (filters.dateFrom || filters.dateTo) {
                where.created_at = {};
                if (filters.dateFrom) {
                    where.created_at.gte = new Date(filters.dateFrom);
                }
                if (filters.dateTo) {
                    where.created_at.lte = new Date(filters.dateTo);
                }
            }
            const trades = yield prisma_1.default.trade.findMany({
                where,
                select: {
                    id: true,
                    type: true,
                    status: true,
                    result: true,
                    amount: true,
                    pnl: true,
                    fee: true,
                },
            });
            const overview = {
                totalTrades: trades.length,
                openTrades: trades.filter((t) => t.status === "open").length,
                closedTrades: trades.filter((t) => t.status === "closed").length,
                wonTrades: trades.filter((t) => t.result === "won").length,
                lostTrades: trades.filter((t) => t.result === "lost").length,
                totalPnl: trades.reduce((acc, trade) => acc.add(trade.pnl), new library_1.Decimal(0)),
                totalInvested: trades.reduce((acc, trade) => acc.add(trade.amount), new library_1.Decimal(0)),
                totalFees: trades.reduce((acc, trade) => acc.add(trade.fee), new library_1.Decimal(0)),
            };
            const winRate = overview.closedTrades > 0
                ? (overview.wonTrades / overview.closedTrades) * 100
                : 0;
            const roi = overview.totalInvested.gt(0)
                ? overview.totalPnl.div(overview.totalInvested).mul(100).toNumber()
                : 0;
            const byType = trades.reduce((acc, trade) => {
                if (!acc[trade.type]) {
                    acc[trade.type] = {
                        count: 0,
                        totalInvested: new library_1.Decimal(0),
                        totalPnl: new library_1.Decimal(0),
                        wins: 0,
                        losses: 0,
                    };
                }
                acc[trade.type].count += 1;
                acc[trade.type].totalInvested = acc[trade.type].totalInvested.add(trade.amount);
                acc[trade.type].totalPnl = acc[trade.type].totalPnl.add(trade.pnl);
                if (trade.result === "won") {
                    acc[trade.type].wins += 1;
                }
                if (trade.result === "lost") {
                    acc[trade.type].losses += 1;
                }
                return acc;
            }, {});
            return {
                overview: {
                    total_trades: overview.totalTrades,
                    open_trades: overview.openTrades,
                    closed_trades: overview.closedTrades,
                    won_trades: overview.wonTrades,
                    lost_trades: overview.lostTrades,
                    win_rate: Number(winRate.toFixed(2)),
                    total_pnl: overview.totalPnl,
                    total_invested: overview.totalInvested,
                    total_fees: overview.totalFees,
                    roi,
                },
                by_type: Object.entries(byType).map(([type, stats]) => (Object.assign({ type }, stats))),
            };
        });
    }
    cancelTrade(userId, tradeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const trade = yield tx.trade.findUnique({
                    where: { id: tradeId },
                    include: tradeInclude,
                });
                if (!trade || trade.user_id !== userId || trade.status !== "open") {
                    return null;
                }
                yield tx.trade.update({
                    where: { id: tradeId },
                    data: {
                        status: "canceled",
                        closed_at: new Date(),
                    },
                });
                let newBalance;
                if (trade.type === "option") {
                    const updatedAccount = yield tx.accountBalance.update({
                        where: { user_id_type: { user_id: userId, type: "fast_trade" } },
                        data: { balance: { increment: trade.amount } },
                    });
                    newBalance = updatedAccount.balance;
                } else {
                    const updatedUser = yield tx.user.update({
                        where: { id: userId },
                        data: { balance: { increment: trade.amount } },
                        select: { balance: true },
                    });
                    newBalance = updatedUser.balance;
                }
                yield tx.transaction.create({
                    data: {
                        user_id: userId,
                        trade_id: tradeId,
                        type: "trade_cancel",
                        amount: trade.amount,
                        balance: newBalance,
                        description: `Refund for canceled ${trade.direction} trade on ${trade.symbol}`,
                    },
                });
                return tradeId;
            }));
            return result ? this.loadTrade(result) : null;
        });
    }
    autoResolveTrade(tradeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const logContext = { tradeId: tradeId.toString() };
            logger_1.logger.debug("Attempting auto-resolve for trade", logContext);
            const evaluation = yield this.evaluateTradeForAutomation(tradeId);
            if (!evaluation) {
                logger_1.logger.info("Auto-resolve skipped: trade no longer open", logContext);
                return null;
            }
            const { trade, finalResult, currentPrice } = evaluation;
            if (trade.type === "spot" || !finalResult) {
                logger_1.logger.debug("Auto-resolve not applicable for trade", Object.assign(Object.assign({}, logContext), { type: trade.type, hasFinalResult: Boolean(finalResult) }));
                return null;
            }
            yield this.resolveTrade(trade.id, finalResult, undefined, currentPrice);
            logger_1.logger.info("Auto-resolve completed", Object.assign(Object.assign({}, logContext), { result: finalResult }));
            return finalResult;
        });
    }
    evaluateContractTrade(tradeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const evaluation = yield this.evaluateTradeForAutomation(tradeId);
            if (!evaluation) {
                return { shouldContinue: false };
            }
            const { trade, finalResult, currentPrice } = evaluation;
            if (trade.type !== "contract") {
                return { shouldContinue: false };
            }
            if (finalResult) {
                yield this.resolveTrade(trade.id, finalResult, undefined, currentPrice);
                return { shouldContinue: false, resolved: true };
            }
            if (!currentPrice) {
                return { shouldContinue: false };
            }
            const interval = this.determineContractCheckInterval(trade, currentPrice);
            return { shouldContinue: true, interval };
        });
    }
    resolveTrade(tradeId, requestedResult, adminId, exitPrice) {
        return __awaiter(this, void 0, void 0, function* () {
            const finalTradeId = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const trade = yield tx.trade.findUnique({
                    where: { id: tradeId },
                    include: tradeInclude,
                });
                if (!trade) {
                    throw new Error("Trade not found");
                }
                if (trade.status !== "open") {
                    throw new Error(`Trade is already ${trade.status} and cannot be resolved`);
                }
                if (!["won", "lost"].includes(requestedResult)) {
                    throw new Error("Invalid trade result");
                }
                const profile = yield tx.profile.findFirst({
                    where: { user_id: trade.user_id },
                    orderBy: { created_at: "desc" },
                    select: { trade_status: true },
                });
                const overriddenResult = this.mapProfileTradeStatus(profile === null || profile === void 0 ? void 0 : profile.trade_status);
                const finalResult = (overriddenResult !== null && overriddenResult !== void 0 ? overriddenResult : requestedResult);
                const marketType = trade.market_type || this.normalizeMarketTypeBySymbol(trade.symbol);
                let priceResult;
                if (exitPrice === undefined) {
                    priceResult = yield this.getSymbolAndPrice(trade.symbol, marketType);
                } else {
                    priceResult = { price: exitPrice };
                }
                const { price: finalExitPrice } = priceResult;
                const pnl = this.calculatePnl(trade, finalResult, finalExitPrice);
                yield tx.trade.update({
                    where: { id: tradeId },
                    data: {
                        status: "closed",
                        result: finalResult,
                        exit_price: finalExitPrice,
                        pnl,
                        closed_at: new Date(),
                        closed_by: adminId !== null && adminId !== void 0 ? adminId : null,
                    },
                });
                if (finalResult === "won") {
                    const winAmount = this.calculateWinAmount(trade, pnl);
                    if (winAmount.gt(0)) {
                        let newBalance;
                        if (trade.type === "option") {
                            const updatedAccount = yield tx.accountBalance.update({
                                where: { user_id_type: { user_id: trade.user_id, type: "fast_trade" } },
                                data: { balance: { increment: winAmount } },
                            });
                            newBalance = updatedAccount.balance;
                        } else {
                            const accountType = trade.type === "contract" ? "trading" : "fast_trade";
                            const updatedAccount = yield tx.accountBalance.update({
                                where: { user_id_type: { user_id: trade.user_id, type: accountType } },
                                data: { balance: { increment: winAmount } },
                            });
                            newBalance = updatedAccount.balance;
                        }
                        yield tx.transaction.create({
                            data: {
                                user_id: trade.user_id,
                                trade_id: tradeId,
                                type: "trade_win",
                                amount: winAmount,
                                balance: newBalance,
                                description: `Won ${trade.direction} trade on ${trade.symbol}`,
                            },
                        });
                    }
                }
                return tradeId;
            }));
            return this.loadTrade(finalTradeId, { includeUser: true });
        });
    }
    cancelTradeByAdmin(tradeId, adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            const tradeIdResult = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const trade = yield tx.trade.findUnique({
                    where: { id: tradeId },
                    include: tradeInclude,
                });
                if (!trade) {
                    throw new Error("Trade not found");
                }
                if (trade.status !== "open") {
                    throw new Error(`Trade is already ${trade.status} and cannot be canceled`);
                }
                let newBalance;
                if (trade.type === "option") {
                    const updatedAccount = yield tx.accountBalance.update({
                        where: { user_id_type: { user_id: trade.user_id, type: "fast_trade" } },
                        data: { balance: { increment: trade.amount } },
                    });
                    newBalance = updatedAccount.balance;
                } else {
                    const updatedUser = yield tx.user.update({
                        where: { id: trade.user_id },
                        data: { balance: { increment: trade.amount } },
                        select: { balance: true },
                    });
                    newBalance = updatedUser.balance;
                }
                yield tx.trade.update({
                    where: { id: tradeId },
                    data: {
                        status: "canceled",
                        closed_at: new Date(),
                        closed_by: adminId !== null && adminId !== void 0 ? adminId : null,
                    },
                });
                yield tx.transaction.create({
                    data: {
                        user_id: trade.user_id,
                        trade_id: tradeId,
                        type: "trade_cancel",
                        amount: trade.amount,
                        balance: newBalance,
                        description: `Refund for canceled ${trade.direction} trade on ${trade.symbol}`,
                    },
                });
                return tradeId;
            }));
            return this.loadTrade(tradeIdResult, { includeUser: true });
        });
    }
    getAdminTradeStats() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const [totalTrades, openTrades, closedTrades, wonTrades, lostTrades, amountAggregate, feeAggregate, pnlAggregate, byTypeAggregate, winsByType, lossesByType, topUsersRaw, winsByUser, lossesByUser,] = yield Promise.all([
                prisma_1.default.trade.count(),
                prisma_1.default.trade.count({ where: { status: "open" } }),
                prisma_1.default.trade.count({ where: { status: "closed" } }),
                prisma_1.default.trade.count({ where: { result: "won" } }),
                prisma_1.default.trade.count({ where: { result: "lost" } }),
                prisma_1.default.trade.aggregate({ _sum: { amount: true } }),
                prisma_1.default.trade.aggregate({ _sum: { fee: true } }),
                prisma_1.default.trade.aggregate({
                    where: { status: "closed" },
                    _sum: { pnl: true },
                }),
                prisma_1.default.trade.groupBy({
                    by: ["type"],
                    _count: { _all: true },
                    _sum: { amount: true, fee: true, pnl: true },
                }),
                prisma_1.default.trade.groupBy({
                    by: ["type"],
                    where: { result: "won" },
                    _count: { _all: true },
                }),
                prisma_1.default.trade.groupBy({
                    by: ["type"],
                    where: { result: "lost" },
                    _count: { _all: true },
                }),
                prisma_1.default.trade.groupBy({
                    by: ["user_id"],
                    _count: { _all: true },
                    _sum: { amount: true, fee: true, pnl: true },
                    orderBy: { _sum: { amount: "desc" } },
                    take: 10,
                }),
                prisma_1.default.trade.groupBy({
                    by: ["user_id"],
                    where: { result: "won" },
                    _count: { _all: true },
                }),
                prisma_1.default.trade.groupBy({
                    by: ["user_id"],
                    where: { result: "lost" },
                    _count: { _all: true },
                }),
            ]);
            const winsByTypeMap = new Map(winsByType.map((item) => [item.type, item._count._all]));
            const lossesByTypeMap = new Map(lossesByType.map((item) => [item.type, item._count._all]));
            const byType = byTypeAggregate.map((item) => {
                var _a, _b, _c, _d, _e;
                return ({
                    type: item.type,
                    count: item._count._all,
                    totalInvested: (_a = item._sum.amount) !== null && _a !== void 0 ? _a : new library_1.Decimal(0),
                    totalFees: (_b = item._sum.fee) !== null && _b !== void 0 ? _b : new library_1.Decimal(0),
                    totalPnl: (_c = item._sum.pnl) !== null && _c !== void 0 ? _c : new library_1.Decimal(0),
                    wins: (_d = winsByTypeMap.get(item.type)) !== null && _d !== void 0 ? _d : 0,
                    losses: (_e = lossesByTypeMap.get(item.type)) !== null && _e !== void 0 ? _e : 0,
                });
            });
            const topUserIds = topUsersRaw.map((item) => item.user_id);
            const users = yield prisma_1.default.user.findMany({
                where: { id: { in: topUserIds } },
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            });
            const userMap = new Map(users.map((user) => [user.id, user]));
            const winsByUserMap = new Map(winsByUser.map((item) => [item.user_id, item._count._all]));
            const lossesByUserMap = new Map(lossesByUser.map((item) => [item.user_id, item._count._all]));
            const topUsers = topUsersRaw
                .map((item) => ({
                user: userMap.get(item.user_id),
                data: item,
            }))
                .filter((entry) => entry.user)
                .map((entry) => {
                var _a, _b, _c, _d, _e;
                return ({
                    id: entry.user.id,
                    name: entry.user.name,
                    email: entry.user.email,
                    trade_count: entry.data._count._all,
                    total_volume: (_a = entry.data._sum.amount) !== null && _a !== void 0 ? _a : new library_1.Decimal(0),
                    total_fees: (_b = entry.data._sum.fee) !== null && _b !== void 0 ? _b : new library_1.Decimal(0),
                    total_pnl: (_c = entry.data._sum.pnl) !== null && _c !== void 0 ? _c : new library_1.Decimal(0),
                    wins: (_d = winsByUserMap.get(entry.user.id)) !== null && _d !== void 0 ? _d : 0,
                    losses: (_e = lossesByUserMap.get(entry.user.id)) !== null && _e !== void 0 ? _e : 0,
                });
            });
            return {
                overview: {
                    total_trades: totalTrades,
                    open_trades: openTrades,
                    closed_trades: closedTrades,
                    won_trades: wonTrades,
                    lost_trades: lostTrades,
                    total_amount_invested: (_a = amountAggregate._sum.amount) !== null && _a !== void 0 ? _a : new library_1.Decimal(0),
                    total_fees_collected: (_b = feeAggregate._sum.fee) !== null && _b !== void 0 ? _b : new library_1.Decimal(0),
                    total_pnl: (_c = pnlAggregate._sum.pnl) !== null && _c !== void 0 ? _c : new library_1.Decimal(0),
                },
                by_type: byType,
                top_users: topUsers,
            };
        });
    }
    resolveAllUserTrades(userId, adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield prisma_1.default.profile.findFirst({
                where: { user_id: userId },
                orderBy: { created_at: "desc" },
                select: { trade_status: true },
            });
            const mappedResult = this.mapProfileTradeStatus(profile === null || profile === void 0 ? void 0 : profile.trade_status);
            if (!mappedResult) {
                throw new Error("User profile has no special trade status set");
            }
            const openTrades = yield prisma_1.default.trade.findMany({
                where: {
                    user_id: userId,
                    status: "open",
                },
                select: { id: true },
            });
            if (openTrades.length === 0) {
                return {
                    resolvedCount: 0,
                    result: mappedResult,
                };
            }
            let resolvedCount = 0;
            for (const trade of openTrades) {
                yield this.resolveTrade(trade.id, mappedResult, adminId);
                resolvedCount += 1;
            }
            return {
                resolvedCount,
                result: mappedResult,
            };
        });
    }
    getMarketPrice(symbol, marketType) {
        return __awaiter(this, void 0, void 0, function* () {
            const normalizedMarketType = this.normalizeMarketType(marketType, symbol);
            const { symbol: normalizedSymbol, price } = yield this.getSymbolAndPrice(symbol, normalizedMarketType);
            return {
                symbol: normalizedSymbol,
                price,
                market_type: normalizedMarketType,
            };
        });
    }
    searchStocks(query, exchange) {
        return __awaiter(this, void 0, void 0, function* () {
            const trimmed = query.trim();
            if (!trimmed) {
                return [];
            }
            return this.stockData.searchSymbols(trimmed, exchange);
        });
    }
    listPopularStocks(exchange) {
        return __awaiter(this, void 0, void 0, function* () {
            const symbols = yield this.stockData.listExchangeSymbols(exchange || "US");
            return symbols.slice(0, 50);
        });
    }
    loadTrade(tradeId, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const include = (options === null || options === void 0 ? void 0 : options.includeUser)
                ? Object.assign(Object.assign({}, tradeInclude), { user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    } }) : tradeInclude;
            const trade = yield prisma_1.default.trade.findUnique({
                where: { id: tradeId },
                include,
            });
            if (!trade) {
                throw new Error("Trade not found");
            }
            return this.mapTrade(trade);
        });
    }
    mapTrade(trade) {
        var _a, _b, _c;
        const { options, contracts, spots, user } = trade, rest = __rest(trade, ["options", "contracts", "spots", "user"]);
        return Object.assign(Object.assign(Object.assign({}, rest), { option: (_a = options[0]) !== null && _a !== void 0 ? _a : null, contract: (_b = contracts[0]) !== null && _b !== void 0 ? _b : null, spot: (_c = spots[0]) !== null && _c !== void 0 ? _c : null }), (user ? { user } : {}));
    }
    buildTradeWhere(filters) {
        const where = {};
        if (filters.userId !== undefined) {
            where.user_id = filters.userId;
        }
        if (filters.type) {
            where.type = filters.type;
        }
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.result) {
            where.result = filters.result;
        }
        if (filters.symbol) {
            where.symbol = filters.symbol;
        }
        if (filters.direction) {
            where.direction = filters.direction;
        }
        if (filters.dateFrom || filters.dateTo) {
            where.created_at = {};
            if (filters.dateFrom) {
                where.created_at.gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                where.created_at.lte = new Date(filters.dateTo);
            }
        }
        return where;
    }
    normalizeMarketType(market, symbol) {
        if (typeof market === "string") {
            const normalized = market.toLowerCase();
            if (normalized === "metals" || normalized === "metal") {
                return "metals";
            }
            if (normalized === "stocks" || normalized === "stock") {
                return "stocks";
            }
        }
        // Auto-detect from symbol if no market type provided
        if (symbol && typeof symbol === "string") {
            const sym = symbol.replace(/\/USD(T)?$/i, "").trim().toUpperCase();
            if (["XAUUSD", "XAGUSD", "XPTUSD", "XPDUSD"].includes(sym)) {
                return "metals";
            }
            if (["AAPL", "MSFT", "AMZN", "GOOGL", "TSLA", "NVDA", "META", "NFLX", "AMD", "INTC", "BABA", "BA", "DIS", "V", "JPM", "GS", "PYPL", "SQ", "COIN", "UBER", "SNAP", "PINS", "ROKU", "SHOP", "SPOT", "ZM", "DKNG", "PLTR", "SOFI", "NIO", "RIVN", "MARA", "RIOT", "HOOD", "RBLX", "ABNB", "NET", "CRWD", "ZS", "DDOG", "SNOW", "NOW", "ISRG", "PFE", "JNJ", "LLY", "ABBV", "AMGN", "GILD"].includes(sym)) {
                return "stocks";
            }
        }
        return "crypto";
    }
    normalizeMarketTypeBySymbol(symbol) {
        if (typeof symbol === "string" &&
            ["XAUUSD", "XAGUSD", "XPTUSD", "XPDUSD"].includes(symbol.toUpperCase())) {
            return "metals";
        }
        if (typeof symbol === "string" &&
            [
                "AAPL", "MSFT", "AMZN", "GOOGL", "TSLA", "NVDA", "META", "NFLX",
                "AMD", "INTC", "BABA", "BA", "DIS", "V", "JPM", "GS", "PYPL", "SQ",
                "COIN", "UBER", "SNAP", "PINS", "ROKU", "SHOP", "SPOT", "ZM",
                "DKNG", "PLTR", "SOFI", "NIO", "RIVN", "MARA", "RIOT", "HOOD",
                "RBLX", "ABNB", "NET", "CRWD", "ZS", "DDOG", "SNOW", "NOW",
                "ISRG", "PFE", "JNJ", "LLY", "ABBV", "AMGN", "GILD",
            ].includes(symbol.toUpperCase())) {
            return "stocks";
        }
        return "crypto";
    }
    getSymbolAndPrice(symbol, marketType) {
        return __awaiter(this, void 0, void 0, function* () {
            const cleanSymbol = (symbol || "").replace(/\/USD(T)?$/i, "").trim().toUpperCase();
            console.log(`Getting price for symbol: ${cleanSymbol} (original: ${symbol}) in market type: ${marketType}`);

            // In-memory price cache (30s TTL)
            const cacheKey = `price:${cleanSymbol}:${marketType}`;
            const cached = this._priceCache && this._priceCache[cacheKey];
            if (cached && Date.now() - cached.ts < 30000) {
                console.log(`Using cached price for ${cleanSymbol}: ${cached.price}`);
                return { symbol: cleanSymbol, price: cached.price };
            }

            const setCache = (price) => {
                if (!this._priceCache) this._priceCache = {};
                this._priceCache[cacheKey] = { price, ts: Date.now() };
            };

            // ── METALS ──
            if (marketType === "metals") {
                try {
                    const { price } = yield this.marketService.getCurrentPrice(cleanSymbol, "metals");
                    setCache(price);
                    return { symbol: cleanSymbol, price };
                } catch (e) {
                    logger_1.logger.warn(`metal price fetch failed for ${cleanSymbol}: ${e.message}`);
                }
                // Fallback: Gold API direct
                try {
                    const axios = require("axios");
                    const metalCode = { XAUUSD: "XAU", XAGUSD: "XAG", XPTUSD: "XPT", XPDUSD: "XPD" }[cleanSymbol];
                    if (metalCode) {
                        const res = yield axios.get(`https://api.gold-api.com/price/${metalCode}`, { timeout: 10000 });
                        if (res.data && typeof res.data.price === "number" && res.data.price > 0) {
                            const price = new library_1.Decimal(res.data.price);
                            setCache(price);
                            return { symbol: cleanSymbol, price };
                        }
                    }
                } catch (e) {
                    logger_1.logger.warn(`Gold API fallback failed for ${cleanSymbol}: ${e.message}`);
                }
                // Fallback: use cache even if stale
                if (cached) {
                    return { symbol: cleanSymbol, price: cached.price };
                }
                // Fallback: hardcoded prices
                const METAL_PRICES = {
                    XAUUSD: 4122, XAGUSD: 60, XPTUSD: 1634, XPDUSD: 1282,
                };
                if (METAL_PRICES[cleanSymbol]) {
                    const price = new library_1.Decimal(METAL_PRICES[cleanSymbol]);
                    setCache(price);
                    return { symbol: cleanSymbol, price };
                }
                throw new Error(`Unable to fetch metal price for ${cleanSymbol}`);
            }

            // ── STOCKS ──
            if (marketType === "stocks") {
                try {
                    const quote = yield this.stockData.getQuote(cleanSymbol);
                    const price = new library_1.Decimal(quote.price);
                    setCache(price);
                    return { symbol: cleanSymbol, price };
                } catch (e) {
                    logger_1.logger.warn(`StockService failed for ${cleanSymbol}: ${e.message}`);
                }
                // Fallback: MarketData.app
                try {
                    const axios = require("axios");
                    const res = yield axios.get(`https://api.marketdata.app/v1/stocks/quotes/${cleanSymbol}/`, { timeout: 10000 });
                    const data = res.data;
                    if (data.s === "ok" && Array.isArray(data.last) && data.last.length > 0) {
                        const price = new library_1.Decimal(data.last[0]);
                        if (price.gt(0)) {
                            setCache(price);
                            return { symbol: cleanSymbol, price };
                        }
                    }
                } catch (e) {
                    logger_1.logger.warn(`MarketData.app fallback failed for ${cleanSymbol}: ${e.message}`);
                }
                // Fallback: use cache even if stale
                if (cached) {
                    return { symbol: cleanSymbol, price: cached.price };
                }
                // Fallback: hardcoded prices
                const STOCK_PRICES = {
                    AAPL: 315, TSLA: 408, NVDA: 211, MSFT: 385, AMZN: 245, GOOGL: 357, META: 669,
                };
                if (STOCK_PRICES[cleanSymbol]) {
                    const price = new library_1.Decimal(STOCK_PRICES[cleanSymbol]);
                    setCache(price);
                    return { symbol: cleanSymbol, price };
                }
                throw new Error(`Unable to fetch stock price for ${cleanSymbol}`);
            }

            // ── CRYPTO ──
            const normalizedSymbol = this.marketData.formatSymbolForBinance(cleanSymbol);
            console.log(`Fetching price for ${normalizedSymbol} at ${new Date().toISOString()}`);
            try {
                const price = yield this.marketData.getCurrentPrice(normalizedSymbol);
                console.log(`Fetched price for ${normalizedSymbol} at ${new Date().toISOString()} price: ${price}`);
                setCache(price);
                return { symbol: normalizedSymbol, price };
            } catch (e) {
                logger_1.logger.warn(`Binance price failed for ${normalizedSymbol}: ${e.message}`);
            }
            // Fallback: use cache even if stale
            if (cached) {
                return { symbol: normalizedSymbol, price: cached.price };
            }
            // Fallback: hardcoded prices
            const CRYPTO_PRICES = {
                BTCUSDT: 118000, ETHUSDT: 3200, BNBUSDT: 680, SOLUSDT: 170,
                XRPUSDT: 2.4, DOGEUSDT: 0.24, ADAUSDT: 0.75, TRXUSDT: 0.28,
                AVAXUSDT: 35, LINKUSDT: 15, DOTUSDT: 7, MATICUSDT: 0.55,
            };
            if (CRYPTO_PRICES[normalizedSymbol]) {
                const price = new library_1.Decimal(CRYPTO_PRICES[normalizedSymbol]);
                setCache(price);
                return { symbol: normalizedSymbol, price };
            }
            throw new Error(`Unable to fetch market price for ${symbol}`);
        });
    }
    mapProfileTradeStatus(status) {
        var _a;
        if (!status || status === "normal") {
            return null;
        }
        const resultMap = {
            win: "won",
            loss: "lost",
        };
        return (_a = resultMap[status]) !== null && _a !== void 0 ? _a : null;
    }
    evaluateTradeForAutomation(tradeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const trade = yield prisma_1.default.trade.findUnique({
                where: { id: tradeId },
                include: tradeInclude,
            });
            if (!trade) {
                throw new Error("Trade not found");
            }
            if (trade.status !== "open") {
                return null;
            }
            if (trade.type === "spot") {
                return {
                    trade,
                    finalResult: null,
                    currentPrice: null,
                };
            }
            const profile = yield prisma_1.default.profile.findFirst({
                where: { user_id: trade.user_id },
                orderBy: { created_at: "desc" },
                select: { trade_status: true },
            });
            const marketType = trade.market_type || this.normalizeMarketTypeBySymbol(trade.symbol);
            const { price: currentPrice } = yield this.getSymbolAndPrice(trade.symbol, marketType);
            const overriddenResult = this.mapProfileTradeStatus(profile === null || profile === void 0 ? void 0 : profile.trade_status);
            const computedResult = this.determineAutomaticResult(trade, currentPrice);
            return {
                trade,
                finalResult: overriddenResult !== null && overriddenResult !== void 0 ? overriddenResult : computedResult,
                currentPrice,
            };
        });
    }
    determineContractCheckInterval(trade, currentPrice) {
        const DEFAULT_INTERVAL = 15;
        const FAST_INTERVAL = 5;
        const contract = trade.contracts[0];
        if (!contract) {
            return DEFAULT_INTERVAL;
        }
        let interval = DEFAULT_INTERVAL;
        if (contract.take_profit) {
            const diffPercent = contract.take_profit
                .sub(currentPrice)
                .mul(trade.direction === "buy" ? 1 : -1)
                .div(currentPrice)
                .mul(100)
                .toNumber();
            if (diffPercent >= 0 && diffPercent < 0.5) {
                interval = FAST_INTERVAL;
            }
        }
        if (contract.stop_loss) {
            const diffPercent = trade.direction === "buy"
                ? currentPrice.sub(contract.stop_loss)
                : contract.stop_loss.sub(currentPrice);
            const diffValue = diffPercent.div(currentPrice).mul(100).toNumber();
            if (diffValue >= 0 && diffValue < 0.5) {
                interval = Math.min(interval, FAST_INTERVAL);
            }
        }
        if (contract.liquidation_price) {
            const diffPercent = trade.direction === "buy"
                ? currentPrice.sub(contract.liquidation_price)
                : contract.liquidation_price.sub(currentPrice);
            const diffValue = diffPercent.div(currentPrice).mul(100).toNumber();
            if (diffValue >= 0 && diffValue < 0.5) {
                interval = Math.min(interval, FAST_INTERVAL);
            }
        }
        return interval;
    }
    determineAutomaticResult(trade, currentPrice) {
        const entryPrice = trade.entry_price;
        if (!entryPrice) {
            return null;
        }
        if (trade.type === "option") {
            if (trade.direction === "buy") {
                return currentPrice.gt(entryPrice) ? "won" : "lost";
            }
            return currentPrice.lt(entryPrice) ? "won" : "lost";
        }
        if (trade.type === "contract") {
            const contract = trade.contracts[0];
            if (!contract) {
                return null;
            }
            if (trade.direction === "buy") {
                if (contract.liquidation_price &&
                    currentPrice.lte(contract.liquidation_price)) {
                    return "lost";
                }
                if (contract.take_profit && currentPrice.gte(contract.take_profit)) {
                    return "won";
                }
                if (contract.stop_loss && currentPrice.lte(contract.stop_loss)) {
                    return "lost";
                }
                return null;
            }
            if (contract.liquidation_price &&
                currentPrice.gte(contract.liquidation_price)) {
                return "lost";
            }
            if (contract.take_profit && currentPrice.lte(contract.take_profit)) {
                return "won";
            }
            if (contract.stop_loss && currentPrice.gte(contract.stop_loss)) {
                return "lost";
            }
            return null;
        }
        if (trade.type === "spot") {
            if (trade.direction === "buy") {
                return currentPrice.gt(entryPrice) ? "won" : "lost";
            }
            return currentPrice.lt(entryPrice) ? "won" : "lost";
        }
        return null;
    }
    calculatePnl(trade, result, exitPrice) {
        var _a;
        if (result === "lost") {
            return trade.amount.neg();
        }
        if (trade.type === "option") {
            const option = trade.options[0];
            if (!option) {
                return new library_1.Decimal(0);
            }
            return option.expected_return.sub(trade.amount);
        }
        const entryPrice = trade.entry_price;
        if (!entryPrice || entryPrice.eq(0)) {
            return new library_1.Decimal(0);
        }
        let percentChange = exitPrice.sub(entryPrice).div(entryPrice).mul(100);
        if (trade.direction === "sell") {
            percentChange = percentChange.neg();
        }
        if (trade.type === "contract") {
            const contract = trade.contracts[0];
            if (!contract) {
                return new library_1.Decimal(0);
            }
            const leverage = new library_1.Decimal((_a = contract.leverage) !== null && _a !== void 0 ? _a : 1);
            return trade.amount.mul(percentChange).mul(leverage).div(100);
        }
        if (trade.type === "spot") {
            return trade.amount.mul(percentChange).div(100);
        }
        return new library_1.Decimal(0);
    }
    calculateWinAmount(trade, pnl) {
        if (trade.type === "option") {
            const option = trade.options[0];
            return option ? option.expected_return : trade.amount;
        }
        const positivePnl = pnl.gt(0) ? pnl : new library_1.Decimal(0);
        return trade.amount.add(positivePnl);
    }
    ensureSufficientBalance(balance, required) {
        if (balance.lt(required)) {
            throw new Error(`Insufficient balance. Required: ${required.toFixed(2)}, Available: ${balance.toFixed(2)}`);
        }
    }
    validateOptionTradeData(balance, payload) {
        if (!trade_rules_1.OPTION_TRADE_RULES[payload.duration]) {
            throw new Error("Invalid duration");
        }
        if (payload.amount < MIN_OPTION_TRADE_AMOUNT) {
            throw new Error(`Amount must be at least ${MIN_OPTION_TRADE_AMOUNT} for option trades`);
        }
        if (trade_rules_1.OPTION_TRADE_RULES[payload.duration].maxAmount) {
            const maxAmount = trade_rules_1.OPTION_TRADE_RULES[payload.duration].maxAmount;
            if (payload.amount > maxAmount) {
                throw new Error(`Amount must be at most ${maxAmount} for option trades with duration ${payload.duration}`);
            }
        }
        if (trade_rules_1.OPTION_TRADE_RULES[payload.duration].minAmount) {
            const minAmount = trade_rules_1.OPTION_TRADE_RULES[payload.duration].minAmount;
            if (payload.amount < minAmount) {
                throw new Error(`Amount must be at least ${minAmount} for option trades with duration ${payload.duration}`);
            }
        }
        if (!["buy", "sell"].includes(payload.direction)) {
            throw new Error("Invalid trade direction");
        }
        const required = new library_1.Decimal(payload.amount).add(new library_1.Decimal(payload.amount).mul(TRANSACTION_FEE_RATE));
        this.ensureSufficientBalance(balance, required);
    }
    validateContractTradeData(balance, payload) {
        if (!CONTRACT_LEVERAGE_OPTIONS.includes(payload.leverage)) {
            throw new Error("Invalid leverage value");
        }
        if (!payload.amount || payload.amount < 10) {
            throw new Error("Minimum amount for contract trades is 10");
        }
        if (!["buy", "sell"].includes(payload.direction)) {
            throw new Error("Invalid trade direction");
        }
        const required = new library_1.Decimal(payload.amount).add(new library_1.Decimal(payload.amount).mul(TRANSACTION_FEE_RATE));
        this.ensureSufficientBalance(balance, required);
    }
    validateSpotTradeData(balance, payload) {
        if (!payload.amount || payload.amount < 1) {
            throw new Error("Minimum amount for spot trades is 1");
        }
        if (!payload.symbol) {
            throw new Error("Symbol is required");
        }
        if (!payload.direction || !["buy", "sell"].includes(payload.direction)) {
            throw new Error("Invalid trade direction");
        }
        const required = new library_1.Decimal(payload.amount).add(new library_1.Decimal(payload.amount).mul(TRANSACTION_FEE_RATE));
        this.ensureSufficientBalance(balance, required);
    }
    resolveSpotCoins(payload) {
        if (payload.fromCoin && payload.toCoin) {
            return {
                fromCoin: payload.fromCoin.toUpperCase(),
                toCoin: payload.toCoin.toUpperCase(),
            };
        }
        if (!payload.symbol.includes("/")) {
            throw new Error("Invalid symbol format. Expected format COIN1/COIN2");
        }
        const [fromCoin, toCoin] = payload.symbol
            .split("/")
            .map((part) => part.trim().toUpperCase());
        if (!fromCoin || !toCoin) {
            throw new Error("Invalid symbol format. Expected format COIN1/COIN2");
        }
        return { fromCoin, toCoin };
    }
    calculateLiquidationPrice(entryPrice, direction, leverage) {
        const buffer = new library_1.Decimal(0.95);
        if (direction === "buy") {
            return entryPrice.mul(new library_1.Decimal(1).sub(buffer.div(leverage)));
        }
        return entryPrice.mul(new library_1.Decimal(1).add(buffer.div(leverage)));
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
                        name: symbol,
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
}
exports.TradeService = TradeService;
exports.default = new TradeService();
