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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupportTicketAttachment = exports.markTicketMessagesAsReadForViewer = exports.deleteSupportTicketMessage = exports.updateSupportTicketMessage = exports.createSupportTicketMessage = exports.markMessagesAsRead = exports.computeUnreadMessages = exports.computeUnreadCount = exports.supportTicketCategories = exports.deleteSupportTicket = exports.updateSupportTicket = exports.createSupportTicket = exports.getSupportTicketById = exports.listSupportTickets = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const parseJson = (value) => {
    if (!value)
        return null;
    try {
        const parsed = JSON.parse(value);
        return parsed;
    }
    catch (error) {
        return null;
    }
};
const formatMessage = (message) => {
    const { attachments } = message, rest = __rest(message, ["attachments"]);
    return Object.assign(Object.assign({}, rest), { attachments: parseJson(attachments) || [] });
};
const formatTicket = (ticket) => {
    const { messages } = ticket, rest = __rest(ticket, ["messages"]);
    return Object.assign(Object.assign({}, rest), { messages: messages
            ? messages.map((message) => formatMessage(message))
            : undefined });
};
const buildTicketWhere = (filters, isAdmin, userId) => {
    const where = {};
    if (filters.status) {
        where.status = filters.status;
    }
    if (filters.priority) {
        where.priority = filters.priority;
    }
    if (filters.category) {
        where.category = filters.category;
    }
    if (filters.search) {
        where.subject = { contains: filters.search };
    }
    if (filters.fromDate && filters.toDate) {
        where.created_at = {
            gte: new Date(filters.fromDate),
            lte: new Date(filters.toDate),
        };
    }
    if (!isAdmin && userId) {
        where.user_id = userId;
    }
    return where;
};
const listSupportTickets = (filters, pagination, isAdmin, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const where = buildTicketWhere(filters, isAdmin, userId);
    const skip = (pagination.page - 1) * pagination.perPage;
    const [tickets, total, unreadCount] = yield Promise.all([
        prisma_1.default.supportTicket.findMany({
            where,
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
                messages: {
                    take: 1,
                    orderBy: [{ created_at: "desc" }],
                    include: {
                        user: { select: { id: true, name: true, email: true } },
                        admin: { select: { id: true, name: true, email: true } },
                    },
                },
            },
            orderBy: [{ last_reply_at: "desc" }, { created_at: "desc" }],
            skip,
            take: pagination.perPage,
        }),
        prisma_1.default.supportTicket.count({ where }),
        (0, exports.computeUnreadCount)(isAdmin, userId),
    ]);
    const formattedTickets = tickets.map((ticket) => formatTicket(ticket));
    const ticketsWithLatest = formattedTickets.map((ticket) => {
        const _a = ticket, { messages } = _a, rest = __rest(_a, ["messages"]);
        return Object.assign(Object.assign({}, rest), { latest_message: Array.isArray(messages) && messages.length > 0 ? messages[0] : null });
    });
    return {
        tickets: ticketsWithLatest,
        pagination: {
            page: pagination.page,
            perPage: pagination.perPage,
            total,
            totalPages: Math.ceil(total / pagination.perPage) || 1,
        },
        unreadCount,
    };
});
exports.listSupportTickets = listSupportTickets;
const getSupportTicketById = (id, options) => __awaiter(void 0, void 0, void 0, function* () {
    const ticket = yield prisma_1.default.supportTicket.findUnique({
        where: { id },
        include: {
            user: {
                select: { id: true, name: true, email: true },
            },
            messages: {
                orderBy: [{ created_at: "asc" }],
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    admin: { select: { id: true, name: true, email: true } },
                },
            },
        },
    });
    if (!ticket) {
        return null;
    }
    if (!options.isAdmin && ticket.user_id !== options.userId) {
        throw new Error("UNAUTHORIZED");
    }
    return formatTicket(ticket);
});
exports.getSupportTicketById = getSupportTicketById;
const createSupportTicket = (userId, payload, isAdmin) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!isAdmin) {
        const existing = yield prisma_1.default.supportTicket.findFirst({
            where: {
                user_id: userId,
                status: {
                    not: "closed",
                },
            },
            orderBy: { created_at: "desc" },
        });
        if (existing) {
            const error = new Error("ACTIVE_TICKET_EXISTS");
            error.ticketId = Number(existing.id);
            throw error;
        }
    }
    const now = new Date();
    const ticket = yield prisma_1.default.supportTicket.create({
        data: {
            user_id: userId,
            subject: payload.subject,
            priority: payload.priority,
            category: payload.category,
            status: "open",
            last_reply_at: now,
        },
    });
    const createdMessage = yield prisma_1.default.supportTicketMessage.create({
        data: {
            ticket_id: ticket.id,
            user_id: userId,
            message: payload.message,
            attachments: JSON.stringify((_a = payload.attachments) !== null && _a !== void 0 ? _a : []),
            is_read: false,
        },
        include: {
            user: { select: { id: true, name: true, email: true } },
            admin: { select: { id: true, name: true, email: true } },
        },
    });
    const ticketDetails = yield (0, exports.getSupportTicketById)(Number(ticket.id), {
        isAdmin,
        userId,
    });
    if (!ticketDetails) {
        throw new Error("FAILED_TO_LOAD_TICKET");
    }
    return {
        ticket: ticketDetails,
        message: formatMessage(createdMessage),
    };
});
exports.createSupportTicket = createSupportTicket;
const updateSupportTicket = (id, data, options) => __awaiter(void 0, void 0, void 0, function* () {
    const ticket = yield prisma_1.default.supportTicket.findUnique({ where: { id } });
    if (!ticket) {
        throw new Error("NOT_FOUND");
    }
    if (!options.isAdmin && ticket.user_id !== options.userId) {
        throw new Error("UNAUTHORIZED");
    }
    const updateData = {};
    if (typeof data.priority !== "undefined") {
        updateData.priority = data.priority;
    }
    if (typeof data.category !== "undefined") {
        updateData.category = data.category;
    }
    if (typeof data.status !== "undefined") {
        if (!options.isAdmin && data.status !== "open") {
            throw new Error("FORBIDDEN_STATUS_CHANGE");
        }
        if (data.status === "closed" && ticket.status !== "closed") {
            updateData.closed_at = new Date();
        }
        else if (data.status !== "closed" && ticket.status === "closed") {
            updateData.closed_at = null;
        }
        updateData.status = data.status;
    }
    yield prisma_1.default.supportTicket.update({
        where: { id },
        data: updateData,
    });
    return (0, exports.getSupportTicketById)(id, options);
});
exports.updateSupportTicket = updateSupportTicket;
const deleteSupportTicket = (id, options) => __awaiter(void 0, void 0, void 0, function* () {
    const ticket = yield prisma_1.default.supportTicket.findUnique({ where: { id } });
    if (!ticket) {
        throw new Error("NOT_FOUND");
    }
    if (!options.isAdmin && ticket.user_id !== options.userId) {
        throw new Error("UNAUTHORIZED");
    }
    yield prisma_1.default.supportTicket.delete({ where: { id } });
});
exports.deleteSupportTicket = deleteSupportTicket;
const supportTicketCategories = () => ({
    account: "Account Issues",
    deposit: "Deposit Problems",
    withdrawal: "Withdrawal Issues",
    kyc: "KYC/Verification",
    trading: "Trading Problems",
    technical: "Technical Support",
    security: "Security Concerns",
    other: "Other",
});
exports.supportTicketCategories = supportTicketCategories;
const computeUnreadCount = (isAdmin, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (isAdmin) {
        return prisma_1.default.supportTicket.count({
            where: {
                messages: {
                    some: {
                        user_id: { not: null },
                        is_read: false,
                    },
                },
            },
        });
    }
    if (!userId) {
        return 0;
    }
    return prisma_1.default.supportTicket.count({
        where: {
            user_id: userId,
            messages: {
                some: {
                    admin_id: { not: null },
                    is_read: false,
                },
            },
        },
    });
});
exports.computeUnreadCount = computeUnreadCount;
const computeUnreadMessages = (isAdmin, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (isAdmin) {
        return prisma_1.default.supportTicketMessage.count({
            where: {
                user_id: { not: null },
                is_read: false,
            },
        });
    }
    return prisma_1.default.supportTicketMessage.count({
        where: {
            admin_id: { not: null },
            is_read: false,
            ticket: {
                user_id: userId,
            },
        },
    });
});
exports.computeUnreadMessages = computeUnreadMessages;
const markMessagesAsRead = (messageIds, options) => __awaiter(void 0, void 0, void 0, function* () {
    const messages = yield prisma_1.default.supportTicketMessage.findMany({
        where: { id: { in: messageIds } },
        include: { ticket: true },
    });
    if (messages.length !== messageIds.length) {
        throw new Error("INVALID_MESSAGES");
    }
    const idsToMark = [];
    for (const message of messages) {
        if (!options.isAdmin && message.ticket.user_id !== options.userId) {
            throw new Error("UNAUTHORIZED");
        }
        const isFromOppositeParty = options.isAdmin
            ? message.user_id !== null
            : message.admin_id !== null;
        if (isFromOppositeParty) {
            idsToMark.push(message.id);
        }
    }
    if (idsToMark.length === 0) {
        return { updated: 0 };
    }
    const result = yield prisma_1.default.supportTicketMessage.updateMany({
        where: { id: { in: idsToMark } },
        data: { is_read: true },
    });
    return { updated: result.count };
});
exports.markMessagesAsRead = markMessagesAsRead;
const createSupportTicketMessage = (ticket_id, sender, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const ticket = yield prisma_1.default.supportTicket.findUnique({
        where: { id: ticket_id },
    });
    if (!ticket) {
        throw new Error("NOT_FOUND");
    }
    if (!sender.isAdmin && ticket.user_id !== sender.userId) {
        throw new Error("UNAUTHORIZED");
    }
    const message = yield prisma_1.default.supportTicketMessage.create({
        data: {
            ticket_id,
            message: payload.message,
            attachments: JSON.stringify((_a = payload.attachments) !== null && _a !== void 0 ? _a : []),
            is_read: false,
            admin_id: sender.isAdmin ? sender.userId : undefined,
            user_id: sender.isAdmin ? undefined : sender.userId,
        },
        include: {
            admin: { select: { id: true, name: true, email: true } },
            user: { select: { id: true, name: true, email: true } },
        },
    });
    const now = new Date();
    yield prisma_1.default.supportTicket.update({
        where: { id: ticket_id },
        data: {
            last_reply_at: now,
            status: sender.isAdmin
                ? ticket.status === "closed"
                    ? ticket.status
                    : "awaiting_user"
                : ticket.status === "closed"
                    ? ticket.status
                    : "in_progress",
        },
    });
    return formatMessage(message);
});
exports.createSupportTicketMessage = createSupportTicketMessage;
const updateSupportTicketMessage = (ticketId, messageId, sender, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield prisma_1.default.supportTicketMessage.findUnique({
        where: { id: BigInt(messageId) },
        include: {
            ticket: {
                select: {
                    id: true,
                    user_id: true,
                },
            },
            admin: { select: { id: true, name: true, email: true } },
            user: { select: { id: true, name: true, email: true } },
        },
    });
    if (!existing) {
        throw new Error("NOT_FOUND");
    }
    if (Number(existing.ticket_id) !== ticketId) {
        throw new Error("NOT_FOUND");
    }
    if (!sender.isAdmin) {
        if (existing.ticket.user_id !== sender.userId) {
            throw new Error("UNAUTHORIZED");
        }
        if (existing.user_id !== sender.userId) {
            throw new Error("UNAUTHORIZED");
        }
    }
    else if (existing.admin_id !== sender.userId) {
        throw new Error("UNAUTHORIZED");
    }
    const updated = yield prisma_1.default.supportTicketMessage.update({
        where: { id: existing.id },
        data: {
            message: payload.message,
        },
        include: {
            admin: { select: { id: true, name: true, email: true } },
            user: { select: { id: true, name: true, email: true } },
        },
    });
    return formatMessage(updated);
});
exports.updateSupportTicketMessage = updateSupportTicketMessage;
const deleteSupportTicketMessage = (ticketId, messageId, sender) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield prisma_1.default.supportTicketMessage.findUnique({
        where: { id: BigInt(messageId) },
        include: {
            ticket: {
                select: { id: true, user_id: true },
            },
        },
    });
    if (!existing) {
        throw new Error("NOT_FOUND");
    }
    if (Number(existing.ticket_id) !== ticketId) {
        throw new Error("NOT_FOUND");
    }
    if (!sender.isAdmin) {
        if (existing.ticket.user_id !== sender.userId) {
            throw new Error("UNAUTHORIZED");
        }
        if (existing.user_id !== sender.userId) {
            throw new Error("UNAUTHORIZED");
        }
    }
    else if (existing.admin_id !== sender.userId) {
        throw new Error("UNAUTHORIZED");
    }
    yield prisma_1.default.supportTicketMessage.delete({ where: { id: existing.id } });
    return { deleted: true };
});
exports.deleteSupportTicketMessage = deleteSupportTicketMessage;
const markTicketMessagesAsReadForViewer = (ticket_id, options) => __awaiter(void 0, void 0, void 0, function* () {
    const ticket = yield prisma_1.default.supportTicket.findUnique({
        where: { id: ticket_id },
        select: { id: true, user_id: true },
    });
    if (!ticket) {
        throw new Error("NOT_FOUND");
    }
    if (!options.isAdmin && ticket.user_id !== options.userId) {
        throw new Error("UNAUTHORIZED");
    }
    const result = yield prisma_1.default.supportTicketMessage.updateMany({
        where: Object.assign({ ticket_id, is_read: false }, (options.isAdmin
            ? { user_id: { not: null } }
            : { admin_id: { not: null } })),
        data: { is_read: true },
    });
    return { updated: result.count };
});
exports.markTicketMessagesAsReadForViewer = markTicketMessagesAsReadForViewer;
const getSupportTicketAttachment = (ticketId, messageId, attachmentIndex, options) => __awaiter(void 0, void 0, void 0, function* () {
    const message = yield prisma_1.default.supportTicketMessage.findFirst({
        where: { id: messageId, ticket_id: ticketId },
        include: {
            ticket: {
                select: {
                    user_id: true,
                },
            },
        },
    });
    if (!message) {
        throw new Error("NOT_FOUND");
    }
    if (!options.isAdmin && message.ticket.user_id !== options.userId) {
        throw new Error("UNAUTHORIZED");
    }
    const attachments = parseJson(message.attachments) || [];
    if (attachmentIndex < 0 || attachmentIndex >= attachments.length) {
        throw new Error("ATTACHMENT_NOT_FOUND");
    }
    return attachments[attachmentIndex];
});
exports.getSupportTicketAttachment = getSupportTicketAttachment;
