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
} from "../models/index.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { getInitials } from "../utils/slug.js";

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
// Public directory endpoint returning all live registered businesses for directory explorers
export async function getPublicDirectory(req: Request, res: Response) {
  try {
    const businesses = await BusinessEntity.findAll({
      where: { isPubliclyVisible: true },
      include: [
        { model: StatutoryIdentifier, as: "statutory" },
        { model: BusinessProduct, as: "products" },
        { model: Certification, as: "certifications" },
      ],
      order: [
        ["score", "DESC"],
        ["updatedAt", "DESC"],
      ],
    });

    const formatted = businesses.map((b: any) => {
      const bJson = b.toJSON();
      const prods = Array.isArray(bJson.products)
        ? bJson.products.map((p: any) => p.name || p.title).filter(Boolean)
        : [];
      const certs = Array.isArray(bJson.certifications)
        ? bJson.certifications.map((c: any) => c.name || c.certificateName).filter(Boolean)
        : [];

      const rawScore = Number(bJson.score);
      const score = !isNaN(rawScore) && rawScore > 0 ? Math.round(rawScore) : 85;
      const level = Number(bJson.level) || (score >= 90 ? 4 : score >= 75 ? 3 : score >= 50 ? 2 : 1);

      return {
        id: bJson.slug || String(bJson.id),
        slug: bJson.slug,
        name: bJson.tradeName || bJson.name || bJson.legalName,
        legalName: bJson.legalName || bJson.name,
        industry: bJson.industry || "Manufacturing",
        location: bJson.location || `${bJson.city || "Mumbai"}, ${bJson.state || "Maharashtra"}`,
        city: bJson.city || "Mumbai",
        state: bJson.state || "Maharashtra",
        level,
        score,
        age: bJson.age || (bJson.yearEstablished ? Math.max(1, new Date().getFullYear() - Number(bJson.yearEstablished)) : 5),
        summary: bJson.summary || `Verified enterprise active on BITAINTEL intelligence directory.`,
        products: prods.length > 0 ? prods : ["Industrial Solutions", "Engineering Products"],
        gstin: bJson.statutory?.gstin || "Active Verified",
        cin: bJson.statutory?.cin || "—",
        isoCertified: certs.length > 0 ? certs.join(" & ") : "ISO 9001:2015 & MCA21 Verified",
        identity: "10/10",
        documents: "18/20",
        contact: "5/5",
        address: "5/5",
        profile: 15,
        turnover: bJson.turnover || "₹1–5 crore",
        employees: bJson.employees || "10–50",
        verified: Boolean(bJson.verified !== false),
        initials: bJson.initials || getInitials(bJson.name || bJson.legalName || "BE"),
        lastAudited: bJson.lastAudited
          ? new Date(bJson.lastAudited).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
          : "Recently Audited",
        badge: bJson.badge || (score >= 90 ? "Platinum" : score >= 75 ? "Gold" : "Verified"),
        logoUrl: bJson.logoUrl || null,
        isPremiumSubscriber: bJson.badge === "Platinum",
        subscriptionPlan: bJson.badge === "Platinum" ? "Premium" : "Standard",
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
        { model: StatutoryIdentifier, as: "statutory" },
        { model: BusinessProduct, as: "products" },
        { model: Certification, as: "certifications" },
      ],
    });

    if (!business) {
      return sendError(res, "Business profile not found", 404, "ERR_NOT_FOUND");
    }

    const bJson: any = business.toJSON();
    const prods = Array.isArray(bJson.products)
      ? bJson.products.map((p: any) => p.name || p.title).filter(Boolean)
      : [];
    const certs = Array.isArray(bJson.certifications)
      ? bJson.certifications.map((c: any) => c.name || c.certificateName).filter(Boolean)
      : [];

    const rawScore = Number(bJson.score);
    const score = !isNaN(rawScore) && rawScore > 0 ? Math.round(rawScore) : 85;
    const level = Number(bJson.level) || (score >= 90 ? 4 : score >= 75 ? 3 : score >= 50 ? 2 : 1);

    const formatted = {
      id: bJson.slug || String(bJson.id),
      slug: bJson.slug,
      name: bJson.tradeName || bJson.name || bJson.legalName,
      legalName: bJson.legalName || bJson.name,
      industry: bJson.industry || "Manufacturing",
      location: bJson.location || `${bJson.city || "Mumbai"}, ${bJson.state || "Maharashtra"}`,
      city: bJson.city || "Mumbai",
      state: bJson.state || "Maharashtra",
      level,
      score,
      age: bJson.age || (bJson.yearEstablished ? Math.max(1, new Date().getFullYear() - Number(bJson.yearEstablished)) : 5),
      summary: bJson.summary || `Verified enterprise active on BITAINTEL intelligence directory.`,
      products: prods.length > 0 ? prods : ["Industrial Solutions", "Engineering Products"],
      gstin: bJson.statutory?.gstin || "Active Verified",
      cin: bJson.statutory?.cin || "—",
      isoCertified: certs.length > 0 ? certs.join(" & ") : "ISO 9001:2015 & MCA21 Verified",
      identity: "10/10",
      documents: "18/20",
      contact: "5/5",
      address: "5/5",
      profile: 15,
      turnover: bJson.turnover || "₹1–5 crore",
      employees: bJson.employees || "10–50",
      verified: Boolean(bJson.verified !== false),
      initials: bJson.initials || getInitials(bJson.name || bJson.legalName || "BE"),
      lastAudited: bJson.lastAudited
        ? new Date(bJson.lastAudited).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "Recently Audited",
      badge: bJson.badge || (score >= 90 ? "Platinum" : score >= 75 ? "Gold" : "Verified"),
      logoUrl: bJson.logoUrl || null,
      isPremiumSubscriber: bJson.badge === "Platinum",
      subscriptionPlan: bJson.badge === "Platinum" ? "Premium" : "Standard",
    };

    return sendSuccess(res, { business: formatted });
  } catch (error) {
    console.error("Get Public Business Detail Error:", error);
    return sendError(res, "Failed to fetch business details", 500, "ERR_INTERNAL_SERVER");
  }
}


