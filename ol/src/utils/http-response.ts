import { Response } from "express";
import { logger } from "./logger";

const getRequestContext = (res: Response) => {
  const req = (res as any).req;
  if (!req) return {};
  return {
    method: req.method,
    path: req.originalUrl,
    userId: req.user?.id ?? null,
  };
};

export function successResponse(
  res: Response,
  data: any,
  message = "Operation successful",
  statusCode = 200
) {
  const payload = { status: "success", message, data };
  logger.info("Success response sent", {
    statusCode,
    message,
    hasData: data !== undefined,
    ...getRequestContext(res),
  });
  return res.status(statusCode).json(payload);
}

export function errorResponse(
  res: Response,
  message = "Operation failed",
  statusCode = 400,
  errors?: any
) {
  const payload = { status: "error", message, ...(errors ? { errors } : {}) };
  logger.error("Error response sent", {
    statusCode,
    message,
    hasErrors: Boolean(errors),
    errorDetail: typeof errors === "string" ? errors : undefined,
    ...getRequestContext(res),
  });
  return res.status(statusCode).json(payload);
}
