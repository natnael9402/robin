"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUpdateHostingStatusValidator = exports.adminHostingIdParamValidator = exports.adminGetHostingsQueryValidator = exports.adminUpdateMiningProductValidator = exports.adminCreateMiningProductValidator = void 0;
const express_validator_1 = require("express-validator");
const mining_validation_1 = require("./mining.validation");
exports.adminCreateMiningProductValidator = [
    ...mining_validation_1.createMiningProductValidator,
];
exports.adminUpdateMiningProductValidator = [
    ...mining_validation_1.updateMiningProductValidator,
];
exports.adminGetHostingsQueryValidator = [
    (0, express_validator_1.query)("status").optional().isIn(["running", "ended", "cancelled"]),
    (0, express_validator_1.query)("userId").optional().isInt({ min: 1 }),
];
exports.adminHostingIdParamValidator = [
    (0, express_validator_1.param)("id").isInt({ min: 1 }).toInt(),
];
exports.adminUpdateHostingStatusValidator = [
    (0, express_validator_1.body)("status")
        .isString()
        .isIn(["running", "ended", "cancelled"])
        .withMessage("Status must be running, ended, or cancelled"),
];
