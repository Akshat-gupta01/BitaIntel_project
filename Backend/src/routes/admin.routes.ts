import { Router } from "express";
import {
  getVerificationQueue,
  getAllVendors,
  getVendorDetailForAdmin,
  verifyStatutory,
  reviewDocument,
} from "../controllers/admin.controller.js";
import {
  getAdminEnquiries,
  updateAdminEnquiryStatus,
  replyAdminEnquiry,
} from "../controllers/enquiry.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";

const adminRouter = Router();

// Suraksha (Security): Sirf logged-in users hi access kar sakein
adminRouter.use(authenticate);

// 📁 Module 1: Verification & Audit
adminRouter.get("/verification-queue", authorize("verification.view"), getVerificationQueue);
adminRouter.get("/vendors/:businessId", authorize("verification.view"), getVendorDetailForAdmin);
adminRouter.patch("/verify-statutory/:businessId", authorize("verification.approve"), verifyStatutory);
adminRouter.patch("/documents/:docId/review", authorize("documents.approve"), reviewDocument);

// 🏢 Module 2: Vendor Management
adminRouter.get("/vendors", authorize("vendors.view"), getAllVendors);

// 📬 Module 3: Centralized Buyer Enquiries & RFQ Leads Desk (Super Admin)
adminRouter.get("/enquiries", authorize("verification.view"), getAdminEnquiries);
adminRouter.patch("/enquiries/:id/status", authorize("verification.approve"), updateAdminEnquiryStatus);
adminRouter.post("/enquiries/:id/reply", authorize("verification.approve"), replyAdminEnquiry);

export default adminRouter;
