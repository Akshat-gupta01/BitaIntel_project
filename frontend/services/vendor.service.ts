/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../utils/axios";

// ─── Core Response Types ────────────────────────────────────────────────────

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  documentUrl?: string;
  fileUrl?: string;
  path?: string;
  url?: string;
  id?: string | number;
  contact?: any;
  facility?: any;
  personnel?: any;
  product?: any;
  certification?: any;
  vendorId?: string;
  referenceNumber?: string;
  submissionDate?: string;
  [key: string]: any;
}

export interface VerificationSubmissionData {
  vendorId?: string;
  referenceNumber?: string;
  submissionDate?: string;
  [key: string]: any;
}

export interface FacilityResponseData {
  facility: { id: number | string; [key: string]: any };
  [key: string]: any;
}

export interface PersonnelResponseData {
  personnel: { id: number | string; [key: string]: any };
  [key: string]: any;
}

export interface ProductResponseData {
  product: { id: number | string; [key: string]: any };
  [key: string]: any;
}

export interface CertificationResponseData {
  certification: { id: number | string; [key: string]: any };
  [key: string]: any;
}

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface VendorProfileUpdatePayload {
  name?: string | null;
  legalName?: string | null;
  tradeName?: string | null;
  companyType?: string | null;
  industry?: string | null;
  category?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  registeredAddress?: string | null;
  postalCode?: string | null;
  pincode?: string | null;
  summary?: string | null;
  companyDescription?: string | null;
  website?: string | null;
  yearEstablished?: number | null;
  incorporationDate?: string | null;
  logoUrl?: string | null;
  turnover?: string | null;
  employees?: string | null;
  tan?: string | null;
  duns?: string | null;
  dunsNumber?: string | null;
  lei?: string | null;
  authorizedName?: string | null;
  fullName?: string | null;
  designation?: string | null;
  mobile?: string | null;
  email?: string | null;
  rfqEscalationEmail?: string | null;
  departmentEmail?: string | null;
  alternatePhone?: string | null;
  departmentPhone?: string | null;
  corporateLandline?: string | null;
  [key: string]: unknown;
}

export interface StatutoryUpdatePayload {
  gstin?: string;
  pan?: string;
  cin?: string;
  iec?: string;
  iecCode?: string;
  udyam?: string;
  udyamMsme?: string;
  tan?: string;
  duns?: string;
  dunsNumber?: string;
  lei?: string;
  [key: string]: unknown;
}

export interface FacilityPayload {
  id?: string | number;
  facilityType?: string;
  type?: string;
  facilityName?: string;
  name?: string;
  addressLine?: string;
  address?: string;
  city: string;
  state: string;
  pincode?: string;
  postalCode?: string;
  country?: string;
  isOwned?: boolean;
  plantHead?: string | null;
  contactPhone?: string | null;
  [key: string]: unknown;
}

export interface PersonnelPayload {
  id?: string | number;
  name: string;
  designation: string;
  department?: string | null;
  email: string;
  mobile?: string;
  phone?: string;
  photoUrl?: string | null;
  isAuthorizedSignatory?: boolean;
  [key: string]: unknown;
}

export interface CapabilitiesPayload {
  businessTypeCodes: string[];
  selectedCategoryIds: string[];
  selectedSubcategoryIds: string[];
  businessActivities?: string[];
  primaryActivity?: string | null;
  manufacturingProcesses?: string | null;
  machineryEquipment?: string | null;
  installedCapacity?: string | null;
  availableCapacity?: string | null;
  hasRdLab?: boolean;
  hasQcLab?: boolean;
  offersCustomDevelopment?: boolean;
  serviceTypes?: string | null;
  serviceExpertise?: string | null;
  geographicCoverage?: string | null;
  deliveryCapacity?: string | null;
  yearsInBusiness?: string | number | null;
  numberOfFacilities?: string | number | null;
  annualTurnoverRange?: string | null;
  totalWorkforce?: string | null;
  plantAreaSqFt?: string | null;
  operatingShifts?: string | null;
  exportTurnoverPercentage?: string | null;
  testingCapabilities?: string | null;
  qualityAssuranceProcedures?: string | null;
  manufacturingLicenceDoc?: string | null;
  facilityPhotos?: string[] | null;
  technicalAuditDoc?: string | null;
  [key: string]: unknown;
}

