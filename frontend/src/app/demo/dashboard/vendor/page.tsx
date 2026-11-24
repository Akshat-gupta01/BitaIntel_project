'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { toast } from 'sonner';
import {
  FullVendorRegistrationDossier,
  DepartmentContact,
  Step5CommercialData,
} from '@/types/vendorRegistration';
import {
  getStoredVendorDossier,
  INITIAL_EMPTY_DOSSIER,
  calculateDossierCompletion,
  isStep2Done,
  isStep3Done,
  isStep4Done,
  isStep5Done,
} from '@/config/initialVendorDossier';
import * as vendorService from '@services/vendor.service';
import { VendorStatusBanner } from '@/components/dashboard/vendor/VendorStatusBanner';
import { OnboardingBanner } from '@/components/dashboard/vendor/OnboardingBanner';
import { OnboardingWizardModal } from '@/components/dashboard/vendor/OnboardingWizardModal';
import { showProfileCompletedToast } from '@/lib/profileCompletedToast';
import { PersonaSwitcher } from '@/components/shared/PersonaSwitcher';
import { RegistrationSummaryModal } from '@/components/dashboard/vendor/RegistrationSummaryModal';
import { CompanyProfileTab } from '@/components/dashboard/vendor/CompanyProfileTab';
import { BusinessCapabilitiesTab } from '@/components/dashboard/vendor/BusinessCapabilitiesTab';
import { CatalogProductsTab } from '@/components/dashboard/vendor/CatalogProductsTab';
import { CertificationsQualityTab } from '@/components/dashboard/vendor/CertificationsQualityTab';
import { CommercialTradeTab } from '@/components/dashboard/vendor/CommercialTradeTab';
import { AccountSettingsTab } from '@/components/dashboard/vendor/AccountSettingsTab';
import { BusinessAvatar } from '@/components/shared/BusinessLogoUploader';
import {
  LayoutDashboard,
  ShieldCheck,
  FileText,
  Bell,
  Building2,
  Settings,
  ChevronRight,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  Award,
  Package,
  Layers,
  Eye,
  ArrowUpRight,
  Menu,
  X,
  FileCheck2,
  Download,
  DollarSign,
} from 'lucide-react';

interface BackendFacility {
  id?: string | number;
  facilityType?: string;
  facilityName?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  isOwned?: boolean;
}

interface BackendPersonnel {
  id?: string | number;
  name?: string;
  designation?: string;
  email?: string;
  mobile?: string;
  photoUrl?: string;
  isAuthorizedSignatory?: boolean;
}

interface BackendProduct {
  id?: string | number;
  name?: string;
  type?: string;
  categoryId?: string | number;
  subcategoryId?: string | number;
  brand?: string;
  description?: string;
  specifications?: string;
  grade?: string;
  standards?: string;
  hsnCode?: string;
  hsnSacCode?: string;
  countryOfOrigin?: string;
  moq?: string;
  standardOrderQty?: string;
  monthlyCapacity?: string;
  availableStock?: string;
  leadTimeDays?: string;
  sampleAvailability?: 'Available Free' | 'Available Paid' | 'Not Available';
  indicativePrice?: string;
  currency?: string;
  priceValidity?: string;
  targetMarkets?: string;
  images?: string[];
  productPhotos?: string[];
  imageUrl?: string; // Product main image URL
  catalogueDoc?: string;
  technicalDataSheetDoc?: string;
  coaDoc?: string;
  sdsDoc?: string;
}

interface BackendCertification {
  id?: string | number;
  certificateType?: string;
  certificateNumber?: string;
  issuingAuthority?: string;
  issueDate?: string;
  expiryDate?: string;
  scope?: string;
  applicableFacility?: string;
  evidenceDoc?: string;
  status?: string;
}

interface BackendDocRecord {
  id?: string | number;
  fileName?: string;
  categoryName?: string;
  categoryKey?: string;
  createdAt?: string;
  expiryDate?: string;
  status?: string;
  verifierName?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  fileSizeBytes?: number;
  fileUrl?: string;
}

interface BackendBusinessPayload {
  capabilities?: {
    businessTypeCodes?: string[];
    selectedCategoryIds?: string[];
    selectedSubcategoryIds?: string[];
    businessActivities?: string[];
    manufacturingProcesses?: string;
    machineryEquipment?: string;
    installedCapacity?: string;
    availableCapacity?: string;
    hasRdLab?: boolean;
    hasQcLab?: boolean;
    offersCustomDevelopment?: boolean;
    serviceTypes?: string;
    serviceExpertise?: string;
    geographicCoverage?: string;
    deliveryCapacity?: string;
    yearsInBusiness?: string;
    numberOfFacilities?: string;
    annualTurnoverRange?: string;
    totalWorkforce?: string;
    manufacturingLicenceDoc?: string;
    facilityPhotos?: string[];
    technicalAuditDoc?: string;
    testingCapabilities?: string;
    qualityAssuranceProcedures?: string;
  };
  manufacturingCapability?: {
    testingCapabilities?: string;
    qualityAssuranceProcedures?: string;
  };
  legalName?: string;
  tradeName?: string;
  registeredAddress?: string;
  postalCode?: string;
  city?: string;
  state?: string;
  country?: string;
  summary?: string;
  companyType?: string;
  incorporationDate?: string;
  logoUrl?: string;
  yearEstablished?: number;
  website?: string;
  employees?: string;
  turnover?: string;
  statutory?: {
    gstin?: string;
    pan?: string;
    cin?: string;
    udyamMsme?: string;
    iecCode?: string;
    tan?: string;
    duns?: string;
    dunsNumber?: string;
    lei?: string;
    statutoryPayload?: Record<string, string | number | boolean | null | undefined>;
  };
  facilities?: BackendFacility[];
  keyPersonnel?: BackendPersonnel[];
  owner?: {
    fullName?: string;
    designation?: string;
    email?: string;
    mobile?: string;
    isEmailVerified?: boolean;
    isMobileVerified?: boolean;
  };
  products?: BackendProduct[];
  certifications?: BackendCertification[];
  commercial?: {
    departmentContacts?: unknown[];
    acceptedCurrencies?: string[];
    paymentMethods?: string[];
    advancePaymentPercentage?: string | number;
    creditTermsDays?: string | number;
    moqPolicy?: string;
    samplePolicy?: string;
    warrantyTerms?: string;
    returnPolicy?: string;
    importerExporterStatus?: string;
    iecNumber?: string;
    sourcingCountries?: string;
    exportMarkets?: string;
    annualTradeTurnover?: string;
    preferredIncoterms?: string[];
    freightArrangements?: string;
    customsClearanceAssistance?: boolean;
    exportPackagingStandards?: string;
    coldChainCapability?: boolean;
    tradeReferences?: string;
    accountHolderName?: string;
    bankName?: string;
    accountType?: string;
    accountNumber?: string;
    ifscCode?: string;
    swiftBicCode?: string;
    bankBranch?: string;
    bankCountry?: string;
    bankProofDoc?: string;
    lawfullyScreened?: boolean;
    noConflictOfInterest?: boolean;
    sanctionsFreeDeclaration?: boolean;
    authorityConsent?: boolean;
    [key: string]: unknown;
  };
  bankingDetails?: {
    accountHolderName?: string;
    bankName?: string;
    accountType?: string;
    accountNumber?: string;
    ifscCode?: string;
    swiftBicCode?: string;
    bankBranch?: string;
    bankCountry?: string;
    bankProofDoc?: string;
    [key: string]: unknown;
  };
  commercialTerms?: {
    acceptedCurrencies?: string[];
    paymentMethods?: string[];
    advancePaymentPercentage?: string | number;
    creditTermsDays?: string | number;
    moqPolicy?: string;
    samplePolicy?: string;
    warrantyTerms?: string;
    returnPolicy?: string;
    [key: string]: unknown;
  };
  tradeLogistics?: {
    importerExporterStatus?: string;
    iecNumber?: string;
    sourcingCountries?: string;
    exportMarkets?: string;
    annualTradeTurnover?: string;
    preferredIncoterms?: string[];
    freightArrangements?: string;
    customsClearanceAssistance?: boolean;
    exportPackagingStandards?: string;
    coldChainCapability?: boolean;
    tradeReferences?: string;
    [key: string]: unknown;
  };
  complianceDeclarations?: {
    lawfullyScreened?: boolean;
    noConflictOfInterest?: boolean;
    sanctionsFreeDeclaration?: boolean;
    authorityConsent?: boolean;
    [key: string]: unknown;
  };
  departmentContacts?: Record<string, unknown>[];
  documents?: BackendDocRecord[];
  registrationNo?: string;
  verificationStatus?: string;
  verified?: boolean;
  score?: number;
  badge?: string;
}

