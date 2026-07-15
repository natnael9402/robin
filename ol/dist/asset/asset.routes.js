"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asset_controller_1 = __importDefault(require("./asset.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const asset_validation_1 = require("./asset.validation");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   - name: Assets
 *     description: Manage asset balances and valuations for authenticated users
 */
/**
 * @swagger
 * /api/assets:
 *   get:
 *     summary: List asset balances for the authenticated user
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Asset balances retrieved successfully
 *       401:
 *         description: Unauthorized – missing or invalid token
 */
router.get("/", auth_middleware_1.authenticateJWT, (req, res) => asset_controller_1.default.getUserAssets(req, res));
/**
 * @swagger
 * /api/assets/total-value:
 *   get:
 *     summary: Get the total USD value of the user's asset portfolio
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total asset value calculated
 *       401:
 *         description: Unauthorized – missing or invalid token
 */
router.get("/total-value", auth_middleware_1.authenticateJWT, (req, res) => asset_controller_1.default.getTotalAssetValue(req, res));
/**
 * @swagger
 * /api/assets/update-prices:
 *   post:
 *     summary: Refresh cached asset prices
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Asset prices refreshed successfully
 *       401:
 *         description: Unauthorized – missing or invalid token
 */
router.post("/update-prices", auth_middleware_1.authenticateJWT, (req, res) => asset_controller_1.default.updateAssetPrices(req, res));
/**
 * @swagger
 * /api/assets/process-trade/{id}:
 *   post:
 *     summary: Apply a completed spot trade to the user's asset balances
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifier of the spot trade to process
 *     responses:
 *       200:
 *         description: Spot trade processed and asset balances updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized – missing or invalid token
 */
router.post("/process-trade/:id", auth_middleware_1.authenticateJWT, asset_validation_1.processTradeParamValidator, validation_middleware_1.validationMiddleware, (req, res) => asset_controller_1.default.processSpotTrade(req, res));
exports.default = router;
