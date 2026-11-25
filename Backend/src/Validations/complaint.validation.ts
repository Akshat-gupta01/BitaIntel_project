import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/apiResponse.js";

export const validateComplaint = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return sendError(
        res,
        firstIssue ? firstIssue.message : "Validation failed",
        400,
        "ERR_VALIDATION",
        result.error.issues
      );
    }
    req.body = result.data;
    next();
  };
};

export const createComplaintSchema = z
  .object({
    businessId: z.union([z.string(), z.number()]).optional(),
    businessSlug: z.string().trim().optional(),
    category: z
      .enum([
        "QUALITY_ISSUE",
        "DELIVERY_DEFAULT",
        "MISREPRESENTATION",
        "STATUTORY_NON_COMPLIANCE",
        "FRAUD",
        "OTHER",
      ])
      .default("OTHER"),
    severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
    subject: z.string().trim().min(5, "Complaint subject must be at least 5 characters").max(255),
    description: z.string().trim().min(10, "Complaint description must be at least 10 characters"),
    evidenceUrl: z.string().trim().max(500).optional().nullable(),
  })
  .refine((data) => Boolean(data.businessSlug || data.businessId), {
    message: "Target business identifier (businessSlug or businessId) is required",
    path: ["businessSlug"],
  });

export const updateComplaintSchema = z.object({
  status: z.enum(["OPEN", "UNDER_INVESTIGATION", "RESOLVED", "DISMISSED"]),
  adminNotes: z.string().trim().optional().nullable(),
});
