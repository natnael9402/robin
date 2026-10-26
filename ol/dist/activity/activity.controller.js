"use strict";
/**
 * App presence / activity tracking.
 *
 * Both frontends call POST /api/activity/app-open once per session so the admin
 * team knows who entered Paxora or Paxora Premium (and on which device).
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(value); } catch (e) { reject(e); } }
        function rejected(value) { try { step(value); } catch (e) { reject(e); } }
        function resolve(value) {
            if (value && value instanceof Promise) {
                value.then(fulfilled, rejected);
                return value;
            }
            value = new P(function (resolve) {
                value.then(fulfilled, rejected);
            });
        }
        resolve(value);
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appOpen = appOpen;
exports.alertsStatus = alertsStatus;
exports.testAlert = testAlert;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
const admin_alert_service_1 = require("../notification/admin-alert.service");
const recentVisits = new Map();

function bearerToken(req) {
    const header = req.headers && req.headers.authorization;
    if (typeof header !== "string" || !header.toLowerCase().startsWith("bearer ")) {
        return null;
    }
    return header.slice(7).trim() || null;
}

function decodeUser(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = bearerToken(req);
        if (!token) {
            return null;
        }
        try {
            const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "your-secret-key");
            if (!payload || !payload.id) {
                return null;
            }
            const user = yield prisma_1.default.user.findUnique({
                where: { id: BigInt(payload.id) },
                select: { id: true, name: true, email: true },
            });
            return user || { id: payload.id, email: payload.email || null, name: null };
        }
        catch (error) {
            return null;
        }
    });
}

function shouldThrottle(key, windowMs) {
    const now = Date.now();
    const last = recentVisits.get(key) || 0;
    if (now - last < windowMs) {
        return true;
    }
    recentVisits.set(key, now);
    if (recentVisits.size > 2000) {
        for (const [entryKey, timestamp] of recentVisits) {
            if (now - timestamp > windowMs * 4) {
                recentVisits.delete(entryKey);
            }
        }
    }
    return false;
}

function appOpen(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = req.body || {};
            const user = yield decodeUser(req);
            const headerApp = String((req.headers && req.headers["x-client-app"]) || "").trim();
            const app = headerApp || String(body.app || "").trim() || "unknown";
            const page = typeof body.path === "string" ? body.path.slice(0, 200) : null;
            const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 200) : null;
            const ip = String((req.headers && (req.headers["x-forwarded-for"] || req.headers["cf-connecting-ip"])) || req.socket.remoteAddress || "");
            const key = `${ip.split(",")[0]}:${app}:${user ? user.id.toString() : "guest"}`;
            if (shouldThrottle(key, 45000)) {
                return res.json({ status: "success", data: { tracked: false, reason: "throttled" } });
            }
            (0, admin_alert_service_1.notifyAdmin)({
                title: "APP OPEN",
                emoji: "🟢",
                user,
                app,
                req,
                mirror: false,
                fields: [
                    ["Page", page],
                    ["Referrer", referrer],
                ],
            });
            return res.json({ status: "success", data: { tracked: true } });
        }
        catch (error) {
            return res.status(500).json({ error: "Failed to record app open" });
        }
    });
}

function alertsStatus(req, res) {
    return res.json({ status: "success", data: (0, admin_alert_service_1.getStats)() });
}

function testAlert(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, admin_alert_service_1.sendTestAlert)();
            return res.json({ status: "success", data: result });
        }
        catch (error) {
            return res.status(400).json({ error: error.message || "Failed to send test alert" });
        }
    });
}
