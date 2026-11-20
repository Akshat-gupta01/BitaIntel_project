// src/utils/apiResponse.ts
import { Response } from "express";

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, meta?: Record<string, unknown>) {
  return res.status(statusCode).json({
    success: true,
    data,
    meta: {
      ...meta,
      timestamp: new Date().toISOString()
    }
  });
}

export function sendError(res: Response, message: string, statusCode = 400, code = "ERR_BAD_REQUEST", details?: unknown) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString()
    }
  });
}