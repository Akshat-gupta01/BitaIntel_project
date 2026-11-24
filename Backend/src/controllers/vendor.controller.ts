import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Request, Response } from "express";
import productUpload, { productUploadAsync } from "../config/multer.config.js";
import {
  User,
  BusinessEntity,
  StatutoryIdentifier,
  BusinessFacility,
  BusinessPersonnel,
  DocumentVault,
  BusinessProduct,
  Certification,
  Category,
  Subcategory,
  BusinessDepartmentContact,
  BusinessCommercialTerms,
  BusinessTradeLogistics,
  BusinessBankingDetails,
  BusinessComplianceDeclarations,
  VendorBusinessType,
  VendorCategory,
  VendorSubcategory,
  VendorBusinessActivity,
  BusinessManufacturingCapability,
  BusinessServiceCapability,
  BusinessOperatingProfile,
  sequelize,
} from "../models/index.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { generateSlug, getInitials } from "../utils/slug.js";
import { GstinAdapter } from "../adapters/gstin.adapter.js";
import { computeAndSaveBusinessTrustScore } from "../services/scoring.service.js";

/**
 * 1. GET /api/v1/vendor/profile
 * Logged-in vendor ka Business Profile + Statutory IDs (GSTIN, PAN) + Facilities return karta hai
 */
export async function getProfile(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Unauthorized access", 401, "ERR_UNAUTHORIZED");
    }

    // Business aur uske linked Statutory IDs, Facilities, Personnel aur Documents ko fetch karein
    const business = await BusinessEntity.findOne({
      where: { ownerUserId: userId },
      include: [
        {
          model: User,
          as: "owner",
          attributes: [
            "id",
            "fullName",
            "email",
            "mobile",
            "designation",
            "companyName",
            "isEmailVerified",
            "isMobileVerified",
          ],
        },
        {
          model: StatutoryIdentifier,
          as: "statutory"
        },
        {
          model: BusinessFacility,
          as: "facilities"
        },
        {
          model: BusinessPersonnel,
          as: "keyPersonnel"
        },
        {
          model: DocumentVault,
          as: "documents"
        },
        {
          model: VendorBusinessType,
          as: "vendorBusinessTypes"
        },
        {
          model: VendorCategory,
          as: "vendorCategories"
        },
        {
          model: VendorSubcategory,
          as: "vendorSubcategories"
        },
        {
          model: VendorBusinessActivity,
          as: "vendorActivities"
        },
        {
          model: BusinessManufacturingCapability,
          as: "manufacturingCapability"
        },
        {
          model: BusinessServiceCapability,
          as: "serviceCapability"
        },
        {
          model: BusinessOperatingProfile,
          as: "operatingProfile"
        },
        {
          model: BusinessProduct,
          as: "products"
        },
        {
          model: Certification,
          as: "certifications"
        },
        {
          model: BusinessDepartmentContact,
          as: "departmentContacts"
        },
        {
          model: BusinessCommercialTerms,
          as: "commercialTerms"
        },
        {
          model: BusinessTradeLogistics,
          as: "tradeLogistics"
        },
        {
          model: BusinessBankingDetails,
          as: "bankingDetails"
        },
        {
          model: BusinessComplianceDeclarations,
          as: "complianceDeclarations"
        }
      ]
    });

    if (!business) {
      return sendError(res, "Business profile not found. Please create one.", 404, "ERR_NOT_FOUND");
    }

    if (Number(business.score) === 0) {
      try {
        const scoring = await computeAndSaveBusinessTrustScore(business.id);
        if (scoring) {
          business.score = scoring.score;
          business.level = scoring.level;
          business.badge = scoring.badge;
        }
      } catch (scoreErr) {
        console.warn("Could not compute profile trust score:", scoreErr);
      }
    }

    const bJson: any = business.toJSON();
    if (!bJson.incorporationDate && bJson.yearEstablished) {
      bJson.incorporationDate = `${bJson.yearEstablished}-01-01`;
    }
    if (bJson.statutory) {
      const payload = (bJson.statutory.statutoryPayload as Record<string, any>) || {};
      bJson.statutory.tan = bJson.statutory.tan || payload.tan || null;
      bJson.statutory.duns = bJson.statutory.dunsNumber || bJson.statutory.duns || payload.duns || null;
      bJson.statutory.dunsNumber = bJson.statutory.dunsNumber || bJson.statutory.duns || payload.duns || null;
      bJson.statutory.lei = bJson.statutory.lei || payload.lei || null;
    }
    const bTypes = bJson.vendorBusinessTypes || [];
    const cats = bJson.vendorCategories || [];
    const subcats = bJson.vendorSubcategories || [];
    const acts = bJson.vendorActivities || [];
    const mfg = bJson.manufacturingCapability;
    const svc = bJson.serviceCapability;
    const profile = bJson.operatingProfile;

    bJson.capabilities = {
      businessTypeCodes: bTypes.map((b: any) => b.businessTypeCode),
      selectedCategoryIds: cats.map((c: any) => c.categoryId),
      selectedSubcategoryIds: subcats.map((s: any) => s.subcategoryId),
      businessActivities: acts.map((a: any) => a.activityName),
      manufacturingProcesses: mfg?.manufacturingProcesses || null,
      machineryEquipment: mfg?.machineryEquipment || null,
      installedCapacity: mfg?.installedCapacity || null,
      availableCapacity: mfg?.availableCapacity || null,
      hasRdLab: Boolean(mfg?.hasRdLab),
      hasQcLab: Boolean(mfg?.hasQcLab),
      offersCustomDevelopment: Boolean(mfg?.offersCustomDevelopment),
      serviceTypes: svc?.serviceTypes || null,
      serviceExpertise: svc?.serviceExpertise || null,
      geographicCoverage: svc?.geographicCoverage || null,
      deliveryCapacity: svc?.deliveryCapacity || null,
      yearsInBusiness: profile?.yearsInBusiness || null,
      numberOfFacilities: profile?.numberOfFacilities || null,
      annualTurnoverRange: profile?.annualTurnoverRange || null,
      totalWorkforce: profile?.totalWorkforce || null,
      manufacturingLicenceDoc: mfg?.manufacturingLicenceDoc || null,
      facilityPhotos: mfg?.facilityPhotos || null,
      technicalAuditDoc: mfg?.technicalAuditDoc || null,
    };

    // Step 5: Commercial, Logistics, Banking & Settlement unified packaging
    const terms = bJson.commercialTerms;
    const trade = bJson.tradeLogistics;
    const banking = bJson.bankingDetails;
    const decl = bJson.complianceDeclarations;
    const contacts = bJson.departmentContacts || [];

    bJson.commercial = {
      departmentContacts: contacts.map((c: any) => ({
        id: c.id,
        department: c.department,
        name: c.name,
        designation: c.designation || null,
        email: c.email || null,
        phone: c.phone || null,
        isPrimary: Boolean(c.isPrimary),
      })),
      acceptedCurrencies: terms?.acceptedCurrencies || [],
      paymentMethods: terms?.paymentMethods || [],
      advancePaymentPercentage: terms?.advancePaymentPercentage || null,
      creditTermsDays: terms?.creditTermsDays || null,
      moqPolicy: terms?.moqPolicy || null,
      samplePolicy: terms?.samplePolicy || null,
      warrantyTerms: terms?.warrantyTerms || null,
      returnPolicy: terms?.returnPolicy || null,
      importerExporterStatus: trade?.importerExporterStatus || null,
      iecNumber: trade?.iecNumber || null,
      sourcingCountries: trade?.sourcingCountries || null,
      exportMarkets: trade?.exportMarkets || null,
      annualTradeTurnover: trade?.annualTradeTurnover || null,
      preferredIncoterms: trade?.preferredIncoterms || [],
      freightArrangements: trade?.freightArrangements || null,
      customsClearanceAssistance: Boolean(trade?.customsClearanceAssistance),
      exportPackagingStandards: trade?.exportPackagingStandards || null,
      coldChainCapability: Boolean(trade?.coldChainCapability),
      tradeReferences: trade?.tradeReferences || null,
      accountHolderName: banking?.accountHolderName || null,
      bankName: banking?.bankName || null,
      accountType: banking?.accountType || null,
      accountNumber: banking?.accountNumber || null,
      ifscCode: banking?.ifscCode || null,
      swiftBicCode: banking?.swiftBicCode || null,
      bankBranch: banking?.bankBranch || null,
      bankCountry: banking?.bankCountry || null,
      bankProofDoc: banking?.bankProofDoc || null,
      lawfullyScreened: Boolean(decl?.lawfullyScreened),
      noConflictOfInterest: Boolean(decl?.noConflictOfInterest),
      sanctionsFreeDeclaration: Boolean(decl?.sanctionsFreeDeclaration),
      authorityConsent: Boolean(decl?.authorityConsent),
    };

    return sendSuccess(res, { business: bJson });
  } catch (error: any) {
    console.error("Get Profile Error:", error);
    return sendError(
      res,
      error?.message || "Failed to fetch profile",
      500,
      "ERR_INTERNAL_SERVER",
      process.env.NODE_ENV !== "production" ? error?.stack : undefined
    );
  }
}

/**
 * [COMMENTED OUT / DEPRECATED]
 * 2. POST /api/v1/vendor/create-profile
 * Redundant endpoint: BusinessEntity is already automatically created when vendor registers (auth.controller.ts).
 * Subsequent modifications and saves use PATCH /api/v1/vendor/update-profile.
 */
/*
export async function createProfile(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Unauthorized access", 401, "ERR_UNAUTHORIZED");
    }

    const effectivePostalCode = req.body.postalCode !== undefined ? req.body.postalCode : req.body.pincode;
    const effectiveSummary = req.body.summary !== undefined ? req.body.summary : req.body.companyDescription;

    // Check karo profile pehle se toh nahi bana hua
    const existingBusiness = await BusinessEntity.findOne({
      where: { ownerUserId: userId }
    });

    if (existingBusiness) {
      const updates: Record<string, any> = { ...req.body };
      if (effectivePostalCode !== undefined) updates.postalCode = effectivePostalCode?.trim() || null;
      if (effectiveSummary !== undefined) updates.summary = effectiveSummary?.trim() || null;
      if (req.body.registeredAddress !== undefined) updates.registeredAddress = req.body.registeredAddress?.trim() || null;

      await existingBusiness.update(updates);
      return sendSuccess(
        res,
        {
          message: "Business profile updated successfully",
          business: existingBusiness
        },
        200
      );
    }

    const {
      name,
      legalName,
      tradeName,
      companyType,
      industry,
      category,
      location,
      city,
      state,
      registeredAddress,
      country,
      website,
      yearEstablished,
      incorporationDate,
      logoUrl,
    } = req.body;

    const companyName = name || legalName;
    if (!companyName) {
      return sendError(res, "Company Name or Legal Name is required", 400, "ERR_VALIDATION");
    }

    const slug = generateSlug(companyName);
    const initials = getInitials(companyName);

    const newBusiness = await BusinessEntity.create({
      ownerUserId: userId,
      slug,
      name: companyName,
      legalName: legalName || companyName,
      tradeName: tradeName || companyName,
      companyType: companyType || "Private Limited Company (Pvt Ltd)",
      initials,
      industry: industry || "Manufacturing",
      category,
      location: location || `${city || "Mumbai"}, ${state || "Maharashtra"}`,
      city: city || "Mumbai",
      state: state || "Maharashtra",
      registeredAddress: registeredAddress?.trim() || null,
      postalCode: effectivePostalCode?.trim() || null,
      country: country?.trim() || "India",
      website,
      yearEstablished: Number(yearEstablished) || 2024,
      incorporationDate: incorporationDate?.trim() || (yearEstablished ? `${yearEstablished}-01-01` : null),
      logoUrl: logoUrl ? String(logoUrl).trim() : null,
      summary: effectiveSummary?.trim() || null,
      score: 0.00,
      badge: "Under Review",
      verificationStatus: "registered",
      isPubliclyVisible: true
    });

    return sendSuccess(
      res,
      {
        message: "Business profile created successfully",
        business: newBusiness
      },
      201
    );
  } catch (error) {
    console.error("Create Profile Error:", error);
    return sendError(res, "Failed to create business profile", 500, "ERR_INTERNAL_SERVER");
  }
}
*/

/**
 * 3. PATCH /api/v1/vendor/update-profile
 * Logged-in vendor ki company details update karta hai (Address, Website, Summary etc.)
 */
