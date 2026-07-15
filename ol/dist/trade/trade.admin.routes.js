"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const trade_admin_controller_1 = __importDefault(require("./trade.admin.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const trade_admin_validation_1 = require("./trade.admin.validation");
const trade_validation_1 = require("./trade.validation");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   - name: Admin Trades
 *     description: Administrative tools to review, resolve, and cancel user trades
 */
/**
 * @swagger
 * /api/admin/trades:
 *   get:
 *     summary: List trades with filtering options
 *     tags: [Admin Trades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: symbol
 *         schema:
 *           type: string
 *       - in: query
 *         name: result
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Trades retrieved successfully
 */
router.get("/", auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin, trade_admin_validation_1.adminTradeFiltersValidator, validation_middleware_1.validationMiddleware, (req, res) => trade_admin_controller_1.default.getAllTrades(req, res));
/**
 * @swagger
 * /api/admin/trades/stats:
 *   get:
 *     summary: Retrieve aggregate trade statistics
 *     tags: [Admin Trades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics calculated successfully
 */
router.get("/stats", auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin, validation_middleware_1.validationMiddleware, (req, res) => trade_admin_controller_1.default.getTradeStats(req, res));
/**
 * @swagger
 * /api/admin/trades/{id}:
 *   get:
 *     summary: Get a single trade by ID
 *     tags: [Admin Trades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trade retrieved successfully
 *       404:
 *         description: Trade not found
 */
router.get("/:id", auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin, trade_validation_1.tradeIdParamValidator, validation_middleware_1.validationMiddleware, (req, res) => trade_admin_controller_1.default.getTrade(req, res));
/**
 * @swagger
 * /api/admin/trades/{id}/resolve:
 *   post:
 *     summary: Resolve a trade manually
 *     tags: [Admin Trades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               result:
 *                 type: string
 *                 enum: [won, lost]
 *     responses:
 *       200:
 *         description: Trade resolved
 */
router.post("/:id/resolve", auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin, trade_validation_1.tradeIdParamValidator, trade_admin_validation_1.adminResolveTradeValidator, validation_middleware_1.validationMiddleware, (req, res) => trade_admin_controller_1.default.resolveTrade(req, res));
/**
 * @swagger
 * /api/admin/trades/{id}/cancel:
 *   post:
 *     summary: Cancel an open trade and refund the user
 *     tags: [Admin Trades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trade canceled
 */
router.post("/:id/cancel", auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin, trade_validation_1.tradeIdParamValidator, validation_middleware_1.validationMiddleware, (req, res) => trade_admin_controller_1.default.cancelTrade(req, res));
/**
 * @swagger
 * /api/admin/trades/user/{userId}/resolve-all:
 *   post:
 *     summary: Resolve all open trades for a user based on profile trade status
 *     tags: [Admin Trades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trades resolved
 */
router.post("/user/:userId/resolve-all", auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin, trade_admin_validation_1.adminUserIdParamValidator, validation_middleware_1.validationMiddleware, (req, res) => trade_admin_controller_1.default.resolveAllUserTrades(req, res));
exports.default = router;
