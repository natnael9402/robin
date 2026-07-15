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
exports.MarketDataService = void 0;
const axios_1 = __importDefault(require("axios"));
const library_1 = require("@prisma/client/runtime/library");
const logger_1 = require("../utils/logger");
const FALLBACK_SYMBOLS = {
    "BTC/USDT": "BTCUSDT",
    "USDT/BTC": "BTCUSDT",
};

const GOLD_API_BASE = "https://api.gold-api.com/price";
const MARKETDATA_BASE = "https://api.marketdata.app/v1";
const KNOWN_METALS = { XAUUSD: "XAU", XAGUSD: "XAG", XPTUSD: "XPT", XPDUSD: "XPD" };
const KNOWN_STOCKS = new Set(["AAPL","TSLA","NVDA","MSFT","AMZN","GOOGL","META","NFLX","AMD","INTC","BABA","BA","DIS","V","JPM","GS","PYPL","SQ","COIN","UBER","LYFT","SNAP","PINS","ROKU","SHOP","SQ","SPOT","ZM","DKNG","PLTR","SOFI","NIO","XPEV","LI","RIVN","MARA","RIOT","HOOD","RBLX","ABNB","COIN","NET","CRWD","ZS","DDOG","SNOW","DBX","BOX","TEAM","NOW","VEEV","ISRG","VRTX","REGN","BIIB","MRNA","PFE","JNJ","UNH","ABT","TMO","DHR","BMY","LLY","NVO","AZN","GSK","PFE","MRK","ABBV","AMGN","GILD","VRTX"]);

class MarketDataService {
    getCurrentPrice(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            const normalized = (symbol || "").trim().toUpperCase();
            const stripped = normalized.replace(/\/USD(T)?$/i, "");

            // Try Binance first (crypto)
            const candidates = this.buildSymbolCandidates(stripped);
            for (const candidate of candidates) {
                const price = yield this.tryFetchPrice(candidate);
                if (price) {
                    return price;
                }
            }

            // Fallback: Gold API for metals
            const metalCode = KNOWN_METALS[stripped] || KNOWN_METALS[normalized];
            if (metalCode) {
                const metalPrice = yield this.tryFetchMetalPrice(metalCode);
                if (metalPrice) return metalPrice;
            }

            // Fallback: MarketData.app for stocks
            if (KNOWN_STOCKS.has(stripped) || KNOWN_STOCKS.has(normalized)) {
                const stockPrice = yield this.tryFetchStockPrice(stripped || normalized);
                if (stockPrice) return stockPrice;
            }

            throw new Error(`Unable to fetch market price for ${symbol}`);
        });
    }

    tryFetchMetalPrice(code) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`${GOLD_API_BASE}/${code}`, { timeout: 10000 });
                const price = response.data && response.data.price;
                if (typeof price === "number" && price > 0) {
                    logger_1.logger.debug("Gold API price fallback succeeded", { code, price });
                    return new library_1.Decimal(price);
                }
            } catch (error) {
                logger_1.logger.debug("Gold API price fallback failed", {
                    code,
                    error: error instanceof Error ? error.message : "Unknown",
                });
            }
            return null;
        });
    }

    tryFetchStockPrice(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`${MARKETDATA_BASE}/stocks/quotes/${symbol}/`, { timeout: 10000 });
                const data = response.data;
                if (data.s === "ok" && Array.isArray(data.last) && data.last.length > 0) {
                    const price = data.last[0];
                    if (typeof price === "number" && price > 0) {
                        logger_1.logger.debug("MarketData.app stock price fallback succeeded", { symbol, price });
                        return new library_1.Decimal(price);
                    }
                }
            } catch (error) {
                logger_1.logger.debug("MarketData.app stock price fallback failed", {
                    symbol,
                    error: error instanceof Error ? error.message : "Unknown",
                });
            }
            return null;
        });
    }
    getExchangeRate(fromCoin, toCoin) {
        return __awaiter(this, void 0, void 0, function* () {
            const normalizedFrom = fromCoin.toUpperCase();
            const normalizedTo = toCoin.toUpperCase();
            if (normalizedFrom === normalizedTo) {
                return {
                    exchangeRate: new library_1.Decimal(1),
                    marketPrice: new library_1.Decimal(1),
                };
            }
            if (normalizedFrom === "USDT") {
                const quoteSymbol = `${normalizedTo}USDT`;
                const price = yield this.getCurrentPrice(quoteSymbol);
                return {
                    marketPrice: price,
                    exchangeRate: new library_1.Decimal(1).div(price),
                };
            }
            if (normalizedTo === "USDT") {
                const quoteSymbol = `${normalizedFrom}USDT`;
                const price = yield this.getCurrentPrice(quoteSymbol);
                return {
                    marketPrice: price,
                    exchangeRate: price,
                };
            }
            const basePrice = yield this.getCurrentPrice(`${normalizedFrom}USDT`);
            const quotePrice = yield this.getCurrentPrice(`${normalizedTo}USDT`);
            return {
                marketPrice: quotePrice,
                exchangeRate: basePrice.div(quotePrice),
            };
        });
    }
    formatSymbolForBinance(symbol) {
        const trimmed = symbol.trim().toUpperCase();
        if (FALLBACK_SYMBOLS[trimmed]) {
            return FALLBACK_SYMBOLS[trimmed];
        }
        const hasSeparator = /[/-]/.test(trimmed);
        if (hasSeparator) {
            const [left, right] = trimmed
                .split(/[/-]/)
                .map((part) => part.trim())
                .filter(Boolean);
            if (left && right) {
                if (left === "USDT") {
                    return `${right}USDT`;
                }
                if (right === "USDT") {
                    return `${left}USDT`;
                }
                return `${left}${right}`;
            }
        }
        if (!trimmed.endsWith("USDT")) {
            return `${trimmed}USDT`;
        }
        return trimmed;
    }
    buildSymbolCandidates(symbol) {
        const formatted = this.formatSymbolForBinance(symbol);
        const set = new Set([formatted]);
        if (!formatted.endsWith("USDT")) {
            set.add(`${formatted}USDT`);
        }
        if (!formatted.startsWith("USDT")) {
            set.add(formatted.replace("USDT", ""));
        }
        const fallback = FALLBACK_SYMBOLS[symbol.trim().toUpperCase()];
        if (fallback) {
            set.add(fallback);
        }
        return Array.from(set);
    }
    tryFetchPrice(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const normalized = symbol.trim().toUpperCase();
            try {
                const MAX_RETRIES = 3;
                const RETRY_DELAY_MS = 1000;
                for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                    try {
                        const response = yield axios_1.default.get("https://api.binance.com/api/v3/ticker/price", {
                            params: { symbol: normalized },
                            timeout: 15000,
                        });
                        const price = (_a = response.data) === null || _a === void 0 ? void 0 : _a.price;
                        if (price) {
                            return new library_1.Decimal(price);
                        }
                        // If the request was successful but there's no price, no need to retry.
                        break;
                    }
                    catch (error) {
                        if (attempt === MAX_RETRIES) {
                            // If this was the last attempt, re-throw the error to be caught by the outer catch block.
                            throw error;
                        }
                        // Wait for a short period before the next attempt.
                        yield new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
                    }
                }
            }
            catch (error) {
                logger_1.logger.debug("Fallback Binance REST price lookup failed", {
                    symbol: normalized,
                    error: error instanceof Error ? error.message : "Unknown fetch error",
                });
            }
            return null;
        });
    }
}
exports.MarketDataService = MarketDataService;
exports.default = new MarketDataService();
