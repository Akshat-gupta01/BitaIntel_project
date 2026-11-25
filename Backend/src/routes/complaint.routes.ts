import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";
import { submitComplaint } from "../controllers/complaint.controller.js";
import { validateComplaint, createComplaintSchema } from "../Validations/complaint.validation.js";

const complaintRouter = Router();

// Authenticated users with complaints.create permission (buyers, vendors, admins) can file complaints
complaintRouter.post("/", authenticate, authorize("complaints.create"), validateComplaint(createComplaintSchema), submitComplaint);

export default complaintRouter;
