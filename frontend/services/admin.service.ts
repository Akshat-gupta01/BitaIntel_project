import api from "../utils/axios";

export interface FacilityItem {
  id?: number | string;
  facilityName?: string;
  type?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  isOwned?: boolean;
  [key: string]: unknown;
}

export interface PersonnelItem {
  id?: number | string;
  name?: string;
  fullName?: string;
  designation?: string;
  email?: string;
  mobile?: string;
  din?: string;
  isAuthorizedSignatory?: boolean;
  [key: string]: unknown;
}

export interface DocumentVaultItem {
  id: number | string;
  categoryKey?: string;
  categoryName?: string;
  documentType?: string;
  fileName?: string;
  fileUrl?: string;
  filePath?: string;
  fileSizeBytes?: number;
  mimeType?: string;
  status?: string;
  moduleCode?: string;
  sha256Checksum?: string;
  issueDate?: string;
  expiryDate?: string;
  [key: string]: unknown;
}

export interface ProductItem {
  id?: number | string;
  name?: string;
  category?: string;
  categoryId?: number | string;
  brand?: string;
  moq?: string;
  monthlyCapacity?: string;
  indicativePrice?: number | string;
  hsnCode?: string;
  price?: number | string;
  tdsDoc?: string;
  catalogDoc?: string;
  coaDoc?: string;
  sdsDoc?: string;
  productImage?: string;
  images?: string[] | string | null;
  [key: string]: unknown;
}

export interface CertificationItem {
  id?: number | string;
  name?: string;
  certificateName?: string;
  certificateType?: string;
  issuingAuthority?: string;
  certificateNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  evidenceDoc?: string;
  status?: string;
  [key: string]: unknown;
}

export interface BankingDetailsItem {
  id?: number | string;
  bankName?: string;
  branch?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountType?: string;
  bankProofDoc?: string;
  status?: string;
  [key: string]: unknown;
}

export interface CommercialTermsItem {
  id?: number | string;
  paymentTerms?: string;
  creditPeriodDays?: number;
  currencyCode?: string;
  [key: string]: unknown;
}

export interface ManufacturingCapabilityItem {
  id?: number | string;
  machineryInstalled?: string;
  monthlyCapacity?: string;
  testingCapabilities?: string;
  qualityAssuranceProcedures?: string;
  productionType?: string;
  [key: string]: unknown;
}

export interface OperatingProfileItem {
  id?: number | string;
  primaryMachinery?: string;
  [key: string]: unknown;
}

export interface GenericEntityItem {
  id?: number | string;
  name?: string;
  code?: string;
  title?: string;
  description?: string;
  [key: string]: unknown;
}

export interface AdminQueueItem {
  id: number;
  name: string;
  legalName?: string;
  tradeName?: string;
  companyType?: string;
  industry?: string;
  city?: string;
  state?: string;
  country?: string;
  registeredAddress?: string;
  postalCode?: string;
  website?: string;
  yearEstablished?: number;
  turnover?: string;
  employees?: string;
  score?: number;
  level?: number;
  badge?: string;
  verified?: boolean;
  verificationStatus?: string;
  lastAudited?: string;
  createdAt?: string;
  updatedAt?: string;
  statutory?: {
    id?: number;
    gstin?: string;
    pan?: string;
    cin?: string;
    udyamMsme?: string;
    iecCode?: string;
    gstnStatus?: string;
    panStatus?: string;
    lastSyncedAt?: string;
  };
  owner?: {
    id?: number;
    fullName?: string;
    email?: string;
    mobile?: string;
    designation?: string;
  };
  facilities?: FacilityItem[];
  keyPersonnel?: PersonnelItem[];
  documents?: DocumentVaultItem[];
  products?: ProductItem[];
  certifications?: CertificationItem[];
  bankingDetails?: BankingDetailsItem;
  commercialTerms?: CommercialTermsItem;
  tradeLogistics?: Record<string, unknown>;
  departmentContacts?: GenericEntityItem[];
  complianceDeclarations?: Record<string, unknown>;
  manufacturingCapability?: ManufacturingCapabilityItem;
  serviceCapability?: Record<string, unknown>;
  operatingProfile?: OperatingProfileItem;
  vendorBusinessTypes?: GenericEntityItem[];
  vendorCategories?: GenericEntityItem[];
  vendorSubcategories?: GenericEntityItem[];
}

export interface VerificationDecisionPayload {
  decision: "APPROVED" | "REJECTED" | "ACTION_REQUIRED";
  notes?: string;
  tierLevel?: number;
  assignedBadge?: string;
}

export interface VerificationDecisionResponse {
  message?: string;
  businessId?: number;
  companyName?: string;
  gstin?: string;
  pan?: string;
  gstnStatus?: string;
  updatedTrustScore?: number;
  updatedLevel?: number;
  badge?: string;
  grade?: string;
  riskLevel?: string;
  notes?: string;
  verificationStatus?: string;
}

export interface DocumentReviewPayload {
  status: "VERIFIED" | "REJECTED" | "ACTION_REQUIRED" | "PENDING";
  rejectionReason?: string;
  auditorNotes?: string;
}

/**
 * Fetch list of companies awaiting verification
 */