export interface ProductPayload {
  id?: string | number;
  name: string;
  type?: 'Product' | 'Service';
  categoryId: string;
  subcategoryId?: string | null;
  brand?: string | null;
  description?: string | null;
  specifications?: string | null;
  grade?: string | null;
  standards?: string | null;
  hsnCode?: string | null;
  countryOfOrigin?: string;
  moq?: string | null;
  standardOrderQty?: string | null;
  monthlyCapacity?: string | null;
  availableStock?: string | null;
  leadTimeDays?: string | null;
  sampleAvailability?: 'Available Free' | 'Available Paid' | 'Not Available';
  indicativePrice?: string | number | null;
  currency?: string;
  priceValidity?: string | null;
  targetMarkets?: string | null;
  images?: string[] | null;
  catalogueDoc?: string | null;
  technicalDataSheetDoc?: string | null;
  coaDoc?: string | null;
  sdsDoc?: string | null;
  [key: string]: unknown;
}

export interface CertificationPayload {
  id?: string | number;
  certificateType: string;
  certificateNumber: string;
  issuingAuthority: string;
  category?: 'QUALITY_CERT' | 'REGULATORY_APPROVAL';
  issueDate?: string | null;
  expiryDate?: string | null;
  scope?: string | null;
  applicableFacility?: string;
  evidenceDoc?: string | null;
  status?: 'Active' | 'Expiring Soon' | 'Expired';
  [key: string]: unknown;
}

