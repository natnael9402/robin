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
exports.sendNotification = exports.markAllRead = exports.markRead = exports.unreadCount = exports.listNotifications = void 0;
const http_response_1 = require("../utils/http-response");
const notification_service_1 = require("./notification.service");
const blob_storage_1 = require("../utils/blob-storage");
const getUserId = (req, res) => {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
        (0, http_response_1.errorResponse)(res, "Authentication required", 401);
        return null;
    }
    try {
        return BigInt(req.user.id);
    }
    catch (_error) {
        (0, http_response_1.errorResponse)(res, "Invalid user identifier", 400);
        return null;
    }
};
const listNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = getUserId(req, res);
    if (userId === null)
        return;
    try {
        const result = yield (0, notification_service_1.listUserNotifications)(userId);
        return (0, http_response_1.successResponse)(res, result, "Notifications retrieved successfully");
    }
    catch (error) {
        return (0, http_response_1.errorResponse)(res, "Failed to retrieve notifications", 500, error.message);
    }
});
exports.listNotifications = listNotifications;
const unreadCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = getUserId(req, res);
    if (userId === null)
        return;
    try {
        const count = yield (0, notification_service_1.getUnreadNotificationCount)(userId);
        return (0, http_response_1.successResponse)(res, { count }, "Unread notification count retrieved successfully");
    }
    catch (error) {
        return (0, http_response_1.errorResponse)(res, "Failed to retrieve unread notification count", 500, error.message);
    }
});
exports.unreadCount = unreadCount;
const markRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = getUserId(req, res);
    if (userId === null)
        return;
    try {
        const notification = yield (0, notification_service_1.markNotificationAsRead)(userId, BigInt(req.params.id));
        if (!notification) {
            return (0, http_response_1.errorResponse)(res, "Notification not found", 404);
        }
        return (0, http_response_1.successResponse)(res, { notification }, "Notification marked as read");
    }
    catch (error) {
        return (0, http_response_1.errorResponse)(res, "Failed to mark notification as read", 500, error.message);
    }
});
exports.markRead = markRead;
const markAllRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = getUserId(req, res);
    if (userId === null)
        return;
    try {
        yield (0, notification_service_1.markAllNotificationsAsRead)(userId);
        return (0, http_response_1.successResponse)(res, [], "All notifications marked as read");
    }
    catch (error) {
        return (0, http_response_1.errorResponse)(res, "Failed to mark notifications as read", 500, error.message);
    }
});
exports.markAllRead = markAllRead;
const sendNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const adminId = getUserId(req, res);
    if (adminId === null)
        return;
    try {
        const userId = BigInt(req.params.id);
        const { title, message } = req.body;
        const file = req.file;
        let imageUrl = typeof req.body.image_url === "string" && req.body.image_url.trim()
            ? req.body.image_url.trim()
            : null;
        if (file) {
            const uploaded = yield (0, blob_storage_1.uploadBufferToBlob)(file.buffer, file.mimetype, file.originalname, {
                folder: "notifications",
                filenamePrefix: `notification-${req.params.id}`,
                cacheControlMaxAge: 60 * 60 * 24 * 30,
            });
            imageUrl = uploaded.url;
        }
        const notification = yield (0, notification_service_1.createNotificationForUser)({
            userId,
            adminId,
            title: title.trim(),
            message: message.trim(),
            imageUrl,
        });
        if (!notification) {
            return (0, http_response_1.errorResponse)(res, "User not found", 404);
        }
        return (0, http_response_1.successResponse)(res, { notification }, "Notification sent successfully", 201);
    }
    catch (error) {
        return (0, http_response_1.errorResponse)(res, "Failed to send notification", 500, error.message);
    }
});
exports.sendNotification = sendNotification;
