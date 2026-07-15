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
const express_1 = require("express");
const client_1 = require("@vercel/blob/client");
const logger_1 = require("./logger");
const ALLOWED_BLOB_HOSTS = [
    "blob.vercel-storage.com",
    "vercel-blob.com",
];
function isAllowedBlobUrl(url) {
    try {
        const parsed = new URL(url);
        return ALLOWED_BLOB_HOSTS.some((host) => parsed.hostname === host || parsed.hostname.endsWith("." + host));
    }
    catch (_a) {
        return false;
    }
}
exports.isAllowedBlobUrl = isAllowedBlobUrl;
const router = (0, express_1.Router)();
router.post("/handle-upload", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, client_1.handleUpload)({
            body: req.body,
            request: req,
            onBeforeGenerateToken: (pathname, clientPayload, multipart) => __awaiter(void 0, void 0, void 0, function* () {
                return {};
            }),
            onUploadCompleted: (blob, tokenPayload) => __awaiter(void 0, void 0, void 0, function* () {
                logger_1.logger.info("Blob upload completed", { url: blob.url, pathname: blob.pathname });
            }),
        });
        res.json(response);
    }
    catch (error) {
        logger_1.logger.error("Blob handle-upload error", { error: error instanceof Error ? error.message : String(error) });
        res.status(400).json({ error: error instanceof Error ? error.message : "Upload authorization failed" });
    }
}));
exports.default = router;
