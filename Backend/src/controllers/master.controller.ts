import { Request, Response } from "express";
import { Op } from "sequelize";
import {
  BusinessType,
  Category,
  Subcategory,
  Roles,
  Industry,
  BusinessActivity,
  Currency,
  BusinessEntity,
  StatutoryIdentifier,
  BusinessProduct,
  Certification,
  BusinessFacility,
  BusinessCommercialTerms,
  BusinessTradeLogistics,
  BusinessOperatingProfile,
  VendorBusinessType,
  DocumentVault,
  BusinessBankingDetails,
  User,
  Complaint,
} from "../models/index.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { getInitials } from "../utils/slug.js";
import {
  buildVendorAuditData,
  calculateDimensions,
  calculateFinalScore,
  formatScoreBreakdown,
  getBadge,
  getGradeAndRisk,
} from "../services/scoring.service.js";

type PublicViewerTier = "visitor" | "unverified" | "pending_approval" | "approved_business" | "admin";

async function resolveViewerAccess(
  req: Request,
  targetOwnerUserId?: number | null
): Promise<{
  isAuthenticated: boolean;
  isVerifiedB2B: boolean;
  isOwnerOrAdmin: boolean;
  viewerTier: PublicViewerTier;
}> {
  if (!req.user) {
    return {
      isAuthenticated: false,
      isVerifiedB2B: false,
      isOwnerOrAdmin: false,
      viewerTier: "visitor",
    };
  }

  const userRole = String(req.user.role || "").toLowerCase();
  if (["admin", "super_admin", "verification_officer", "quality_auditor"].includes(userRole)) {
    return {
      isAuthenticated: true,
      isVerifiedB2B: true,
      isOwnerOrAdmin: true,
      viewerTier: "admin",
    };
  }

  if (targetOwnerUserId && Number(req.user.id) === Number(targetOwnerUserId)) {
    return {
      isAuthenticated: true,
      isVerifiedB2B: true,
      isOwnerOrAdmin: true,
      viewerTier: "approved_business",
    };
  }

  const viewerBiz = await BusinessEntity.findOne({
    where: { ownerUserId: req.user.id },
    attributes: ["verified", "verificationStatus"],
  });

  const st = String(viewerBiz?.verificationStatus || "").trim().toLowerCase();
  if (viewerBiz?.verified === true || ["verified", "approved", "bitaintel_verified"].includes(st)) {
    return {
      isAuthenticated: true,
      isVerifiedB2B: true,
      isOwnerOrAdmin: false,
      viewerTier: "approved_business",
    };
  }

  if (st.includes("pending") || st.includes("review")) {
    return {
      isAuthenticated: true,
      isVerifiedB2B: false,
      isOwnerOrAdmin: false,
      viewerTier: "pending_approval",
    };
  }

  return {
    isAuthenticated: true,
    isVerifiedB2B: false,
    isOwnerOrAdmin: false,
    viewerTier: "unverified",
  };
}

async function getOpenComplaintCountMap(businessIds: number[]): Promise<Map<number, number>> {
  const map = new Map<number, number>();
  if (businessIds.length === 0) return map;

  const rows = await Complaint.findAll({
    attributes: ["businessId"],
    where: {
      businessId: { [Op.in]: businessIds },
      status: { [Op.in]: ["OPEN", "UNDER_INVESTIGATION"] },
    },
    raw: true,
  });

  for (const row of rows as Array<{ businessId: number }>) {
    const bId = Number(row.businessId);
    map.set(bId, (map.get(bId) || 0) + 1);
  }
  return map;
}

function resolvePublicLocation(bJson: any): {
  location: string;
  city: string;
  state: string;
  country: string;
} {
  const primaryFacility = Array.isArray(bJson.facilities) && bJson.facilities.length > 0 ? bJson.facilities[0] : null;
  const city = String(bJson.city || primaryFacility?.city || "").trim();
  const state = String(bJson.state || primaryFacility?.state || "").trim();
  const country = String(bJson.country || primaryFacility?.country || "India").trim();

  const rawParts = [city, state, country].filter(Boolean);
  const uniqueParts = rawParts.filter(
    (part, idx) => rawParts.findIndex((p) => p.toLowerCase() === part.toLowerCase()) === idx
  );
  const fallbackLocation = String(bJson.location || "").trim();

  return {
    location: uniqueParts.join(", ") || fallbackLocation || "India",
    city: city || "Mumbai",
    state: state || "Maharashtra",
    country: country || "India",
  };
}

