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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const library_1 = require("@prisma/client/runtime/library");
const logger_1 = require("../utils/logger");
const STOCK_METAL_API_BASE = "https://stock-metal-api.cloud/api";
const clientApiKey = (_a = process.env.CLIENT_API_KEY) !== null && _a !== void 0 ? _a : "";
class StockService {
    constructor() {
        this.client = axios_1.default.create({
            baseURL: STOCK_METAL_API_BASE,
            timeout: 15000,
            headers: {
                "X-CLIENT-API-KEY": clientApiKey,
            },
        });
    }
    getQuote(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            const normalizedSymbol = symbol.trim().toUpperCase();
            try {
                const response = yield this.client.get("/finnhub/latest");
                const data = response.data;
                if (!Array.isArray(data)) {
                    throw new Error("Invalid response from Stock API");
                }
                const quote = data.find((item) => item.symbol === normalizedSymbol);
                if (!quote) {
                    throw new Error(`Unable to fetch stock quote for ${normalizedSymbol}`);
                }
                const price = new library_1.Decimal((_b = (_a = quote.c) !== null && _a !== void 0 ? _a : quote.price) !== null && _b !== void 0 ? _b : 0);
                return {
                    symbol: normalizedSymbol,
                    price,
                    open: new library_1.Decimal((_d = (_c = quote.o) !== null && _c !== void 0 ? _c : quote.open) !== null && _d !== void 0 ? _d : price),
                    high: new library_1.Decimal((_f = (_e = quote.h) !== null && _e !== void 0 ? _e : quote.high) !== null && _f !== void 0 ? _f : price),
                    low: new library_1.Decimal((_h = (_g = quote.l) !== null && _g !== void 0 ? _g : quote.low) !== null && _h !== void 0 ? _h : price),
                    previousClose: new library_1.Decimal((_k = (_j = quote.pc) !== null && _j !== void 0 ? _j : quote.previousClose) !== null && _k !== void 0 ? _k : price),
                    timestamp: new Date(),
                    currency: "USD",
                    name: quote.name,
                    exchange: quote.exchange,
                };
            }
            catch (error) {
                logger_1.logger.error("StockService quote fetch failed", {
                    symbol,
                    error: error instanceof Error ? error.message : "unknown",
                });
                throw error;
            }
        });
    }
    searchSymbols(query, exchange) {
        return __awaiter(this, void 0, void 0, function* () {
            const trimmed = query.trim().toUpperCase();
            if (!trimmed) {
                return [];
            }
            try {
                const response = yield this.client.get("/finnhub/latest");
                const data = response.data;
                if (!Array.isArray(data)) {
                    return [];
                }
                return data
                    .filter((row) => {
                    if (exchange && row.exchange !== exchange) {
                        return false;
                    }
                    return (row.symbol.includes(trimmed) ||
                        (row.name && row.name.toUpperCase().includes(trimmed)));
                })
                    .map((row) => {
                    var _a;
                    return ({
                        symbol: row.symbol,
                        displaySymbol: row.symbol,
                        description: (_a = row.name) !== null && _a !== void 0 ? _a : "",
                        type: "Common Stock",
                    });
                })
                    .filter((row) => Boolean(row.symbol));
            }
            catch (error) {
                logger_1.logger.error("StockService search failed", {
                    query,
                    error: error instanceof Error ? error.message : "unknown",
                });
                return [];
            }
        });
    }
    listExchangeSymbols() {
        return __awaiter(this, arguments, void 0, function* (exchange = "US") {
            try {
                const response = yield this.client.get("/finnhub/latest");
                const data = response.data;
                if (!Array.isArray(data)) {
                    return [];
                }
                return data
                    .map((row) => {
                    var _a;
                    return ({
                        symbol: row.symbol,
                        displaySymbol: row.symbol,
                        description: (_a = row.name) !== null && _a !== void 0 ? _a : "",
                        currency: "USD",
                        type: "Common Stock",
                    });
                })
                    .filter((row) => Boolean(row.symbol));
            }
            catch (error) {
                logger_1.logger.error("StockService list failed", {
                    exchange,
                    error: error instanceof Error ? error.message : "unknown",
                });
                console.error(error);
                return [];
            }
        });
    }
}
exports.default = new StockService();
