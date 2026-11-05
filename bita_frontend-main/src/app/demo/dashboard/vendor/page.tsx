'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { Checkbox } from '@/components/ui/Checkbox';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { toast } from 'sonner';
import { FullVendorRegistrationDossier, VendorRegistrationStatus } from '@/types/vendorRegistration';
import { getStoredVendorDossier, saveVendorDossierToStorage, DEMO_PREFILLED_DOSSIER } from '@/config/initialVendorDossier';
import { VendorStatusBanner } from '@/components/dashboard/vendor/VendorStatusBanner';
import { OnboardingBanner } from '@/components/dashboard/vendor/OnboardingBanner';
import { OnboardingWizardModal } from '@/components/dashboard/vendor/OnboardingWizardModal';
import { PersonaSwitcher } from '@/components/shared/PersonaSwitcher';
import { RegistrationSummaryModal } from '@/components/dashboard/vendor/RegistrationSummaryModal';
import { CompanyProfileTab } from '@/components/dashboard/vendor/CompanyProfileTab';
import { BusinessCapabilitiesTab } from '@/components/dashboard/vendor/BusinessCapabilitiesTab';
import { CatalogProductsTab } from '@/components/dashboard/vendor/CatalogProductsTab';
import { CertificationsQualityTab } from '@/components/dashboard/vendor/CertificationsQualityTab';
import { CommercialTradeTab } from '@/components/dashboard/vendor/CommercialTradeTab';
import {
  LayoutDashboard,
  ShieldCheck,
  TrendingUp,
  FileText,
  MessageSquare,
  Bell,
  Building2,
  Users,
  Settings,
  ChevronRight,
  UploadCloud,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  Award,
  Package,
  Globe2,
  Layers,
  Eye,
  ArrowUpRight,
  Search,
  Filter,
  Check,
  Menu,
  X,
  FileCheck2,
  Download,
  ExternalLink,
  Lock,
  Calendar,
  DollarSign,
  Briefcase,
  AlertCircle,
  HelpCircle,
  Send,
} from 'lucide-react';

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

// Enquiry Lifecycle per SRS Section 5.9
// (New → Viewed → Responded → In Discussion → Closed/Rejected)
export type EnquiryStatus = 'New' | 'Viewed' | 'Responded' | 'In Discussion' | 'Closed/Rejected';

export interface Enquiry {
  id: string;
  buyerName: string;
  buyerCompany: string;
  buyerEmail: string;
  buyerPhone: string;
  subject: string;
  details: string;
  date: string;
  status: EnquiryStatus;
  budget: string;
}

const INITIAL_ENQUIRIES: Enquiry[] = [
  {
    id: 'ENQ-802',
    buyerName: 'Kavita Sundaram',
    buyerCompany: 'Tata Commercial Infrastructure Ltd',
    buyerEmail: 'procurement@tatacommercial.com',
    buyerPhone: '+91 98200 11223',
    subject: 'RFI: Empanelment for High-Tensile Structural Beams & Fabrication',
    details: 'Looking for audited supplier capability to deliver 400 MT monthly galvanized steel structures for Mumbai-Pune highway infra project.',
    date: '21 Oct 2026, 04:30 PM',
    status: 'New',
    budget: '₹4.50 Crore / year',
  },
  {
    id: 'ENQ-803',
    buyerName: 'Anil Deshmukh',
    buyerCompany: 'Larsen & Toubro Heavy Civil Infra',
    buyerEmail: 'a.deshmukh@lntecc.com',
    buyerPhone: '+91 97654 32109',
    subject: 'Dossier Access Request & ISO 9001 Scope Verification',
    details: 'Requesting access to detailed Module C test certificates and welding quality records for metro bridge tender.',
    date: '19 Oct 2026, 11:15 AM',
    status: 'In Discussion',
    budget: '₹2.80 Crore',
  },
  {
    id: 'ENQ-804',
    buyerName: 'Vikram Joshi',
    buyerCompany: 'Jindal Steel & Power Engineering',
    buyerEmail: 'v.joshi@jindalinfra.in',
    buyerPhone: '+91 99887 76655',
    subject: 'Quotation Request for Precision CNC Machined Flanges',
    details: 'Need 1,200 units of custom grade 316 stainless forged flanges as per drawing spec JS-2026-ENG-B.',
    date: '16 Oct 2026, 02:40 PM',
    status: 'Responded',
    budget: '₹1.15 Crore',
  },
];

