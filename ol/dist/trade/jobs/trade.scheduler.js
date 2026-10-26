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
const prisma_1 = __importDefault(require("../../prisma"));
const MILLISECONDS_IN_SECOND = 1000;
class TradeJobScheduler {
    constructor() {
        this.optionTimers = new Map();
        this.contractTimers = new Map();
        this.expiryTimers = new Map();
        this.startInvoked = false;
        this.DEFAULT_CONTRACT_INTERVAL_SECONDS = 15;
        this.CONTRACT_ERROR_RETRY_SECONDS = 5;
        this.MIN_CONTRACT_INTERVAL_SECONDS = 5;
        this.OPTION_RETRY_DELAY_SECONDS = 2;
        this.OPTION_MAX_RETRIES = 2;
        this.CONTRACT_SWEEP_INTERVAL_SECONDS = 20;
        this.sweepRunning = false;
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
                if (result.resolved) {
                    this.clearContractExpiry(tradeId);
                }
                if (result.shouldContinue && result.interval) {
                    // Small intervals (< 5s) are honoured as-is so the final
                    // tick can land exactly on the contract's expiry moment.
                    const nextDelay = result.interval < this.MIN_CONTRACT_INTERVAL_SECONDS
                        ? Math.max(result.interval, 1)
                        : result.interval;
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
                // A transient failure (e.g. price feed outage) must never
                // strand an open contract: retry quickly so the resolution
                // lands as soon as the failure clears.
                this.scheduleContractCheck(tradeId, this.CONTRACT_ERROR_RETRY_SECONDS);
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
    /**
     * Absolute expiry timer: fires at opened_at + CONTRACT_DURATION_SECONDS so
     * a contract closes on the exact 60s mark even if the interval chain was
     * delayed, suspended or lost. If evaluation fails, the watchdog and the
     * interval chain still cover the trade.
     */
    scheduleContractExpiry(tradeId, delaySeconds) {
        const key = tradeId.toString();
        const existingTimer = this.expiryTimers.get(key);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }
        const delayMs = Math.max(Math.round(delaySeconds * MILLISECONDS_IN_SECOND), 250);
        const timer = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            this.expiryTimers.delete(key);
            logger_1.logger.info("Contract expiry timer fired", { tradeId: key, delayMs });
            try {
                yield trade_service_1.default.evaluateContractTrade(tradeId);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                if (message === "Trade not found") {
                    return;
                }
                logger_1.logger.error("Contract expiry evaluation failed", {
                    tradeId: key,
                    error: message,
                });
                this.scheduleContractCheck(tradeId, this.CONTRACT_ERROR_RETRY_SECONDS);
            }
        }), delayMs);
        if (typeof timer.unref === "function") {
            timer.unref();
        }
        this.expiryTimers.set(key, timer);
        logger_1.logger.info("Scheduled exact contract expiry", { tradeId: key, delayMs });
    }
    clearContractExpiry(tradeId) {
        const key = tradeId.toString();
        const timer = this.expiryTimers.get(key);
        if (timer) {
            clearTimeout(timer);
            this.expiryTimers.delete(key);
        }
    }
    /**
     * Watchdog: re-arm evaluation for any open contract that is already past
     * its expiry deadline (+ small grace). A lost timer, a transient error
     * storm or a container rotation can strand a per-trade resolution chain;
     * this sweep guarantees every overdue contract is picked up again within
     * seconds, forever, on every server.
     */
    sweepExpiredContracts() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.sweepRunning) {
                return;
            }
            this.sweepRunning = true;
            try {
                const expirySeconds = trade_service_1.default.getContractExpirySeconds();
                const graceMs = 5 * MILLISECONDS_IN_SECOND;
                const openedBefore = new Date(Date.now() - (expirySeconds * MILLISECONDS_IN_SECOND + graceMs));
                const overdue = yield prisma_1.default.trade.findMany({
                    where: {
                        status: "open",
                        type: "contract",
                        opened_at: { lt: openedBefore },
                    },
                    select: { id: true },
                    orderBy: { id: "asc" },
                    take: 100,
                });
                if (overdue.length === 0) {
                    return;
                }
                logger_1.logger.warn("Contract watchdog re-armed overdue contracts", {
                    count: overdue.length,
                    tradeIds: overdue.map((trade) => trade.id.toString()).join(","),
                });
                for (const trade of overdue) {
                    // Evaluation resolves an overdue contract on this tick and
                    // terminates its chain, so a short delay is enough.
                    this.scheduleContractCheck(trade.id, 0.5);
                }
            }
            catch (error) {
                logger_1.logger.error("Contract watchdog sweep failed", {
                    error: error instanceof Error ? error.message : String(error),
                });
            }
            finally {
                this.sweepRunning = false;
            }
        });
    }
    /**
     * Re-arm timers for contracts that are still open after a server
     * (re)start. Without this, rotations of the container would leave open
     * contracts without any resolution loop attached. Called once at boot.
     */
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.startInvoked) {
                return;
            }
            this.startInvoked = true;
            try {
                const openContracts = yield prisma_1.default.trade.findMany({
                    where: { status: "open", type: "contract" },
                    select: { id: true, opened_at: true },
                    orderBy: { id: "asc" },
                });
                const now = Date.now();
                const expirySeconds = trade_service_1.default.getContractExpirySeconds();
                for (const trade of openContracts) {
                    const openedAt = new Date(trade.opened_at).getTime();
                    const secondsToExpiry = expirySeconds - (now - openedAt) / 1000;
                    const delaySeconds = Math.min(Math.max(secondsToExpiry, 1), this.DEFAULT_CONTRACT_INTERVAL_SECONDS);
                    this.scheduleContractCheck(trade.id, delaySeconds);
                    this.scheduleContractExpiry(trade.id, secondsToExpiry);
                }
                logger_1.logger.info("Trade scheduler started.", {
                    openContracts: openContracts.length,
                    contractExpirySeconds: expirySeconds,
                });
            }
            catch (error) {
                logger_1.logger.error("Trade scheduler boot re-arm failed", {
                    error: error instanceof Error ? error.message : String(error),
                });
            }
            // Watchdog sweep runs for the lifetime of the process, regardless
            // of whether the boot re-arm itself succeeded.
            this.sweepExpiredContracts();
            setInterval(() => this.sweepExpiredContracts(), this.CONTRACT_SWEEP_INTERVAL_SECONDS * MILLISECONDS_IN_SECOND);
        });
    }
}
exports.default = new TradeJobScheduler();
