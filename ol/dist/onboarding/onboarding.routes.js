"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const onboarding_controller_1 = require("./onboarding.controller");
const onboarding_validation_1 = require("./onboarding.validation");
const router = express_1.default.Router();
// User routes
router.post("/", auth_middleware_1.authenticateJWT, onboarding_validation_1.onboardingValidator, validation_middleware_1.validationMiddleware, onboarding_controller_1.submitOnboarding);
router.get("/", auth_middleware_1.authenticateJWT, onboarding_controller_1.getOnboarding);
// Admin routes
router.get("/admin/:userId", auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin, onboarding_controller_1.adminGetUserOnboarding);
exports.default = router;
