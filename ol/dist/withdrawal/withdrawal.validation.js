"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWithdrawalStatusValidator = exports.calculateFeeValidator = exports.createWithdrawalValidator = void 0;
const express_validator_1 = require("express-validator");
exports.createWithdrawalValidator = [
    (0, express_validator_1.body)("currency")
        .isString()
        .trim()
        .notEmpty()
        .withMessage("Currency is required."),
    (0, express_validator_1.body)("amount")
        .isFloat({ gt: 0 })
        .withMessage("Amount must be a positive number."),
    (0, express_validator_1.body)(["wallet_address", "walletAddress"]).custom((value, { req }) => {
        var _a;
        const address = (_a = value !== null && value !== void 0 ? value : req.body.wallet_address) !== null && _a !== void 0 ? _a : req.body.walletAddress;
        if (!address || typeof address !== "string" || address.trim() === "") {
            throw new Error("Wallet address is required.");
        }
        return true;
    }),
    (0, express_validator_1.body)("network")
        .isString()
        .trim()
        .notEmpty()
        .withMessage("Network is required."),
    (0, express_validator_1.body)(["withdrawal_password", "withdrawalPassword"]).custom((value, { req }) => {
        var _a;
        const password = (_a = value !== null && value !== void 0 ? value : req.body.withdrawal_password) !== null && _a !== void 0 ? _a : req.body.withdrawalPassword;
        if (!password || typeof password !== "string" || password.trim() === "") {
            throw new Error("Withdrawal password is required.");
        }
        return true;
    }),
];
exports.calculateFeeValidator = [
    (0, express_validator_1.body)("currency")
        .isString()
        .trim()
        .notEmpty()
        .withMessage("Currency is required."),
    (0, express_validator_1.body)("amount")
        .isFloat({ gt: 0 })
        .withMessage("Amount must be a positive number."),
    (0, express_validator_1.body)("network")
        .isString()
        .trim()
        .notEmpty()
        .withMessage("Network is required."),
];
exports.updateWithdrawalStatusValidator = [
    (0, express_validator_1.body)("status")
        .isIn(["approved", "rejected"])
        .withMessage("Status must be approved or rejected."),
    (0, express_validator_1.body)("rejection_reason")
        .if((0, express_validator_1.body)("status").equals("rejected"))
        .notEmpty()
        .withMessage("Rejection reason is required when rejecting a withdrawal."),
];
