"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const http_response_1 = require("../utils/http-response");
const logger_1 = require("../utils/logger");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err, req, res, _next) => {
    const error = err instanceof Error ? err : new Error(String(err));
    logger_1.logger.error("Unhandled application error", {
        method: req.method,
        path: req.originalUrl,
        message: error.message,
        stack: error.stack,
    });
    if (res.headersSent) {
        return res.end();
    }
    return (0, http_response_1.errorResponse)(res, "Internal server error", 500);
};
exports.errorHandler = errorHandler;
