import express from "express";
import multer from "multer";
import { uploadFile } from "./upload.controller";
import { authenticateJWT } from "../middleware/auth.middleware";

const router = express.Router();

// Configure multer with memory storage and 10MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

// Protect the route
router.use(authenticateJWT);

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload a file to Vercel Blob storage
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded successfully
 */
router.post("/", upload.single("file"), uploadFile);

export default router;
