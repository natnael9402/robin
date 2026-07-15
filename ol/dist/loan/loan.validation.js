"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyLoanValidator = void 0;
const express_validator_1 = require("express-validator");
exports.applyLoanValidator = [
    (0, express_validator_1.body)("amount")
        .isFloat({ gt: 0 })
        .withMessage("Amount must be a positive number."),
    (0, express_validator_1.body)("document_type")
        .isString()
        .withMessage("Document type must be a string.")
        .notEmpty()
        .withMessage("Document type is required.")
        .isIn(["passport", "national_id", "driving_license"])
        .withMessage("Document type must be one of: passport, national_id, driving_license"),
    (0, express_validator_1.body)("duration")
        .isInt()
        .withMessage("Duration must be an integer.")
        .isIn([30, 60, 90])
        .withMessage("Duration must be 30, 60, or 90 days."),
    (0, express_validator_1.body)("front_image_url")
        .optional({ checkFalsy: true })
        .isURL()
        .withMessage("The front image URL must be a valid URL."),
    (0, express_validator_1.body)("back_image_url")
        .optional({ checkFalsy: true })
        .isURL()
        .withMessage("The back image URL must be a valid URL."),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const hasFrontUrl = typeof req.body.front_image_url === "string" && req.body.front_image_url.trim().length > 0;
        const hasBackUrl = typeof req.body.back_image_url === "string" && req.body.back_image_url.trim().length > 0;
        const hasFrontFile = req.files && req.files["front_image"] && req.files["front_image"].length > 0;
        const hasBackFile = req.files && req.files["back_image"] && req.files["back_image"].length > 0;
        if (!hasFrontUrl && !hasFrontFile) {
            throw new Error("Front image (file or URL) is required.");
        }
        if (!hasBackUrl && !hasBackFile) {
            throw new Error("Back image (file or URL) is required.");
        }
        return true;
    }),
];
