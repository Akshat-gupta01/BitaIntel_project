import type { Request, Response } from "express";
import { z } from "zod";
import { ContactInquiry } from "../models/ContactInquiry.model.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().email("Valid corporate email is required"),
  company: z.string().trim().optional().nullable(),
  category: z.string().trim().min(2).max(120).optional().default("General Enquiry"),
  message: z.string().trim().min(5, "Please describe your inquiry").max(5000),
});

function generateTicketId(): string {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `BITA-TKT-${rand}`;
}

export async function submitContact(req: Request, res: Response) {
  try {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, "Validation failed", 400, "ERR_VALIDATION", parsed.error.issues);
    }

    const { name, email, company, category, message } = parsed.data;
    const ticketId = generateTicketId();

    const inquiry = await ContactInquiry.create({
      ticketId,
      name,
      email,
      company: company || null,
      category: category || "General Enquiry",
      message,
      status: "OPEN",
    });

    return sendSuccess(
      res,
      {
        ticketId: inquiry.ticketId,
        status: inquiry.status,
        message: "Query registered. Response within 1 business day.",
      },
      201
    );
  } catch (error) {
    console.error("Submit Contact Error:", error);
    return sendError(res, "Failed to submit contact query", 500, "ERR_INTERNAL_SERVER");
  }
}

export async function getContactInquiries(req: Request, res: Response) {
  try {
    const inquiries = await ContactInquiry.findAll({
      order: [["createdAt", "DESC"]],
      limit: 100,
    });
    return sendSuccess(res, { total: inquiries.length, inquiries });
  } catch (error) {
    console.error("Get Contact Inquiries Error:", error);
    return sendError(res, "Failed to fetch contact inquiries", 500, "ERR_INTERNAL_SERVER");
  }
}

const updateContactStatusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]),
});

export async function updateContactStatus(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
      return sendError(res, "Invalid contact ticket ID", 400, "ERR_VALIDATION");
    }

    const parsed = updateContactStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, "Invalid status value", 400, "ERR_VALIDATION", parsed.error.issues);
    }

    const inquiry = await ContactInquiry.findByPk(id);
    if (!inquiry) {
      return sendError(res, "Contact ticket not found", 404, "ERR_NOT_FOUND");
    }

    inquiry.status = parsed.data.status;
    await inquiry.save();

    return sendSuccess(res, { inquiry });
  } catch (error) {
    console.error("Update Contact Status Error:", error);
    return sendError(res, "Failed to update contact ticket status", 500, "ERR_INTERNAL_SERVER");
  }
}