export const getVerificationQueue = async (): Promise<{ total: number; queue: AdminQueueItem[] }> => {
  const response = await api.get("/admin/verification-queue");
  const data = response.data?.data || response.data;
  return {
    total: data?.total ?? (Array.isArray(data?.queue) ? data.queue.length : Array.isArray(data) ? data.length : 0),
    queue: Array.isArray(data?.queue) ? data.queue : Array.isArray(data) ? data : [],
  };
};

/**
 * Fetch all registered vendors
 */
export const getAllVendors = async (): Promise<{ total: number; vendors: AdminQueueItem[] }> => {
  const response = await api.get("/admin/vendors");
  const data = response.data?.data || response.data;
  return {
    total: data?.total ?? (Array.isArray(data?.vendors) ? data.vendors.length : Array.isArray(data) ? data.length : 0),
    vendors: Array.isArray(data?.vendors) ? data.vendors : Array.isArray(data) ? data : [],
  };
};

/**
 * Fetch complete audit dossier for a single business entity
 */
export const getVendorDetail = async (businessId: number | string): Promise<{ business: AdminQueueItem }> => {
  const response = await api.get(`/admin/vendors/${businessId}`);
  const data = response.data?.data || response.data;
  const business = (data?.business || data) as AdminQueueItem;
  return { business };
};

/**
 * Audit Decision: Approve, Reject, or Request Clarification with Trust Score calculation
 */
export const verifyStatutory = async (
  businessId: number | string,
  payload: VerificationDecisionPayload
): Promise<VerificationDecisionResponse> => {
  const response = await api.patch(`/admin/verify-statutory/${businessId}`, payload);
  return response.data?.data || response.data;
};

/**
 * Individual document audit review in vault
 */
export const reviewDocument = async (
  docId: number | string,
  payload: DocumentReviewPayload
): Promise<{ message?: string; document?: unknown }> => {
  const response = await api.patch(`/admin/documents/${docId}/review`, payload);
  return response.data?.data || response.data;
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized Buyer Enquiries & RFQ Leads Desk (Super Admin)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export interface AdminEnquiryItem {
  id: string;
  enquiryId: string;
  enquiryNumber: string;
  businessId: number;
  targetBusinessName: string;
  targetBusinessLegalName?: string;
  targetBusinessSlug?: string;
  targetBusinessLogo?: string | null;
  buyerName: string;
  buyerCompany: string;
  buyerEmail: string;
  buyerPhone: string;
  subject: string;
  details: string;
  date: string;
  status: 'New' | 'Viewed' | 'Responded' | 'In Discussion' | 'Closed/Rejected';
  budget: string;
  productId?: number | null;
  productName?: string | null;
  product?: { id?: number; name?: string; hsnCode?: string | null; [key: string]: unknown } | null;
  replyMessage?: string | null;
  repliedAt?: string | null;
  createdAt?: string;
}

export const getAdminEnquiries = async (): Promise<{ total: number; enquiries: AdminEnquiryItem[] }> => {
  const response = await api.get("/admin/enquiries");
  const data = response.data?.data || response.data;
  return {
    total: data?.totalCount ?? (Array.isArray(data?.enquiries) ? data.enquiries.length : 0),
    enquiries: Array.isArray(data?.enquiries) ? data.enquiries : [],
  };
};

export const updateAdminEnquiryStatus = async (
  id: string,
  status: 'New' | 'Viewed' | 'Responded' | 'In Discussion' | 'Closed/Rejected'
): Promise<unknown> => {
  const response = await api.patch(`/admin/enquiries/${id}/status`, { status });
  return response.data?.data || response.data;
};

export const replyAdminEnquiry = async (
  id: string,
  replyMessage: string
): Promise<unknown> => {
  const response = await api.post(`/admin/enquiries/${id}/reply`, { replyMessage });
  return response.data?.data || response.data;
};

export type ContactInquiryStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface AdminContactInquiryItem {
  id: number;
  ticketId: string;
  name: string;
  email: string;
  company?: string | null;
  category: string;
  message: string;
  status: ContactInquiryStatus;
  createdAt: string;
}

export const getAdminContactInquiries = async (): Promise<{
  total: number;
  inquiries: AdminContactInquiryItem[];
}> => {
  const response = await api.get("/contact");
  const data = response.data?.data || response.data;
  return {
    total: data?.total ?? (Array.isArray(data?.inquiries) ? data.inquiries.length : 0),
    inquiries: Array.isArray(data?.inquiries) ? data.inquiries : [],
  };
};

export const updateAdminContactStatus = async (
  id: number,
  status: ContactInquiryStatus
): Promise<{ inquiry: AdminContactInquiryItem }> => {
  const response = await api.patch(`/contact/${id}/status`, { status });
  return response.data?.data || response.data;
};

export interface BackendAuditLogItem {
  id: number;
  actorUserId?: number | null;
  actorName: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  companyName?: string | null;
  summary: string;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  createdAt: string;
}

export const getAdminAuditLogs = async (limit = 100): Promise<{ total: number; logs: BackendAuditLogItem[] }> => {
  const response = await api.get(`/admin/audit-logs?limit=${limit}`);
  const data = response.data?.data || response.data;
  return {
    total: data?.total ?? (Array.isArray(data?.logs) ? data.logs.length : 0),
    logs: Array.isArray(data?.logs) ? data.logs : [],
  };
};
