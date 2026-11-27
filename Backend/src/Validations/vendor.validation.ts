import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/apiResponse.js";

/**
 * Reusable Express Validation Middleware
 * Checks req.body against a Zod schema. If invalid, returns 400 immediately.
 * If valid, replaces req.body with sanitized and typed data.
 */
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const errorMessage = firstIssue ? firstIssue.message : "Validation failed";
      return sendError(res, errorMessage, 400, "ERR_VALIDATION", result.error.issues);
    }
    req.body = result.data;
    next();
  };
};

// ══════════════════════════════════════════════════════════════════════════════
// STEP 2: BUSINESS PROFILE & STATUTORY VALIDATIONS
// ══════════════════════════════════════════════════════════════════════════════

// 1. Create Business Profile Schema
export const createProfileSchema = z.object({
  name: z.string().min(2, "Company Name is required").optional(),
  legalName: z.string().min(2, "Legal Registered Name is required").optional(),
  tradeName: z.string().optional().nullable(),
  companyType: z.string().default("Private Limited Company (Pvt Ltd)").optional(),
  registrationNo: z.string().optional().nullable(),
  industry: z.string().default("Manufacturing").optional(),
  category: z.string().optional().nullable(),
  location: z.string().default("India").optional(),
  city: z.string().default("Mumbai").optional(),
  state: z.string().default("Maharashtra").optional(),
  country: z.string().default("India").optional(),
  registeredAddress: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  pincode: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  companyDescription: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  yearEstablished: z.coerce.number().default(2024).optional(),
  incorporationDate: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  turnover: z.string().default("₹10 Cr - ₹50 Cr").optional(),
  employees: z.string().default("51 - 200").optional(),
  authorizedName: z.string().optional().nullable(),
  fullName: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  rfqEscalationEmail: z.string().optional().nullable(),
  departmentEmail: z.string().optional().nullable(),
  alternatePhone: z.string().optional().nullable(),
  departmentPhone: z.string().optional().nullable(),
  corporateLandline: z.string().optional().nullable(),
}).passthrough();

// 2. Update Business Profile Schema (Partial)
export const updateProfileSchema = createProfileSchema.partial().passthrough();

// 3. Create Statutory Identifier Schema (GSTIN, PAN, CIN)
export const createStatutorySchema = z.object({
  gstin: z
    .string()
    .trim()
    .min(15, "GSTIN must be a 15-character valid code")
    .optional()
    .nullable()
    .or(z.literal("")),
  pan: z.string().trim().optional().nullable().or(z.literal("")),
  cin: z.string().trim().optional().nullable().or(z.literal("")),
  iec: z.string().trim().optional().nullable().or(z.literal("")),
  iecCode: z.string().trim().optional().nullable().or(z.literal("")),
  udyamMsme: z.string().trim().optional().nullable().or(z.literal("")),
  msmeUdyamRegistration: z.string().trim().optional().nullable().or(z.literal("")),
  msmeCategory: z.string().trim().optional().nullable().or(z.literal("")),
  tan: z.string().trim().optional().nullable().or(z.literal("")),
  duns: z.string().trim().optional().nullable().or(z.literal("")),
  dunsNumber: z.string().trim().optional().nullable().or(z.literal("")),
  lei: z.string().trim().optional().nullable().or(z.literal("")),
  filingFrequency: z.string().trim().optional().default("Monthly (GSTR-3B)"),
}).passthrough();

// 4. Update Statutory Identifier Schema (Partial)
export const updateStatutorySchema = createStatutorySchema.partial();

// 5. Add Facility / Plant Schema
export const addFacilitySchema = z.object({
  facilityName: z.string().optional(),
  name: z.string().optional(),
  addressLine: z.string().optional(),
  address: z.string().optional(),
  facilityType: z.string().default("Manufacturing Plant"),
  city: z.string().default("Mumbai"),
  state: z.string().default("Maharashtra"),
  pincode: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default("India"),
  isOwned: z.boolean().default(true),
  plantHead: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
}).passthrough();

