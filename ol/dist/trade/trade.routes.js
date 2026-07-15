"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const trade_validation_1 = require("./trade.validation");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const trade_controller_1 = __importDefault(require("./trade.controller"));
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   - name: Trade
 *     description: Trade management endpoints
 *
 * /api/trades/option:
 *   post:
 *     summary: Create an option trade
 *     tags: [Trade]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [symbol, direction, amount, duration]
 *             properties:
 *               symbol:
 *                 type: string
 *               direction:
 *                 type: string
 *                 enum: [buy, sell]
 *               amount:
 *                 type: number
 *                 minimum: 100
 *               duration:
 *                 type: integer
 *                 description: Seconds, must match allowed durations
 *               market_type:
 *                 type: string
 *                 description: Optional market context
 *                 enum: [crypto, metals, stocks]
 *     responses:
 *       201:
 *         description: Option trade created successfully
 *       400:
 *         description: Validation error or trade creation failed
 *
 * /api/trades/contract:
 *   post:
 *     summary: Create a contract trade
 *     tags: [Trade]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [symbol, direction, amount, leverage]
 *             properties:
 *               symbol:
 *                 type: string
 *               direction:
 *                 type: string
 *                 enum: [buy, sell]
 *               amount:
 *                 type: number
 *                 minimum: 10
 *               leverage:
 *                 type: integer
 *               take_profit:
 *                 type: number
 *               stop_loss:
 *                 type: number
 *               market_type:
 *                 type: string
 *                 enum: [crypto, metals, stocks]
 *                 description: Optional market context
 *     responses:
 *       201:
 *         description: Contract trade created successfully
 *       400:
 *         description: Validation error or trade creation failed
 *
 * /api/trades/spot:
 *   post:
 *     summary: Create a spot trade
 *     tags: [Trade]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [symbol, direction, amount]
 *             properties:
 *               symbol:
 *                 type: string
 *               direction:
 *                 type: string
 *                 enum: [buy, sell]
 *               amount:
 *                 type: number
 *                 minimum: 10
 *               from_coin:
 *                 type: string
 *               to_coin:
 *                 type: string
 *               exchange_rate:
 *                 type: number
 *               market_type:
 *                 type: string
 *                 enum: [crypto, metals, stocks]
 *     responses:
 *       201:
 *         description: Spot trade created successfully
 *       400:
 *         description: Validation error or trade creation failed
 *
 * /api/trades/stocks:
 *   post:
 *     summary: Execute a stock trade using Finnhub pricing
 *     tags: [Trade]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [symbol, direction, shares]
 *             properties:
 *               symbol:
 *                 type: string
 *                 description: Stock ticker symbol
 *               direction:
 *                 type: string
 *                 enum: [buy, sell]
 *               shares:
 *                 type: number
 *                 minimum: 0.0001
 *     responses:
 *       201:
 *         description: Stock trade executed successfully
 *       400:
 *         description: Validation error or trade creation failed
 *
 * /api/trades/stocks/search:
 *   get:
 *     summary: Search stock symbols via Finnhub
 *     tags: [Trade]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Partial ticker or company name
 *       - in: query
 *         name: exchange
 *         schema:
 *           type: string
 *         description: Optional exchange filter (e.g. US)
 *     responses:
 *       200:
 *         description: Matching stock symbols
 *
 * /api/trades/stocks/popular:
 *   get:
 *     summary: List exchange symbols from Finnhub
 *     tags: [Trade]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: exchange
 *         schema:
 *           type: string
 *         description: Exchange filter (defaults to US)
 *     responses:
 *       200:
 *         description: List of symbols
 *
 * /api/trade:
 *   get:
 *     summary: Get trades for the authenticated user
 *     tags: [Trade]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: result
 *         schema:
 *           type: string
 *       - in: query
 *         name: symbol
 *         schema:
 *           type: string
 *       - in: query
 *         name: direction
 *         schema:
 *           type: string
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort_dir
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: List of trades with pagination metadata
 *       400:
 *         description: Invalid query parameters
 *
 * /api/trades/stats:
 *   get:
 *     summary: Get trade statistics for the authenticated user
 *     tags: [Trade]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Aggregate trade statistics
 *       400:
 *         description: Invalid query parameters
 *
 * /api/trades/{id}:
 *   get:
 *     summary: Get a specific trade by ID
 *     tags: [Trade]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Trade details
 *       404:
 *         description: Trade not found
 *       400:
 *         description: Invalid trade ID
 *
 * /api/trades/{id}/cancel:
 *   post:
 *     summary: Cancel a trade by ID
 *     tags: [Trade]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Trade canceled successfully
 *       404:
 *         description: Trade not found or cannot be canceled
 *       400:
 *         description: Invalid trade ID
 *
 * /api/trades/price/{symbol}:
 *   get:
 *     summary: Get the current market price for a symbol
 *     tags: [Trade]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: market_type
 *         schema:
 *           type: string
 *           enum: [crypto, metals, stocks]
 *         description: Optional price source override
 *     responses:
 *       200:
 *         description: Current market price data
 *       400:
 *         description: Invalid symbol or price fetch failed
 */
router.post("/option", auth_middleware_1.authenticateJWT, trade_validation_1.optionTradeValidator, validation_middleware_1.validationMiddleware, (req, res) => trade_controller_1.default.createOptionTrade(req, res));
router.post("/contract", auth_middleware_1.authenticateJWT, trade_validation_1.contractTradeValidator, validation_middleware_1.validationMiddleware, (req, res) => trade_controller_1.default.createContractTrade(req, res));
router.post("/spot", auth_middleware_1.authenticateJWT, trade_validation_1.spotTradeValidator, validation_middleware_1.validationMiddleware, (req, res) => trade_controller_1.default.createSpotTrade(req, res));
router.post("/stocks", auth_middleware_1.authenticateJWT, trade_validation_1.stockTradeValidator, validation_middleware_1.validationMiddleware, (req, res) => trade_controller_1.default.createStockTrade(req, res));
router.get("/stocks/search", auth_middleware_1.authenticateJWT, trade_validation_1.stockSearchValidator, validation_middleware_1.validationMiddleware, (req, res) => trade_controller_1.default.searchStocks(req, res));
router.get("/stocks/popular", auth_middleware_1.authenticateJWT, trade_validation_1.stockExchangeValidator, validation_middleware_1.validationMiddleware, (req, res) => trade_controller_1.default.listPopularStocks(req, res));
router.get("/", auth_middleware_1.authenticateJWT, trade_validation_1.tradeFiltersValidator, validation_middleware_1.validationMiddleware, (req, res) => trade_controller_1.default.getUserTrades(req, res));
router.get("/stats", auth_middleware_1.authenticateJWT, trade_validation_1.tradeFiltersValidator, validation_middleware_1.validationMiddleware, (req, res) => trade_controller_1.default.getTradeStats(req, res));
router.get("/:id", auth_middleware_1.authenticateJWT, trade_validation_1.tradeIdParamValidator, validation_middleware_1.validationMiddleware, (req, res) => trade_controller_1.default.getTrade(req, res));
router.post("/:id/cancel", auth_middleware_1.authenticateJWT, trade_validation_1.tradeIdParamValidator, validation_middleware_1.validationMiddleware, (req, res) => trade_controller_1.default.cancelTrade(req, res));
router.get("/price/:symbol", auth_middleware_1.authenticateJWT, trade_validation_1.marketPriceParamValidator, validation_middleware_1.validationMiddleware, (req, res) => trade_controller_1.default.getMarketPrice(req, res));
exports.default = router;
