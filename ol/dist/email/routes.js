"use strict";
/** Public verification/resend endpoints and admin email studio endpoints. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicRouter = exports.adminRouter = void 0;

const express = require("express");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma").default;
const { authenticateJWT, authenticateOptionalJWT } = require("../middleware/auth.middleware");
const { authorizeAdmin } = require("../middleware/admin.middleware");
const { successResponse, errorResponse } = require("../utils/http-response");
const { logger } = require("../utils/logger");
const { resolveSite } = require("./sites");
const {
    resendVerification,
    verifyEmail,
    sendAdminCampaign,
    sendCampaignTest,
    listCampaigns,
    getCampaign,
    previewCampaign,
    nudgeUnverified,
} = require("./service");

const publicRouter = express.Router();
const adminRouter = express.Router();
exports.publicRouter = publicRouter;
exports.adminRouter = adminRouter;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_RECIPIENTS = Math.max(1, Number(process.env.EMAIL_CAMPAIGN_MAX_RECIPIENTS || 500));
const USER_SELECT = {
    id: true,
    name: true,
    email: true,
    signup_site: true,
    email_verified_at: true,
    role: true,
};

function toBigInt(value) {
    try {
        return value === null || value === undefined || value === "" ? null : BigInt(String(value));
    } catch (_error) {
        return null;
    }
}

function verificationErrorMessage(error) {
    if (error && error.name === "TokenExpiredError") {
        return { message: "This verification link has expired. Please request a new one.", code: "EXPIRED" };
    }
    return { message: "This verification link is invalid or has already been used.", code: "INVALID" };
}

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

publicRouter.post("/verify-token", async (req, res) => {
    try {
        const { token } = req.body || {};
        if (!token) return errorResponse(res, "Verification token is required", 400);
        const result = await verifyEmail(token);
        return successResponse(res, {
            verified: true,
            alreadyVerified: result.alreadyVerified,
            site: result.site,
        }, result.alreadyVerified ? "Email was already verified" : "Email verified successfully");
    } catch (error) {
        const info = verificationErrorMessage(error);
        return errorResponse(res, info.message, 400, { code: info.code });
    }
});

/** Browser-friendly fallback: clicking the raw API link still lands on the site. */
publicRouter.get("/verify", (req, res) => {
    const token = String(req.query.token || "");
    let status = "success";
    verifyEmail(token)
        .then((result) => {
            status = result.alreadyVerified ? "already" : "success";
            return res.redirect(`${resolveSite(result.site).url}/verify-email?status=${status}`);
        })
        .catch((error) => {
            const info = verificationErrorMessage(error);
            // Even an expired token tells us which brand issued it.
            const decoded = jwt.decode(token);
            const site = resolveSite(decoded && decoded.site);
            logger.warn("Verification link failed", { code: info.code, site: site.id });
            return res.redirect(`${site.url}/verify-email?status=${info.code.toLowerCase()}`);
        });
});

const resendAttempts = new Map();
function resendRateLimited(key) {
    const now = Date.now();
    const entry = resendAttempts.get(key);
    if (!entry || now - entry.startedAt > 60 * 60 * 1000) {
        resendAttempts.set(key, { startedAt: now, count: 1 });
        return false;
    }
    if (entry.count >= 5) return true;
    entry.count += 1;
    return false;
}

publicRouter.post("/resend", authenticateOptionalJWT, async (req, res) => {
    try {
        const email = String((req.body && req.body.email) || "").trim().toLowerCase();
        const userId = req.user && req.user.id;
        const key = `${String(req.ip || "unknown")}:${email || userId || "anonymous"}`;
        if (resendRateLimited(key)) {
            return errorResponse(res, "Too many requests. Please try again in an hour.", 429);
        }
        if (!email && !userId) {
            return errorResponse(res, "Enter your email address", 400);
        }
        if (email && !EMAIL_RE.test(email)) {
            return errorResponse(res, "Enter a valid email address", 400);
        }
        const result = await resendVerification({ email, userId, site: req.body && req.body.site });
        return successResponse(res, {
            sent: Boolean(result.sent),
            site: result.site || null,
        }, "If that account exists, a verification link is on its way");
    } catch (error) {
        logger.error("Resend verification failed", { message: error.message });
        return errorResponse(res, "Could not send the email. Please try again.", 500);
    }
});

