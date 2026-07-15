"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const news_controller_1 = require("./news.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const news_validation_1 = require("./news.validation");
const router = express_1.default.Router();
router.get("/", news_validation_1.newsListValidator, validation_middleware_1.validationMiddleware, news_controller_1.listNews);
router.get("/:slug", news_validation_1.newsSlugParamValidator, validation_middleware_1.validationMiddleware, news_controller_1.getArticleBySlug);
exports.default = router;