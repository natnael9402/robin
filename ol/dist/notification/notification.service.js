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
exports.createNotificationForUser = exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.getUnreadNotificationCount = exports.listUserNotifications = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const serializeNotification = (notification) => {
    var _a, _b, _c, _d;
    return (Object.assign(Object.assign({}, notification), { id: (_a = notification.id) === null || _a === void 0 ? void 0 : _a.toString(), user_id: (_b = notification.user_id) === null || _b === void 0 ? void 0 : _b.toString(), admin_id: (_d = (_c = notification.admin_id) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : null }));
};
const listUserNotifications = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const [notifications, unread_count] = yield Promise.all([
        prisma_1.default.notification.findMany({
            where: { user_id: userId },
            orderBy: { created_at: "desc" },
            take: 100,
            include: {
                admin: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        }),
        prisma_1.default.notification.count({
            where: {
                user_id: userId,
                is_read: false,
            },
        }),
    ]);
    return {
        notifications: notifications.map(serializeNotification),
        unread_count,
    };
});
exports.listUserNotifications = listUserNotifications;
const getUnreadNotificationCount = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.notification.count({
        where: {
            user_id: userId,
            is_read: false,
        },
    });
});
exports.getUnreadNotificationCount = getUnreadNotificationCount;
const markNotificationAsRead = (userId, notificationId) => __awaiter(void 0, void 0, void 0, function* () {
    const notification = yield prisma_1.default.notification.findFirst({
        where: {
            id: notificationId,
            user_id: userId,
        },
    });
    if (!notification) {
        return null;
    }
    if (notification.is_read) {
        return serializeNotification(notification);
    }
    const updated = yield prisma_1.default.notification.update({
        where: { id: notificationId },
        data: {
            is_read: true,
            read_at: new Date(),
        },
    });
    return serializeNotification(updated);
});
exports.markNotificationAsRead = markNotificationAsRead;
const markAllNotificationsAsRead = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.notification.updateMany({
        where: {
            user_id: userId,
            is_read: false,
        },
        data: {
            is_read: true,
            read_at: new Date(),
        },
    });
});
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
const createNotificationForUser = (input) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield prisma_1.default.user.findUnique({
        where: { id: input.userId },
        select: { id: true },
    });
    if (!user) {
        return null;
    }
    const notification = yield prisma_1.default.notification.create({
        data: {
            user_id: input.userId,
            admin_id: input.adminId,
            title: input.title,
            message: input.message,
            image_url: (_a = input.imageUrl) !== null && _a !== void 0 ? _a : null,
        },
    });
    return serializeNotification(notification);
});
exports.createNotificationForUser = createNotificationForUser;
