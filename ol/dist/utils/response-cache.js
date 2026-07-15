"use strict";
/**
 * In-memory "stale-on-error" cache.
 *
 * Flow:  client -> /ol -> upstream API
 *   - upstream OK      -> store the value as the latest good one, return it
 *   - upstream fails   -> return the last good value (e.g. when rate limited)
 *   - never succeeded  -> rethrow so the caller can use its own fallback
 *
 * Cache lives for the lifetime of the process (the backend runs as a long-lived
 * container), which is exactly the window where rate limits bite. A restart just
 * means the next successful fetch repopulates it.
 */
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
exports.serveWithCache = exports.getCached = exports.setCached = void 0;
const logger_1 = require("./logger");
// key -> { value, ts }
const store = new Map();
const now = () => Date.now();
const setCached = (key, value) => {
    store.set(key, { value, ts: now() });
};
exports.setCached = setCached;
const getCached = (key) => store.get(key);
exports.getCached = getCached;
/**
 * Run `fetchFn`. On success (optionally gated by `validate`) cache and return the
 * value. On failure, fall back to the last cached value if one exists; otherwise
 * rethrow so the caller can apply its own fallback.
 *
 * @param {string} key
 * @param {() => Promise<any>} fetchFn
 * @param {{ validate?: (value:any)=>boolean, freshMs?: number }} [opts]
 */
const serveWithCache = (key, fetchFn, opts) => __awaiter(void 0, void 0, void 0, function* () {
    const options = opts || {};
    const validate = options.validate;
    const freshMs = options.freshMs || 0;
    // Optionally skip the upstream call entirely while a recent value is still fresh.
    if (freshMs > 0) {
        const hit = store.get(key);
        if (hit && now() - hit.ts < freshMs) {
            return hit.value;
        }
    }
    try {
        const value = yield fetchFn();
        if (validate && !validate(value)) {
            throw new Error(`response-cache: fetched value for "${key}" failed validation`);
        }
        (0, exports.setCached)(key, value);
        return value;
    }
    catch (error) {
        const hit = store.get(key);
        if (hit) {
            logger_1.logger.warn("response-cache: upstream failed, serving cached value", {
                key,
                ageMs: now() - hit.ts,
                error: error instanceof Error ? error.message : String(error),
            });
            return hit.value;
        }
        throw error;
    }
});
exports.serveWithCache = serveWithCache;
