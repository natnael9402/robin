import { Request, Response } from "express";
import { put } from "@vercel/blob";
import { successResponse, errorResponse } from "../utils/http-response";
import { logger } from "../utils/logger";

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return errorResponse(res, "No file provided", 400);
    }

    const { originalname, buffer } = req.file;

    // Generate a unique filename to prevent overwrites
    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${originalname}`;

    const blob = await put(uniqueFilename, buffer, {
      access: "public",
    });

    return successResponse(res, { url: blob.url }, "File uploaded successfully", 201);
  } catch (error: any) {
    logger.error("File upload failed", error);
    return errorResponse(res, "File upload failed", 500, error.message);
  }
};
