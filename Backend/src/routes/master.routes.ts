import { Router } from "express";
import { optionalAuthenticate } from "../middlewares/auth.middleware.js";
import {
  getBusinessTypes,
  getCategories,
  getSubcategories,
  getRoles,
  getIndustries,
  getBusinessActivities,
  getCurrencies,
  getPublicDirectory,
  getPublicBusinessDetail,
  compareBusinesses,
} from "../controllers/master.controller.js";

const masterRouter = Router();

// ─── Public Master Data Lookup Endpoints ─────────────────────────────────────
// In routes ke liye login zaroori nahi hai (Registration wizard inhein use karega)

// 1. Business Types (BT01 - BT14)
masterRouter.get("/business-types", getBusinessTypes);

// 2. Categories (CAT001 - CAT020)
// Optional: /api/v1/master/categories?includeSubcategories=true
masterRouter.get("/categories", getCategories);

// 3. Subcategories (SUB001 - SUB228)
// Optional: /api/v1/master/subcategories?categoryCode=CAT001
masterRouter.get("/subcategories", getSubcategories);

// 4. Roles (Vendor, Admin, etc.)
masterRouter.get("/roles", getRoles);

// 5. Industries (IND01 - IND10)
masterRouter.get("/industries", getIndustries);

// 6. Business Activities (ACT01 - ACT08)
masterRouter.get("/business-activities", getBusinessActivities);

// 7. Currencies (INR, USD, EUR, AED, SAR, etc.)
masterRouter.get("/currencies", getCurrencies);

// 8. Public Business Directory & Details (Live from MySQL business_entities)
masterRouter.get("/directory", optionalAuthenticate, getPublicDirectory);
masterRouter.get("/compare", optionalAuthenticate, compareBusinesses);
masterRouter.get("/business/:slug", optionalAuthenticate, getPublicBusinessDetail);

export default masterRouter;