export async function updateProfile(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return sendError(res, "Please login first", 401, "ERR_UNAUTHORIZED");
  }

  // Whitelist allowed fields to prevent mass-assignment vulnerability
  const {
    name,
    legalName,
    tradeName,
    companyType,
    industry,
    category,
    city,
    state,
    registeredAddress,
    postalCode,
    pincode,
    country,
    website,
    summary,
    companyDescription,
    turnover,
    employees,
    yearEstablished,
    incorporationDate,
    logoUrl,
    tan,
    duns,
    dunsNumber,
    lei,
  } = req.body;

  // Execute entire update workflow in a database transaction
  const t = await sequelize.transaction();

  try {
    let business = await BusinessEntity.findOne({
      where: { ownerUserId: userId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!business) {
      const user = req.user;
      const cName = name || legalName || user?.companyName || "Vendor Enterprise";
      business = await BusinessEntity.create(
        {
          ownerUserId: userId,
          slug: generateSlug(cName),
          name: cName,
          legalName: legalName || cName,
          tradeName: tradeName || cName,
          initials: getInitials(cName),
          score: 0.00,
          badge: "Under Review",
          verificationStatus: "registered",
          isPubliclyVisible: true,
        },
        { transaction: t }
      );
    }

    // ─── 1. Business Entity Table Updates ─────────────────────────────────────────
    const updates: Record<string, any> = {};

    if (name?.trim()) updates.name = name.trim();
    if (legalName?.trim()) updates.legalName = legalName.trim();
    if (tradeName !== undefined) updates.tradeName = tradeName?.trim() || null;
    if (companyType?.trim()) updates.companyType = companyType.trim();
    if (industry?.trim()) updates.industry = industry.trim();
    if (category !== undefined) updates.category = category?.trim() || null;
    if (city?.trim()) updates.city = city.trim();
    if (state?.trim()) updates.state = state.trim();

    // Support registeredAddress
    if (registeredAddress !== undefined) {
      updates.registeredAddress = registeredAddress?.trim() || null;
    }

    // Support both postalCode and pincode aliases from frontend
    const effectivePostalCode = postalCode !== undefined ? postalCode : pincode;
    if (effectivePostalCode !== undefined) {
      updates.postalCode = effectivePostalCode?.trim() || null;
    }

    // Support both summary and companyDescription aliases from frontend
    const effectiveSummary = summary !== undefined ? summary : companyDescription;
    if (effectiveSummary !== undefined) {
      updates.summary = effectiveSummary?.trim() || null;
    }

    if (country?.trim()) updates.country = country.trim();
    if (website !== undefined) updates.website = website?.trim() || null;
    if (turnover?.trim()) updates.turnover = turnover.trim();
    if (employees?.trim()) updates.employees = employees.trim();
    if (yearEstablished !== undefined) updates.yearEstablished = Number(yearEstablished) || 2024;

    // Save incorporationDate in Business Entity
    if (incorporationDate !== undefined) {
      updates.incorporationDate = incorporationDate?.trim() || null;
      if (incorporationDate?.trim() && !yearEstablished) {
        const parsedYear = new Date(incorporationDate.trim()).getFullYear();
        if (!isNaN(parsedYear) && parsedYear > 1800) {
          updates.yearEstablished = parsedYear;
        }
      }
    }

    // Save logoUrl in Business Entity
    if (logoUrl !== undefined) {
      updates.logoUrl = logoUrl ? String(logoUrl).trim() : null;
    }

    if (Object.keys(updates).length > 0) {
      await business.update(updates, { transaction: t });
    }

    // ─── 2. Statutory Identifier Table Updates ─────────────────────────────────────
    const effectiveDuns = dunsNumber !== undefined ? dunsNumber : duns;
    let statutory = null;
    if (tan !== undefined || effectiveDuns !== undefined || lei !== undefined) {
      // Find or create StatutoryIdentifier record linked to this business
      statutory = await StatutoryIdentifier.findOne({
        where: { businessId: business.id },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      const cleanTan = tan !== undefined ? (tan ? String(tan).trim().toUpperCase() : null) : undefined;
      const cleanDuns = effectiveDuns !== undefined ? (effectiveDuns ? String(effectiveDuns).trim().toUpperCase() : null) : undefined;
      const cleanLei = lei !== undefined ? (lei ? String(lei).trim().toUpperCase() : null) : undefined;

      if (!statutory) {
        statutory = await StatutoryIdentifier.create(
          {
            businessId: business.id,
            tan: cleanTan ?? null,
            duns: cleanDuns ?? null,
            dunsNumber: cleanDuns ?? null,
            lei: cleanLei ?? null,
            mcaStatus: "ACTIVE",
            gstnStatus: "ACTIVE",
            filingFrequency: "Monthly (GSTR-3B)",
            statutoryPayload: {
              ...(cleanTan ? { tan: cleanTan } : {}),
              ...(cleanDuns ? { duns: cleanDuns } : {}),
              ...(cleanLei ? { lei: cleanLei } : {}),
            },
          },
          { transaction: t }
        );
      } else {
        const statutoryUpdates: Record<string, any> = {};
        const currPayload = (statutory.statutoryPayload as Record<string, any>) || {};
        const newPayload = { ...currPayload };

        if (cleanTan !== undefined) {
          statutoryUpdates.tan = cleanTan;
          newPayload.tan = cleanTan;
        }
        if (cleanDuns !== undefined) {
          statutoryUpdates.duns = cleanDuns;
          statutoryUpdates.dunsNumber = cleanDuns;
          newPayload.duns = cleanDuns;
        }
        if (cleanLei !== undefined) {
          statutoryUpdates.lei = cleanLei;
          newPayload.lei = cleanLei;
        }
        statutoryUpdates.statutoryPayload = newPayload;
        await statutory.update(statutoryUpdates, { transaction: t });
      }
    }

    // Commit transaction only when all operations succeed
    await t.commit();

    return sendSuccess(res, {
      message: "Business profile and statutory identifiers updated successfully",
      business,
      statutory,
    });
  } catch (error: any) {
    await t.rollback();
    console.error("Update Profile Error:", error);
    return sendError(
      res,
      error?.message || "Failed to update business profile",
      500,
      "ERR_INTERNAL_SERVER"
    );
  }
}


// ─── Statutory Identifiers ───────────────────────────────────────────────────

export async function getStatutory(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Please login first", 401, "ERR_UNAUTHORIZED");
    }
    // 1. Vendor ki company dhoondo
    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) {
      return sendError(res, "Business profile not found. Please create company profile first.", 404, "ERR_BUSINESS_NOT_FOUND");
    }
    // 2. Company ke statutory details dhoondo
    const statutory = await StatutoryIdentifier.findOne({ where: { businessId: business.id } });
    if (!statutory) {
      return sendError(res, "Statutory details not found for this business", 404, "ERR_STATUTORY_NOT_FOUND");
    }
    const sJson: any = statutory.toJSON();
    const payload = (sJson.statutoryPayload as Record<string, any>) || {};
    sJson.tan = sJson.tan || payload.tan || null;
    sJson.duns = sJson.dunsNumber || sJson.duns || payload.duns || null;
    sJson.dunsNumber = sJson.dunsNumber || sJson.duns || payload.duns || null;
    sJson.lei = sJson.lei || payload.lei || null;
    return sendSuccess(res, { statutory: sJson });
  } catch (error) {
    console.error("Get Statutory Error:", error);
    return sendError(res, "Failed to fetch statutory identifiers", 500, "ERR_INTERNAL_SERVER");
  }
}


export async function createStatutory(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Please login first", 401, "ERR_UNAUTHORIZED");
    }
    // 1. Vendor ki company dhoondo
    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) {
      return sendError(res, "Please create your business profile before adding statutory details", 404, "ERR_BUSINESS_NOT_FOUND");
    }
    // 2. Check karo ki statutory details pehle se bani toh nahi hain
    const existing = await StatutoryIdentifier.findOne({ where: { businessId: business.id } });
    const { gstin, pan, cin, udyamMsme, msmeUdyamRegistration, iec, iecCode, filingFrequency, tan, duns, dunsNumber, lei } = req.body;

    const rawGstin = typeof gstin === "string" ? gstin.trim() : "";
    const cleanGstin = rawGstin ? rawGstin.toUpperCase() : null;
    const rawPan = typeof pan === "string" ? pan.trim() : "";
    const cleanPan = rawPan ? rawPan.toUpperCase() : null;
    const rawCin = typeof cin === "string" ? cin.trim() : "";
    const cleanCin = rawCin ? rawCin.toUpperCase() : null;
    const rawUdyamMsme = typeof udyamMsme === "string" ? udyamMsme.trim() : (typeof msmeUdyamRegistration === "string" ? msmeUdyamRegistration.trim() : null);
    const rawIecCode = typeof iecCode === "string" ? iecCode.trim() : (typeof iec === "string" ? iec.trim() : null);

    // 3. Duplicate GSTIN Check & Format Validation (agar GSTIN provide kiya gaya hai)
    if (cleanGstin) {
      if (!GstinAdapter.validateFormat(cleanGstin)) {
        return sendError(
          res,
          "Invalid GSTIN format. It must be a valid 15-character Indian GSTIN (e.g. 27AAACB1234F1Z5).",
          400,
          "ERR_INVALID_GSTIN"
        );
      }
      const duplicateGst = await StatutoryIdentifier.findOne({ where: { gstin: cleanGstin } });
      if (duplicateGst && duplicateGst.businessId !== business.id) {
        return sendError(res, "This GSTIN is already registered to another company", 409, "ERR_DUPLICATE_GSTIN");
      }
    }

    // 4. Duplicate CIN Check (agar CIN provide kiya gaya hai)
    if (cleanCin) {
      const duplicateCin = await StatutoryIdentifier.findOne({ where: { cin: cleanCin } });
      if (duplicateCin && duplicateCin.businessId !== business.id) {
        return sendError(res, "This CIN is already registered to another company", 409, "ERR_DUPLICATE_CIN");
      }
    }

    // 5. Smart PAN auto-extract: Agar GSTIN diya hai lekin PAN nahi diya, toh GSTIN se PAN nikaal lo
    let finalPan = cleanPan;
    if (!finalPan && cleanGstin && cleanGstin.length === 15) {
      finalPan = cleanGstin.substring(2, 12).toUpperCase();
    }

    if (existing) {
      const currentPayload = (existing.statutoryPayload as Record<string, any>) || {};
      const newPayload = { ...currentPayload };
      if (tan !== undefined) newPayload.tan = tan ? String(tan).trim().toUpperCase() : null;
      if (duns !== undefined || dunsNumber !== undefined) newPayload.duns = (duns || dunsNumber) ? String(duns || dunsNumber).trim() : null;
      if (lei !== undefined) newPayload.lei = lei ? String(lei).trim().toUpperCase() : null;

      await existing.update({
        ...(cleanGstin !== null ? { gstin: cleanGstin } : {}),
        ...(finalPan !== null ? { pan: finalPan } : {}),
        ...(cleanCin !== null ? { cin: cleanCin } : {}),
        ...(rawUdyamMsme !== null ? { udyamMsme: rawUdyamMsme } : {}),
        ...(rawIecCode !== null ? { iecCode: rawIecCode } : {}),
        ...(tan !== undefined ? { tan: tan ? String(tan).trim().toUpperCase() : null } : {}),
        ...(duns !== undefined || dunsNumber !== undefined
          ? {
              duns: (duns || dunsNumber) ? String(duns || dunsNumber).trim() : null,
              dunsNumber: (duns || dunsNumber) ? String(duns || dunsNumber).trim() : null,
            }
          : {}),
        ...(lei !== undefined ? { lei: lei ? String(lei).trim().toUpperCase() : null } : {}),
        ...(filingFrequency ? { filingFrequency } : {}),
        statutoryPayload: newPayload,
      });
      try {
        await computeAndSaveBusinessTrustScore(business.id);
      } catch {}
      const sJson: any = existing.toJSON();
      sJson.tan = newPayload.tan || null;
      sJson.duns = newPayload.duns || null;
      sJson.dunsNumber = newPayload.duns || null;
      sJson.lei = newPayload.lei || null;
      return sendSuccess(res, {
        message: "Statutory identifiers updated successfully",
        statutory: sJson
      }, 200);
    }

    // 6. Record create karo
    const initialPayload: Record<string, any> = {};
    if (tan) initialPayload.tan = String(tan).trim().toUpperCase();
    if (duns || dunsNumber) initialPayload.duns = String(duns || dunsNumber).trim();
    if (lei) initialPayload.lei = String(lei).trim().toUpperCase();

    const newStatutory = await StatutoryIdentifier.create({
      businessId: business.id,
      gstin: cleanGstin,
      pan: finalPan,
      cin: cleanCin,
      udyamMsme: rawUdyamMsme || null,
      iecCode: rawIecCode || null,
      tan: tan ? String(tan).trim().toUpperCase() : null,
      duns: (duns || dunsNumber) ? String(duns || dunsNumber).trim() : null,
      dunsNumber: (duns || dunsNumber) ? String(duns || dunsNumber).trim() : null,
      lei: lei ? String(lei).trim().toUpperCase() : null,
      filingFrequency: filingFrequency || "Monthly (GSTR-3B)",
      mcaStatus: "ACTIVE",
      gstnStatus: cleanGstin ? "PENDING" : "ACTIVE",
      statutoryPayload: initialPayload,
    });
    try {
      await computeAndSaveBusinessTrustScore(business.id);
    } catch {}
    const sJson: any = newStatutory.toJSON();
    sJson.tan = initialPayload.tan || null;
    sJson.duns = initialPayload.duns || null;
    sJson.dunsNumber = initialPayload.duns || null;
    sJson.lei = initialPayload.lei || null;
    return sendSuccess(res, {
      message: "Statutory identifiers saved successfully",
      statutory: sJson
    }, 201);
  } catch (error) {
    console.error("Create Statutory Error:", error);
    return sendError(res, "Failed to save statutory identifiers", 500, "ERR_INTERNAL_SERVER");
  }
}


