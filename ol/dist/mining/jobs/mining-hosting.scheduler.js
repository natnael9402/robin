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
Object.defineProperty(exports, "__esModule", { value: true });
const mining_hosting_service_1 = require("../mining-hosting.service");
const logger_1 = require("../../utils/logger");
class MiningHostingScheduler {
    constructor() {
        this.timers = new Map();
    }
    scheduleCompletion(hostingId, endDate) {
        if (!endDate) {
            return;
        }
        const key = hostingId.toString();
        const now = Date.now();
        const targetTime = endDate.getTime();
        const delay = Math.max(targetTime - now, 0);
        const existingTimer = this.timers.get(key);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }
        // Node.js setTimeout has a max limit of 2147483647ms (approx 24.8 days)
        const MAX_DELAY = 2147483647;
        if (delay > MAX_DELAY) {
            const timer = setTimeout(() => {
                this.scheduleCompletion(hostingId, endDate);
            }, MAX_DELAY);
            this.timers.set(key, timer);
        }
        else {
            const timer = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                this.timers.delete(key);
                try {
                    const result = yield (0, mining_hosting_service_1.finalizeHosting)(Number(hostingId));
                    this.handleFinalizeResult(hostingId, result);
                }
                catch (error) {
                    logger_1.logger.error("Failed to finalize mining hosting", {
                        hostingId: key,
                        error: error instanceof Error ? error.message : error,
                    });
                }
            }), delay);
            this.timers.set(key, timer);
        }
    }
    cancel(hostingId) {
        const key = hostingId.toString();
        const timer = this.timers.get(key);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(key);
        }
    }
    handleFinalizeResult(hostingId, result) {
        if (result.status === "not_due" && result.nextRunAt) {
            this.scheduleCompletion(hostingId, result.nextRunAt);
        }
    }
}
exports.default = new MiningHostingScheduler();