// 6. Update Facility Schema (Partial)
export const updateFacilitySchema = addFacilitySchema.partial();

// 7. Add Key Personnel Schema
export const addPersonnelSchema = z.object({
  name: z.string().min(2, "Personnel full name is required"),
  designation: z.string().min(2, "Role / Designation is required"),
  department: z.string().optional().nullable(),
  email: z.string().email("Valid corporate email is required"),
  mobile: z.string().optional(),
  phone: z.string().optional(),
  photoUrl: z.string().optional().nullable(),
  isAuthorizedSignatory: z.boolean().default(false),
}).passthrough();

// 8. Update Key Personnel Schema (Partial)
export const updatePersonnelSchema = addPersonnelSchema.partial();

// ══════════════════════════════════════════════════════════════════════════════
// STEP 3: BUSINESS CLASSIFICATION & CAPABILITIES VALIDATIONS
// ══════════════════════════════════════════════════════════════════════════════

export const capabilitiesSchema = z.object({
  businessTypeCodes: z.array(z.string()).default([]),
  selectedCategoryIds: z.array(z.string()).default([]),
  selectedSubcategoryIds: z.array(z.string()).default([]),
  primaryActivity: z.string().optional().nullable(),
  businessActivities: z.array(z.string()).default([]),
  manufacturingProcesses: z.string().optional().nullable(),
  machineryEquipment: z.string().optional().nullable(),
  installedCapacity: z.string().optional().nullable(),
  availableCapacity: z.string().optional().nullable(),
  hasRdLab: z.boolean().optional().default(false),
  hasQcLab: z.boolean().optional().default(false),
  offersCustomDevelopment: z.boolean().optional().default(false),
  serviceTypes: z.string().optional().nullable(),
  serviceExpertise: z.string().optional().nullable(),
  geographicCoverage: z.string().optional().nullable(),
  serviceEquipment: z.string().optional().nullable(),
  deliveryCapacity: z.string().optional().nullable(),
  yearsInBusiness: z.union([z.string(), z.number()]).optional().nullable(),
  numberOfFacilities: z.union([z.string(), z.number()]).optional().nullable(),
  annualTurnoverRange: z.string().optional().nullable(),
  totalWorkforce: z.string().optional().nullable(),
  plantAreaSqFt: z.string().optional().nullable(),
  operatingShifts: z.string().optional().nullable(),
  exportTurnoverPercentage: z.string().optional().nullable(),
  testingCapabilities: z.string().optional().nullable(),
  qualityAssuranceProcedures: z.string().optional().nullable(),
  facilityPhotos: z.array(z.string()).optional().nullable(),
  technicalAuditDoc: z.string().optional().nullable(),
  regulatoryApprovalDoc: z.string().optional().nullable(),
  regulatoryFilingDetails: z.string().optional().nullable(),
}).passthrough();

// ══════════════════════════════════════════════════════════════════════════════
// STEP 4: PRODUCTS, SERVICES & QUALITY CERTIFICATIONS VALIDATIONS
// ══════════════════════════════════════════════════════════════════════════════

// Single Product Validation Schema
export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  categoryId: z.string().min(1, "Category code is required (e.g. 'CAT001')"),
  type: z.enum(["Product", "Service"]).default("Product"),
  subcategoryId: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  specifications: z.string().optional().nullable(),
  grade: z.string().optional().nullable(),
  standards: z.string().optional().nullable(),
  hsnCode: z.string().optional().nullable(),
  countryOfOrigin: z.string().default("India"),
  moq: z.string().optional().nullable(),
  standardOrderQty: z.string().optional().nullable(),
  monthlyCapacity: z.string().optional().nullable(),
  availableStock: z.string().optional().nullable(),
  leadTimeDays: z.string().optional().nullable(),
  sampleAvailability: z
    .enum(["Available Free", "Available Paid", "Not Available"])
    .default("Available Free"),
  indicativePrice: z.union([z.string(), z.number()]).optional().nullable(),
  currency: z.string().default("INR"),
  priceValidity: z.string().optional().nullable(),
  targetMarkets: z.string().optional().nullable(),
  images: z.union([z.array(z.string()), z.string()]).optional().nullable(),
  catalogueDoc: z.string().optional().nullable(),
  technicalDataSheetDoc: z.string().optional().nullable(),
  coaDoc: z.string().optional().nullable(),
  sdsDoc: z.string().optional().nullable(),
}).passthrough();