export interface UploadDocumentResponse {
  success: boolean;
  data: {
    document: {
      id: number;
      businessId: number;
      categoryKey: string;
      categoryName: string;
      fileName: string;
      fileUrl: string;
      fileSize?: number;
      fileSizeBytes?: number;
      mimeType: string;
      sha256Checksum?: string;
      verificationStatus?: string;
      status?: string;
      createdAt?: string;
      [key: string]: unknown;
    };
    message?: string;
    path?: string;
    url?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// ─── Vendor Profile & Statutory API Calls ───────────────────────────────────

/**
 * 1. Fetch Vendor Business Profile & Linked Relations (Facilities, Personnel, Docs)
 * GET http://localhost:3000/api/v1/vendor/profile
 */
export const getVendorProfile = async (): Promise<ApiResponse<Record<string, unknown>>> => {
  const res = await api.get("/vendor/profile");
  return res.data;
};

/**
 * 2. Update Vendor Business Entity (registeredAddress, postalCode, summary, etc.)
 * PATCH http://localhost:3000/api/v1/vendor/update-profile
 */
export const updateVendorProfile = async (
  data: VendorProfileUpdatePayload
): Promise<ApiResponse<Record<string, unknown>>> => {
  const res = await api.patch("/vendor/update-profile", data);
  return res.data;
};

/**
 * [COMMENTED OUT / DEPRECATED]
 * 3. Create or Save Vendor Business Profile
 * POST http://localhost:3000/api/v1/vendor/create-profile
 * Redundant: Business profile is auto-created on registration. Use updateVendorProfile (/vendor/update-profile) instead.
 */
/*
export const createVendorProfile = async (
  data: VendorProfileUpdatePayload
): Promise<ApiResponse<Record<string, unknown>>> => {
  const res = await api.post("/vendor/create-profile", data);
  return res.data;
};
*/

/**
 * 4. Create or Save Statutory Identifiers (GSTIN, PAN, CIN, Udyam)
 * POST http://localhost:3000/api/v1/vendor/create-statutory
 */
export const createStatutory = async (
  data: StatutoryUpdatePayload
): Promise<ApiResponse<Record<string, unknown>>> => {
  const res = await api.post("/vendor/create-statutory", data);
  return res.data;
};

/**
 * 4b. Save or Update Statutory Identifiers (GSTIN, PAN, CIN, Udyam)
 * Supports PATCH with fallback to POST create-statutory
 */
export const updateStatutory = async (
  data: StatutoryUpdatePayload
): Promise<ApiResponse<Record<string, unknown>>> => {
  try {
    const res = await api.patch("/vendor/update-statutory", data);
    return res.data;
  } catch (err: unknown) {
    const error = err as { response?: { status?: number } };
    // If backend returns 404 or method issue, fallback to upsert POST endpoint
    if (error?.response?.status === 404) {
      const res = await api.post("/vendor/create-statutory", data);
      return res.data;
    }
    throw err;
  }
};

/**
 * 5. Fetch Statutory Identifiers
 * GET http://localhost:3000/api/v1/vendor/statutory
 */
export const getStatutory = async (): Promise<ApiResponse<Record<string, unknown>>> => {
  const res = await api.get("/vendor/statutory");
  return res.data;
};

// ─── Facilities & Plants API Calls ──────────────────────────────────────────

/**
 * 6. Add a Manufacturing Plant / Facility to Database (business_facilities)
 * POST http://localhost:3000/api/v1/vendor/add-facilities
 */
export const addFacility = async (
  data: FacilityPayload
): Promise<ApiResponse<FacilityResponseData>> => {
  const res = await api.post("/vendor/add-facilities", data);
  return res.data;
};

/**
 * 7. Fetch All Facilities for Current Vendor
 * GET http://localhost:3000/api/v1/vendor/facilities
 */
export const getFacilities = async (): Promise<ApiResponse<FacilityPayload[]>> => {
  const res = await api.get("/vendor/facilities");
  return res.data;
};

/**
 * 8. Delete a Facility from Database
 * DELETE http://localhost:3000/api/v1/vendor/facilities/:id
 */
export const deleteFacility = async (id: string | number): Promise<ApiResponse<unknown>> => {
  const res = await api.delete(`/vendor/facilities/${id}`);
  return res.data;
};

// ─── Key Personnel API Calls ────────────────────────────────────────────────

/**
 * 9. Add Key Personnel / Executive Contact to Database (business_personnel)
 * POST http://localhost:3000/api/v1/vendor/add-personnel
 */
export const addPersonnel = async (
  data: PersonnelPayload
): Promise<ApiResponse<PersonnelResponseData>> => {
  const res = await api.post("/vendor/add-personnel", data);
  return res.data;
};

/**
 * 10. Fetch All Key Personnel for Current Vendor
 * GET http://localhost:3000/api/v1/vendor/personnel
 */
export const getPersonnel = async (): Promise<ApiResponse<PersonnelPayload[]>> => {
  const res = await api.get("/vendor/personnel");
  return res.data;
};

/**
 * 11. Delete Key Personnel from Database
 * DELETE http://localhost:3000/api/v1/vendor/personnel/:id
 */
export const deletePersonnel = async (id: string | number): Promise<ApiResponse<unknown>> => {
  const res = await api.delete(`/vendor/personnel/${id}`);
  return res.data;
};

/**
 * 11a. Upload Personnel Profile Photo
 * Reuses existing single-image upload API: POST /api/v1/vendor/upload-image
 */
export const uploadPersonnelPhoto = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);
  const res = await api.post("/vendor/upload-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.data?.path || res.data?.data?.url || "";
};

// ─── Document Vault Services ────────────────────────────────────────────────

/**
 * 12. Upload Statutory Document (PDF, JPG, PNG) to Backend Document Vault
 * POST http://localhost:3000/api/v1/vendor/upload-documents
 */
export const uploadStatutoryDocument = async (
  file: File,
  categoryKey: string,
  categoryName: string
): Promise<UploadDocumentResponse> => {
  const formData = new FormData();
  formData.append("document", file);
  formData.append("categoryKey", categoryKey);
  formData.append("categoryName", categoryName);

  const res = await api.post("/vendor/upload-documents", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

/**
 * 13. Fetch All Uploaded Documents for Current Vendor
 * GET http://localhost:3000/api/v1/vendor/documents
 */
export const getVendorDocuments = async (): Promise<ApiResponse<{ documents: unknown[] }>> => {
  const res = await api.get("/vendor/documents");
  return res.data;
};

/**
 * 14. Delete a Document from the Vault
 * DELETE http://localhost:3000/api/v1/vendor/documents/:id
 */
export const deleteVendorDocument = async (documentId: number): Promise<ApiResponse<unknown>> => {
  const res = await api.delete(`/vendor/documents/${documentId}`);
  return res.data;
};

// ─── Step 3: Business Classification & Operational Capabilities ──────────────

/**
 * 15. Save Business Classification & Operational Capabilities
 * Atomically saves to normalized relational tables:
 * vendor_business_types, vendor_categories, vendor_subcategories, vendor_business_activities,
 * business_manufacturing_capabilities, business_service_capabilities, business_operating_profiles
 * POST /api/v1/vendor/save-capabilities
 */
export const saveCapabilities = async (data: CapabilitiesPayload): Promise<ApiResponse<unknown>> => {
  const res = await api.post("/vendor/save-capabilities", data);
  return res.data;
};

/**
 * 16. Fetch Business Capabilities for Current Vendor
 * GET /api/v1/vendor/capabilities
 */
export const getCapabilities = async (): Promise<ApiResponse<unknown>> => {
  const res = await api.get("/vendor/capabilities");
  return res.data;
};

// ─── Step 4: Products & Services Catalog ────────────────────────────────────

/**
 * 18. Add Product or Service to Catalog (business_products)
 * POST http://localhost:3000/api/v1/vendor/add-product
 */
export const addProduct = async (
  data: ProductPayload | ProductPayload[]
): Promise<ApiResponse<ProductResponseData>> => {
  const res = await api.post("/vendor/add-product", data);
  return res.data;
};

/**
 * 19. Fetch All Catalog Products for Current Vendor
 * GET http://localhost:3000/api/v1/vendor/products
 */
export const getProducts = async (): Promise<ApiResponse<ProductPayload[]>> => {
  const res = await api.get("/vendor/products");
  return res.data;
};

/**
 * 20. Update a Catalog Product
 * PATCH http://localhost:3000/api/v1/vendor/products/:id
 */
export const updateProduct = async (
  id: string | number,
  data: Partial<ProductPayload>
): Promise<ApiResponse<ProductPayload>> => {
  const res = await api.patch(`/vendor/products/${id}`, data);
  return res.data;
};

/**
 * 21. Delete a Product from Catalog
 * DELETE http://localhost:3000/api/v1/vendor/products/:id
 */
export const deleteProduct = async (id: string | number): Promise<ApiResponse<unknown>> => {
  const res = await api.delete(`/vendor/products/${id}`);
  return res.data;
};

/**
 * 22. Upload Product Technical Document (TDS, COA, SDS, Catalogue PDF)
 * POST http://localhost:3000/api/v1/vendor/products/upload-document
 */
export const uploadProductDocument = async (
  file: File,
  docType: 'tds' | 'coa' | 'sds' | 'catalog',
  productId?: string | number
): Promise<ApiResponse<{ path?: string; url?: string }>> => {
  const formData = new FormData();
  formData.append("document", file);
  formData.append("docType", docType);
  if (productId) {
    formData.append("productId", String(productId));
  }
  const url = productId
    ? `/vendor/products/${productId}/document`
    : `/vendor/products/upload-document`;
  try {
    const res = await api.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err: unknown) {
    const error = err as { response?: { status?: number }; status?: number };
    if (error?.response?.status === 404 || error?.status === 404) {
      const fallbackRes = await api.post("/vendor/upload-file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return fallbackRes.data;
    }
    throw err;
  }
};

/**
 * Upload Company Brand Logo (multipart/form-data)
 * POST http://localhost:3000/api/v1/vendor/upload-image
 */
export const uploadBusinessLogo = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);
  const res = await api.post("/vendor/upload-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  const data = res.data;
  return data?.data?.path || data?.path || data?.data?.url || data?.url || "";
};

/**
 * 23. Upload Single Product Image
 * POST http://localhost:3000/api/v1/vendor/products/upload-image
 */
export const uploadProductImage = async (
  file: File,
  productId?: string | number
): Promise<ApiResponse<{ path?: string; url?: string }>> => {
  const formData = new FormData();
  formData.append("image", file);
  if (productId) {
    formData.append("productId", String(productId));
  }
  try {
    const res = await api.post("/vendor/products/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err: unknown) {
    const error = err as { response?: { status?: number }; status?: number };
    if (error?.response?.status === 404 || error?.status === 404) {
      const fallbackRes = await api.post("/vendor/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return fallbackRes.data;
    }
    throw err;
  }
};

/**
 * 24. Upload Multiple Product Images
 * POST http://localhost:3000/api/v1/vendor/products/upload-images
 */
export const uploadProductImages = async (
  files: File[],
  productId?: string | number
): Promise<ApiResponse<{ path?: string; url?: string; paths?: string[]; urls?: string[]; [key: string]: unknown }>> => {
  const formData = new FormData();
  for (const file of files) {
    formData.append("images", file);
  }
  if (productId) {
    formData.append("productId", String(productId));
  }
  const primaryUrl = productId
    ? `/vendor/products/${productId}/images`
    : `/vendor/products/upload-images`;

  try {
    const res = await api.post(primaryUrl, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err: unknown) {
    const error = err as { response?: { status?: number }; status?: number };
    if (error?.response?.status === 404 || error?.status === 404) {
      const fallbackRes = await api.post("/vendor/upload-images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return fallbackRes.data;
    }
    throw err;
  }
};

/**
 * Normalizes unknown images input (string, JSON string, string array) into a clean string[]
 */
export const normalizeImageArray = (raw: unknown): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map(String)
      .map((s) => s.trim().replace(/\\/g, "/"))
      .filter((s) => s.length > 0);
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .map(String)
            .map((s) => s.trim().replace(/\\/g, "/"))
            .filter((s) => s.length > 0);
        }
      } catch {}
    }
    if (trimmed.length > 0) {
      return [trimmed.replace(/\\/g, "/")];
    }
  }
  return [];
};

/**
 * Helper to get full browser-renderable image URL
 * Dynamically resolves against Express Backend or Next.js proxy rewrite
 */
export const getFullImageUrl = (urlOrPath?: string | null): string => {
  if (!urlOrPath) return '';
  let cleanPath = urlOrPath.trim().replace(/\\/g, '/');

  // If already a local blob/data URL, return directly for instant preview
  if (cleanPath.startsWith('blob:') || cleanPath.startsWith('data:')) {
    return cleanPath;
  }

  // If it's already an absolute URL
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    try {
      const parsed = new URL(cleanPath);
      // If pointing to /uploads path, extract pathname so it routes via Next.js proxy
      if (parsed.pathname.startsWith('/uploads')) {
        cleanPath = parsed.pathname;
      } else {
        return cleanPath;
      }
    } catch {
      return cleanPath;
    }
  }

  // Ensure clean path starts with a single leading slash
  cleanPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

  // If path doesn't start with /uploads, prepend /uploads/image
  if (!cleanPath.startsWith('/uploads')) {
    cleanPath = `/uploads/image${cleanPath}`;
  }

  // Deduplicate any accidental double /uploads/image/uploads/image
  cleanPath = cleanPath.replace(/\/uploads\/image\/uploads\/image/g, '/uploads/image');

  // In browser: Next.js rewrites /uploads/:path* to http://127.0.0.1:3000/uploads/:path*
  // Returning the relative path allows seamless loading across localhost, LAN IPs, and proxies without CORS
  if (typeof window !== 'undefined') {
    return cleanPath;
  }

  // Server-side rendering fallback:
  let backendOrigin = 'http://localhost:3000';
  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      backendOrigin = new URL(process.env.NEXT_PUBLIC_API_URL).origin;
    } catch {}
  }

  return `${backendOrigin}${cleanPath}`;
};

