"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMiningHostingValidator = exports.updateMiningProductValidator = exports.createMiningProductValidator = void 0;
const express_validator_1 = require("express-validator");
exports.createMiningProductValidator = [
    (0, express_validator_1.body)("name").isString().notEmpty(),
    (0, express_validator_1.body)("days").isInt({ min: 1 }),
    (0, express_validator_1.body)("dailyRate").isFloat({ min: 0.01 }),
    (0, express_validator_1.body)("minAmount").isFloat({ min: 0 }),
    (0, express_validator_1.body)("maxAmount").isFloat(),
    (0, express_validator_1.body)("limitTimes").isInt({ min: 1 }),
    (0, express_validator_1.body)("hashrate").isString().notEmpty(),
    (0, express_validator_1.body)("power").isString().notEmpty(),
    (0, express_validator_1.body)("networkType").isString().notEmpty(),
    (0, express_validator_1.body)("isActive").isBoolean().optional(),
];
exports.updateMiningProductValidator = [
    (0, express_validator_1.body)("name").isString().notEmpty().optional(),
    (0, express_validator_1.body)("days").isInt({ min: 1 }).optional(),
    (0, express_validator_1.body)("dailyRate").isFloat({ min: 0.01 }).optional(),
    (0, express_validator_1.body)("minAmount").isFloat({ min: 0 }).optional(),
    (0, express_validator_1.body)("maxAmount").isFloat().optional(),
    (0, express_validator_1.body)("limitTimes").isInt({ min: 1 }).optional(),
    (0, express_validator_1.body)("hashrate").isString().notEmpty().optional(),
    (0, express_validator_1.body)("power").isString().notEmpty().optional(),
    (0, express_validator_1.body)("networkType").isString().notEmpty().optional(),
    (0, express_validator_1.body)("isActive").isBoolean().optional(),
];
exports.createMiningHostingValidator = [
    (0, express_validator_1.body)("product_id").isInt(),
    (0, express_validator_1.body)("amount").isFloat({ min: 0 }),
    (0, express_validator_1.body)("currency").isString().isIn(["USDT", "BTC", "ETH"]),
];
