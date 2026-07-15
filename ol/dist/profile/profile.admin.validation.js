"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUpdateUserValidator = exports.adminProfileTradeStatusValidator = exports.adminProfileKycStatusValidator = exports.adminProfileIdParamValidator = exports.adminProfileListQueryValidator = void 0;
const express_validator_1 = require("express-validator");
const pickLastValue = (value) => Array.isArray(value) && value.length > 0 ? value[value.length - 1] : value;
const coalesceRequestValue = (primary, fallback) => pickLastValue(primary !== null && primary !== void 0 ? primary : fallback);
const trimIfString = (value) => typeof value === "string" ? value.trim() : value;
exports.adminProfileListQueryValidator = [
    (0, express_validator_1.query)("page").optional().isInt({ min: 1 }).toInt(),
    (0, express_validator_1.query)("perPage")
        .customSanitizer((value, { req }) => coalesceRequestValue(value, req.query["per_page"]))
        .optional()
        .isInt({ min: 1, max: 100 })
        .toInt(),
    (0, express_validator_1.query)("kycStatus")
        .optional()
        .customSanitizer((value, { req }) => trimIfString(coalesceRequestValue(value, req.query["kyc_status"])))
        .isIn(["unverified", "pending", "verified", "rejected"]),
    (0, express_validator_1.query)("tradeStatus")
        .optional()
        .customSanitizer((value, { req }) => trimIfString(coalesceRequestValue(value, req.query["trade_status"])))
        .isIn(["win", "loss", "normal"]),
    (0, express_validator_1.query)("search").optional().isString().trim(),
];
exports.adminProfileIdParamValidator = [
    (0, express_validator_1.param)("id").isInt({ min: 1 }).toInt(),
];
exports.adminProfileKycStatusValidator = [
    (0, express_validator_1.body)("status")
        .customSanitizer((value, { req }) => trimIfString(coalesceRequestValue(value, req.body["kyc_status"])))
        .notEmpty()
        .withMessage("The status field is required.")
        .bail()
        .isIn(["verified", "rejected"])
        .withMessage("The selected status is invalid."),
    (0, express_validator_1.body)("reason")
        .customSanitizer((value) => trimIfString(value))
        .if((0, express_validator_1.body)("status").equals("rejected"))
        .notEmpty()
        .withMessage("The reason field is required when status is rejected."),
];
exports.adminProfileTradeStatusValidator = [
    (0, express_validator_1.body)("tradeStatus")
        .customSanitizer((value, { req }) => trimIfString(coalesceRequestValue(value, req.body["trade_status"])))
        .notEmpty()
        .withMessage("The trade status field is required.")
        .bail()
        .isIn(["win", "loss", "normal"])
        .withMessage("The selected trade status is invalid."),
];
const confirmPasswordMatches = (value, { req }) => {
    if (req.body.password && value !== req.body.password) {
        throw new Error("Password confirmation does not match password");
    }
    return true;
};
exports.adminUpdateUserValidator = [
    (0, express_validator_1.body)("name").optional().isString().trim().isLength({ min: 1 }),
    (0, express_validator_1.body)("email")
        .optional({ nullable: true })
        .isEmail()
        .withMessage("Invalid email address"),
    (0, express_validator_1.body)("phone")
        .optional({ nullable: true })
        .isString()
        .isLength({ min: 0, max: 20 })
        .withMessage("Phone must be between 0 and 20 characters"),
    (0, express_validator_1.body)("balance")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Balance must be a positive number"),
    (0, express_validator_1.body)("status").optional().isIn(["active", "inactive", "suspended", "banned"]),
    (0, express_validator_1.body)("password")
        .optional()
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters"),
    (0, express_validator_1.body)("passwordConfirmation").optional().custom(confirmPasswordMatches),
    (0, express_validator_1.body)("password_confirmation").optional().custom(confirmPasswordMatches),
];
