"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const admin_accounts_controller_1 = require("./admin.accounts.controller");
const admin_accounts_validation_1 = require("./admin.accounts.validation");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   - name: Admin Accounts
 *     description: Manage administrator accounts and access
 */
router.use(auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin);
/**
 * @swagger
 * /api/admin/admins:
 *   get:
 *     summary: List admin accounts
 *     tags: [Admin Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Optional name or email search term
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *         description: Results per page
 *     responses:
 *       200:
 *         description: Admin list retrieved
 */
router.get("/", admin_accounts_validation_1.adminListQueryValidator, validation_middleware_1.validationMiddleware, admin_accounts_controller_1.listAdmins);
/**
 * @swagger
 * /api/admin/admins:
 *   post:
 *     summary: Create an admin account
 *     tags: [Admin Accounts]
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
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               password_confirmation:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       422:
 *         description: Validation error
 */
router.post("/", admin_accounts_validation_1.adminCreateValidator, validation_middleware_1.validationMiddleware, admin_accounts_controller_1.createAdmin);
/**
 * @swagger
 * /api/admin/admins/{id}:
 *   put:
 *     summary: Update an admin account
 *     tags: [Admin Accounts]
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
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               password_confirmation:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *       404:
 *         description: Admin not found
 */
router.put("/:id", [...admin_accounts_validation_1.adminIdParamValidator, ...admin_accounts_validation_1.adminUpdateValidator], validation_middleware_1.validationMiddleware, admin_accounts_controller_1.updateAdmin);
/**
 * @swagger
 * /api/admin/admins/{id}:
 *   delete:
 *     summary: Delete an admin account
 *     tags: [Admin Accounts]
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
 *         description: Admin deleted successfully
 *       404:
 *         description: Admin not found
 */
router.delete("/:id", admin_accounts_validation_1.adminIdParamValidator, validation_middleware_1.validationMiddleware, admin_accounts_controller_1.deleteAdmin);
exports.default = router;
