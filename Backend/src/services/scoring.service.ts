import {
  BusinessEntity,
  StatutoryIdentifier,
  DocumentVault,
  Certification,
  BusinessBankingDetails,
  User,
} from "../models/index.js";

// ─── 1. Interface: Vendor Audit Data ──────────────────────────────────────────
export interface VendorAuditData {
  // Identity fields
  gstinAdded?: boolean;
  panAdded?: boolean;
  cinAdded?: boolean;
  gstCertVerified?: boolean;
  panCardVerified?: boolean;
  incorpCertVerified?: boolean;

  // Tax Compliance
  gstinVerified?: boolean;
  udyamOrIecAdded?: boolean;

  // Business Tenure
  yearEstablished?: number;

  // Certifications
  verifiedCertsCount?: number;
  pendingCertsCount?: number;

  // Financial
  bankProofVerified?: boolean;
  financialStatementVerified?: boolean;
  annualTurnoverAdded?: boolean;

  // Governance & Risk
  signatoryAuthVerified?: boolean;
  addressProofVerified?: boolean;
  openComplaintsCount?: number;

  // Profile fields (12 checkpoints)
  businessName?: string;
  legalName?: string;
  companyType?: string;
  industry?: string;
  summary?: string;
  description?: string;
  employees?: string;
  turnover?: string;
  website?: string;
  email?: string;
  phone?: string;

  // Level 4 Plant audit
  plantAuditVerified?: boolean;
}


// ─── 2. Dimensions Calculator (Har dimension 0 - 100) ────────────────────────
export function calculateDimensions(data: VendorAuditData) {
  // 1. Identity (Weight 20%) — 6 checkpoints (16.7 pts each)
  let identityScore = 0;
  if (data.gstinAdded) identityScore += 16.7;
  if (data.panAdded) identityScore += 16.7;
  if (data.cinAdded) identityScore += 16.7;
  if (data.gstCertVerified) identityScore += 16.7;
  if (data.panCardVerified) identityScore += 16.7;
  if (data.incorpCertVerified) identityScore += 16.7;
  identityScore = Math.min(100, Math.round(identityScore));

  // 2. Tax Compliance (Weight 20%)
  let taxScore = 0;
  if (data.gstinVerified || data.gstCertVerified) taxScore += 50;
  if (data.gstCertVerified) taxScore += 30;
  if (data.udyamOrIecAdded) taxScore += 20;
  taxScore = Math.min(100, taxScore);

  // 3. Business Tenure (Weight 15%) — 5 pts per year (20+ saal = 100 pts)
  const currentYear = new Date().getFullYear();
  const tenureYears = data.yearEstablished ? Math.max(0, currentYear - data.yearEstablished) : 0;
  const tenureScore = Math.min(100, tenureYears * 5);

  // 4. Certifications (Weight 15%)
  let certScore = 0;
  const verifiedCerts = data.verifiedCertsCount || 0;
  if (verifiedCerts === 1) certScore = 60;
  else if (verifiedCerts === 2) certScore = 80;
  else if (verifiedCerts >= 3) certScore = 100;

  // Pending certs: 10 pts each, max 20 pts
  const pendingCerts = data.pendingCertsCount || 0;
  certScore += Math.min(20, pendingCerts * 10);
  certScore = Math.min(100, certScore);

  // 5. Financial (Weight 15%)
  let financialScore = 0;
  if (data.bankProofVerified) financialScore += 50;
  if (data.financialStatementVerified) financialScore += 30;
  if (data.annualTurnoverAdded) financialScore += 20;
  financialScore = Math.min(100, financialScore);

  // 6. Governance & Risk (Weight 10%)
  let governanceScore = 0;
  if (data.signatoryAuthVerified) governanceScore += 30;
  if (data.addressProofVerified) governanceScore += 40;
  const complaints = data.openComplaintsCount || 0;
  const complaintPts = Math.max(0, 30 - complaints * 10);
  governanceScore += complaintPts;
  governanceScore = Math.min(100, governanceScore);

  // 7. Profile Completeness (Weight 5%) — 12 fields
  const requiredFields = [
    data.businessName,
    data.legalName,
    data.companyType,
    data.industry,
    data.summary,
    data.description,
    data.yearEstablished,
    data.employees,
    data.turnover,
    data.website,
    data.email,
    data.phone,
  ];
  const filledCount = requiredFields.filter(Boolean).length;
  const profileScore = Math.round((filledCount / 12) * 100);

  return {
    identityScore,
    taxScore,
    tenureScore,
    certScore,
    financialScore,
    governanceScore,
    profileScore,
  };
}


// ─── 3. Final Composite Score (Weighted Average: 0 - 100) ───────────────────
// S = W1*D1 + W2*D2 + W3*D3 + W4*D4 + W5*D5 + W6*D6 + W7*D7
export function calculateFinalScore(dimensions: ReturnType<typeof calculateDimensions>): number {
  const composite =
    dimensions.identityScore * 0.20 +
    dimensions.taxScore * 0.20 +
    dimensions.tenureScore * 0.15 +
    dimensions.certScore * 0.15 +
    dimensions.financialScore * 0.15 +
    dimensions.governanceScore * 0.10 +
    dimensions.profileScore * 0.05;

  return Math.round(composite);
}


// ─── 4. Grade & Risk Benchmark Mapping (Per Docs Section 2 & scoring trust.docx) ───
export function getGradeAndRisk(score: number): { grade: string; risk: string } {
  if (score >= 95) return { grade: "A+", risk: "Negligible risk" };
  if (score >= 90) return { grade: "A", risk: "Negligible risk" };
  if (score >= 85) return { grade: "B+", risk: "Low risk" };
  if (score >= 80) return { grade: "B", risk: "Low risk" };
  if (score >= 75) return { grade: "C+", risk: "Standard risk" };
  if (score >= 70) return { grade: "C", risk: "Standard risk" };
  if (score >= 40) return { grade: "D", risk: "Moderate risk" };
  return { grade: "F", risk: "High risk" };
}


