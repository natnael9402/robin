"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileValidator = void 0;
const express_validator_1 = require("express-validator");
exports.updateProfileValidator = [
    (0, express_validator_1.body)("preferredLanguage")
        .optional({ values: "falsy" })
        .isString()
        .withMessage("preferredLanguage must be a string")
        .trim()
        .isLength({ max: 10 })
        .withMessage("preferredLanguage must not exceed 10 characters"),
    (0, express_validator_1.body)("bankAccount")
        .optional({ values: "falsy" })
        .isString()
        .withMessage("bankAccount must be a string")
        .trim()
        .isLength({ max: 255 })
        .withMessage("bankAccount must not exceed 255 characters"),
    (0, express_validator_1.body)("blockchainAddresses")
        .optional({ values: "falsy" })
        .custom((value) => {
        if (typeof value !== "object" || value === null) {
            throw new Error("blockchainAddresses must be an object or array");
        }
        return true;
    }),
    (0, express_validator_1.body)("notificationSettings")
        .optional({ values: "falsy" })
        .custom((value) => {
        if (typeof value !== "object" || value === null) {
            throw new Error("notificationSettings must be an object or array");
        }
        return true;
    }),
    (0, express_validator_1.body)("simTradeEnabled")
        .optional()
        .isBoolean()
        .withMessage("simTradeEnabled must be a boolean"),
];