// ─── Step 4: Quality & Regulatory Certifications ─────────────────────────────

/**
 * 25. Add Quality / Regulatory Certification (certifications)
 * POST http://localhost:3000/api/v1/vendor/add-certification
 */
export const addCertification = async (
  data: CertificationPayload | CertificationPayload[]
): Promise<ApiResponse<CertificationResponseData>> => {
  const res = await api.post("/vendor/add-certification", data);
  return res.data;
};

/**
 * 26. Fetch Certifications for Current Vendor
 * GET http://localhost:3000/api/v1/vendor/certifications
 */
export const getCertifications = async (): Promise<ApiResponse<CertificationPayload[]>> => {
  const res = await api.get("/vendor/certifications");
  return res.data;
};

/**
 * 27. Delete a Certification
 * DELETE http://localhost:3000/api/v1/vendor/certifications/:id
 */
export const deleteCertification = async (id: string | number): Promise<ApiResponse<unknown>> => {
  const res = await api.delete(`/vendor/certifications/${id}`);
  return res.data;
};

/**
 * 28. Update Quality / Regulatory Certification
 * PATCH http://localhost:3000/api/v1/vendor/certifications/:id
 */
export const updateCertification = async (
  id: string | number,
  data: Partial<CertificationPayload>
): Promise<ApiResponse<CertificationPayload>> => {
  const res = await api.patch(`/vendor/certifications/${id}`, data);
  return res.data;
};

