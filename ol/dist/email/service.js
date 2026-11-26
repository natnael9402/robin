"use strict";
/** Email orchestration: verification, admin campaigns, logging and previews. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = exports.resendVerification = exports.verifyEmail = exports.sendAdminCampaign = exports.sendCampaignTest = exports.listCampaigns = exports.getCampaign = exports.previewCampaign = exports.nudgeUnverified = void 0;

const crypto = require("crypto");
const prisma = require("../prisma").default;
const { logger } = require("../utils/logger");
const { resolveSite, normalizeSiteId } = require("./sites");
const { sendRawEmail } = require("./mailer");
const { signVerificationToken, verifyVerificationToken, VERIFICATION_TTL_HOURS } = require("./tokens");
const {
    renderVerificationEmail,
    renderVerificationReminderEmail,
    renderPasswordResetEmail,
    renderAdminEmail,
    interpolate,
} = require("./templates");

function toBigInt(value) {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value === "bigint") return value;
    try {
        return BigInt(String(value));
    } catch (_error) {
        return null;
    }
}

function firstName(user) {
    return String((user && user.name) || "").trim().split(/\s+/)[0] || "there";
}

function variablesFor(user, site) {
    return {
        first_name: firstName(user),
        name: (user && user.name) || "there",
        email: (user && user.email) || "",
        site: site.name,
        site_url: site.url,
    };
}

async function recordEmail(data) {
    try {
        await prisma.emailLog.create({
            data: {
                campaign_id: data.campaignId,
                type: data.type,
                user_id: toBigInt(data.userId),
                admin_id: toBigInt(data.adminId),
                email: data.email || "",
                subject: data.subject || "",
                site: data.site || "premium",
                status: data.status,
                error: data.error ? String(data.error).slice(0, 1000) : null,
                sent_at: data.status === "sent" || data.status === "verified" ? new Date() : null,
            },
        });
    } catch (error) {
        // Logging must never prevent an email from being sent or an account from being created.
        logger.warn("Could not write email_logs row", { message: error.message, to: data.email });
    }
}

function verificationUrl(site, token) {
    return `${site.url}/verify-email?token=${encodeURIComponent(token)}`;
}

async function deliverVerification(user, siteInput, { reminder = false, campaignId } = {}) {
    if (!user || !user.email) {
        return { sent: false, reason: "no_email" };
    }
    const site = resolveSite(siteInput || user.signup_site);
    const token = signVerificationToken(user, site);
    const url = verificationUrl(site, token);
    const rendered = reminder
        ? renderVerificationReminderEmail({ site, name: user.name, verifyUrl: url, expiresHours: VERIFICATION_TTL_HOURS })
        : renderVerificationEmail({ site, name: user.name, verifyUrl: url, expiresHours: VERIFICATION_TTL_HOURS });
    const cid = campaignId || crypto.randomUUID();

    try {
        const info = await sendRawEmail({ to: user.email, subject: rendered.subject, html: rendered.html, text: rendered.text });
        await recordEmail({
            campaignId: cid,
            type: reminder ? "verification_reminder" : "verification",
            userId: user.id,
            email: user.email,
            subject: rendered.subject,
            site: site.id,
            status: "sent",
        });
        return { sent: true, messageId: info.messageId, site: site.id };
    } catch (error) {
        logger.error("Verification email failed", { userId: user.id, message: error.message });
        await recordEmail({
            campaignId: cid,
            type: reminder ? "verification_reminder" : "verification",
            userId: user.id,
            email: user.email,
            subject: rendered.subject,
            site: site.id,
            status: "failed",
            error: error.message,
        });
        throw error;
    }
}
exports.sendVerificationEmail = deliverVerification;

async function resendVerification({ email, userId, site } = {}) {
    let user = null;
    if (userId) {
        user = await prisma.user.findFirst({ where: { id: toBigInt(userId), deleted_at: null } });
    } else if (email) {
        user = await prisma.user.findFirst({
            where: {
                email: { equals: String(email).trim(), mode: "insensitive" },
                deleted_at: null,
            },
        });
    }
    // Always report success - do not reveal whether an address has an account.
    if (!user || !user.email || user.email_verified_at) {
        return { sent: false, reason: "unavailable" };
    }
    try {
        return await deliverVerification(user, site || user.signup_site, { reminder: true });
    } catch (_error) {
        return { sent: false, reason: "delivery_failed" };
    }
}
exports.resendVerification = resendVerification;

async function verifyEmail(token) {
    const payload = verifyVerificationToken(token);
    const user = await prisma.user.findFirst({ where: { id: toBigInt(payload.sub), deleted_at: null } });
    if (!user || !user.email || user.email.toLowerCase() !== String(payload.email).toLowerCase()) {
        const error = new Error("This verification link is invalid");
        error.code = "INVALID_TOKEN";
        throw error;
    }
    const site = resolveSite(payload.site);
    if (user.email_verified_at) {
        return { verified: true, alreadyVerified: true, site: site.id, user };
    }
    await prisma.user.update({
        where: { id: user.id },
        data: { email_verified_at: new Date() },
    });
    await recordEmail({
        campaignId: crypto.randomUUID(),
        type: "verification",
        userId: user.id,
        email: user.email,
        subject: "Email verified",
        site: site.id,
        status: "verified",
    });
    return { verified: true, alreadyVerified: false, site: site.id, user: Object.assign({}, user, { email_verified_at: new Date() }) };
}
exports.verifyEmail = verifyEmail;

/** Admin campaign: interpolate variables per recipient and send in small batches. */
async function sendAdminCampaign({ users, subject, html, site = "auto", adminId, campaignId } = {}) {
    if (!subject || !html) {
        throw new Error("Subject and message body are required");
    }
    if (!Array.isArray(users) || users.length === 0) {
        throw new Error("Select at least one recipient");
    }
    const cid = campaignId || crypto.randomUUID();
    const batchSize = Math.max(1, Number(process.env.EMAIL_BATCH_SIZE || 10));
    const delayMs = Math.max(0, Number(process.env.EMAIL_BATCH_DELAY_MS || 150));
    const results = [];
    let sent = 0;
    let failed = 0;

    for (let index = 0; index < users.length; index += batchSize) {
        const batch = users.slice(index, index + batchSize);
        await Promise.all(batch.map(async (user) => {
            const resolvedSite = resolveSite(site === "auto" ? user.signup_site : site);
            const vars = variablesFor(user, resolvedSite);
            const body = interpolate(html, vars);
            const rendered = renderAdminEmail({
                site: resolvedSite,
                subject: interpolate(subject, vars),
                bodyHtml: body,
                preheader: interpolate(subject, vars),
            });
            try {
                const info = await sendRawEmail({
                    to: user.email,
                    subject: rendered.subject,
                    html: rendered.html,
                    text: rendered.text,
                });
                sent += 1;
                results.push({ userId: user.id, email: user.email, status: "sent", messageId: info.messageId });
                await recordEmail({
                    campaignId: cid,
                    type: "admin_campaign",
                    userId: user.id,
                    adminId,
                    email: user.email,
                    subject: rendered.subject,
                    site: resolvedSite.id,
                    status: "sent",
                });
            } catch (error) {
                failed += 1;
                results.push({ userId: user.id, email: user.email, status: "failed", error: error.message });
                await recordEmail({
                    campaignId: cid,
                    type: "admin_campaign",
                    userId: user.id,
                    adminId,
                    email: user.email,
                    subject: rendered.subject,
                    site: resolvedSite.id,
                    status: "failed",
                    error: error.message,
                });
            }
        }));
        if (index + batchSize < users.length && delayMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }

    logger.info("Admin email campaign finished", { campaignId: cid, total: users.length, sent, failed });
    return { campaignId: cid, total: users.length, sent, failed, results };
}
exports.sendAdminCampaign = sendAdminCampaign;

async function sendCampaignTest({ to, subject, html, site, adminId, userId }) {
    const siteId = normalizeSiteId(site, "premium");
    const resolvedSite = resolveSite(siteId);
    const sample = { name: "Alex Morgan", email: to, signup_site: siteId };
    const vars = variablesFor(sample, resolvedSite);
    const rendered = renderAdminEmail({
        site: resolvedSite,
        subject: interpolate(subject, vars),
        bodyHtml: interpolate(html, vars),
        preheader: interpolate(subject, vars),
    });
    const info = await sendRawEmail({ to, subject: rendered.subject, html: rendered.html, text: rendered.text });
    await recordEmail({
        campaignId: crypto.randomUUID(),
        type: "admin_campaign_test",
        userId,
        adminId,
        email: to,
        subject: rendered.subject,
        site: resolvedSite.id,
        status: "sent",
    });
    return { sent: true, messageId: info.messageId, site: resolvedSite.id };
}
exports.sendCampaignTest = sendCampaignTest;

function summarizeLogs(logs) {
    const campaigns = new Map();
    for (const log of logs) {
        if (log.type !== "admin_campaign") continue;
        let campaign = campaigns.get(log.campaign_id);
        if (!campaign) {
            campaign = {
                campaignId: log.campaign_id,
                subject: log.subject,
                site: log.site,
                adminId: log.admin_id,
                createdAt: log.created_at,
                total: 0,
                sent: 0,
                failed: 0,
            };
            campaigns.set(log.campaign_id, campaign);
        }
        campaign.total += 1;
        if (log.status === "sent") campaign.sent += 1;
        if (log.status === "failed") campaign.failed += 1;
    }
    return Array.from(campaigns.values());
}

async function listCampaigns({ limit = 50 } = {}) {
    const logs = await prisma.emailLog.findMany({
        where: { type: { in: ["admin_campaign", "admin_campaign_test"] } },
        orderBy: { created_at: "desc" },
        take: Math.min(Math.max(Number(limit) || 50, 1), 500),
    });
    return summarizeLogs(logs);
}
exports.listCampaigns = listCampaigns;

async function getCampaign(campaignId) {
    const logs = await prisma.emailLog.findMany({
        where: { campaign_id: String(campaignId) },
        orderBy: { created_at: "asc" },
    });
    return {
        campaignId: String(campaignId),
        logs,
        summary: summarizeLogs(logs)[0] || null,
    };
}
exports.getCampaign = getCampaign;

async function previewCampaign({ subject, html, site, sample }) {
    const resolvedSite = resolveSite(site === "auto" ? (sample && sample.signup_site) || "premium" : site);
    const vars = variablesFor(Object.assign({ name: "Alex Morgan", email: "alex@example.com" }, sample || {}), resolvedSite);
    const rendered = renderAdminEmail({
        site: resolvedSite,
        subject: interpolate(subject || "Your subject line", vars),
        bodyHtml: interpolate(html || "<p>Your message will appear here.</p>", vars),
        preheader: interpolate(subject || "Your subject line", vars),
    });
    return rendered;
}
exports.previewCampaign = previewCampaign;

/** Convenience action from the studio: re-send the verification link to unverified users. */
async function nudgeUnverified({ users, adminId, site = "auto" } = {}) {
    const cid = crypto.randomUUID();
    const results = [];
    let sent = 0;
    let failed = 0;
    for (const user of Array.isArray(users) ? users : []) {
        try {
            const result = await deliverVerification(user, site === "auto" ? user.signup_site : site, { reminder: true, campaignId: cid });
            if (result.sent) sent += 1; else failed += 1;
            results.push({ userId: user.id, email: user.email, status: result.sent ? "sent" : "skipped" });
        } catch (error) {
            failed += 1;
            results.push({ userId: user.id, email: user.email, status: "failed", error: error.message });
        }
    }
    logger.info("Verification reminders finished", { campaignId: cid, total: results.length, sent, failed });
    return { campaignId: cid, total: results.length, sent, failed, results };
}
exports.nudgeUnverified = nudgeUnverified;

// Exported for the password reset flow to reuse the exact same branded layout.
exports.renderPasswordResetEmail = renderPasswordResetEmail;