export async function updateStatutory(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Please login first", 401, "ERR_UNAUTHORIZED");
    }
    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) {
      return sendError(res, "Business profile not found", 404, "ERR_BUSINESS_NOT_FOUND");
    }
    let statutory = await StatutoryIdentifier.findOne({ where: { businessId: business.id } });

    const { gstin, pan, cin, udyamMsme, msmeUdyamRegistration, iec, iecCode, filingFrequency, tan, duns, dunsNumber, lei } = req.body;
    const rawGstin = typeof gstin === "string" ? gstin.trim() : "";
    const cleanGstin = rawGstin ? rawGstin.toUpperCase() : null;
    const rawPan = typeof pan === "string" ? pan.trim() : "";
    const cleanPan = rawPan ? rawPan.toUpperCase() : null;
    const rawCin = typeof cin === "string" ? cin.trim() : "";
    const cleanCin = rawCin ? rawCin.toUpperCase() : null;
    const rawUdyamMsme = typeof udyamMsme === "string" ? udyamMsme.trim() : (typeof msmeUdyamRegistration === "string" ? msmeUdyamRegistration.trim() : null);
    const rawIecCode = typeof iecCode === "string" ? iecCode.trim() : (typeof iec === "string" ? iec.trim() : null);

    // Upsert Fallback: Agar pehle se statutory row nahi bani hai, toh create kar do
    if (!statutory) {
      if (cleanGstin) {
        if (!GstinAdapter.validateFormat(cleanGstin)) {
          return sendError(
            res,
            "Invalid GSTIN format. It must be a valid 15-character Indian GSTIN (e.g. 27AAACB1234F1Z5).",
            400,
            "ERR_INVALID_GSTIN"
          );
        }
        const dup = await StatutoryIdentifier.findOne({ where: { gstin: cleanGstin } });
        if (dup) return sendError(res, "This GSTIN is already in use by another company", 409, "ERR_DUPLICATE_GSTIN");
      }
      if (cleanCin) {
        const dupCin = await StatutoryIdentifier.findOne({ where: { cin: cleanCin } });
        if (dupCin) return sendError(res, "This CIN is already in use by another company", 409, "ERR_DUPLICATE_CIN");
      }
      let finalPan = cleanPan;
      if (!finalPan && cleanGstin && cleanGstin.length === 15) {
        finalPan = cleanGstin.substring(2, 12);
      }

      const initialPayload: Record<string, any> = {};
      if (tan) initialPayload.tan = String(tan).trim().toUpperCase();
      if (duns || dunsNumber) initialPayload.duns = String(duns || dunsNumber).trim();
      if (lei) initialPayload.lei = String(lei).trim().toUpperCase();

      statutory = await StatutoryIdentifier.create({
        businessId: business.id,
        gstin: cleanGstin,
        pan: finalPan,
        cin: cleanCin,
        udyamMsme: rawUdyamMsme || null,
        iecCode: rawIecCode || null,
        tan: tan ? String(tan).trim().toUpperCase() : null,
        dunsNumber: (duns || dunsNumber) ? String(duns || dunsNumber).trim() : null,
        lei: lei ? String(lei).trim().toUpperCase() : null,
        filingFrequency: filingFrequency?.trim() || "Monthly (GSTR-3B)",
        mcaStatus: "ACTIVE",
        gstnStatus: cleanGstin ? "PENDING" : "ACTIVE",
        statutoryPayload: initialPayload,
      });
      try {
        await computeAndSaveBusinessTrustScore(business.id);
      } catch {}
      const sJson: any = statutory.toJSON();
      sJson.tan = initialPayload.tan || null;
      sJson.duns = initialPayload.duns || null;
      sJson.dunsNumber = initialPayload.duns || null;
      sJson.lei = initialPayload.lei || null;
      return sendSuccess(res, {
        message: "Statutory identifiers created successfully",
        statutory: sJson
      }, 201);
    }

    const updates: Record<string, any> = {};
    if (cleanGstin) {
      // Format Validate karo
      if (!GstinAdapter.validateFormat(cleanGstin)) {
        return sendError(
          res,
          "Invalid GSTIN format. It must be a valid 15-character Indian GSTIN (e.g. 27AAACB1234F1Z5).",
          400,
          "ERR_INVALID_GSTIN"
        );
      }
      // Check duplicate if GSTIN is changing
      if (cleanGstin !== statutory.gstin) {
        const dup = await StatutoryIdentifier.findOne({ where: { gstin: cleanGstin } });
        if (dup) return sendError(res, "This GSTIN is already in use by another company", 409, "ERR_DUPLICATE_GSTIN");
        // GSTIN badla hai toh wapas PENDING mark karo taaki Admin dobara verify kare!
        updates.gstnStatus = "PENDING";
      }
      updates.gstin = cleanGstin;
    }
    if (cleanCin) {
      if (cleanCin !== statutory.cin) {
        const dup = await StatutoryIdentifier.findOne({ where: { cin: cleanCin } });
        if (dup) return sendError(res, "This CIN is already in use by another company", 409, "ERR_DUPLICATE_CIN");
      }
      updates.cin = cleanCin;
    }
    if (cleanPan) updates.pan = cleanPan;
    if (rawUdyamMsme !== null && rawUdyamMsme !== undefined) updates.udyamMsme = rawUdyamMsme || null;
    if (rawIecCode !== null && rawIecCode !== undefined) updates.iecCode = rawIecCode || null;
    if (tan !== undefined) updates.tan = tan ? String(tan).trim().toUpperCase() : null;
    if (duns !== undefined || dunsNumber !== undefined) updates.dunsNumber = (duns || dunsNumber) ? String(duns || dunsNumber).trim() : null;
    if (lei !== undefined) updates.lei = lei ? String(lei).trim().toUpperCase() : null;
    if (filingFrequency?.trim()) updates.filingFrequency = filingFrequency.trim();

    const existingPayload = (statutory.statutoryPayload as Record<string, any>) || {};
    const newPayload = { ...existingPayload };
    let payloadChanged = false;
    if (tan !== undefined) {
      newPayload.tan = tan ? String(tan).trim().toUpperCase() : null;
      payloadChanged = true;
    }
    if (duns !== undefined || dunsNumber !== undefined) {
      newPayload.duns = (duns || dunsNumber) ? String(duns || dunsNumber).trim() : null;
      payloadChanged = true;
    }
    if (lei !== undefined) {
      newPayload.lei = lei ? String(lei).trim().toUpperCase() : null;
      payloadChanged = true;
    }
    if (payloadChanged) {
      updates.statutoryPayload = newPayload;
    }

    if (Object.keys(updates).length > 0) {
      await statutory.update(updates);
      try {
        await computeAndSaveBusinessTrustScore(business.id);
      } catch {}
    }

    const sJson: any = statutory.toJSON();
    const finalPayload = updates.statutoryPayload || sJson.statutoryPayload || {};
    sJson.tan = finalPayload.tan || null;
    sJson.duns = finalPayload.duns || null;
    sJson.dunsNumber = finalPayload.duns || null;
    sJson.lei = finalPayload.lei || null;

    return sendSuccess(res, {
      message: "Statutory identifiers updated successfully",
      statutory: sJson
    });
  } catch (error) {
    console.error("Update Statutory Error:", error);
    return sendError(res, "Failed to update statutory identifiers", 500, "ERR_INTERNAL_SERVER");
  }
}

// ─── Manufacturing Plants & Facilities (Step 2 - Section 3) ───────────────────

/**
 * 7. POST /api/v1/vendor/facilities
 * Logged-in vendor ki company ke liye naya Manufacturing Plant ya Office add karta hai
 */
