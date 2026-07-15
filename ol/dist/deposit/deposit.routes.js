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
const multer_1 = __importDefault(require("multer"));
const cryptoAddressController = __importStar(require("./crypto-address.controller"));
const depositController = __importStar(require("./deposit.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const deposit_validation_1 = require("./deposit.validation");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});
/**
 * @swagger
 * tags:
 *   - name: Deposit
 *     description: Deposit and crypto address management
 *
 * /api/deposit/addresses:
 *   get:
 *     summary: Get all active deposit addresses
 *     tags: [Deposit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of deposit addresses grouped by currency
 *
 * /api/deposit/address/{currency}/{network}:
 *   get:
 *     summary: Get deposit address for a specific currency and network
 *     tags: [Deposit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: currency
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: network
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deposit address details
 *
 * /api/deposit/address:
 *   post:
 *     summary: Get deposit address for a specific currency and network (body)
 *     tags: [Deposit]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currency:
 *                 type: string
 *               network:
 *                 type: string
 *     responses:
 *       200:
 *         description: Deposit address details
 *
 * /api/deposit:
 *   get:
 *     summary: Get deposits (user's own or all for admin)
 *     tags: [Deposit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status (admin only)
 *     responses:
 *       200:
 *         description: List of deposits
 *   post:
 *     summary: Create a new deposit request
 *     tags: [Deposit]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               currency:
 *                 type: string
 *               amount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *               proof_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Deposit request created
 *
 * /api/deposit/{id}:
 *   get:
 *     summary: Get a specific deposit by ID
 *     tags: [Deposit]
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
 *         description: Deposit details
 *   put:
 *     summary: Update a deposit status (admin only)
 *     tags: [Deposit]
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
 *                 enum: [approved, rejected]
 *               rejectionReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Deposit status updated
 *   delete:
 *     summary: Delete a deposit
 *     tags: [Deposit]
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
 *         description: Deposit deleted
 */
// Deposit address routes
router.get("/addresses", auth_middleware_1.authenticateJWT, cryptoAddressController.getDepositAddresses);
router.get("/address/:currency/:network", auth_middleware_1.authenticateJWT, cryptoAddressController.getDepositAddress);
router.post("/address", auth_middleware_1.authenticateJWT, deposit_validation_1.getAddressValidator, validation_middleware_1.validationMiddleware, cryptoAddressController.getDepositAddress);
// Deposit routes
router.get("/", auth_middleware_1.authenticateJWT, depositController.getDeposits);
router.get("/:id", auth_middleware_1.authenticateJWT, depositController.getDeposit);
router.post("/", auth_middleware_1.authenticateJWT, upload.single("proof_image"), deposit_validation_1.createDepositValidator, validation_middleware_1.validationMiddleware, depositController.createDeposit);
router.put("/:id", auth_middleware_1.authenticateJWT, deposit_validation_1.updateDepositStatusValidator, validation_middleware_1.validationMiddleware, depositController.updateDeposit);
router.delete("/:id", auth_middleware_1.authenticateJWT, depositController.deleteDeposit);
exports.default = router;
