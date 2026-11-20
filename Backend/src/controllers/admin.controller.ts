import { Request, Response } from "express";
import { Op } from "sequelize";
import {
  BusinessEntity,
  StatutoryIdentifier,
  User,
  BusinessFacility,
  BusinessPersonnel,
  DocumentVault,
  BusinessProduct,
  Certification,
  BusinessDepartmentContact,
  BusinessCommercialTerms,
  BusinessTradeLogistics,
  BusinessBankingDetails,
  BusinessComplianceDeclarations,
  BusinessManufacturingCapability,
  BusinessServiceCapability,
  BusinessOperatingProfile,
  VendorBusinessType,
  VendorCategory,
  VendorSubcategory,
} from "../models/index.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import {
  calculateDimensions,
  calculateFinalScore,
  getGradeAndRisk,
  calculateVerificationLevel,
  computeAndSaveBusinessTrustScore,
  type VendorAuditData,
} from "../services/scoring.service.js";

// ─── Helper: Score se Badge nikaalna (Docs Section 2 Matrix ke mutabiq)
function getBadge(score: number): "Platinum" | "Gold" | "Silver" | "Verified" | "Under Review" {
  if (score >= 90) return "Platinum";
  if (score >= 75) return "Gold";
  if (score >= 60) return "Silver";
  if (score >= 40) return "Verified";
  return "Under Review";
}

/**
 * 1. GET /api/v1/admin/verification-queue
 * Admin ko un sabhi companies ki list deta hai jinka verification pending hai.
 */
