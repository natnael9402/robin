"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = successResponse;
exports.errorResponse = errorResponse;
const logger_1 = require("./logger");
const getRequestContext = (res) => {
    var _a, _b;
    const req = res.req;
    if (!req) {
        return {};
    }
    return {
        method: req.method,
        path: req.originalUrl,
        userId: (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null,
    };
};
function successResponse(res, data, message = "Operation successful", statusCode = 200) {
    const payload = {
        status: "success",
        message,
        data,
    };
    logger_1.logger.info("Success response sent", Object.assign({ statusCode,
        message, hasData: data !== undefined }, getRequestContext(res)));
    return res.status(statusCode).json(payload);
}
function errorResponse(res, message = "Operation failed", statusCode = 400, errors) {
    const payload = Object.assign({ status: "error", message }, (errors ? { errors } : {}));
    logger_1.logger.error("Error response sent", Object.assign({ statusCode,
        message, hasErrors: Boolean(errors), errorDetail: typeof errors === "string" ? errors : undefined }, getRequestContext(res)));
    return res.status(statusCode).json(payload);
}
