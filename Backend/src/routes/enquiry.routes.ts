import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  submitEnquiry,
  getVendorEnquiries,
  getAdminEnquiries,
  updateAdminEnquiryStatus,
  replyAdminEnquiry,
  updateEnquiryStatus,
  replyEnquiry,
} from "../controllers/enquiry.controller.js";
import {
  validateEnquiry,
  createEnquirySchema,
  updateEnquiryStatusSchema,
  replyEnquirySchema,
} from "../Validations/enquiry.validation.js";

const enquiryRouter = Router();

// ─── 1. Public Buyer Route ──────────────────────────────────────────────────
// Any buyer on the business directory or company dossier can submit an RFQ/Enquiry
enquiryRouter.post("/", validateEnquiry(createEnquirySchema), submitEnquiry);

// ─── 2. Super Admin Routes (Centralized Review Desk) ────────────────────────
enquiryRouter.get("/admin", authenticate, getAdminEnquiries);
enquiryRouter.patch("/admin/:id/status", authenticate, validateEnquiry(updateEnquiryStatusSchema), updateAdminEnquiryStatus);
enquiryRouter.post("/admin/:id/reply", authenticate, validateEnquiry(replyEnquirySchema), replyAdminEnquiry);

// ─── 3. Authenticated Vendor Routes ─────────────────────────────────────────
enquiryRouter.get("/vendor", authenticate, getVendorEnquiries);
enquiryRouter.patch("/vendor/:id/status", authenticate, validateEnquiry(updateEnquiryStatusSchema), updateEnquiryStatus);
enquiryRouter.post("/vendor/:id/reply", authenticate, validateEnquiry(replyEnquirySchema), replyEnquiry);

export default enquiryRouter;
