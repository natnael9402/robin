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
exports.TradeController = void 0;
const trade_service_1 = __importDefault(require("./trade.service"));
const trade_scheduler_1 = __importDefault(require("./jobs/trade.scheduler"));
class TradeController {
    constructor(service = trade_service_1.default) {
        this.service = service;
    }
    createOptionTrade(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    return res.status(401).json({ error: "Unauthorized" });
                }
                const trade = yield this.service.createOptionTrade(BigInt(req.user.id), {
                    symbol: req.body.symbol,
                    direction: req.body.direction,
                    amount: Number(req.body.amount),
                    duration: Number(req.body.duration),
                    marketType: typeof req.body.market_type === "string"
                        ? req.body.market_type
                        : undefined,
                });
                trade_scheduler_1.default.scheduleOptionResolution(BigInt(trade.id), Number(req.body.duration));
                return res.status(201).json({
                    message: "Option trade created successfully",
                    trade,
                });
            }
            catch (error) {
                return res.status(400).json({ error: error.message });
            }
        });
    }
    createContractTrade(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    return res.status(401).json({ error: "Unauthorized" });
                }
                const trade = yield this.service.createContractTrade(BigInt(req.user.id), {
                    symbol: req.body.symbol,
                    direction: req.body.direction,
                    amount: Number(req.body.amount),
                    leverage: Number(req.body.leverage),
                    takeProfit: req.body.take_profit
                        ? Number(req.body.take_profit)
                        : undefined,
                    stopLoss: req.body.stop_loss ? Number(req.body.stop_loss) : undefined,
                    marketType: typeof req.body.market_type === "string"
                        ? req.body.market_type
                        : undefined,
                });
                trade_scheduler_1.default.scheduleContractCheck(BigInt(trade.id), 15);
                return res.status(201).json({
                    message: "Contract trade created successfully",
                    trade,
                });
            }
            catch (error) {
                return res.status(400).json({ error: error.message });
            }
        });
    }
    createSpotTrade(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    return res.status(401).json({ error: "Unauthorized" });
                }
                const trade = yield this.service.createSpotTrade(BigInt(req.user.id), {
                    symbol: req.body.symbol,
                    direction: req.body.direction,
                    amount: Number(req.body.amount),
                    fromCoin: req.body.from_coin,
                    toCoin: req.body.to_coin,
                    exchangeRate: req.body.exchange_rate
                        ? Number(req.body.exchange_rate)
                        : undefined,
                    marketType: typeof req.body.market_type === "string"
                        ? req.body.market_type
                        : undefined,
                });
                return res.status(201).json({
                    message: "Spot trade created successfully",
                    trade,
                });
            }
            catch (error) {
                return res.status(400).json({ error: error.message });
            }
        });
    }
    createStockTrade(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    return res.status(401).json({ error: "Unauthorized" });
                }
                const trade = yield this.service.createStockTrade(BigInt(req.user.id), {
                    symbol: req.body.symbol,
                    direction: req.body.direction,
                    shares: Number(req.body.shares),
                    exchangeRate: req.body.exchange_rate
                        ? Number(req.body.exchange_rate)
                        : undefined,
                });
                return res.status(201).json({
                    message: "Stock trade executed successfully",
                    trade,
                });
            }
            catch (error) {
                return res.status(400).json({ error: error.message });
            }
        });
    }
    searchStocks(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    return res.status(401).json({ error: "Unauthorized" });
                }
                const query = typeof req.query.query === "string" ? req.query.query : req.body.query;
                if (!query || typeof query !== "string") {
                    return res.status(400).json({ error: "Query is required" });
                }
                const exchange = typeof req.query.exchange === "string"
                    ? req.query.exchange
                    : undefined;
                const results = yield this.service.searchStocks(query, exchange);
                return res.json({
                    success: true,
                    data: results,
                });
            }
            catch (error) {
                return res.status(400).json({ error: error.message });
            }
        });
    }
    listPopularStocks(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    return res.status(401).json({ error: "Unauthorized" });
                }
                const exchange = typeof req.query.exchange === "string"
                    ? req.query.exchange
                    : undefined;
                const results = yield this.service.listPopularStocks(exchange);
                return res.json({
                    success: true,
                    data: results,
                });
            }
            catch (error) {
                return res.status(400).json({ error: error.message });
            }
        });
    }
    getUserTrades(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    return res.status(401).json({ error: "Unauthorized" });
                }
                const trades = yield this.service.getUserTrades(BigInt(req.user.id), {
                    type: req.query.type,
                    status: req.query.status,
                    result: req.query.result,
                    symbol: req.query.symbol,
                    direction: req.query.direction,
                    dateFrom: req.query.date_from,
                    dateTo: req.query.date_to,
                    sortBy: req.query.sort_by,
                    sortDir: req.query.sort_dir,
                    page: req.query.page ? Number(req.query.page) : undefined,
                    perPage: req.query.per_page
                        ? Number(req.query.per_page) + 90
                        : undefined,
                });
                const { data, meta } = trades;
                const totalPages = meta.totalPages === 0 ? 1 : meta.totalPages;
                const host = (_b = req.get("host")) !== null && _b !== void 0 ? _b : "localhost";
                const path = `${(_c = req.protocol) !== null && _c !== void 0 ? _c : "http"}://${host}${req.baseUrl}`;
                const normalizePath = path.endsWith("/") ? path.slice(0, -1) : path;
                const toSearchParams = () => {
                    const params = new URLSearchParams();
                    const query = req.query;
                    for (const [key, value] of Object.entries(query)) {
                        if (value === undefined)
                            continue;
                        if (Array.isArray(value)) {
                            value.forEach((item) => params.append(key, String(item)));
                        }
                        else {
                            params.set(key, String(value));
                        }
                    }
                    if (!params.has("per_page")) {
                        params.set("per_page", String(meta.perPage));
                    }
                    return params;
                };
                const buildPageUrl = (pageNumber) => {
                    if (!pageNumber || pageNumber < 1 || pageNumber > totalPages) {
                        return null;
                    }
                    const params = toSearchParams();
                    params.set("page", String(pageNumber));
                    const queryString = params.toString();
                    return `${normalizePath}?${queryString}`;
                };
                const from = meta.total === 0 ? null : (meta.page - 1) * meta.perPage + 1;
                const to = meta.total === 0 || from === null ? null : from + data.length - 1;
                const links = [];
                links.push({
                    url: buildPageUrl(meta.page - 1),
                    label: "&laquo; Previous",
                    active: false,
                });
                for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
                    links.push({
                        url: buildPageUrl(pageNumber),
                        label: String(pageNumber),
                        active: pageNumber === meta.page,
                    });
                }
                links.push({
                    url: buildPageUrl(meta.page + 1),
                    label: "Next &raquo;",
                    active: false,
                });
                return res.json({
                    trades: {
                        data,
                        current_page: meta.page,
                        per_page: meta.perPage,
                        total: meta.total,
                        last_page: totalPages,
                        from,
                        to,
                        path: normalizePath,
                        first_page_url: buildPageUrl(1),
                        last_page_url: buildPageUrl(totalPages),
                        next_page_url: buildPageUrl(meta.page + 1),
                        prev_page_url: buildPageUrl(meta.page - 1),
                        links,
                    },
                });
            }
            catch (error) {
                return res.status(400).json({ error: error.message });
            }
        });
    }
    getTrade(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    return res.status(401).json({ error: "Unauthorized" });
                }
                const tradeId = BigInt(req.params.id);
                const trade = yield this.service.getTrade(BigInt(req.user.id), tradeId);
                if (!trade) {
                    return res.status(404).json({ error: "Trade not found" });
                }
                return res.json({ trade });
            }
            catch (error) {
                return res.status(400).json({ error: error.message });
            }
        });
    }
    getTradeStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    return res.status(401).json({ error: "Unauthorized" });
                }
                const stats = yield this.service.getTradeStats(BigInt(req.user.id), {
                    dateFrom: req.query.date_from,
                    dateTo: req.query.date_to,
                });
                return res.json(stats);
            }
            catch (error) {
                return res.status(400).json({ error: error.message });
            }
        });
    }
    cancelTrade(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    return res.status(401).json({ error: "Unauthorized" });
                }
                const tradeId = BigInt(req.params.id);
                const trade = yield this.service.cancelTrade(BigInt(req.user.id), tradeId);
                if (!trade) {
                    return res
                        .status(404)
                        .json({ error: "Trade not found or not cancellable" });
                }
                if (trade.type === "contract") {
                    trade_scheduler_1.default.clearContractCheck(BigInt(trade.id));
                }
                return res.json({
                    message: "Trade canceled successfully",
                    trade,
                });
            }
            catch (error) {
                return res.status(400).json({ error: error.message });
            }
        });
    }
    getMarketPrice(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    return res.status(401).json({ error: "Unauthorized" });
                }
                const { symbol } = req.params;
                const marketType = typeof req.query.market_type === "string"
                    ? req.query.market_type
                    : undefined;
                const price = yield this.service.getMarketPrice(symbol, marketType);
                return res.json(price);
            }
            catch (error) {
                return res.status(400).json({ error: error.message });
            }
        });
    }
}
exports.TradeController = TradeController;
exports.default = new TradeController();
