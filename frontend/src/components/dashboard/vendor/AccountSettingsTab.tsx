'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Lock,
  Bell,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  LogOut,
  Download,
  Sparkles,
  ExternalLink,
  AlertTriangle,
  KeyRound,
  MailCheck,
  Building2,
  RotateCcw,
} from 'lucide-react';
import type { FullVendorRegistrationDossier } from '@/types/vendorRegistration';
import type { AuthUser, UserRole } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { BusinessAvatar } from '@/components/shared/BusinessLogoUploader';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const SETTINGS_STORAGE_KEY = 'bitaintel_vendor_account_settings_v1';

interface VendorSettingsPrefs {
  alternatePhone: string;
  rfqEscalationEmail: string;
  twoFactorRequired: boolean;
  emailAlertsEnquiry: boolean;
  emailAlertsVerification: boolean;
  expiryAlerts90Days: boolean;
  smsAlertsOtp: boolean;
  digestWeekly: boolean;
  publicDirectoryVisible: boolean;
  showFinancialBand: boolean;
  maskExecutiveContactsForVisitors: boolean;
  allowTechnicalSheetDownloads: boolean;
  requireFinancialConsentToken: boolean;
}

const DEFAULT_PREFS: VendorSettingsPrefs = {
  alternatePhone: '+91 20 2712 9840',
  rfqEscalationEmail: '',
  twoFactorRequired: true,
  emailAlertsEnquiry: true,
  emailAlertsVerification: true,
  expiryAlerts90Days: true,
  smsAlertsOtp: true,
  digestWeekly: false,
  publicDirectoryVisible: true,
  showFinancialBand: true,
  maskExecutiveContactsForVisitors: true,
  allowTechnicalSheetDownloads: true,
  requireFinancialConsentToken: true,
};

interface ActiveSessionItem {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

const INITIAL_SESSIONS: ActiveSessionItem[] = [
  {
    id: 'SES-CUR-01',
    device: 'Windows Workstation',
    browser: 'Chrome · Current Session',
    location: 'Pune, Maharashtra, IN',
    ip: '103.24.120.44',
    lastActive: 'Active now',
    isCurrent: true,
  },
  {
    id: 'SES-MOB-02',
    device: 'Corporate Mobile Portal',
    browser: 'Safari iOS 19 · OTP Verified',
    location: 'Mumbai, Maharashtra, IN',
    ip: '49.36.88.192',
    lastActive: 'Yesterday, 6:14 PM',
    isCurrent: false,
  },
];

interface AccountSettingsTabProps {
  dossier: FullVendorRegistrationDossier;
  user: AuthUser | null;
  role: UserRole;
  onUpdateDossier: (updated: FullVendorRegistrationDossier) => void;
  onUpgradeToPremium: () => void;
  onNavigateTab: (tab: 'profile' | 'documents' | 'score') => void;
}

export function AccountSettingsTab({
  dossier,
  user,
  role,
  onUpdateDossier,
  onUpgradeToPremium,
  onNavigateTab,
}: AccountSettingsTabProps) {
  // Signatory & Contact form state seeded from live dossier/user
  const [contactForm, setContactForm] = useState({
    authorizedName: dossier.step1.authorizedName || user?.name || 'Vikramaditya Shinde',
    designation: dossier.step1.designation || user?.designation || 'Managing Director & Authorized Signatory',
    email: dossier.step1.email || user?.email || 'vikram.shinde@meridiansteel.com',
    mobile: dossier.step1.mobile || user?.mobile || '+91 98201 44820',
    registeredAddress: dossier.step2.registeredAddress || '',
  });

  const [prefs, setPrefs] = useState<VendorSettingsPrefs>(() => ({
    ...DEFAULT_PREFS,
    rfqEscalationEmail:
      dossier.step5.departmentContacts?.[0]?.email ||
      dossier.step1.email ||
      '',
  }));

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  // Sessions & Confirm Pause Modal
  const [sessions, setSessions] = useState<ActiveSessionItem[]>(INITIAL_SESSIONS);
  const [pauseModalOpen, setPauseModalOpen] = useState(false);

  // Load persisted preferences from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<VendorSettingsPrefs>;
        setPrefs((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignore storage read errors
    }
  }, []);

