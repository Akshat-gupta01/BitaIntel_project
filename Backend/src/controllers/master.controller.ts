import { Request, Response } from "express";
import {
  BusinessType,
  Category,
  Subcategory,
  Roles,
  Industry,
  BusinessActivity,
  Currency,
} from "../models/index.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

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


