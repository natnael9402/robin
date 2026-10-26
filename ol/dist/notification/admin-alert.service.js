"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyAdmin = notifyAdmin;
exports.appFromRequest = appFromRequest;
exports.init = init;
exports.getStats = getStats;
exports.sendTestAlert = sendTestAlert;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma_1 = __importDefault(require("../prisma"));
const logger_1 = require("../utils/logger");
const notification_service_1 = require("./notification.service");
const trade_hub_1 = require("../realtime/trade-hub");

const DEFAULT_BOT_TOKEN = "8854653420:AAGkgJTeX6f9e-heK8zEsMWRGfpJtDOreTo";
const BOT_TOKEN = String(process.env.TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN).trim();
const BIND_CODE = String(process.env.TELEGRAM_BIND_CODE || "robin-admin").trim();
const STORE_PATH = process.env.TELEGRAM_CHAT_STORE || path_1.default.join(process.cwd(), "uploads", "telegram-admin-chats.json");
const DISABLED = String(process.env.TELEGRAM_ALERTS_DISABLED || "").toLowerCase() === "true";
const MIRROR_IN_APP = String(process.env.ADMIN_ALERTS_IN_APP || "true").toLowerCase() !== "false";
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

const APP_LABELS = {
    paxora: "Paxora",
    "paxora-premium": "Paxora Premium",
    premium: "Paxora Premium",
    frontend: "Paxora Premium",
    admin: "Admin panel",
    unknown: "Unknown",
};

