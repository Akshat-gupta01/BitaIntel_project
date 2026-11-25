import { Router } from "express";
import {
  getVerificationQueue,
  getAllVendors,
  getVendorDetailForAdmin,
  verifyStatutory,
  reviewDocument,
  getAuditLogs,
} from "../controllers/admin.controller.js";
import {
  getAdminEnquiries,
  updateAdminEnquiryStatus,
  replyAdminEnquiry,
} from "../controllers/enquiry.controller.js";
import {
  getAdminComplaints,
  updateAdminComplaint,
} from "../controllers/complaint.controller.js";
import { validateComplaint, updateComplaintSchema } from "../Validations/complaint.validation.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize, requireRole } from "../middlewares/rbac.middleware.js";

const adminRouter = Router();

// Suraksha (Security): Sirf authenticated administrative accounts hi access kar sakte hain. Vendors are strictly blocked.
adminRouter.use(authenticate);
adminRouter.use(requireRole("super_admin", "admin", "verification_officer", "quality_auditor", "support_team"));

// 📁 Module 1: Verification & Audit
adminRouter.get("/verification-queue", authorize("verification.view"), getVerificationQueue);
adminRouter.get("/vendors/:businessId", authorize("verification.view"), getVendorDetailForAdmin);
adminRouter.patch("/verify-statutory/:businessId", authorize("verification.approve"), verifyStatutory);
adminRouter.patch("/documents/:docId/review", authorize("documents.approve"), reviewDocument);

// 🏢 Module 2: Vendor Management
adminRouter.get("/vendors", authorize("vendors.view"), getAllVendors);

// 📬 Module 3: Centralized Buyer Enquiries & RFQ Leads Desk (Super Admin)
adminRouter.get("/enquiries", authorize("enquiries.view"), getAdminEnquiries);
adminRouter.patch("/enquiries/:id/status", authorize("enquiries.status"), updateAdminEnquiryStatus);
adminRouter.post("/enquiries/:id/reply", authorize("enquiries.respond"), replyAdminEnquiry);

// ⚖️ Module 4: Compliance & Buyer Complaints Desk
adminRouter.get("/complaints", authorize("complaints.view"), getAdminComplaints);
adminRouter.patch("/complaints/:id", authorize("complaints.edit"), validateComplaint(updateComplaintSchema), updateAdminComplaint);

// 📜 Module 5: Compliance Audit Trail & Logs
adminRouter.get("/audit-logs", authorize("audit_logs.view"), getAuditLogs);

export default adminRouter;