// Modules A through F per SRS Section 5.3
const SRS_MODULES = [
  {
    id: 'module_a',
    code: 'Module A',
    title: 'Company Information',
    desc: 'Legal identity, registration, addresses, corporate contacts, CIN & PAN',
    status: 'Verified',
    completion: 100,
    scoreContribution: '20.0 / 20%',
    docsRequired: ['Certificate of Incorporation', 'Memorandum & Articles of Association (MOA/AOA)', 'Corporate PAN Card'],
    docsCount: 3,
    totalDocs: 3,
  },
  {
    id: 'module_b',
    code: 'Module B',
    title: 'Management & Key Personnel',
    desc: 'Directors, partners, promoters, KMP with consent-based visibility controls',
    status: 'Verified',
    completion: 100,
    scoreContribution: '18.5 / 20%',
    docsRequired: ['Director DIN Verification Records', 'Board Resolution for Authorized Signatory', 'Promoter KYC Consent'],
    docsCount: 3,
    totalDocs: 3,
  },
  {
    id: 'module_c',
    code: 'Module C',
    title: 'Business Operations & Capabilities',
    desc: 'Products, services, manufacturing/trading/distribution capability, ISO/certifications',
    status: 'In Review',
    completion: 80,
    scoreContribution: '12.0 / 15%',
    docsRequired: ['Factory Lease / Title Deed', 'Latest Geotagged Electricity Utility Bill', 'EPFO Headcount Compliance Slips'],
    docsCount: 2,
    totalDocs: 3,
  },
  {
    id: 'module_d',
    code: 'Module D',
    title: 'Customer & Supply Information',
    desc: 'Categories, regional coverage, distribution network — private by default',
    status: 'Verified',
    completion: 100,
    scoreContribution: '13.5 / 15%',
    docsRequired: ['Major Client Reference Letters (Redacted)', 'Authorized Dealership Certificates', 'Supply Chain Network Map'],
    docsCount: 3,
    totalDocs: 3,
  },
  {
    id: 'module_e',
    code: 'Module E',
    title: 'Financial Information & Banking',
    desc: 'Turnover/revenue bands, banking confirmation, audited statements',
    status: 'In Review',
    completion: 75,
    scoreContribution: '11.0 / 15%',
    docsRequired: ['FY 2024-25 Audited Balance Sheet with UDIN', 'Bank Solvency Confirmation Letter', 'CA Net Worth Certificate'],
    docsCount: 2,
    totalDocs: 3,
  },
  {
    id: 'module_f',
    code: 'Module F',
    title: 'Statutory Compliance & Legal Standing',
    desc: 'GST/PAN status, regulatory licenses, court litigation declaration',
    status: 'Verified',
    completion: 100,
    scoreContribution: '14.0 / 15%',
    docsRequired: ['GSTN 24-Month Return Filings Rec (GSTR-3B)', 'State Pollution Control Board Consent (CTO)', 'Non-Debarment Affidavit'],
    docsCount: 3,
    totalDocs: 3,
  },
];

// SRS Section 5.4 Document Management (Required verification categories)
export const DOCUMENT_CATEGORIES_SRS = [
  { id: 'cat_gst', name: 'GST Certificate (Tax & GSTN)', module: 'Module F', required: true },
  { id: 'cat_inc', name: 'Certificate of Incorporation / MCA Filing', module: 'Module A', required: true },
  { id: 'cat_llp', name: 'Partnership Deed / LLP Agreement / MOA & AOA', module: 'Module A/B', required: true },
  { id: 'cat_addr', name: 'Registered Address Proof (Premises Title / Electricity Deed)', module: 'Module C', required: true },
  { id: 'cat_bank', name: 'Bank Confirmation Letter / Solvency Certificate', module: 'Module E', required: true },
  { id: 'cat_mfg', name: 'Manufacturing / Regulatory Licenses (Factory License / SPCB CTO)', module: 'Module C/F', required: true },
  { id: 'cat_iso', name: 'ISO & Quality Product Certifications (ISO 9001/27001)', module: 'Module C', required: false },
  { id: 'cat_iec', name: 'Export-Import Code (IEC) & Customs Documentation', module: 'Module D', required: false },
];

// Document Vault items per SRS Section 5.4
// Tracked metadata: type, upload date, expiry date, status, verifier, verification date, rejection reason, version history
const INITIAL_DOCUMENTS = [
  {
    id: 'DOC-101',
    name: 'Certificate_of_Incorporation_MCA.pdf',
    category: 'Certificate of Incorporation / MCA Filing',
    uploadDate: '12 Oct 2026',
    expiryDate: 'Permanent',
    status: 'Verified',
    version: 'v1.2',
    verifier: 'Ananya Sharma (Analyst)',
    verificationDate: '14 Oct 2026',
    rejectionReason: null,
    size: '2.4 MB',
  },
  {
    id: 'DOC-102',
    name: 'GSTN_Registration_Certificate_27AABCM.pdf',
    category: 'GST Certificate (Tax & GSTN)',
    uploadDate: '12 Oct 2026',
    expiryDate: 'Continuous Active',
    status: 'Verified',
    version: 'v1.0',
    verifier: 'Automated GSTN Bridge',
    verificationDate: '12 Oct 2026',
    rejectionReason: null,
    size: '1.1 MB',
  },
  {
    id: 'DOC-103',
    name: 'Factory_MIDC_Premises_Utility_Aug26.pdf',
    category: 'Registered Address Proof (Premises Title / Electricity Deed)',
    uploadDate: '18 Oct 2026',
    expiryDate: 'Nov 2026',
    status: 'In Review',
    version: 'v1.0',
    verifier: 'Pending Analyst Review',
    verificationDate: '—',
    rejectionReason: null,
    size: '3.8 MB',
  },
  {
    id: 'DOC-104',
    name: 'ISO_9001_2015_TUV_Nord_Quality_Cert.pdf',
    category: 'ISO & Quality Product Certifications (ISO 9001/27001)',
    uploadDate: '14 Oct 2026',
    expiryDate: '15 Sep 2028',
    status: 'Verified',
    version: 'v2.0',
    verifier: 'Suresh Menon (Analyst)',
    verificationDate: '15 Oct 2026',
    rejectionReason: null,
    size: '4.2 MB',
  },
  {
    id: 'DOC-105',
    name: 'Audited_Financials_FY25_With_UDIN.pdf',
    category: 'Bank Confirmation Letter / Solvency Certificate',
    uploadDate: '20 Oct 2026',
    expiryDate: '30 Sep 2027',
    status: 'In Review',
    version: 'v1.0',
    verifier: 'Assigned to Desk B4',
    verificationDate: '—',
    rejectionReason: null,
    size: '8.6 MB',
  },
  {
    id: 'DOC-106',
    name: 'SPCB_Factory_Pollution_Consent_To_Operate.pdf',
    category: 'Manufacturing / Regulatory Licenses (Factory License / SPCB CTO)',
    uploadDate: '16 Oct 2026',
    expiryDate: '31 Dec 2028',
    status: 'Verified',
    version: 'v1.1',
    verifier: 'Suresh Menon (Analyst)',
    verificationDate: '17 Oct 2026',
    rejectionReason: null,
    size: '3.4 MB',
  },
  {
    id: 'DOC-107',
    name: 'DGFT_Import_Export_Code_IEC_Certificate.pdf',
    category: 'Export-Import Code (IEC) & Customs Documentation',
    uploadDate: '15 Oct 2026',
    expiryDate: 'Perpetual',
    status: 'Verified',
    version: 'v1.0',
    verifier: 'Automated DGFT Bridge',
    verificationDate: '15 Oct 2026',
    rejectionReason: null,
    size: '950 KB',
  },
];

// In-app notifications per SRS Section 5.11
const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_1',
    title: 'Verification Status Audited',
    desc: 'Your statutory profile and catalog credentials have been verified by the Central Audit Team.',
    date: 'Yesterday, 4:30 PM',
    read: false,
    type: 'verification',
  },
  {
    id: 'notif_2',
    title: 'Score Recalculation Complete',
    desc: 'Your BITAINTEL Trust Score has been updated to 89/100 (Strong Tier).',
    date: '20 Oct 2026',
    read: true,
    type: 'score',
  },
  {
    id: 'notif_3',
    title: 'Document Approved: ISO 9001:2015',
    desc: 'Verification analyst approved Quality Certificate (Valid through Sep 2028).',
    date: '15 Oct 2026',
    read: true,
    type: 'document',
  },
];

