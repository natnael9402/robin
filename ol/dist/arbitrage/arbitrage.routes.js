"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const arbitrage_product_controller_1 = require("./arbitrage-product.controller");
const arbitrage_hosting_controller_1 = require("./arbitrage-hosting.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const router = (0, express_1.Router)();
const productController = new arbitrage_product_controller_1.ArbitrageProductController();
const hostingController = new arbitrage_hosting_controller_1.ArbitrageHostingController();
/**
 * @swagger
 * tags:
 *   name: Arbitrage
 *   description: Arbitrage trading management
 */
/**
 * @swagger
 * /api/arbitrage/products:
 *   get:
 *     summary: Get all active arbitrage products
 *     tags: [Arbitrage]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active arbitrage products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ArbitrageProduct'
 */
router.get("/products", auth_middleware_1.authenticateJWT, productController.getActiveProducts);
/**
 * @swagger
 * /api/arbitrage/products/{id}:
 *   get:
 *     summary: Get arbitrage product by ID
 *     tags: [Arbitrage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The product ID
 *     responses:
 *       200:
 *         description: The arbitrage product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ArbitrageProduct'
 *       404:
 *         description: Product not found
 */
router.get("/products/:id", auth_middleware_1.authenticateJWT, productController.getProductById);
/**
 * @swagger
 * /api/arbitrage/products:
 *   post:
 *     summary: Create a new arbitrage product (Admin only)
 *     tags: [Arbitrage]
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
 */
router.post("/products", auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin, productController.createProduct);
/**
 * @swagger
 * /api/arbitrage/products/{id}:
 *   put:
 *     summary: Update arbitrage product (Admin only)
 *     tags: [Arbitrage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The product ID
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
 */
router.put("/products/:id", auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin, productController.updateProduct);
/**
 * @swagger
 * /api/arbitrage/products/{id}:
 *   delete:
 *     summary: Delete arbitrage product (Admin only)
 *     tags: [Arbitrage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 */
router.delete("/products/:id", auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin, productController.deleteProduct);
/**
 * @swagger
 * /api/arbitrage/hostings:
 *   get:
 *     summary: Get user's arbitrage hostings
 *     tags: [Arbitrage]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's arbitrage hostings
 */
router.get("/hostings", auth_middleware_1.authenticateJWT, hostingController.getUserHostings);
/**
 * @swagger
 * /api/arbitrage/hostings/{id}:
 *   get:
 *     summary: Get arbitrage hosting by ID
 *     tags: [Arbitrage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The hosting ID
 *     responses:
 *       200:
 *         description: The arbitrage hosting
 */
router.get("/hostings/:id", auth_middleware_1.authenticateJWT, hostingController.getHostingById);
/**
 * @swagger
 * /api/arbitrage/hostings:
 *   post:
 *     summary: Create a new arbitrage hosting
 *     tags: [Arbitrage]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - amount
 *               - currency
 *             properties:
 *               product_id:
 *                 type: integer
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *                 enum: [USDT, BTC, ETH]
 *     responses:
 *       201:
 *         description: Hosting created successfully
 */
router.post("/hostings", auth_middleware_1.authenticateJWT, hostingController.createHosting);
/**
 * @swagger
 * /api/arbitrage/hostings/{id}:
 *   put:
 *     summary: Update arbitrage hosting
 *     tags: [Arbitrage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The hosting ID
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
 *         description: Hosting updated successfully
 */
router.put("/hostings/:id", auth_middleware_1.authenticateJWT, hostingController.updateHosting);
/**
 * @swagger
 * /api/arbitrage/hostings/{id}/cancel:
 *   post:
 *     summary: Cancel arbitrage hosting
 *     tags: [Arbitrage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The hosting ID
 *     responses:
 *       200:
 *         description: Hosting cancelled successfully
 */
router.post("/hostings/:id/cancel", auth_middleware_1.authenticateJWT, hostingController.cancelHosting);
/**
 * @swagger
 * /api/arbitrage/hostings/{id}:
 *   delete:
 *     summary: Delete arbitrage hosting (Admin only)
 *     tags: [Arbitrage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The hosting ID
 *     responses:
 *       200:
 *         description: Hosting deleted successfully
 */
router.delete("/hostings/:id", auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin, hostingController.deleteHosting);
/**
 * @swagger
 * /api/arbitrage/admin/hostings:
 *   get:
 *     summary: Get all arbitrage hostings (Admin only)
 *     tags: [Arbitrage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by hosting status
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *     responses:
 *       200:
 *         description: List of all arbitrage hostings
 */
router.get("/admin/hostings", auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin, hostingController.getAllHostings);
/**
 * @swagger
 * /api/arbitrage/admin/products:
 *   get:
 *     summary: Get all arbitrage products (Admin only)
 *     tags: [Arbitrage]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all arbitrage products
 */
router.get("/admin/products", auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin, productController.getAllProducts);
exports.default = router;
