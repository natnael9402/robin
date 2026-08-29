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
exports.isAllowedBlobUrl = void 0;
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
module.exports.default = undefined;
