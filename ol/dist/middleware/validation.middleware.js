"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationMiddleware = void 0;
const express_validator_1 = require("express-validator");
const http_response_1 = require("../utils/http-response");
const toSnakeCase = (value) => value
    .split(".")
    .map((segment) => segment
    .replace(/([A-Z])/g, "_$1")
    .replace(/__+/g, "_")
    .toLowerCase())
    .join(".");
const getErrorParam = (error) => {
    if ("param" in error && typeof error.param === "string" && error.param) {
        return error.param;
    }
    if ("path" in error &&
        typeof error.path === "string") {
        return error.path;
    }
    return "_error";
};
const validationMiddleware = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const groupedErrors = errors
            .array()
            .reduce((acc, err) => {
            const key = toSnakeCase(getErrorParam(err));
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(err.msg);
            return acc;
        }, {});
        return (0, http_response_1.errorResponse)(res, "Validation error", 422, groupedErrors);
    }
    next();
};
exports.validationMiddleware = validationMiddleware;
