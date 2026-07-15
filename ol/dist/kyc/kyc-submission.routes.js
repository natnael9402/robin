"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const controller = __importStar(require("./kyc-submission.controller"));
const kyc_submission_validation_1 = require("./kyc-submission.validation");
const admin_middleware_1 = require("../middleware/admin.middleware");
const http_response_1 = require("../utils/http-response");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   - name: KYC Submissions
 *     description: User KYC verification submissions
 */
router.use(auth_middleware_1.authenticateJWT);
/**
 * @swagger
 * /api/kyc-submissions:
 *   get:
 *     summary: List KYC submissions
 *     tags: [KYC Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *     responses:
 *       200:
 *         description: List of KYC submissions
 */
router.get("/", (req, res) => controller.index(req, res));
/**
 * @swagger
 * /api/kyc-submissions:
 *   post:
 *     summary: Create a new KYC submission
 *     tags: [KYC Submissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - document_type
 *               - document_number
 *               - front_image_url
 *               - back_image_url
 *               - selfie_image_url
 *             properties:
 *               document_type:
 *                 type: string
 *                 enum: [passport, national_id, driving_license]
 *               document_number:
 *                 type: string
 *               front_image_url:
 *                 type: string
 *               back_image_url:
 *                 type: string
 *               selfie_image_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: KYC submission created
 */
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const handleKycUpload = (req, res, next) => {
    const contentType = req.headers["content-type"] || "";
    if (!contentType.includes("multipart/form-data")) {
        return next();
    }
    const uploadFields = upload.fields([
        { name: 'front_image', maxCount: 1 },
        { name: 'back_image', maxCount: 1 },
        { name: 'selfie_image', maxCount: 1 }
    ]);
    uploadFields(req, res, (err) => {
        if (err) {
            return (0, http_response_1.errorResponse)(res, err.message || "File upload error", 400);
        }
        next();
    });
};

router.post("/", handleKycUpload, kyc_submission_validation_1.createKycSubmissionValidator, validation_middleware_1.validationMiddleware, (req, res) => controller.store(req, res));
/**
 * @swagger
 * /api/kyc-submissions/{id}:
 *   get:
 *     summary: Get a specific KYC submission
 *     tags: [KYC Submissions]
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
 *         description: KYC submission details
 */
router.get("/:id", (req, res) => controller.show(req, res));
/**
 * @swagger
 * /api/kyc-submissions/{id}:
 *   put:
 *     summary: Update KYC submission status (admin only)
 *     tags: [KYC Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *               rejection_reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: KYC submission updated
 */
router.put("/:id", admin_middleware_1.authorizeAdmin, kyc_submission_validation_1.updateKycSubmissionValidator, validation_middleware_1.validationMiddleware, (req, res) => controller.update(req, res));
/**
 * @swagger
 * /api/kyc-submissions/{id}:
 *   delete:
 *     summary: Delete a KYC submission
 *     tags: [KYC Submissions]
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
 *         description: KYC submission deleted
 */
router.delete("/:id", (req, res) => controller.destroy(req, res));
exports.default = router;