export default function VendorDashboardPage() {
  const { user, role, setRole, logout } = useAuth();

  // Navigation tab based on 5-step registration and dashboard requirements
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'profile'
    | 'capabilities'
    | 'catalog'
    | 'certifications'
    | 'commercial'
    | 'documents'
    | 'score'
    | 'modules'
    | 'notifications'
    | 'settings'
  >('overview');

  // Live Dossier State synced with Registration
  const [dossier, setDossier] = useState<FullVendorRegistrationDossier>(() => {
    if (typeof window !== 'undefined') {
      const stored = getStoredVendorDossier();
      if (stored) return stored;
    }
    return INITIAL_EMPTY_DOSSIER;
  });
  const [backendScore, setBackendScore] = useState<number | null>(null);
  const [backendBadge, setBackendBadge] = useState<string | null>(null);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);
  const [onboardingInitialStep, setOnboardingInitialStep] = useState(2);

  // Mobile sidebar toggle
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Document Vault State
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedUploadCategory, setSelectedUploadCategory] = useState(DOCUMENT_CATEGORIES_SRS[0].name);

  // Notifications State
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Keep Step 1 & Step 2 synchronized with authenticated user whenever user context updates
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      setDossier((prev) => ({
        ...prev,
        step1: {
          ...prev.step1,
          authorizedName: user.name || prev.step1.authorizedName || '',
          designation: user.designation || prev.step1.designation || 'Authorized Signatory',
          email: user.email || prev.step1.email || '',
          mobile: user.mobile || prev.step1.mobile || '',
          emailVerified: true,
          mobileVerified: true,
        },
        step2: {
          ...prev.step2,
          legalName: prev.step2.legalName || user.businessName || '',
          tradeName: prev.step2.tradeName || user.businessName || '',
        },
        completionPercentage: Math.max(prev.completionPercentage || 0, 17),
      }));
    }, 0);
    return () => clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const justCompleted = sessionStorage.getItem('vendor_profile_just_completed');
      if (justCompleted) {
        try {
          const parsed = JSON.parse(justCompleted);
          sessionStorage.removeItem('vendor_profile_just_completed');
          setTimeout(() => {
            showProfileCompletedToast(parsed.vendorId, parsed.referenceNumber);
          }, 400);
        } catch {
          sessionStorage.removeItem('vendor_profile_just_completed');
        }
      }
    }

    // Live sync with Backend MySQL BusinessEntity record
    vendorService
      .getVendorProfile()
      .then((res: { data?: { business?: BackendBusinessPayload } }) => {
        const b = res?.data?.business;
        if (b) {
          setDossier((prev) => {
            const updatedStep3 = b.capabilities
              ? {
                  ...prev.step3,
                  businessTypeCodes:
                    Array.isArray(b.capabilities.businessTypeCodes) && b.capabilities.businessTypeCodes.length > 0
                      ? b.capabilities.businessTypeCodes
                      : prev.step3.businessTypeCodes,
                  selectedCategoryIds:
                    Array.isArray(b.capabilities.selectedCategoryIds) && b.capabilities.selectedCategoryIds.length > 0
                      ? b.capabilities.selectedCategoryIds
                      : prev.step3.selectedCategoryIds,
                  selectedSubcategoryIds:
                    Array.isArray(b.capabilities.selectedSubcategoryIds) && b.capabilities.selectedSubcategoryIds.length > 0
                      ? b.capabilities.selectedSubcategoryIds
                      : prev.step3.selectedSubcategoryIds,
                  businessActivities:
                    Array.isArray(b.capabilities.businessActivities) && b.capabilities.businessActivities.length > 0
                      ? b.capabilities.businessActivities
                      : prev.step3.businessActivities,
                  manufacturingProcesses: b.capabilities.manufacturingProcesses || prev.step3.manufacturingProcesses,
                  machineryEquipment: b.capabilities.machineryEquipment || prev.step3.machineryEquipment,
                  installedCapacity: b.capabilities.installedCapacity || prev.step3.installedCapacity,
                  availableCapacity: b.capabilities.availableCapacity || prev.step3.availableCapacity,
                  hasRdLab: b.capabilities.hasRdLab ?? prev.step3.hasRdLab,
                  hasQcLab: b.capabilities.hasQcLab ?? prev.step3.hasQcLab,
                  offersCustomDevelopment: b.capabilities.offersCustomDevelopment ?? prev.step3.offersCustomDevelopment,
                  serviceTypes: b.capabilities.serviceTypes || prev.step3.serviceTypes,
                  serviceExpertise: b.capabilities.serviceExpertise || prev.step3.serviceExpertise,
                  geographicCoverage: b.capabilities.geographicCoverage || prev.step3.geographicCoverage,
                  deliveryCapacity: b.capabilities.deliveryCapacity || prev.step3.deliveryCapacity,
                  yearsInBusiness: b.capabilities.yearsInBusiness || prev.step3.yearsInBusiness,
                  numberOfFacilities: b.capabilities.numberOfFacilities || prev.step3.numberOfFacilities,
                  annualTurnoverRange: b.capabilities.annualTurnoverRange || prev.step3.annualTurnoverRange,
                  totalWorkforce: b.capabilities.totalWorkforce || prev.step3.totalWorkforce,
                  manufacturingLicenceDoc: b.capabilities.manufacturingLicenceDoc || prev.step3.manufacturingLicenceDoc,
                  facilityPhotos: b.capabilities.facilityPhotos || prev.step3.facilityPhotos,
                  technicalAuditDoc: b.capabilities.technicalAuditDoc || prev.step3.technicalAuditDoc,
                }
              : prev.step3;

            return {
              ...prev,
              step2: {
                ...prev.step2,
                legalName: b.legalName || prev.step2.legalName,
                tradeName: b.tradeName || prev.step2.tradeName,
                logoUrl: b.logoUrl || prev.step2.logoUrl,
                registeredAddress: b.registeredAddress || prev.step2.registeredAddress,
                pincode: b.postalCode || prev.step2.pincode,
                city: b.city || prev.step2.city,
                state: b.state || prev.step2.state,
                country: b.country || prev.step2.country,
                companyDescription: b.summary || prev.step2.companyDescription,
                constitution: b.companyType || prev.step2.constitution,
                incorporationDate: b.incorporationDate || (b.yearEstablished ? `${b.yearEstablished}-01-01` : prev.step2.incorporationDate),
                website: b.website || prev.step2.website,
                employeeCount: b.employees || prev.step2.employeeCount,
                turnover: b.turnover || prev.step3.annualTurnoverRange,
                gstin: b.statutory?.gstin || prev.step2.gstin,
                pan: b.statutory?.pan || prev.step2.pan,
                cin: b.statutory?.cin || prev.step2.cin,
                udyam: b.statutory?.udyamMsme || prev.step2.udyam,
                iec: b.statutory?.iecCode || b.tradeLogistics?.iecNumber || b.commercial?.iecNumber || prev.step2.iec,
                tan: b.statutory?.tan || (b.statutory?.statutoryPayload?.tan as string) || prev.step2.tan,
                duns: b.statutory?.duns || b.statutory?.dunsNumber || (b.statutory?.statutoryPayload?.duns as string) || prev.step2.duns,
                lei: b.statutory?.lei || (b.statutory?.statutoryPayload?.lei as string) || prev.step2.lei,
                facilities:
                  Array.isArray(b.facilities) && b.facilities.length > 0
                    ? b.facilities.map((f: BackendFacility) => ({
                        id: String(f.id),
                        type: (f.facilityType as 'Manufacturing Plant' | 'Branch Office' | 'Warehouse / R&D Unit' | 'Corporate Office') || 'Manufacturing Plant',
                        facilityName: f.facilityName || 'Plant',
                        addressLine: f.addressLine || '',
                        city: f.city || '',
                        state: f.state || '',
                        pincode: f.pincode || '',
                        country: f.country || 'India',
                        isOwned: f.isOwned ?? true,
                      }))
                    : prev.step2.facilities,
                keyPersonnel:
                  Array.isArray(b.keyPersonnel) && b.keyPersonnel.length > 0
                    ? b.keyPersonnel.map((p: BackendPersonnel) => ({
                        id: String(p.id),
                        name: p.name || '',
                        designation: p.designation || '',
                        email: p.email || '',
                        mobile: p.mobile || '',
                        photoUrl: p.photoUrl,
                        isAuthorizedSignatory: !!p.isAuthorizedSignatory,
                      }))
                    : prev.step2.keyPersonnel,
              },
              step1: {
                ...prev.step1,
                authorizedName:
                  b.owner?.fullName ||
                  user?.name ||
                  (Array.isArray(b.keyPersonnel) && b.keyPersonnel.find((p: BackendPersonnel) => p.isAuthorizedSignatory)?.name) ||
                  prev.step1.authorizedName ||
                  '',
                designation:
                  b.owner?.designation ||
                  user?.designation ||
                  (Array.isArray(b.keyPersonnel) && b.keyPersonnel.find((p: BackendPersonnel) => p.isAuthorizedSignatory)?.designation) ||
                  prev.step1.designation ||
                  'Authorized Signatory',
                email:
                  b.owner?.email ||
                  user?.email ||
                  (Array.isArray(b.keyPersonnel) && b.keyPersonnel.find((p: BackendPersonnel) => p.isAuthorizedSignatory)?.email) ||
                  prev.step1.email ||
                  '',
                mobile:
                  b.owner?.mobile ||
                  user?.mobile ||
                  (Array.isArray(b.keyPersonnel) && b.keyPersonnel.find((p: BackendPersonnel) => p.isAuthorizedSignatory)?.mobile) ||
                  prev.step1.mobile ||
                  '',
                emailVerified: b.owner?.isEmailVerified ?? true,
                mobileVerified: b.owner?.isMobileVerified ?? true,
              },
              step3: updatedStep3,
              step4: {
                ...prev.step4,
                products:
                  Array.isArray(b.products) && b.products.length > 0
                    ? b.products.map((p: BackendProduct) => ({
                        id: String(p.id),
                        name: p.name || 'Product Item',
                        type: (p.type as 'Product' | 'Service') || 'Product',
                        categoryId: String(p.categoryId || ''),
                        subcategoryId: String(p.subcategoryId || ''),
                        brand: p.brand || '',
                        description: p.description || '',
                        specifications: p.specifications || '',
                        grade: p.grade || '',
                        standards: p.standards || '',
                        hsnCode: p.hsnSacCode || p.hsnCode || '',
                        countryOfOrigin: p.countryOfOrigin || 'India',
                        moq: p.moq || '50 Units',
                        standardOrderQty: p.standardOrderQty || '200 Units',
                        monthlyCapacity: p.monthlyCapacity || '',
                        availableStock: p.availableStock || '',
                        leadTimeDays: p.leadTimeDays || '14 Days',
                        sampleAvailability: p.sampleAvailability || 'Available Free',
                        indicativePrice: p.indicativePrice || '0',
                        currency: p.currency || 'INR',
                        priceValidity: p.priceValidity || '',
                        targetMarkets: p.targetMarkets || '',
                        images: vendorService.normalizeImageArray(
                          p.images || p.productPhotos || (p as any).imageUrl || (p as any).image
                        ),
                        catalogueDoc: p.catalogueDoc || undefined,
                        technicalDataSheetDoc: p.technicalDataSheetDoc || undefined,
                        coaDoc: p.coaDoc || undefined,
                        sdsDoc: p.sdsDoc || undefined,
                      }))
                    : prev.step4.products,
                certifications:
                  Array.isArray(b.certifications) && b.certifications.length > 0
                    ? b.certifications.map((c: BackendCertification) => ({
                        id: String(c.id),
                        certificateType: c.certificateType || 'Quality Certification',
                        certificateNumber: c.certificateNumber || '',
                        issuingAuthority: c.issuingAuthority || '',
                        issueDate: c.issueDate || '',
                        expiryDate: c.expiryDate || '',
                        scope: c.scope || '',
                        applicableFacility: c.applicableFacility || 'All Facilities',
                        evidenceDoc: c.evidenceDoc || undefined,
                        status: (c.status === 'Expiring Soon' || c.status === 'Expired' ? c.status : 'Active') as 'Expiring Soon' | 'Active' | 'Expired',
                      }))
                    : prev.step4.certifications,
                testingCapabilities:
                  b.manufacturingCapability?.testingCapabilities ||
                  b.capabilities?.testingCapabilities ||
                  prev.step4.testingCapabilities,
                qualityAssuranceProcedures:
                  b.manufacturingCapability?.qualityAssuranceProcedures ||
                  b.capabilities?.qualityAssuranceProcedures ||
                  prev.step4.qualityAssuranceProcedures,
              },
              step5: (b.commercial || b.bankingDetails || b.commercialTerms || b.tradeLogistics)
                ? ({
                    ...prev.step5,
                    departmentContacts:
                      Array.isArray(b.departmentContacts) && b.departmentContacts.length > 0
                        ? (b.departmentContacts as unknown as DepartmentContact[])
                        : Array.isArray(b.commercial?.departmentContacts) && (b.commercial.departmentContacts as unknown[]).length > 0
                        ? (b.commercial.departmentContacts as unknown as DepartmentContact[])
                        : prev.step5.departmentContacts,
                    acceptedCurrencies:
                      Array.isArray(b.commercialTerms?.acceptedCurrencies)
                        ? (b.commercialTerms.acceptedCurrencies as string[])
                        : Array.isArray(b.commercial?.acceptedCurrencies)
                        ? (b.commercial.acceptedCurrencies as string[])
                        : prev.step5.acceptedCurrencies,
                    paymentMethods:
                      Array.isArray(b.commercialTerms?.paymentMethods)
                        ? (b.commercialTerms.paymentMethods as string[])
                        : Array.isArray(b.commercial?.paymentMethods)
                        ? (b.commercial.paymentMethods as string[])
                        : prev.step5.paymentMethods,
                    advancePaymentPercentage:
                      String(b.commercialTerms?.advancePaymentPercentage || b.commercial?.advancePaymentPercentage || prev.step5.advancePaymentPercentage || ''),
                    creditTermsDays:
                      String(b.commercialTerms?.creditTermsDays || b.commercial?.creditTermsDays || prev.step5.creditTermsDays || ''),
                    moqPolicy:
                      String(b.commercialTerms?.moqPolicy || b.commercial?.moqPolicy || prev.step5.moqPolicy || ''),
                    samplePolicy:
                      String(b.commercialTerms?.samplePolicy || b.commercial?.samplePolicy || prev.step5.samplePolicy || ''),
                    warrantyTerms:
                      String(b.commercialTerms?.warrantyTerms || b.commercial?.warrantyTerms || prev.step5.warrantyTerms || ''),
                    returnPolicy:
                      String(b.commercialTerms?.returnPolicy || b.commercial?.returnPolicy || prev.step5.returnPolicy || ''),
                    importerExporterStatus:
                      (b.tradeLogistics?.importerExporterStatus || b.commercial?.importerExporterStatus || prev.step5.importerExporterStatus) as Step5CommercialData['importerExporterStatus'],
                    iecNumber:
                      String(b.tradeLogistics?.iecNumber || b.commercial?.iecNumber || prev.step5.iecNumber || ''),
                    sourcingCountries:
                      String(b.tradeLogistics?.sourcingCountries || b.commercial?.sourcingCountries || prev.step5.sourcingCountries || ''),
                    exportMarkets:
                      String(b.tradeLogistics?.exportMarkets || b.commercial?.exportMarkets || prev.step5.exportMarkets || ''),
                    annualTradeTurnover:
                      String(b.tradeLogistics?.annualTradeTurnover || b.commercial?.annualTradeTurnover || prev.step5.annualTradeTurnover || ''),
                    preferredIncoterms:
                      Array.isArray(b.tradeLogistics?.preferredIncoterms)
                        ? (b.tradeLogistics.preferredIncoterms as string[])
                        : Array.isArray(b.commercial?.preferredIncoterms)
                        ? (b.commercial.preferredIncoterms as string[])
                        : prev.step5.preferredIncoterms,
                    freightArrangements:
                      String(b.tradeLogistics?.freightArrangements || b.commercial?.freightArrangements || prev.step5.freightArrangements || ''),
                    customsClearanceAssistance:
                      Boolean(b.tradeLogistics?.customsClearanceAssistance ?? b.commercial?.customsClearanceAssistance ?? prev.step5.customsClearanceAssistance),
                    exportPackagingStandards:
                      String(b.tradeLogistics?.exportPackagingStandards || b.commercial?.exportPackagingStandards || prev.step5.exportPackagingStandards || ''),
                    coldChainCapability:
                      Boolean(b.tradeLogistics?.coldChainCapability ?? b.commercial?.coldChainCapability ?? prev.step5.coldChainCapability),
                    tradeReferences:
                      String(b.tradeLogistics?.tradeReferences || b.commercial?.tradeReferences || prev.step5.tradeReferences || ''),
                    accountHolderName:
                      String(b.bankingDetails?.accountHolderName || b.commercial?.accountHolderName || prev.step5.accountHolderName || ''),
                    bankName:
                      String(b.bankingDetails?.bankName || b.commercial?.bankName || prev.step5.bankName || ''),
                    accountType:
                      (b.bankingDetails?.accountType || b.commercial?.accountType || prev.step5.accountType) as Step5CommercialData['accountType'],
                    accountNumber:
                      String(b.bankingDetails?.accountNumber || b.commercial?.accountNumber || prev.step5.accountNumber || ''),
                    ifscCode:
                      String(b.bankingDetails?.ifscCode || b.commercial?.ifscCode || prev.step5.ifscCode || ''),
                    swiftBicCode:
                      String(b.bankingDetails?.swiftBicCode || b.commercial?.swiftBicCode || prev.step5.swiftBicCode || ''),
                    bankBranch:
                      String(b.bankingDetails?.bankBranch || b.commercial?.bankBranch || prev.step5.bankBranch || ''),
                    bankCountry:
                      String(b.bankingDetails?.bankCountry || b.commercial?.bankCountry || prev.step5.bankCountry || ''),
                    bankProofDoc:
                      (b.bankingDetails?.bankProofDoc || b.commercial?.bankProofDoc || prev.step5.bankProofDoc) as string | undefined,
                    lawfullyScreened:
                      Boolean(b.complianceDeclarations?.lawfullyScreened ?? b.commercial?.lawfullyScreened ?? prev.step5.lawfullyScreened),
                    noConflictOfInterest:
                      Boolean(b.complianceDeclarations?.noConflictOfInterest ?? b.commercial?.noConflictOfInterest ?? prev.step5.noConflictOfInterest),
                    sanctionsFreeDeclaration:
                      Boolean(b.complianceDeclarations?.sanctionsFreeDeclaration ?? b.commercial?.sanctionsFreeDeclaration ?? prev.step5.sanctionsFreeDeclaration),
                    authorityConsent:
                      Boolean(b.complianceDeclarations?.authorityConsent ?? b.commercial?.authorityConsent ?? prev.step5.authorityConsent),
                  } as Step5CommercialData)
                : prev.step5,
              documentVault:
                Array.isArray(b.documents) && b.documents.length > 0
                  ? b.documents.map((d: BackendDocRecord) => ({
                      id: String(d.id || d.categoryKey),
                      name: d.categoryName || d.categoryKey || d.fileName || 'Document',
                      category:
                        d.categoryKey?.includes('tax') || d.categoryKey?.includes('incorporation')
                          ? 'Legal & Tax'
                          : d.categoryKey?.includes('bank')
                          ? 'Banking & Identity'
                          : 'Facility & Licences',
                      fileName: d.fileName || 'Uploaded_Document.pdf',
                      fileSize: d.fileSizeBytes
                        ? `${(d.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`
                        : '1.5 MB',
                      uploadDate: d.createdAt
                        ? new Date(d.createdAt).toISOString().split('T')[0]
                        : 'Recent',
                      verificationStatus: d.status === 'VERIFIED' ? 'Verified' : 'Under Review',
                      downloadUrl: d.fileUrl,
                    }))
                  : prev.documentVault,
              step6: {
                ...prev.step6,
                vendorId: b.registrationNo || prev.step6.vendorId,
                status: (() => {
                  const norm = (b.verificationStatus || '').toLowerCase();
                  if (norm === 'verified' || norm === 'approved' || b.verified === true) return 'Verified';
                  if (norm === 'pending_verification') return 'Verification Pending';
                  if (norm === 'action_required') return 'Additional Information Required';
                  if (norm === 'rejected') return 'Rejected';
                  return prev.step6.status;
                })(),
                accuracyConfirmed: Boolean(
                  b.verificationStatus === 'verified' ||
                  b.verificationStatus === 'approved' ||
                  b.verificationStatus === 'pending_verification' ||
                  prev.step6.accuracyConfirmed
                ),
              },
            };
          });

          if (b.score !== undefined && b.score !== null) {
            setBackendScore(Number(b.score));
          }
          if (b.badge) {
            setBackendBadge(b.badge);
          }

          const normStatus = (b.verificationStatus || '').toLowerCase();
          if ((normStatus === 'verified' || normStatus === 'approved' || b.verified === true) && role !== 'approved_business' && role !== 'premium_subscriber') {
            setRole('approved_business');
          } else if (normStatus === 'pending_verification' && role === 'unverified') {
            setRole('pending_approval');
          }

          if (Array.isArray(b.documents) && b.documents.length > 0) {
            setDocuments(
              b.documents.map((d: BackendDocRecord) => ({
                id: `DOC-${d.id}`,
                name: d.fileName || 'Document',
                category: d.categoryName || d.categoryKey || 'Statutory Evidence',
                uploadDate: d.createdAt
                  ? new Date(d.createdAt).toISOString().split('T')[0]
                  : 'Recent',
                expiryDate: d.expiryDate || 'N/A (Perpetual)',
                status: d.status === 'VERIFIED' ? 'Verified' : 'In Review',
                version: 'v1.0',
                verifier: d.verifierName || 'Compliance Gateway',
                verificationDate: d.verifiedAt
                  ? new Date(d.verifiedAt).toISOString().split('T')[0]
                  : 'Pending',
                rejectionReason: null,
                size: d.fileSizeBytes
                  ? `${(d.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`
                  : '1.5 MB',
              }))
            );
          }
        }
      })
      .catch(() => {
        // Fallback gracefully if not logged in or offline
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Score metrics per SRS §5.7
  // Weighted 0-100: Identity 20%, Govt 20%, Operations 15%, Docs 15%, Financial 15%, Compliance 10%, Completeness 5%
  const trustScore = backendScore !== null ? backendScore : (user?.score || 0);
  const scoreTier =
    trustScore >= 90
      ? 'Platinum (90–100)'
      : trustScore >= 75
      ? 'Strong / Gold (75–89)'
      : trustScore >= 60
      ? 'Good / Silver (60–74)'
      : trustScore >= 40
      ? 'Moderate (40–59)'
      : 'Limited (0–39)';
  const badgeText = backendBadge
    ? `BITAINTEL ${backendBadge}`
    : trustScore >= 40
    ? 'BITAINTEL Verified'
    : 'BITAINTEL Under Review';

  // Dynamically compute profile / dossier completion based on canonical step validation
  const profileCompletion = useMemo(() => {
    return calculateDossierCompletion(dossier);
  }, [dossier]);

  // Navigation Items aligned with 5-step registration architecture
  const sidebarNavItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard, badge: dossier.step6.status || 'Verified' },
    { id: 'profile', label: 'Company Profile', icon: Building2, badge: `${dossier.step2.facilities.length + 1} Plants` },
    { id: 'capabilities', label: 'Classification & Scale', icon: Layers, badge: `${dossier.step3.businessTypeCodes.length} Types` },
    { id: 'catalog', label: 'Products & Services', icon: Package, badge: `${dossier.step4.products.length} Items` },
    { id: 'certifications', label: 'Quality & Standards', icon: Award, badge: `${dossier.step4.certifications.length} Audited` },
    { id: 'commercial', label: 'Commercial & Banking', icon: DollarSign, badge: 'Protected' },
    { id: 'documents', label: 'Document Vault', icon: FileCheck2, badge: `${documents.length} Files` },
    { id: 'score', label: 'Score & Badge', icon: Award, badge: '89/100' },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: `${notifications.filter(n => !n.read).length}` },
    { id: 'settings', label: 'Account Settings', icon: Settings, badge: null },
  ];

  return (
    <RoleGuard allowedRoles={['unverified', 'pending_approval', 'approved_business', 'premium_subscriber', 'vendor', 'business', 'business_owner']}>
      <div className="h-screen w-full bg-slate-50 flex flex-col md:flex-row overflow-hidden">
        {/* ========================================================================= */}
        {/* 1. LEFT SIDEBAR NAVIGATION (Independent Scroll Plane)                     */}
        {/* ========================================================================= */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 h-full bg-white text-slate-800 border-r border-slate-200/80 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 flex flex-col justify-between shrink-0 overflow-hidden shadow-xs ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Top Brand & Business Card Header */}
          <div className="p-5 border-b border-slate-200/80 shrink-0 bg-white">
            <div className="flex items-center justify-between">
              {/* Clickable BITAINTEL Logo that links to main site */}
              <Link
                href="/demo"
                className="flex items-center group py-0.5"
                title="Return to BITAINTEL Home"
              >
                <Logo variant="default" size="md" showTagline={false} />
              </Link>

              {/* Mobile Close Button */}
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="size-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 grid place-items-center md:hidden"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Business Card Pill */}
            <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('settings');
                  setMobileSidebarOpen(false);
                }}
                className="shrink-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <BusinessAvatar
                  logoUrl={dossier.step2.logoUrl}
                  businessName={dossier.step2.tradeName || user?.businessName || 'Meridian Steel Works'}
                  fallbackInitials={user?.avatarInitials}
                  className="size-10 rounded-xl"
                />
              </button>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {dossier.step2.legalName || user?.businessName || user?.name || 'My Enterprise'}
                </p>
                <p className="text-[11px] font-mono text-slate-500 truncate">
                  {dossier.step2.gstin || (user?.gstin && user.gstin !== 'Pending GSTIN')
                    ? `GSTIN: ${dossier.step2.gstin || user?.gstin}`
                    : 'GSTIN: Pending Entry'}
                </p>
                <div className="pt-0.5 flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
                    {role === 'unverified'
                      ? 'Tier: Unverified'
                      : role === 'pending_approval'
                      ? 'Tier: Under Review'
                      : 'Tier: Strong'}
                  </span>
                  <span className="text-[11px] font-black text-primary-600 font-mono">
                    {role === 'unverified' ? '—' : `${trustScore} / 100`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links (SRS Modules & Workflows) */}
          <nav className="p-3 space-y-1 overflow-y-auto flex-1 bg-white">
            {(user?.role === 'admin' ||
              user?.role === 'super_admin' ||
              user?.systemRole === 'admin' ||
              user?.systemRole === 'super_admin' ||
              user?.systemRole === 'verification_officer' ||
              role === 'admin' ||
              role === 'super_admin') && (
              <div className="mb-2">
                <Link
                  href="/demo/dashboard/admin"
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 shadow-2xs transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="size-4 text-amber-700" />
                    <span>Admin Verification Desk</span>
                  </div>
                  <ArrowUpRight className="size-3.5 text-amber-600" />
                </Link>
              </div>
            )}

            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Workspace Modules (SRS §5.10)
            </p>
            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id as typeof activeTab);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`size-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        isActive
                          ? 'bg-primary-700 text-white'
                          : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Profile & Actions */}
          <div className="p-4 border-t border-slate-200/80 space-y-2 bg-white">
            <Link
              href="/demo/business/meridian-steel-works"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/70 text-xs font-semibold transition-colors"
            >
              <span className="flex items-center gap-2">
                <Eye className="size-3.5 text-primary-600" />
                <span>View Public Profile</span>
              </span>
              <ArrowUpRight className="size-3.5 text-slate-400" />
            </Link>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-600 px-1">
              <span className="truncate max-w-[130px] font-medium text-slate-700">{user?.email}</span>
              <button
                type="button"
                onClick={logout}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
              >
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          />
        )}

        {/* ========================================================================= */}
        {/* 2. MAIN WORKSPACE CONTENT AREA                                           */}
        {/* ========================================================================= */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Mobile & Desktop Bar */}
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile Sidebar Hamburger */}
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="grid size-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 md:hidden hover:bg-slate-50"
                aria-label="Open sidebar"
              >
                <Menu className="size-5" />
              </button>

              <div>
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 capitalize flex items-center gap-2">
                  <span>
                    {activeTab === 'overview' && 'Dashboard Overview'}
                    {activeTab === 'profile' && 'Company Profile & Facilities (Step 2)'}
                    {activeTab === 'capabilities' && 'Business Classification & 240 Subcategories (Step 3)'}
                    {activeTab === 'catalog' && 'Commercial Catalog & Specifications (Step 4)'}
                    {activeTab === 'certifications' && 'Quality & Standards Certifications (Step 4)'}
                    {activeTab === 'commercial' && 'Commercial, Trade & Banking (Step 5)'}
                    {activeTab === 'documents' && 'Document Management Vault (Step 6)'}
                    {activeTab === 'score' && 'BITAINTEL Trust Score & Badge'}
                    {activeTab === 'notifications' && 'System Notifications'}
                    {activeTab === 'settings' && 'Account & Security Settings'}
                  </span>
                </h1>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  {dossier.step2.legalName || user?.businessName || user?.name || 'Enterprise'} · Vendor ID: {dossier.step6.vendorId || (role === 'unverified' ? 'Registration Incomplete' : 'BITA-VND-2026-Pending')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <PersonaSwitcher />

              {(user?.role === 'admin' ||
                user?.role === 'super_admin' ||
                user?.systemRole === 'admin' ||
                user?.systemRole === 'super_admin' ||
                user?.systemRole === 'verification_officer' ||
                role === 'admin' ||
                role === 'super_admin') && (
                <Link
                  href="/demo/dashboard/admin"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 shadow-2xs transition-all"
                >
                  <ShieldCheck className="size-3.5 text-amber-700" />
                  <span>Admin Desk →</span>
                </Link>
              )}

              {(role === 'unverified' || role === 'pending_approval') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    let nextStep = 2;
                    if (isStep2Done(dossier)) {
                      nextStep = 3;
                      if (isStep3Done(dossier)) {
                        nextStep = 4;
                        if (isStep4Done(dossier)) {
                          nextStep = 5;
                          if (isStep5Done(dossier)) {
                            nextStep = 6;
                          }
                        }
                      }
                    }
                    setOnboardingInitialStep(role === 'pending_approval' && isStep5Done(dossier) ? 6 : nextStep);
                    setOnboardingModalOpen(true);
                  }}
                  className="text-xs bg-primary-50 text-primary-800 border-primary-300 hover:bg-primary-100 font-bold h-8"
                >
                  <Sparkles className="size-3.5 mr-1 text-primary-600" />
                  <span className="hidden sm:inline">Continue Registration (Steps 2-6)</span>
                  <span className="sm:hidden">Register</span>
                </Button>
              )}

              <Button
                variant="primary"
                size="sm"
                onClick={() => setSummaryModalOpen(true)}
                icon={<FileText className="size-3.5" />}
              >
                <span className="hidden sm:inline">Dossier Summary</span>
                <span className="sm:hidden">Dossier</span>
              </Button>
            </div>
          </header>

          <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
            {/* ===================================================================== */}
            {/* TAB 1: DASHBOARD OVERVIEW                                            */}
            {/* ===================================================================== */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in">
                {/* 5-Tier Progressive Onboarding & Account State Banner */}
                <OnboardingBanner
                  dossier={dossier}
                  onOpenWizard={(step) => {
                    const target = step ? Math.max(2, Math.min(6, step)) : 2;
                    setOnboardingInitialStep(target);
                    setOnboardingModalOpen(true);
                  }}
                  onSimulateApprove={() => {
                    setRole('approved_business');
                    toast.success('Simulation: Business Approved by Compliance Desk!');
                  }}
                  onSimulatePremium={() => {
                    setRole('premium_subscriber');
                    toast.success('Simulation: Account Upgraded to Premium Subscriber!');
                  }}
                />

                {/* Official Unified Vendor Verification Workflow Status Banner */}
                {role !== 'unverified' && (
                  <VendorStatusBanner
                    dossier={dossier}
                    onOpenSummary={() => setSummaryModalOpen(true)}
                    onNavigateTab={(tab) => setActiveTab(tab as typeof activeTab)}
                    onSimulateApprove={() => {
                      setRole('approved_business');
                      toast.success('Simulation: Business Approved by Compliance Desk!');
                    }}
                  />
                )}
                {/* 4 Summary Bento Metric Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Metric 1: Trust Score */}
                  <Card variant="bento" className="p-5 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trust Score</span>
                      <Award className="size-4 text-primary-600" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-slate-900">{trustScore}</span>
                      <span className="text-xs font-bold text-slate-400">/ 100</span>
                      <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded ml-auto">
                        Strong
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Tier: <strong>{scoreTier}</strong> · Top 4% in category
                    </p>
                  </Card>

                  {/* Metric 2: Official Badge */}
                  <Card variant="bento" className="p-5 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verification Badge</span>
                      <ShieldCheck className="size-4 text-primary-600" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-primary-500 animate-pulse" />
                      <span className="text-xs font-extrabold text-slate-900 truncate">
                        {badgeText}
                      </span>
                    </div>
                    <p className="text-[11px] text-primary-800 font-medium">
                      ✓ Tied to level + date per SRS §5.7
                    </p>
                  </Card>

                  {/* Metric 3: Profile Completion */}
                  <Card variant="bento" className="p-5 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dossier Completion</span>
                      <Layers className="size-4 text-indigo-600" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-slate-900">{profileCompletion}%</span>
                      <span className="text-xs font-bold text-slate-400">
                        {profileCompletion === 100
                          ? '(All modules completed)'
                          : `(${documents.length || 16} files vaulted)`}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-600 rounded-full" style={{ width: `${profileCompletion}%` }} />
                    </div>
                  </Card>

                  {/* Metric 4: Commercial Catalog Products */}
                  <Card variant="bento" className="p-5 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Catalog Products</span>
                      <Package className="size-4 text-primary-600" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-slate-900">{dossier.step4.products.length}</span>
                      <span className="text-xs font-bold text-emerald-700 font-semibold">Active & Audited</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Listed on BITAINTEL Verified Supplier Directory
                    </p>
                  </Card>
                </div>

                {/* Premium Subscriber Exclusive Intelligence & Radar Suite */}
                {role === 'premium_subscriber' && (
                  <Card variant="bento" className="p-6 bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 text-white space-y-6 shadow-xl border border-primary-500/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-bold border border-primary-400/30">
                          <Sparkles className="size-3.5 text-primary-300" />
                          <span>Enterprise Intelligence Suite (Premium Unlocked)</span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-extrabold text-white mt-2">
                          Competitor Positioning Radar & Market Benchmark
                        </h2>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Cross-industry comparative analytics based on 14,200+ audited vendors.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => toast.success('Intelligence Dossier (PDF) Generated', { description: 'Exporting 24-page due diligence dossier for executive review.' })}
                          className="text-xs bg-primary-600 hover:bg-primary-500 text-white font-bold h-8"
                          icon={<Download className="size-3.5" />}
                        >
                          Export Dossier (PDF)
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toast.success('Statutory Matrix (XLSX) Exported', { description: 'Live sync data downloaded for ERP/Procurement ingestion.' })}
                          className="text-xs bg-white/10 border-white/20 text-white hover:bg-white/20 font-bold h-8"
                          icon={<FileText className="size-3.5" />}
                        >
                          Export Matrix (XLSX)
                        </Button>
                      </div>
                    </div>

                    {/* 4 Radar Benchmark Indices */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Statutory Compliance</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-white">98%</span>
                          <span className="text-[11px] text-emerald-400 font-bold">+14% vs Peers</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded-full" style={{ width: '98%' }} />
                        </div>
                        <p className="text-[10px] text-slate-400">Zero default notices on MCA21/GSTN</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Financial Solvency</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-white">94%</span>
                          <span className="text-[11px] text-emerald-400 font-bold">+18% vs Peers</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-400 rounded-full" style={{ width: '94%' }} />
                        </div>
                        <p className="text-[10px] text-slate-400">Low Altman-Z credit risk profile</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">On-Time Delivery</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-white">96%</span>
                          <span className="text-[11px] text-emerald-400 font-bold">+12% vs Peers</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-400 rounded-full" style={{ width: '96%' }} />
                        </div>
                        <p className="text-[10px] text-slate-400">Verified dispatched dispatch SLAs</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Quality Rejection Rate</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-white">0.04%</span>
                          <span className="text-[11px] text-emerald-400 font-bold">Top 1% Class</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded-full" style={{ width: '99%' }} />
                        </div>
                        <p className="text-[10px] text-slate-400">Six Sigma compliant batch audits</p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Score Breakdown & Improvement Tips */}
                <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
                  {/* Left: Weighted Modules Status */}
                  <Card variant="bento" className="p-6 bg-white space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-bold text-slate-900">
                          Weighted Score Breakdown (SRS §5.7)
                        </h2>
                        <p className="text-xs text-slate-500">
                          Formula: Identity (20%) + Govt (20%) + Ops (15%) + Docs (15%) + Financial (15%) + Compliance (10%) + Completeness (5%)
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('score')}
                        className="text-xs font-bold text-primary-700 hover:underline"
                      >
                        Detailed View →
                      </button>
                    </div>

                    <div className="space-y-3 pt-1">
                      {SRS_MODULES.slice(0, 4).map((mod) => (
                        <div key={mod.code} className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-900">{mod.code}: {mod.title}</span>
                            <span className="font-mono font-bold text-primary-700">{mod.scoreContribution}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-primary-600 rounded-full" style={{ width: `${mod.completion}%` }} />
                            </div>
                            <span className="text-[11px] font-semibold text-slate-500 w-12 text-right">
                              {mod.completion}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Right: Score Improvement Tips (SRS §5.10) */}
                  <Card variant="bento" className="p-6 bg-white space-y-4">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="size-4 text-primary-600" />
                      <span>Score Improvement Tips</span>
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Reaching the <strong>90–100 Excellent Tier</strong> promotes your listing to the top of procurement buyer search results.
                    </p>

                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 space-y-1">
                        <p className="text-xs font-bold text-amber-900">+4.0 Points (Module C)</p>
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                          Upload latest factory premises utility deed & EPFO monthly headcount return slip.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUploadCategory('Registered Address Proof (Premises Title / Electricity Deed)');
                            setUploadModalOpen(true);
                          }}
                          className="text-[11px] font-bold text-amber-900 underline mt-1 block"
                        >
                          Upload Proof to Module C →
                        </button>
                      </div>

                      <div className="p-3.5 rounded-xl border border-primary-200 bg-primary-50/70 space-y-1">
                        <p className="text-xs font-bold text-primary-900">+3.0 Points (Module E)</p>
                        <p className="text-[11px] text-primary-800 leading-relaxed">
                          Provide Bank Solvency Certificate or CA Net Worth statement with valid UDIN.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUploadCategory('Bank Confirmation Letter / Solvency Certificate');
                            setUploadModalOpen(true);
                          }}
                          className="text-[11px] font-bold text-primary-900 underline mt-1 block"
                        >
                          Upload Proof to Module E →
                        </button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* TAB 2: SCORE & BADGE (SRS §5.7)                                      */}
            {/* ===================================================================== */}
            {activeTab === 'score' && (
              <div className="space-y-6 animate-in fade-in">
                <Card variant="bento" className="p-6 bg-white space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-800 text-xs font-bold border border-primary-200">
                        <Award className="size-3.5" />
                        <span>SRS §5.7 Weighted Scoring Engine</span>
                      </div>
                      <h2 className="text-2xl font-extrabold text-slate-900">
                        BITAINTEL Trust Index: {trustScore} / 100
                      </h2>
                      <p className="text-xs text-slate-500">
                        Official composite trust score evaluated by automated government registry cross-checks & accredited analysts.
                      </p>
                    </div>

                    {/* Official Badge Card */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-1 text-center shadow-md min-w-[220px]">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-primary-400 block">
                        Official Badge
                      </span>
                      <p className="text-sm font-extrabold text-white flex items-center justify-center gap-1.5">
                        <ShieldCheck className="size-4 text-primary-400" />
                        <span>{badgeText}</span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Level: Strong · Active in Directory
                      </p>
                    </div>
                  </div>

                  {/* 7 Parametric Weights per SRS §5.7 */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Weighted Scoring Distribution
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {[
                        { factor: 'Corporate Identity', weight: '20%', score: '20.0', desc: 'MCA CIN, Director DIN, PAN' },
                        { factor: 'Government Verification', weight: '20%', score: '18.5', desc: 'GSTN 24M returns, MSME Udyam' },
                        { factor: 'Business Operations', weight: '15%', score: '12.0', desc: 'Premises utility deed, EPFO/ESIC' },
                        { factor: 'Documents & Certs', weight: '15%', score: '13.5', desc: 'ISO 9001, Quality accreditations' },
                        { factor: 'Financial Standing', weight: '15%', score: '11.0', desc: 'Audited statements, Bank solvency' },
                        { factor: 'Statutory Compliance', weight: '10%', score: '9.0', desc: 'Non-debarment, Clean litigation' },
                        { factor: 'Profile Completeness', weight: '5%', score: '5.0', desc: 'All modules populated & verified' },
                      ].map((item, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-900">{item.factor}</span>
                            <span className="font-mono font-bold text-primary-700">{item.score} / {item.weight}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">{item.desc}</p>
                          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-600 rounded-full" style={{ width: `${(parseFloat(item.score) / parseFloat(item.weight)) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* ===================================================================== */}
            {/* TAB 3: BUSINESS MODULES A–F (SRS §5.3)                               */}
            {/* ===================================================================== */}
            {activeTab === 'modules' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Multi-Module Business Information (A through F)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Structured data architecture adhering strictly to SRS Section 5.3 specifications.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {SRS_MODULES.map((mod) => (
                    <Card key={mod.code} variant="bento" className="p-5 bg-white flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-800 border border-primary-200">
                            {mod.code}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            mod.status === 'Verified' ? 'bg-primary-100 text-primary-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {mod.status}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-slate-900 leading-snug">{mod.title}</h3>
                          <p className="mt-1 text-xs text-slate-500 leading-relaxed">{mod.desc}</p>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Required Evidence Files:
                          </p>
                          {mod.docsRequired.map((doc, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                              <CheckCircle2 className="size-3 text-primary-600 shrink-0" />
                              <span className="truncate">{doc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Weight: <strong>{mod.scoreContribution}</strong></span>
                        <button
                          type="button"
                          onClick={() => {
                            const matched = DOCUMENT_CATEGORIES_SRS.find(c => c.module.includes(mod.code.replace('Module ', ''))) || DOCUMENT_CATEGORIES_SRS[0];
                            setSelectedUploadCategory(matched.name);
                            setUploadModalOpen(true);
                          }}
                          className="font-bold text-primary-700 hover:text-primary-900 flex items-center gap-1"
                        >
                          Manage Proofs <ChevronRight className="size-3" />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* TAB 4: DOCUMENT MANAGEMENT VAULT (SRS §5.4)                          */}
            {/* ===================================================================== */}
            {activeTab === 'documents' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Company Document Upload & Versioning Vault (SRS §5.4)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Vaulted files with cryptographic tamper tracking, expiry monitoring, and analyst verification status.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => setUploadModalOpen(true)}
                    icon={<UploadCloud className="size-4" />}
                  >
                    Upload New Document
                  </Button>
                </div>

                {/* Table of Vaulted Documents */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-3.5">Document Name & Category</th>
                        <th className="p-3.5">Version</th>
                        <th className="p-3.5">Upload Date</th>
                        <th className="p-3.5">Validity Expiry</th>
                        <th className="p-3.5">Audit Status</th>
                        <th className="p-3.5">Verifier / Timestamp</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5">
                            <p className="font-bold text-slate-900 flex items-center gap-2">
                              <FileText className="size-4 text-primary-600 shrink-0" />
                              <span className="truncate max-w-[200px]">{doc.name}</span>
                            </p>
                            <span className="text-[11px] text-slate-500">{doc.category} · {doc.size}</span>
                          </td>
                          <td className="p-3.5 font-mono font-bold text-slate-800">{doc.version}</td>
                          <td className="p-3.5 font-mono text-slate-600">{doc.uploadDate}</td>
                          <td className="p-3.5 font-mono text-slate-600">{doc.expiryDate}</td>
                          <td className="p-3.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              doc.status === 'Verified'
                                ? 'bg-primary-100 text-primary-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-500 text-[11px]">
                            {doc.verifier}
                          </td>
                          <td className="p-3.5 text-right space-x-2">
                            <button
                              type="button"
                              onClick={() => toast.success(`Downloading verified copy: ${doc.name}`)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                              title="Download document"
                            >
                              <Download className="size-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* TAB 6: NOTIFICATIONS (SRS §5.11)                                     */}
            {/* ===================================================================== */}
            {activeTab === 'notifications' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      System Notifications & Lifecycle Alerts (SRS §5.11)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Multi-channel alerts dispatched via in-app, official email, and SMS/OTP.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                    className="text-xs font-bold text-primary-700 hover:underline"
                  >
                    Mark All as Read
                  </button>
                </div>

                <div className="space-y-2.5">
                  {notifications.map((notif) => (
                    <Card key={notif.id} variant="bento" className="p-4 bg-white flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="size-8 rounded-full bg-primary-50 text-primary-700 grid place-items-center shrink-0 mt-0.5">
                          <Bell className="size-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{notif.title}</p>
                          <p className="text-xs text-slate-600 mt-0.5">{notif.desc}</p>
                          <span className="text-[10px] text-slate-400 font-mono mt-1 block">{notif.date}</span>
                        </div>
                      </div>
                      {!notif.read && (
                        <span className="size-2 rounded-full bg-primary-600 shrink-0" />
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* STEP 2: COMPANY PROFILE & MULTI-PLANTS                                */}
            {/* ===================================================================== */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-in fade-in">
                <CompanyProfileTab
                  data={dossier.step2}
                  onUpdate={async (up) => {
                    const updated = { ...dossier, step2: { ...dossier.step2, ...up } };
                    setDossier(updated);
                    try {
                      // 1. If logoUrl or incorporationDate updated, sync to business_entities
                      const profilePayload: vendorService.VendorProfileUpdatePayload = {};
                      if (up.logoUrl !== undefined) profilePayload.logoUrl = up.logoUrl || null;
                      if (up.incorporationDate !== undefined) profilePayload.incorporationDate = up.incorporationDate || null;
                      if (up.legalName !== undefined) profilePayload.legalName = up.legalName || null;
                      if (up.tradeName !== undefined) profilePayload.tradeName = up.tradeName || null;
                      if (Object.keys(profilePayload).length > 0) {
                        await vendorService.updateVendorProfile(profilePayload);
                      }

                      // 2. If statutory identifiers updated, sync to statutory_identifiers
                      if (up.tan !== undefined || up.duns !== undefined || up.lei !== undefined || up.iec !== undefined) {
                        await vendorService.updateStatutory({
                          tan: up.tan ? String(up.tan).trim().toUpperCase() : undefined,
                          duns: up.duns ? String(up.duns).trim() : undefined,
                          dunsNumber: up.duns ? String(up.duns).trim() : undefined,
                          lei: up.lei ? String(up.lei).trim().toUpperCase() : undefined,
                          iecCode: up.iec ? String(up.iec).trim() : undefined,
                        });
                      }
                    } catch (e) {
                      console.warn('Could not sync profile/statutory updates to backend:', e);
                    }
                    toast.success('Company profile updated.');
                  }}
                />
              </div>
            )}

            {/* ===================================================================== */}
            {/* STEP 3: BUSINESS CLASSIFICATION & 240 SUBCATEGORIES                   */}
            {/* ===================================================================== */}
            {activeTab === 'capabilities' && (
              <div className="space-y-6 animate-in fade-in">
                <BusinessCapabilitiesTab data={dossier.step3} />
              </div>
            )}

            {/* ===================================================================== */}
            {/* STEP 4: COMMERCIAL CATALOG & SPECIFICATIONS                           */}
            {/* ===================================================================== */}
            {activeTab === 'catalog' && (
              <div className="space-y-6 animate-in fade-in">
                <CatalogProductsTab
                  products={dossier.step4.products}
                  onUpdateProducts={(prods) => {
                    const updated = {
                      ...dossier,
                      step4: { ...dossier.step4, products: prods },
                    };
                    setDossier(updated);
                  }}
                />
              </div>
            )}

            {/* ===================================================================== */}
            {/* STEP 4: QUALITY, SAFETY & ACCREDITATIONS                              */}
            {/* ===================================================================== */}
            {activeTab === 'certifications' && (
              <div className="space-y-6 animate-in fade-in">
                <CertificationsQualityTab
                  certifications={dossier.step4.certifications}
                  onUpdateCertifications={(certs) => {
                    const updated = {
                      ...dossier,
                      step4: { ...dossier.step4, certifications: certs },
                    };
                    setDossier(updated);
                  }}
                  testingCapabilities={dossier.step4.testingCapabilities}
                  qualityAssuranceProcedures={dossier.step4.qualityAssuranceProcedures}
                />
              </div>
            )}

            {/* ===================================================================== */}
            {/* STEP 5: COMMERCIAL, TRADE & BANKING DETAILS                           */}
            {/* ===================================================================== */}
            {activeTab === 'commercial' && (
              <div className="space-y-6 animate-in fade-in">
                <CommercialTradeTab
                  data={dossier.step5}
                  onUpdateCommercial={(updated) => {
                    setDossier((prev) => ({
                      ...prev,
                      step5: updated,
                    }));
                  }}
                />
              </div>
            )}
            {/* ===================================================================== */}
            {/* TAB 8: ACCOUNT & SECURITY SETTINGS                                   */}
            {/* ===================================================================== */}
            {activeTab === 'settings' && (
              <AccountSettingsTab
                dossier={dossier}
                user={user}
                role={role}
                onUpdateDossier={(updated) => {
                  setDossier(updated);
                }}
                onUpgradeToPremium={() => {
                  setRole('premium_subscriber');
                  toast.success('Simulation: Account Upgraded to Premium Subscriber!');
                }}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

          </div>
        </main>

        {/* ========================================================================= */}
        {/* UPLOAD DOCUMENT MODAL (Simulated Vault Upload per SRS §5.4)               */}
        {/* ========================================================================= */}
        {uploadModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <Card variant="bento" className="p-6 max-w-lg w-full bg-white space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Upload Statutory Evidence Proof</h3>
                  <p className="text-xs text-slate-500">SRS Section 5.4 Document Management Vault</p>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 grid place-items-center"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Document Category Dropdown per SRS Section 5.4 */}
              <div>
                <CustomDropdown
                  label="Select Required Verification Category (SRS §5.4)"
                  value={selectedUploadCategory}
                  onChange={(val) => setSelectedUploadCategory(val)}
                  options={DOCUMENT_CATEGORIES_SRS.map((cat) => ({
                    value: cat.name,
                    label: cat.name,
                    description: `${cat.module} · ${cat.required ? 'Mandatory' : 'Optional'}`,
                  }))}
                />
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-2 bg-slate-50/70 hover:bg-slate-50 transition-colors cursor-pointer">
                <UploadCloud className="size-10 text-primary-600 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Drag & drop your PDF or click to browse</p>
                <p className="text-[11px] text-slate-400">Accepted formats: PDF, JPG, PNG (Max 15MB) · Encrypted at Rest (AES-256)</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setUploadModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    const matchedCat = DOCUMENT_CATEGORIES_SRS.find(c => c.name === selectedUploadCategory);
                    const cleanName = selectedUploadCategory.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 24);
                    const newDoc = {
                      id: `DOC-${Math.floor(100 + Math.random() * 900)}`,
                      name: `${cleanName}_Proof_2026.pdf`,
                      category: matchedCat?.name || selectedUploadCategory,
                      uploadDate: 'Just now',
                      expiryDate: 'Continuous Active',
                      status: 'In Review',
                      version: 'v1.0',
                      verifier: 'Pending Analyst Review',
                      verificationDate: '—',
                      rejectionReason: null,
                      size: '2.8 MB',
                    };
                    setDocuments((prev) => [newDoc, ...prev]);
                    setUploadModalOpen(false);
                    toast.success(`Document deposited: "${selectedUploadCategory}"`, {
                      description: 'Encrypted into the statutory vault. Status marked as "In Review".',
                    });
                  }}
                  icon={<CheckCircle2 className="size-4" />}
                >
                  Deposit & Trigger Verification
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Official Registration Dossier Summary Modal */}
        <RegistrationSummaryModal
          isOpen={summaryModalOpen}
          onClose={() => setSummaryModalOpen(false)}
          dossier={dossier}
        />

        {/* In-Dashboard Progressive Registration Wizard Modal (Steps 2 - 6) */}
        <OnboardingWizardModal
          isOpen={onboardingModalOpen}
          onClose={() => setOnboardingModalOpen(false)}
          initialStep={onboardingInitialStep}
          dossier={dossier}
          onDossierChange={(updated) => setDossier(updated)}
        />
      </div>
    </RoleGuard>
  );
}
