import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/apiResponse.js";

/**
 * Reusable Express Validation Middleware for Enquiries
 */
export const validateEnquiry = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const errorMessage = firstIssue ? firstIssue.message : "Validation failed";
      return sendError(res, errorMessage, 400, "ERR_VALIDATION", result.error.issues);
    }
    req.body = result.data;
    next();
  };
};

/**
 * Buyer Enquiry Submission Schema (Public)
 * Complies with both docs specifications (03_EXPRESS_API_SPECIFICATION.md)
 * and database schema specifications (02_DATABASE_SCHEMA_SPEC.md Table 2.8)
 */
export const createEnquirySchema = z
  .object({
    // Target business identifier (supports businessSlug from docs, or businessId/business_id from schema)
    businessSlug: z.union([z.string(), z.number()]).optional(),
    businessId: z.union([z.string(), z.number()]).optional(),
    business_id: z.union([z.string(), z.number()]).optional(),

    // Optional product reference
    productId: z.union([z.string(), z.number()]).optional().nullable(),
    product_id: z.union([z.string(), z.number()]).optional().nullable(),
    productName: z.string().optional().nullable(),
    product_name: z.string().optional().nullable(),

    // Buyer name (supports 'name' from docs, 'buyerName' from frontend, or 'sender_name' from db spec)
    name: z.string().trim().optional(),
    buyerName: z.string().trim().optional(),
    sender_name: z.string().trim().optional(),

    // Buyer email (supports 'email' from docs, 'buyerEmail' from frontend, or 'sender_email' from db spec)
    email: z.string().trim().optional(),
    buyerEmail: z.string().trim().optional(),
    sender_email: z.string().trim().optional(),

    // Buyer phone (optional)
    phone: z.string().trim().optional().nullable(),
    buyerPhone: z.string().trim().optional().nullable(),
    sender_phone: z.string().trim().optional().nullable(),

    // Buyer company (optional)
    company: z.string().trim().optional().nullable(),
    buyerCompany: z.string().trim().optional().nullable(),
    sender_company: z.string().trim().optional().nullable(),

    // Scope and intent (supports 'message' from docs/frontend or 'details' from model)
    subject: z.string().trim().optional(),
    details: z.string().trim().optional(),
    message: z.string().trim().optional(),
    budget: z.string().trim().optional().nullable(),
  })
  .refine(
    (data) => Boolean(data.businessSlug || data.businessId || data.business_id),
    {
      message: "Target Business identifier (businessSlug or businessId) is required",
      path: ["businessSlug"],
    }
  )
  .refine(
    (data) => Boolean((data.name || data.buyerName || data.sender_name)?.trim()),
    {
      message: "Buyer name is required (at least 2 characters)",
      path: ["name"],
    }
  )
  .refine(
    (data) => {
      const emailVal = (data.email || data.buyerEmail || data.sender_email)?.trim();
      return Boolean(emailVal && emailVal.includes("@"));
    },
    {
      message: "Valid corporate email address is required",
      path: ["email"],
    }
  )
  .refine(
    (data) => Boolean((data.details || data.message)?.trim()),
    {
      message: "Procurement message / specifications cannot be empty",
      path: ["message"],
    }
  )
  .transform((data) => {
    const rawTarget = data.businessSlug || data.businessId || data.business_id;
    const finalName = (data.name || data.buyerName || data.sender_name || "").trim();
    const finalEmail = (data.email || data.buyerEmail || data.sender_email || "").trim();
    const finalPhone = (data.phone || data.buyerPhone || data.sender_phone || "")?.trim() || null;
    const finalCompany = (data.company || data.buyerCompany || data.sender_company || "")?.trim() || null;
    const finalMessage = (data.message || data.details || "").trim();
    const finalProduct = data.productName || data.product_name || null;
    const rawProductId = data.productId ?? data.product_id;
    const parsedProductId =
      rawProductId !== undefined && rawProductId !== null && /^\d+$/.test(String(rawProductId).trim())
        ? Number(String(rawProductId).trim())
        : null;
    const finalProductId = parsedProductId;

    return {
      businessId: rawTarget!,
      businessSlug: typeof rawTarget === "string" ? rawTarget : undefined,
      buyerName: finalName,
      name: finalName,
      sender_name: finalName,
      buyerEmail: finalEmail,
      email: finalEmail,
      sender_email: finalEmail,
      buyerPhone: finalPhone,
      phone: finalPhone,
      sender_phone: finalPhone,
      buyerCompany: finalCompany,
      company: finalCompany,
      sender_company: finalCompany,
      subject: (data.subject || (finalProduct ? `Request RFQ: ${finalProduct}` : "Procurement / RFQ Enquiry")).trim(),
      details: finalMessage,
      message: finalMessage,
      budget: data.budget || null,
      productId: finalProductId,
      productName: finalProduct,
    };
  });

/**
 * Status Canonical Normalizer
 * Bridges docs uppercase statuses ('NEW', 'VIEWED', 'IN_DISCUSSION')
 * with frontend dashboard title case statuses ('New', 'Viewed', 'In Discussion')
 */
const STATUS_CANONICAL_MAP: Record<string, "New" | "Viewed" | "Responded" | "In Discussion" | "Closed/Rejected"> = {
  NEW: "New",
  New: "New",
  VIEWED: "Viewed",
  Viewed: "Viewed",
  RESPONDED: "Responded",
  Responded: "Responded",
  IN_DISCUSSION: "In Discussion",
  "In Discussion": "In Discussion",
  CLOSED: "Closed/Rejected",
  REJECTED: "Closed/Rejected",
  "Closed/Rejected": "Closed/Rejected",
  Closed: "Closed/Rejected",
  Rejected: "Closed/Rejected",
};

/**
 * Vendor Status Update Schema
 */
export const updateEnquiryStatusSchema = z
  .object({
    status: z.string().transform((val) => {
      const trimmed = val.trim();
      const mapped = STATUS_CANONICAL_MAP[trimmed] || STATUS_CANONICAL_MAP[trimmed.toUpperCase()];
      return mapped || trimmed;
    }),
  })
  .refine((data) => ["New", "Viewed", "Responded", "In Discussion", "Closed/Rejected"].includes(data.status), {
    message: "Invalid status value. Must be New, Viewed, Responded, In Discussion, or Closed/Rejected (or NEW, VIEWED, etc.)",
  });

/**
 * Vendor Reply Schema
 */
export const replyEnquirySchema = z.object({
  replyMessage: z.string().trim().min(2, "Reply message must be at least 2 characters"),
});
