"use strict";
/**
 * Single source of truth for outgoing HTML email. Table layout + inline styles
 * only (Gmail/Outlook/Apple Mail support), no external CSS or webfonts.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeHtml = exports.sanitizeAdminHtml = exports.htmlToText = exports.interpolate = void 0;
exports.renderEmail = exports.renderVerificationEmail = exports.renderPasswordResetEmail = exports.renderAdminEmail = exports.renderVerificationReminderEmail = void 0;

const { logoUrl, siteLegalLinks } = require("./sites");

const ENTITIES = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
};

function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (ch) => ENTITIES[ch]);
}
exports.escapeHtml = escapeHtml;

/**
 * Admin-authored Tiptap HTML is trusted, but still strip executable markup and
 * event handlers so a broken paste cannot corrupt the message or inject scripts.
 */
function sanitizeAdminHtml(input) {
    let html = String(input == null ? "" : input);
    html = html.replace(/<!--[\s\S]*?-->/g, "");
    html = html.replace(/<!doctype[^>]*>/gi, "");
    html = html.replace(/<(script|style|iframe|object|embed|form|input|button|select|textarea|svg|math)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
    html = html.replace(/<(script|style|iframe|object|embed|form|input|button|select|textarea|svg|math)\b[^>]*\/?>/gi, "");
    html = html.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
    html = html.replace(/\s(href|src|action)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, "$1=\"#\"");
    html = html.replace(/\s(href|src|action)\s*=\s*javascript:[^\s>]+/gi, "$1=\"#\"");
    return html.trim();
}
exports.sanitizeAdminHtml = sanitizeAdminHtml;

function decodeBasicEntities(text) {
    return String(text)
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

function htmlToText(html) {
    return decodeBasicEntities(
        String(html || "")
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<\/(p|div|li|h[1-6]|tr|blockquote)>/gi, "\n")
            .replace(/<li\b[^>]*>/gi, "• ")
            .replace(/<[^>]+>/g, "")
            .replace(/\n{3,}/g, "\n\n")
            .trim()
    );
}
exports.htmlToText = htmlToText;

/** Personalisation tokens are escaped per recipient before injection into HTML. */
function interpolate(template, variables) {
    const values = Object.assign({}, variables || {});
    return String(template || "").replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (match, key) => {
        const value = values[key];
        return value === undefined || value === null || value === "" ? "" : escapeHtml(value);
    });
}
exports.interpolate = interpolate;

const BUTTON = (label, url) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:28px auto;">
  <tr><td align="center" bgcolor="#D4AF37" style="border-radius:10px;">
    <a href="${escapeHtml(url)}" target="_blank" style="display:inline-block;padding:15px 32px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:#111111;text-decoration:none;border-radius:10px;">${escapeHtml(label)}</a>
  </td></tr>
</table>`;

/**
 * @param {object} options
 * @param {object} options.site resolved site from email/sites.js
 * @param {string} options.subject email subject
 * @param {string} options.preheader hidden inbox preview text
 * @param {string} options.contentHtml already-sanitised body HTML
 * @param {{label:string,url:string}} [options.cta]
 * @param {string} [options.footerNote]
 */
function renderEmail({ site, subject, preheader, contentHtml, cta, footerNote }) {
    const links = siteLegalLinks(site);
    const safeSubject = escapeHtml(subject || "");
    const safePreheader = escapeHtml(preheader || "");
    const safeFooter = escapeHtml(footerNote || `You are receiving this email because you have an account at ${site.name}.`);
    const ctaHtml = cta && cta.url ? BUTTON(cta.label || "Continue", cta.url) : "";
    const plainLink = cta && cta.url
        ? `<p style="margin:18px 0 0;font-size:12px;line-height:1.6;color:#9aa0a6;word-break:break-all;">If the button does not work, copy this link:<br><a href="${escapeHtml(cta.url)}" style="color:#D4AF37;">${escapeHtml(cta.url)}</a></p>`
        : "";

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark light">
<title>${safeSubject}</title>
</head>
<body style="margin:0;padding:0;background:#0b0d0f;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${safePreheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0b0d0f;">
  <tr><td align="center" style="padding:28px 12px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#14171b;border:1px solid #2a2e34;border-radius:16px;overflow:hidden;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;">
      <tr><td align="center" style="padding:30px 28px;background:#0e1013;border-bottom:2px solid #D4AF37;">
        <img src="${escapeHtml(logoUrl(site))}" width="180" alt="${escapeHtml(site.shortName)}" style="display:block;max-width:180px;height:auto;border:0;outline:none;text-decoration:none;">
        <div style="margin-top:12px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#a8adb4;">${escapeHtml(site.tagline)}</div>
      </td></tr>
      <tr><td style="padding:32px 34px 8px;color:#e9eaec;font-size:15px;line-height:1.7;">
        ${contentHtml}
        ${ctaHtml}
        ${plainLink}
      </td></tr>
      <tr><td style="padding:24px 34px 30px;">
        <div style="border-top:1px solid #2a2e34;padding-top:18px;font-size:12px;line-height:1.7;color:#8d939b;">
          <p style="margin:0 0 8px;">${safeFooter}</p>
          <p style="margin:0;">
            <a href="${escapeHtml(links.terms)}" style="color:#a8adb4;text-decoration:underline;">Terms</a>
            &nbsp;·&nbsp;
            <a href="${escapeHtml(links.privacy)}" style="color:#a8adb4;text-decoration:underline;">Privacy</a>
            &nbsp;·&nbsp;
            <a href="${escapeHtml(links.home)}" style="color:#a8adb4;text-decoration:underline;">${escapeHtml(site.name)}</a>
          </p>
        </div>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
exports.renderEmail = renderEmail;

function renderVerificationEmail({ site, name, verifyUrl, expiresHours = 24 }) {
    const firstName = String(name || "").trim().split(/\s+/)[0] || "there";
    const subject = `One quick step while your ID is reviewed · ${site.name}`;
    const content = `