export async function addFacility(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Please login first", 401, "ERR_UNAUTHORIZED");
    }

    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) {
      return sendError(
        res,
        "Please create your business profile before adding facilities",
        404,
        "ERR_BUSINESS_NOT_FOUND"
      );
    }

    const {
      facilityType,
      facilityName,
      addressLine,
      city,
      state,
      pincode,
      country,
      isOwned,
      plantHead,
      contactPhone,
    } = req.body;

    const facilityNameResolved = (facilityName || req.body.name || "Main Facility").trim();
    const addressLineResolved = (addressLine || req.body.address || req.body.registeredAddress || "Facility Address").trim();
    const pincodeResolved = (pincode || req.body.postalCode || req.body.pin || "400001").trim();

    const facility = await BusinessFacility.create({
      businessId: business.id,
      facilityType: facilityType?.trim() || "Manufacturing Plant",
      facilityName: facilityNameResolved,
      addressLine: addressLineResolved,
      city: city ? city.trim() : "Mumbai",
      state: state ? state.trim() : "Maharashtra",
      pincode: pincodeResolved,
      country: country?.trim() || "India",
      isOwned: isOwned ?? true,
      plantHead: plantHead?.trim() || null,
      contactPhone: contactPhone?.trim() || null,
    });

    return sendSuccess(
      res,
      {
        message: "Facility / Plant added successfully",
        facility,
      },
      201
    );
  } catch (error) {
    console.error("Add Facility Error:", error);
    return sendError(res, "Failed to add facility", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 8. GET /api/v1/vendor/facilities
 * Logged-in vendor ki saari added facilities / plants return karta hai
 */
export async function getFacilities(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Please login first", 401, "ERR_UNAUTHORIZED");
    }

    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) {
      return sendError(res, "Business profile not found", 404, "ERR_BUSINESS_NOT_FOUND");
    }

    const facilities = await BusinessFacility.findAll({
      where: { businessId: business.id },
      order: [["id", "ASC"]],
    });

    return sendSuccess(res, {
      total: facilities.length,
      facilities,
    });
  } catch (error) {
    console.error("Get Facilities Error:", error);
    return sendError(res, "Failed to fetch facilities", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 9. DELETE /api/v1/vendor/facilities/:id
 * Logged-in vendor ki specific facility delete karta hai
 */
export async function deleteFacility(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Please login first", 401, "ERR_UNAUTHORIZED");
    }

    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) {
      return sendError(res, "Business profile not found", 404, "ERR_BUSINESS_NOT_FOUND");
    }

    const facilityId = Number(req.params.id);
    if (isNaN(facilityId) || facilityId <= 0) {
      return sendError(res, "Invalid facility ID", 400, "ERR_INVALID_ID");
    }

    const facility = await BusinessFacility.findOne({
      where: {
        id: facilityId,
        businessId: business.id,
      },
    });

    if (!facility) {
      return sendError(res, "Facility not found or not owned by your company", 404, "ERR_NOT_FOUND");
    }

    await facility.destroy();

    return sendSuccess(res, {
      message: "Facility removed successfully",
      facilityId,
    });
  } catch (error) {
    console.error("Delete Facility Error:", error);
    return sendError(res, "Failed to delete facility", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 10. PATCH /api/v1/vendor/facilities/:id
 * Logged-in vendor ki existing facility / plant details update karta hai
 */
export async function updateFacility(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Please login first", 401, "ERR_UNAUTHORIZED");
    }

    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) {
      return sendError(res, "Business profile not found", 404, "ERR_BUSINESS_NOT_FOUND");
    }

    const facilityId = Number(req.params.id);
    if (isNaN(facilityId) || facilityId <= 0) {
      return sendError(res, "Invalid facility ID", 400, "ERR_INVALID_ID");
    }

    const facility = await BusinessFacility.findOne({
      where: {
        id: facilityId,
        businessId: business.id,
      },
    });

    if (!facility) {
      return sendError(res, "Facility not found or not owned by your company", 404, "ERR_NOT_FOUND");
    }

    const {
      facilityType,
      facilityName,
      addressLine,
      city,
      state,
      pincode,
      country,
      isOwned,
      plantHead,
      contactPhone,
    } = req.body;

    if (facilityType !== undefined) {
      facility.facilityType = facilityType?.trim() || "Manufacturing Plant";
    }
    if (facilityName !== undefined) {
      if (!facilityName.trim()) {
        return sendError(res, "Facility or Plant Name cannot be empty", 400, "ERR_VALIDATION");
      }
      facility.facilityName = facilityName.trim();
    }
    if (addressLine !== undefined) {
      if (!addressLine.trim()) {
        return sendError(res, "Address line cannot be empty", 400, "ERR_VALIDATION");
      }
      facility.addressLine = addressLine.trim();
    }
    if (city !== undefined) {
      if (!city.trim()) {
        return sendError(res, "City cannot be empty", 400, "ERR_VALIDATION");
      }
      facility.city = city.trim();
    }
    if (state !== undefined) {
      if (!state.trim()) {
        return sendError(res, "State cannot be empty", 400, "ERR_VALIDATION");
      }
      facility.state = state.trim();
    }
    if (pincode !== undefined) {
      if (!pincode.trim()) {
        return sendError(res, "PIN code cannot be empty", 400, "ERR_VALIDATION");
      }
      facility.pincode = pincode.trim();
    }
    if (country !== undefined) {
      facility.country = country?.trim() || "India";
    }
    if (isOwned !== undefined) {
      facility.isOwned = Boolean(isOwned);
    }
    if (plantHead !== undefined) {
      facility.plantHead = plantHead ? plantHead.trim() : null;
    }
    if (contactPhone !== undefined) {
      facility.contactPhone = contactPhone ? contactPhone.trim() : null;
    }

    await facility.save();

    return sendSuccess(res, {
      message: "Facility details updated successfully",
      facility,
    });
  } catch (error) {
    console.error("Update Facility Error:", error);
    return sendError(res, "Failed to update facility", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 10. POST /api/v1/vendor/personnel
 * Key Executive / Department Head profile add karta hai (Step 2 - Section 4)
 */
export async function addPersonnel(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Please login first", 401, "ERR_UNAUTHORIZED");
    }

    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) {
      return sendError(
        res,
        "Please create your business profile before adding key personnel",
        404,
        "ERR_BUSINESS_NOT_FOUND"
      );
    }

    const {
      name,
      designation,
      department,
      email,
      mobile,
      photoUrl,
      isAuthorizedSignatory,
    } = req.body;

    const personnel = await BusinessPersonnel.create({
      businessId: business.id,
      name: name.trim(),
      designation: designation.trim(),
      department: department?.trim() || null,
      email: email.trim().toLowerCase(),
      mobile: (mobile || req.body.phone || "0000000000").trim(),
      photoUrl: photoUrl?.trim() || null,
      isAuthorizedSignatory: Boolean(isAuthorizedSignatory),
    });

    return sendSuccess(
      res,
      {
        message: "Key Executive profile added successfully",
        personnel,
      },
      201
    );
  } catch (error) {
    console.error("Add Personnel Error:", error);
    return sendError(res, "Failed to add key personnel profile", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 11. GET /api/v1/vendor/personnel
 * Logged-in vendor ke saare key executives / department heads return karta hai
 */
export async function getPersonnel(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Please login first", 401, "ERR_UNAUTHORIZED");
    }

    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) {
      return sendError(res, "Business profile not found", 404, "ERR_BUSINESS_NOT_FOUND");
    }

    const personnel = await BusinessPersonnel.findAll({
      where: { businessId: business.id },
      order: [["id", "ASC"]],
    });

    return sendSuccess(res, {
      total: personnel.length,
      personnel,
    });
  } catch (error) {
    console.error("Get Personnel Error:", error);
    return sendError(res, "Failed to fetch key personnel", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 12. DELETE /api/v1/vendor/personnel/:id
 * Logged-in vendor ke kisi executive profile ko remove karta hai
 */
export async function deletePersonnel(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Please login first", 401, "ERR_UNAUTHORIZED");
    }

    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) {
      return sendError(res, "Business profile not found", 404, "ERR_BUSINESS_NOT_FOUND");
    }

    const personnelId = Number(req.params.id);
    if (isNaN(personnelId) || personnelId <= 0) {
      return sendError(res, "Invalid personnel ID", 400, "ERR_INVALID_ID");
    }

    const person = await BusinessPersonnel.findOne({
      where: {
        id: personnelId,
        businessId: business.id,
      },
    });

    if (!person) {
      return sendError(res, "Personnel profile not found or not owned by your company", 404, "ERR_NOT_FOUND");
    }

    await person.destroy();

    return sendSuccess(res, {
      message: "Executive profile removed successfully",
      personnelId,
    });
  } catch (error) {
    console.error("Delete Personnel Error:", error);
    return sendError(res, "Failed to delete key personnel", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 14. PATCH /api/v1/vendor/personnel/:id
 * Logged-in vendor ke existing key executive / department head profile ko update karta hai
 */
export async function updatePersonnel(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Please login first", 401, "ERR_UNAUTHORIZED");
    }

    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) {
      return sendError(res, "Business profile not found", 404, "ERR_BUSINESS_NOT_FOUND");
    }

    const personnelId = Number(req.params.id);
    if (isNaN(personnelId) || personnelId <= 0) {
      return sendError(res, "Invalid personnel ID", 400, "ERR_INVALID_ID");
    }

    const person = await BusinessPersonnel.findOne({
      where: {
        id: personnelId,
        businessId: business.id,
      },
    });

    if (!person) {
      return sendError(
        res,
        "Personnel profile not found or not owned by your company",
        404,
        "ERR_NOT_FOUND"
      );
    }

    const {
      name,
      designation,
      department,
      email,
      mobile,
      photoUrl,
      isAuthorizedSignatory,
    } = req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        return sendError(res, "Personnel full name cannot be empty", 400, "ERR_VALIDATION");
      }
      person.name = name.trim();
    }

    if (designation !== undefined) {
      if (!designation.trim()) {
        return sendError(res, "Role / Designation cannot be empty", 400, "ERR_VALIDATION");
      }
      person.designation = designation.trim();
    }

    if (department !== undefined) {
      person.department = department ? department.trim() : null;
    }

    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim() || !emailRegex.test(email.trim())) {
        return sendError(res, "Valid corporate email is required", 400, "ERR_VALIDATION");
      }
      person.email = email.trim().toLowerCase();
    }

    if (mobile !== undefined) {
      if (!mobile.trim()) {
        return sendError(res, "Mobile / Phone number cannot be empty", 400, "ERR_VALIDATION");
      }
      person.mobile = mobile.trim();
    }

    if (photoUrl !== undefined) {
      person.photoUrl = photoUrl ? photoUrl.trim() : null;
    }

    if (isAuthorizedSignatory !== undefined) {
      person.isAuthorizedSignatory = Boolean(isAuthorizedSignatory);
    }

    await person.save();

    return sendSuccess(res, {
      message: "Key Executive profile updated successfully",
      personnel: person,
    });
  } catch (error) {
    console.error("Update Personnel Error:", error);
    return sendError(res, "Failed to update key personnel", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 15. POST /api/v1/vendor/documents
 * Statutory Proof Document upload ya update karta hai (Step 2 - Section 5)
 */
export async function uploadDocument(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Please login first", 401, "ERR_UNAUTHORIZED");
    }

    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) {
      return sendError(
        res,
        "Please create your business profile before uploading documents",
        404,
        "ERR_BUSINESS_NOT_FOUND"
      );
    }

    if (!req.file) {
      return sendError(
        res,
        "No document file uploaded. Please attach a file with field name 'document' (PDF, JPG, PNG)",
        400,
        "ERR_NO_FILE"
      );
    }

    const categoryKey = (
      req.body.categoryKey ||
      req.body.docType ||
      req.body.documentType ||
      req.body.type ||
      "incorporation_cert"
    ).trim();

    // Friendly Category Titles
    const friendlyMap: Record<string, string> = {
      incorporation_cert: "Certificate of Incorporation / Registration Proof",
      address_proof: "Corporate Address Proof / Electricity Bill",
      tax_registration: "Applicable Tax Registrations (GST & PAN Copies)",
      board_resolution: "Authorized Signatory Board Resolution / Letter",
    };

    const categoryName =
      req.body.categoryName?.trim() || friendlyMap[categoryKey] || categoryKey;
    const moduleCode = req.body.moduleCode?.trim() || "Module A";
    const issueDate = req.body.issueDate ? req.body.issueDate.trim() : null;
    const expiryDate = req.body.expiryDate ? req.body.expiryDate.trim() : null;
    const version = req.body.version ? req.body.version.trim() : "v1.0";

    const relativePath = `/uploads/documents/${req.file.filename}`;

    // Cryptographic SHA-256 Checksum calculation (Docs Section 2.6)
    let sha256Checksum: string | null = null;
    try {
      const fileBuffer = fs.readFileSync(req.file.path);
      sha256Checksum = crypto.createHash("sha256").update(fileBuffer).digest("hex");
    } catch (hashErr) {
      console.warn("Could not compute SHA-256 checksum:", hashErr);
    }

    // Upsert check: Agar is category ka document pehle se hai toh update karo aur purani file delete karo
    let documentRecord = await DocumentVault.findOne({
      where: {
        businessId: business.id,
        categoryKey,
      },
    });

    if (documentRecord) {
      // Purani file ko disk se delete karein agar exist karti ho
      try {
        const oldFilename = path.basename(documentRecord.fileUrl);
        const oldFilePath = path.join(process.cwd(), "uploads", "documents", oldFilename);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      } catch (cleanErr) {
        console.warn("Could not delete old document file:", cleanErr);
      }

      // Update record and reset status to PENDING
      documentRecord.fileName = req.file.originalname;
      documentRecord.fileUrl = relativePath;
      documentRecord.fileSizeBytes = req.file.size;
      documentRecord.mimeType = req.file.mimetype;
      documentRecord.sha256Checksum = sha256Checksum;
      documentRecord.version = version;
      documentRecord.status = "PENDING";
      documentRecord.issueDate = issueDate;
      documentRecord.expiryDate = expiryDate;
      documentRecord.rejectionReason = null;
      documentRecord.categoryName = categoryName;
      documentRecord.moduleCode = moduleCode;

      await documentRecord.save();
    } else {
      documentRecord = await DocumentVault.create({
        businessId: business.id,
        categoryKey,
        categoryName,
        moduleCode,
        fileName: req.file.originalname,
        fileUrl: relativePath,
        fileSizeBytes: req.file.size,
        mimeType: req.file.mimetype,
        sha256Checksum,
        version,
        status: "PENDING",
        issueDate,
        expiryDate,
      });
    }

    const fullUrl = `${req.protocol}://${req.get("host")}${relativePath}`;

    return sendSuccess(
      res,
      {
        message: "Document uploaded successfully and queued for verification",
        document: {
          ...documentRecord.toJSON(),
          fullUrl,
        },
      },
      201
    );
  } catch (error: any) {
    console.error("Upload Document Error:", error);
    return sendError(res, error.message || "Failed to upload document", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 16. GET /api/v1/vendor/documents
 * Logged-in vendor ke saare uploaded documents list karta hai
 */
export async function getDocuments(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Please login first", 401, "ERR_UNAUTHORIZED");
    }

    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) {
      return sendError(res, "Business profile not found", 404, "ERR_BUSINESS_NOT_FOUND");
    }

    const documents = await DocumentVault.findAll({
      where: { businessId: business.id },
      order: [["id", "ASC"]],
    });

    const mappedDocuments = documents.map((doc) => ({
      ...doc.toJSON(),
      fullUrl: `${req.protocol}://${req.get("host")}${doc.fileUrl}`,
    }));

    return sendSuccess(res, {
      total: mappedDocuments.length,
      documents: mappedDocuments,
    });
  } catch (error) {
    console.error("Get Documents Error:", error);
    return sendError(res, "Failed to fetch documents", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 17. DELETE /api/v1/vendor/documents/:id
 * Logged-in vendor ke kisi document ko delete karta hai
 */
export async function deleteDocument(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Please login first", 401, "ERR_UNAUTHORIZED");
    }

    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) {
      return sendError(res, "Business profile not found", 404, "ERR_BUSINESS_NOT_FOUND");
    }

    const docId = Number(req.params.id);
    if (isNaN(docId) || docId <= 0) {
      return sendError(res, "Invalid document ID", 400, "ERR_INVALID_ID");
    }

    const documentRecord = await DocumentVault.findOne({
      where: {
        id: docId,
        businessId: business.id,
      },
    });

    if (!documentRecord) {
      return sendError(res, "Document not found or not owned by your company", 404, "ERR_NOT_FOUND");
    }

    // Disk se file delete karein
    try {
      const filename = path.basename(documentRecord.fileUrl);
      const filePath = path.join(process.cwd(), "uploads", "documents", filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (cleanErr) {
      console.warn("Could not delete document file from disk:", cleanErr);
    }

    await documentRecord.destroy();

    return sendSuccess(res, {
      message: "Document removed successfully",
      documentId: docId,
    });
  } catch (error) {
    console.error("Delete Document Error:", error);
    return sendError(res, "Failed to delete document", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 18. POST /api/v1/vendor/save-capabilities
 * Step 3: Business Classification, Categories & Operational Capabilities
 * Saves across normalized relational tables atomically in a single ACID database transaction.
 */
export async function saveCapabilities(req: Request, res: Response) {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.user?.id;
    if (!userId) {
      await transaction.rollback();
      return sendError(res, "Please login first", 401, "ERR_UNAUTHORIZED");
    }

    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId }, transaction });
    if (!business) {
      await transaction.rollback();
      return sendError(
        res,
        "Please create your business profile before saving capabilities",
        404,
        "ERR_BUSINESS_NOT_FOUND"
      );
    }

    const {
      businessTypeCodes,
      selectedCategoryIds,
      selectedSubcategoryIds,
      businessActivities,
      manufacturingProcesses,
      machineryEquipment,
      installedCapacity,
      availableCapacity,
      hasRdLab,
      hasQcLab,
      offersCustomDevelopment,
      serviceTypes,
      serviceExpertise,
      geographicCoverage,
      deliveryCapacity,
      yearsInBusiness,
      numberOfFacilities,
      annualTurnoverRange,
      totalWorkforce,
      manufacturingLicenceDoc,
      facilityPhotos,
      technicalAuditDoc,
    } = req.body;

    const bId = business.id;
    const bTypeCodes = Array.isArray(businessTypeCodes) ? businessTypeCodes : [];
    const catIds = Array.isArray(selectedCategoryIds) ? selectedCategoryIds : [];
    const subcatIds = Array.isArray(selectedSubcategoryIds) ? selectedSubcategoryIds : [];
    const activities = Array.isArray(businessActivities) ? businessActivities : [];

    // 1. Relational Junction Table: vendor_business_types
    await VendorBusinessType.destroy({ where: { businessId: bId }, transaction });
    if (bTypeCodes.length > 0) {
      await VendorBusinessType.bulkCreate(
        bTypeCodes.map((code: string) => ({
          businessId: bId,
          businessTypeCode: String(code).trim(),
        })),
        { transaction, ignoreDuplicates: true }
      );
    }

    // 2. Relational Junction Table: vendor_categories
    await VendorCategory.destroy({ where: { businessId: bId }, transaction });
    if (catIds.length > 0) {
      const dbCats = await Category.findAll({
        where: { code: catIds },
        transaction,
      }).catch(() => []);
      const catMap = new Map(dbCats.map((c) => [c.code, c.name]));

      await VendorCategory.bulkCreate(
        catIds.map((cid: string) => ({
          businessId: bId,
          categoryId: String(cid).trim(),
          categoryName: catMap.get(String(cid).trim()) || null,
        })),
        { transaction, ignoreDuplicates: true }
      );
    }

    // 3. Relational Junction Table: vendor_subcategories
    await VendorSubcategory.destroy({ where: { businessId: bId }, transaction });
    if (subcatIds.length > 0) {
      const dbSubcats = await Subcategory.findAll({
        where: { code: subcatIds },
        transaction,
      }).catch(() => []);
      const subcatMap = new Map(dbSubcats.map((s) => [s.code, { catCode: s.categoryCode, name: s.name }]));

      await VendorSubcategory.bulkCreate(
        subcatIds.map((subId: string) => {
          const match = subcatMap.get(String(subId).trim());
          return {
            businessId: bId,
            categoryId: match?.catCode || catIds[0] || "CAT001",
            subcategoryId: String(subId).trim(),
            subcategoryName: match?.name || null,
          };
        }),
        { transaction, ignoreDuplicates: true }
      );
    }

    // 4. Relational Junction Table: vendor_business_activities
    await VendorBusinessActivity.destroy({ where: { businessId: bId }, transaction });
    if (activities.length > 0) {
      await VendorBusinessActivity.bulkCreate(
        activities.map((act: string) => ({
          businessId: bId,
          activityName: String(act).trim(),
        })),
        { transaction, ignoreDuplicates: true }
      );
    }

    // 5. Dedicated Table: business_manufacturing_capabilities
    const [mfgRecord] = await BusinessManufacturingCapability.findOrCreate({
      where: { businessId: bId },
      defaults: {
        businessId: bId,
        manufacturingProcesses: manufacturingProcesses?.trim() || null,
        machineryEquipment: machineryEquipment?.trim() || null,
        installedCapacity: installedCapacity?.trim() || null,
        availableCapacity: availableCapacity?.trim() || null,
        hasRdLab: Boolean(hasRdLab),
        hasQcLab: Boolean(hasQcLab),
        offersCustomDevelopment: Boolean(offersCustomDevelopment),
        manufacturingLicenceDoc: manufacturingLicenceDoc?.trim() || null,
        facilityPhotos: Array.isArray(facilityPhotos) ? facilityPhotos : null,
        technicalAuditDoc: technicalAuditDoc?.trim() || null,
      },
      transaction,
    });
    if (mfgRecord) {
      await mfgRecord.update(
        {
          manufacturingProcesses: manufacturingProcesses?.trim() || null,
          machineryEquipment: machineryEquipment?.trim() || null,
          installedCapacity: installedCapacity?.trim() || null,
          availableCapacity: availableCapacity?.trim() || null,
          hasRdLab: Boolean(hasRdLab),
          hasQcLab: Boolean(hasQcLab),
          offersCustomDevelopment: Boolean(offersCustomDevelopment),
          manufacturingLicenceDoc: manufacturingLicenceDoc?.trim() || null,
          facilityPhotos: Array.isArray(facilityPhotos) ? facilityPhotos : null,
          technicalAuditDoc: technicalAuditDoc?.trim() || null,
        },
        { transaction }
      );
    }

    // 6. Dedicated Table: business_service_capabilities
    const [svcRecord] = await BusinessServiceCapability.findOrCreate({
      where: { businessId: bId },
      defaults: {
        businessId: bId,
        serviceTypes: serviceTypes?.trim() || null,
        serviceExpertise: serviceExpertise?.trim() || null,
        geographicCoverage: geographicCoverage?.trim() || null,
        deliveryCapacity: deliveryCapacity?.trim() || null,
      },
      transaction,
    });
    if (svcRecord) {
      await svcRecord.update(
        {
          serviceTypes: serviceTypes?.trim() || null,
          serviceExpertise: serviceExpertise?.trim() || null,
          geographicCoverage: geographicCoverage?.trim() || null,
          deliveryCapacity: deliveryCapacity?.trim() || null,
        },
        { transaction }
      );
    }

    // 7. Dedicated Table: business_operating_profiles
    const [profileRecord] = await BusinessOperatingProfile.findOrCreate({
      where: { businessId: bId },
      defaults: {
        businessId: bId,
        yearsInBusiness: yearsInBusiness?.toString().trim() || null,
        numberOfFacilities: numberOfFacilities?.toString().trim() || null,
        annualTurnoverRange: annualTurnoverRange?.trim() || null,
        totalWorkforce: totalWorkforce?.trim() || null,
      },
      transaction,
    });
    if (profileRecord) {
      await profileRecord.update(
        {
          yearsInBusiness: yearsInBusiness?.toString().trim() || null,
          numberOfFacilities: numberOfFacilities?.toString().trim() || null,
          annualTurnoverRange: annualTurnoverRange?.trim() || null,
          totalWorkforce: totalWorkforce?.trim() || null,
        },
        { transaction }
      );
    }

    // Commit all tables together
    await transaction.commit();

    return sendSuccess(
      res,
      {
        message: "Business classification & capabilities saved across relational tables successfully",
        capabilities: {
          businessTypeCodes: bTypeCodes,
          selectedCategoryIds: catIds,
          selectedSubcategoryIds: subcatIds,
          businessActivities: activities,
          manufacturingProcesses: mfgRecord?.manufacturingProcesses || null,
          machineryEquipment: mfgRecord?.machineryEquipment || null,
          installedCapacity: mfgRecord?.installedCapacity || null,
          availableCapacity: mfgRecord?.availableCapacity || null,
          hasRdLab: Boolean(mfgRecord?.hasRdLab),
          hasQcLab: Boolean(mfgRecord?.hasQcLab),
          offersCustomDevelopment: Boolean(mfgRecord?.offersCustomDevelopment),
          serviceTypes: svcRecord?.serviceTypes || null,
          serviceExpertise: svcRecord?.serviceExpertise || null,
          geographicCoverage: svcRecord?.geographicCoverage || null,
          deliveryCapacity: svcRecord?.deliveryCapacity || null,
          yearsInBusiness: profileRecord?.yearsInBusiness || null,
          numberOfFacilities: profileRecord?.numberOfFacilities || null,
          annualTurnoverRange: profileRecord?.annualTurnoverRange || null,
          totalWorkforce: profileRecord?.totalWorkforce || null,
          manufacturing: mfgRecord,
          services: svcRecord,
          operatingProfile: profileRecord,
        },
      },
      201
    );
  } catch (error: any) {
    await transaction.rollback();
    console.error("Save Capabilities Error:", error);
    return sendError(res, error.message || "Failed to save capabilities", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 19. GET /api/v1/vendor/capabilities
 * Logged-in vendor ki saved Step 3 classification & capability details return karta hai
 * (Fetches from normalized relational tables)
 */
export async function getCapabilities(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Please login first", 401, "ERR_UNAUTHORIZED");
    }

    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) {
      return sendError(res, "Business profile not found", 404, "ERR_BUSINESS_NOT_FOUND");
    }

    const bId = business.id;

    // Fetch from all 7 normalized relational tables in parallel
    const [bTypes, cats, subcats, acts, mfg, svc, profile] = await Promise.all([
      VendorBusinessType.findAll({ where: { businessId: bId } }),
      VendorCategory.findAll({ where: { businessId: bId } }),
      VendorSubcategory.findAll({ where: { businessId: bId } }),
      VendorBusinessActivity.findAll({ where: { businessId: bId } }),
      BusinessManufacturingCapability.findOne({ where: { businessId: bId } }),
      BusinessServiceCapability.findOne({ where: { businessId: bId } }),
      BusinessOperatingProfile.findOne({ where: { businessId: bId } }),
    ]);

    const businessTypeCodes = bTypes.map((b) => b.businessTypeCode);
    const selectedCategoryIds = cats.map((c) => c.categoryId);
    const selectedSubcategoryIds = subcats.map((s) => s.subcategoryId);
    const businessActivities = acts.map((a) => a.activityName);

    const hasAnyData =
      bTypes.length > 0 ||
      cats.length > 0 ||
      subcats.length > 0 ||
      acts.length > 0 ||
      mfg !== null ||
      svc !== null ||
      profile !== null;

    if (!hasAnyData) {
      return sendSuccess(res, {
        message: "No capabilities profile configured yet",
        capabilities: null,
      });
    }

    const capabilities = {
      businessTypeCodes,
      selectedCategoryIds,
      selectedSubcategoryIds,
      businessActivities,
      manufacturingProcesses: mfg?.manufacturingProcesses || null,
      machineryEquipment: mfg?.machineryEquipment || null,
      installedCapacity: mfg?.installedCapacity || null,
      availableCapacity: mfg?.availableCapacity || null,
      hasRdLab: Boolean(mfg?.hasRdLab),
      hasQcLab: Boolean(mfg?.hasQcLab),
      offersCustomDevelopment: Boolean(mfg?.offersCustomDevelopment),
      manufacturingLicenceDoc: mfg?.manufacturingLicenceDoc || null,
      facilityPhotos: mfg?.facilityPhotos || null,
      technicalAuditDoc: mfg?.technicalAuditDoc || null,
      serviceTypes: svc?.serviceTypes || null,
      serviceExpertise: svc?.serviceExpertise || null,
      geographicCoverage: svc?.geographicCoverage || null,
      deliveryCapacity: svc?.deliveryCapacity || null,
      yearsInBusiness: profile?.yearsInBusiness || null,
      numberOfFacilities: profile?.numberOfFacilities || null,
      annualTurnoverRange: profile?.annualTurnoverRange || null,
      totalWorkforce: profile?.totalWorkforce || null,
      manufacturing: mfg,
      services: svc,
      operatingProfile: profile,
      vendorBusinessTypes: bTypes,
      vendorCategories: cats,
      vendorSubcategories: subcats,
      vendorActivities: acts,
    };

    return sendSuccess(res, { capabilities });
  } catch (error) {
    console.error("Get Capabilities Error:", error);
    return sendError(res, "Failed to fetch capabilities", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 20. PATCH /api/v1/vendor/capabilities (Delegates to atomic saveCapabilities)
 */
export const updateCapabilities = saveCapabilities;

// ══════════════════════════════════════════════════════════════════════════════
// STEP 4: PRODUCTS, SERVICES & QUALITY CERTIFICATIONS CONTROLLERS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Helper: Product image array normalize karta hai (handles JSON string, single string, array, Windows backslashes)
 */
function normalizeProductImages(raw: unknown): string[] | null {
  if (!raw) return null;
  let items: unknown[] = [];
  if (Array.isArray(raw)) {
    items = raw;
  } else if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) items = parsed;
      } catch {
        items = [trimmed];
      }
    } else if (trimmed) {
      items = [trimmed];
    }
  }

  const normalized = items
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .map((x) => x.trim().replace(/\\/g, "/"))
    .map((x) => {
      if (!x.startsWith("http://") && !x.startsWith("https://") && !x.startsWith("blob:") && !x.startsWith("data:")) {
        return x.startsWith("/") ? x : `/${x}`;
      }
      return x;
    });

  return normalized.length > 0 ? normalized : null;
}

