"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const auth_validation_1 = require("./auth.validation");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const authService = new auth_service_1.AuthService();
const authController = new auth_controller_1.AuthController(authService);
/**
 * @swagger
 * /api/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
router.post("/register", auth_validation_1.registerValidator, (req, res) => authController.register(req, res));
/**
 * @swagger
 * /api/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "bruhtesfazelealem436@gmail.com"
 *               password:
 *                 type: string
 *                 example: "Bruk@123"
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", auth_validation_1.loginValidator, (req, res) => authController.login(req, res));
/**
 * @swagger
 * /api/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change the authenticated user's login password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - current_password
 *               - password
 *               - password_confirmation
 *             properties:
 *               current_password:
 *                 type: string
 *                 example: "OldPassword123"
 *               password:
 *                 type: string
 *                 example: "NewPassword456"
 *               password_confirmation:
 *                 type: string
 *                 example: "NewPassword456"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid current password or unauthorized
 */
router.post("/change-password", auth_middleware_1.authenticateJWT, auth_validation_1.changePasswordValidator, (req, res) => authController.changePassword(req, res));
/**
 * @swagger
 * /api/withdrawal-password/set:
 *   post:
 *     tags: [Auth]
 *     summary: Set or update the withdrawal password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - password_confirmation
 *             properties:
 *               current_password:
 *                 type: string
 *                 description: Required when updating an existing withdrawal password
 *               password:
 *                 type: string
 *               password_confirmation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Withdrawal password set successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid current withdrawal password or unauthorized
 *       404:
 *         description: Profile not found
 */
router.post("/withdrawal-password/set", auth_middleware_1.authenticateJWT, auth_validation_1.withdrawalPasswordValidator, (req, res) => authController.setWithdrawalPassword(req, res));
/**
 * @swagger
 * /api/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request a password reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset token sent (if email exists)
 *       422:
 *         description: Validation error
 */
router.post("/forgot-password", auth_validation_1.forgotPasswordValidator, (req, res) => authController.forgotPassword(req, res));
/**
 * @swagger
 * /api/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password using token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *               - password
 *               - password_confirmation
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *               password_confirmation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid token or other error
 *       422:
 *         description: Validation error
 */
router.post("/reset-password", auth_validation_1.resetPasswordValidator, (req, res) => authController.resetPassword(req, res));
exports.default = router;