// ---------------------------------------------------------------------------
// Admin (mounted at /api/admin/emails)
// ---------------------------------------------------------------------------

adminRouter.use(authenticateJWT, authorizeAdmin);

adminRouter.get("/", async (_req, res) => {
    try {
        return successResponse(res, await listCampaigns({ limit: 100 }), "Email history fetched");
    } catch (error) {
        return errorResponse(res, "Could not load email history", 500);
    }
});

adminRouter.get("/:campaignId", async (req, res) => {
    try {
        return successResponse(res, await getCampaign(req.params.campaignId), "Campaign details fetched");
    } catch (error) {
        return errorResponse(res, "Could not load campaign details", 500);
    }
});

adminRouter.post("/preview", async (req, res) => {
    try {
        const { subject, html, site, sample } = req.body || {};
        const rendered = await previewCampaign({ subject, html, site, sample });
        return successResponse(res, rendered, "Preview generated");
    } catch (error) {
        return errorResponse(res, error.message || "Could not generate preview", 400);
    }
});

adminRouter.post("/test", async (req, res) => {
    try {
        const { to, subject, html, site } = req.body || {};
        const recipient = String(to || (req.user && req.user.email) || "").trim().toLowerCase();
        if (!EMAIL_RE.test(recipient)) return errorResponse(res, "Enter a valid test email address", 400);
        if (!subject || !html) return errorResponse(res, "Subject and message body are required", 422);
        const result = await sendCampaignTest({
            to: recipient,
            subject,
            html,
            site,
            adminId: req.user && req.user.id,
            userId: req.user && req.user.id,
        });
        return successResponse(res, result, `Test email sent to ${recipient}`);
    } catch (error) {
        logger.error("Admin test email failed", { message: error.message });
        return errorResponse(res, error.message || "Could not send test email", 500);
    }
});

adminRouter.post("/send", async (req, res) => {
    try {
        const { userIds = [], segment = "selected", subject, html, site = "auto" } = req.body || {};
        if (!subject || !String(subject).trim()) return errorResponse(res, "A subject line is required", 422);
        if (!html || !String(html).trim()) return errorResponse(res, "A message body is required", 422);

        let users = [];
        if (segment === "selected") {
            const ids = (Array.isArray(userIds) ? userIds : [])
                .map(toBigInt)
                .filter((id) => id !== null)
                .slice(0, MAX_RECIPIENTS);
            if (ids.length === 0) return errorResponse(res, "Select at least one recipient", 422);
            users = await prisma.user.findMany({
                where: { id: { in: ids }, email: { not: null }, deleted_at: null },
                select: USER_SELECT,
                take: MAX_RECIPIENTS,
            });
        } else {
            const where = { email: { not: null }, deleted_at: null };
            if (segment === "verified") where.email_verified_at = { not: null };
            if (segment === "unverified") where.email_verified_at = null;
            users = await prisma.user.findMany({ where, select: USER_SELECT, take: MAX_RECIPIENTS });
        }
        if (users.length === 0) return errorResponse(res, "No recipients matched the selected audience", 422);

        const result = await sendAdminCampaign({
            users,
            subject,
            html,
            site,
            adminId: req.user && req.user.id,
        });
        return successResponse(res, result, `Campaign sent to ${result.sent} of ${result.total} recipients`);
    } catch (error) {
        logger.error("Admin campaign failed", { message: error.message });
        return errorResponse(res, error.message || "Could not send campaign", 500);
    }
});

adminRouter.post("/nudge-unverified", async (req, res) => {
    try {
        const { userIds = [], site = "auto" } = req.body || {};
        const ids = (Array.isArray(userIds) ? userIds : [])
            .map(toBigInt)
            .filter((id) => id !== null)
            .slice(0, MAX_RECIPIENTS);
        if (ids.length === 0) return errorResponse(res, "Select at least one recipient", 422);
        const users = await prisma.user.findMany({
            where: { id: { in: ids }, email: { not: null }, deleted_at: null },
            select: USER_SELECT,
            take: MAX_RECIPIENTS,
        });
        const result = await nudgeUnverified({ users, site, adminId: req.user && req.user.id });
        return successResponse(res, result, `Sent ${result.sent} verification reminder(s)`);
    } catch (error) {
        logger.error("Verification nudge failed", { message: error.message });
        return errorResponse(res, error.message || "Could not send reminders", 500);
    }
});
