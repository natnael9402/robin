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
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadNewsImage = exports.adminDeleteArticle = exports.adminUpdateArticle = exports.adminGetArticle = exports.adminCreateArticle = exports.adminListArticles = exports.getArticleBySlug = exports.listNews = void 0;
const http_response_1 = require("../utils/http-response");
const news_service_1 = require("./news.service");
const blob_storage_1 = require("../utils/blob-storage");
const listNews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const source = req.query.source || null;
    const result = yield (0, news_service_1.listPublishedNews)(page, limit, source);
    return (0, http_response_1.successResponse)(res, result, "News retrieved successfully");
  }
  catch (error) {
    return (0, http_response_1.errorResponse)(res, "Failed to retrieve news", 500, error.message);
  }
});
exports.listNews = listNews;
const getArticleBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
  try {
    const article = yield (0, news_service_1.getArticleBySlug)(req.params.slug);
    if (!article) {
      return (0, http_response_1.errorResponse)(res, "Article not found", 404);
    }
    return (0, http_response_1.successResponse)(res, { article }, "Article retrieved successfully");
  }
  catch (error) {
    return (0, http_response_1.errorResponse)(res, "Failed to retrieve article", 500, error.message);
  }
});
exports.getArticleBySlug = getArticleBySlug;
const adminListArticles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 50;
    const source = req.query.source || null;
    const result = yield (0, news_service_1.listAllNews)(page, limit, source);
    return (0, http_response_1.successResponse)(res, result, "Articles retrieved successfully");
  }
  catch (error) {
    return (0, http_response_1.errorResponse)(res, "Failed to retrieve articles", 500, error.message);
  }
});
exports.adminListArticles = adminListArticles;
const adminCreateArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
  try {
    const article = yield (0, news_service_1.createNewsArticle)(req.body);
    return (0, http_response_1.successResponse)(res, { article }, "Article created successfully", 201);
  }
  catch (error) {
    return (0, http_response_1.errorResponse)(res, "Failed to create article", 500, error.message);
  }
});
exports.adminCreateArticle = adminCreateArticle;
const adminGetArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
  try {
    const article = yield (0, news_service_1.getArticleById)(BigInt(req.params.id));
    if (!article) {
      return (0, http_response_1.errorResponse)(res, "Article not found", 404);
    }
    return (0, http_response_1.successResponse)(res, { article }, "Article retrieved successfully");
  }
  catch (error) {
    return (0, http_response_1.errorResponse)(res, "Failed to retrieve article", 500, error.message);
  }
});
exports.adminGetArticle = adminGetArticle;
const adminUpdateArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
  try {
    const article = yield (0, news_service_1.updateNewsArticle)(BigInt(req.params.id), req.body);
    if (!article) {
      return (0, http_response_1.errorResponse)(res, "Article not found", 404);
    }
    return (0, http_response_1.successResponse)(res, { article }, "Article updated successfully");
  }
  catch (error) {
    return (0, http_response_1.errorResponse)(res, "Failed to update article", 500, error.message);
  }
});
exports.adminUpdateArticle = adminUpdateArticle;
const adminDeleteArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
  try {
    const article = yield (0, news_service_1.deleteNewsArticle)(BigInt(req.params.id));
    if (!article) {
      return (0, http_response_1.errorResponse)(res, "Article not found", 404);
    }
    return (0, http_response_1.successResponse)(res, { article }, "Article deleted successfully");
  }
  catch (error) {
    return (0, http_response_1.errorResponse)(res, "Failed to delete article", 500, error.message);
  }
});
exports.adminDeleteArticle = adminDeleteArticle;
const uploadNewsImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
  try {
    const file = req.file;
    if (!file) {
      return (0, http_response_1.errorResponse)(res, "No image file provided", 400);
    }
    const uploaded = yield blob_storage_1.uploadBufferToBlob(file.buffer, file.mimetype, file.originalname, {
      folder: "news",
      filenamePrefix: `news-image`,
      cacheControlMaxAge: 60 * 60 * 24 * 30,
    });
    return (0, http_response_1.successResponse)(res, { url: uploaded.url }, "Image uploaded successfully");
  }
  catch (error) {
    return (0, http_response_1.errorResponse)(res, "Failed to upload image", 500, error.message);
  }
});
exports.uploadNewsImage = uploadNewsImage;
