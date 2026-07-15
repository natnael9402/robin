"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPTION_TRADE_RULES = void 0;
const logger_1 = require("./logger");
const DEFAULT_OPTION_TRADE_RULES = {
    60: { returnRate: 14 },
    90: { returnRate: 21 },
    120: { returnRate: 30 },
    180: { returnRate: 47 },
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
            const { returnRate, minAmount, maxAmount } = ruleValue;
            if (typeof returnRate !== "number") {
                return acc;
            }
            acc[duration] = Object.assign(Object.assign({ returnRate }, (typeof minAmount === "number" ? { minAmount } : {})), (typeof maxAmount === "number" ? { maxAmount } : {}));
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