  // Keep contact form synced if dossier changes externally (e.g., onboarding wizard)
  useEffect(() => {
    setContactForm({
      authorizedName: dossier.step1.authorizedName || user?.name || '',
      designation: dossier.step1.designation || user?.designation || '',
      email: dossier.step1.email || user?.email || '',
      mobile: dossier.step1.mobile || user?.mobile || '',
      registeredAddress: dossier.step2.registeredAddress || '',
    });
  }, [dossier.step1, dossier.step2.registeredAddress, user]);

  function persistPrefs(nextPrefs: VendorSettingsPrefs) {
    setPrefs(nextPrefs);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(nextPrefs));
    } catch {
      // Ignore storage quota errors
    }
  }

  // Compute live password strength
  const passwordStrength = useMemo(() => {
    const pw = passwordForm.newPassword;
    if (!pw) return { score: 0, label: '', color: 'bg-slate-200' };
    let pts = 0;
    if (pw.length >= 8) pts++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) pts++;
    if (/\d/.test(pw)) pts++;
    if (/[^A-Za-z0-9]/.test(pw)) pts++;

    if (pts <= 1) return { score: 25, label: 'Weak', color: 'bg-rose-500' };
    if (pts === 2) return { score: 50, label: 'Moderate', color: 'bg-amber-500' };
    if (pts === 3) return { score: 75, label: 'Good', color: 'bg-primary-500' };
    return { score: 100, label: 'Strong Audit-Grade', color: 'bg-emerald-500' };
  }, [passwordForm.newPassword]);

  function handleSaveContactDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!contactForm.authorizedName.trim() || !contactForm.email.includes('@')) {
      toast.error('Invalid Contact Details', {
        description: 'Please enter a valid authorized signatory name and corporate email.',
      });
      return;
    }

    const updatedContacts = [...(dossier.step5.departmentContacts || [])];
    if (updatedContacts[0] && prefs.rfqEscalationEmail) {
      updatedContacts[0] = { ...updatedContacts[0], email: prefs.rfqEscalationEmail };
    }

    const updatedDossier: FullVendorRegistrationDossier = {
      ...dossier,
      step1: {
        ...dossier.step1,
        authorizedName: contactForm.authorizedName.trim(),
        designation: contactForm.designation.trim(),
        email: contactForm.email.trim(),
        mobile: contactForm.mobile.trim(),
      },
      step2: {
        ...dossier.step2,
        registeredAddress: contactForm.registeredAddress.trim(),
      },
      step5: {
        ...dossier.step5,
        departmentContacts: updatedContacts,
      },
      lastUpdated: new Date().toISOString(),
    };

    onUpdateDossier(updatedDossier);
    persistPrefs(prefs);
    toast.success('Authorized Contact & Signatory Saved', {
      description: 'Synced across your Vendor Dossier, OTP alerts, and RFI routing.',
    });
  }

  function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Password Required', {
        description: 'Please provide both your current password and a new password.',
      });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Weak Password', {
        description: 'New password must be at least 8 characters long.',
      });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords Do Not Match', {
        description: 'Please ensure confirmation matches your new password.',
      });
      return;
    }

    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    toast.success('Security Credentials Updated', {
      description: 'Password rotated cleanly. Dual-OTP verification remains enforced.',
    });
  }

  function handleSavePreferences() {
    persistPrefs(prefs);
    toast.success('Notification & Privacy Preferences Saved', {
      description: 'Your alert channels and buyer visibility consent settings are active.',
    });
  }

  function handleResetPreferences() {
    persistPrefs(DEFAULT_PREFS);
    toast.info('Preferences Restored to Recommended Defaults');
  }

  function handleRevokeSession(sessionId: string) {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    toast.success('Session Revoked', {
      description: 'The selected device session has been signed out.',
    });
  }

  function handleRevokeAllOtherSessions() {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    toast.success('All Other Devices Signed Out', {
      description: 'Only your current browser session remains active.',
    });
  }

  function handleExportDossierJson() {
    const payload = {
      exportedAt: new Date().toISOString(),
      vendorId: dossier.step6.vendorId || 'BITA-VND-DEMO',
      accountSettings: prefs,
      dossier,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BITAINTEL_Vendor_Dossier_${dossier.step6.vendorId || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Vendor Dossier Exported (.json)', {
      description: 'Downloaded full structured company dossier and privacy settings.',
    });
  }

  function handleToggleDirectoryPause() {
    const nextVisible = !prefs.publicDirectoryVisible;
    persistPrefs({ ...prefs, publicDirectoryVisible: nextVisible });
    setPauseModalOpen(false);
    if (nextVisible) {
      toast.success('Directory Listing Reactivated', {
        description: 'Your verified enterprise profile is discoverable in the BITAINTEL Directory.',
      });
    } else {
      toast.warning('Directory Listing Paused', {
        description: 'Your public profile is temporarily hidden from buyer search results.',
      });
    }
  }

  const isPremium = role === 'premium_subscriber';
  const turnoverBandLabel = dossier.step3.annualTurnoverRange || '₹50–100 crore';

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* 1. Top Account, Plan & Verification Summary Card */}
      <Card variant="bento" className="p-5 sm:p-6 bg-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <BusinessAvatar
              logoUrl={dossier.step2.logoUrl}
              businessName={dossier.step2.tradeName || dossier.step2.legalName}
              fallbackInitials={user?.avatarInitials}
              className="size-14 sm:size-16 rounded-2xl"
              textClassName="text-lg"
            />
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 truncate">
                  {dossier.step2.tradeName || dossier.step2.legalName || user?.businessName}
                </h2>
                <Badge kind="verified" className="text-[11px] py-0.5">
                  {dossier.step6.status || 'Verified'}
                </Badge>
                {isPremium ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                    <Sparkles className="size-3 text-amber-600" />
                    Premium Plan
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                    Standard Plan
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Legal Entity: <strong className="text-slate-700">{dossier.step2.legalName}</strong>
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-slate-500 pt-0.5">
                <span>Vendor ID: <strong className="text-slate-800">{dossier.step6.vendorId || 'BITA-VND-2026-8942'}</strong></span>
                <span>GSTIN: <strong className="text-slate-800">{dossier.step2.gstin || user?.gstin}</strong></span>
                <span>Directory: <strong className={prefs.publicDirectoryVisible ? 'text-emerald-700' : 'text-amber-700'}>{prefs.publicDirectoryVisible ? 'Listed' : 'Paused'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onNavigateTab('profile')}
              icon={<Building2 className="size-3.5 text-primary-600" />}
            >
              Edit Company &amp; Logo
            </Button>
            <Link
              href="/demo/business/meridian-steel-works"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span>Public Dossier</span>
              <ExternalLink className="size-3.5 text-slate-400" />
            </Link>
            {!isPremium && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onUpgradeToPremium}
                icon={<Sparkles className="size-3.5" />}
              >
                Upgrade to Premium
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 2. Signatory Identity & Security Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Card A: Authorized Signatory, OTP Contacts & Routing */}
        <Card variant="bento" className="p-6 bg-white space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Users className="size-4 text-primary-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Authorized Signatory &amp; Contact Routing
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Primary focal point synced with Step 1 KYC, Dual-OTP alerts, and buyer RFIs.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 shrink-0">
              <MailCheck className="size-3" />
              Dual-OTP Linked
            </span>
          </div>

          <form onSubmit={handleSaveContactDetails} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Authorized Person Name
                </label>
                <input
                  type="text"
                  value={contactForm.authorizedName}
                  onChange={(e) => setContactForm({ ...contactForm, authorizedName: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Corporate Designation
                </label>
                <input
                  type="text"
                  value={contactForm.designation}
                  onChange={(e) => setContactForm({ ...contactForm, designation: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Official Email (UID)</label>
                  {dossier.step1.emailVerified && (
                    <span className="text-[10px] font-bold text-emerald-700">✓ Verified</span>
                  )}
                </div>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Primary Mobile (OTP)</label>
                  {dossier.step1.mobileVerified && (
                    <span className="text-[10px] font-bold text-emerald-700">✓ OTP Active</span>
                  )}
                </div>
                <input
                  type="text"
                  value={contactForm.mobile}
                  onChange={(e) => setContactForm({ ...contactForm, mobile: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Buyer RFI Escalation Email
                </label>
                <input
                  type="email"
                  value={prefs.rfqEscalationEmail}
                  onChange={(e) => setPrefs({ ...prefs, rfqEscalationEmail: e.target.value })}
                  placeholder="sales@company.com"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Corporate Landline / Desk
                </label>
                <input
                  type="text"
                  value={prefs.alternatePhone}
                  onChange={(e) => setPrefs({ ...prefs, alternatePhone: e.target.value })}
                  placeholder="+91 20 0000 0000"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Registered Factory / Office Premises
              </label>
              <textarea
                rows={2}
                value={contactForm.registeredAddress}
                onChange={(e) => setContactForm({ ...contactForm, registeredAddress: e.target.value })}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                required
              />
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onNavigateTab('profile')}
                className="text-xs font-semibold text-primary-700 hover:underline"
              >
                Manage plants &amp; executives →
              </button>
              <Button type="submit" variant="primary" size="sm">
                Save Contact Details
              </Button>
            </div>
          </form>
        </Card>

        {/* Card B: Security, Password, 2FA & Active Sessions */}
        <Card variant="bento" className="p-6 bg-white space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="size-4 text-primary-600" />
              <h3 className="text-base font-bold text-slate-900">
                Security, Credentials &amp; 2FA (SRS §5.11)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Rotate passwords, enforce dual-OTP protection, and monitor active portal sessions.
            </p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full text-xs pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((s) => ({ ...s, current: !s.current }))}
                  aria-label="Toggle current password visibility"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPasswords.current ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.next ? 'text' : 'password'}
                    placeholder="Minimum 8 characters"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full text-xs pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((s) => ({ ...s, next: !s.next }))}
                    aria-label="Toggle new password visibility"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.next ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full text-xs pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((s) => ({ ...s, confirm: !s.confirm }))}
                    aria-label="Toggle confirm password visibility"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            </div>

            {passwordForm.newPassword && (
              <div className="space-y-1">
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-300', passwordStrength.color)}
                    style={{ width: `${passwordStrength.score}%` }}
                  />
                </div>
                <p className="text-[11px] font-semibold text-slate-500">
                  Strength: <span className="text-slate-800">{passwordStrength.label}</span>
                </p>
              </div>
            )}

            <div className="pt-1 flex justify-end">
              <Button type="submit" variant="secondary" size="sm" icon={<KeyRound className="size-3.5" />}>
                Update Password
              </Button>
            </div>
          </form>

          {/* 2FA Toggle Box */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5">
            <Checkbox
              checked={prefs.twoFactorRequired}
              onChange={(e) => {
                const next = { ...prefs, twoFactorRequired: e.target.checked };
                persistPrefs(next);
                toast.info(
                  e.target.checked
                    ? 'Dual-OTP 2FA Enabled for Sign-In & Sensitive Edits'
                    : 'Dual-OTP 2FA Prompt Relaxed for Trusted Browser'
                );
              }}
              label="Require Dual-OTP (Email + SMS) for Bank & Vault Changes"
              description="Recommended enterprise safeguard preventing unauthorized banking or document modifications."
            />
          </div>

          {/* Active Sessions List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                Active Portal Sessions ({sessions.length})
              </span>
              {sessions.length > 1 && (
                <button
                  type="button"
                  onClick={handleRevokeAllOtherSessions}
                  className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                >
                  <LogOut className="size-3" />
                  Sign out other devices
                </button>
              )}
            </div>

            <div className="space-y-2">
              {sessions.map((ses) => (
                <div
                  key={ses.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
                      {ses.isCurrent ? <Monitor className="size-4 text-primary-600" /> : <Smartphone className="size-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 truncate">{ses.device}</span>
                        {ses.isCurrent && (
                          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-1.5 py-0.25 text-[10px] font-bold text-emerald-700">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">
                        {ses.location} · IP {ses.ip} · {ses.lastActive}
                      </p>
                    </div>
                  </div>
                  {!ses.isCurrent && (
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(ses.id)}
                      className="text-[11px] font-bold text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors shrink-0"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Notification & Dossier Privacy / Consent Preferences */}
      <Card variant="bento" className="p-6 bg-white space-y-5">
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-primary-600" />
              <h3 className="text-base font-bold text-slate-900">
                Notification Channels &amp; Public Dossier Privacy Controls
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Control alert delivery across email/SMS and set buyer consent rules for your published dossier (SRS §5.3 &amp; §5.11).
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetPreferences}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 self-start sm:self-auto"
          >
            <RotateCcw className="size-3.5" />
            Reset Defaults
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Multi-Channel Alerts */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Multi-Channel Alerts
            </h4>

            <Checkbox
              checked={prefs.emailAlertsEnquiry}
              onChange={(e) => setPrefs({ ...prefs, emailAlertsEnquiry: e.target.checked })}
              label="Instant Buyer RFI & Enquiry Alerts"
              description="Notify primary signatory and sales desk immediately when a verified buyer initiates an enquiry."
            />

            <Checkbox
              checked={prefs.emailAlertsVerification}
              onChange={(e) => setPrefs({ ...prefs, emailAlertsVerification: e.target.checked })}
              label="Auditor Review & Trust Score Changes"
              description="Email confirmation when uploaded statutory documents are approved, rejected, or rescored."
            />

            <Checkbox
              checked={prefs.expiryAlerts90Days}
              onChange={(e) => setPrefs({ ...prefs, expiryAlerts90Days: e.target.checked })}
              label="90-Day Certificate & License Expiry Reminders"
              description="Early warning alerts before ISO, SPCB, or bank solvency documents approach renewal."
            />

            <Checkbox
              checked={prefs.smsAlertsOtp}
              onChange={(e) => setPrefs({ ...prefs, smsAlertsOtp: e.target.checked })}
              label="SMS Security & OTP Login Notifications"
              description="Dispatch critical security alerts to your verified corporate mobile number."
            />

            <Checkbox
              checked={prefs.digestWeekly}
              onChange={(e) => setPrefs({ ...prefs, digestWeekly: e.target.checked })}
              label="Weekly Procurement Visibility & Feed Digest"
              description="Weekly summary of directory profile views, comparison hits, and BITAINTEL regulatory news."
            />
          </div>

          {/* Public Dossier Visibility & Consent Controls */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Directory Visibility &amp; Consent Rules (SRS §5.3)
            </h4>

            <Checkbox
              checked={prefs.publicDirectoryVisible}
              onChange={(e) => setPrefs({ ...prefs, publicDirectoryVisible: e.target.checked })}
              label="Publish in BITAINTEL Verified Directory"
              description="Allow corporate buyers and procurement officers to discover and inspect your public dossier."
            />

            <Checkbox
              checked={prefs.showFinancialBand}
              onChange={(e) => setPrefs({ ...prefs, showFinancialBand: e.target.checked })}
              label={`Display Audited Turnover Band (${turnoverBandLabel})`}
              description="Show verified revenue bracket without exposing confidential bank statements or balance sheets."
            />

            <Checkbox
              checked={prefs.maskExecutiveContactsForVisitors}
              onChange={(e) =>
                setPrefs({ ...prefs, maskExecutiveContactsForVisitors: e.target.checked })
              }
              label="Mask Direct Executive Emails for Unregistered Visitors"
              description="Protect leadership contact details until buyers sign in as approved B2B organizations."
            />

            <Checkbox
              checked={prefs.allowTechnicalSheetDownloads}
              onChange={(e) => setPrefs({ ...prefs, allowTechnicalSheetDownloads: e.target.checked })}
              label="Allow Approved Buyers to Download Product TDS &amp; COA"
              description="Permit approved corporate buyers to download attached product specification and analysis sheets."
            />

            <Checkbox
              checked={prefs.requireFinancialConsentToken}
              onChange={(e) =>
                setPrefs({ ...prefs, requireFinancialConsentToken: e.target.checked })
              }
              label="Require Explicit Consent Token for Financial Vault Access"
              description="Log and require mutual approval before sharing vaulted solvency letters or tax returns."
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button type="button" variant="primary" size="sm" onClick={handleSavePreferences}>
            Save Notification &amp; Privacy Preferences
          </Button>
        </div>
      </Card>

      {/* 4. Data Export & Directory Lifecycle Controls */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="bento" className="p-6 bg-white flex flex-col justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Data Portability &amp; Compliance Export
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Download a machine-readable JSON snapshot of your registered company profile, facilities, product catalog, certifications, and consent preferences.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleExportDossierJson}
              icon={<Download className="size-3.5 text-primary-600" />}
            >
              Export Full Dossier (.json)
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onNavigateTab('documents')}
            >
              Open Document Vault →
            </Button>
          </div>
        </Card>

        <Card
          variant="bento"
          className={cn(
            'p-6 flex flex-col justify-between gap-4 border',
            prefs.publicDirectoryVisible
              ? 'bg-rose-50/40 border-rose-200/80'
              : 'bg-amber-50/50 border-amber-200/80'
          )}
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <AlertTriangle
                className={cn(
                  'size-4',
                  prefs.publicDirectoryVisible ? 'text-rose-600' : 'text-amber-600'
                )}
              />
              <h3 className="text-sm font-bold text-slate-900">
                Directory Visibility Hold / Unlisting
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {prefs.publicDirectoryVisible
                ? 'Temporarily pause your public BITAINTEL directory visibility during internal restructuring without losing your verification audit history.'
                : 'Your public directory listing is currently paused. Compliance audit records remain preserved and can be relisted anytime.'}
            </p>
          </div>
          <div className="flex justify-start pt-2">
            <Button
              type="button"
              variant={prefs.publicDirectoryVisible ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => setPauseModalOpen(true)}
              className={
                prefs.publicDirectoryVisible
                  ? 'border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300'
                  : ''
              }
            >
              {prefs.publicDirectoryVisible ? 'Pause Directory Listing' : 'Reactivate Directory Listing'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Directory Pause Confirmation Dialog */}
      <Dialog
        open={pauseModalOpen}
        onClose={() => setPauseModalOpen(false)}
        title={
          prefs.publicDirectoryVisible
            ? 'Pause Public Directory Listing?'
            : 'Reactivate Public Directory Listing?'
        }
        description="Control discoverability without affecting your underlying statutory audit records."
        size="sm"
      >
        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <p>
            {prefs.publicDirectoryVisible
              ? 'Pausing hides your business card and public dossier from buyer directory search results until you reactivate it. Ongoing buyer enquiries remain accessible inside your dashboard.'
              : 'Reactivating makes your verified business card, Trust Score, and permitted catalog products discoverable again in the BITAINTEL Directory.'}
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setPauseModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={prefs.publicDirectoryVisible ? 'dark' : 'primary'}
              size="sm"
              onClick={handleToggleDirectoryPause}
              icon={<CheckCircle2 className="size-3.5" />}
            >
              {prefs.publicDirectoryVisible ? 'Confirm Pause' : 'Reactivate Now'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

