"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const activity_controller_1 = require("./activity.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const router = express_1.default.Router();
// Called by both frontends once per session (token optional for guests).
router.post("/app-open", (req, res) => activity_controller_1.appOpen(req, res));
// Admin utilities to verify the alert pipeline.
router.get("/status", auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin, (req, res) => activity_controller_1.alertsStatus(req, res));
router.post("/test-alert", auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin, (req, res) => activity_controller_1.testAlert(req, res));
exports.default = router;
