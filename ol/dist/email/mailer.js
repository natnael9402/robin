"use strict";
/** Thin wrapper around the existing Hostinger SMTP nodemailer setup. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendRawEmail = void 0;

const nodemailer = require("nodemailer");
const { logger } = require("../utils/logger");

let transporter;

function getTransporter() {
    if (!transporter) {
        if (!process.env.SMTP_HOST) {
            throw new Error("SMTP_HOST is not configured");
        }
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_TLS === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
            pool: true,
            maxConnections: Number(process.env.EMAIL_MAX_CONNECTIONS || 2),
            maxMessages: Number(process.env.EMAIL_MAX_MESSAGES || 100),
            connectionTimeout: 15000,
            greetingTimeout: 15000,
            socketTimeout: 30000,
        });
    }
    return transporter;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @param {{to:string, subject:string, html:string, text?:string, replyTo?:string}} message
 */
async function sendRawEmail({ to, subject, html, text, replyTo }) {
    if (!to || !EMAIL_RE.test(String(to))) {
        throw new Error("Invalid recipient email address");
    }
    if (!subject || !html) {
        throw new Error("Email subject and HTML body are required");
    }
    const fromName = process.env.EMAIL_FROM_NAME || process.env.BRAND_NAME || "Paxora";
    const fromAddress = process.env.EMAILS_FROM_EMAIL || process.env.SMTP_USER;

    logger.info("Sending email", { to, subject });

    if (process.env.EMAIL_PREVIEW_MODE === "true") {
        logger.warn("EMAIL_PREVIEW_MODE is on: email was not actually delivered", { to, subject });
        return { messageId: `preview-${Date.now()}`, preview: true };
    }

    const info = await getTransporter().sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to,
        subject,
        html,
        text: text || undefined,
        replyTo: replyTo || process.env.EMAIL_REPLY_TO || undefined,
    });
    logger.info("Email delivered", { to, messageId: info.messageId });
    return info;
}
exports.sendRawEmail = sendRawEmail;
