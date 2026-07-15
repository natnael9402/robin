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
exports.deleteBlobObject = exports.uploadBufferToBlob = void 0;
const crypto_1 = __importDefault(require("crypto"));
const blob_1 = require("@vercel/blob");
const logger_1 = require("./logger");
function getBlobToken(required) {
    var _a, _b;
    const token = (_b = (_a = process.env.BLOB_READ_WRITE_TOKEN) !== null && _a !== void 0 ? _a : process.env.VERCEL_BLOB_READ_WRITE_TOKEN) !== null && _b !== void 0 ? _b : process.env.VERCEL_BLOB_RW_TOKEN;
    const trimmed = token === null || token === void 0 ? void 0 : token.trim();
    if (!trimmed) {
        if (required) {
            throw new Error("Blob storage token is not configured. Set BLOB_READ_WRITE_TOKEN in the environment.");
        }
        return null;
    }
    return trimmed;
}
const buildPathname = (originalName, options) => {
    var _a, _b, _c, _d, _e;
    const folder = (_b = (_a = options.folder) === null || _a === void 0 ? void 0 : _a.replace(/^\/*/, "").replace(/\/*$/, "")) !== null && _b !== void 0 ? _b : "uploads";
    const prefix = (_d = (_c = options.filenamePrefix) === null || _c === void 0 ? void 0 : _c.replace(/[^a-zA-Z0-9-_]/g, "")) !== null && _d !== void 0 ? _d : crypto_1.default.randomUUID();
    const randomSuffix = crypto_1.default.randomBytes(6).toString("hex");
    const baseName = (_e = originalName === null || originalName === void 0 ? void 0 : originalName.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.\-_]/g, "")) !== null && _e !== void 0 ? _e : "file";
    const extMatch = baseName.match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? `.${extMatch[1]}` : "";
    return `${folder}/${prefix}-${Date.now()}-${randomSuffix}${ext}`;
};
const uploadBufferToBlob = (buffer_1, contentType_1, originalName_1, ...args_1) => __awaiter(void 0, [buffer_1, contentType_1, originalName_1, ...args_1], void 0, function* (buffer, contentType, originalName, options = {}) {
    var _a;
    const token = getBlobToken(false);
    if (!token) {
        logger_1.logger.info("BLOB_READ_WRITE_TOKEN not set — storing attachment as inline data URI");
        const b64 = buffer.toString("base64");
        const dataUrl = `data:${contentType};base64,${b64}`;
        return {
            url: dataUrl,
            downloadUrl: dataUrl,
            pathname: `inline/${originalName || "file"}`,
            size: buffer.byteLength,
            contentType,
        };
    }
    const pathname = buildPathname(originalName, options);
    let result;
    try {
        result = yield (0, blob_1.put)(pathname, buffer, {
            access: (_a = options.access) !== null && _a !== void 0 ? _a : "public",
            cacheControlMaxAge: options.cacheControlMaxAge,
            contentType,
            token,
        });
    }
    catch (error) {
        logger_1.logger.error("Failed to upload file to Vercel Blob", {
            error: error instanceof Error ? error.message : String(error),
        });
        throw error;
    }
    return {
        url: result.url,
        downloadUrl: result.downloadUrl,
        pathname: result.pathname,
        size: buffer.byteLength,
        contentType: result.contentType,
    };
});
exports.uploadBufferToBlob = uploadBufferToBlob;
const toBlobIdentifier = (urlOrPathname) => {
    try {
        const parsed = new URL(urlOrPathname);
        return parsed.pathname.replace(/^\//, "");
    }
    catch (_error) {
        return urlOrPathname.replace(/^\//, "");
    }
};
const deleteBlobObject = (urlOrPathname) => __awaiter(void 0, void 0, void 0, function* () {
    const token = getBlobToken(false);
    if (!token) {
        logger_1.logger.warn("Skipped deleting blob because BLOB_READ_WRITE_TOKEN is not configured");
        return false;
    }
    const target = toBlobIdentifier(urlOrPathname);
    try {
        yield (0, blob_1.del)(target, { token });
        return true;
    }
    catch (error) {
        logger_1.logger.warn("Failed to delete blob object", {
            target,
            error: error instanceof Error ? error.message : String(error),
        });
        return false;
    }
});
exports.deleteBlobObject = deleteBlobObject;
