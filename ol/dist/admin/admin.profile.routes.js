"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const profile_admin_controller_1 = require("../profile/profile.admin.controller");
const profile_admin_validation_1 = require("../profile/profile.admin.validation");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   - name: Admin Profiles
 *     description: Administrative actions for user profiles, KYC, and trading status
 */
router.use(auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin);
/**
 * @swagger
 * /api/admin/profiles:
 *   get:
 *     summary: List user profiles
 *     tags: [Admin Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Free-text search
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *         description: Page size
 *     responses:
 *       200:
 *         description: Profiles retrieved successfully
 */
router.get("/profiles", profile_admin_validation_1.adminProfileListQueryValidator, validation_middleware_1.validationMiddleware, profile_admin_controller_1.listProfiles);
/**
 * @swagger
 * /api/admin/profiles/{id}:
 *   get:
 *     summary: Get profile details
 *     tags: [Admin Profiles]
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
 *         description: Profile retrieved successfully
 *       404:
 *         description: Profile not found
 */
router.get("/profiles/:id", profile_admin_validation_1.adminProfileIdParamValidator, validation_middleware_1.validationMiddleware, profile_admin_controller_1.getProfile);
/**
 * @swagger
 * /api/admin/profiles/{id}/kyc:
 *   put:
 *     summary: Update KYC status for a user profile
 *     tags: [Admin Profiles]
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
 *               kyc_status:
 *                 type: string
 *     responses:
 *       200:
 *         description: KYC status updated
 */
router.put("/profiles/:id/kyc", [...profile_admin_validation_1.adminProfileIdParamValidator, ...profile_admin_validation_1.adminProfileKycStatusValidator], validation_middleware_1.validationMiddleware, profile_admin_controller_1.setKycStatus);
/**
 * @swagger
 * /api/admin/profiles/{id}/trade-status:
 *   put:
 *     summary: Set automated trade resolution status
 *     tags: [Admin Profiles]
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
 *               trade_status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trade status updated
 */
router.put("/profiles/:id/trade-status", [...profile_admin_validation_1.adminProfileIdParamValidator, ...profile_admin_validation_1.adminProfileTradeStatusValidator], validation_middleware_1.validationMiddleware, profile_admin_controller_1.setTradeStatus);
/**
 * @swagger
 * /api/admin/profiles/{id}/reset-withdrawal-password:
 *   post:
 *     summary: Reset withdrawal password for a user
 *     tags: [Admin Profiles]
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
 *         description: Withdrawal password reset
 */
router.post("/profiles/:id/reset-withdrawal-password", profile_admin_validation_1.adminProfileIdParamValidator, validation_middleware_1.validationMiddleware, profile_admin_controller_1.resetWithdrawal);
/**
 * @swagger
 * /api/admin/profiles/{id}/upgrade-level:
 *   post:
 *     summary: Upgrade a user's account level
 *     tags: [Admin Profiles]
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
 *         description: Account level upgraded
 */
router.post("/profiles/:id/upgrade-level", profile_admin_validation_1.adminProfileIdParamValidator, validation_middleware_1.validationMiddleware, profile_admin_controller_1.upgradeLevel);
/**
 * @swagger
 * /api/admin/profiles/{id}/level:
 *   put:
 *     summary: Set a user's account level
 *     tags: [Admin Profiles]
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
 *               level:
 *                 type: integer
 *     responses:
 *       200:
 *         description: User level set successfully
 */
router.put("/profiles/:id/level", profile_admin_validation_1.adminProfileIdParamValidator, validation_middleware_1.validationMiddleware, profile_admin_controller_1.setLevel);
/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update a user's core attributes
 *     tags: [Admin Profiles]
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
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *               balance:
 *                 type: number
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put("/users/:id", [...profile_admin_validation_1.adminProfileIdParamValidator, ...profile_admin_validation_1.adminUpdateUserValidator], validation_middleware_1.validationMiddleware, profile_admin_controller_1.updateUser);
/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user account
 *     tags: [Admin Profiles]
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
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete("/users/:id", profile_admin_validation_1.adminProfileIdParamValidator, validation_middleware_1.validationMiddleware, profile_admin_controller_1.deleteUserAccount);
exports.default = router;
