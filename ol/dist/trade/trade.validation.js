"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockExchangeValidator = exports.stockSearchValidator = exports.marketPriceParamValidator = exports.tradeIdParamValidator = exports.tradeFiltersValidator = exports.stockTradeValidator = exports.spotTradeValidator = exports.contractTradeValidator = exports.optionTradeValidator = void 0;
const express_validator_1 = require("express-validator");
const trade_rules_1 = require("../utils/trade-rules");
const OPTION_DURATIONS = Object.keys(trade_rules_1.OPTION_TRADE_RULES).map(Number);
const MARKET_TYPES = ["crypto", "metals", "metal", "stocks", "stock"];
exports.optionTradeValidator = [
    (0, express_validator_1.body)("symbol").isString().trim().notEmpty(),
    (0, express_validator_1.body)("direction").isIn(["buy", "sell"]),
    (0, express_validator_1.body)("amount").isFloat({ min: 100 }),
    (0, express_validator_1.body)("duration")
        .isInt()
        .custom((value) => OPTION_DURATIONS.includes(Number(value)))
        .withMessage(`Duration must be one of: ${OPTION_DURATIONS.join(", ")}`),
    (0, express_validator_1.body)("market_type").optional().isIn(MARKET_TYPES),
    (0, express_validator_1.body)("price").optional().isFloat({ min: 0.0001 }),
];
exports.contractTradeValidator = [
    (0, express_validator_1.body)("symbol").isString().trim().notEmpty(),
    (0, express_validator_1.body)("direction").isIn(["buy", "sell"]),
    (0, express_validator_1.body)("amount").isFloat({ min: 10 }),
    (0, express_validator_1.body)("leverage")
        .isInt()
        .custom((value) => [2, 5, 10, 20, 50, 100, 125].includes(Number(value)))
        .withMessage("Invalid leverage option"),
    (0, express_validator_1.body)("take_profit").optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)("stop_loss").optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)("market_type").optional().isIn(MARKET_TYPES),
];
exports.spotTradeValidator = [
    (0, express_validator_1.body)("symbol").isString().trim().notEmpty(),
    (0, express_validator_1.body)("direction").isIn(["buy", "sell"]),
    (0, express_validator_1.body)("amount").isFloat({ min: 1 }),
    (0, express_validator_1.body)("from_coin").optional().isString(),
    (0, express_validator_1.body)("to_coin").optional().isString(),
    (0, express_validator_1.body)("exchange_rate").optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)("market_type").optional().isIn(MARKET_TYPES),
];
exports.stockTradeValidator = [
    (0, express_validator_1.body)("symbol").isString().trim().notEmpty(),
    (0, express_validator_1.body)("direction").isIn(["buy", "sell"]),
    (0, express_validator_1.body)("shares")
        .isFloat({ min: 0.0001 })
        .withMessage("Shares must be positive"),
];
exports.tradeFiltersValidator = [
    (0, express_validator_1.query)("type").optional().isString(),
    (0, express_validator_1.query)("status").optional().isString(),
    (0, express_validator_1.query)("result").optional().isString(),
    (0, express_validator_1.query)("symbol").optional().isString(),
    (0, express_validator_1.query)("direction").optional().isString(),
    (0, express_validator_1.query)("date_from").optional().isISO8601(),
    (0, express_validator_1.query)("date_to").optional().isISO8601(),
    (0, express_validator_1.query)("sort_by").optional().isString(),
    (0, express_validator_1.query)("sort_dir").optional().isIn(["asc", "desc"]),
    (0, express_validator_1.query)("page").optional().isInt({ min: 1 }),
    (0, express_validator_1.query)("per_page").optional().isInt({ min: 1, max: 100 }),
];
exports.tradeIdParamValidator = [
    (0, express_validator_1.param)("id").isNumeric().withMessage("Trade ID must be numeric"),
];
exports.marketPriceParamValidator = [
    (0, express_validator_1.param)("symbol").isString().trim().notEmpty(),
    (0, express_validator_1.query)("market_type").optional().isIn(["crypto", "metals", "stocks"]),
];
exports.stockSearchValidator = [
    (0, express_validator_1.query)("query").isString().trim().notEmpty(),
    (0, express_validator_1.query)("exchange").optional().isString().trim(),
];
exports.stockExchangeValidator = [
    (0, express_validator_1.query)("exchange").optional().isString().trim(),
];
