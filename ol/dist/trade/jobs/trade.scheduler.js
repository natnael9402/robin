"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const trade_service_1 = __importDefault(require("../trade.service"));
const logger_1 = require("../../utils/logger");
const MILLISECONDS_IN_SECOND = 1000;
class TradeJobScheduler {
    constructor() {
        this.optionTimers = new Map();
        this.contractTimers = new Map();
        this.DEFAULT_CONTRACT_INTERVAL_SECONDS = 15;
        this.MIN_CONTRACT_INTERVAL_SECONDS = 5;
        this.OPTION_RETRY_DELAY_SECONDS = 2;
        this.OPTION_MAX_RETRIES = 2;
    }
    scheduleOptionResolution(tradeId, durationSeconds) {
        const key = tradeId.toString();
        const delay = Math.max(durationSeconds, 0) * MILLISECONDS_IN_SECOND;
        logger_1.logger.info("Scheduling option resolution", {
            tradeId: key,
            requestedDurationSeconds: durationSeconds,
            delayMs: delay,
        });
        this.scheduleOptionTimer(tradeId, delay, this.OPTION_MAX_RETRIES);
    }
    scheduleOptionTimer(tradeId, delayMs, retriesLeft) {
        const key = tradeId.toString();
        const existingTimer = this.optionTimers.get(key);
        if (existingTimer) {
            logger_1.logger.debug("Clearing existing option timer", { tradeId: key });
            clearTimeout(existingTimer);
        }
        const timer = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.debug("Option timer fired", { tradeId: key });
            this.optionTimers.delete(key);
            yield this.executeOptionResolution(tradeId, retriesLeft);
        }), delayMs);
        this.optionTimers.set(key, timer);
        logger_1.logger.debug("Option timer registered", {
            tradeId: key,
            delayMs,
            retriesLeft,
            timersTracked: this.optionTimers.size,
        });
    }
    executeOptionResolution(tradeId, retriesLeft) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = tradeId.toString();
            try {
                const result = yield trade_service_1.default.autoResolveTrade(tradeId);
                if (result) {
                    logger_1.logger.info("Option trade auto-resolve completed", { tradeId: key });
                    return;
                }
                logger_1.logger.warn("Option trade still open after scheduled resolution", {
                    tradeId: key,
                    retriesLeft,
                });
            }
            catch (error) {
                logger_1.logger.error("Failed to auto resolve option trade", {
                    tradeId: key,
                    retriesLeft,
                    error: error instanceof Error ? error.message : error,
                });
            }
            if (retriesLeft > 0) {
                this.scheduleOptionRetry(tradeId, retriesLeft - 1);
            }
            else {
                logger_1.logger.warn("Maximum option resolution retries exhausted", {
                    tradeId: key,
                });
            }
        });
    }
    scheduleOptionRetry(tradeId, retriesLeft) {
        const key = tradeId.toString();
        logger_1.logger.info("Scheduling option resolution retry", {
            tradeId: key,
            retriesLeft,
            retryDelaySeconds: this.OPTION_RETRY_DELAY_SECONDS,
        });
        const retryDelayMs = this.OPTION_RETRY_DELAY_SECONDS * MILLISECONDS_IN_SECOND;
        this.scheduleOptionTimer(tradeId, retryDelayMs, retriesLeft);
    }
    scheduleContractCheck(tradeId, delaySeconds) {
        const key = tradeId.toString();
        const normalizedDelaySeconds = delaySeconds !== undefined
            ? Math.max(delaySeconds, 0)
            : this.DEFAULT_CONTRACT_INTERVAL_SECONDS;
        const existingTimer = this.contractTimers.get(key);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }
        const timer = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            this.contractTimers.delete(key);
            try {
                const result = yield trade_service_1.default.evaluateContractTrade(tradeId);
                if (result.shouldContinue && result.interval) {
                    const nextDelay = Math.max(result.interval, this.MIN_CONTRACT_INTERVAL_SECONDS);
                    this.scheduleContractCheck(tradeId, nextDelay);
                }
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                logger_1.logger.error("Failed to evaluate contract trade", {
                    tradeId: key,
                    error: message,
                });
                if (message === "Trade not found") {
                    return;
                }
                this.scheduleContractCheck(tradeId, this.DEFAULT_CONTRACT_INTERVAL_SECONDS);
            }
        }), normalizedDelaySeconds * MILLISECONDS_IN_SECOND);
        this.contractTimers.set(key, timer);
    }
    clearContractCheck(tradeId) {
        const key = tradeId.toString();
        const timer = this.contractTimers.get(key);
        if (timer) {
            clearTimeout(timer);
            this.contractTimers.delete(key);
        }
    }
}
exports.default = new TradeJobScheduler();
