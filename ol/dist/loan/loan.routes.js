"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loan_controller_1 = require("./loan.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const loan_validation_1 = require("./loan.validation");
const multer_1 = __importDefault(require("multer"));
const http_response_1 = require("../utils/http-response");
const router = (0, express_1.Router)();
const loanController = new loan_controller_1.LoanController();
const allowedMimes = new Set(["image/jpeg", "image/png", "application/pdf"]);
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (allowedMimes.has(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("Invalid file type. Only PNG, JPG, and PDF are allowed."));
        }
    },
});
const loanApplicationUpload = upload.fields([
    { name: "front_image", maxCount: 1 },
    { name: "back_image", maxCount: 1 },
]);
const handleLoanApplicationUpload = (req, res, next) => {
    const contentType = req.headers["content-type"] || "";
    if (!contentType.includes("multipart/form-data")) {
        return next();
    }
    loanApplicationUpload(req, res, (err) => {
        if (err) {
            return (0, http_response_1.errorResponse)(res, err.message || "File upload error", 400);
        }
        next();
    });
};
const repaymentUpload = upload.single("proof_image");
const handleRepaymentUpload = (req, res, next) => {
    const contentType = req.headers["content-type"] || "";
    if (!contentType.includes("multipart/form-data")) {
        return next();
    }
    repaymentUpload(req, res, (err) => {
        if (err) {
            return (0, http_response_1.errorResponse)(res, err.message || "File upload error", 400);
        }
        next();
    });
};
router.use(auth_middleware_1.authenticateJWT);
/**
 * @swagger
 * tags:
 *   name: Loans
 *   description: Loan management
 */
/**
 * @swagger
 * /api/loans:
 *   post:
 *     summary: Apply for a loan
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - duration
 *               - document_type
 *               - front_image
 *               - back_image
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount of loan requested
 *               duration:
 *                 type: integer
 *                 enum: [30, 60, 90]
 *                 description: Loan duration in days
 *               document_type:
 *                 type: string
 *                 enum: [passport, national_id, driving_license]
 *                 description: Type of document
 *               front_image:
 *                 type: string
 *                 format: binary
 *                 description: Front image of the document
 *               back_image:
 *                 type: string
 *                 format: binary
 *                 description: Back image of the document
 *     responses:
 *       201:
 *         description: Loan application created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post("/", handleLoanApplicationUpload, loan_validation_1.applyLoanValidator, loanController.applyLoan);
/**
 * @swagger
 * /api/loans:
 *   get:
 *     summary: Get user loans
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user loans
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   amount:
 *                     type: number
 *                   duration:
 *                     type: integer
 *                   interest_rate:
 *                     type: number
 *                   total_payable:
 *                     type: number
 *                   status:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Server error
 */
router.get("/", loanController.getLoans);
/**
 * @swagger
 * /api/loans/{id}/repay:
 *   post:
 *     summary: Submit a loan repayment with receipt
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Loan ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - proof_image
 *             properties:
 *               amount:
 *                 type: number
 *               proof_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Repayment submitted successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post("/:id/repay", handleRepaymentUpload, loanController.submitRepayment);
/**
 * @swagger
 * /api/loans/{id}/repayments:
 *   get:
 *     summary: Get repayments for a loan
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of repayments
 *       500:
 *         description: Server error
 */
router.get("/:id/repayments", loanController.getRepayments);
exports.default = router;
