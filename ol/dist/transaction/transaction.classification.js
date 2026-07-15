"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTransactionCategory = exports.getTypesForCategory = exports.getTransactionCategory = exports.TRANSACTION_CATEGORIES = void 0;
const CATEGORY_TYPE_MAP = {
    DEPOSIT: ["deposit"],
    WITHDRAWAL: ["withdrawal"],
    TRADE: ["trade_amount", "trade_win", "trade_loss", "trade_cancel"],
    FEE: ["fee"],
    ARBITRAGE: [
        "arbitrage_purchase",
        "arbitrage_refund",
        "arbitrage_profit",
    ],
    MINING: ["mining_purchase", "mining_refund", "mining_profit"],
};
exports.TRANSACTION_CATEGORIES = Object.keys(CATEGORY_TYPE_MAP);
const TYPE_CATEGORY_MAP = Object.entries(CATEGORY_TYPE_MAP).reduce((acc, [category, types]) => {
    for (const type of types) {
        acc[type] = category;
    }
    return acc;
}, {});
const getTransactionCategory = (type) => {
    var _a;
    return (_a = TYPE_CATEGORY_MAP[type]) !== null && _a !== void 0 ? _a : "OTHER";
};
exports.getTransactionCategory = getTransactionCategory;
const getTypesForCategory = (category) => CATEGORY_TYPE_MAP[category];
exports.getTypesForCategory = getTypesForCategory;
const parseTransactionCategory = (value) => {
    if (!value) {
        return undefined;
    }
    const normalized = value.trim().toUpperCase();
    return exports.TRANSACTION_CATEGORIES.find((category) => category === normalized);
};
exports.parseTransactionCategory = parseTransactionCategory;