function buildPublicBusinessSnapshot(
  model: BusinessEntity,
  json: any,
  openComplaintsCount: number
) {
  const productRecords: any[] = Array.isArray(json.products) ? json.products : [];
  const prods = productRecords.map((p: any) => p.name || p.title).filter(Boolean);
  const certRecords: any[] = Array.isArray(json.certifications) ? json.certifications : [];
  const certs = Array.from(
    new Set(
      certRecords
        .map((c: any) => c.certificateType || c.name || c.certificateName)
        .filter(Boolean)
    )
  );

  const auditData = buildVendorAuditData({
    business: model,
    statutory: json.statutory || null,
    owner: json.owner || null,
    vaultDocs: Array.isArray(json.documents) ? json.documents : [],
    certs: certRecords,
    banking: json.bankingDetails || null,
  });
  auditData.openComplaintsCount = openComplaintsCount;
  const dims = calculateDimensions(auditData);
  const computedScore = calculateFinalScore(dims);

  const rawScore = Number(json.score);
  const score = !isNaN(rawScore) && rawScore > 0 ? Math.round(rawScore) : computedScore;
  const level = Number(json.level) || (score >= 90 ? 4 : score >= 75 ? 3 : score >= 50 ? 2 : 1);
  const { grade, risk } = getGradeAndRisk(score);

  const identityPts = Math.round((dims.identityScore / 100) * 10);
  const docPts = Math.round(((dims.taxScore * 0.5 + dims.certScore * 0.5) / 100) * 20);
  const addrPts =
    (Array.isArray(json.facilities) && json.facilities.length > 0) || json.registeredAddress
      ? 5
      : 3;
  const profilePts = Math.round((dims.profileScore / 100) * 15);
  const contactPts = json.owner?.email ? 5 : 3;

  const isVerified = Boolean(json.verified === true);
  const verificationStatus =
    json.verificationStatus || (isVerified ? "verified" : "registered");
  const badge = json.badge && json.badge !== "Under Review" ? json.badge : getBadge(score);

  return {
    productRecords,
    prods,
    certs,
    score,
    level,
    grade,
    riskLevel: risk,
    scoreBreakdown: formatScoreBreakdown(dims),
    identity: `${identityPts}/10`,
    documents: `${docPts}/20`,
    contact: `${contactPts}/5`,
    address: `${addrPts}/5`,
    profile: profilePts,
    isVerified,
    verificationStatus,
    badge,
  };
}

// ─── 1. GET /api/v1/master/business-types ───────────────────────────────────
// Saare 14 Business Types return karta hai (Manufacturer, OEM, Trader, etc.)
export async function getBusinessTypes(req: Request, res: Response) {
  try {
    const businessTypes = await BusinessType.findAll({
      attributes: ["id", "code", "name"],
      order: [["id", "ASC"]],
    });

    return sendSuccess(res, { businessTypes });
  } catch (error) {
    console.error("Get Business Types Error:", error);
    return sendError(res, "Failed to fetch business types", 500, "ERR_INTERNAL_SERVER");
  }
}

// ─── 2. GET /api/v1/master/categories ───────────────────────────────────────
// Saari 20 Main Industry Categories return karta hai
// Optional query: ?includeSubcategories=true daalne par subcategories bhi saath me aayengi
export async function getCategories(req: Request, res: Response) {
  try {
    const includeSubs = req.query.includeSubcategories === "true";

    const categories = await Category.findAll({
      attributes: ["id", "code", "name"],
      order: [["id", "ASC"]],
      include: includeSubs
        ? [
            {
              model: Subcategory,
              as: "subcategories",
              attributes: ["id", "code", "name", "categoryCode"],
            },
          ]
        : [],
    });

    return sendSuccess(res, { categories });
  } catch (error) {
    console.error("Get Categories Error:", error);
    return sendError(res, "Failed to fetch categories", 500, "ERR_INTERNAL_SERVER");
  }
}

