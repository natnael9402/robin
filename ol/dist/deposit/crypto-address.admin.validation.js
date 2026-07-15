"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUpdateCryptoAddressValidator = exports.adminCreateCryptoAddressValidator = exports.adminCryptoAddressIdParamValidator = exports.adminCryptoAddressQueryValidator = void 0;
const express_validator_1 = require("express-validator");
const pickLastValue = (value) => Array.isArray(value) && value.length > 0 ? value[value.length - 1] : value;
const coalesce = (value, ...fallbacks) => {
    const sources = [value, ...fallbacks];
    for (const source of sources) {
        const candidate = pickLastValue(source);
        if (candidate !== undefined &&
            candidate !== null &&
            String(candidate).trim().length > 0) {
            return candidate;
        }
    }
    return value;
};
const trimIfString = (value) => typeof value === "string" ? value.trim() : value;
exports.adminCryptoAddressQueryValidator = [
    (0, express_validator_1.query)("page").optional().isInt({ min: 1 }).toInt(),
    (0, express_validator_1.query)("perPage")
        .customSanitizer((value, { req }) => coalesce(value, req.query.per_page))
        .optional()
        .isInt({ min: 1, max: 100 })
        .toInt(),
    (0, express_validator_1.query)("currency")
        .optional()
        .customSanitizer((value) => trimIfString(value))
        .isLength({ max: 10 })
        .withMessage("The currency may not be greater than 10 characters."),
    (0, express_validator_1.query)("network")
        .optional()
        .customSanitizer((value) => trimIfString(value))
        .isLength({ max: 20 })
        .withMessage("The network may not be greater than 20 characters."),
];
exports.adminCryptoAddressIdParamValidator = [
    (0, express_validator_1.param)("id").isInt({ min: 1 }).toInt(),
];
exports.adminCreateCryptoAddressValidator = [
    (0, express_validator_1.body)("currency")
        .customSanitizer((value, { req }) => trimIfString(coalesce(value, req.body.currency, req.body.Currency)))
        .notEmpty()
        .withMessage("The currency field is required.")
        .bail()
        .isLength({ max: 10 })
        .withMessage("The currency may not be greater than 10 characters."),
    (0, express_validator_1.body)("network")
        .customSanitizer((value, { req }) => trimIfString(coalesce(value, req.body.network, req.body.Network)))
        .notEmpty()
        .withMessage("The network field is required.")
        .bail()
        .isLength({ max: 20 })
        .withMessage("The network may not be greater than 20 characters."),
    (0, express_validator_1.body)("address")
        .customSanitizer((value, { req }) => trimIfString(coalesce(value, req.body.address, req.body.Address)))
        .notEmpty()
        .withMessage("The address field is required."),
    (0, express_validator_1.body)("qrCode")
        .customSanitizer((value, { req }) => trimIfString(coalesce(value, req.body.qr_code)))
        .optional({ nullable: true })
        .isLength({ max: 255 })
        .withMessage("The qr code may not be greater than 255 characters."),
    (0, express_validator_1.body)("notes")
        .customSanitizer((value) => trimIfString(value))
        .optional({ nullable: true })
        .isLength({ max: 1000 })
        .withMessage("The notes may not be greater than 1000 characters."),
];
exports.adminUpdateCryptoAddressValidator = [
    (0, express_validator_1.body)("address")
        .trim()
        .notEmpty()
        .withMessage("The address field is required."),
    (0, express_validator_1.body)("qr_code")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 255 })
        .withMessage("The qr code may not be greater than 255 characters."),
    (0, express_validator_1.body)("notes")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 1000 })
        .withMessage("The notes may not be greater than 1000 characters."),
    (0, express_validator_1.body)("is_active")
        .optional()
        .isBoolean()
        .withMessage("The is_active field must be a boolean.")
        .toBoolean(),
];
