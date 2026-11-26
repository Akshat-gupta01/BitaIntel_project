import { Router } from "express";
import {
  getContactInquiries,
  submitContact,
  updateContactStatus,
} from "../controllers/contact.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";

const contactRouter = Router();

// Public contact form endpoint (POST /api/v1/contact)
contactRouter.post("/", submitContact);

// Admin / Support Desk view & status updates of contact tickets
contactRouter.get(
  "/",
  authenticate,
  requireRole("super_admin", "admin", "support_team"),
  getContactInquiries
);
contactRouter.patch(
  "/:id/status",
  authenticate,
  requireRole("super_admin", "admin", "support_team"),
  updateContactStatus
);

export default contactRouter;