/**
 * Helper: Product payload sanitize aur default values assign karta hai
 */
function sanitizeProductInput(p: any, businessId: number) {
  return {
    businessId,
    name: p.name?.trim(),
    type: (p.type === "Service" ? "Service" : "Product") as "Product" | "Service",
    categoryId: p.categoryId?.trim(),
    subcategoryId: p.subcategoryId?.trim() || null,
    brand: p.brand?.trim() || null,
    description: p.description?.trim() || null,
    specifications: p.specifications?.trim() || null,
    grade: p.grade?.trim() || null,
    standards: p.standards?.trim() || null,
    hsnCode: p.hsnCode?.trim() || null,
    countryOfOrigin: p.countryOfOrigin?.trim() || "India",
    moq: p.moq?.trim() || null,
    standardOrderQty: p.standardOrderQty?.trim() || null,
    monthlyCapacity: p.monthlyCapacity?.trim() || null,
    availableStock: p.availableStock?.trim() || null,
    leadTimeDays: p.leadTimeDays?.trim() || null,
    sampleAvailability: (["Available Free", "Available Paid", "Not Available"].includes(p.sampleAvailability)
      ? p.sampleAvailability
      : "Available Free") as "Available Free" | "Available Paid" | "Not Available",
    indicativePrice: p.indicativePrice ? String(p.indicativePrice).trim() : null,
    currency: p.currency?.trim() || "INR",
    priceValidity: p.priceValidity?.trim() || null,
    targetMarkets: p.targetMarkets?.trim() || null,
    images: normalizeProductImages(p.images),
    catalogueDoc: p.catalogueDoc?.trim() || null,
    technicalDataSheetDoc: p.technicalDataSheetDoc?.trim() || null,
    coaDoc: p.coaDoc?.trim() || null,
    sdsDoc: p.sdsDoc?.trim() || null,
  };
}

/**
 * 21. POST /api/v1/vendor/products
 * Step 4: Vendor Catalog mein Product / Service add karta hai
 * Docs & Master Categories flow ke mutabiq clean implementation
 */
