"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketService = void 0;
const axios_1 = __importDefault(require("axios"));
const library_1 = require("@prisma/client/runtime/library");
const market_data_service_1 = __importDefault(require("../trade/market-data.service"));
const logger_1 = require("../utils/logger");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));

const LIST_CACHE_FILE = path.join(__dirname, '..', '..', 'list_cache.json');
const HIST_CACHE_FILE = path.join(__dirname, '..', '..', 'hist_cache.json');

let fileHistCache = {};
try {
    if (fs.existsSync(HIST_CACHE_FILE)) {
        fileHistCache = JSON.parse(fs.readFileSync(HIST_CACHE_FILE, 'utf8'));
    }
} catch(e) {}
const MARKET_TYPES = [
    "crypto",
    "forex",
    "metals",
    "stocks",
    "indices",
];
const DEFAULT_MARKET = "stocks";
const DEFAULT_INTERVAL = "1d";
const DEFAULT_LIMIT = 100;
const ALPHAVANTAGE_BASE = "https://www.alphavantage.co/query";
const EXCHANGERATE_BASE = "https://api.exchangerate.host/latest";
const METALS_BASE = "https://api.metals.live/v1/spot";
const OPENEXCHANGERATES_BASE = "https://openexchangerates.org/api";
const MARKETDATA_BASE = "https://api.marketdata.app/v1";
const TRADERMADE_BASE = "https://marketdata.tradermade.com/api/v1";
const STOCK_METAL_API_BASE = "https://stock-metal-api.cloud/api";
const alphavantageKey = (_a = process.env.ALPHAVANTAGE_API_KEY) !== null && _a !== void 0 ? _a : "";
const traderMadeKey = (_b = process.env.TRADERMADE_API_KEY) !== null && _b !== void 0 ? _b : "";
const polygonKey = (_c = process.env.POLYGON_API_KEY) !== null && _c !== void 0 ? _c : "";
const clientApiKey = (_d = process.env.CLIENT_API_KEY) !== null && _d !== void 0 ? _d : "";
const openExchangeRatesAppId = (_g = (_f = (_e = process.env.OPENEXCHANGERATES_APP_ID) !== null && _e !== void 0 ? _e : process.env.OPEN_EXCHANGE_RATES_APP_ID) !== null && _f !== void 0 ? _f : process.env.OPENEXCHANGERATES_API_KEY) !== null && _g !== void 0 ? _g : "";
const mapMetalSymbol = (symbol) => {
    var _a;
    const normalized = symbol.toUpperCase();
    const map = {
        XAUUSD: "gold",
        XAGUSD: "silver",
        XPTUSD: "platinum",
        XPDUSD: "palladium",
    };
    return (_a = map[normalized]) !== null && _a !== void 0 ? _a : normalized;
};
const mapIntervalToAlphaVantage = (interval) => {
    var _a;
    const mapping = {
        "1m": "1min",
        "5m": "5min",
        "15m": "15min",
        "30m": "30min",
        "1h": "60min",
        "1d": "daily",
        "1w": "weekly",
        "1M": "monthly",
    };
    return (_a = mapping[interval]) !== null && _a !== void 0 ? _a : mapping[DEFAULT_INTERVAL];
};
const mapIntervalToPolygon = (interval) => {
    var _a;
    const mapping = {
        "1m": [1, "minute"],
        "5m": [5, "minute"],
        "15m": [15, "minute"],
        "30m": [30, "minute"],
        "1h": [1, "hour"],
        "2h": [2, "hour"],
        "4h": [4, "hour"],
        "1d": [1, "day"],
        "1w": [1, "week"],
        "1M": [1, "month"],
    };
    return (_a = mapping[interval]) !== null && _a !== void 0 ? _a : mapping[DEFAULT_INTERVAL];
};
const mapMarketToPolygon = (market) => {
    var _a;
    const mapping = {
        crypto: "crypto",
        forex: "fx",
        metals: "stocks",
        stocks: "stocks",
        indices: "indices",
    };
    return (_a = mapping[market]) !== null && _a !== void 0 ? _a : "stocks";
};
const toDecimal = (value) => new library_1.Decimal(value);
const isPolygonAvailable = () => Boolean(polygonKey);
const fetchPolygon = (path, params) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://api.polygon.io${path}`;
    const response = yield axios_1.default.get(url, {
        params: Object.assign(Object.assign({}, params), { apiKey: polygonKey }),
        timeout: 1500,
    });
    return response.data;
});
const formatPolygonTicker = (ticker) => {
    var _a, _b, _c, _d;
    return ({
        ticker: (_b = (_a = ticker === null || ticker === void 0 ? void 0 : ticker.ticker) !== null && _a !== void 0 ? _a : ticker === null || ticker === void 0 ? void 0 : ticker.symbol) !== null && _b !== void 0 ? _b : "",
        name: ticker === null || ticker === void 0 ? void 0 : ticker.name,
        market: (_c = ticker === null || ticker === void 0 ? void 0 : ticker.market) !== null && _c !== void 0 ? _c : ticker === null || ticker === void 0 ? void 0 : ticker.marketType,
        currency: ticker === null || ticker === void 0 ? void 0 : ticker.currency,
        active: (_d = ticker === null || ticker === void 0 ? void 0 : ticker.active) !== null && _d !== void 0 ? _d : true,
    });
};
const searchPolygonTickers = (query, market, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const marketParam = mapMarketToPolygon(market);
    const data = yield fetchPolygon("/v3/reference/tickers", {
        search: query,
        limit,
        market: marketParam,
    });
    if (!Array.isArray(data === null || data === void 0 ? void 0 : data.results)) {
        return [];
    }
    return data.results.map(formatPolygonTicker);
});
const searchAlphaVantage = (query, limit) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!alphavantageKey)
        return [];
    const response = yield axios_1.default.get(ALPHAVANTAGE_BASE, {
        params: {
            function: "SYMBOL_SEARCH",
            keywords: query,
            apikey: alphavantageKey,
        },
        timeout: 1500,
    });
    const matches = (_a = response.data) === null || _a === void 0 ? void 0 : _a.bestMatches;
    if (!Array.isArray(matches))
        return [];
    return matches.slice(0, limit).map((match) => ({
        ticker: match["1. symbol"],
        name: match["2. name"],
        market: match["3. type"],
        currency: match["8. currency"],
        active: true,
    }));
});
const resolveMetalCurrencyCode = (symbol) => {
    const normalized = symbol.toUpperCase();
    const supportedCodes = ["XAU", "XAG", "XPT", "XPD"];
    return supportedCodes.find((code) => normalized.startsWith(code));
};
// removed OpenExchangeRates function
const GOLD_API_BASE = "https://api.gold-api.com/price";
const fetchStockMetalAPIMetalPrice = (symbol) => __awaiter(void 0, void 0, void 0, function* () {
    const metalCode = resolveMetalCurrencyCode(symbol);
    if (!metalCode) {
        throw new Error(`Unsupported metal symbol: ${symbol}`);
    }
    try {
        const response = yield axios_1.default.get(`${GOLD_API_BASE}/${metalCode}`, { timeout: 8000 });
        const price = response.data.price;
        if (typeof price !== "number" || price <= 0) {
            throw new Error("Gold API price feed unavailable for " + metalCode);
        }
        logger_1.logger.debug("Gold API metals price response", {
            symbol,
            metalCode,
            price,
        });
        return new library_1.Decimal(price);
    }
    catch (error) {
        logger_1.logger.error("Gold API metals price fetch failed", {
            symbol,
            error: error instanceof Error ? error.message : String(error),
        });
        throw error;
    }
});
const fetchMarketDataAppStockPrice = (symbol) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.get(`${MARKETDATA_BASE}/stocks/quotes/${symbol}/`, { timeout: 15000 });
    const data = response.data;
    if (data.s !== "ok" || !Array.isArray(data.last) || data.last.length === 0) {
        throw new Error(`MarketData.app stock price feed unavailable for ${symbol}`);
    }
    const rate = data.last[0];
    if (typeof rate !== "number" || rate <= 0) {
        throw new Error(`Invalid stock price for ${symbol}: ${rate}`);
    }
    const price = new library_1.Decimal(rate);
    logger_1.logger.debug("MarketData.app stock price response", {
        symbol,
        price: price.toString(),
    });
    return price;
});
const fetchMetalsPrice = (symbol) => __awaiter(void 0, void 0, void 0, function* () {
    return fetchStockMetalAPIMetalPrice(symbol);
});
const fetchTraderMadeForexPrice = (pair) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    if (!traderMadeKey) {
        throw new Error("TraderMade API key not configured");
    }
    const response = yield axios_1.default.get(`${TRADERMADE_BASE}/live`, {
        params: { currency: pair, api_key: traderMadeKey },
        timeout: 1500,
    });
    const mid = (_c = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.quotes) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.mid;
    if (typeof mid !== "number") {
        throw new Error("TraderMade forex feed unavailable");
    }
    return toDecimal(mid);
});
const fetchExchangeRateHost = (pair) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const base = pair.slice(0, 3).toUpperCase();
    const quote = pair.slice(3).toUpperCase();
    const response = yield axios_1.default.get(EXCHANGERATE_BASE, {
        params: { base, symbols: quote },
        timeout: 1500,
    });
    const rate = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.rates) === null || _b === void 0 ? void 0 : _b[quote];
    if (typeof rate !== "number") {
        throw new Error("ExchangeRate host forex feed unavailable");
    }
    return toDecimal(rate);
});
const fetchForexPrice = (pair) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (traderMadeKey) {
            return yield fetchTraderMadeForexPrice(pair);
        }
    }
    catch (error) {
        // Attempt fallback below
    }
    return fetchExchangeRateHost(pair);
});
const mapAlphaVantageCommoditySymbol = (symbol) => {
    var _a;
    const map = {
        XAUUSD: "GOLD",
        XAGUSD: "SILVER",
        XPTUSD: "PLATINUM",
        XPDUSD: "PALLADIUM",
    };
    return (_a = map[symbol.toUpperCase()]) !== null && _a !== void 0 ? _a : symbol;
};
const fetchAlphaVantageQuote = (symbol) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (!alphavantageKey) {
        throw new Error("AlphaVantage API key not configured");
    }
    const response = yield axios_1.default.get(ALPHAVANTAGE_BASE, {
        params: {
            function: "GLOBAL_QUOTE",
            symbol,
            apikey: alphavantageKey,
        },
        timeout: 1500,
    });
    const price = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a["Global Quote"]) === null || _b === void 0 ? void 0 : _b["05. price"];
    if (!price) {
        throw new Error("AlphaVantage quote unavailable");
    }
    return toDecimal(price);
});
const fetchCryptoPrice = (symbol) => __awaiter(void 0, void 0, void 0, function* () {
    return market_data_service_1.default.getCurrentPrice(symbol);
});
const fetchStockOrIndexPrice = (symbol) => __awaiter(void 0, void 0, void 0, function* () {
    return fetchMarketDataAppStockPrice(symbol);
});
const fetchMarketPrice = (symbol, market) => __awaiter(void 0, void 0, void 0, function* () {
    const normalizedMarket = MARKET_TYPES.includes(market)
        ? market
        : DEFAULT_MARKET;
    switch (normalizedMarket) {
        case "crypto":
            return fetchCryptoPrice(symbol);
        case "forex":
            return fetchForexPrice(symbol);
        case "metals":
            return fetchMetalsPrice(symbol);
        case "indices":
            return fetchStockOrIndexPrice(symbol);
        case "stocks":
        default:
            return fetchMarketDataAppStockPrice(symbol);
    }
});
const fetchPolygonAggregates = (symbol, market, interval, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const [multiplier, timespan] = mapIntervalToPolygon(interval);
    const to = new Date();
    const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
    const fromIso = from.toISOString().slice(0, 10);
    const toIso = to.toISOString().slice(0, 10);
    const marketParam = mapMarketToPolygon(market);
    const data = yield fetchPolygon(`/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${fromIso}/${toIso}`, { limit, market: marketParam });
    if (!Array.isArray(data === null || data === void 0 ? void 0 : data.results)) {
        return [];
    }
    return data.results.map((row) => {
        var _a;
        return ({
            timestamp: row.t,
            open: Number(row.o),
            high: Number(row.h),
            low: Number(row.l),
            close: Number(row.c),
            volume: Number((_a = row.v) !== null && _a !== void 0 ? _a : 0),
        });
    });
});
const fetchBinanceKlines = (symbol, interval, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const marketSymbol = market_data_service_1.default.formatSymbolForBinance(symbol);
    const { default: binance } = yield Promise.resolve().then(() => __importStar(require("../config/binance")));
    const client = binance;
    return new Promise((resolve, reject) => {
        client.candlesticks(marketSymbol, interval, (error, ticks) => {
            if (error) {
                return reject(error);
            }
            if (!Array.isArray(ticks)) {
                return reject(new Error("Binance klines unavailable"));
            }
            const mapped = ticks.map((entry) => ({
                timestamp: Number(entry[0]),
                open: Number(entry[1]),
                high: Number(entry[2]),
                low: Number(entry[3]),
                close: Number(entry[4]),
                volume: Number(entry[5]),
            }));
            resolve(mapped);
        }, { limit });
    });
});
const fetchAlphaVantageHistorical = (symbol, interval, limit) => __awaiter(void 0, void 0, void 0, function* () {
    if (!alphavantageKey) {
        throw new Error("AlphaVantage API key not configured");
    }
    const mappedInterval = mapIntervalToAlphaVantage(interval);
    const params = {
        function: "TIME_SERIES_INTRADAY",
        symbol,
        apikey: alphavantageKey,
        interval: mappedInterval,
        outputsize: "compact",
    };
    if (["daily", "weekly", "monthly"].includes(mappedInterval)) {
        params.function = `TIME_SERIES_${mappedInterval.toUpperCase()}`;
        delete params.interval;
        delete params.outputsize;
    }
    const response = yield axios_1.default.get(ALPHAVANTAGE_BASE, {
        params,
        timeout: 1500,
    });
    const keys = Object.keys(response.data || {});
    const seriesKey = keys.find((key) => key.toLowerCase().includes("time series"));
    if (!seriesKey || !response.data[seriesKey]) {
        throw new Error("AlphaVantage historical data unavailable");
    }
    const entries = Object.entries(response.data[seriesKey])
        .slice(0, limit)
        .map(([timestamp, values]) => {
        var _a;
        return ({
            timestamp: Date.parse(timestamp),
            open: Number(values["1. open"]),
            high: Number(values["2. high"]),
            low: Number(values["3. low"]),
            close: Number(values["4. close"]),
            volume: Number((_a = values["5. volume"]) !== null && _a !== void 0 ? _a : 0),
        });
    });
    return entries.sort((a, b) => a.timestamp - b.timestamp);
});
const histCache = new Map();
const fetchHistoricalData = (symbol, market, interval, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = `${symbol}-${market}-${interval}-${limit}`;
    const cached = histCache.get(cacheKey) || fileHistCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < 60000) {
        return cached.data;
    }
    let result = [];
    try {
        const fetchPromise = (async () => {
            if (POLYGON_API_KEY && market !== "crypto") {
                const polygonResults = await fetchPolygonAggregates(symbol, market, interval, limit);
                if (polygonResults && polygonResults.length > 0) return polygonResults;
            }
            if (market === "crypto") {
                return await fetchBinanceKlines(symbol, interval, limit);
            } else {
                return await fetchAlphaVantageHistorical(symbol, interval, limit);
            }
        })();

        result = yield Promise.race([
            fetchPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout waiting for external API")), 1500))
        ]);
    } catch (error) {
        logger_1.logger.warn(`Failed to fetch historical data for ${symbol}: ${error.message}`);
        result = [];
    }
    
    if (!result.length && cached && cached.data && cached.data.length > 0) {
        return cached.data;
    }

    if (result.length > 0) {
        const cacheEntry = { timestamp: Date.now(), data: result };
        histCache.set(cacheKey, cacheEntry);
        fileHistCache[cacheKey] = cacheEntry;
        try { fs.writeFileSync(HIST_CACHE_FILE, JSON.stringify(fileHistCache)); } catch(e) {}
    }
    
    return result;
});
const forexHistoricalDataNotImplemented = () => {
    throw new Error("Forex historical data not implemented - requires paid API");
};
const fetchMarketStatus = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (isPolygonAvailable()) {
        try {
            const data = yield fetchPolygon("/v1/marketstatus/now", {});
            return {
                exchanges: {
                    nyse: {
                        name: "New York Stock Exchange",
                        open: Boolean((_b = (_a = data === null || data === void 0 ? void 0 : data.exchanges) === null || _a === void 0 ? void 0 : _a.nyse) === null || _b === void 0 ? void 0 : _b.is_open),
                    },
                    nasdaq: {
                        name: "NASDAQ",
                        open: Boolean((_d = (_c = data === null || data === void 0 ? void 0 : data.exchanges) === null || _c === void 0 ? void 0 : _c.nasdaq) === null || _d === void 0 ? void 0 : _d.is_open),
                    },
                    crypto: {
                        name: "Cryptocurrency Markets",
                        open: true,
                    },
                    forex: {
                        name: "Forex Markets",
                        open: Boolean((_g = (_f = (_e = data === null || data === void 0 ? void 0 : data.exchanges) === null || _e === void 0 ? void 0 : _e.fx) === null || _f === void 0 ? void 0 : _f.is_open) !== null && _g !== void 0 ? _g : true),
                    },
                },
                serverTime: (_h = data === null || data === void 0 ? void 0 : data.serverTime) !== null && _h !== void 0 ? _h : new Date().toISOString(),
            };
        }
        catch (error) {
            // fall through to fallback implementation
        }
    }
    const now = new Date();
    const newYorkTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const hour = newYorkTime.getHours();
    const minute = newYorkTime.getMinutes();
    const day = newYorkTime.getDay();
    const isWeekend = day === 0 || day === 6;
    const isRegularHours = hour > 9 && (hour < 16 || (hour === 16 && minute === 0));
    return {
        exchanges: {
            nyse: {
                name: "New York Stock Exchange",
                open: !isWeekend && isRegularHours,
            },
            nasdaq: {
                name: "NASDAQ",
                open: !isWeekend && isRegularHours,
            },
            crypto: {
                name: "Cryptocurrency Markets",
                open: true,
            },
            forex: {
                name: "Forex Markets",
                open: !isWeekend,
            },
        },
        serverTime: newYorkTime.toISOString(),
    };
});
class MarketService {
    getCurrentPrice(symbol, market) {
        return __awaiter(this, void 0, void 0, function* () {
            const normalizedMarket = MARKET_TYPES.includes(market)
                ? market
                : DEFAULT_MARKET;
            const price = yield fetchMarketPrice(symbol, normalizedMarket);
            return { price, market: normalizedMarket };
        });
    }
    searchTickers(query, market, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!query || !query.trim()) {
                return [];
            }
            const normalizedMarket = MARKET_TYPES.includes(market)
                ? market
                : DEFAULT_MARKET;
            if (isPolygonAvailable()) {
                try {
                    const results = yield searchPolygonTickers(query, normalizedMarket, limit);
                    if (results.length) {
                        return results;
                    }
                }
                catch (error) {
                    // fall through to AlphaVantage below
                }
            }
            if (normalizedMarket === "stocks") {
                return searchAlphaVantage(query, limit);
            }
            return [];
        });
    }
    getHistoricalData(symbol, market, interval, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const normalizedMarket = MARKET_TYPES.includes(market)
                ? market
                : DEFAULT_MARKET;
            if (normalizedMarket === "forex") {
                return forexHistoricalDataNotImplemented();
            }
            const normalizedInterval = interval !== null && interval !== void 0 ? interval : DEFAULT_INTERVAL;
            const normalizedLimit = limit && limit > 0 ? limit : DEFAULT_LIMIT;
            return fetchHistoricalData(symbol, normalizedMarket, normalizedInterval, normalizedLimit);
        });
    }
    getMarketStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            return fetchMarketStatus();
        });
    }
    getMarketList() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.listCache) {
                try {
                    if (fs.existsSync(LIST_CACHE_FILE)) {
                        this.listCache = JSON.parse(fs.readFileSync(LIST_CACHE_FILE, 'utf8'));
                    } else {
                        this.listCache = { timestamp: 0, data: null };
                    }
                } catch(e) {
                    this.listCache = { timestamp: 0, data: null };
                }
            }

            const CACHE_FRESH_MS = 300000; // 5 minutes

            // If cache has data and is fresh, return immediately
            if (this.listCache.data && (Date.now() - this.listCache.timestamp) < CACHE_FRESH_MS) {
                return this.listCache.data;
            }

            // If cache has data but is stale, return stale + refresh in background
            if (this.listCache.data && !this._refreshingList) {
                this._refreshingList = this._doRefreshList().then(() => { this._refreshingList = null; }).catch(() => { this._refreshingList = null; });
                return this.listCache.data;
            }

            // If a background refresh is already running and we have cache, serve cache
            if (this._refreshingList && this.listCache.data) {
                return this.listCache.data;
            }

            // No cache or first load — must fetch and wait
            return this._doRefreshList();
        });
    }
    _doRefreshList() {
        return __awaiter(this, void 0, void 0, function* () {
            const fetchCryptoList = () => __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = yield axios_1.default.get("https://api.coingecko.com/api/v3/coins/markets", {
                        params: {
                            vs_currency: "usd",
                            order: "market_cap_desc",
                            per_page: 50,
                            page: 1,
                            sparkline: true
                        },
                        timeout: 15000,
                    });
                    return response.data;
                } catch (error) {
                    logger_1.logger.error("Failed to fetch crypto list from CoinGecko", error);
                    return [];
                }
            });

            const fetchStockList = () => __awaiter(this, void 0, void 0, function* () {
                try {
                    const symbols = ["AAPL","TSLA","NVDA","MSFT","AMZN","GOOGL","META"];
                    const response = yield axios_1.default.get(`${MARKETDATA_BASE}/stocks/quotes/${symbols.join(",")}/`, { timeout: 15000 });
                    const data = response.data;
                    if (data.s === "ok" && Array.isArray(data.symbol) && data.symbol.length > 0) {
                        const logos = {
                            AAPL: "https://s3-symbol-logo.tradingview.com/apple--big.svg",
                            TSLA: "https://s3-symbol-logo.tradingview.com/tesla--big.svg",
                            NVDA: "https://s3-symbol-logo.tradingview.com/nvidia--big.svg",
                            MSFT: "https://s3-symbol-logo.tradingview.com/microsoft--big.svg",
                            AMZN: "https://s3-symbol-logo.tradingview.com/amazon--big.svg",
                            GOOGL: "https://s3-symbol-logo.tradingview.com/alphabet--big.svg",
                            META: "https://s3-symbol-logo.tradingview.com/meta-platforms--big.svg"
                        };
                        const lastArr = data.last || [];
                        const cpArr = data.changepct || [];
                        return data.symbol.map((sym, i) => ({
                            id: sym,
                            symbol: sym,
                            name: sym,
                            price: lastArr[i] || 0,
                            changePercent: cpArr[i] !== undefined ? cpArr[i] : 0,
                            image: logos[sym] || null
                        }));
                    }
                    throw new Error("Empty stock data from MarketData.app");
                } catch (error) {
                    logger_1.logger.error("Failed to fetch stock list, using defaults", error);
                    return getDefaultStocks();
                }
            });

            const fetchMetalList = () => __awaiter(this, void 0, void 0, function* () {
                const metals = [
                    { code: "XAU", symbol: "XAUUSD", name: "Gold" },
                    { code: "XAG", symbol: "XAGUSD", name: "Silver" },
                    { code: "XPT", symbol: "XPTUSD", name: "Platinum" },
                    { code: "XPD", symbol: "XPDUSD", name: "Palladium" }
                ];
                try {
                    const results = yield Promise.allSettled(metals.map((metal) => __awaiter(this, void 0, void 0, function* () {
                        try {
                            const res = yield axios_1.default.get(`${GOLD_API_BASE}/${metal.code}`, { timeout: 8000 });
                            return {
                                id: metal.symbol,
                                symbol: metal.symbol,
                                name: metal.name,
                                price: res.data.price,
                                changePercent: 0,
                            };
                        }
                        catch (_a) {
                            return null;
                        }
                    })));
                    const valid = results
                        .filter((r) => r.status === "fulfilled" && r.value !== null && r.value.price > 0)
                        .map((r) => r.value);
                    if (valid.length > 0)
                        return valid;
                    logger_1.logger.warn("Gold API returned no valid metal prices, using defaults");
                    return getDefaultMetals();
                }
                catch (error) {
                    logger_1.logger.error("Failed to fetch metal list, using defaults", error);
                    return getDefaultMetals();
                }
            });
            const getDefaultMetals = () => [
                { id: "XAUUSD", symbol: "XAUUSD", name: "Gold", price: 4122.00, changePercent: 0 },
                { id: "XAGUSD", symbol: "XAGUSD", name: "Silver", price: 60.00, changePercent: 0 },
                { id: "XPTUSD", symbol: "XPTUSD", name: "Platinum", price: 1634.00, changePercent: 0 },
                { id: "XPDUSD", symbol: "XPDUSD", name: "Palladium", price: 1282.00, changePercent: 0 },
            ];
            const getDefaultStocks = () => [
                { id: "AAPL", symbol: "AAPL", name: "AAPL", price: 315.00, changePercent: 0, image: "https://s3-symbol-logo.tradingview.com/apple--big.svg" },
                { id: "TSLA", symbol: "TSLA", name: "TSLA", price: 408.00, changePercent: 0, image: "https://s3-symbol-logo.tradingview.com/tesla--big.svg" },
                { id: "NVDA", symbol: "NVDA", name: "NVDA", price: 211.00, changePercent: 0, image: "https://s3-symbol-logo.tradingview.com/nvidia--big.svg" },
                { id: "MSFT", symbol: "MSFT", name: "MSFT", price: 385.00, changePercent: 0, image: "https://s3-symbol-logo.tradingview.com/microsoft--big.svg" },
                { id: "AMZN", symbol: "AMZN", name: "AMZN", price: 245.00, changePercent: 0, image: "https://s3-symbol-logo.tradingview.com/amazon--big.svg" },
                { id: "GOOGL", symbol: "GOOGL", name: "GOOGL", price: 357.00, changePercent: 0, image: "https://s3-symbol-logo.tradingview.com/alphabet--big.svg" },
                { id: "META", symbol: "META", name: "META", price: 669.00, changePercent: 0, image: "https://s3-symbol-logo.tradingview.com/meta-platforms--big.svg" },
            ];

            const [cryptoResult, stocksResult, metalsResult] = yield Promise.allSettled([
                fetchCryptoList(),
                fetchStockList(),
                fetchMetalList()
            ]);

            const crypto = cryptoResult.status === "fulfilled" ? cryptoResult.value : [];
            const stocks = stocksResult.status === "fulfilled" ? stocksResult.value : getDefaultStocks();
            const metals = metalsResult.status === "fulfilled" ? metalsResult.value : getDefaultMetals();
            
            const prevMetalsMap = this.metalsPrev || {};
            for (let i = 0; i < metals.length; i++) {
                const prevPrice = prevMetalsMap[metals[i].id];
                metals[i].changePercent = prevPrice && prevPrice > 0
                    ? parseFloat(((metals[i].price - prevPrice) / prevPrice * 100).toFixed(2))
                    : 0;
            }
            this.metalsPrev = {};
            for (let i = 0; i < metals.length; i++) {
                this.metalsPrev[metals[i].id] = metals[i].price;
            }

            // Merge with previous cache: fresh data wins, stale data fills gaps
            const prevData = this.listCache.data || {};
            const data = {
                crypto: crypto.length > 0 ? crypto : (prevData.crypto || getDefaultStocks()),
                stocks: stocks.length > 0 ? stocks : (prevData.stocks || getDefaultStocks()),
                metals: metals.length > 0 ? metals : (prevData.metals || getDefaultMetals())
            };
            
            this.listCache = { timestamp: Date.now(), data };
            try { fs.writeFileSync(LIST_CACHE_FILE, JSON.stringify(this.listCache)); } catch(e) {}
            return data;
        });
    }
}
exports.MarketService = MarketService;
exports.default = new MarketService();
