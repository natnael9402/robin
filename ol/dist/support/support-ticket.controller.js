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
exports.downloadAttachment = exports.getUnreadCount = exports.deleteMessage = exports.updateMessage = exports.markMessagesRead = exports.sendMessage = exports.getCategories = exports.removeTicket = exports.updateTicket = exports.getTicket = exports.createTicket = exports.listTickets = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const support_ticket_service_1 = require("./support-ticket.service");
const http_response_1 = require("../utils/http-response");
const blob_storage_1 = require("../utils/blob-storage");
const PUBLIC_DIR = path_1.default.resolve("public");
const normalizeAttachmentMetadata = (files) => __awaiter(void 0, void 0, void 0, function* () {
    if (!files || files.length === 0) {
        return [];
    }
    const uploads = yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
        const uploadResult = yield (0, blob_storage_1.uploadBufferToBlob)(file.buffer, file.mimetype || "application/octet-stream", file.originalname, {
            folder: "support-attachments",
            filenamePrefix: "ticket",
        });
        return {
            url: uploadResult.url,
            downloadUrl: uploadResult.downloadUrl,
            pathname: uploadResult.pathname,
            path: uploadResult.pathname,
            name: file.originalname,
            mime: file.mimetype,
            size: file.size,
        };
    })));
    return uploads;
});
const ensureAuthenticated = (req, res) => {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
        (0, http_response_1.errorResponse)(res, "Unauthorized", 401);
        return null;
    }
    try {
        return BigInt(req.user.id);
    }
    catch (error) {
        (0, http_response_1.errorResponse)(res, "Invalid user identifier", 400);
        return null;
    }
};
const getGuestUserId = (() => {
    let cachedId = null;
    return () => __awaiter(void 0, void 0, void 0, function* () {
        if (cachedId) return cachedId;
        const prisma = require("../prisma").default;
        const guestEmail = "guest@system.paxora";
        let guest = yield prisma.user.findUnique({ where: { email: guestEmail }, select: { id: true } });
        if (!guest) {
            guest = yield prisma.user.create({
                data: {
                    email: guestEmail,
                    name: "Guest User",
                    password: "__none__",
                    phone: "0000000000",
                    role: "user",
                },
                select: { id: true },
            });
        }
        cachedId = BigInt(guest.id);
        return cachedId;
    });
})();
const listTickets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        let userId, isAdmin;
        const guestSessionId = req.query.guest_session_id || req.query.guestSessionId || null;
        if (req.user && req.user.id) {
            userId = BigInt(req.user.id);
            isAdmin = req.user.role === "admin";
        } else if (guestSessionId) {
            userId = yield getGuestUserId();
            isAdmin = false;
        } else {
            return (0, http_response_1.errorResponse)(res, "Unauthorized", 401);
        }
        const pageRaw = (_a = req.query.page) !== null && _a !== void 0 ? _a : undefined;
        const perPageRaw = (_c = (_b = req.query.perPage) !== null && _b !== void 0 ? _b : req.query.per_page) !== null && _c !== void 0 ? _c : undefined;
        const page = pageRaw ? Number(pageRaw) || 1 : 1;
        const perPage = perPageRaw ? Number(perPageRaw) || 10 : 10;
        const result = yield (0, support_ticket_service_1.listSupportTickets)({
            status: req.query.status,
            priority: req.query.priority,
            category: req.query.category || undefined,
            search: guestSessionId ? `[guest:${guestSessionId}]` : (req.query.search || undefined),
            fromDate: req.query.fromDate ||
                req.query.from_date ||
                undefined,
            toDate: req.query.toDate ||
                req.query.to_date ||
                undefined,
        }, { page, perPage }, isAdmin, userId);
        const { tickets, pagination, unreadCount } = result;
        const totalPages = pagination.totalPages === 0 ? 1 : pagination.totalPages;
        const host = (_d = req.get("host")) !== null && _d !== void 0 ? _d : "localhost";
        const protocol = (_e = req.protocol) !== null && _e !== void 0 ? _e : "http";
        const basePath = `${protocol}://${host}${req.baseUrl}`;
        const normalizePath = basePath.endsWith("/")
            ? basePath.slice(0, -1)
            : basePath;
        const toSearchParams = () => {
            const params = new URLSearchParams();
            const query = req.query;
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined)
                    continue;
                const normalizedKey = key === "perPage" ? "per_page" : key;
                if (Array.isArray(value)) {
                    value.forEach((item) => params.append(normalizedKey, String(item)));
                }
                else {
                    params.set(normalizedKey, String(value));
                }
            }
            params.delete("perPage");
            params.set("per_page", String(pagination.perPage));
            return params;
        };
        const buildPageUrl = (pageNumber) => {
            if (!pageNumber || pageNumber < 1 || pageNumber > totalPages) {
                return null;
            }
            const params = toSearchParams();
            params.set("page", String(pageNumber));
            const queryString = params.toString();
            return `${normalizePath}?${queryString}`;
        };
        const hasTickets = tickets.length > 0;
        const from = hasTickets
            ? (pagination.page - 1) * pagination.perPage + 1
            : null;
        const to = !hasTickets || from === null ? null : from + tickets.length - 1;
        const links = [];
        links.push({
            url: buildPageUrl(pagination.page - 1),
            label: "&laquo; Previous",
            active: false,
        });
        for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
            links.push({
                url: buildPageUrl(pageNumber),
                label: String(pageNumber),
                active: pageNumber === pagination.page,
            });
        }
        links.push({
            url: buildPageUrl(pagination.page + 1),
            label: "Next &raquo;",
            active: false,
        });
        return (0, http_response_1.successResponse)(res, {
            tickets: {
                data: tickets,
                current_page: pagination.page,
                per_page: pagination.perPage,
                total: pagination.total,
                last_page: totalPages,
                from,
                to,
                path: normalizePath,
                first_page_url: buildPageUrl(1),
                last_page_url: buildPageUrl(totalPages),
                next_page_url: buildPageUrl(pagination.page + 1),
                prev_page_url: buildPageUrl(pagination.page - 1),
                links,
            },
            unread_count: unreadCount,
        }, "Support tickets retrieved successfully");
    }
    catch (error) {
        return (0, http_response_1.errorResponse)(res, "Failed to retrieve support tickets", 500, error.message);
    }
});
exports.listTickets = listTickets;
const createTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userId, isAdmin;
        const guestSessionId = req.body.guest_session_id || req.body.guestSessionId || null;
        if (req.user && req.user.id) {
            userId = BigInt(req.user.id);
            isAdmin = req.user.role === "admin";
        } else if (guestSessionId) {
            userId = yield getGuestUserId();
            isAdmin = false;
        } else {
            return (0, http_response_1.errorResponse)(res, "Unauthorized", 401);
        }
        const { subject, message, category, priority } = req.body;
        const attachments = yield normalizeAttachmentMetadata(req.files);
        const { ticket, message: initialMessage } = yield (0, support_ticket_service_1.createSupportTicket)(userId, {
            subject: guestSessionId ? `[guest:${guestSessionId}] ${subject || "Support Chat"}` : subject,
            message,
            category,
            priority,
            attachments,
        }, isAdmin);
        return (0, http_response_1.successResponse)(res, {
            ticket,
            message: initialMessage,
        }, "Support ticket created successfully", 201);
    }
    catch (error) {
        const err = error;
        if (err.message === "ACTIVE_TICKET_EXISTS") {
            return (0, http_response_1.errorResponse)(res, "You already have an active support conversation. Please use your existing ticket.", 409, err.ticketId ? { ticket_id: Number(err.ticketId) } : undefined);
        }
        return (0, http_response_1.errorResponse)(res, "Failed to create support ticket", 500, err.message);
    }
});
exports.createTicket = createTicket;
const getTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userId, isAdmin;
        const guestSessionId = req.query.guest_session_id || req.query.guestSessionId || null;
        if (req.user && req.user.id) {
            userId = BigInt(req.user.id);
            isAdmin = req.user.role === "admin";
        } else if (guestSessionId) {
            userId = yield getGuestUserId();
            isAdmin = false;
        } else {
            return (0, http_response_1.errorResponse)(res, "Unauthorized", 401);
        }
        const ticketId = Number(req.params.id);
        yield (0, support_ticket_service_1.markTicketMessagesAsReadForViewer)(ticketId, { isAdmin, userId });
        const ticket = yield (0, support_ticket_service_1.getSupportTicketById)(ticketId, { isAdmin, userId });
        if (!ticket) {
            return (0, http_response_1.errorResponse)(res, "Support ticket not found", 404);
        }
        if (guestSessionId && ticket.subject && !ticket.subject.includes(`[guest:${guestSessionId}]`)) {
            return (0, http_response_1.errorResponse)(res, "Support ticket not found", 404);
        }
        return (0, http_response_1.successResponse)(res, { ticket }, "Support ticket retrieved successfully");
    }
    catch (error) {
        const message = error.message;
        if (message === "UNAUTHORIZED") {
            return (0, http_response_1.errorResponse)(res, "Unauthorized access", 403);
        }
        if (message === "NOT_FOUND") {
            return (0, http_response_1.errorResponse)(res, "Support ticket not found", 404);
        }
        return (0, http_response_1.errorResponse)(res, "Failed to retrieve support ticket", 500, message);
    }
});
exports.getTicket = getTicket;
const updateTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = ensureAuthenticated(req, res);
        if (userId === null)
            return;
        const isAdmin = req.user.role === "admin";
        const ticketId = Number(req.params.id);
        const { status, priority, category } = req.body;
        const ticket = yield (0, support_ticket_service_1.updateSupportTicket)(ticketId, { status, priority, category }, { isAdmin, userId });
        return (0, http_response_1.successResponse)(res, { ticket }, "Support ticket updated successfully");
    }
    catch (error) {
        const message = error.message;
        if (message === "UNAUTHORIZED" || message === "FORBIDDEN_STATUS_CHANGE") {
            return (0, http_response_1.errorResponse)(res, "Unauthorized action", 403);
        }
        if (message === "NOT_FOUND") {
            return (0, http_response_1.errorResponse)(res, "Support ticket not found", 404);
        }
        return (0, http_response_1.errorResponse)(res, "Failed to update support ticket", 500, message);
    }
});
exports.updateTicket = updateTicket;
const removeTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = ensureAuthenticated(req, res);
        if (userId === null)
            return;
        const isAdmin = req.user.role === "admin";
        const ticketId = Number(req.params.id);
        yield (0, support_ticket_service_1.deleteSupportTicket)(ticketId, { isAdmin, userId });
        return (0, http_response_1.successResponse)(res, [], "Support ticket deleted successfully");
    }
    catch (error) {
        const message = error.message;
        if (message === "NOT_FOUND") {
            return (0, http_response_1.errorResponse)(res, "Support ticket not found", 404);
        }
        if (message === "UNAUTHORIZED") {
            return (0, http_response_1.errorResponse)(res, "Unauthorized action", 403);
        }
        return (0, http_response_1.errorResponse)(res, "Failed to delete support ticket", 500, message);
    }
});
exports.removeTicket = removeTicket;
const getCategories = (_req, res) => {
    return (0, http_response_1.successResponse)(res, { categories: (0, support_ticket_service_1.supportTicketCategories)() }, "Categories retrieved successfully");
};
exports.getCategories = getCategories;
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userId, isAdmin;
        const guestSessionId = req.body.guest_session_id || req.body.guestSessionId || null;
        if (req.user && req.user.id) {
            userId = BigInt(req.user.id);
            isAdmin = req.user.role === "admin";
        } else if (guestSessionId) {
            userId = yield getGuestUserId();
            isAdmin = false;
        } else {
            return (0, http_response_1.errorResponse)(res, "Unauthorized", 401);
        }
        const ticketId = Number(req.params.ticketId);
        const { message } = req.body;
        const attachments = yield normalizeAttachmentMetadata(req.files);
        const createdMessage = yield (0, support_ticket_service_1.createSupportTicketMessage)(ticketId, { isAdmin, userId }, { message, attachments });
        const ticket = yield (0, support_ticket_service_1.getSupportTicketById)(ticketId, { isAdmin, userId });
        return (0, http_response_1.successResponse)(res, {
            message: createdMessage,
            ticket,
        }, "Message sent successfully", 201);
    }
    catch (error) {
        const message = error.message;
        if (message === "UNAUTHORIZED") {
            return (0, http_response_1.errorResponse)(res, "Unauthorized access", 403);
        }
        if (message === "NOT_FOUND") {
            return (0, http_response_1.errorResponse)(res, "Support ticket not found", 404);
        }
        return (0, http_response_1.errorResponse)(res, "Failed to send message", 500, message);
    }
});
exports.sendMessage = sendMessage;
const markMessagesRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userId, isAdmin;
        if (req.user && req.user.id) {
            userId = BigInt(req.user.id);
            isAdmin = req.user.role === "admin";
        } else {
            return (0, http_response_1.successResponse)(res, [], "Messages marked as read");
        }
        const messageIds = req.body.messageIds.map((id) => Number(id));
        yield (0, support_ticket_service_1.markMessagesAsRead)(messageIds, { isAdmin, userId });
        return (0, http_response_1.successResponse)(res, [], "Messages marked as read");
    }
    catch (error) {
        const message = error.message;
        if (message === "UNAUTHORIZED") {
            return (0, http_response_1.errorResponse)(res, "Unauthorized access", 403);
        }
        if (message === "INVALID_MESSAGES") {
            return (0, http_response_1.errorResponse)(res, "Invalid messages provided", 400);
        }
        return (0, http_response_1.errorResponse)(res, "Failed to mark messages as read", 500, message);
    }
});
exports.markMessagesRead = markMessagesRead;
const updateMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = ensureAuthenticated(req, res);
        if (userId === null)
            return;
        const isAdmin = req.user.role === "admin";
        const ticketId = Number(req.params.ticketId);
        const messageId = Number(req.params.messageId);
        const { message } = req.body;
        const updatedMessage = yield (0, support_ticket_service_1.updateSupportTicketMessage)(ticketId, messageId, { isAdmin, userId }, { message });
        return (0, http_response_1.successResponse)(res, { message: updatedMessage }, "Message updated successfully");
    }
    catch (error) {
        const message = error.message;
        if (message === "UNAUTHORIZED") {
            return (0, http_response_1.errorResponse)(res, "Unauthorized action", 403);
        }
        if (message === "NOT_FOUND") {
            return (0, http_response_1.errorResponse)(res, "Message not found", 404);
        }
        return (0, http_response_1.errorResponse)(res, "Failed to update message", 500, message);
    }
});
exports.updateMessage = updateMessage;
const deleteMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = ensureAuthenticated(req, res);
        if (userId === null)
            return;
        const isAdmin = req.user.role === "admin";
        const ticketId = Number(req.params.ticketId);
        const messageId = Number(req.params.messageId);
        yield (0, support_ticket_service_1.deleteSupportTicketMessage)(ticketId, messageId, {
            isAdmin,
            userId,
        });
        return (0, http_response_1.successResponse)(res, [], "Message deleted successfully");
    }
    catch (error) {
        const message = error.message;
        if (message === "UNAUTHORIZED") {
            return (0, http_response_1.errorResponse)(res, "Unauthorized action", 403);
        }
        if (message === "NOT_FOUND") {
            return (0, http_response_1.errorResponse)(res, "Message not found", 404);
        }
        return (0, http_response_1.errorResponse)(res, "Failed to delete message", 500, message);
    }
});
exports.deleteMessage = deleteMessage;
const getUnreadCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userId, isAdmin;
        if (req.user && req.user.id) {
            userId = BigInt(req.user.id);
            isAdmin = req.user.role === "admin";
        } else {
            return (0, http_response_1.successResponse)(res, { unread_count: 0 }, "Unread count retrieved successfully");
        }
        const unreadCount = yield (0, support_ticket_service_1.computeUnreadMessages)(isAdmin, userId);
        return (0, http_response_1.successResponse)(res, { unread_count: unreadCount }, "Unread count retrieved successfully");
    }
    catch (error) {
        return (0, http_response_1.errorResponse)(res, "Failed to retrieve unread count", 500, error.message);
    }
});
exports.getUnreadCount = getUnreadCount;
const downloadAttachment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const userId = ensureAuthenticated(req, res);
        if (userId === null)
            return;
        const isAdmin = req.user.role === "admin";
        const ticketId = Number(req.params.ticketId);
        const messageId = Number(req.params.messageId);
        const attachmentIndex = Number(req.params.index);
        const attachment = yield (0, support_ticket_service_1.getSupportTicketAttachment)(ticketId, messageId, attachmentIndex, {
            isAdmin,
            userId,
        });
        if (attachment.url || attachment.downloadUrl) {
            const remoteUrl = (_a = attachment.downloadUrl) !== null && _a !== void 0 ? _a : attachment.url;
            if (!remoteUrl) {
                return (0, http_response_1.errorResponse)(res, "Attachment not found", 404);
            }
            try {
                const remoteResponse = yield axios_1.default.get(remoteUrl, {
                    responseType: "stream",
                });
                const contentType = (_c = (_b = attachment.mime) !== null && _b !== void 0 ? _b : remoteResponse.headers["content-type"]) !== null && _c !== void 0 ? _c : "application/octet-stream";
                const filename = (_d = attachment.name) !== null && _d !== void 0 ? _d : "attachment";
                res.setHeader("Content-Type", contentType);
                res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
                remoteResponse.data.pipe(res);
                return;
            }
            catch (error) {
                return (0, http_response_1.errorResponse)(res, "Failed to download attachment", 502, error instanceof Error ? error.message : String(error));
            }
        }
        if (attachment.path) {
            const absolutePath = path_1.default.resolve(PUBLIC_DIR, attachment.path);
            if (!fs_1.default.existsSync(absolutePath)) {
                return (0, http_response_1.errorResponse)(res, "Attachment not found", 404);
            }
            return res.download(absolutePath, attachment.name);
        }
        return (0, http_response_1.errorResponse)(res, "Attachment not found", 404);
    }
    catch (error) {
        const message = error.message;
        if (message === "UNAUTHORIZED") {
            return (0, http_response_1.errorResponse)(res, "Unauthorized access", 403);
        }
        if (message === "NOT_FOUND" || message === "ATTACHMENT_NOT_FOUND") {
            return (0, http_response_1.errorResponse)(res, "Attachment not found", 404);
        }
        return (0, http_response_1.errorResponse)(res, "Failed to download attachment", 500, message);
    }
});
exports.downloadAttachment = downloadAttachment;
