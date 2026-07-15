"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processTradeParamValidator = void 0;
const express_validator_1 = require("express-validator");
exports.processTradeParamValidator = [
    (0, express_validator_1.param)("id").isNumeric().withMessage("Trade ID must be numeric"),
];
