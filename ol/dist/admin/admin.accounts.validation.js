"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUpdateValidator = exports.adminCreateValidator = exports.adminIdParamValidator = exports.adminListQueryValidator = void 0;
const express_validator_1 = require("express-validator");
const pickLastValue = (value) => Array.isArray(value) && value.length > 0
    ? value[value.length - 1]
    : value;
const coalesceRequestValue = (primary, fallback) => pickLastValue(primary !== null && primary !== void 0 ? primary : fallback);
const trimIfString = (value) => typeof value === "string" ? value.trim() : value;
const confirmPasswordMatches = (value, { req }) => {
    const password = req.body.password;
    if (typeof value === "undefined" ||
        value === null ||
        String(value).length === 0) {
        return true;
    }
    if (typeof password === "string" && value !== password) {
        throw new Error("Password confirmation does not match password");
    }
    return true;
};
exports.adminListQueryValidator = [
    (0, express_validator_1.query)("page").optional().isInt({ min: 1 }).toInt(),
    (0, express_validator_1.query)("perPage")
        .customSanitizer((value, { req }) => coalesceRequestValue(value, req.query["per_page"]))
        .optional()
        .isInt({ min: 1, max: 100 })
        .toInt(),
    (0, express_validator_1.query)("search")
        .optional()
        .isString()
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage("Search term must be between 1 and 255 characters"),
];
exports.adminIdParamValidator = [
    (0, express_validator_1.param)("id").isInt({ min: 1 }).toInt(),
];
exports.adminCreateValidator = [
    (0, express_validator_1.body)("name").isString().trim().isLength({ min: 3, max: 255 }),
    (0, express_validator_1.body)("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
    (0, express_validator_1.body)("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters"),
    (0, express_validator_1.body)("password_confirmation")
        .optional({ nullable: true })
        .custom(confirmPasswordMatches),
    (0, express_validator_1.body)("passwordConfirmation")
        .optional({ nullable: true })
        .custom(confirmPasswordMatches),
    (0, express_validator_1.body)("status")
        .optional()
        .customSanitizer((value) => trimIfString(value))
        .isIn(["active", "inactive", "suspended"])
        .withMessage("The selected status is invalid"),
];
exports.adminUpdateValidator = [
    (0, express_validator_1.body)("name").optional().isString().trim().isLength({ min: 3, max: 255 }),
    (0, express_validator_1.body)("email")
        .optional({ nullable: true })
        .isEmail()
        .withMessage("A valid email is required")
        .normalizeEmail(),
    (0, express_validator_1.body)("status")
        .optional()
        .customSanitizer((value) => trimIfString(value))
        .isIn(["active", "inactive", "suspended"])
        .withMessage("The selected status is invalid"),
    (0, express_validator_1.body)("password")
        .optional()
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters"),
    (0, express_validator_1.body)("password_confirmation")
        .optional({ nullable: true })
        .custom(confirmPasswordMatches),
    (0, express_validator_1.body)("passwordConfirmation")
        .optional({ nullable: true })
        .custom(confirmPasswordMatches),
];