// ─── 3. GET /api/v1/master/subcategories ─────────────────────────────────────
// Subcategories return karta hai
// Optional query: ?categoryCode=CAT001 daalne par sirf us category ki subcategories milengi
export async function getSubcategories(req: Request, res: Response) {
  try {
    const { categoryCode } = req.query;

    const whereClause: Record<string, unknown> = {};
    if (categoryCode && typeof categoryCode === "string") {
      whereClause.categoryCode = categoryCode.toUpperCase();
    }

    const subcategories = await Subcategory.findAll({
      where: whereClause,
      attributes: ["id", "code", "name", "categoryCode"],
      order: [["id", "ASC"]],
    });

    return sendSuccess(res, { subcategories });
  } catch (error) {
    console.error("Get Subcategories Error:", error);
    return sendError(res, "Failed to fetch subcategories", 500, "ERR_INTERNAL_SERVER");
  }
}

// ─── 4. GET /api/v1/master/roles ─────────────────────────────────────────────
// System ke saare Roles return karta hai (super_admin, vendor, etc.)
export async function getRoles(req: Request, res: Response) {
  try {
    const roles = await Roles.findAll({
      attributes: ["id", "code", "name"],
      order: [["id", "ASC"]],
    });

    return sendSuccess(res, { roles });
  } catch (error) {
    console.error("Get Roles Error:", error);
    return sendError(res, "Failed to fetch roles", 500, "ERR_INTERNAL_SERVER");
  }
}

// ─── 5. GET /api/v1/master/industries ─────────────────────────────────────────
// Saari 10 Main Industries return karta hai (Manufacturing, IT Services, etc.)
export async function getIndustries(req: Request, res: Response) {
  try {
    const industries = await Industry.findAll({
      attributes: ["id", "code", "name"],
      order: [["id", "ASC"]],
    });

    return sendSuccess(res, { industries });
  } catch (error) {
    console.error("Get Industries Error:", error);
    return sendError(res, "Failed to fetch industries", 500, "ERR_INTERNAL_SERVER");
  }
}

// ─── 6. GET /api/v1/master/business-activities ───────────────────────────────
// Saari 8 Business Activities return karta hai (Manufacturing, Trading, Export, etc.)
export async function getBusinessActivities(req: Request, res: Response) {
  try {
    const businessActivities = await BusinessActivity.findAll({
      attributes: ["id", "code", "name"],
      order: [["id", "ASC"]],
    });

    return sendSuccess(res, { businessActivities });
  } catch (error) {
    console.error("Get Business Activities Error:", error);
    return sendError(res, "Failed to fetch business activities", 500, "ERR_INTERNAL_SERVER");
  }
}

// ─── 7. GET /api/v1/master/currencies ────────────────────────────────────────
// International & Domestic Trade Currencies return karta hai (INR, USD, EUR, AED, SAR, etc.)
// isCommon=true wale currencies pehle aate hain taaki dropdown me top trade currencies upar dikhein
export async function getCurrencies(req: Request, res: Response) {
  try {
    const currencies = await Currency.findAll({
      attributes: ["id", "code", "name", "symbol", "country", "isCommon"],
      order: [
        ["isCommon", "DESC"],
        ["id", "ASC"],
      ],
    });

    return sendSuccess(res, {
      total: currencies.length,
      currencies,
    });
  } catch (error) {
    console.error("Get Currencies Error:", error);
    return sendError(res, "Failed to fetch currencies", 500, "ERR_INTERNAL_SERVER");
  }
}

