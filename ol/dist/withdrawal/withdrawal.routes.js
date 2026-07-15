"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const withdrawal_controller_1 = require("./withdrawal.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const withdrawal_validation_1 = require("./withdrawal.validation");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   - name: Withdrawals
 *     description: User withdrawal requests and administration
 */
router.use(auth_middleware_1.authenticateJWT);
/**
 * @swagger
 * /api/withdrawals:
 *   get:
 *     summary: List withdrawals
 *     tags: [Withdrawals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *     responses:
 *       200:
 *         description: List of withdrawals
 */
router.get("/", (req, res) => (0, withdrawal_controller_1.listWithdrawals)(req, res));
/**
 * @swagger
 * /api/withdrawals/calculate-fee:
 *   post:
 *     summary: Preview withdrawal fee
 *     tags: [Withdrawals]
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
 *               - amount
 *               - network
 *             properties:
 *               currency:
 *                 type: string
 *               amount:
 *                 type: number
 *               network:
 *                 type: string
 *     responses:
 *       200:
 *         description: Fee calculated successfully
 */
router.post("/calculate-fee", withdrawal_validation_1.calculateFeeValidator, validation_middleware_1.validationMiddleware, (req, res) => (0, withdrawal_controller_1.calculateFee)(req, res));
/**
 * @swagger
 * /api/withdrawals:
 *   post:
 *     summary: Create a withdrawal request
 *     tags: [Withdrawals]
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
 *               - amount
 *               - walletAddress
 *               - network
 *               - withdrawalPassword
 *             properties:
 *               currency:
 *                 type: string
 *               amount:
 *                 type: number
 *               walletAddress:
 *                 type: string
 *               network:
 *                 type: string
 *               withdrawalPassword:
 *                 type: string
 *     responses:
 *       201:
 *         description: Withdrawal request created
 */
router.post("/", withdrawal_validation_1.createWithdrawalValidator, validation_middleware_1.validationMiddleware, (req, res) => (0, withdrawal_controller_1.createWithdrawal)(req, res));
/**
 * @swagger
 * /api/withdrawals/{id}:
 *   get:
 *     summary: Get a withdrawal
 *     tags: [Withdrawals]
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
 *         description: Withdrawal details
 */
router.get("/:id", (req, res) => (0, withdrawal_controller_1.getWithdrawal)(req, res));
/**
 * @swagger
 * /api/withdrawals/{id}:
 *   put:
 *     summary: Update a withdrawal status (admin only)
 *     tags: [Withdrawals]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *               rejectionReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Withdrawal updated
 */
router.put("/:id", admin_middleware_1.authorizeAdmin, withdrawal_validation_1.updateWithdrawalStatusValidator, validation_middleware_1.validationMiddleware, (req, res) => (0, withdrawal_controller_1.updateWithdrawal)(req, res));
/**
 * @swagger
 * /api/withdrawals/{id}:
 *   delete:
 *     summary: Delete a withdrawal
 *     tags: [Withdrawals]
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
 *         description: Withdrawal deleted
 */
router.delete("/:id", (req, res) => (0, withdrawal_controller_1.deleteWithdrawal)(req, res));
exports.default = router;
