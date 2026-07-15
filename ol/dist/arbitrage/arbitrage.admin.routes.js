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
const arbitrage_admin_validation_1 = require("./arbitrage.admin.validation");
const adminController = __importStar(require("./arbitrage.admin.controller"));
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   - name: Admin Arbitrage
 *     description: Administrative management for arbitrage products and hostings
 */
router.use(auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin);
/**
 * @swagger
 * /api/admin/arbitrage/products:
 *   get:
 *     summary: List arbitrage products
 *     description: Returns paginated arbitrage product definitions available for purchase.
 *     tags: [Admin Arbitrage]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get("/products", adminController.listProducts);
/**
 * @swagger
 * /api/admin/arbitrage/products/{id}:
 *   get:
 *     summary: Get a specific arbitrage product
 *     tags: [Admin Arbitrage]
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
 *         description: Product details returned
 *       404:
 *         description: Product not found
 */
router.get("/products/:id", arbitrage_admin_validation_1.adminArbitrageIdParamValidator, validation_middleware_1.validationMiddleware, adminController.getProduct);
/**
 * @swagger
 * /api/admin/arbitrage/products:
 *   post:
 *     summary: Create a new arbitrage product
 *     tags: [Admin Arbitrage]
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
 *               supported_currencies:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error
 */
router.post("/products", arbitrage_admin_validation_1.adminCreateArbitrageProductValidator, validation_middleware_1.validationMiddleware, adminController.createProduct);
/**
 * @swagger
 * /api/admin/arbitrage/products/{id}:
 *   put:
 *     summary: Update an arbitrage product
 *     tags: [Admin Arbitrage]
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
 *               supported_currencies:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Validation error
 */
router.put("/products/:id", arbitrage_admin_validation_1.adminArbitrageIdParamValidator, arbitrage_admin_validation_1.adminUpdateArbitrageProductValidator, validation_middleware_1.validationMiddleware, adminController.updateProduct);
/**
 * @swagger
 * /api/admin/arbitrage/products/{id}:
 *   delete:
 *     summary: Delete an arbitrage product
 *     tags: [Admin Arbitrage]
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
router.delete("/products/:id", arbitrage_admin_validation_1.adminArbitrageIdParamValidator, validation_middleware_1.validationMiddleware, adminController.deleteProduct);
/**
 * @swagger
 * /api/admin/arbitrage/hostings:
 *   get:
 *     summary: List arbitrage hostings
 *     tags: [Admin Arbitrage]
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
router.get("/hostings", arbitrage_admin_validation_1.adminArbitrageHostingsQueryValidator, validation_middleware_1.validationMiddleware, adminController.listHostings);
/**
 * @swagger
 * /api/admin/arbitrage/hostings/{id}:
 *   get:
 *     summary: Get details for a single arbitrage hosting
 *     tags: [Admin Arbitrage]
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
 *         description: Hosting returned successfully
 *       404:
 *         description: Hosting not found
 */
router.get("/hostings/:id", arbitrage_admin_validation_1.adminArbitrageIdParamValidator, validation_middleware_1.validationMiddleware, adminController.getHosting);
/**
 * @swagger
 * /api/admin/arbitrage/hostings/{id}/process-profits:
 *   post:
 *     summary: Process profits for an arbitrage hosting
 *     tags: [Admin Arbitrage]
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
router.post("/hostings/:id/process-profits", arbitrage_admin_validation_1.adminArbitrageIdParamValidator, validation_middleware_1.validationMiddleware, adminController.processHostingProfits);
/**
 * @swagger
 * /api/admin/arbitrage/hostings/{id}/status:
 *   put:
 *     summary: Update arbitrage hosting status
 *     tags: [Admin Arbitrage]
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
router.put("/hostings/:id/status", arbitrage_admin_validation_1.adminArbitrageIdParamValidator, arbitrage_admin_validation_1.adminUpdateArbitrageHostingStatusValidator, validation_middleware_1.validationMiddleware, adminController.updateHostingStatus);
/**
 * @swagger
 * /api/admin/arbitrage/hostings/{id}:
 *   delete:
 *     summary: Delete an arbitrage hosting record
 *     tags: [Admin Arbitrage]
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
router.delete("/hostings/:id", arbitrage_admin_validation_1.adminArbitrageIdParamValidator, validation_middleware_1.validationMiddleware, adminController.deleteHosting);
exports.default = router;
