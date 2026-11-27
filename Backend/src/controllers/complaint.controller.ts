import type { Request, Response } from "express";
import { Op } from "sequelize";
import { BusinessEntity, Complaint } from "../models/index.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { parsePagination, buildPaginationMeta } from "../utils/pagination.js";
import { recordAuditLog } from "../services/audit.service.js";

const ADMIN_ROLES = new Set([
  "super_admin",
  "admin",
  "verification_officer",
  "quality_auditor",
  "support_team",
]);

/**
 * 1. POST /api/v1/complaints
 * Authenticated users (buyers/vendors/admins) can file a complaint against a vendor business.
 * Self-complaints against a user's own business are blocked (except platform admins).
 */
export async function submitComplaint(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return sendError(res, "Please sign in to file a complaint", 401, "ERR_UNAUTHORIZED");
    }

    const {
      businessId,
      businessSlug,
      category,
      severity,
      subject,
      description,
      evidenceUrl,
    } = req.body;

    const targetIdentifier = businessSlug || businessId;
    let targetBusiness = null;
    const isNumeric =
      typeof targetIdentifier === "number" ||
      /^\d+$/.test(String(targetIdentifier || "").trim());

    if (isNumeric) {
      targetBusiness = await BusinessEntity.findByPk(Number(targetIdentifier));
    }
    if (!targetBusiness) {
      const searchKey = String(targetIdentifier || "").trim();
      targetBusiness = await BusinessEntity.findOne({
        where: {
          [Op.or]: [{ slug: searchKey }, { name: searchKey }, { legalName: searchKey }],
        },
      });
    }

    if (!targetBusiness) {
      return sendError(res, "Target business entity not found", 404, "ERR_BUSINESS_NOT_FOUND");
    }

    // Block self-complaints for non-admin accounts
    if (!ADMIN_ROLES.has(user.role) && targetBusiness.ownerUserId === user.id) {
      return sendError(
        res,
        "You cannot file a complaint against your own registered business.",
        403,
        "ERR_SELF_COMPLAINT_FORBIDDEN"
      );
    }

    const complaintNumber = `CMP-${Date.now().toString().slice(-3)}${Math.floor(100 + Math.random() * 900)}`;

    const complaint = await Complaint.create({
      complaintNumber,
      businessId: targetBusiness.id,
      complainantUserId: user.id,
      complainantName: user.fullName || "Registered User",
      complainantEmail: user.email,
      complainantCompany: user.companyName || null,
      category: category || "OTHER",
      severity: severity || "MEDIUM",
      subject: subject.trim(),
      description: description.trim(),
      evidenceUrl: evidenceUrl || null,
      status: "OPEN",
    });

    return sendSuccess(
      res,
      {
        message: "Complaint registered and routed to BITAINTEL Compliance Desk.",
        complaint,
      },
      201
    );
  } catch (error: unknown) {
    console.error("Error submitting complaint:", error);
    const msg = error instanceof Error ? error.message : "Failed to submit complaint";
    return sendError(res, msg, 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 2. GET /api/v1/admin/complaints
 * Admin / Compliance team lists all complaints across the platform.
 */
export async function getAdminComplaints(req: Request, res: Response) {
  try {
    const { page, limit, offset, hasExplicitPagination } = parsePagination(req, {
      limit: 10,
      maxLimit: 200,
    });

    const queryOptions = {
      include: [
        {
          model: BusinessEntity,
          as: "business",
          attributes: ["id", "name", "legalName", "slug", "score", "badge"],
        },
      ],
      order: [["createdAt", "DESC"]] as [string, string][],
    };

    const result = hasExplicitPagination
      ? await Complaint.findAndCountAll({
          ...queryOptions,
          distinct: true,
          col: "id",
          limit,
          offset,
        })
      : {
          rows: await Complaint.findAll(queryOptions),
          count: 0,
        };

    const complaints = result.rows;
    const totalCount = hasExplicitPagination ? result.count : complaints.length;

    return sendSuccess(res, {
      totalCount,
      complaints,
      pagination: hasExplicitPagination
        ? buildPaginationMeta(totalCount, page, limit)
        : buildPaginationMeta(totalCount, 1, totalCount || limit),
    });
  } catch (error: unknown) {
    console.error("Error fetching admin complaints:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch complaints";
    return sendError(res, msg, 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 3. PATCH /api/v1/admin/complaints/:id
 * Admin updates complaint status / resolution notes and recalculates vendor trust score.
 */
export async function updateAdminComplaint(req: Request, res: Response) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : String(req.params.id || "");
    const { status, adminNotes } = req.body;

    let complaint = null;
    if (/^\d+$/.test(id)) {
      complaint = await Complaint.findByPk(Number(id));
    }
    if (!complaint) {
      complaint = await Complaint.findOne({ where: { complaintNumber: id } });
    }

    if (!complaint) {
      return sendError(res, "Complaint record not found", 404, "ERR_COMPLAINT_NOT_FOUND");
    }

    complaint.status = status;
    if (adminNotes !== undefined) {
      complaint.adminNotes = adminNotes || null;
    }
    if (status === "RESOLVED" || status === "DISMISSED") {
      complaint.resolvedBy = req.user?.id || null;
      complaint.resolvedAt = new Date();
    } else {
      complaint.resolvedBy = null;
      complaint.resolvedAt = null;
    }

    await complaint.save();

    await recordAuditLog({
      req,
      action: "UPDATE_COMPLAINT",
      targetType: "COMPLAINT",
      targetId: complaint.complaintNumber,
      summary: `Complaint ${complaint.complaintNumber} updated to ${status}.${adminNotes ? ` Notes: ${adminNotes}` : ""}`,
      metadata: { complaintId: complaint.id, businessId: complaint.businessId, status },
    });

    return sendSuccess(res, {
      message: `Complaint ${complaint.complaintNumber} updated to ${status}`,
      complaint,
    });
  } catch (error: unknown) {
    console.error("Error updating complaint:", error);
    const msg = error instanceof Error ? error.message : "Failed to update complaint";
    return sendError(res, msg, 500, "ERR_INTERNAL_SERVER");
  }
}
