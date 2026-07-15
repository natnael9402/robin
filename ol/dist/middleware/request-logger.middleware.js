"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const logger_1 = require("../utils/logger");
const requestLogger = (req, res, next) => {
    var _a, _b;
    const start = Date.now();
    const authReq = req;
    logger_1.logger.info("Incoming request", {
        method: req.method,
        path: req.originalUrl,
        userId: (_b = (_a = authReq.user) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null,
    });
    res.on("finish", () => {
        const duration = Date.now() - start;
        logger_1.logger.info("Request completed", {
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: duration,
        });
    });
    next();
};
exports.requestLogger = requestLogger;