// In-app notifications per SRS Section 5.11
const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_1',
    title: 'New Buyer Empanelment RFI Received',
    desc: 'Tata Commercial Infrastructure submitted a new enquiry for Structural Fabrication.',
    date: 'Yesterday, 4:30 PM',
    read: false,
    type: 'enquiry',
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
    | 'enquiries'
    | 'notifications'
    | 'settings'
  >('overview');

  // Live Dossier State synced with Registration
  const [dossier, setDossier] = useState<FullVendorRegistrationDossier>(DEMO_PREFILLED_DOSSIER);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);
  const [onboardingInitialStep, setOnboardingInitialStep] = useState(2);

  useEffect(() => {
    const stored = getStoredVendorDossier();
    if (stored) {
      setDossier(stored);
    }
  }, []);

  // Mobile sidebar toggle
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Document Vault State
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedUploadCategory, setSelectedUploadCategory] = useState(DOCUMENT_CATEGORIES_SRS[0].name);

  // Enquiries State
  const [enquiries, setEnquiries] = useState(INITIAL_ENQUIRIES);
  const [selectedEnquiry, setSelectedEnquiry] = useState<typeof INITIAL_ENQUIRIES[0] | null>(INITIAL_ENQUIRIES[0]);
  const [replyText, setReplyText] = useState('');
  const [replySuccess, setReplySuccess] = useState('');

  // Notifications State
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Settings State (Contact person, Security, Notification toggles)
  const [settingsForm, setSettingsForm] = useState({
    contactPerson: 'Rajesh K. Mehta',
    designation: 'Managing Director & Authorized Signatory',
    email: 'contact@meridiansteelworks.com',
    phone: '+91 98220 54321',
    alternatePhone: '+91 20 2712 9840',
    registeredOffice: 'Plot 42, MIDC Industrial Area, Phase II, Chakan, Pune, Maharashtra 410501',
    emailAlertsEnquiry: true,
    emailAlertsVerification: true,
    smsAlertsOtp: true,
    digestWeekly: false,
    publicDirectoryVisible: true,
    showFinancialBand: true,
  });
  const [settingsSavedMessage, setSettingsSavedMessage] = useState('');

  // Password / Security modal/state
  const [passwordState, setPasswordState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

  // Score metrics per SRS §5.7
  // Weighted 0-100: Identity 20%, Govt 20%, Operations 15%, Docs 15%, Financial 15%, Compliance 10%, Completeness 5%
  const trustScore = 89;
  const scoreTier = 'Strong (75–89)'; // Excellent (90-100), Strong (75-89), Good (60-74), Moderate (40-59), Limited (0-39)
  const badgeText = 'BITAINTEL Verified — October 2026';
  const profileCompletion = 92;

  // Handle Enquiry Status Transition
  function handleEnquiryStatusChange(id: string, newStatus: 'Viewed' | 'Responded' | 'In Discussion' | 'Closed/Rejected') {
    setEnquiries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
    );
    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  }

  // Handle Reply to buyer
  function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText || !selectedEnquiry) return;

    handleEnquiryStatusChange(selectedEnquiry.id, 'Responded');
    const msg = `Response transmitted securely to ${selectedEnquiry.buyerEmail}`;
    setReplySuccess(msg);
    toast.success('Commercial Proposal Sent', { description: msg });
    setReplyText('');
    setTimeout(() => setReplySuccess(''), 4000);
  }

  // Handle Save Settings
  function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSettingsSavedMessage('Account preferences and contact details updated successfully.');
    toast.success('Account Settings Saved', {
      description: 'Your authorized contact details and preferences have been updated.',
    });
    setTimeout(() => setSettingsSavedMessage(''), 4000);
  }

  // Handle Update Password
  function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordState.currentPassword || !passwordState.newPassword) {
      setPasswordErrorMessage('Please provide both current and new password.');
      toast.error('Validation Error', { description: 'Please provide both current and new password.' });
      return;
    }
    if (passwordState.newPassword.length < 8) {
      setPasswordErrorMessage('New password must be at least 8 characters with letters, numbers, and symbols.');
      toast.error('Weak Password', { description: 'Password must be at least 8 characters with letters, numbers, and symbols.' });
      return;
    }
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setPasswordErrorMessage('New password and confirmation do not match.');
      toast.error('Mismatch', { description: 'New password and confirmation do not match.' });
      return;
    }
    setPasswordErrorMessage('');
    setPasswordSuccessMessage('Security credentials updated. Re-authentication active on all devices.');
    toast.success('Security Credentials Updated', {
      description: 'Password changed successfully. Re-authentication active on all sessions.',
    });
    setPasswordState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setPasswordSuccessMessage(''), 4000);
  }

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
    { id: 'enquiries', label: 'Buyer Enquiries', icon: MessageSquare, badge: `${enquiries.filter(e => e.status === 'New').length} New` },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: `${notifications.filter(n => !n.read).length}` },
    { id: 'settings', label: 'Account Settings', icon: Settings, badge: null },
  ];

  return (
    <RoleGuard>
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
            <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <p className="text-xs font-bold text-slate-900 truncate">
                {user?.businessName || 'Meridian Steel Works Ltd'}
              </p>
              <p className="text-[11px] font-mono text-slate-500 truncate">
                GSTIN: 27AABCM8291Q1Z4
              </p>
              <div className="pt-1.5 flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
                  Tier: Strong
                </span>
                <span className="text-[11px] font-black text-primary-600 font-mono">
                  {trustScore} / 100
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links (SRS Modules & Workflows) */}
          <nav className="p-3 space-y-1 overflow-y-auto flex-1 bg-white">
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
                    setActiveTab(item.id as any);
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
                    {activeTab === 'enquiries' && 'Buyer Enquiries & RFIs'}
                    {activeTab === 'notifications' && 'System Notifications'}
                    {activeTab === 'settings' && 'Account & Security Settings'}
                  </span>
                </h1>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  {dossier.step2.legalName || 'Meridian Steel Works Ltd'} · Vendor ID: {dossier.step6.vendorId || 'BITA-VND-2026-8942'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <PersonaSwitcher />

              {(role === 'unverified' || role === 'pending_approval') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOnboardingInitialStep(role === 'unverified' ? 2 : 6);
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
                    setOnboardingInitialStep(step || 2);
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

                {/* Official Vendor Verification Workflow Status Banner (for approved/under review statuses) */}
                {role !== 'unverified' && (
                  <VendorStatusBanner
                    dossier={dossier}
                    onOpenSummary={() => setSummaryModalOpen(true)}
                    onNavigateTab={(tab) => setActiveTab(tab as any)}
                    onSimulateStatusChange={(newStatus) => {
                      const updated = {
                        ...dossier,
                        step6: { ...dossier.step6, status: newStatus },
                      };
                      setDossier(updated);
                      saveVendorDossierToStorage(updated);
                      toast.success(`Simulated verification status: ${newStatus}`);
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
                      <span className="text-xs font-bold text-slate-400">(16 of 18 files)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-600 rounded-full" style={{ width: `${profileCompletion}%` }} />
                    </div>
                  </Card>

                  {/* Metric 4: Buyer Enquiries */}
                  <Card variant="bento" className="p-5 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Buyer Enquiries</span>
                      <MessageSquare className="size-4 text-amber-600" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-slate-900">{enquiries.length}</span>
                      <span className="text-xs font-bold text-primary-700 font-semibold">+1 new today</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      RFI tenders from Tata Infra & L&T Heavy Civil
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

                {/* Recent Buyer Enquiries Snippet */}
                <Card variant="bento" className="p-6 bg-white space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Recent Procurement Enquiries</h2>
                      <p className="text-xs text-slate-500">Corporate RFIs initiated by verified procurement buyers.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('enquiries')}
                      className="text-xs font-bold text-primary-700 hover:underline"
                    >
                      View All ({enquiries.length}) →
                    </button>
                  </div>

                  {role === 'unverified' ? (
                    <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 text-center space-y-3">
                      <div className="size-10 rounded-xl bg-amber-100 text-amber-800 grid place-items-center mx-auto">
                        <Lock className="size-5" />
                      </div>
                      <div className="max-w-md mx-auto">
                        <h3 className="text-sm font-bold text-slate-900">Buyer RFIs Locked During Step 1</h3>
                        <p className="text-xs text-slate-600 mt-1">
                          Direct procurement RFIs from enterprise buyers (like Tata Commercial and L&T Infra) will be activated once you complete Step 2 (Company Profile & GSTIN Identification).
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            setOnboardingInitialStep(2);
                            setOnboardingModalOpen(true);
                          }}
                          className="mt-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs"
                        >
                          Complete Step 2 to Unlock RFIs →
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {enquiries.map((enq) => (
                        <div
                          key={enq.id}
                          onClick={() => {
                            setSelectedEnquiry(enq);
                            setActiveTab('enquiries');
                          }}
                          className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{enq.buyerCompany}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                {enq.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-1">{enq.subject}</p>
                            <p className="text-[11px] text-primary-700 font-semibold">{enq.budget}</p>
                          </div>
                          <span className="text-xs text-slate-400 shrink-0">{enq.date}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
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
            {/* TAB 5: BUYER ENQUIRY LIFECYCLE (SRS §5.9)                            */}
            {/* (New → Viewed → Responded → In Discussion → Closed/Rejected)        */}
            {/* ===================================================================== */}
            {activeTab === 'enquiries' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900">
                    Buyer Enquiry Lifecycle Management (SRS §5.9)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Lifecycle states: <strong>New → Viewed → Responded → In Discussion → Closed/Rejected</strong>
                  </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
                  {/* Left: Enquiry List */}
                  <div className="space-y-3">
                    {enquiries.map((enq) => {
                      const isSelected = selectedEnquiry?.id === enq.id;
                      return (
                        <div
                          key={enq.id}
                          onClick={() => {
                            setSelectedEnquiry(enq);
                            if (enq.status === 'New') {
                              handleEnquiryStatusChange(enq.id, 'Viewed');
                            }
                          }}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-primary-600 bg-primary-50/40 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5">
                              <span className="font-mono text-[10px] text-slate-400 font-bold">{enq.id}</span>
                              <h3 className="text-xs font-bold text-slate-900">{enq.buyerCompany}</h3>
                              <p className="text-[11px] text-slate-600">{enq.buyerName}</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              enq.status === 'New'
                                ? 'bg-primary-600 text-white'
                                : enq.status === 'In Discussion'
                                ? 'bg-primary-100 text-primary-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {enq.status}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-slate-700 line-clamp-1 font-medium">{enq.subject}</p>
                          <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-400">
                            <span className="font-semibold text-primary-800">{enq.budget}</span>
                            <span>{enq.date}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right: Enquiry Detail & Response Composer */}
                  {selectedEnquiry && (
                    <Card variant="bento" className="p-6 bg-white space-y-5">
                      {replySuccess && (
                        <div className="p-3 rounded-xl border border-primary-300 bg-primary-50 text-primary-900 text-xs font-semibold flex items-center gap-2">
                          <CheckCircle2 className="size-4 text-primary-600 shrink-0" />
                          <span>{replySuccess}</span>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div>
                          <span className="font-mono text-xs text-slate-400 font-bold">{selectedEnquiry.id}</span>
                          <h3 className="text-lg font-bold text-slate-900">{selectedEnquiry.buyerCompany}</h3>
                          <p className="text-xs text-slate-500">Contact: {selectedEnquiry.buyerName} · {selectedEnquiry.buyerEmail}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Lifecycle Status:</span>
                          <CustomDropdown
                            value={selectedEnquiry.status}
                            onChange={(val) => handleEnquiryStatusChange(selectedEnquiry.id, val as any)}
                            options={[
                              { value: 'New', label: 'New' },
                              { value: 'Viewed', label: 'Viewed' },
                              { value: 'Responded', label: 'Responded' },
                              { value: 'In Discussion', label: 'In Discussion' },
                              { value: 'Closed/Rejected', label: 'Closed/Rejected' },
                            ]}
                            className="w-40"
                            buttonClassName="min-h-9 py-1 px-3 text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <p className="font-bold text-slate-900 text-sm">{selectedEnquiry.subject}</p>
                        <p className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
                          {selectedEnquiry.details}
                        </p>
                      </div>

                      {/* Reply Form */}
                      <form onSubmit={handleSendReply} className="space-y-3 pt-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                          Transmit Commercial Proposal / Response
                        </label>
                        <textarea
                          rows={4}
                          required
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your response to the corporate procurement team..."
                          className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-900 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => handleEnquiryStatusChange(selectedEnquiry.id, 'In Discussion')}
                          >
                            Mark &quot;In Discussion&quot;
                          </Button>
                          <Button
                            type="submit"
                            variant="primary"
                            icon={<Send className="size-3.5" />}
                          >
                            Send Response
                          </Button>
                        </div>
                      </form>
                    </Card>
                  )}
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
                  onUpdate={(up) => {
                    const updated = { ...dossier, step2: { ...dossier.step2, ...up } };
                    setDossier(updated);
                    saveVendorDossierToStorage(updated);
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
                    saveVendorDossierToStorage(updated);
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
                    saveVendorDossierToStorage(updated);
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
                <CommercialTradeTab data={dossier.step5} />
              </div>
            )}

            {/* ===================================================================== */}
            {/* TAB 8: ACCOUNT & SECURITY SETTINGS                                   */}
            {/* ===================================================================== */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-in fade-in">
                {/* Success Feedback banner */}
                {settingsSavedMessage && (
                  <div className="p-4 rounded-2xl border border-primary-300 bg-primary-50 text-primary-900 text-xs font-semibold flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-primary-600 shrink-0" />
                    <span>{settingsSavedMessage}</span>
                  </div>
                )}
                {passwordSuccessMessage && (
                  <div className="p-4 rounded-2xl border border-primary-300 bg-primary-50 text-primary-900 text-xs font-semibold flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-primary-600 shrink-0" />
                    <span>{passwordSuccessMessage}</span>
                  </div>
                )}
                {passwordErrorMessage && (
                  <div className="p-4 rounded-2xl border border-rose-300 bg-rose-50 text-rose-900 text-xs font-semibold flex items-center gap-2.5">
                    <AlertCircle className="size-4 text-rose-600 shrink-0" />
                    <span>{passwordErrorMessage}</span>
                  </div>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Card 1: Official Corporate Representative & Contact Details */}
                  <Card variant="bento" className="p-6 bg-white space-y-5">
                    <div className="border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Users className="size-4 text-primary-600" />
                        <h2 className="text-base font-bold text-slate-900">Authorized Signatory & Contact Info</h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Primary focal point registered for verification inquiries & corporate buyer RFIs.
                      </p>
                    </div>

                    <form onSubmit={handleSaveSettings} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Authorized Contact Person
                        </label>
                        <input
                          type="text"
                          value={settingsForm.contactPerson}
                          onChange={(e) => setSettingsForm({ ...settingsForm, contactPerson: e.target.value })}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Corporate Designation / Role
                        </label>
                        <input
                          type="text"
                          value={settingsForm.designation}
                          onChange={(e) => setSettingsForm({ ...settingsForm, designation: e.target.value })}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Official Email (UID)
                          </label>
                          <input
                            type="email"
                            value={settingsForm.email}
                            onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Mobile Phone (OTP Active)
                          </label>
                          <input
                            type="text"
                            value={settingsForm.phone}
                            onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Registered Factory / Office Premises
                        </label>
                        <textarea
                          rows={2}
                          value={settingsForm.registeredOffice}
                          onChange={(e) => setSettingsForm({ ...settingsForm, registeredOffice: e.target.value })}
                          className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                          required
                        />
                      </div>

                      <div className="pt-2 flex justify-end">
                        <Button type="submit" variant="primary" size="sm">
                          Save Contact Details
                        </Button>
                      </div>
                    </form>
                  </Card>

                  {/* Card 2: Security, Password & Verification Controls */}
                  <Card variant="bento" className="p-6 bg-white space-y-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <Lock className="size-4 text-primary-600" />
                          <h2 className="text-base font-bold text-slate-900">Security & Authentication (SRS §5.11)</h2>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Audit-compliant password policies and multi-factor session authentication.
                        </p>
                      </div>

                      <form onSubmit={handleUpdatePassword} className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            placeholder="••••••••••••"
                            value={passwordState.currentPassword}
                            onChange={(e) => setPasswordState({ ...passwordState, currentPassword: e.target.value })}
                            className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                              New Password
                            </label>
                            <input
                              type="password"
                              placeholder="Minimum 8 characters"
                              value={passwordState.newPassword}
                              onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
                              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                              Confirm Password
                            </label>
                            <input
                              type="password"
                              placeholder="Re-enter new password"
                              value={passwordState.confirmPassword}
                              onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
                              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                            />
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <Button type="submit" variant="secondary" size="sm">
                            Update Password
                          </Button>
                        </div>
                      </form>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center justify-between text-slate-900 font-bold">
                        <span>Active Session Security</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-100 text-primary-800">
                          TLS 1.3 / AES-256
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Logged in from IP: <strong>103.24.120.44 (Pune, India)</strong> · Last active: Just now
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Card 3: Notification & Privacy Preferences (SRS §5.10 & §5.11) */}
                <Card variant="bento" className="p-6 bg-white space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Bell className="size-4 text-primary-600" />
                      <h2 className="text-base font-bold text-slate-900">Notification & Directory Privacy Preferences</h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Configure multi-channel alerts and consent controls for your public verified profile.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4">
                      <h3 className="text-xs font-bold text-slate-900">Multi-Channel Alerts</h3>

                      <Checkbox
                        checked={settingsForm.emailAlertsEnquiry}
                        onChange={(e) => setSettingsForm({ ...settingsForm, emailAlertsEnquiry: e.target.checked })}
                        label="Buyer Enquiry Instant Alerts"
                        description="Notify via email when an enterprise buyer submits an RFI or message."
                      />

                      <Checkbox
                        checked={settingsForm.emailAlertsVerification}
                        onChange={(e) => setSettingsForm({ ...settingsForm, emailAlertsVerification: e.target.checked })}
                        label="Analyst Verification Milestones"
                        description="Receive updates when uploaded proofs are verified or need re-submission."
                      />

                      <Checkbox
                        checked={settingsForm.smsAlertsOtp}
                        onChange={(e) => setSettingsForm({ ...settingsForm, smsAlertsOtp: e.target.checked })}
                        label="SMS / OTP Security Alerts"
                        description="Critical security notifications sent to primary mobile phone."
                      />
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4">
                      <h3 className="text-xs font-bold text-slate-900">Directory Visibility & Consent (SRS §5.3)</h3>

                      <Checkbox
                        checked={settingsForm.publicDirectoryVisible}
                        onChange={(e) => setSettingsForm({ ...settingsForm, publicDirectoryVisible: e.target.checked })}
                        label="Publish in BITAINTEL Verified Directory"
                        description="Permit approved enterprise buyers to discover your business dossier."
                      />

                      <Checkbox
                        checked={settingsForm.showFinancialBand}
                        onChange={(e) => setSettingsForm({ ...settingsForm, showFinancialBand: e.target.checked })}
                        label="Display Audited Turnover Band (₹25–50 Cr)"
                        description="Show verified turnover bracket without revealing granular bank balance."
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSettingsSavedMessage('Preferences updated successfully.');
                        setTimeout(() => setSettingsSavedMessage(''), 4000);
                      }}
                    >
                      Save Preferences
                    </Button>
                  </div>
                </Card>
              </div>
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
                      category: selectedUploadCategory,
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