/**
 * 29. Upload Certificate Evidence Document (PDF, JPG, PNG)
 * POST http://localhost:3000/api/v1/vendor/certifications/upload-document
 */
export const uploadCertificationDocument = async (
  file: File,
  certificationId?: string | number
): Promise<ApiResponse<{ path?: string; url?: string }>> => {
  const formData = new FormData();
  formData.append("document", file);
  if (certificationId) {
    formData.append("certificationId", String(certificationId));
  }
  const url = certificationId
    ? `/vendor/certifications/${certificationId}/document`
    : `/vendor/certifications/upload-document`;
  try {
    const res = await api.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err: unknown) {
    const error = err as { response?: { status?: number }; status?: number };
    if (error?.response?.status === 404 || error?.status === 404) {
      const fallbackRes = await api.post("/vendor/upload-file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return fallbackRes.data;
    }
    throw err;
  }
};

/**
 * 29b. Update Quality Systems & Testing Capabilities (Step 4 QA Section)
 * POST /vendor/quality-systems
 */
export const updateQualitySystems = async (data: {
  testingCapabilities?: string | null;
  qualityAssuranceProcedures?: string | null;
  [key: string]: unknown;
}): Promise<ApiResponse<unknown>> => {
  const res = await api.post("/vendor/quality-systems", data);
  return res.data;
};

// ─── Step 5: Commercial, Trade Operations & Financial Settlement ──────────

export interface CommercialTermsPayload {
  acceptedCurrencies?: string[];
  paymentMethods?: string[];
  advancePaymentPercentage?: string | null;
  creditTermsDays?: string | null;
  moqPolicy?: string | null;
  samplePolicy?: string | null;
  warrantyTerms?: string | null;
  returnPolicy?: string | null;
  [key: string]: unknown;
}

export interface TradeLogisticsPayload {
  importerExporterStatus?: string;
  iecNumber?: string | null;
  sourcingCountries?: string | null;
  exportMarkets?: string | null;
  annualTradeTurnover?: string | null;
  preferredIncoterms?: string[];
  freightArrangements?: string | null;
  customsClearanceAssistance?: boolean;
  exportPackagingStandards?: string | null;
  coldChainCapability?: boolean;
  tradeReferences?: string | null;
  [key: string]: unknown;
}

export interface BankingDetailsPayload {
  accountHolderName?: string;
  bankName?: string;
  accountType?: string;
  accountNumber?: string;
  ifscCode?: string;
  swiftBicCode?: string | null;
  bankBranch?: string | null;
  bankCountry?: string;
  bankProofDoc?: string | null;
  isBankVerified?: boolean;
  [key: string]: unknown;
}

export interface CommercialPayload {
  departmentContacts?: Array<{
    id?: number | string;
    department?: string;
    name: string;
    designation?: string | null;
    email?: string | null;
    phone?: string | null;
    isPrimary?: boolean;
  } | Record<string, unknown>>;
  acceptedCurrencies?: string[];
  paymentMethods?: string[];
  advancePaymentPercentage?: string | null;
  creditTermsDays?: string | null;
  moqPolicy?: string | null;
  samplePolicy?: string | null;
  warrantyTerms?: string | null;
  returnPolicy?: string | null;
  importerExporterStatus?: string;
  iecNumber?: string | null;
  sourcingCountries?: string | null;
  exportMarkets?: string | null;
  annualTradeTurnover?: string | null;
  preferredIncoterms?: string[];
  freightArrangements?: string | null;
  customsClearanceAssistance?: boolean;
  exportPackagingStandards?: string | null;
  coldChainCapability?: boolean;
  tradeReferences?: string | null;
  accountHolderName: string;
  bankName: string;
  accountType?: string;
  accountNumber: string;
  ifscCode: string;
  swiftBicCode?: string | null;
  bankBranch?: string | null;
  bankCountry?: string;
  bankProofDoc?: string | null;
  lawfullyScreened?: boolean;
  noConflictOfInterest?: boolean;
  sanctionsFreeDeclaration?: boolean;
  authorityConsent?: boolean;
  [key: string]: unknown;
}

/**
 * 30. Save Commercial Terms & Financial Settlement (POST /vendor/add-commercial)
 */
export const saveCommercial = async (data: CommercialPayload): Promise<ApiResponse<unknown>> => {
  const res = await api.post("/vendor/add-commercial", data);
  return res.data;
};

/**
 * 31. Upload Bank Proof Document (Cancelled Cheque / Bank Statement)
 * POST /vendor/commercial/bank-proof
 */
export const uploadBankProof = async (
  file: File
): Promise<ApiResponse<{ path?: string; url?: string }>> => {
  const formData = new FormData();
  formData.append("document", file);
  // ↳ 'target' field removed — new backend uploadBankProofDocument expects only the document file
  const res = await api.post("/vendor/commercial/bank-proof", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ─── Step 5 Granular Relational CRUD APIs ────────────────────────────────────

export interface DepartmentContactPayload {
  id?: string | number;
  department: string;
  name: string;
  designation?: string | null;
  email?: string | null;
  phone?: string | null;
  isPrimary?: boolean;
  [key: string]: unknown;
}

/**
 * 34. Department Contacts CRUD
 */
export const getDepartmentContacts = async (): Promise<ApiResponse<DepartmentContactPayload[]>> => {
  const res = await api.get("/vendor/commercial/contacts");
  return res.data;
};

export const addDepartmentContact = async (
  data: DepartmentContactPayload
): Promise<ApiResponse<{ contact: DepartmentContactPayload }>> => {
  try {
    const res = await api.post("/vendor/add-commercial/contacts", data);
    return res.data;
  } catch (err: unknown) {
    const error = err as { response?: { status?: number } };
    if (error?.response?.status === 404) {
      const fallback = await api.post("/vendor/commercial/contacts", data);
      return fallback.data;
    }
    throw err;
  }
};

export const updateDepartmentContact = async (
  id: number | string,
  data: Partial<DepartmentContactPayload>
): Promise<ApiResponse<{ contact: DepartmentContactPayload }>> => {
  const res = await api.patch(`/vendor/commercial/contacts/${id}`, data);
  return res.data;
};

export const deleteDepartmentContact = async (id: number | string): Promise<ApiResponse<unknown>> => {
  const res = await api.delete(`/vendor/commercial/contacts/${id}`);
  return res.data;
};

/**
 * 35. Commercial & Payment Terms CRUD
 */
export const getCommercialTerms = async (): Promise<ApiResponse<CommercialTermsPayload>> => {
  const res = await api.get("/vendor/commercial/terms");
  return res.data;
};

export const saveCommercialTerms = async (
  data: CommercialTermsPayload | Record<string, unknown>
): Promise<ApiResponse<CommercialTermsPayload>> => {
  try {
    const res = await api.post("/vendor/add-commercial/terms", data);
    return res.data;
  } catch (err: unknown) {
    const error = err as { response?: { status?: number } };
    if (error?.response?.status === 404) {
      const fallback = await api.post("/vendor/commercial/terms", data);
      return fallback.data;
    }
    throw err;
  }
};

/**
 * 36. Trade Operations & Logistics CRUD
 */
export const getTradeLogistics = async (): Promise<ApiResponse<TradeLogisticsPayload>> => {
  const res = await api.get("/vendor/commercial/trade");
  return res.data;
};

export const saveTradeLogistics = async (
  data: TradeLogisticsPayload | Record<string, unknown>
): Promise<ApiResponse<TradeLogisticsPayload>> => {
  try {
    const res = await api.post("/vendor/add-commercial/trade", data);
    return res.data;
  } catch (err: unknown) {
    const error = err as { response?: { status?: number } };
    if (error?.response?.status === 404) {
      const fallback = await api.post("/vendor/commercial/trade", data);
      return fallback.data;
    }
    throw err;
  }
};

/**
 * 37. Banking & Settlement Details CRUD
 */
export const getBankingDetails = async (): Promise<ApiResponse<BankingDetailsPayload>> => {
  const res = await api.get("/vendor/commercial/banking");
  return res.data;
};

export const saveBankingDetails = async (
  data: BankingDetailsPayload | Record<string, unknown>
): Promise<ApiResponse<BankingDetailsPayload>> => {
  try {
    const res = await api.post("/vendor/add-commercial/banking", data);
    return res.data;
  } catch (err: unknown) {
    const error = err as { response?: { status?: number } };
    if (error?.response?.status === 404) {
      const fallback = await api.post("/vendor/commercial/banking", data);
      return fallback.data;
    }
    throw err;
  }
};

/**
 * 38. Final Verification Submission (Step 6)
 */
export interface SubmitVerificationPayload {
  accuracyConfirmed: boolean;
  verificationAuthorized: boolean;
  declarationsAccepted: boolean;
  submissionNotes?: string | null;
  [key: string]: unknown;
}

export const submitVerification = async (
  data: SubmitVerificationPayload
): Promise<ApiResponse<VerificationSubmissionData>> => {
  const res = await api.post("/vendor/submit-verification", data);
  return res.data;
};

/**
 * 39. Public Business Directory & Details (Live from MySQL)
 */
export interface PublicDirectoryQueryParams {
  q?: string;
  search?: string;
  industry?: string;
  level?: number | string;
  minScore?: number;
  verified?: boolean;
  sortBy?: 'score' | 'tenure' | 'name';
  order?: 'asc' | 'desc';
}

export const getPublicDirectory = async (
  params?: PublicDirectoryQueryParams
): Promise<ApiResponse<{ businesses: any[]; total?: number }>> => {
  const res = await api.get("/master/directory", params ? { params } : undefined);
  return res.data;
};

export const getPublicBusinessDetail = async (slug: string): Promise<ApiResponse<{ business: any }>> => {
  const res = await api.get(`/master/business/${slug}`);
  return res.data;
};

export const compareBusinesses = async (ids: string[]): Promise<ApiResponse<{ businesses: any[]; total?: number }>> => {
  const res = await api.get("/master/compare", {
    params: { ids: ids.join(",") },
  });
  return res.data;
};

/**
 * 40. Buyer Procurement Enquiries & RFQs
 * Fully compliant with Docs (03_EXPRESS_API_SPECIFICATION.md §7)
 */
export interface SubmitEnquiryPayload {
  businessId?: string | number;
  businessSlug?: string;
  productId?: string | number | null;
  productName?: string | null;
  name?: string;
  buyerName?: string;
  email?: string;
  buyerEmail?: string;
  phone?: string | null;
  buyerPhone?: string | null;
  company?: string | null;
  buyerCompany?: string | null;
  subject?: string;
  message?: string;
  details?: string;
  budget?: string | null;
  [key: string]: unknown;
}

export interface BackendEnquiryItem {
  id: string;
  enquiryNumber: string;
  buyerName: string;
  buyerCompany: string;
  buyerEmail: string;
  buyerPhone: string;
  subject: string;
  details: string;
  date: string;
  status: 'New' | 'Viewed' | 'Responded' | 'In Discussion' | 'Closed/Rejected';
  budget: string;
  productName?: string | null;
  replyMessage?: string | null;
  repliedAt?: string | null;
}

export const submitEnquiry = async (
  data: SubmitEnquiryPayload
): Promise<ApiResponse<any>> => {
  const res = await api.post("/enquiries", data);
  return res.data;
};

export interface VendorNotificationItem {
  id: number;
  userId: number;
  businessId?: number | null;
  type: "VERIFICATION" | "DOCUMENT" | "COMPLIANCE" | "SYSTEM";
  title: string;
  message: string;
  isRead: boolean;
  actionTab?: string | null;
  createdAt: string;
}

export const getVendorNotifications = async (): Promise<{
  unreadCount: number;
  notifications: VendorNotificationItem[];
}> => {
  const res = await api.get("/vendor/notifications");
  const data = res.data?.data || res.data;
  return {
    unreadCount: data?.unreadCount ?? 0,
    notifications: Array.isArray(data?.notifications) ? data.notifications : [],
  };
};

export const markNotificationRead = async (id: number | string): Promise<void> => {
  await api.patch(`/vendor/notifications/${id}/read`);
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await api.patch("/vendor/notifications/read-all");
};

export const submitContactQuery = async (payload: {
  name: string;
  email: string;
  company?: string;
  category?: string;
  message: string;
}): Promise<{ ticketId: string; status?: string; message?: string }> => {
  const res = await api.post("/contact", payload);
  return res.data?.data || res.data;
};

export const getPublicFeed = async () => {
  const res = await api.get("/feed");
  return res.data?.data || res.data;
};

