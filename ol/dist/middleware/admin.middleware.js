"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeAdmin = void 0;
const http_response_1 = require("../utils/http-response");
const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        return next();
    }
    return (0, http_response_1.errorResponse)(res, "Unauthorized access", 403);
};
exports.authorizeAdmin = authorizeAdmin;
