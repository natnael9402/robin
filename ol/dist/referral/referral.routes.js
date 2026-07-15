"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const referral_controller_1 = require("./referral.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const router = (0, express_1.Router)();
const controller = new referral_controller_1.ReferralController();
// User-facing
router.get("/my-info", auth_middleware_1.authenticateJWT, (req, res) => controller.getMyInfo(req, res));
router.post("/generate-code", auth_middleware_1.authenticateJWT, (req, res) => controller.generateCode(req, res));
// Admin
router.get("/admin/referrals/stats", auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin, (req, res) => controller.getAdminStats(req, res));
router.get("/admin/referrals", auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin, (req, res) => controller.getAdminReferrals(req, res));
router.get("/admin/referral/user/:userId", auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin, (req, res) => controller.getUserReferral(req, res));
router.post("/admin/referral-commissions/:id/approve", auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin, (req, res) => controller.approveCommission(req, res));
exports.default = router;
