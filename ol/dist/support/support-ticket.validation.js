"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportTicketAttachmentParamsValidator = exports.supportTicketMarkReadValidator = exports.supportTicketMessageUpdateValidator = exports.supportTicketMessageCreateValidator = exports.supportTicketMessageIdParamValidator = exports.supportTicketTicketIdParamValidator = exports.supportTicketIdParamValidator = exports.supportTicketUpdateValidator = exports.supportTicketCreateValidator = exports.supportTicketListQueryValidator = void 0;
const express_validator_1 = require("express-validator");
const statusValues = [
    "open",
    "in_progress",
    "awaiting_user",
    "closed",
];
const priorityValues = ["low", "medium", "high", "urgent"];
exports.supportTicketListQueryValidator = [
    (0, express_validator_1.query)("status")
        .optional()
        .isIn(statusValues),
    (0, express_validator_1.query)("priority")
        .optional()
        .isIn(priorityValues),
    (0, express_validator_1.query)("category").optional().isString().trim().isLength({ min: 1, max: 100 }),
    (0, express_validator_1.query)("search").optional().isString().trim().isLength({ min: 1, max: 255 }),
    (0, express_validator_1.query)("fromDate").optional().isISO8601(),
    (0, express_validator_1.query)("toDate").optional().isISO8601(),
    (0, express_validator_1.query)("page").optional().isInt({ min: 1 }).toInt(),
    (0, express_validator_1.query)("perPage").optional().isInt({ min: 1, max: 100 }).toInt(),
];
exports.supportTicketCreateValidator = [
    (0, express_validator_1.body)("subject").isString().trim().isLength({ min: 1, max: 255 }),
    (0, express_validator_1.body)("message").isString().trim().isLength({ min: 1 }),
    (0, express_validator_1.body)("category").isString().trim().isLength({ min: 1, max: 100 }),
    (0, express_validator_1.body)("priority")
        .isString()
        .isIn(priorityValues),
];
exports.supportTicketUpdateValidator = [
    (0, express_validator_1.body)("status")
        .optional()
        .isString()
        .isIn(statusValues),
    (0, express_validator_1.body)("priority")
        .optional()
        .isString()
        .isIn(priorityValues),
    (0, express_validator_1.body)("category").optional().isString().trim().isLength({ min: 1, max: 100 }),
    (0, express_validator_1.body)().custom((value, { req }) => {
        if (!req.body.status && !req.body.priority && !req.body.category) {
            throw new Error("At least one field must be provided");
        }
        return true;
    }),
];
exports.supportTicketIdParamValidator = [
    (0, express_validator_1.param)("id").isInt({ min: 1 }).toInt(),
];
exports.supportTicketTicketIdParamValidator = [
    (0, express_validator_1.param)("ticketId").isInt({ min: 1 }).toInt(),
];
exports.supportTicketMessageIdParamValidator = [
    (0, express_validator_1.param)("messageId").isInt({ min: 1 }).toInt(),
];
exports.supportTicketMessageCreateValidator = [
    (0, express_validator_1.body)("message").isString().trim().isLength({ min: 1 }),
];
exports.supportTicketMessageUpdateValidator = [
    (0, express_validator_1.body)("message").isString().trim().isLength({ min: 1 }),
];
exports.supportTicketMarkReadValidator = [
    (0, express_validator_1.body)("messageIds")
        .isArray({ min: 1 })
        .withMessage("messageIds must be a non-empty array"),
    (0, express_validator_1.body)("messageIds.*").isInt({ min: 1 }).toInt(),
];
exports.supportTicketAttachmentParamsValidator = [
    (0, express_validator_1.param)("ticketId").isInt({ min: 1 }).toInt(),
    (0, express_validator_1.param)("messageId").isInt({ min: 1 }).toInt(),
    (0, express_validator_1.param)("index").isInt({ min: 0 }).toInt(),
];
