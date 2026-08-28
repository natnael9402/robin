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
const logger_1 = require("./logger");
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
const getUploadsDir = () => {
    const path = require("path");
    return path.join(process.cwd(), "uploads");
};
const uploadBufferToBlob = (buffer_1, contentType_1, originalName_1, ...args_1) => __awaiter(void 0, [buffer_1, contentType_1, originalName_1, ...args_1], void 0, function* (buffer, contentType, originalName, options = {}) {
    const fs = require("fs");
    const path = require("path");
    const pathname = buildPathname(originalName, options);
    const uploadsDir = getUploadsDir();
    const fullPath = path.join(uploadsDir, pathname);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, buffer);
    const url = `/uploads/${pathname}`;
    return {
        url,
        downloadUrl: url,
        pathname,
        size: buffer.byteLength,
        contentType,
    };
});
exports.uploadBufferToBlob = uploadBufferToBlob;
const toBlobIdentifier = (urlOrPathname) => {
    let value;
    try {
        const parsed = new URL(urlOrPathname);
        value = parsed.pathname.replace(/^\/+/, "");
    }
    catch (_error) {
        value = urlOrPathname.replace(/^\/+/, "");
    }
    // Files are stored directly under <uploadsDir>/<pathname> (no "uploads" root
    // segment), so strip an optional leading "uploads/" segment from the URL.
    return value.replace(/^uploads\//i, "");
};
const deleteBlobObject = (urlOrPathname) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fs = require("fs");
        const path = require("path");
        const uploadsDir = getUploadsDir();
        const target = toBlobIdentifier(urlOrPathname);
        const fullPath = path.join(uploadsDir, target);
        if (!fullPath.startsWith(uploadsDir)) {
            logger_1.logger.warn("Refusing to delete file outside uploads directory", { target });
            return false;
        }
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            return true;
        }
        return false;
    }
    catch (error) {
        logger_1.logger.warn("Failed to delete uploaded file", {
            target: urlOrPathname,
            error: error instanceof Error ? error.message : String(error),
        });
        return false;
    }
});
exports.deleteBlobObject = deleteBlobObject;