// ─── 8. GET /api/v1/master/directory ─────────────────────────────────────────
// Public directory endpoint returning live registered businesses with optional search & filters.
// Searches across company name (name/legalName/tradeName), GSTIN, CIN, product name, city/state/location, and industry.
export async function getPublicDirectory(req: Request, res: Response) {
  try {
    const rawSearch = String(req.query.q || req.query.search || "").trim();
    const rawIndustry = String(req.query.industry || "").trim();
    const rawLevel = req.query.level !== undefined ? Number(req.query.level) : NaN;
    const rawMinScore = req.query.minScore !== undefined ? Number(req.query.minScore) : NaN;
    const rawVerified = req.query.verified;
    const sortBy = String(req.query.sortBy || "score").trim().toLowerCase();
    const sortOrder = String(req.query.order || "").trim().toUpperCase() === "ASC" ? "ASC" : "DESC";

    const andConditions: any[] = [{ isPubliclyVisible: true }];

    if (rawSearch) {
      const likePattern = `%${rawSearch}%`;

      // Match GSTIN / CIN in statutory_identifiers and Product Name in business_products without extra columns
      const [statutoryMatches, productMatches] = await Promise.all([
        StatutoryIdentifier.findAll({
          attributes: ["businessId"],
          where: {
            [Op.or]: [
              { gstin: { [Op.like]: likePattern } },
              { cin: { [Op.like]: likePattern } },
            ],
          },
          raw: true,
        }),
        BusinessProduct.findAll({
          attributes: ["businessId"],
          where: {
            name: { [Op.like]: likePattern },
          },
          raw: true,
        }),
      ]);

      const matchedBusinessIds = Array.from(
        new Set([
          ...statutoryMatches.map((m: any) => Number(m.businessId)).filter(Boolean),
          ...productMatches.map((m: any) => Number(m.businessId)).filter(Boolean),
        ])
      );

      andConditions.push({
        [Op.or]: [
          { name: { [Op.like]: likePattern } },
          { legalName: { [Op.like]: likePattern } },
          { tradeName: { [Op.like]: likePattern } },
          { city: { [Op.like]: likePattern } },
          { state: { [Op.like]: likePattern } },
          { location: { [Op.like]: likePattern } },
          { industry: { [Op.like]: likePattern } },
          ...(matchedBusinessIds.length > 0
            ? [{ id: { [Op.in]: matchedBusinessIds } }]
            : []),
        ],
      });
    }

    if (rawIndustry && rawIndustry.toLowerCase() !== "all industries" && rawIndustry.toLowerCase() !== "all") {
      andConditions.push({ industry: rawIndustry });
    }

    if (!isNaN(rawLevel) && rawLevel > 0) {
      andConditions.push({ level: { [Op.gte]: rawLevel } });
    }

    if (!isNaN(rawMinScore) && rawMinScore > 0) {
      andConditions.push({ score: { [Op.gte]: rawMinScore } });
    }

    if (rawVerified === "true") {
      andConditions.push({ verified: true });
    }

    const orderClause: any[] =
      sortBy === "name"
        ? [["name", sortOrder === "DESC" ? "ASC" : sortOrder], ["updatedAt", "DESC"]]
        : sortBy === "tenure"
        ? [["age", sortOrder], ["score", "DESC"]]
        : [["score", sortOrder], ["updatedAt", "DESC"]];

    const businesses = await BusinessEntity.findAll({
      where: { [Op.and]: andConditions },
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "fullName", "email", "mobile", "isEmailVerified", "isMobileVerified"],
        },
        { model: StatutoryIdentifier, as: "statutory" },
        { model: BusinessProduct, as: "products", separate: true },
        { model: Certification, as: "certifications", separate: true },
        { model: BusinessFacility, as: "facilities", separate: true },
        { model: DocumentVault, as: "documents", separate: true },
        { model: BusinessBankingDetails, as: "bankingDetails" },
      ],
      order: orderClause,
    });

    const complaintCountMap = await getOpenComplaintCountMap(businesses.map((b) => b.id));

    const formatted = businesses.map((b: BusinessEntity) => {
      const bJson: any = b.toJSON();
      const openComplaintsCount = complaintCountMap.get(Number(bJson.id)) || 0;
      const snap = buildPublicBusinessSnapshot(b, bJson, openComplaintsCount);
      const loc = resolvePublicLocation(bJson);

      return {
        id: bJson.slug || String(bJson.id),
        slug: bJson.slug,
        name: bJson.tradeName || bJson.name || bJson.legalName,
        legalName: bJson.legalName || bJson.name,
        industry: bJson.industry || "Manufacturing",
        location: loc.location,
        city: loc.city,
        state: loc.state,
        country: loc.country,
        level: snap.level,
        score: snap.score,
        grade: snap.grade,
        riskLevel: snap.riskLevel,
        age:
          bJson.age ||
          (bJson.yearEstablished
            ? Math.max(1, new Date().getFullYear() - Number(bJson.yearEstablished))
            : 5),
        summary: bJson.summary || "Verified enterprise active on BITAINTEL intelligence directory.",
        products: snap.prods,
        gstin: bJson.statutory?.gstin || "Pending GSTIN",
        cin: bJson.statutory?.cin || "—",
        isoCertified: snap.certs.length > 0 ? snap.certs.join(" & ") : "",
        identity: snap.identity,
        documents: snap.documents,
        contact: snap.contact,
        address: snap.address,
        profile: snap.profile,
        turnover: bJson.turnover || "₹1–5 crore",
        employees: bJson.employees || "10–50",
        verified: snap.isVerified,
        verificationStatus: snap.verificationStatus,
        openComplaintsCount,
        initials: bJson.initials || getInitials(bJson.name || bJson.legalName || "BE"),
        lastAudited: bJson.lastAudited
          ? new Date(bJson.lastAudited).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
          : "Recently Audited",
        badge: snap.badge,
        logoUrl: bJson.logoUrl || null,
        isPremiumSubscriber: snap.badge === "Platinum",
        subscriptionPlan: snap.badge === "Platinum" ? "Premium" : "Standard",
      };
    });

    return sendSuccess(res, { total: formatted.length, businesses: formatted });
  } catch (error) {
    console.error("Get Public Directory Error:", error);
    return sendError(res, "Failed to fetch directory businesses", 500, "ERR_INTERNAL_SERVER");
  }
}

