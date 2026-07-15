"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const controller = __importStar(require("./support-ticket.controller"));
const http_response_1 = require("../utils/http-response");
const support_ticket_validation_1 = require("./support-ticket.validation");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   - name: Support Tickets
 *     description: Submit and manage support tickets with optional file attachments
 */
const allowedMimes = new Set([
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const attachmentFieldPattern = /^attachments(?:\[\d*\])?$/;
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (!attachmentFieldPattern.test(file.fieldname)) {
            cb(new Error("Unsupported attachment field"));
            return;
        }
        if (allowedMimes.has(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("Unsupported file type"));
        }
    },
});
const MAX_ATTACHMENTS = 5;
const attachmentsUpload = upload.any();
const handleAttachmentsUpload = (req, res, next) => {
    attachmentsUpload(req, res, (err) => {
        var _a;
        if (err) {
            (0, http_response_1.errorResponse)(res, err.message || "File upload error", 400);
            return;
        }
        const uploaded = (_a = req.files) !== null && _a !== void 0 ? _a : [];
        const unexpectedField = uploaded.find((file) => !attachmentFieldPattern.test(file.fieldname));
        if (unexpectedField) {
            (0, http_response_1.errorResponse)(res, "Unexpected attachment field", 400, {
                field: unexpectedField.fieldname,
            });
            return;
        }
        if (uploaded.length > MAX_ATTACHMENTS) {
            (0, http_response_1.errorResponse)(res, `A maximum of ${MAX_ATTACHMENTS} attachments are allowed`, 400);
            return;
        }
        req.files =
            uploaded;
        next();
    });
};
router.use(auth_middleware_1.authenticateOptionalJWT);
/**
 * @swagger
 * /api/support-tickets:
 *   get:
 *     summary: List support tickets for the authenticated user
 *     tags: [Support Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Optional ticket status filter
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Optional category filter
 *     responses:
 *       200:
 *         description: List of tickets
 *       401:
 *         description: Unauthorized – missing or invalid token
 */
router.get("/", support_ticket_validation_1.supportTicketListQueryValidator, validation_middleware_1.validationMiddleware, controller.listTickets);
/**
 * @swagger
 * /api/support-tickets:
 *   post:
 *     summary: Create a new support ticket
 *     tags: [Support Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *               category:
 *                 type: string
 *               message:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Up to 5 files (2MB each)
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *       400:
 *         description: Validation or upload error
 *       401:
 *         description: Unauthorized – missing or invalid token
 */
router.post("/", handleAttachmentsUpload, support_ticket_validation_1.supportTicketCreateValidator, validation_middleware_1.validationMiddleware, controller.createTicket);
/**
 * @swagger
 * /api/support-tickets/categories:
 *   get:
 *     summary: Retrieve available support ticket categories
 *     tags: [Support Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get("/categories", controller.getCategories);
/**
 * @swagger
 * /api/support-tickets/messages/unread-count:
 *   get:
 *     summary: Get number of unread support messages
 *     tags: [Support Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count returned successfully
 */
router.get("/messages/unread-count", controller.getUnreadCount);
/**
 * @swagger
 * /api/support-tickets/messages/mark-as-read:
 *   post:
 *     summary: Mark support ticket messages as read
 *     tags: [Support Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ticketIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Tickets marked as read
 *       400:
 *         description: Validation error
 */
router.post("/messages/mark-as-read", support_ticket_validation_1.supportTicketMarkReadValidator, validation_middleware_1.validationMiddleware, controller.markMessagesRead);
router.get("/:ticketId/messages/:messageId/attachments/:index", support_ticket_validation_1.supportTicketAttachmentParamsValidator, validation_middleware_1.validationMiddleware, controller.downloadAttachment);
/**
 * @swagger
 * /api/support-tickets/{ticketId}/messages/{messageId}:
 *   patch:
 *     summary: Update a support ticket message
 *     tags: [Support Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Unauthorized action
 *       404:
 *         description: Message or ticket not found
 *   delete:
 *     summary: Delete a support ticket message
 *     tags: [Support Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       403:
 *         description: Unauthorized action
 *       404:
 *         description: Message or ticket not found
 */
router.patch("/:ticketId/messages/:messageId", [
    ...support_ticket_validation_1.supportTicketTicketIdParamValidator,
    ...support_ticket_validation_1.supportTicketMessageIdParamValidator,
    ...support_ticket_validation_1.supportTicketMessageUpdateValidator,
], validation_middleware_1.validationMiddleware, controller.updateMessage);
router.delete("/:ticketId/messages/:messageId", [
    ...support_ticket_validation_1.supportTicketTicketIdParamValidator,
    ...support_ticket_validation_1.supportTicketMessageIdParamValidator,
], validation_middleware_1.validationMiddleware, controller.deleteMessage);
/**
 * @swagger
 * /api/support-tickets/{ticketId}/messages:
 *   post:
 *     summary: Reply to a support ticket
 *     tags: [Support Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Optional attachments
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Validation or upload error
 */
router.post("/:ticketId/messages", handleAttachmentsUpload, [
    ...support_ticket_validation_1.supportTicketTicketIdParamValidator,
    ...support_ticket_validation_1.supportTicketMessageCreateValidator,
], validation_middleware_1.validationMiddleware, controller.sendMessage);
/**
 * @swagger
 * /api/support-tickets/{id}:
 *   get:
 *     summary: Retrieve a single support ticket
 *     tags: [Support Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket retrieved successfully
 *       404:
 *         description: Ticket not found
 */
router.get("/:id", support_ticket_validation_1.supportTicketIdParamValidator, validation_middleware_1.validationMiddleware, controller.getTicket);
/**
 * @swagger
 * /api/support-tickets/{id}:
 *   put:
 *     summary: Update a support ticket
 *     tags: [Support Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               priority:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *       400:
 *         description: Validation error
 */
router.put("/:id", support_ticket_validation_1.supportTicketIdParamValidator, support_ticket_validation_1.supportTicketUpdateValidator, validation_middleware_1.validationMiddleware, controller.updateTicket);
/**
 * @swagger
 * /api/support-tickets/{id}:
 *   delete:
 *     summary: Delete a support ticket
 *     tags: [Support Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket deleted successfully
 *       404:
 *         description: Ticket not found
 */
router.delete("/:id", support_ticket_validation_1.supportTicketIdParamValidator, validation_middleware_1.validationMiddleware, controller.removeTicket);
exports.default = router;
