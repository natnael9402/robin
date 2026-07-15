"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUserIdParamValidator = exports.adminResolveTradeValidator = exports.adminTradeFiltersValidator = void 0;
const express_validator_1 = require("express-validator");
exports.adminTradeFiltersValidator = [
    (0, express_validator_1.query)("user_id").optional().isNumeric(),
    (0, express_validator_1.query)("type").optional().isString(),
    (0, express_validator_1.query)("status").optional().isString(),
    (0, express_validator_1.query)("result").optional().isString(),
    (0, express_validator_1.query)("symbol").optional().isString(),
    (0, express_validator_1.query)("direction").optional().isString(),
    (0, express_validator_1.query)("date_from").optional().isISO8601(),
    (0, express_validator_1.query)("date_to").optional().isISO8601(),
    (0, express_validator_1.query)("sort_by").optional().isString(),
    (0, express_validator_1.query)("sort_dir").optional().isIn(["asc", "desc"]),
    (0, express_validator_1.query)("page").optional().isInt({ min: 1 }),
    (0, express_validator_1.query)("per_page").optional().isInt({ min: 1, max: 100 }),
];
exports.adminResolveTradeValidator = [
    (0, express_validator_1.body)("result").isIn(["won", "lost"]),
];
exports.adminUserIdParamValidator = [
    (0, express_validator_1.param)("userId").isNumeric().withMessage("User ID must be numeric"),
];
