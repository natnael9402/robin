"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_user_accounts_controller_1 = __importDefault(require("./admin.user-accounts.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const router = (0, express_1.Router)();
const ctrl = admin_user_accounts_controller_1.default;

router.get("/users/:userId/accounts", auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin, (req, res) => ctrl.getUserAccounts(req, res));
router.put("/users/:userId/accounts/:type", auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin, (req, res) => ctrl.setAccountBalance(req, res));
router.get("/users/:userId/assets", auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin, (req, res) => ctrl.getUserAssets(req, res));
router.post("/users/:userId/assets", auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin, (req, res) => ctrl.createAsset(req, res));
router.put("/users/:userId/assets/:assetId", auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin, (req, res) => ctrl.updateAsset(req, res));
router.delete("/users/:userId/assets/:assetId", auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin, (req, res) => ctrl.deleteAsset(req, res));

exports.default = router;
