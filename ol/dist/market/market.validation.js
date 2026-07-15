"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketHistoricalValidator = exports.marketSearchValidator = exports.marketPriceValidator = void 0;
const express_validator_1 = require("express-validator");
const MARKET_OPTIONS = ["crypto", "forex", "metals", "stocks", "indices"];
const INTERVAL_OPTIONS = [
    "1m",
    "5m",
    "15m",
    "30m",
    "1h",
    "2h",
    "4h",
    "1d",
    "1w",
    "1M",
];
exports.marketPriceValidator = [
    (0, express_validator_1.param)("symbol")
        .exists({ checkFalsy: true })
        .withMessage("symbol is required")
        .bail()
        .isString()
        .withMessage("symbol must be a string")
        .trim()
        .isLength({ max: 20 })
        .withMessage("symbol must not exceed 20 characters"),
    (0, express_validator_1.query)("market")
        .optional({ values: "falsy" })
        .isIn(MARKET_OPTIONS)
        .withMessage(`market must be one of: ${MARKET_OPTIONS.join(", ")}`),
];
exports.marketSearchValidator = [
    (0, express_validator_1.query)("query")
        .exists({ checkFalsy: true })
        .withMessage("query is required")
        .bail()
        .isString()
        .withMessage("query must be a string")
        .trim()
        .isLength({ max: 50 })
        .withMessage("query must not exceed 50 characters"),
    (0, express_validator_1.query)("market")
        .optional({ values: "falsy" })
        .isIn(MARKET_OPTIONS)
        .withMessage(`market must be one of: ${MARKET_OPTIONS.join(", ")}`),
    (0, express_validator_1.query)("limit")
        .optional({ values: "falsy" })
        .isInt({ min: 1, max: 50 })
        .withMessage("limit must be an integer between 1 and 50"),
];
exports.marketHistoricalValidator = [
    (0, express_validator_1.query)("symbol")
        .exists({ checkFalsy: true })
        .withMessage("symbol is required")
        .bail()
        .isString()
        .withMessage("symbol must be a string")
        .trim()
        .isLength({ max: 20 })
        .withMessage("symbol must not exceed 20 characters"),
    (0, express_validator_1.query)("market")
        .optional({ values: "falsy" })
        .isIn(MARKET_OPTIONS)
        .withMessage(`market must be one of: ${MARKET_OPTIONS.join(", ")}`),
    (0, express_validator_1.query)("interval")
        .optional({ values: "falsy" })
        .isIn(INTERVAL_OPTIONS)
        .withMessage(`interval must be one of: ${INTERVAL_OPTIONS.join(", ")}`),
    (0, express_validator_1.query)("limit")
        .optional({ values: "falsy" })
        .isInt({ min: 10, max: 500 })
        .withMessage("limit must be an integer between 10 and 500"),
];
