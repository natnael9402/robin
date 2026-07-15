"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardingValidator = void 0;
const { body } = require("express-validator");
exports.onboardingValidator = [
  body("income_source")
    .isString().trim().notEmpty()
    .withMessage("Income source is required"),
  body("annual_income")
    .isString().trim().notEmpty()
    .withMessage("Annual income is required"),
  body("employment_status")
    .isString().trim().notEmpty()
    .withMessage("Employment status is required"),
  body("investment_goal")
    .optional({ nullable: true })
    .isString().trim(),
];