export async function getVerificationQueue(req: Request, res: Response) {
  try {
    const queue = await BusinessEntity.findAll({
      include: [
        {
          model: StatutoryIdentifier,
          as: "statutory",
        },
        {
          model: User,
          as: "owner",
          attributes: ["id", "fullName", "email", "mobile", "designation"],
        },
        {
          model: BusinessFacility,
          as: "facilities",
        },
        {
          model: BusinessPersonnel,
          as: "keyPersonnel",
        },
        {
          model: DocumentVault,
          as: "documents",
        },
        {
          model: BusinessProduct,
          as: "products",
        },
        {
          model: Certification,
          as: "certifications",
        },
        {
          model: BusinessBankingDetails,
          as: "bankingDetails",
        },
        {
          model: BusinessCommercialTerms,
          as: "commercialTerms",
        },
        {
          model: BusinessManufacturingCapability,
          as: "manufacturingCapability",
        },
      ],
      where: {
        [Op.or]: [
          { verificationStatus: { [Op.in]: ["pending_verification", "Pending", "Under Review", "registered"] } },
          { "$statutory.gstnStatus$": "PENDING" },
          { verified: false },
        ],
      },
      order: [["updatedAt", "DESC"]],
    });

    return sendSuccess(res, {
      total: queue.length,
      queue,
    });
  } catch (error) {
    console.error("Get Verification Queue Error:", error);
    return sendError(res, "Failed to fetch verification queue", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 2. GET /api/v1/admin/vendors
 * All vendors directory for admin
 */
export async function getAllVendors(req: Request, res: Response) {
  try {
    const vendors = await BusinessEntity.findAll({
      include: [
        { model: StatutoryIdentifier, as: "statutory" },
        { model: User, as: "owner", attributes: ["id", "fullName", "email", "mobile", "designation"] },
        { model: BusinessBankingDetails, as: "bankingDetails" },
        { model: Certification, as: "certifications" },
        { model: BusinessProduct, as: "products" },
        { model: DocumentVault, as: "documents" },
        { model: BusinessFacility, as: "facilities" },
        { model: BusinessManufacturingCapability, as: "manufacturingCapability" },
      ],
      order: [["updatedAt", "DESC"]],
    });

    // Auto-refresh legacy or uncalculated verified vendors (e.g. propack with initial 40.00 score or 'Under Review' badge)
    for (const v of vendors) {
      if (v.verified && (Number(v.score) <= 40 || v.badge === "Under Review")) {
        try {
          const rescore = await computeAndSaveBusinessTrustScore(v.id);
          if (rescore) {
            v.score = rescore.score;
            v.level = rescore.level;
            v.badge = rescore.badge;
          }
        } catch {}
      }
    }

    return sendSuccess(res, {
      total: vendors.length,
      vendors,
    });
  } catch (error) {
    console.error("Get All Vendors Error:", error);
    return sendError(res, "Failed to fetch vendors", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 3. GET /api/v1/admin/vendors/:businessId
 * Detailed single vendor audit dossier
 */
export async function getVendorDetailForAdmin(req: Request, res: Response) {
  try {
    const { businessId } = req.params;
    const bId = Number(businessId);
    if (!bId || isNaN(bId)) {
      return sendError(res, "Invalid businessId parameter", 400, "ERR_INVALID_ID");
    }

    const business = await BusinessEntity.findByPk(bId, {
      include: [
        { model: StatutoryIdentifier, as: "statutory" },
        { model: User, as: "owner", attributes: ["id", "fullName", "email", "mobile", "designation"] },
        { model: BusinessFacility, as: "facilities" },
        { model: BusinessPersonnel, as: "keyPersonnel" },
        { model: DocumentVault, as: "documents" },
        { model: BusinessProduct, as: "products" },
        { model: Certification, as: "certifications" },
        { model: BusinessDepartmentContact, as: "departmentContacts" },
        { model: BusinessCommercialTerms, as: "commercialTerms" },
        { model: BusinessTradeLogistics, as: "tradeLogistics" },
        { model: BusinessBankingDetails, as: "bankingDetails" },
        { model: BusinessComplianceDeclarations, as: "complianceDeclarations" },
        { model: BusinessManufacturingCapability, as: "manufacturingCapability" },
        { model: BusinessServiceCapability, as: "serviceCapability" },
        { model: BusinessOperatingProfile, as: "operatingProfile" },
        { model: VendorBusinessType, as: "vendorBusinessTypes" },
        { model: VendorCategory, as: "vendorCategories" },
        { model: VendorSubcategory, as: "vendorSubcategories" },
      ],
    });

    if (!business) {
      return sendError(res, "Vendor business not found", 404, "ERR_NOT_FOUND");
    }

    if (Number(business.score) === 0) {
      await computeAndSaveBusinessTrustScore(business.id);
      await business.reload();
    }

    return sendSuccess(res, { business });
  } catch (error) {
    console.error("Get Vendor Detail Error:", error);
    return sendError(res, "Failed to fetch vendor detail", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 2. PATCH /api/v1/admin/verify-statutory/:businessId
 * Admin kisi vendor ke GSTIN ko APPROVE ya REJECT karta hai.
 * URL me businessId aayegi: PATCH /api/v1/admin/verify-statutory/1
 */
export async function verifyStatutory(req: Request, res: Response) {
  try {
    // ── businessId URL parameters se lo ─────────────────────────────────────
    const { businessId: rawBusinessId } = req.params;

    if (!rawBusinessId) {
      return sendError(
        res,
        "Business ID is required in URL parameter (e.g. /verify-statutory/1).",
        400,
        "ERR_MISSING_BUSINESS_ID"
      );
    }

    const businessId = Number(rawBusinessId);
    if (isNaN(businessId) || businessId <= 0) {
      return sendError(res, "Invalid business ID provided in URL.", 400, "ERR_INVALID_BUSINESS_ID");
    }

    // ── Decision check karo (APPROVED, REJECTED, ACTION_REQUIRED) ───────────
    const { decision, notes, tierLevel, assignedBadge } = req.body;
    const normalizedDecision = decision?.toString().toUpperCase();

    if (!["APPROVED", "REJECTED", "ACTION_REQUIRED"].includes(normalizedDecision)) {
      return sendError(
        res,
        "Decision must be either 'APPROVED', 'REJECTED', or 'ACTION_REQUIRED'.",
        400,
        "ERR_INVALID_DECISION"
      );
    }

    // ── 1. Company dhoondo ──────────────────────────────────────────────────
    const business = await BusinessEntity.findByPk(businessId);
    if (!business) {
      return sendError(res, `Business with ID ${businessId} not found.`, 404, "ERR_NOT_FOUND");
    }

    // ── 2. Us company ke Statutory IDs dhoondo ──────────────────────────────
    const statutory = await StatutoryIdentifier.findOne({
      where: { businessId: business.id },
    });

    if (!statutory || !statutory.gstin) {
      return sendError(
        res,
        "No GSTIN found for this business. The vendor must submit a GSTIN before it can be verified.",
        400,
        "ERR_NO_GSTIN_FOUND"
      );
    }

    // ── 3. Agar Admin ne APPROVE kiya ───────────────────────────────────────
    if (normalizedDecision === "APPROVED") {
      // A. Statutory status ACTIVE mark karo
      statutory.gstnStatus = "ACTIVE";
      statutory.lastSyncedAt = new Date();
      await statutory.save();

      // B. Mark Business as Verified
      business.verified = true;
      business.verificationStatus = "Verified";
      business.lastAudited = new Date();
      await business.save();

      // C. Unified Scoring Engine: Calculate full score across all 7 dimensions
      const computed = await computeAndSaveBusinessTrustScore(business.id);
      const newScore = computed?.score || 78;
      const newLevel = tierLevel ? Number(tierLevel) : (computed?.level || 2);
      const newBadge =
        assignedBadge && assignedBadge !== "Under Review"
          ? assignedBadge
          : (computed?.badge || getBadge(newScore));
      const { grade, risk } = getGradeAndRisk(newScore);

      business.score = newScore;
      business.level = newLevel;
      business.badge = newBadge;
      await business.save();

      return sendSuccess(res, {
        message: "GSTIN verified successfully by Admin. Trust Score and Verification Level updated!",
        businessId: business.id,
        companyName: business.name,
        gstin: statutory.gstin,
        pan: statutory.pan,
        gstnStatus: statutory.gstnStatus,
        updatedTrustScore: newScore,
        updatedLevel: newLevel,
        badge: newBadge,
        grade,
        riskLevel: risk,
        notes: notes || "Approved by Admin after verification.",
      });
    }

    // ── 4. Agar Admin ne Clarification / Action Required maanga ──────────────
    if (normalizedDecision === "ACTION_REQUIRED") {
      business.verificationStatus = "action_required";
      await business.save();

      return sendSuccess(res, {
        message: "Clarification requested. Vendor alerted with action required instructions.",
        businessId: business.id,
        companyName: business.name,
        gstin: statutory.gstin,
        verificationStatus: "action_required",
        notes: notes || "Auditor requested additional documentation or clarification.",
      });
    }

    // ── 5. Agar Admin ne REJECT kiya ────────────────────────────────────────
    statutory.gstnStatus = "INVALID";
    await statutory.save();

    business.verificationStatus = "Rejected";
    await business.save();

    return sendSuccess(res, {
      message: "GSTIN verification rejected by Admin.",
      businessId: business.id,
      companyName: business.name,
      gstin: statutory.gstin,
      gstnStatus: "INVALID",
      notes: notes || "Rejected due to mismatch with official records.",
    });
  } catch (error) {
    console.error("Verify Statutory Error:", error);
    return sendError(res, "Failed to verify statutory details", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 4. PATCH /api/v1/admin/documents/:docId/review
 * Review individual document in vault (VERIFIED, REJECTED, ACTION_REQUIRED)
 */
export async function reviewDocument(req: Request, res: Response) {
  try {
    const { docId } = req.params;
    const documentId = Number(docId);
    if (!documentId || isNaN(documentId)) {
      return sendError(res, "Invalid document ID", 400, "ERR_INVALID_ID");
    }

    const { status, rejectionReason, auditorNotes } = req.body;
    const normalizedStatus = status?.toString().toUpperCase();

    if (!["VERIFIED", "REJECTED", "ACTION_REQUIRED", "PENDING"].includes(normalizedStatus)) {
      return sendError(res, "Invalid document status", 400, "ERR_INVALID_STATUS");
    }

    const doc = await DocumentVault.findByPk(documentId);
    if (!doc) {
      return sendError(res, "Document not found in vault", 404, "ERR_NOT_FOUND");
    }

    doc.status = normalizedStatus as any;
    doc.rejectionReason = rejectionReason || auditorNotes || null;
    doc.verifierName = req.user?.fullName || "Verification Auditor";
    doc.verifiedBy = req.user?.id || null;
    doc.verifiedAt = new Date();
    await doc.save();

    return sendSuccess(res, {
      message: `Document status updated to ${normalizedStatus}`,
      document: doc,
    });
  } catch (error) {
    console.error("Review Document Error:", error);
    return sendError(res, "Failed to review document", 500, "ERR_INTERNAL_SERVER");
  }
}
