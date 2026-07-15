"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const market_controller_1 = __importDefault(require("./market.controller"));
const validation_middleware_1 = require("../middleware/validation.middleware");
const market_validation_1 = require("./market.validation");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   - name: Market
 *     description: Market data endpoints
 */
/**
 * @swagger
 * /api/market/list:
 *   get:
 *     summary: Retrieve unified market list (crypto, stocks, metals)
 *     tags: [Market]
 *     responses:
 *       200:
 *         description: Market list retrieved successfully
 */
router.get("/list", (req, res) => market_controller_1.default.getMarketList(req, res));
/**
 * @swagger
 * /api/market/price/{symbol}:
 *   get:
 *     summary: Retrieve the latest market price for a symbol (legacy path)
 *     tags: [Market]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         schema:
 *           type: string
 *         required: true
 *         description: Trading pair or market symbol (e.g. BTCUSDT)
 *       - in: query
 *         name: market
 *         schema:
 *           type: string
 *           enum: [crypto, forex, metals, stocks, indices]
 *         required: false
 *         description: Market type to query
 *     responses:
 *       200:
 *         description: Current price retrieved successfully
 */
router.get("/price/:symbol", (req, _res, next) => {
    var _a;
    const symbol = (_a = req.params.symbol) !== null && _a !== void 0 ? _a : "";
    // req.query = {
    //   ...req.query,
    //   symbol,
    // };
    return next();
}, market_validation_1.marketPriceValidator, validation_middleware_1.validationMiddleware, (req, res) => market_controller_1.default.getCurrentPrice(req, res));
/**
 * @swagger
 * /api/market/price:
 *   get:
 *     summary: Retrieve the latest market price for a symbol
 *     tags: [Market]
 *     parameters:
 *       - in: query
 *         name: symbol
 *         schema:
 *           type: string
 *         required: true
 *         description: Trading pair or market symbol (e.g. BTCUSDT)
 *       - in: query
 *         name: market
 *         schema:
 *           type: string
 *           enum: [crypto, forex, metals, stocks, indices]
 *         required: false
 *         description: Market type to query
 *     responses:
 *       200:
 *         description: Current price retrieved successfully
 */
router.get("/price", market_validation_1.marketPriceValidator, validation_middleware_1.validationMiddleware, (req, res) => market_controller_1.default.getCurrentPrice(req, res));
/**
 * @swagger
 * /api/market/historical/{symbol}:
 *   get:
 *     summary: Retrieve historical price data for a symbol (legacy path)
 *     tags: [Market]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         schema:
 *           type: string
 *         required: true
 *         description: Trading pair or market symbol
 *       - in: query
 *         name: market
 *         schema:
 *           type: string
 *           enum: [crypto, forex, metals, stocks, indices]
 *         required: false
 *         description: Market type to query
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           enum: [1m, 5m, 15m, 30m, 1h, 2h, 4h, 1d, 1w, 1M]
 *         required: false
 *         description: Candle interval (default 1d)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Number of records to return (default 100)
 *     responses:
 *       200:
 *         description: Historical data retrieved successfully
 */
router.get("/historical/:symbol", (req, _res, next) => {
    var _a;
    const symbol = (_a = req.params.symbol) !== null && _a !== void 0 ? _a : "";
    req.query = Object.assign(Object.assign({}, req.query), { symbol });
    return next();
}, market_validation_1.marketHistoricalValidator, validation_middleware_1.validationMiddleware, (req, res) => market_controller_1.default.getHistoricalData(req, res));
/**
 * @swagger
 * /api/market/search:
 *   get:
 *     summary: Search for supported market tickers
 *     tags: [Market]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Partial ticker or instrument name
 *       - in: query
 *         name: market
 *         schema:
 *           type: string
 *           enum: [crypto, forex, metals, stocks, indices]
 *         required: false
 *         description: Market type to limit search results
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Maximum number of results to return (default 10)
 *     responses:
 *       200:
 *         description: Tickers retrieved successfully
 */
router.get("/search", market_validation_1.marketSearchValidator, validation_middleware_1.validationMiddleware, (req, res) => market_controller_1.default.searchTickers(req, res));
/**
 * @swagger
 * /api/market/historical:
 *   get:
 *     summary: Retrieve historical price data for a symbol
 *     tags: [Market]
 *     parameters:
 *       - in: query
 *         name: symbol
 *         schema:
 *           type: string
 *         required: true
 *         description: Trading pair or market symbol
 *       - in: query
 *         name: market
 *         schema:
 *           type: string
 *           enum: [crypto, forex, metals, stocks, indices]
 *         required: false
 *         description: Market type to query
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           enum: [1m, 5m, 15m, 30m, 1h, 2h, 4h, 1d, 1w, 1M]
 *         required: false
 *         description: Candle interval (default 1d)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Number of records to return (default 100)
 *     responses:
 *       200:
 *         description: Historical data retrieved successfully
 */
router.get("/historical", market_validation_1.marketHistoricalValidator, validation_middleware_1.validationMiddleware, (req, res) => market_controller_1.default.getHistoricalData(req, res));
/**
 * @swagger
 * /api/market/status:
 *   get:
 *     summary: Retrieve market open/close status
 *     tags: [Market]
 *     responses:
 *       200:
 *         description: Market status retrieved successfully
 */
router.get("/status", (req, res) => market_controller_1.default.getMarketStatus(req, res));
exports.default = router;
