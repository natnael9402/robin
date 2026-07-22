"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const http_response_1 = require("../utils/http-response");
const notification_controller_1 = require("../notification/notification.controller");
const notification_validation_1 = require("../notification/notification.validation");
const notification_service_1 = require("../notification/notification.service");
const router = express_1.default.Router();
const allowedImageMimes = new Set(["image/jpeg", "image/png", "image/webp"]);
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (allowedImageMimes.has(file.mimetype)) {
            cb(null, true);
            return;
        }
        cb(new Error("Invalid file type. Only JPG, PNG, and WEBP are allowed."));
    },
});
const notificationUpload = upload.single("image");
const handleNotificationUpload = (req, res, next) => {
    notificationUpload(req, res, (err) => {
        if (err) {
            return (0, http_response_1.errorResponse)(res, err.message || "File upload error", 400);
        }
        next();
    });
};
router.use(auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin);
router.get("/users/:id/notifications", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = BigInt(req.params.id);
        const result = yield (0, notification_service_1.listUserNotifications)(userId);
        return (0, http_response_1.successResponse)(res, result, "Notifications retrieved successfully");
    }
    catch (error) {
        return (0, http_response_1.errorResponse)(res, "Failed to retrieve notifications", 500, error.message);
    }
}));
router.post("/users/:id/notifications", handleNotificationUpload, notification_validation_1.sendNotificationValidator, validation_middleware_1.validationMiddleware, notification_controller_1.sendNotification);
exports.default = router;