// Add Product input: Supports single product object OR array of products
export const addProductInputSchema = z.union([
  productSchema,
  z.array(productSchema).min(1, "Product list cannot be empty"),
]);

// Single Certification Validation Schema
export const certificationSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  certificateType: z.string().min(2, "Certificate Type is required (e.g. 'ISO 9001:2015')"),
  certificateNumber: z.string().min(1, "Certificate Number is required"),
  issuingAuthority: z.string().min(2, "Issuing Authority / Audit Body is required"),
  category: z.enum(["QUALITY_CERT", "REGULATORY_APPROVAL"]).default("QUALITY_CERT"),
  issueDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  scope: z.string().optional().nullable(),
  applicableFacility: z.string().default("All Facilities"),
  evidenceDoc: z.string().optional().nullable(),
  status: z.enum(["Active", "Expiring Soon", "Expired"]).default("Active"),
}).passthrough();

// Add Certification input: Supports single certificate object OR array of certificates
export const addCertificationInputSchema = z.union([
  certificationSchema,
  z.array(certificationSchema).min(1, "Certificate list cannot be empty"),
]);

// Quality Systems & QA Procedures Schema (Step 4 - Section 3)
export const qualitySystemsSchema = z.object({
  testingCapabilities: z.string().optional().nullable(),
  qualityAssuranceProcedures: z.string().optional().nullable(),
});

// ══════════════════════════════════════════════════════════════════════════════
// ─── Individual Granular Schemas for Step 5 CRUD Endpoints ─────────────────

export const departmentContactSchema = z.object({
  department: z
    .enum([
      "Sales & Inquiries",
      "Procurement",
      "Accounts & Billing",
      "Customer Support",
      "Quality & Compliance",
      "Legal & Executive",
    ])
    .default("Sales & Inquiries"),
  name: z.string().min(1, "Contact person name is required"),
  designation: z.string().optional().nullable(),
  email: z.union([z.string().email(), z.literal(""), z.null()]).optional(),
  phone: z.string().optional().nullable(),
  isPrimary: z.boolean().optional().default(false),
}).passthrough();

export const commercialTermsSchema = z.object({
  acceptedCurrencies: z.array(z.string()).optional().default(["INR"]),
  paymentMethods: z.array(z.string()).optional().default(["Bank Transfer (NEFT/RTGS)"]),
  advancePaymentPercentage: z.string().optional().nullable(),
  creditTermsDays: z.string().optional().nullable(),
  moqPolicy: z.string().optional().nullable(),
  samplePolicy: z.string().optional().nullable(),
  warrantyTerms: z.string().optional().nullable(),
  returnPolicy: z.string().optional().nullable(),
}).passthrough();

export const tradeLogisticsSchema = z.object({
  importerExporterStatus: z
    .enum([
      "Domestic Only",
      "Exporter Only",
      "Importer Only",
      "Both Importer & Exporter",
    ])
    .optional()
    .default("Domestic Only"),
  iecNumber: z.string().optional().nullable(),
  sourcingCountries: z.string().optional().nullable(),
  exportMarkets: z.string().optional().nullable(),
  annualTradeTurnover: z.string().optional().nullable(),
  preferredIncoterms: z.array(z.string()).optional().default(["FOB"]),
  freightArrangements: z.string().optional().nullable(),
  customsClearanceAssistance: z.boolean().optional().default(false),
  exportPackagingStandards: z.string().optional().nullable(),
  coldChainCapability: z.boolean().optional().default(false),
  tradeReferences: z.string().optional().nullable(),
}).passthrough();