// ─── 5. Verification Level (Level 1 to 4) ────────────────────────────────────
export function calculateVerificationLevel(data: VendorAuditData): number {
  // Level 1: Basic Profile Created
  const level1 = Boolean(data.businessName && data.legalName);
  if (!level1) return 0;

  // Level 2: Statutory Cross-Check (GSTIN verify ho chuka hai aur active hai)
  const level2 =
    level1 &&
    Boolean(
      data.gstinVerified &&
      (data.panAdded || data.gstinAdded)
    );
  if (!level2) return 1;

  // Level 3: Document Verified (Certificates, PAN Card, ya Financials verified)
  const level3 =
    level2 &&
    Boolean(
      data.gstCertVerified ||
      data.panCardVerified ||
      data.incorpCertVerified ||
      data.bankProofVerified ||
      data.financialStatementVerified
    );
  if (!level3) return 2;

  // Level 4: Comprehensive Audit (On-site plant audit + valid certs)
  const level4 =
    level3 &&
    Boolean(
      data.plantAuditVerified &&
      (data.verifiedCertsCount || 0) >= 1
    );
  return level4 ? 4 : 3;
}

// ─── 6. Badge Mapping (Platinum / Gold / Silver / Verified / Under Review) ───
export function getBadge(score: number): "Platinum" | "Gold" | "Silver" | "Verified" | "Under Review" {
  if (score >= 90) return "Platinum";
  if (score >= 75) return "Gold";
  if (score >= 60) return "Silver";
  if (score >= 40) return "Verified";
  return "Under Review";
}

// ─── 7. Unified Auto-Compute & Save Trust Score ──────────────────────────────
export async function computeAndSaveBusinessTrustScore(businessId: number): Promise<{
  score: number;
  level: number;
  badge: "Platinum" | "Gold" | "Silver" | "Verified" | "Under Review";
  grade: string;
  risk: string;
  dimensions: ReturnType<typeof calculateDimensions>;
} | null> {
  const business = await BusinessEntity.findByPk(businessId);
  if (!business) return null;

  const statutory = await StatutoryIdentifier.findOne({ where: { businessId } });
  const owner = business.ownerUserId ? await User.findByPk(business.ownerUserId) : null;
  const vaultDocs = await DocumentVault.findAll({ where: { businessId } });
  const certs = await Certification.findAll({ where: { businessId } });
  const banking = await BusinessBankingDetails.findOne({ where: { businessId } });

  const hasGstDoc = vaultDocs.some((d) => d.categoryKey?.includes("gst") || d.categoryKey?.includes("tax"));
  const hasPanDoc = vaultDocs.some((d) => d.categoryKey?.includes("pan"));
  const hasIncorpDoc = vaultDocs.some((d) => d.categoryKey?.includes("incorp") || d.categoryKey?.includes("cin"));
  const hasBankProof = Boolean(banking?.bankProofDoc || vaultDocs.some((d) => d.categoryKey?.includes("bank")));
  const verifiedCertsCount = certs.filter((c) => c.status === "Active" || c.evidenceDoc).length;
  const pendingCertsCount = certs.filter((c) => c.status !== "Active" && !c.evidenceDoc).length;

  const isGstinActive = statutory?.gstnStatus === "ACTIVE";

  const auditData: VendorAuditData = {
    // Identity fields
    gstinAdded: Boolean(statutory?.gstin),
    panAdded: Boolean(statutory?.pan),
    cinAdded: Boolean(statutory?.cin),
    gstCertVerified: hasGstDoc || isGstinActive,
    panCardVerified: hasPanDoc || isGstinActive,
    incorpCertVerified: hasIncorpDoc,

    // Tax Compliance
    gstinVerified: isGstinActive,
    udyamOrIecAdded: Boolean(statutory?.udyamMsme || statutory?.iecCode),

    // Business Tenure
    yearEstablished: business.yearEstablished,

    // Certifications
    verifiedCertsCount,
    pendingCertsCount,

    // Financial
    bankProofVerified: hasBankProof,
    financialStatementVerified: Boolean(business.turnover),
    annualTurnoverAdded: Boolean(business.turnover),

    // Governance & Risk
    signatoryAuthVerified: Boolean(owner?.isMobileVerified || owner?.isEmailVerified),
    addressProofVerified: Boolean(business.registeredAddress || business.location),
    openComplaintsCount: 0,

    // Profile fields (12 checkpoints)
    businessName: business.name,
    legalName: business.legalName,
    companyType: business.companyType,
    industry: business.industry,
    summary: business.summary || "",
    description: business.summary || "",
    turnover: business.turnover,
    employees: business.employees,
    website: business.website || "",
    email: owner?.email || "",
    phone: owner?.mobile || "",
  };

  const dimensions = calculateDimensions(auditData);
  const newScore = calculateFinalScore(dimensions);
  const newLevel = calculateVerificationLevel(auditData);
  const { grade, risk } = getGradeAndRisk(newScore);
  const newBadge = getBadge(newScore);

  business.score = newScore;
  business.level = Math.max(business.level || 1, newLevel);
  if (business.verified || business.verificationStatus === "Verified" || business.verificationStatus === "approved") {
    business.badge = newBadge;
  }
  await business.save();

  return {
    score: newScore,
    level: business.level,
    badge: business.badge,
    grade,
    risk,
    dimensions,
  };
}