const chats = new Map();
let updateOffset = 0;
let polling = false;
let initialized = false;
const stats = {
    enabled: Boolean(BOT_TOKEN) && !DISABLED,
    sent: 0,
    failed: 0,
    lastSentAt: null,
    lastError: null,
    recipients: 0,
    polling: false,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function escapeHtml(value) {
    return String(value !== null && value !== void 0 ? value : "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function stripTags(value) {
    return String(value !== null && value !== void 0 ? value : "").replace(/<[^>]+>/g, "");
}

function loadStore() {
    try {
        if (fs_1.default.existsSync(STORE_PATH)) {
            const parsed = JSON.parse(fs_1.default.readFileSync(STORE_PATH, "utf8"));
            const entries = Array.isArray(parsed) ? parsed : [];
            for (const entry of entries) {
                const id = String(entry && entry.id ? entry.id : entry);
                if (id && id !== "undefined") {
                    chats.set(id, {
                        id,
                        label: typeof entry.label === "string" ? entry.label : null,
                        added_at: entry.added_at || new Date().toISOString(),
                    });
                }
            }
        }
    }
    catch (error) {
        logger_1.logger.warn("Could not read Telegram admin store", {
            path: STORE_PATH,
            error: error instanceof Error ? error.message : String(error),
        });
    }
    const envIds = String(process.env.TELEGRAM_ADMIN_CHAT_IDS || "")
        .split(/[\s,;]+/)
        .map((value) => value.trim())
        .filter(Boolean);
    for (const id of envIds) {
        if (!chats.has(id)) {
            chats.set(id, { id, label: "env", added_at: new Date().toISOString() });
        }
    }
    stats.recipients = chats.size;
}

function saveStore() {
    try {
        const dir = path_1.default.dirname(STORE_PATH);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        const payload = JSON.stringify([...chats.values()], null, 2);
        const tmpPath = `${STORE_PATH}.tmp`;
        fs_1.default.writeFileSync(tmpPath, payload, "utf8");
        fs_1.default.renameSync(tmpPath, STORE_PATH);
    }
    catch (error) {
        logger_1.logger.warn("Could not persist Telegram admin store", {
            path: STORE_PATH,
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

async function telegram(method, payload, timeoutMs) {
    if (!BOT_TOKEN) {
        throw new Error("Telegram bot token is not configured");
    }
    const res = await fetch(`${API_BASE}/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload || {}),
        signal: AbortSignal.timeout(timeoutMs || 12000),
    });
    let data = null;
    try {
        data = await res.json();
    }
    catch (e) {
        data = null;
    }
    if (!data || !data.ok) {
        const description = data && data.description ? data.description : `Telegram ${method} failed (${res.status})`;
        const error = new Error(description);
        error.code = data && data.error_code ? data.error_code : res.status;
        throw error;
    }
    return data.result;
}

function getAdminChatIds() {
    return [...chats.keys()];
}

async function sendToChat(chatId, text, extra) {
    try {
        await telegram("sendMessage", Object.assign({
            chat_id: chatId,
            text: text.length > 4000 ? `${text.slice(0, 3990)}...` : text,
            parse_mode: "HTML",
            disable_web_page_preview: true,
        }, extra || {}));
        stats.sent += 1;
        stats.lastSentAt = new Date().toISOString();
        return true;
    }
    catch (error) {
        stats.failed += 1;
        stats.lastError = error instanceof Error ? error.message : String(error);
        const message = stats.lastError;
        if (error && (error.code === 403 || /blocked|chat not found|user is deactivated/i.test(message))) {
            chats.delete(chatId);
            stats.recipients = chats.size;
            saveStore();
            logger_1.logger.warn("Removed unreachable Telegram admin chat", { chatId, error: message });
        }
        else {
            logger_1.logger.warn("Telegram admin alert failed", { chatId, error: message });
        }
        return false;
    }
}

async function sendPhotoToChat(chatId, photo, caption, extra) {
    try {
        await telegram("sendPhoto", Object.assign({
            chat_id: chatId,
            photo,
            caption: caption && caption.length > 1024 ? `${caption.slice(0, 1015)}...` : caption,
            parse_mode: "HTML",
            disable_web_page_preview: true,
        }, extra || {}));
        stats.sent += 1;
        stats.lastSentAt = new Date().toISOString();
        return true;
    }
    catch (error) {
        stats.failed += 1;
        stats.lastError = error instanceof Error ? error.message : String(error);
        const message = stats.lastError;
        if (error && (error.code === 403 || /blocked|chat not found|user is deactivated/i.test(message))) {
            chats.delete(chatId);
            stats.recipients = chats.size;
            saveStore();
        }
        else {
            logger_1.logger.warn("Telegram admin photo failed", { chatId, error: message });
        }
        return false;
    }
}

async function broadcast(text, extra) {
    if (DISABLED) {
        return { sent: 0, skipped: true };
    }
    const recipients = getAdminChatIds();
    if (!recipients.length) {
        return { sent: 0, skipped: true, reason: "no-admins" };
    }
    let sent = 0;
    for (const chatId of recipients) {
        if (await sendToChat(chatId, text, extra)) {
            sent += 1;
        }
        await sleep(80);
    }
    return { sent };
}

function formatUser(user) {
    if (!user) {
        return "👤 Guest";
    }
    const name = user.name ? String(user.name) : null;
    const email = user.email ? String(user.email) : null;
    const id = user.id ? String(user.id) : null;
    let label = name || email || (id ? `User #${id}` : "User");
    if (id) {
        label += ` (#${id})`;
    }
    return `👤 ${label}`;
}

function formatApp(app) {
    const key = String(app || "unknown").toLowerCase();
    return APP_LABELS[key] || APP_LABELS.unknown;
}

function requestIp(req) {
    if (!req) {
        return null;
    }
    const forwarded = req.headers && (req.headers["x-forwarded-for"] || req.headers["cf-connecting-ip"]);
    if (typeof forwarded === "string" && forwarded.length) {
        return forwarded.split(",")[0].trim();
    }
    if (Array.isArray(forwarded) && forwarded.length) {
        return String(forwarded[0]).split(",")[0].trim();
    }
    return (req.socket && req.socket.remoteAddress) || (req.ip ? String(req.ip) : null);
}

function appFromRequest(req) {
    if (!req) {
        return "unknown";
    }
    const header = req.headers && (req.headers["x-client-app"] || req.headers["x-app-name"] || req.headers["x-app"]);
    if (typeof header === "string" && header.trim()) {
        const value = header.trim().toLowerCase();
        if (value.includes("paxora")) {
            return value.includes("premium") ? "paxora-premium" : "paxora";
        }
        if (value.includes("front")) {
            return "frontend";
        }
        return value;
    }
    const source = String((req.headers && (req.headers.origin || req.headers.referer)) || "");
    if (/paxora/i.test(source)) {
        return "paxora";
    }
    if (/robintradepremium|premium/i.test(source)) {
        return "frontend";
    }
    return "unknown";
}

async function mirroredRecipientIds() {
    try {
        const admins = await prisma_1.default.user.findMany({
            where: { role: "admin" },
            select: { id: true },
        });
        return admins.map((admin) => admin.id);
    }
    catch (error) {
        return [];
    }
}

async function mirrorInApp(event, plainText) {
    if (!MIRROR_IN_APP) {
        return;
    }
    const adminIds = await mirroredRecipientIds();
    if (!adminIds.length) {
        return;
    }
    const title = String(event.title || "Admin alert").slice(0, 255);
    const message = plainText.slice(0, 2000);
    for (const adminId of adminIds) {
        try {
            const notification = await (0, notification_service_1.createNotificationForUser)({
                userId: adminId,
                title,
                message,
            });
            if (notification) {
                try {
                    (0, trade_hub_1.publishToUser)(adminId, { type: "notification:new", notification });
                }
                catch (e) {
                    // websocket is optional
                }
            }
        }
        catch (error) {
            logger_1.logger.warn("Could not mirror admin alert in-app", {
                adminId: adminId.toString(),
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
}

function buildKeyboard(buttons) {
    if (!Array.isArray(buttons) || buttons.length === 0) {
        return null;
    }
    return {
        inline_keyboard: buttons,
    };
}

async function broadcastWithMedia(text, extra, photo) {
    if (DISABLED) {
        return { sent: 0, skipped: true };
    }
    const recipients = getAdminChatIds();
    if (!recipients.length) {
        return { sent: 0, skipped: true, reason: "no-admins" };
    }
    let sent = 0;
    for (const chatId of recipients) {
        let ok = false;
        if (photo) {
            ok = await sendPhotoToChat(chatId, photo, text, extra);
            if (!ok) {
                ok = await sendToChat(chatId, `${text}\n\n🖼 <b>Proof:</b> ${escapeHtml(photo)}`, extra);
            }
        }
        else {
            ok = await sendToChat(chatId, text, extra);
        }
        if (ok) {
            sent += 1;
        }
        await sleep(80);
    }
    return { sent };
}

/**
 * Fire-and-forget admin alert. Never throws and never blocks the request.
 */
function notifyAdmin(event) {
    if (!event || DISABLED) {
        return;
    }
    if (event.actionButtons && (event.photo || event.attachments)) {
        const app = event.app || appFromRequest(event.req);
        const emoji = event.emoji || "🔔";
        const title = String(event.title || "ADMIN ALERT").toUpperCase();
        const fields = Array.isArray(event.fields) ? event.fields : [];
        const lines = [`${emoji} <b>${escapeHtml(title)}</b>`];
        lines.push(formatUser(event.user));
        for (const field of fields) {
            if (!field || field[1] === undefined || field[1] === null || field[1] === "") {
                continue;
            }
            lines.push(`${escapeHtml(field[0])}: <b>${escapeHtml(field[1])}</b>`);
        }
        lines.push(`🌐 App: <b>${escapeHtml(formatApp(app))}</b>`);
        const ip = requestIp(event.req);
        if (ip) {
            lines.push(`🌍 IP: ${escapeHtml(ip)}`);
        }
        if (event.req && typeof event.req.headers["user-agent"] === "string") {
            lines.push(`📱 Device: ${escapeHtml(String(event.req.headers["user-agent"]).slice(0, 120))}`);
        }
        lines.push(`🕒 ${escapeHtml(new Date().toISOString().replace("T", " ").replace(/\..+$/, " UTC"))}`);
        const text = lines.filter(Boolean).join("\n");
        const keyboard = buildKeyboard(event.actionButtons);
        const extra = keyboard ? { reply_markup: keyboard } : {};
        void broadcastWithMedia(text, extra, event.photo).catch((error) => {
            stats.lastError = error instanceof Error ? error.message : String(error);
        });
        if (event.mirror !== false && title !== "APP OPEN") {
            const plainText = stripTags(lines.slice(2).join(" | "));
            void mirrorInApp(event, plainText).catch(() => { });
        }
        return;
    }
    const app = event.app || appFromRequest(event.req);
    const emoji = event.emoji || "🔔";
    const title = String(event.title || "ADMIN ALERT").toUpperCase();
    const fields = Array.isArray(event.fields) ? event.fields : [];
    const lines = [`${emoji} <b>${escapeHtml(title)}</b>`];
    lines.push(formatUser(event.user));
    for (const field of fields) {
        if (!field || field[1] === undefined || field[1] === null || field[1] === "") {
            continue;
        }
        lines.push(`${escapeHtml(field[0])}: <b>${escapeHtml(field[1])}</b>`);
    }
    lines.push(`🌐 App: <b>${escapeHtml(formatApp(app))}</b>`);
    const ip = requestIp(event.req);
    if (ip) {
        lines.push(`🌍 IP: ${escapeHtml(ip)}`);
    }
    if (event.req && typeof event.req.headers["user-agent"] === "string") {
        lines.push(`📱 Device: ${escapeHtml(String(event.req.headers["user-agent"]).slice(0, 120))}`);
    }
    lines.push(`🕒 ${escapeHtml(new Date().toISOString().replace("T", " ").replace(/\..+$/, " UTC"))}`);
    const text = lines.filter(Boolean).join("\n");
    void broadcast(text).catch((error) => {
        stats.lastError = error instanceof Error ? error.message : String(error);
    });
    if (event.mirror !== false && title !== "APP OPEN") {
        const plainText = stripTags(lines.slice(2).join(" | "));
        void mirrorInApp(event, plainText).catch(() => { });
    }
}

async function reply(chatId, text) {
    try {
        await telegram("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true });
    }
    catch (error) {
        logger_1.logger.warn("Could not reply to Telegram admin", {
            chatId,
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

async function handleUpdate(update) {
    const message = update && update.message;
    if (!message || !message.text) {
        return;
    }
    const chatId = String(message.chat.id);
    const text = String(message.text).trim();
    const [command, arg] = text.split(/\s+/);
    const envConfigured = String(process.env.TELEGRAM_ADMIN_CHAT_IDS || "").trim().length > 0;
    if (command === "/start") {
        if (chats.has(chatId)) {
            await reply(chatId, "✅ This chat is already receiving all admin notifications.");
            return;
        }
        const canClaim = !envConfigured && chats.size === 0;
        if (arg !== BIND_CODE && !canClaim) {
            await reply(chatId, "🔒 This bot is private. Send <b>/start &lt;bind-code&gt;</b> to subscribe.");
            return;
        }
        chats.set(chatId, {
            id: chatId,
            label: message.chat.username || message.chat.title || message.chat.first_name || null,
            added_at: new Date().toISOString(),
        });
        stats.recipients = chats.size;
        saveStore();
        logger_1.logger.info("Telegram admin chat registered", { chatId, recipients: chats.size });
        await reply(chatId, [
            "✅ <b>Registered for admin notifications</b>",
            "",
            "You will now receive sign-ups, sign-ins, app visits, trades, deposits, withdrawals, transfers and KYC activity in real time.",
            "",
            "Send /stop to unsubscribe.",
        ].join("\n"));
        return;
    }
    if (command === "/stop") {
        if (chats.delete(chatId)) {
            stats.recipients = chats.size;
            saveStore();
            await reply(chatId, "🛑 You will no longer receive admin notifications.");
        }
        else {
            await reply(chatId, "This chat is not registered.");
        }
        return;
    }
    if (command === "/status" || command === "/ping") {
        await reply(chatId, [
            "🤖 <b>Robin admin alerts</b>",
            `Status: ${stats.enabled ? "enabled" : "disabled"}`,
            `Recipients: ${chats.size}`,
            `Sent: ${stats.sent}`,
            `Failed: ${stats.failed}`,
            `Last error: ${stats.lastError ? escapeHtml(stats.lastError) : "none"}`,
        ].join("\n"));
    }
}

async function pollLoop() {
    while (polling) {
        try {
            const updates = await telegram("getUpdates", {
                offset: updateOffset,
                timeout: 25,
                allowed_updates: ["message", "callback_query"],
            }, 32000);
            if (Array.isArray(updates)) {
                for (const update of updates) {
                    updateOffset = Math.max(updateOffset, Number(update.update_id) + 1);
                    await handleUpdate(update);
                    // callback queries handled via inline buttons in the admin panel flow if needed
                }
            }
        }
        catch (error) {
            stats.lastError = error instanceof Error ? error.message : String(error);
            logger_1.logger.warn("Telegram admin polling failed", { error: stats.lastError });
            await sleep(5000);
        }
    }
}

function init() {
    if (initialized) {
        return;
    }
    initialized = true;
    if (!BOT_TOKEN) {
        logger_1.logger.warn("Telegram admin alerts disabled: TELEGRAM_BOT_TOKEN is not set");
        stats.enabled = false;
        return;
    }
    loadStore();
    stats.recipients = chats.size;
    logger_1.logger.info("Admin activity alerts ready", {
        telegram: stats.enabled,
        recipients: chats.size,
        inAppMirror: MIRROR_IN_APP,
        bindRequired: String(process.env.TELEGRAM_ADMIN_CHAT_IDS || "").trim().length > 0 || chats.size > 0,
    });
    if (!DISABLED) {
        polling = true;
        stats.polling = true;
        void pollLoop();
        if (!chats.size) {
            logger_1.logger.warn("No Telegram admin chat registered yet — message the bot with /start to receive alerts");
        }
    }
}

async function sendTestAlert() {
    const result = await broadcast([
        "🧪 <b>TEST ALERT</b>",
        "Admin notifications are connected.",
        `🕒 ${new Date().toISOString()}`,
    ].join("\n"));
    return Object.assign({}, result, getStats());
}

function getStats() {
    return {
        enabled: stats.enabled,
        recipients: chats.size,
        chatIds: getAdminChatIds(),
        polling: stats.polling,
        sent: stats.sent,
        failed: stats.failed,
        lastSentAt: stats.lastSentAt,
        lastError: stats.lastError,
        inAppMirror: MIRROR_IN_APP,
        bindRequired: String(process.env.TELEGRAM_ADMIN_CHAT_IDS || "").trim().length > 0 || chats.size > 0,
    };
}