// ─── 9. GET /api/v1/master/business/:slug ─────────────────────────────────────
// Public single business profile lookup for /demo/business/[slug]
// Enforces isPubliclyVisible (unless owner/admin) and role-gates commercial pricing + raw TDS/COA docs.
export async function getPublicBusinessDetail(req: Request, res: Response) {
  try {
    const slug = typeof req.params.slug === "string" ? req.params.slug : String(req.params.slug || "");
    if (!slug) {
      return sendError(res, "Business slug is required", 400, "ERR_VALIDATION");
    }

    const isNumericId = /^\d+$/.test(slug);
    const whereCondition = isNumericId
      ? { [Op.or]: [{ slug }, { id: Number(slug) }] }
      : { slug };

    const business = await BusinessEntity.findOne({
      where: whereCondition,
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "fullName", "email", "mobile", "isEmailVerified", "isMobileVerified"],
        },
        { model: StatutoryIdentifier, as: "statutory" },
        { model: BusinessProduct, as: "products", separate: true },
        { model: Certification, as: "certifications", separate: true },
        { model: BusinessFacility, as: "facilities", separate: true },
        { model: BusinessOperatingProfile, as: "operatingProfile" },
        { model: DocumentVault, as: "documents", separate: true },
        { model: BusinessBankingDetails, as: "bankingDetails" },
      ],
    });

    if (!business) {
      return sendError(res, "Business profile not found", 404, "ERR_NOT_FOUND");
    }

    const viewer = await resolveViewerAccess(req, business.ownerUserId);

    // Unlisted / hidden businesses must not be accessible via direct slug unless viewed by owner or admin
    if (!business.isPubliclyVisible && !viewer.isOwnerOrAdmin) {
      return sendError(res, "Business profile not found", 404, "ERR_NOT_FOUND");
    }

    const bJson: any = business.toJSON();
    const complaintCountMap = await getOpenComplaintCountMap([Number(bJson.id)]);
    const openComplaintsCount = complaintCountMap.get(Number(bJson.id)) || 0;
    const snap = buildPublicBusinessSnapshot(business, bJson, openComplaintsCount);
    const canViewB2B = viewer.isVerifiedB2B;

    const catalogProducts = snap.productRecords.map((p: any) => ({
      id: p.id ?? null,
      name: p.name || p.title || "Product",
      type: p.type === "Service" ? "Service" : "Product",
      categoryId: p.categoryId ?? null,
      subcategoryId: p.subcategoryId ?? null,
      brand: p.brand ?? null,
      description: p.description ?? null,
      specifications: p.specifications ?? null,
      grade: p.grade ?? null,
      standards: p.standards ?? null,
      hsnCode: p.hsnCode ?? null,
      countryOfOrigin: p.countryOfOrigin ?? "India",
      moq: p.moq ?? null,
      standardOrderQty: p.standardOrderQty ?? null,
      monthlyCapacity: p.monthlyCapacity ?? null,
      availableStock: p.availableStock ?? null,
      leadTimeDays: p.leadTimeDays ?? null,
      sampleAvailability: p.sampleAvailability ?? "Available Free",
      indicativePrice: canViewB2B ? p.indicativePrice ?? null : null,
      currency: p.currency ?? "INR",
      priceValidity: canViewB2B ? p.priceValidity ?? null : null,
      targetMarkets: p.targetMarkets ?? null,
      images: Array.isArray(p.images) ? p.images.filter((img: unknown) => typeof img === "string") : [],
      hasCatalogue: Boolean(p.catalogueDoc),
      hasTds: Boolean(p.technicalDataSheetDoc),
      hasCoa: Boolean(p.coaDoc),
      hasSds: Boolean(p.sdsDoc),
      catalogueDoc: canViewB2B ? p.catalogueDoc ?? null : null,
      technicalDataSheetDoc: canViewB2B ? p.technicalDataSheetDoc ?? null : null,
      coaDoc: canViewB2B ? p.coaDoc ?? null : null,
      sdsDoc: canViewB2B ? p.sdsDoc ?? null : null,
    }));

    const detailLoc = resolvePublicLocation(bJson);

    const formatted = {
      id: bJson.slug || String(bJson.id),
      slug: bJson.slug,
      name: bJson.tradeName || bJson.name || bJson.legalName,
      legalName: bJson.legalName || bJson.name,
      industry: bJson.industry || "Manufacturing",
      location: detailLoc.location,
      city: detailLoc.city,
      state: detailLoc.state,
      country: detailLoc.country,
      level: snap.level,
      score: snap.score,
      grade: snap.grade,
      riskLevel: snap.riskLevel,
      scoreBreakdown: snap.scoreBreakdown,
      age:
        bJson.age ||
        (bJson.yearEstablished
          ? Math.max(1, new Date().getFullYear() - Number(bJson.yearEstablished))
          : 5),
      summary: bJson.summary || "Verified enterprise active on BITAINTEL intelligence directory.",
      products: snap.prods,
      catalogProducts,
      gstin: bJson.statutory?.gstin || "Pending GSTIN",
      cin: bJson.statutory?.cin || "—",
      isoCertified: snap.certs.length > 0 ? snap.certs.join(" & ") : "",
      identity: snap.identity,
      documents: snap.documents,
      contact: snap.contact,
      address: snap.address,
      profile: snap.profile,
      turnover: canViewB2B
        ? bJson.operatingProfile?.annualTurnoverRange || bJson.turnover || "₹1–5 crore"
        : null,
      employees: canViewB2B
        ? bJson.operatingProfile?.totalWorkforce || bJson.employees || "10–50"
        : null,
      verified: snap.isVerified,
      verificationStatus: snap.verificationStatus,
      openComplaintsCount,
      facilitiesCount: Array.isArray(bJson.facilities) ? bJson.facilities.length : 0,
      viewerTier: viewer.viewerTier,
      canViewB2BDetails: canViewB2B,
      initials: bJson.initials || getInitials(bJson.name || bJson.legalName || "BE"),
      lastAudited: bJson.lastAudited
        ? new Date(bJson.lastAudited).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "Recently Audited",
      badge: snap.badge,
      logoUrl: bJson.logoUrl || null,
      isPremiumSubscriber: snap.badge === "Platinum",
      subscriptionPlan: snap.badge === "Platinum" ? "Premium" : "Standard",
    };

    return sendSuccess(res, { business: formatted });
  } catch (error) {
    console.error("Get Public Business Detail Error:", error);
    return sendError(res, "Failed to fetch business details", 500, "ERR_INTERNAL_SERVER");
  }
}

