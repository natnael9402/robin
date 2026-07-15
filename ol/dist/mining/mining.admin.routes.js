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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const mining_admin_validation_1 = require("./mining.admin.validation");
const adminController = __importStar(require("./mining.admin.controller"));
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   - name: Admin Mining
 *     description: Administrative management for mining products and hostings
 */
router.use(auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin);
/**
 * @swagger
 * /api/admin/mining/products:
 *   get:
 *     summary: List mining products
 *     tags: [Admin Mining]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get("/products", adminController.listProducts);
/**
 * @swagger
 * /api/admin/mining/products/{id}:
 *   get:
 *     summary: Retrieve a mining product
 *     tags: [Admin Mining]
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
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get("/products/:id", mining_admin_validation_1.adminHostingIdParamValidator, validation_middleware_1.validationMiddleware, adminController.getProduct);
/**
 * @swagger
 * /api/admin/mining/products:
 *   post:
 *     summary: Create a mining product
 *     tags: [Admin Mining]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - days
 *               - daily_rate
 *               - min_amount
 *               - max_amount
 *             properties:
 *               name:
 *                 type: string
 *               days:
 *                 type: integer
 *               daily_rate:
 *                 type: number
 *               min_amount:
 *                 type: number
 *               max_amount:
 *                 type: number
 *               image:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Product created successfully
 */
router.post("/products", mining_admin_validation_1.adminCreateMiningProductValidator, validation_middleware_1.validationMiddleware, adminController.createProduct);
/**
 * @swagger
 * /api/admin/mining/products/{id}:
 *   put:
 *     summary: Update a mining product
 *     tags: [Admin Mining]
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
 *               name:
 *                 type: string
 *               days:
 *                 type: integer
 *               daily_rate:
 *                 type: number
 *               min_amount:
 *                 type: number
 *               max_amount:
 *                 type: number
 *               image:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product updated successfully
 */
router.put("/products/:id", mining_admin_validation_1.adminHostingIdParamValidator, mining_admin_validation_1.adminUpdateMiningProductValidator, validation_middleware_1.validationMiddleware, adminController.updateProduct);
/**
 * @swagger
 * /api/admin/mining/products/{id}:
 *   delete:
 *     summary: Delete a mining product
 *     tags: [Admin Mining]
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
 *         description: Product deleted successfully
 */
router.delete("/products/:id", mining_admin_validation_1.adminHostingIdParamValidator, validation_middleware_1.validationMiddleware, adminController.deleteProduct);
/**
 * @swagger
 * /api/admin/mining/hostings:
 *   get:
 *     summary: List mining hostings
 *     tags: [Admin Mining]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hostings retrieved successfully
 */
router.get("/hostings", mining_admin_validation_1.adminGetHostingsQueryValidator, validation_middleware_1.validationMiddleware, adminController.listHostings);
/**
 * @swagger
 * /api/admin/mining/hostings/{id}:
 *   get:
 *     summary: Get a mining hosting
 *     tags: [Admin Mining]
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
 *         description: Hosting retrieved successfully
 *       404:
 *         description: Hosting not found
 */
router.get("/hostings/:id", mining_admin_validation_1.adminHostingIdParamValidator, validation_middleware_1.validationMiddleware, adminController.getHosting);
/**
 * @swagger
 * /api/admin/mining/hostings/{id}/process-profits:
 *   post:
 *     summary: Process profits for a mining hosting
 *     tags: [Admin Mining]
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
 *         description: Profits processed successfully
 */
router.post("/hostings/:id/process-profits", mining_admin_validation_1.adminHostingIdParamValidator, validation_middleware_1.validationMiddleware, adminController.processHostingProfits);
/**
 * @swagger
 * /api/admin/mining/hostings/{id}/status:
 *   put:
 *     summary: Update mining hosting status
 *     tags: [Admin Mining]
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
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Hosting status updated successfully
 */
router.put("/hostings/:id/status", mining_admin_validation_1.adminHostingIdParamValidator, mining_admin_validation_1.adminUpdateHostingStatusValidator, validation_middleware_1.validationMiddleware, adminController.updateHostingStatus);
/**
 * @swagger
 * /api/admin/mining/hostings/{id}:
 *   delete:
 *     summary: Delete a mining hosting record
 *     tags: [Admin Mining]
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
 *         description: Hosting deleted successfully
 */
router.delete("/hostings/:id", mining_admin_validation_1.adminHostingIdParamValidator, validation_middleware_1.validationMiddleware, adminController.deleteHosting);
exports.default = router;
