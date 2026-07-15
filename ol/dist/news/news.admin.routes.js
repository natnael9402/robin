"use strict";
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
const news_controller_1 = require("./news.controller");
const news_validation_1 = require("./news.validation");
const blob_storage_1 = require("../utils/blob-storage");
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
const newsImageUpload = upload.single("image");
const handleNewsImageUpload = (req, res, next) => {
    newsImageUpload(req, res, (err) => {
        if (err) {
            return (0, http_response_1.errorResponse)(res, err.message || "File upload error", 400);
        }
        next();
    });
};
router.use(auth_middleware_1.authenticateJWT, admin_middleware_1.authorizeAdmin);
router.get("/", news_validation_1.newsListValidator, validation_middleware_1.validationMiddleware, news_controller_1.adminListArticles);
router.post("/", handleNewsImageUpload, news_validation_1.newsCreateValidator, validation_middleware_1.validationMiddleware, news_controller_1.adminCreateArticle);
router.post("/upload-image", handleNewsImageUpload, news_controller_1.uploadNewsImage);
router.get("/:id", news_validation_1.newsIdParamValidator, validation_middleware_1.validationMiddleware, news_controller_1.adminGetArticle);
router.put("/:id", handleNewsImageUpload, news_validation_1.newsUpdateValidator, validation_middleware_1.validationMiddleware, news_controller_1.adminUpdateArticle);
router.delete("/:id", news_validation_1.newsIdParamValidator, validation_middleware_1.validationMiddleware, news_controller_1.adminDeleteArticle);
exports.default = router;