"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const admin_dashboard_controller_1 = require("./admin.dashboard.controller");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   - name: Admin Dashboard
 *     description: High-level administrative metrics and summaries
 */
router.use(auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin);
/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Retrieve dashboard statistics
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard metrics retrieved successfully
 */
router.get("/dashboard", admin_dashboard_controller_1.getDashboardStats);
exports.default = router;
