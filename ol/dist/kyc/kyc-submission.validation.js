"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateKycSubmissionValidator = exports.createKycSubmissionValidator = void 0;
const express_validator_1 = require("express-validator");
const DOCUMENT_TYPES = ["passport", "national_id", "driving_license"];
exports.createKycSubmissionValidator = [
    (0, express_validator_1.body)("document_type")
        .isString()
        .withMessage("The document type must be a string.")
        .trim()
        .notEmpty()
        .withMessage("The document type field is required.")
        .bail()
        .isIn(DOCUMENT_TYPES)
        .withMessage("The selected document type is invalid."),
    (0, express_validator_1.body)("document_number")
        .isString()
        .withMessage("The document number must be a string.")
        .trim()
        .notEmpty()
        .withMessage("The document number field is required.")
        .bail()
        .isLength({ max: 50 })
        .withMessage("The document number may not be greater than 50 characters."),
    (0, express_validator_1.body)("front_image_url")
        .optional({ checkFalsy: true })
        .isURL()
        .withMessage("The front image URL must be a valid URL."),
    (0, express_validator_1.body)("back_image_url")
        .optional({ checkFalsy: true })
        .isURL()
        .withMessage("The back image URL must be a valid URL."),
    (0, express_validator_1.body)("selfie_image_url")
        .optional({ checkFalsy: true })
        .isURL()
        .withMessage("The selfie image URL must be a valid URL."),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const hasFrontUrl = typeof req.body.front_image_url === "string" && req.body.front_image_url.trim().length > 0;
        const hasBackUrl = typeof req.body.back_image_url === "string" && req.body.back_image_url.trim().length > 0;
        const hasSelfieUrl = typeof req.body.selfie_image_url === "string" && req.body.selfie_image_url.trim().length > 0;
        const hasFrontFile = req.files && req.files["front_image"] && req.files["front_image"].length > 0;
        const hasBackFile = req.files && req.files["back_image"] && req.files["back_image"].length > 0;
        const hasSelfieFile = req.files && req.files["selfie_image"] && req.files["selfie_image"].length > 0;
        if (!hasFrontUrl && !hasFrontFile) {
            throw new Error("Front image (file or URL) is required.");
        }
        if (!hasBackUrl && !hasBackFile) {
            throw new Error("Back image (file or URL) is required.");
        }
        if (!hasSelfieUrl && !hasSelfieFile) {
            throw new Error("Selfie image (file or URL) is required.");
        }
        return true;
    }),
];
exports.updateKycSubmissionValidator = [
    (0, express_validator_1.body)("status")
        .isString()
        .withMessage("The status must be a string.")
        .trim()
        .notEmpty()
        .withMessage("The status field is required.")
        .bail()
        .isIn(["approved", "rejected"])
        .withMessage("The selected status is invalid."),
    (0, express_validator_1.body)("rejection_reason")
        .optional({ checkFalsy: true })
        .isString()
        .withMessage("The rejection reason must be a string.")
        .trim()
        .if((0, express_validator_1.body)("status").equals("rejected"))
        .notEmpty()
        .withMessage("The rejection reason field is required when status is rejected.")
        .bail()
        .isLength({ max: 255 })
        .withMessage("The rejection reason may not be greater than 255 characters."),
];