export async function addProduct(req: Request, res: Response) {
  try {
    // 1. User & Business check
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Please login first", 401, "ERR_UNAUTHORIZED");
    }

    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) {
      return sendError(res, "Please create company profile first (Step 2)", 404, "ERR_BUSINESS_NOT_FOUND");
    }

    // 2. Handle single product image upload using Multer
    await productUploadAsync(req, res);
    const productImageUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/products/${req.file.filename}`
      : null;

    // 3. Agar Array input bheja ho (Bulk Products Add)
    if (Array.isArray(req.body)) {
      if (req.body.length === 0) {
        return sendError(res, "Product list cannot be empty", 400, "ERR_EMPTY_PAYLOAD");
      }
      // Process each product with image upload
      const itemsToCreate = req.body.map((item: any) => {
        const imageUrl = item.imageUrl || productImageUrl || null;
        // Build product object with all fields
        const productData: any = {
          name: item.name?.trim() || "",
          type: item.type === "Service" ? "Service" : "Product",
          categoryId: item.categoryId || "CAT001",
          subcategoryId: item.subcategoryId || null,
          brand: item.brand?.trim() || null,
          description: item.description?.trim() || null,
          specifications: item.specifications?.trim() || null,
          grade: item.grade?.trim() || null,
          standards: item.standards?.trim() || null,
          hsnCode: item.hsnCode?.trim() || null,
          countryOfOrigin: item.countryOfOrigin || "India",
          moq: item.moq?.trim() || null,
          standardOrderQty: item.standardOrderQty?.trim() || null,
          monthlyCapacity: item.monthlyCapacity?.trim() || null,
          availableStock: item.availableStock?.trim() || null,
          leadTimeDays: item.leadTimeDays?.trim() || null,
          sampleAvailability:
            ["Available Free", "Available Paid", "Not Available"].includes(
              item.sampleAvailability
            )
              ? item.sampleAvailability
              : "Available Free",
          indicativePrice: item.indicativePrice
            ? String(item.indicativePrice).trim()
            : null,
          currency: item.currency?.trim() || "INR",
          priceValidity: item.priceValidity?.trim() || null,
          targetMarkets: item.targetMarkets?.trim() || null,
          imageUrl: imageUrl,
          images: item.images || [],
          catalogueDoc: item.catalogueDoc?.trim() || null,
          technicalDataSheetDoc: item.technicalDataSheetDoc?.trim() || null,
          coaDoc: item.coaDoc?.trim() || null,
          sdsDoc: item.sdsDoc?.trim() || null,
        };
        return productData;
      });
      const products = await BusinessProduct.bulkCreate(itemsToCreate);
      return sendSuccess(
        res,
        {
          message: `${products.length} Products added to catalog successfully`,
          count: products.length,
          products,
        },
        201
      );
    }

    // 4. Normal Single Product: Fields destructure karein
    const {
      name,
      type,
      categoryId,
      subcategoryId,
      brand,
      description,
      specifications,
      grade,
      standards,
      hsnCode,
      countryOfOrigin,
      moq,
      standardOrderQty,
      monthlyCapacity,
      availableStock,
      leadTimeDays,
      sampleAvailability,
      indicativePrice,
      currency,
      priceValidity,
      targetMarkets,
      images,
      catalogueDoc,
      technicalDataSheetDoc,
      coaDoc,
      sdsDoc,
    } = req.body;

    // 5. Category ko Master Table se fetch karein (Code ya ID se)
    let masterCategory = await Category.findOne({
      where: isNaN(Number(categoryId))
        ? { code: categoryId.trim() }
        : { id: Number(categoryId) },
    });

    if (!masterCategory) {
      masterCategory = await Category.findOne({
        where: { name: categoryId.trim() },
      });
    }

    const effectiveCategoryCode = masterCategory ? masterCategory.code : (categoryId?.trim() || "CAT001");
    const effectiveCategoryName = masterCategory ? masterCategory.name : "Commercial Category";

    // 7. Subcategory ko Master Table se fetch karein (Agar di ho)
    let subcategoryName: string | null = null;
    let effectiveSubcategory = subcategoryId && typeof subcategoryId === "string" ? subcategoryId.trim() : null;
    if (effectiveSubcategory) {
      const masterSub = await Subcategory.findOne({
        where: isNaN(Number(effectiveSubcategory))
          ? { code: effectiveSubcategory }
          : { id: Number(effectiveSubcategory) },
      });

      if (masterSub) {
        subcategoryName = masterSub.name;
      }
    }

    // 8. Database mein Product create karein
    const product = await BusinessProduct.create({
      businessId: business.id,
      name: name.trim(),
      type: type === "Service" ? "Service" : "Product",
      categoryId: effectiveCategoryCode,
      subcategoryId: effectiveSubcategory,
      brand: brand?.trim() || null,
      description: description?.trim() || null,
      specifications: specifications?.trim() || null,
      grade: grade?.trim() || null,
      standards: standards?.trim() || null,
      hsnCode: hsnCode?.trim() || null,
      countryOfOrigin: countryOfOrigin?.trim() || "India",
      moq: moq?.trim() || null,
      standardOrderQty: standardOrderQty?.trim() || null,
      monthlyCapacity: monthlyCapacity?.trim() || null,
      availableStock: availableStock?.trim() || null,
      leadTimeDays: leadTimeDays?.trim() || null,
      sampleAvailability: ["Available Free", "Available Paid", "Not Available"].includes(sampleAvailability)
        ? sampleAvailability
        : "Available Free",
      indicativePrice: indicativePrice ? String(indicativePrice).trim() : null,
      currency: currency?.trim() || "INR",
      priceValidity: priceValidity?.trim() || null,
      targetMarkets: targetMarkets?.trim() || null,
      images: normalizeProductImages(images || (productImageUrl ? [productImageUrl] : [])),
      catalogueDoc: catalogueDoc?.trim() || null,
      technicalDataSheetDoc: technicalDataSheetDoc?.trim() || null,
      coaDoc: coaDoc?.trim() || null,
      sdsDoc: sdsDoc?.trim() || null,
    });

    // 9. Success Response bhejein
    return sendSuccess(
      res,
      {
        message: "Product added to catalog successfully",
        categoryName: effectiveCategoryName,
        ...(subcategoryName ? { subcategoryName } : {}),
        product,
      },
      201
    );
  } catch (error: any) {
    console.error("Add Product Error:", error);
    return sendError(res, error.message || "Failed to add product", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 22. GET /api/v1/vendor/products
 * Logged-in vendor ke saare added products/services list karta hai
 */
export async function getProducts(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Please login first", 401, "ERR_UNAUTHORIZED");
    }

    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) {
      return sendError(res, "Business profile not found", 404, "ERR_BUSINESS_NOT_FOUND");
    }

    const products = await BusinessProduct.findAll({
      where: { businessId: business.id },
      order: [["id", "ASC"]],
    });

    return sendSuccess(res, {
      total: products.length,
      products,
    });
  } catch (error: any) {
    console.error("Get Products Error:", error);
    return sendError(res, error.message || "Failed to fetch products", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 23. PATCH /api/v1/vendor/products/:id
 * Specific product ke fields (e.g. price, stock, specs) update karta hai (Partial Update)
 */
export async function updateProduct(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Please login first", 401, "ERR_UNAUTHORIZED");
    }

    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) {
      return sendError(res, "Business profile not found", 404, "ERR_BUSINESS_NOT_FOUND");
    }

    const productId = Number(req.params.id);
    if (isNaN(productId) || productId <= 0) {
      return sendError(res, "Invalid product ID", 400, "ERR_INVALID_ID");
    }

    const product = await BusinessProduct.findOne({
      where: {
        id: productId,
        businessId: business.id,
      },
    });

    if (!product) {
      return sendError(res, "Product not found or not owned by your company", 404, "ERR_NOT_FOUND");
    }

    // Partial update only on fields provided in req.body
    const fields = [
      "name",
      "type",
      "categoryId",
      "subcategoryId",
      "brand",
      "description",
      "specifications",
      "grade",
      "standards",
      "hsnCode",
      "countryOfOrigin",
      "moq",
      "standardOrderQty",
      "monthlyCapacity",
      "availableStock",
      "leadTimeDays",
      "sampleAvailability",
      "indicativePrice",
      "currency",
      "priceValidity",
      "targetMarkets",
      "imageUrl",
      "images",
      "catalogueDoc",
      "technicalDataSheetDoc",
      "coaDoc",
      "sdsDoc",
    ] as const;

    for (const key of fields) {
      if (req.body[key] !== undefined) {
        if (key === "images") {
          product.images = normalizeProductImages(req.body.images);
        } else if (typeof req.body[key] === "string") {
          (product as any)[key] = req.body[key].trim() || null;
        } else {
          (product as any)[key] = req.body[key];
        }
      }
    }

    await product.save();

    return sendSuccess(res, {
      message: "Product details updated successfully",
      product,
    });
  } catch (error: any) {
    console.error("Update Product Error:", error);
    return sendError(res, error.message || "Failed to update product", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 24. DELETE /api/v1/vendor/products/:id
 * Product ko logged-in vendor ke catalog se delete karta hai
 */
export async function deleteProduct(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Please login first", 401, "ERR_UNAUTHORIZED");
    }

    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) {
      return sendError(res, "Business profile not found", 404, "ERR_BUSINESS_NOT_FOUND");
    }

    const productId = Number(req.params.id);
    if (isNaN(productId) || productId <= 0) {
      return sendError(res, "Invalid product ID", 400, "ERR_INVALID_ID");
    }

    const product = await BusinessProduct.findOne({
      where: {
        id: productId,
        businessId: business.id,
      },
    });

    if (!product) {
      return sendError(res, "Product not found or not owned by your company", 404, "ERR_NOT_FOUND");
    }

    await product.destroy();

    return sendSuccess(res, {
      message: "Product removed from catalog successfully",
      productId,
    });
  } catch (error: any) {
    console.error("Delete Product Error:", error);
    return sendError(res, error.message || "Failed to delete product", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * Helper: Single certificate input sanitize karta hai
 */
function sanitizeCertInput(c: any, businessId: number) {
  return {
    businessId,
    category: c.category === "REGULATORY_APPROVAL" ? "REGULATORY_APPROVAL" : "QUALITY_CERT",
    certificateType: c.certificateType?.trim(),
    certificateNumber: c.certificateNumber?.trim(),
    issuingAuthority: c.issuingAuthority?.trim(),
    issueDate: c.issueDate ? c.issueDate.trim() : null,
    expiryDate: c.expiryDate ? c.expiryDate.trim() : null,
    scope: c.scope?.trim() || null,
    applicableFacility: c.applicableFacility?.trim() || "All Facilities",
    evidenceDoc: c.evidenceDoc?.trim() || null,
    status: ["Active", "Expiring Soon", "Expired"].includes(c.status) ? c.status : "Active",
  };
}

/**
 * 25. POST /api/v1/vendor/certifications
 * Step 4: Quality & Compliance Certificates add karta hai (e.g. ISO 9001, WHO-GMP, CE, BIS)
 */
export async function addCertification(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Please login first", 401, "ERR_UNAUTHORIZED");
    }

    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) {
      return sendError(
        res,
        "Please create your business profile before adding certificates",
        404,
        "ERR_BUSINESS_NOT_FOUND"
      );
    }

    const isArrayInput = Array.isArray(req.body);
    const rawItems = isArrayInput ? req.body : [req.body];

    const sanitizedList = rawItems.map((item: any) => sanitizeCertInput(item, business.id));
    const createdCerts = await Certification.bulkCreate(sanitizedList);

    return sendSuccess(
      res,
      {
        message: isArrayInput
          ? `${createdCerts.length} Certificates added successfully`
          : "Certificate added successfully",
        count: createdCerts.length,
        certifications: isArrayInput ? createdCerts : createdCerts[0],
      },
      201
    );
  } catch (error: any) {
    console.error("Add Certification Error:", error);
    return sendError(res, error.message || "Failed to add certificate", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 26. GET /api/v1/vendor/certifications
 * Logged-in vendor ke saare added quality certificates list karta hai
 */
export async function getCertifications(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Please login first", 401, "ERR_UNAUTHORIZED");
    }

    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) {
      return sendError(res, "Business profile not found", 404, "ERR_BUSINESS_NOT_FOUND");
    }

    const certs = await Certification.findAll({
      where: { businessId: business.id },
      order: [["id", "ASC"]],
    });

    return sendSuccess(res, {
      total: certs.length,
      certifications: certs,
    });
  } catch (error: any) {
    console.error("Get Certifications Error:", error);
    return sendError(res, error.message || "Failed to fetch certificates", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 27. PATCH /api/v1/vendor/certifications/:id
 * Specific certificate ki details (issue/expiry date, facility, status) update karta hai
 */
export async function updateCertification(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Please login first", 401, "ERR_UNAUTHORIZED");
    }

    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) {
      return sendError(res, "Business profile not found", 404, "ERR_BUSINESS_NOT_FOUND");
    }

    const certId = Number(req.params.id);
    if (isNaN(certId) || certId <= 0) {
      return sendError(res, "Invalid certificate ID", 400, "ERR_INVALID_ID");
    }

    const cert = await Certification.findOne({
      where: {
        id: certId,
        businessId: business.id,
      },
    });

    if (!cert) {
      return sendError(res, "Certificate not found or not owned by your company", 404, "ERR_NOT_FOUND");
    }

    const fields = [
      "category",
      "certificateType",
      "certificateNumber",
      "issuingAuthority",
      "issueDate",
      "expiryDate",
      "scope",
      "applicableFacility",
      "evidenceDoc",
      "status",
    ] as const;

    for (const key of fields) {
      if (req.body[key] !== undefined) {
        if (typeof req.body[key] === "string") {
          (cert as any)[key] = req.body[key].trim() || null;
        } else {
          (cert as any)[key] = req.body[key];
        }
      }
    }

    await cert.save();

    return sendSuccess(res, {
      message: "Certificate updated successfully",
      certification: cert,
    });
  } catch (error: any) {
    console.error("Update Certification Error:", error);
    return sendError(res, error.message || "Failed to update certificate", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 28. DELETE /api/v1/vendor/certifications/:id
 * Certificate ko logged-in vendor ke profile se delete karta hai
 */
export async function deleteCertification(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Please login first", 401, "ERR_UNAUTHORIZED");
    }

    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) {
      return sendError(res, "Business profile not found", 404, "ERR_BUSINESS_NOT_FOUND");
    }

    const certId = Number(req.params.id);
    if (isNaN(certId) || certId <= 0) {
      return sendError(res, "Invalid certificate ID", 400, "ERR_INVALID_ID");
    }

    const cert = await Certification.findOne({
      where: {
        id: certId,
        businessId: business.id,
      },
    });

    if (!cert) {
      return sendError(res, "Certificate not found or not owned by your company", 404, "ERR_NOT_FOUND");
    }

    await cert.destroy();

    return sendSuccess(res, {
      message: "Certificate removed successfully",
      certificateId: certId,
    });
  } catch (error: any) {
    console.error("Delete Certification Error:", error);
    return sendError(res, error.message || "Failed to delete certificate", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 29. PATCH /api/v1/vendor/quality-systems
 * Step 4 Section 3: Testing Capabilities, Calibration & QA Procedures save/update karta hai
 */
export async function updateQualitySystems(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Please login first", 401, "ERR_UNAUTHORIZED");
    }

    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) {
      return sendError(res, "Business profile not found", 404, "ERR_BUSINESS_NOT_FOUND");
    }

    const { testingCapabilities, qualityAssuranceProcedures } = req.body;

    let mfg = await BusinessManufacturingCapability.findOne({
      where: { businessId: business.id },
    });

    if (!mfg) {
      mfg = await BusinessManufacturingCapability.create({
        businessId: business.id,
        testingCapabilities: testingCapabilities?.trim() || null,
        qualityAssuranceProcedures: qualityAssuranceProcedures?.trim() || null,
      });
    } else {
      if (testingCapabilities !== undefined) {
        mfg.testingCapabilities = testingCapabilities?.trim() || null;
      }
      if (qualityAssuranceProcedures !== undefined) {
        mfg.qualityAssuranceProcedures = qualityAssuranceProcedures?.trim() || null;
      }
      await mfg.save();
    }

    return sendSuccess(res, {
      message: "Quality systems & QA procedures updated successfully",
      qualitySystems: {
        testingCapabilities: mfg.testingCapabilities,
        qualityAssuranceProcedures: mfg.qualityAssuranceProcedures,
      },
    });
  } catch (error: any) {
    console.error("Update Quality Systems Error:", error);
    return sendError(res, error.message || "Failed to update quality systems", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 23. POST /api/v1/vendor/commercial
 * POST /api/v1/vendor/add-commercial
 * PATCH /api/v1/vendor/commercial
 * Step 5: Commercial Terms, Logistics, Banking & Settlement, and Due Diligence Declarations
 */
export async function saveCommercialDetails(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Unauthorized access", 401, "ERR_UNAUTHORIZED");
    }

    const business = await BusinessEntity.findOne({
      where: { ownerUserId: userId },
    });

    if (!business) {
      return sendError(
        res,
        "Business profile not found. Please complete Step 2 first.",
        404,
        "ERR_NOT_FOUND"
      );
    }

    // 1. Client ke req.body se har ek field ko explicitly extract karein
    const {
      // 1. Functional Department Contacts
      departmentContacts,

      // 2. Commercial Terms
      acceptedCurrencies,
      paymentMethods,
      advancePaymentPercentage,
      creditTermsDays,
      moqPolicy,
      samplePolicy,
      warrantyTerms,
      returnPolicy,

      // 3. Trade Operations & Logistics
      importerExporterStatus,
      iecNumber,
      sourcingCountries,
      exportMarkets,
      annualTradeTurnover,
      preferredIncoterms,
      freightArrangements,
      customsClearanceAssistance,
      exportPackagingStandards,
      coldChainCapability,
      tradeReferences,

      // 4. Banking & Settlement Details
      accountHolderName,
      bankName,
      accountType,
      accountNumber,
      ifscCode,
      swiftBicCode,
      bankBranch,
      bankCountry,
      bankProofDoc,

      // 5. Due Diligence & KYC Declarations
      lawfullyScreened,
      noConflictOfInterest,
      sanctionsFreeDeclaration,
      authorityConsent,
    } = req.body;

    // ─── ACID Database Transaction for Multi-Table Save ─────────────────────
    const transaction = await sequelize.transaction();
    try {
      // 1. Department Contacts
      let contactsList: any[] = [];
      if (Array.isArray(departmentContacts)) {
        await BusinessDepartmentContact.destroy({
          where: { businessId: business.id },
          transaction,
        });
        const validContacts = departmentContacts
          .filter((c: any) => c && (c.name?.trim() || c.email?.trim() || c.phone?.trim()))
          .map((c: any) => ({
            businessId: business.id,
            department: c.department || "Sales & Inquiries",
            name: c.name?.trim() || "Contact Person",
            designation: c.designation?.trim() || null,
            email: c.email?.trim() || null,
            phone: c.phone?.trim() || null,
            isPrimary: Boolean(c.isPrimary),
          }));
        if (validContacts.length > 0) {
          contactsList = await BusinessDepartmentContact.bulkCreate(validContacts, {
            transaction,
          });
        }
      } else {
        contactsList = await BusinessDepartmentContact.findAll({
          where: { businessId: business.id },
          order: [["isPrimary", "DESC"], ["id", "ASC"]],
          transaction,
        });
      }

      // 2. Commercial Terms
      const [terms] = await BusinessCommercialTerms.findOrCreate({
        where: { businessId: business.id },
        defaults: {
          businessId: business.id,
          acceptedCurrencies:
            Array.isArray(acceptedCurrencies) && acceptedCurrencies.length > 0
              ? acceptedCurrencies
              : ["INR"],
          paymentMethods:
            Array.isArray(paymentMethods) && paymentMethods.length > 0
              ? paymentMethods
              : ["Bank Transfer (NEFT/RTGS)"],
          advancePaymentPercentage: advancePaymentPercentage?.trim() || "20%",
          creditTermsDays: creditTermsDays?.trim() || "30 Days Net",
          moqPolicy: moqPolicy?.trim() || null,
          samplePolicy: samplePolicy?.trim() || null,
          warrantyTerms: warrantyTerms?.trim() || null,
          returnPolicy: returnPolicy?.trim() || null,
        },
        transaction,
      });
      if (terms) {
        await terms.update(
          {
            acceptedCurrencies:
              Array.isArray(acceptedCurrencies) && acceptedCurrencies.length > 0
                ? acceptedCurrencies
                : terms.acceptedCurrencies,
            paymentMethods:
              Array.isArray(paymentMethods) && paymentMethods.length > 0
                ? paymentMethods
                : terms.paymentMethods,
            advancePaymentPercentage:
              advancePaymentPercentage !== undefined
                ? advancePaymentPercentage?.trim() || null
                : terms.advancePaymentPercentage,
            creditTermsDays:
              creditTermsDays !== undefined
                ? creditTermsDays?.trim() || null
                : terms.creditTermsDays,
            moqPolicy:
              moqPolicy !== undefined ? moqPolicy?.trim() || null : terms.moqPolicy,
            samplePolicy:
              samplePolicy !== undefined ? samplePolicy?.trim() || null : terms.samplePolicy,
            warrantyTerms:
              warrantyTerms !== undefined ? warrantyTerms?.trim() || null : terms.warrantyTerms,
            returnPolicy:
              returnPolicy !== undefined ? returnPolicy?.trim() || null : terms.returnPolicy,
          },
          { transaction }
        );
      }

      // 3. Trade Operations & Logistics
      const [trade] = await BusinessTradeLogistics.findOrCreate({
        where: { businessId: business.id },
        defaults: {
          businessId: business.id,
          importerExporterStatus: importerExporterStatus || "Domestic Only",
          iecNumber: iecNumber?.trim() || null,
          sourcingCountries: sourcingCountries?.trim() || null,
          exportMarkets: exportMarkets?.trim() || null,
          annualTradeTurnover: annualTradeTurnover?.trim() || null,
          preferredIncoterms: Array.isArray(preferredIncoterms) ? preferredIncoterms : ["FOB"],
          freightArrangements: freightArrangements?.trim() || null,
          customsClearanceAssistance: Boolean(customsClearanceAssistance),
          exportPackagingStandards: exportPackagingStandards?.trim() || null,
          coldChainCapability: Boolean(coldChainCapability),
          tradeReferences: tradeReferences?.trim() || null,
        },
        transaction,
      });
      if (trade) {
        await trade.update(
          {
            importerExporterStatus: importerExporterStatus || trade.importerExporterStatus,
            iecNumber: iecNumber !== undefined ? iecNumber?.trim() || null : trade.iecNumber,
            sourcingCountries:
              sourcingCountries !== undefined
                ? sourcingCountries?.trim() || null
                : trade.sourcingCountries,
            exportMarkets:
              exportMarkets !== undefined ? exportMarkets?.trim() || null : trade.exportMarkets,
            annualTradeTurnover:
              annualTradeTurnover !== undefined
                ? annualTradeTurnover?.trim() || null
                : trade.annualTradeTurnover,
            preferredIncoterms: Array.isArray(preferredIncoterms)
              ? preferredIncoterms
              : trade.preferredIncoterms,
            freightArrangements:
              freightArrangements !== undefined
                ? freightArrangements?.trim() || null
                : trade.freightArrangements,
            customsClearanceAssistance:
              customsClearanceAssistance !== undefined
                ? Boolean(customsClearanceAssistance)
                : trade.customsClearanceAssistance,
            exportPackagingStandards:
              exportPackagingStandards !== undefined
                ? exportPackagingStandards?.trim() || null
                : trade.exportPackagingStandards,
            coldChainCapability:
              coldChainCapability !== undefined
                ? Boolean(coldChainCapability)
                : trade.coldChainCapability,
            tradeReferences:
              tradeReferences !== undefined ? tradeReferences?.trim() || null : trade.tradeReferences,
          },
          { transaction }
        );
      }

      // 4. Banking & Financial Settlement Details
      const [banking] = await BusinessBankingDetails.findOrCreate({
        where: { businessId: business.id },
        defaults: {
          businessId: business.id,
          accountHolderName: accountHolderName?.trim() || business.legalName || business.name,
          bankName: bankName?.trim() || "Primary Operating Bank",
          accountType: accountType || "Current Account",
          accountNumber: accountNumber?.trim() || "Pending",
          ifscCode: ifscCode?.trim() || "PENDING0001",
          swiftBicCode: swiftBicCode?.trim() || null,
          bankBranch: bankBranch?.trim() || null,
          bankCountry: bankCountry?.trim() || "India",
          bankProofDoc: bankProofDoc?.trim() || null,
        },
        transaction,
      });
      if (banking) {
        await banking.update(
          {
            accountHolderName:
              accountHolderName !== undefined ? accountHolderName.trim() : banking.accountHolderName,
            bankName: bankName !== undefined ? bankName.trim() : banking.bankName,
            accountType: accountType || banking.accountType,
            accountNumber:
              accountNumber !== undefined ? accountNumber.trim() : banking.accountNumber,
            ifscCode: ifscCode !== undefined ? ifscCode.trim() : banking.ifscCode,
            swiftBicCode:
              swiftBicCode !== undefined ? swiftBicCode?.trim() || null : banking.swiftBicCode,
            bankBranch: bankBranch !== undefined ? bankBranch?.trim() || null : banking.bankBranch,
            bankCountry:
              bankCountry !== undefined ? bankCountry?.trim() || "India" : banking.bankCountry,
            bankProofDoc:
              bankProofDoc !== undefined ? bankProofDoc?.trim() || null : banking.bankProofDoc,
          },
          { transaction }
        );
      }

      // 5. Compliance & Due Diligence Declarations
      const [compliance] = await BusinessComplianceDeclarations.findOrCreate({
        where: { businessId: business.id },
        defaults: {
          businessId: business.id,
          lawfullyScreened: lawfullyScreened !== undefined ? Boolean(lawfullyScreened) : true,
          noConflictOfInterest:
            noConflictOfInterest !== undefined ? Boolean(noConflictOfInterest) : true,
          sanctionsFreeDeclaration:
            sanctionsFreeDeclaration !== undefined ? Boolean(sanctionsFreeDeclaration) : true,
          authorityConsent: authorityConsent !== undefined ? Boolean(authorityConsent) : true,
        },
        transaction,
      });
      if (compliance) {
        await compliance.update(
          {
            lawfullyScreened:
              lawfullyScreened !== undefined ? Boolean(lawfullyScreened) : compliance.lawfullyScreened,
            noConflictOfInterest:
              noConflictOfInterest !== undefined
                ? Boolean(noConflictOfInterest)
                : compliance.noConflictOfInterest,
            sanctionsFreeDeclaration:
              sanctionsFreeDeclaration !== undefined
                ? Boolean(sanctionsFreeDeclaration)
                : compliance.sanctionsFreeDeclaration,
            authorityConsent:
              authorityConsent !== undefined ? Boolean(authorityConsent) : compliance.authorityConsent,
          },
          { transaction }
        );
      }

      // Commit the transaction across all 5 tables
      await transaction.commit();

      // Synthesized commercial object for seamless backward compatibility
      const commercial = {
        departmentContacts: contactsList,
        acceptedCurrencies: terms.acceptedCurrencies,
        paymentMethods: terms.paymentMethods,
        advancePaymentPercentage: terms.advancePaymentPercentage,
        creditTermsDays: terms.creditTermsDays,
        moqPolicy: terms.moqPolicy,
        samplePolicy: terms.samplePolicy,
        warrantyTerms: terms.warrantyTerms,
        returnPolicy: terms.returnPolicy,
        importerExporterStatus: trade.importerExporterStatus,
        iecNumber: trade.iecNumber,
        sourcingCountries: trade.sourcingCountries,
        exportMarkets: trade.exportMarkets,
        annualTradeTurnover: trade.annualTradeTurnover,
        preferredIncoterms: trade.preferredIncoterms,
        freightArrangements: trade.freightArrangements,
        customsClearanceAssistance: trade.customsClearanceAssistance,
        exportPackagingStandards: trade.exportPackagingStandards,
        coldChainCapability: trade.coldChainCapability,
        tradeReferences: trade.tradeReferences,
        accountHolderName: banking.accountHolderName,
        bankName: banking.bankName,
        accountType: banking.accountType,
        accountNumber: banking.accountNumber,
        ifscCode: banking.ifscCode,
        swiftBicCode: banking.swiftBicCode,
        bankBranch: banking.bankBranch,
        bankCountry: banking.bankCountry,
        bankProofDoc: banking.bankProofDoc,
        isBankVerified: banking.isBankVerified,
        lawfullyScreened: compliance.lawfullyScreened,
        noConflictOfInterest: compliance.noConflictOfInterest,
        sanctionsFreeDeclaration: compliance.sanctionsFreeDeclaration,
        authorityConsent: compliance.authorityConsent,
      };

      return sendSuccess(
        res,
        {
          message:
            "Commercial terms, trade operations and banking details saved successfully in relational database",
          commercial,
          departmentContacts: contactsList,
          commercialTerms: terms,
          tradeLogistics: trade,
          bankingDetails: banking,
          complianceDeclarations: compliance,
        },
        200
      );
    } catch (saveError: any) {
      await transaction.rollback();
      throw saveError;
    }
  } catch (error: any) {
    console.error("Save Commercial Details Error:", error);
    return sendError(
      res,
      error.message || "Failed to save commercial details",
      500,
      "ERR_INTERNAL_SERVER"
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 5 SPLIT RELATIONAL CRUD CONTROLLERS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * 25. GET /api/v1/vendor/commercial/contacts
 * Read all department contacts for current vendor
 */
export async function getDepartmentContacts(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, "Unauthorized", 401, "ERR_UNAUTHORIZED");
    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) return sendError(res, "Business profile not found", 404, "ERR_NOT_FOUND");

    const contacts = await BusinessDepartmentContact.findAll({
      where: { businessId: business.id },
      order: [["id", "ASC"]],
    });

    return sendSuccess(res, { contacts });
  } catch (error: any) {
    console.error("Get Department Contacts Error:", error);
    return sendError(res, error.message || "Failed to fetch department contacts", 500);
  }
}

/**
 * 26. POST /api/v1/vendor/commercial/contacts
 * Add a new department contact
 */
export async function addDepartmentContact(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, "Unauthorized", 401, "ERR_UNAUTHORIZED");
    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) return sendError(res, "Business profile not found", 404, "ERR_NOT_FOUND");

    const { department, name, designation, email, phone, isPrimary } = req.body;
    if (!name || !name.trim()) {
      return sendError(res, "Contact name is required", 400, "ERR_VALIDATION");
    }

    const contact = await BusinessDepartmentContact.create({
      businessId: business.id,
      department: department || "Sales & Inquiries",
      name: name.trim(),
      designation: designation?.trim() || null,
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      isPrimary: Boolean(isPrimary),
    });

    return sendSuccess(res, { message: "Department contact created successfully", contact }, 201);
  } catch (error: any) {
    console.error("Add Department Contact Error:", error);
    return sendError(res, error.message || "Failed to add department contact", 500);
  }
}

/**
 * 27. PATCH /api/v1/vendor/commercial/contacts/:id
 * Update an existing department contact
 */
export async function updateDepartmentContact(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, "Unauthorized", 401, "ERR_UNAUTHORIZED");
    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) return sendError(res, "Business profile not found", 404, "ERR_NOT_FOUND");

    const contactId = Number(req.params.id);
    const contact = await BusinessDepartmentContact.findOne({
      where: { id: contactId, businessId: business.id },
    });
    if (!contact) {
      return sendError(res, "Department contact not found", 404, "ERR_NOT_FOUND");
    }

    const { department, name, designation, email, phone, isPrimary } = req.body;
    if (department !== undefined) contact.department = department;
    if (name !== undefined) contact.name = name.trim();
    if (designation !== undefined) contact.designation = designation?.trim() || null;
    if (email !== undefined) contact.email = email?.trim() || null;
    if (phone !== undefined) contact.phone = phone?.trim() || null;
    if (isPrimary !== undefined) contact.isPrimary = Boolean(isPrimary);

    await contact.save();

    return sendSuccess(res, { message: "Department contact updated successfully", contact });
  } catch (error: any) {
    console.error("Update Department Contact Error:", error);
    return sendError(res, error.message || "Failed to update department contact", 500);
  }
}

/**
 * 28. DELETE /api/v1/vendor/commercial/contacts/:id
 * Delete a department contact
 */
export async function deleteDepartmentContact(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, "Unauthorized", 401, "ERR_UNAUTHORIZED");
    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) return sendError(res, "Business profile not found", 404, "ERR_NOT_FOUND");

    const contactId = Number(req.params.id);
    const contact = await BusinessDepartmentContact.findOne({
      where: { id: contactId, businessId: business.id },
    });
    if (!contact) {
      return sendError(res, "Department contact not found", 404, "ERR_NOT_FOUND");
    }

    await contact.destroy();

    return sendSuccess(res, { message: "Department contact deleted successfully" });
  } catch (error: any) {
    console.error("Delete Department Contact Error:", error);
    return sendError(res, error.message || "Failed to delete department contact", 500);
  }
}

/**
 * 29. GET /api/v1/vendor/commercial/terms
 * Read Commercial & Payment Terms
 */
export async function getCommercialTerms(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, "Unauthorized", 401, "ERR_UNAUTHORIZED");
    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) return sendError(res, "Business profile not found", 404, "ERR_NOT_FOUND");

    const terms = await BusinessCommercialTerms.findOne({ where: { businessId: business.id } });
    return sendSuccess(res, { terms: terms || null });
  } catch (error: any) {
    console.error("Get Commercial Terms Error:", error);
    return sendError(res, error.message || "Failed to fetch commercial terms", 500);
  }
}

/**
 * 30. POST / PATCH /api/v1/vendor/commercial/terms
 * Upsert Commercial & Payment Terms
 */
export async function saveCommercialTerms(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, "Unauthorized", 401, "ERR_UNAUTHORIZED");
    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) return sendError(res, "Business profile not found", 404, "ERR_NOT_FOUND");

    const {
      acceptedCurrencies,
      paymentMethods,
      advancePaymentPercentage,
      creditTermsDays,
      moqPolicy,
      samplePolicy,
      warrantyTerms,
      returnPolicy,
    } = req.body;

    let terms = await BusinessCommercialTerms.findOne({ where: { businessId: business.id } });
    const payload = {
      businessId: business.id,
      acceptedCurrencies:
        Array.isArray(acceptedCurrencies) && acceptedCurrencies.length > 0
          ? acceptedCurrencies
          : terms?.acceptedCurrencies || ["INR"],
      paymentMethods:
        Array.isArray(paymentMethods) && paymentMethods.length > 0
          ? paymentMethods
          : terms?.paymentMethods || ["Bank Transfer (NEFT/RTGS)"],
      advancePaymentPercentage:
        advancePaymentPercentage !== undefined
          ? advancePaymentPercentage?.trim() || null
          : terms?.advancePaymentPercentage,
      creditTermsDays:
        creditTermsDays !== undefined
          ? creditTermsDays?.trim() || null
          : terms?.creditTermsDays,
      moqPolicy: moqPolicy !== undefined ? moqPolicy?.trim() || null : terms?.moqPolicy,
      samplePolicy: samplePolicy !== undefined ? samplePolicy?.trim() || null : terms?.samplePolicy,
      warrantyTerms: warrantyTerms !== undefined ? warrantyTerms?.trim() || null : terms?.warrantyTerms,
      returnPolicy: returnPolicy !== undefined ? returnPolicy?.trim() || null : terms?.returnPolicy,
    };

    if (!terms) {
      terms = await BusinessCommercialTerms.create(payload);
    } else {
      await terms.update(payload);
    }

    return sendSuccess(res, { message: "Commercial terms saved successfully", terms });
  } catch (error: any) {
    console.error("Save Commercial Terms Error:", error);
    return sendError(res, error.message || "Failed to save commercial terms", 500);
  }
}

/**
 * 31. GET /api/v1/vendor/commercial/trade
 * Read Trade Operations & Logistics
 */
export async function getTradeLogistics(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, "Unauthorized", 401, "ERR_UNAUTHORIZED");
    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) return sendError(res, "Business profile not found", 404, "ERR_NOT_FOUND");

    const trade = await BusinessTradeLogistics.findOne({ where: { businessId: business.id } });
    return sendSuccess(res, { tradeLogistics: trade || null });
  } catch (error: any) {
    console.error("Get Trade Logistics Error:", error);
    return sendError(res, error.message || "Failed to fetch trade logistics", 500);
  }
}

/**
 * 32. POST / PATCH /api/v1/vendor/commercial/trade
 * Upsert Trade Operations & Logistics
 */
export async function saveTradeLogistics(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, "Unauthorized", 401, "ERR_UNAUTHORIZED");
    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) return sendError(res, "Business profile not found", 404, "ERR_NOT_FOUND");

    const {
      importerExporterStatus,
      iecNumber,
      sourcingCountries,
      exportMarkets,
      annualTradeTurnover,
      preferredIncoterms,
      freightArrangements,
      customsClearanceAssistance,
      exportPackagingStandards,
      coldChainCapability,
      tradeReferences,
    } = req.body;

    let trade = await BusinessTradeLogistics.findOne({ where: { businessId: business.id } });
    const payload = {
      businessId: business.id,
      importerExporterStatus:
        importerExporterStatus || trade?.importerExporterStatus || "Domestic Only",
      iecNumber: iecNumber !== undefined ? iecNumber?.trim() || null : trade?.iecNumber,
      sourcingCountries:
        sourcingCountries !== undefined
          ? sourcingCountries?.trim() || null
          : trade?.sourcingCountries,
      exportMarkets:
        exportMarkets !== undefined ? exportMarkets?.trim() || null : trade?.exportMarkets,
      annualTradeTurnover:
        annualTradeTurnover !== undefined
          ? annualTradeTurnover?.trim() || null
          : trade?.annualTradeTurnover,
      preferredIncoterms: Array.isArray(preferredIncoterms)
        ? preferredIncoterms
        : trade?.preferredIncoterms || ["FOB"],
      freightArrangements:
        freightArrangements !== undefined
          ? freightArrangements?.trim() || null
          : trade?.freightArrangements,
      customsClearanceAssistance:
        customsClearanceAssistance !== undefined
          ? Boolean(customsClearanceAssistance)
          : trade?.customsClearanceAssistance ?? false,
      exportPackagingStandards:
        exportPackagingStandards !== undefined
          ? exportPackagingStandards?.trim() || null
          : trade?.exportPackagingStandards,
      coldChainCapability:
        coldChainCapability !== undefined
          ? Boolean(coldChainCapability)
          : trade?.coldChainCapability ?? false,
      tradeReferences:
        tradeReferences !== undefined ? tradeReferences?.trim() || null : trade?.tradeReferences,
    };

    if (!trade) {
      trade = await BusinessTradeLogistics.create(payload);
    } else {
      await trade.update(payload);
    }

    return sendSuccess(res, {
      message: "Trade operations and logistics saved successfully",
      tradeLogistics: trade,
    });
  } catch (error: any) {
    console.error("Save Trade Logistics Error:", error);
    return sendError(res, error.message || "Failed to save trade logistics", 500);
  }
}

/**
 * 33. GET /api/v1/vendor/commercial/banking
 * Read Banking & Settlement Details
 */
export async function getBankingDetails(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, "Unauthorized", 401, "ERR_UNAUTHORIZED");
    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) return sendError(res, "Business profile not found", 404, "ERR_NOT_FOUND");

    const banking = await BusinessBankingDetails.findOne({ where: { businessId: business.id } });
    return sendSuccess(res, { bankingDetails: banking || null });
  } catch (error: any) {
    console.error("Get Banking Details Error:", error);
    return sendError(res, error.message || "Failed to fetch banking details", 500);
  }
}

/**
 * 34. POST / PATCH /api/v1/vendor/commercial/banking
 * Upsert Banking & Settlement Details
 */
export async function saveBankingDetails(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, "Unauthorized", 401, "ERR_UNAUTHORIZED");
    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) return sendError(res, "Business profile not found", 404, "ERR_NOT_FOUND");

    const {
      accountHolderName,
      bankName,
      accountType,
      accountNumber,
      ifscCode,
      swiftBicCode,
      bankBranch,
      bankCountry,
      bankProofDoc,
    } = req.body;

    let banking = await BusinessBankingDetails.findOne({ where: { businessId: business.id } });
    const payload = {
      businessId: business.id,
      accountHolderName:
        accountHolderName !== undefined
          ? accountHolderName.trim()
          : banking?.accountHolderName || business.legalName || business.name,
      bankName: bankName !== undefined ? bankName.trim() : banking?.bankName || "",
      accountType: accountType || banking?.accountType || "Current Account",
      accountNumber:
        accountNumber !== undefined ? accountNumber.trim() : banking?.accountNumber || "",
      ifscCode: ifscCode !== undefined ? ifscCode.trim() : banking?.ifscCode || "",
      swiftBicCode:
        swiftBicCode !== undefined ? swiftBicCode?.trim() || null : banking?.swiftBicCode,
      bankBranch: bankBranch !== undefined ? bankBranch?.trim() || null : banking?.bankBranch,
      bankCountry:
        bankCountry !== undefined ? bankCountry?.trim() || "India" : banking?.bankCountry || "India",
      bankProofDoc:
        bankProofDoc !== undefined ? bankProofDoc?.trim() || null : banking?.bankProofDoc,
    };

    if (!banking) {
      banking = await BusinessBankingDetails.create(payload);
    } else {
      await banking.update(payload);
    }

    return sendSuccess(res, {
      message: "Banking details saved successfully",
      bankingDetails: banking,
    });
  } catch (error: any) {
    console.error("Save Banking Details Error:", error);
    return sendError(res, error.message || "Failed to save banking details", 500);
  }
}

/**
 * 38. POST /api/v1/vendor/submit-verification
 * Step 6: Final Verification Submission
 * Updates BusinessEntity verificationStatus, badge, registrationNo (Vendor ID),
 * and records legal declarations in existing business_compliance_declarations table.
 */
export async function submitVerification(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Please login first", 401, "ERR_UNAUTHORIZED");
    }

    const business = await BusinessEntity.findOne({ where: { ownerUserId: userId } });
    if (!business) {
      return sendError(
        res,
        "Business profile not found. Please complete Step 2 first.",
        404,
        "ERR_NOT_FOUND"
      );
    }

    // Guard: never demote an already-verified business, and make resubmission idempotent.
    const currentVerificationStatus = String(business.verificationStatus || "").toLowerCase();
    const isAlreadyVerified =
      currentVerificationStatus === "verified" || currentVerificationStatus === "approved";
    const isAlreadyInReview = [
      "pending_verification",
      "pending",
      "under review",
      "under_review",
      "submitted",
    ].includes(currentVerificationStatus);

    if (isAlreadyVerified) {
      return sendError(
        res,
        "This business is already verified. No further verification submission is required.",
        409,
        "ERR_ALREADY_VERIFIED"
      );
    }
    if (isAlreadyInReview) {
      return sendError(
        res,
        "This application has already been submitted and is under compliance review.",
        409,
        "ERR_ALREADY_SUBMITTED"
      );
    }

    const { accuracyConfirmed, verificationAuthorized, declarationsAccepted, submissionNotes } = req.body;

    if (!accuracyConfirmed || !verificationAuthorized || !declarationsAccepted) {
      return sendError(
        res,
        "All official declarations must be accepted before transmitting application.",
        400,
        "ERR_DECLARATIONS_REQUIRED"
      );
    }

    // 1. Sanity Check: Step 2 (Statutory GSTIN/PAN) & Step 5 (Banking Details)
    const statutory = await StatutoryIdentifier.findOne({ where: { businessId: business.id } });
    if (!statutory || (!statutory.pan && !statutory.gstin)) {
      return sendError(
        res,
        "Sanity Check Failed: Step 2 Statutory details (GSTIN or PAN) must be completed before official verification transmission.",
        400,
        "ERR_SANITY_STATUTORY_REQUIRED"
      );
    }

    const banking = await BusinessBankingDetails.findOne({ where: { businessId: business.id } });
    if (!banking || !banking.accountNumber || !banking.ifscCode) {
      return sendError(
        res,
        "Sanity Check Failed: Step 5 Banking Details (Account Number & IFSC Code) must be configured before official verification transmission.",
        400,
        "ERR_SANITY_BANKING_REQUIRED"
      );
    }

    // 2. Generate Official Vendor ID and Reference Number (e.g., REF-MH-2026-849201)
    const statePrefix = (business.state || "MH").slice(0, 2).toUpperCase();
    const currentYear = new Date().getFullYear();
    const randomSixDigit = Math.floor(100000 + Math.random() * 900000);
    const referenceNumber = `REF-${statePrefix}-${currentYear}-${randomSixDigit}`;

    const vendorId =
      business.registrationNo && business.registrationNo.startsWith("BITA-VND-")
        ? business.registrationNo
        : `BITA-VND-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Declarations Audit Log (IP, User & Timestamp Context)
    const clientIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      req.ip ||
      "127.0.0.1";
    const auditLog = `[OFFICIAL VERIFICATION TRANSMISSION ${new Date().toISOString()}]: Authorized by User #${userId} from IP ${clientIp}. Reference: ${referenceNumber}. Vendor ID: ${vendorId}.${submissionNotes ? ` Submission note: ${submissionNotes}.` : ""}`;

    // 4. Update existing BusinessEntity record
    business.verificationStatus = "pending_verification";
    business.badge = "Under Review";
    business.registrationNo = vendorId;
    // Audit context must NOT be appended to the public "summary" field.
    // (A dedicated audit_logs table is the correct long-term home for this.)
    console.info(auditLog);
    await business.save();

    // 4.1 Automatically compute and save Preliminary Trust Score based on completed dossier
    let computedScoring: any = null;
    try {
      computedScoring = await computeAndSaveBusinessTrustScore(business.id);
      if (computedScoring) {
        business.score = computedScoring.score;
        business.level = computedScoring.level;
      }
    } catch (scoreErr) {
      console.warn("Could not compute preliminary trust score on submission:", scoreErr);
    }

    // 5. Update existing BusinessComplianceDeclarations record
    const [compliance] = await BusinessComplianceDeclarations.findOrCreate({
      where: { businessId: business.id },
      defaults: {
        businessId: business.id,
        lawfullyScreened: true,
        noConflictOfInterest: true,
        sanctionsFreeDeclaration: true,
        authorityConsent: true,
      },
    });

    if (compliance) {
      await compliance.update({
        authorityConsent: true,
        lawfullyScreened: true,
        sanctionsFreeDeclaration: true,
        noConflictOfInterest: true,
      });
    }

    return sendSuccess(
      res,
      {
        message: "Registration dossier transmitted successfully for official verification",
        vendorId,
        referenceNumber,
        status: "pending_verification",
        badge: "Under Review",
        trustScore: business.score,
        verificationLevel: business.level,
        submissionDate: new Date().toISOString(),
      },
      200
    );
  } catch (error: any) {
    console.error("Submit Verification Error:", error);
    return sendError(res, error.message || "Failed to submit dossier for verification", 500);
  }
}






