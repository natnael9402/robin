"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotificationValidator = exports.notificationIdParamValidator = void 0;
const express_validator_1 = require("express-validator");
exports.notificationIdParamValidator = [
    (0, express_validator_1.param)("id").isInt({ min: 1 }).toInt(),
];
exports.sendNotificationValidator = [
    (0, express_validator_1.param)("id").isInt({ min: 1 }).toInt(),
    (0, express_validator_1.body)("title")
        .isString()
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage("Title is required and must be under 255 characters"),
    (0, express_validator_1.body)("message")
        .isString()
        .trim()
        .isLength({ min: 1, max: 5000 })
        .withMessage("Message is required"),
    (0, express_validator_1.body)("image_url")
        .optional({ nullable: true, checkFalsy: true })
        .isURL({ protocols: ["http", "https"], require_protocol: true })
        .withMessage("Image URL must be a valid http or https URL"),
];
