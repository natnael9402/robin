"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddressValidator = exports.updateDepositStatusValidator = exports.createDepositValidator = void 0;
const express_validator_1 = require("express-validator");
const pickLastValue = (value) => Array.isArray(value) && value.length > 0 ? value[value.length - 1] : value;
const coalesce = (value, fallback) => pickLastValue(value !== null && value !== void 0 ? value : fallback);
const trimIfString = (value) => typeof value === "string" ? value.trim() : value;
exports.createDepositValidator = [
    (0, express_validator_1.body)("currency")
        .customSanitizer((value) => trimIfString(value))
        .notEmpty()
        .withMessage("The currency field is required.")
        .bail()
        .isLength({ max: 10 })
        .withMessage("The currency field may not be greater than 10 characters."),
    (0, express_validator_1.body)("amount")
        .notEmpty()
        .withMessage("The amount field is required.")
        .bail()
        .isFloat({ min: 0 })
        .withMessage("The amount must be at least 0."),
    (0, express_validator_1.body)("paymentMethod")
        .optional({ checkFalsy: true })
        .customSanitizer((value, { req }) => coalesce(value, req.body.payment_method))
        .isString()
        .withMessage("The payment method must be a string."),
    (0, express_validator_1.body)("payment_method")
        .optional({ checkFalsy: true })
        .isString()
        .withMessage("The payment method must be a string."),
    (0, express_validator_1.body)("proof_image_url")
        .optional({ checkFalsy: true })
        .isURL()
        .withMessage("The proof image URL must be a valid URL."),
    (0, express_validator_1.body)().custom((_, { req }) => {
        if (!req.file && !req.body.proof_image_url) {
            throw new Error("A proof image or proof image URL is required for deposit verification.");
        }
        return true;
    }),
];
exports.updateDepositStatusValidator = [
    (0, express_validator_1.body)("status")
        .customSanitizer((value, { req }) => trimIfString(coalesce(value, req.body.status)))
        .notEmpty()
        .withMessage("The status field is required.")
        .bail()
        .isIn(["approved", "rejected"])
        .withMessage("The selected status is invalid."),
    (0, express_validator_1.body)("rejectionReason")
        .customSanitizer((value, { req }) => trimIfString(coalesce(value, req.body.rejection_reason)))
        .if((0, express_validator_1.body)("status").equals("rejected"))
        .notEmpty()
        .withMessage("The rejection reason field is required when status is rejected."),
    (0, express_validator_1.body)("rejection_reason")
        .optional({ checkFalsy: true })
        .isString()
        .withMessage("The rejection reason must be a string."),
];
exports.getAddressValidator = [
    (0, express_validator_1.body)("currency")
        .customSanitizer((value) => trimIfString(value))
        .notEmpty()
        .withMessage("The currency field is required."),
    (0, express_validator_1.body)("network")
        .customSanitizer((value) => trimIfString(value))
        .notEmpty()
        .withMessage("The network field is required."),
];
