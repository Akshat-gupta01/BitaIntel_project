import api from "../utils/axios";

export type ComplaintCategory =
  | "QUALITY_ISSUE"
  | "DELIVERY_DEFAULT"
  | "MISREPRESENTATION"
  | "STATUTORY_NON_COMPLIANCE"
  | "FRAUD"
  | "OTHER";

export type ComplaintSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ComplaintStatus =
  | "OPEN"
  | "UNDER_INVESTIGATION"
  | "RESOLVED"
  | "DISMISSED";

export interface ComplaintItem {
  id: number;
  complaintNumber: string;
  businessId: number;
  complainantUserId?: number | null;
  complainantName: string;
  complainantEmail: string;
  complainantCompany?: string | null;
  category: ComplaintCategory;
  severity: ComplaintSeverity;
  subject: string;
  description: string;
  evidenceUrl?: string | null;
  status: ComplaintStatus;
  adminNotes?: string | null;
  resolvedBy?: number | null;
  resolvedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  business?: {
    id: number;
    name: string;
    legalName?: string;
    slug?: string;
    score?: number;
    badge?: string;
  };
}

export interface SubmitComplaintPayload {
  businessId?: string | number;
  businessSlug?: string;
  category: ComplaintCategory;
  severity: ComplaintSeverity;
  subject: string;
  description: string;
  evidenceUrl?: string | null;
}

export const submitComplaint = async (
  payload: SubmitComplaintPayload
): Promise<{ message?: string; complaint?: ComplaintItem; updatedTrustScore?: number }> => {
  const res = await api.post("/complaints", payload);
  return res.data?.data || res.data;
};

export const getAdminComplaints = async (): Promise<{
  totalCount: number;
  complaints: ComplaintItem[];
}> => {
  const res = await api.get("/admin/complaints");
  const data = res.data?.data || res.data;
  return {
    totalCount: data?.totalCount ?? (Array.isArray(data?.complaints) ? data.complaints.length : 0),
    complaints: Array.isArray(data?.complaints) ? data.complaints : [],
  };
};

export const updateAdminComplaint = async (
  id: number | string,
  payload: { status: ComplaintStatus; adminNotes?: string | null }
): Promise<{ message?: string; complaint?: ComplaintItem; updatedTrustScore?: number | null }> => {
  const res = await api.patch(`/admin/complaints/${id}`, payload);
  return res.data?.data || res.data;
};
