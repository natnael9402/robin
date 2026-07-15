"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUpdateArbitrageHostingStatusValidator = exports.adminArbitrageHostingsQueryValidator = exports.adminArbitrageIdParamValidator = exports.adminUpdateArbitrageProductValidator = exports.adminCreateArbitrageProductValidator = void 0;
const express_validator_1 = require("express-validator");
exports.adminCreateArbitrageProductValidator = [
    (0, express_validator_1.body)("name").isString().notEmpty(),
    (0, express_validator_1.body)("days").isInt({ min: 1 }),
    (0, express_validator_1.body)("dailyRate").isFloat({ min: 0 }),
    (0, express_validator_1.body)("minAmount").isFloat({ min: 0 }),
    (0, express_validator_1.body)("maxAmount").isFloat({ min: 0 }),
    (0, express_validator_1.body)("image").optional().isString(),
    (0, express_validator_1.body)("isActive").optional().isBoolean(),
    (0, express_validator_1.body)("supportedCurrencies")
        .optional()
        .isArray({ min: 1 })
        .withMessage("supportedCurrencies must be an array of currency codes"),
];
exports.adminUpdateArbitrageProductValidator = [
    (0, express_validator_1.body)("name").optional().isString().notEmpty(),
    (0, express_validator_1.body)("days").optional().isInt({ min: 1 }),
    (0, express_validator_1.body)("dailyRate").optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)("minAmount").optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)("maxAmount").optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)("image").optional().isString(),
    (0, express_validator_1.body)("isActive").optional().isBoolean(),
    (0, express_validator_1.body)("supportedCurrencies").optional().isArray({ min: 1 }),
];
exports.adminArbitrageIdParamValidator = [
    (0, express_validator_1.param)("id").isInt({ min: 1 }).toInt(),
];
exports.adminArbitrageHostingsQueryValidator = [
    (0, express_validator_1.query)("status").optional().isIn(["running", "ended", "cancelled"]),
    (0, express_validator_1.query)("user_id").optional().isInt({ min: 1 }),
];
exports.adminUpdateArbitrageHostingStatusValidator = [
    (0, express_validator_1.body)("status")
        .isString()
        .isIn(["running", "ended", "cancelled"])
        .withMessage("Status must be running, ended, or cancelled"),
];