// ─── 10. GET /api/v1/master/compare?ids=slug1,slug2,... ──────────────────────
// Side-by-side comparison endpoint for 1 to 4 live DB business entities
export async function compareBusinesses(req: Request, res: Response) {
  try {
    const rawIds = String(req.query.ids || "").trim();
    if (!rawIds) {
      return sendSuccess(res, { total: 0, businesses: [] });
    }

    const requestedIds = Array.from(
      new Set(
        rawIds
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      )
    ).slice(0, 4);

    if (requestedIds.length === 0) {
      return sendSuccess(res, { total: 0, businesses: [] });
    }

    const numericIds = requestedIds
      .filter((val) => /^\d+$/.test(val))
      .map((val) => Number(val));
    const slugs = requestedIds.map((val) => val.toLowerCase());

    const records = await BusinessEntity.findAll({
      where: {
        isPubliclyVisible: true,
        [Op.or]: [
          ...(slugs.length > 0 ? [{ slug: { [Op.in]: slugs } }] : []),
          ...(numericIds.length > 0 ? [{ id: { [Op.in]: numericIds } }] : []),
        ],
      },
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "fullName", "email", "mobile", "isEmailVerified", "isMobileVerified"],
        },
        { model: StatutoryIdentifier, as: "statutory" },
        { model: BusinessProduct, as: "products", separate: true },
        { model: Certification, as: "certifications", separate: true },
        { model: BusinessFacility, as: "facilities", separate: true },
        { model: BusinessOperatingProfile, as: "operatingProfile" },
        { model: BusinessCommercialTerms, as: "commercialTerms" },
        { model: BusinessTradeLogistics, as: "tradeLogistics" },
        { model: VendorBusinessType, as: "vendorBusinessTypes", separate: true },
        { model: DocumentVault, as: "documents", separate: true },
        { model: BusinessBankingDetails, as: "bankingDetails" },
      ],
    });

    const complaintCountMap = await getOpenComplaintCountMap(records.map((r) => r.id));

    // Preserve requested order from `ids` query param
    const recordByKey = new Map<string, any>();
    for (const rec of records) {
      const json: any = rec.toJSON();
      if (json.slug) recordByKey.set(String(json.slug).toLowerCase(), { model: rec, json });
      recordByKey.set(String(json.id), { model: rec, json });
    }

    const orderedMatches = requestedIds
      .map((reqId) => recordByKey.get(reqId.toLowerCase()))
      .filter(Boolean);

    const formatted = orderedMatches.map(({ model, json }: { model: BusinessEntity; json: any }) => {
      const openComplaintsCount = complaintCountMap.get(Number(json.id)) || 0;
      const snap = buildPublicBusinessSnapshot(model, json, openComplaintsCount);
      const cmpLoc = resolvePublicLocation(json);

      return {
        id: json.slug || String(json.id),
        slug: json.slug,
        name: json.tradeName || json.name || json.legalName,
        legalName: json.legalName || json.name,
        industry: json.industry || "Manufacturing",
        location: cmpLoc.location,
        city: cmpLoc.city,
        state: cmpLoc.state,
        country: cmpLoc.country,
        level: snap.level,
        score: snap.score,
        grade: snap.grade,
        riskLevel: snap.riskLevel,
        age:
          json.age ||
          (json.yearEstablished
            ? Math.max(1, new Date().getFullYear() - Number(json.yearEstablished))
            : 5),
        summary: json.summary || "Verified enterprise active on BITAINTEL intelligence directory.",
        products: snap.prods,
        productsCount: snap.productRecords.length,
        facilitiesCount: Array.isArray(json.facilities) ? json.facilities.length : 0,
        certificationsCount: snap.certs.length,
        gstin: json.statutory?.gstin || "Pending GSTIN",
        cin: json.statutory?.cin || "—",
        isoCertified: snap.certs.length > 0 ? snap.certs.join(" & ") : "",
        identity: snap.identity,
        documents: snap.documents,
        contact: snap.contact,
        address: snap.address,
        profile: snap.profile,
        turnover: json.operatingProfile?.annualTurnoverRange || json.turnover || "₹1–5 crore",
        employees: json.operatingProfile?.totalWorkforce || json.employees || "10–50",
        verified: snap.isVerified,
        verificationStatus: snap.verificationStatus,
        openComplaintsCount,
        creditTermsDays: json.commercialTerms?.creditTermsDays || null,
        preferredIncoterms: Array.isArray(json.tradeLogistics?.preferredIncoterms)
          ? json.tradeLogistics.preferredIncoterms
          : [],
        initials: json.initials || getInitials(json.name || json.legalName || "BE"),
        lastAudited: json.lastAudited
          ? new Date(json.lastAudited).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "Recently Audited",
        badge: snap.badge,
        logoUrl: json.logoUrl || null,
        isPremiumSubscriber: snap.badge === "Platinum",
        subscriptionPlan: snap.badge === "Platinum" ? "Premium" : "Standard",
      };
    });

    return sendSuccess(res, { total: formatted.length, businesses: formatted });
  } catch (error) {
    console.error("Compare Businesses Error:", error);
    return sendError(res, "Failed to compare businesses", 500, "ERR_INTERNAL_SERVER");
  }
}


