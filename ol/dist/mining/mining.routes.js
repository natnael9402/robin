"use strict";
/**
 * @swagger
 * tags:
 *   - name: Mining
 *     description: Mining pool and hosting management
 *
 * /api/mining/products:
 *   get:
 *     summary: Get all active mining products
 *     tags: [Mining]
 *     responses:
 *       200:
 *         description: List of mining products
 *   post:
 *     summary: Create a new mining product
 *     tags: [Mining]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               days:
 *                 type: integer
 *               dailyRate:
 *                 type: number
 *               minAmount:
 *                 type: number
 *               maxAmount:
 *                 type: number
 *               limitTimes:
 *                 type: integer
 *               hashrate:
 *                 type: string
 *               power:
 *                 type: string
 *               networkType:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Mining product created
 *
 * /api/mining/products/{id}:
 *   get:
 *     summary: Get a mining product by ID
 *     tags: [Mining]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Mining product details
 *   put:
 *     summary: Update a mining product
 *     tags: [Mining]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Mining product updated
 *   delete:
 *     summary: Delete a mining product
 *     tags: [Mining]
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
 *         description: Mining product deleted
 *
 * /api/mining/admin/products:
 *   get:
 *     summary: Get all mining products (admin)
 *     tags: [Mining]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all mining products
 *
 * /api/mining/hostings:
 *   get:
 *     summary: Get user's mining hostings
 *     tags: [Mining]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of mining hostings
 *   post:
 *     summary: Create a mining hosting
 *     tags: [Mining]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mining hosting created
 *
 * /api/mining/hostings/{id}:
 *   get:
 *     summary: Get a mining hosting by ID
 *     tags: [Mining]
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
 *         description: Mining hosting details
 *   put:
 *     summary: Update a mining hosting
 *     tags: [Mining]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Mining hosting updated
 *   delete:
 *     summary: Delete a mining hosting
 *     tags: [Mining]
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
 *         description: Mining hosting deleted
 *
 * /api/mining/admin/hostings:
 *   get:
 *     summary: Get all mining hostings (admin)
 *     tags: [Mining]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all mining hostings
 *
 * /api/mining/hostings/{id}/process-profits:
 *   post:
 *     summary: Process profits for a hosting (admin)
 *     tags: [Mining]
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
 *         description: Profits processed
 *
 * /api/mining/hostings/{id}/status:
 *   put:
 *     summary: Update hosting status (admin)
 *     tags: [Mining]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [running, ended, cancelled]
 *     responses:
 *       200:
 *         description: Hosting status updated
 *
 * /api/mining/hostings/{id}/cancel:
 *   post:
 *     summary: Cancel a mining hosting
 *     tags: [Mining]
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
 *         description: Mining hosting cancelled
 *
 * /api/mining/stats:
 *   get:
 *     summary: Get mining stats for the user
 *     tags: [Mining]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mining stats
 *
 * /api/mining/profits:
 *   get:
 *     summary: Get mining profits for the user
 *     tags: [Mining]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mining profits
 */
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const miningProductController = __importStar(require("./mining-product.controller"));
const miningHostingController = __importStar(require("./mining-hosting.controller"));
const miningController = __importStar(require("./mining.controller"));
const mining_validation_1 = require("./mining.validation");
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
// import { authMiddleware } from "../middleware/auth.middleware";
const router = express_1.default.Router();
// Mining Products
router.get("/products", miningProductController.getProducts);
router.get("/products/:id", miningProductController.getProduct);
router.post("/products", auth_middleware_1.authenticateJWT, mining_validation_1.createMiningProductValidator, validation_middleware_1.validationMiddleware, miningProductController.createProduct);
router.put("/products/:id", auth_middleware_1.authenticateJWT, mining_validation_1.updateMiningProductValidator, validation_middleware_1.validationMiddleware, miningProductController.updateProduct);
router.delete("/products/:id", auth_middleware_1.authenticateJWT, miningProductController.deleteProduct);
router.get("/admin/products", auth_middleware_1.authenticateJWT, miningProductController.getAdminProducts);
// User Mining Hostings
router.get("/hostings", auth_middleware_1.authenticateJWT, miningHostingController.getHostings);
router.post("/hostings", auth_middleware_1.authenticateJWT, mining_validation_1.createMiningHostingValidator, validation_middleware_1.validationMiddleware, miningHostingController.createHosting);
router.get("/hostings/:id", auth_middleware_1.authenticateJWT, miningHostingController.getHosting);
router.put("/hostings/:id", auth_middleware_1.authenticateJWT, miningHostingController.updateHosting);
router.delete("/hostings/:id", auth_middleware_1.authenticateJWT, miningHostingController.deleteHosting);
router.get("/admin/hostings", auth_middleware_1.authenticateJWT, miningHostingController.getAdminHostings);
router.post("/hostings/:id/process-profits", auth_middleware_1.authenticateJWT, miningHostingController.processHostingProfits);
router.put("/hostings/:id/status", auth_middleware_1.authenticateJWT, miningHostingController.updateHostingStatus);
router.post("/hostings/:id/cancel", auth_middleware_1.authenticateJWT, miningHostingController.cancelHosting);
router.post("/hostings/:id/pause", auth_middleware_1.authenticateJWT, miningHostingController.pauseHosting);
router.post("/hostings/:id/resume", auth_middleware_1.authenticateJWT, miningHostingController.resumeHosting);
// Mining Profit
router.get("/stats", auth_middleware_1.authenticateJWT, miningController.getStats);
router.get("/profits", auth_middleware_1.authenticateJWT, miningController.getProfits);
exports.default = router;
