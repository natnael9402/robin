"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const crypto_address_admin_controller_1 = require("../deposit/crypto-address.admin.controller");
const crypto_address_admin_validation_1 = require("../deposit/crypto-address.admin.validation");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   - name: Admin Crypto Addresses
 *     description: Manage supported deposit crypto addresses for the platform
 */
router.use(auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin);
/**
 * @swagger
 * /api/admin/crypto-addresses:
 *   get:
 *     summary: List crypto addresses
 *     tags: [Admin Crypto Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *         description: Optional currency filter
 *     responses:
 *       200:
 *         description: Addresses retrieved successfully
 */
router.get("/", crypto_address_admin_validation_1.adminCryptoAddressQueryValidator, validation_middleware_1.validationMiddleware, crypto_address_admin_controller_1.listAddresses);
/**
 * @swagger
 * /api/admin/crypto-addresses/{id}:
 *   get:
 *     summary: Get a crypto address
 *     tags: [Admin Crypto Addresses]
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
 *         description: Address retrieved successfully
 *       404:
 *         description: Address not found
 */
router.get("/:id", crypto_address_admin_validation_1.adminCryptoAddressIdParamValidator, validation_middleware_1.validationMiddleware, crypto_address_admin_controller_1.getAddress);
/**
 * @swagger
 * /api/admin/crypto-addresses:
 *   post:
 *     summary: Create a crypto address
 *     tags: [Admin Crypto Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currency
 *               - network
 *               - address
 *             properties:
 *               currency:
 *                 type: string
 *               network:
 *                 type: string
 *               address:
 *                 type: string
 *               memo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Address created successfully
 *       400:
 *         description: Validation error
 */
router.post("/", crypto_address_admin_validation_1.adminCreateCryptoAddressValidator, validation_middleware_1.validationMiddleware, crypto_address_admin_controller_1.createAddress);
/**
 * @swagger
 * /api/admin/crypto-addresses/{id}:
 *   put:
 *     summary: Update a crypto address
 *     tags: [Admin Crypto Addresses]
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
 *             required:
 *               - address
 *             properties:
 *               address:
 *                 type: string
 *               qr_code:
 *                 type: string
 *               notes:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       400:
 *         description: Validation error
 */
router.put("/:id", [...crypto_address_admin_validation_1.adminCryptoAddressIdParamValidator, ...crypto_address_admin_validation_1.adminUpdateCryptoAddressValidator], validation_middleware_1.validationMiddleware, crypto_address_admin_controller_1.updateAddress);
/**
 * @swagger
 * /api/admin/crypto-addresses/{id}:
 *   delete:
 *     summary: Delete a crypto address
 *     tags: [Admin Crypto Addresses]
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
 *         description: Address deleted successfully
 */
router.delete("/:id", crypto_address_admin_validation_1.adminCryptoAddressIdParamValidator, validation_middleware_1.validationMiddleware, crypto_address_admin_controller_1.deleteAddress);
exports.default = router;