<h1 style="margin:0 0 18px;font-size:24px;line-height:1.3;color:#ffffff;">Confirm your email while we review your ID</h1>
<p style="margin:0 0 16px;">Hi ${escapeHtml(firstName)},</p>
<p style="margin:0 0 16px;">Your identity documents are being reviewed. While you wait, confirm your email address so your <strong style="color:#D4AF37;">${escapeHtml(site.name)}</strong> account is ready as soon as approval finishes.</p>
<p style="margin:0;color:#b9bec5;">Tap the button below — it only takes a second.</p>`;
    const html = renderEmail({
        site,
        subject,
        preheader: `Confirm your email while your ${site.name} identity review is in progress.`,
        contentHtml: content,
        cta: { label: "Verify my email", url: verifyUrl },
        footerNote: `This verification link expires in ${expiresHours} hours. If you did not submit these documents, you can safely ignore this email.`,
    });
    return { subject, html, text: htmlToText(html) };
}
exports.renderVerificationEmail = renderVerificationEmail;

function renderVerificationReminderEmail({ site, name, verifyUrl, expiresHours = 24 }) {
    const rendered = renderVerificationEmail({ site, name, verifyUrl, expiresHours });
    return Object.assign({}, rendered, { subject: `Reminder: confirm your email · ${site.name}` });
}
exports.renderVerificationReminderEmail = renderVerificationReminderEmail;

function renderPasswordResetEmail({ site, name, resetUrl, token, expiresHours = 1 }) {
    const firstName = String(name || "").trim().split(/\s+/)[0] || "there";
    const subject = `Reset your password · ${site.name}`;
    const content = `
<h1 style="margin:0 0 18px;font-size:24px;line-height:1.3;color:#ffffff;">Password reset request</h1>
<p style="margin:0 0 16px;">Hi ${escapeHtml(firstName)},</p>
<p style="margin:0 0 16px;">We received a request to reset the password for your ${escapeHtml(site.name)} account. Use the button below to choose a new one.</p>
<p style="margin:0;color:#b9bec5;">Prefer a code? Enter this on the reset page:</p>
<p style="margin:10px 0 0;padding:12px;background:#20242a;border:1px solid #343940;border-radius:8px;font-family:'Courier New',monospace;font-size:18px;letter-spacing:3px;text-align:center;color:#D4AF37;">${escapeHtml(token)}</p>`;
    const html = renderEmail({
        site,
        subject,
        preheader: `Use this link to reset your ${site.name} password.`,
        contentHtml: content,
        cta: { label: "Reset my password", url: resetUrl },
        footerNote: `This link and code expire in ${expiresHours} hour(s). If you did not request a reset, your account is still safe — ignore this email.`,
    });
    return { subject, html, text: htmlToText(html) };
}
exports.renderPasswordResetEmail = renderPasswordResetEmail;

function renderAdminEmail({ site, subject, bodyHtml, preheader }) {
    const content = sanitizeAdminHtml(bodyHtml);
    const html = renderEmail({
        site,
        subject,
        preheader: preheader || subject,
        contentHtml: content,
        footerNote: `This message was sent by ${site.name} to inform you about your account or our services.`,
    });
    return { subject, html, text: htmlToText(content), content };
}
exports.renderAdminEmail = renderAdminEmail;
