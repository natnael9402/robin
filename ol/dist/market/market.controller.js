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
exports.MarketController = void 0;
const market_service_1 = __importDefault(require("./market.service"));
const http_response_1 = require("../utils/http-response");
const parseLimit = (value, fallback) => {
    if (value === undefined || value === null || value === "") {
        return fallback;
    }
    const raw = Array.isArray(value) ? value[0] : value;
    const parsed = Number.parseInt(String(raw), 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
        return fallback;
    }
    return parsed;
};
class MarketController {
    constructor(service = market_service_1.default) {
        this.service = service;
    }
    getCurrentPrice(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const symbol = String(req.query.symbol || req.params.symbol);
                const market = req.query.market;
                const { price, market: resolvedMarket } = yield this.service.getCurrentPrice(symbol, market);
                return (0, http_response_1.successResponse)(res, {
                    symbol,
                    market: resolvedMarket,
                    price: price.toString(),
                }, "Current price retrieved successfully");
            }
            catch (error) {
                const err = error;
                return (0, http_response_1.errorResponse)(res, "Failed to fetch market price", 500, err.message);
            }
        });
    }
    searchTickers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = String(req.query.query);
                const market = req.query.market;
                const limit = parseLimit(req.query.limit, 10);
                const results = yield this.service.searchTickers(query, market, limit);
                return (0, http_response_1.successResponse)(res, results, "Tickers retrieved successfully");
            }
            catch (error) {
                const err = error;
                return (0, http_response_1.errorResponse)(res, "Failed to search tickers", 500, err.message);
            }
        });
    }
    getHistoricalData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const symbol = String(req.query.symbol);
                const market = req.query.market;
                const interval = req.query.interval;
                const limit = parseLimit(req.query.limit, 100);
                const data = yield this.service.getHistoricalData(symbol, market, interval, limit);
                return (0, http_response_1.successResponse)(res, data, "Historical data retrieved successfully");
            }
            catch (error) {
                const err = error;
                const status = err.message.includes("not implemented") ? 501 : 500;
                return (0, http_response_1.errorResponse)(res, "Failed to fetch historical data", status, err.message);
            }
        });
    }
    getMarketStatus(_req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const status = yield this.service.getMarketStatus();
                return (0, http_response_1.successResponse)(res, status, "Market status retrieved successfully");
            }
            catch (error) {
                const err = error;
                return (0, http_response_1.errorResponse)(res, "Failed to fetch market status", 500, err.message);
            }
        });
    }
    getMarketList(_req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const list = yield this.service.getMarketList();
                return (0, http_response_1.successResponse)(res, list, "Market list retrieved successfully");
            }
            catch (error) {
                const err = error;
                return (0, http_response_1.errorResponse)(res, "Failed to fetch market list", 500, err.message);
            }
        });
    }
}
exports.MarketController = MarketController;
exports.default = new MarketController();
