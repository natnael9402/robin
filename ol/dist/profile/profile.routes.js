"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const profile_controller_1 = __importDefault(require("./profile.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const profile_validation_1 = require("./profile.validation");
const kyc_submission_validation_1 = require("../kyc/kyc-submission.validation");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   - name: Profile
 *     description: User profile management
 */
router.use(auth_middleware_1.authenticateJWT);
/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Retrieve the authenticated user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 */
router.get("/", (req, res) => profile_controller_1.default.getProfile(req, res));
/**
 * @swagger
 * /api/profile/with-user-data:
 *   get:
 *     summary: Retrieve profile, balance, and asset details
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data retrieved successfully
 */
router.get("/with-user-data", (req, res) => profile_controller_1.default.getProfileWithUserData(req, res));
/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update profile preferences
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferredLanguage:
 *                 type: string
 *               bankAccount:
 *                 type: string
 *               blockchainAddresses:
 *                 type: object
 *               notificationSettings:
 *                 type: object
 *               simTradeEnabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put("/", profile_validation_1.updateProfileValidator, validation_middleware_1.validationMiddleware, (req, res) => profile_controller_1.default.updateProfile(req, res));
/**
 * @swagger
 * /api/profile/google-auth:
 *   post:
 *     summary: Enable Google Authenticator for two-factor authentication
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Google Authenticator enabled successfully
 */
router.post("/google-auth", (req, res) => profile_controller_1.default.enableGoogleAuth(req, res));
/**
 * @swagger
 * /api/profile/upgrade-level:
 *   post:
 *     summary: Request a manual level upgrade
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Level upgraded successfully
 */
router.post("/upgrade-level", (req, res) => profile_controller_1.default.upgradeLevel(req, res));
/**
 * @swagger
 * /api/profile/kyc:
 *   post:
 *     summary: Submit KYC documents (legacy alias)
 *     tags: [Profile]
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
router.post("/kyc", kyc_submission_validation_1.createKycSubmissionValidator, validation_middleware_1.validationMiddleware, (req, res) => profile_controller_1.default.createKycSubmissionAlias(req, res));
router.post("/delete-account", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = (() => { try { return BigInt(req.user.id); } catch { return null; } })();
    if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
    }
    try {
        const bcryptjs_1 = require("bcryptjs");
        const prisma_1 = require("../prisma");
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ message: "Password is required to delete account" });
        }
        const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isValid = yield bcryptjs_1.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: "Incorrect password" });
        }
        yield prisma_1.default.deletedAccount.create({
            data: {
                user_id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                balance: user.balance || 0,
                role: user.role,
                reason: req.body.reason || null,
                deletedAt: new Date(),
                deletedByIp: req.ip || null,
            },
        }).catch(() => {});
        yield prisma_1.default.user.delete({ where: { id: userId } });
        return res.json({ message: "Account deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to delete account" });
    }
}));
exports.default = router;