export const bankingDetailsSchema = z.object({
  accountHolderName: z.string().min(2, "Account holder name is required"),
  bankName: z.string().min(2, "Bank name is required"),
  accountType: z
    .enum([
      "Current Account",
      "Cash Credit / Overdraft",
      "Foreign Currency Account",
    ])
    .optional()
    .default("Current Account"),
  accountNumber: z.string().min(6, "Valid account number is required"),
  ifscCode: z.string().min(5, "Valid IFSC or SWIFT code is required"),
  swiftBicCode: z.string().optional().nullable(),
  bankBranch: z.string().optional().nullable(),
  bankCountry: z.string().optional().default("India"),
  bankProofDoc: z.string().optional().nullable(),
}).passthrough();


export const commercialDetailsSchema = z.object({
  departmentContacts: z
    .array(
      z.object({
        department: z.string().optional().default("Sales"),
        name: z.string().optional().default(""),
        designation: z.string().optional().default("Lead"),
        email: z.union([z.string().email(), z.literal(""), z.null()]).optional(),
        phone: z.string().optional().default(""),
      }).passthrough()
    )
    .optional()
    .default([]),

  acceptedCurrencies: z
    .array(z.string())
    .min(1, "Select at least one accepted currency")
    .default(["INR"]),
  paymentMethods: z
    .array(z.string())
    .min(1, "Select at least one payment method")
    .default(["Bank Transfer (NEFT/RTGS)"]),
  advancePaymentPercentage: z.string().optional().default("20%"),
  creditTermsDays: z.string().optional().default("30 Days"),
  moqPolicy: z.string().optional().nullable(),
  samplePolicy: z.string().optional().nullable(),
  warrantyTerms: z.string().optional().nullable(),
  returnPolicy: z.string().optional().nullable(),

  importerExporterStatus: z
    .enum([
      "Domestic Only",
      "Exporter Only",
      "Importer Only",
      "Both Importer & Exporter",
    ])
    .default("Domestic Only"),
  iecNumber: z.string().optional().nullable(),
  sourcingCountries: z.string().optional().nullable(),
  exportMarkets: z.string().optional().nullable(),
  annualTradeTurnover: z.string().optional().nullable(),
  preferredIncoterms: z.array(z.string()).optional().default(["FOB - Free on Board"]),
  freightArrangements: z.string().optional().nullable(),
  customsClearanceAssistance: z.boolean().default(false),
  exportPackagingStandards: z.string().optional().nullable(),
  coldChainCapability: z.boolean().default(false),
  tradeReferences: z.string().optional().nullable(),

  // Mandatory Banking Details
  accountHolderName: z.string().min(2, "Account holder name is required"),
  bankName: z.string().min(2, "Bank name is required"),
  accountType: z
    .enum([
      "Current Account",
      "Cash Credit / Overdraft",
      "Foreign Currency Account",
    ])
    .default("Current Account"),
  accountNumber: z.string().min(6, "Valid account number is required"),
  ifscCode: z.string().min(5, "Valid IFSC or SWIFT code is required"),
  swiftBicCode: z.string().optional().nullable(),
  bankBranch: z.string().optional().nullable(),
  bankCountry: z.string().default("India"),
  bankProofDoc: z.string().optional().nullable(),

  // Compliance & KYC Declarations
  lawfullyScreened: z.boolean().default(true),
  noConflictOfInterest: z.boolean().default(true),
  sanctionsFreeDeclaration: z.boolean().default(true),
  authorityConsent: z.boolean().default(true),
}).passthrough();

// Step 6: Final Verification Submission Schema
export const submitVerificationSchema = z.object({
  accuracyConfirmed: z.boolean().refine((val) => val === true, {
    message: "Accuracy confirmation is required before submission",
  }),
  verificationAuthorized: z.boolean().refine((val) => val === true, {
    message: "Signatory authorization is required before submission",
  }),
  declarationsAccepted: z.boolean().refine((val) => val === true, {
    message: "Audit cross-verification consent is required before submission",
  }),
  submissionNotes: z.string().optional().nullable(),
}).passthrough();
