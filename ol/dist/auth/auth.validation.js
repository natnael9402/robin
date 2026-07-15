"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordValidator = exports.forgotPasswordValidator = exports.withdrawalPasswordValidator = exports.changePasswordValidator = exports.loginValidator = exports.registerValidator = void 0;
const express_validator_1 = require("express-validator");
exports.registerValidator = [
    (0, express_validator_1.body)("name").notEmpty().withMessage("Name is required"),
    (0, express_validator_1.body)("email").optional({ checkFalsy: true }).isEmail().withMessage("Email is invalid"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
    (0, express_validator_1.body)("phone").optional({ checkFalsy: true }).isString().trim(),
];
exports.loginValidator = [
    (0, express_validator_1.body)("email").optional({ checkFalsy: true }).isEmail().withMessage("Email is invalid"),
    (0, express_validator_1.body)("phone").optional({ checkFalsy: true }).isString().trim(),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password is required"),
];
exports.changePasswordValidator = [
    (0, express_validator_1.body)("current_password")
        .notEmpty()
        .withMessage("Current password is required"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
    (0, express_validator_1.body)("password_confirmation")
        .notEmpty()
        .withMessage("Password confirmation is required")
        .custom((value, { req }) => value === req.body.password)
        .withMessage("Password confirmation does not match password"),
];
exports.withdrawalPasswordValidator = [
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
    (0, express_validator_1.body)("password_confirmation")
        .notEmpty()
        .withMessage("Password confirmation is required")
        .custom((value, { req }) => value === req.body.password)
        .withMessage("Password confirmation does not match password"),
    (0, express_validator_1.body)("current_password")
        .optional()
        .isString()
        .withMessage("Current password must be a string"),
];
exports.forgotPasswordValidator = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Email is invalid"),
];
exports.resetPasswordValidator = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Email is invalid"),
    (0, express_validator_1.body)("token").notEmpty().withMessage("Token is required"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
    (0, express_validator_1.body)("password_confirmation")
        .notEmpty()
        .withMessage("Password confirmation is required")
        .custom((value, { req }) => value === req.body.password)
        .withMessage("Password confirmation does not match password"),
];
