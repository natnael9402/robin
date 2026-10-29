"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPTION_TRADE_RULES = void 0;
const logger_1 = require("./logger");
const DEFAULT_OPTION_TRADE_RULES = {
    30: { returnRate: 15, minAmount: 100, maxAmount: 5000 },
    60: { returnRate: 20, minAmount: 5001, maxAmount: 20000 },
    90: { returnRate: 25, minAmount: 20001, maxAmount: 80000 },
    120: { returnRate: 30, minAmount: 80001, maxAmount: 120000 },
    180: { returnRate: 30, minAmount: 120000, maxAmount: 200000 },
    300: { returnRate: 35, minAmount: 200001, maxAmount: 300000 },
    700: { returnRate: 40, minAmount: 300001, maxAmount: 500000 },
};
function parseOptionTradeRules(rawRules, fallback) {
    if (!rawRules) {
        return fallback;
    }
    try {
        const parsed = JSON.parse(rawRules);
        if (typeof parsed !== "object" ||
            parsed === null ||
            Array.isArray(parsed)) {
            throw new Error("OPTION_TRADE_RULES must be a JSON object");
        }
        const normalized = Object.entries(parsed).reduce((acc, [durationKey, ruleValue]) => {
            const duration = Number(durationKey);
            if (!Number.isInteger(duration) || duration <= 0) {
                return acc;
            }
            if (!ruleValue ||
                typeof ruleValue !== "object" ||
                Array.isArray(ruleValue)) {
                return acc;
            }
            const { returnRate, minAmount, maxAmount, minCapital, maxCapital } = ruleValue;
            if (typeof returnRate !== "number") {
                return acc;
            }
            // Env uses "minCapital"/"maxCapital"; "minAmount"/"maxAmount" kept for backward compat.
            const min = typeof minCapital === "number" ? minCapital : minAmount;
            const max = typeof maxCapital === "number" ? maxCapital : maxAmount;
            acc[duration] = Object.assign(Object.assign({ returnRate }, (typeof min === "number" ? { minAmount: min } : {})), (typeof max === "number" ? { maxAmount: max } : {}));
            return acc;
        }, {});
        if (Object.keys(normalized).length === 0) {
            throw new Error("No valid option trade rules found");
        }
        return normalized;
    }
    catch (error) {
        logger_1.logger.warn("Invalid OPTION_TRADE_RULES value. Using default rules.", {
            error: error instanceof Error ? error.message : error,
        });
        return fallback;
    }
}
exports.OPTION_TRADE_RULES = parseOptionTradeRules(process.env.OPTION_TRADE_RULES, DEFAULT_OPTION_TRADE_RULES);
