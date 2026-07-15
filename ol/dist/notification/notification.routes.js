"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const notification_controller_1 = require("./notification.controller");
const notification_validation_1 = require("./notification.validation");
const router = express_1.default.Router();
router.use(auth_middleware_1.authenticateJWT);
router.get("/", notification_controller_1.listNotifications);
router.get("/unread-count", notification_controller_1.unreadCount);
router.post("/mark-all-read", notification_controller_1.markAllRead);
router.post("/:id/read", notification_validation_1.notificationIdParamValidator, validation_middleware_1.validationMiddleware, notification_controller_1.markRead);
exports.default = router;
