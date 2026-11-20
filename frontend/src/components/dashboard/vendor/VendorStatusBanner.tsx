'use client';

import React from 'react';
import {
  FullVendorRegistrationDossier,
  VendorRegistrationStatus,
} from '@/types/vendorRegistration';
import { Button } from '@/components/ui/Button';
import {
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  AlertCircle,
  FileCheck,
  RefreshCw,
  Printer,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface VendorStatusBannerProps {
  dossier: FullVendorRegistrationDossier;
  onOpenSummary: () => void;
  onNavigateTab: (tabId: string) => void;
  onSimulateStatusChange?: (newStatus: VendorRegistrationStatus) => void;
  onSimulateApprove?: () => void;
}

export function VendorStatusBanner({
  dossier,
  onOpenSummary,
  onNavigateTab,
  onSimulateStatusChange,
  onSimulateApprove,
}: VendorStatusBannerProps) {
  const status = dossier.step6.status || 'Verified';

  // Check for any certificates expiring soon
  const expiringCerts = dossier.step4.certifications.filter((c) => {
    if (c.status === 'Expiring Soon') return true;
    if (!c.expiryDate) return false;
    const diffDays = Math.ceil(
      (new Date(c.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
    );
    return diffDays > 0 && diffDays < 90;
  });

  const statusConfig: Record<
    VendorRegistrationStatus,
    {
      badgeBg: string;
      badgeText: string;
      borderColor: string;
      icon: React.ElementType;
      title: string;
      description: string;
    }
  > = {
    Verified: {
      badgeBg: 'bg-emerald-500/15 text-emerald-800 border-emerald-300',
      badgeText: 'Verified & Active On BITAINTEL Network',
      borderColor: 'border-emerald-200 bg-emerald-50/50',
      icon: CheckCircle2,
      title: 'Statutory Verification Complete & Audit Approved',
      description:
        'Your enterprise credentials, MCA filings, and physical plant inspections are fully validated. You are visible in verified buyer directory searches.',
    },
    'Verification Pending': {
      badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      badgeText: 'Tier: GST-Verified Business Awaiting Approval',
      borderColor: 'border-2 border-indigo-200 bg-gradient-to-b from-indigo-50/90 via-white to-slate-50',
      icon: Clock,
      title: 'Statutory Verification Under Compliance Review',
      description:
        'Your GSTIN and company profile have been authenticated. Our statutory verification desk is reviewing your uploaded licenses and facility records. Turnaround: typically within 24 business hours.',
    },
    Submitted: {
      badgeBg: 'bg-primary-500/15 text-primary-800 border-primary-300',
      badgeText: 'Submitted for Review',
      borderColor: 'border-primary-200 bg-primary-50/50',
      icon: Clock,
      title: 'Application Transmitted',
      description:
        'Dossier transmitted successfully. Lead verification officer will begin reviewing uploaded proofs within 24 hours.',
    },
    'Under Review': {
      badgeBg: 'bg-indigo-500/15 text-indigo-800 border-indigo-300',
      badgeText: 'Under Compliance Review',
      borderColor: 'border-indigo-200 bg-indigo-50/50',
      icon: RefreshCw,
      title: 'Active Compliance Officer Review',
      description:
        'An auditor is currently validating your plant certifications, laboratory test standards, and financial credentials.',
    },
    'Additional Information Required': {
      badgeBg: 'bg-rose-500/15 text-rose-800 border-rose-300',
      badgeText: 'Action Required: Clarification Needed',
      borderColor: 'border-rose-200 bg-rose-50/60',
      icon: AlertCircle,
      title: 'Clarification or Document Resubmission Requested',
      description:
        'The verification desk has requested revised or higher-resolution statutory evidence for empanelment.',
    },
    Draft: {
      badgeBg: 'bg-slate-500/15 text-slate-800 border-slate-300',
      badgeText: 'Draft Application (Incomplete)',
      borderColor: 'border-slate-200 bg-slate-50/70',
      icon: AlertTriangle,
      title: 'Registration Application Incomplete',
      description:
        'Complete the remaining steps of your vendor dossier to submit for official verification.',
    },
    Rejected: {
      badgeBg: 'bg-rose-500/20 text-rose-900 border-rose-400',
      badgeText: 'Verification Rejected',
      borderColor: 'border-rose-200 bg-rose-50',
      icon: AlertCircle,
      title: 'Application Verification Not Approved',
      description:
        'One or more statutory credentials could not be cross-validated. Please review auditor comments and submit an appeal.',
    },
    Suspended: {
      badgeBg: 'bg-slate-700 text-white border-slate-700',
      badgeText: 'Account Suspended',
      borderColor: 'border-slate-300 bg-slate-100',
      icon: AlertTriangle,
      title: 'Vendor Profile Temporarily Suspended',
      description:
        'Profile temporarily withheld due to overdue statutory compliance or licensing expiration.',
    },
    'Renewal Required': {
      badgeBg: 'bg-amber-600/15 text-amber-900 border-amber-400',
      badgeText: 'Annual Audit Renewal Required',
      borderColor: 'border-amber-200 bg-amber-50/70',
      icon: RefreshCw,
      title: 'Annual Statutory Empanelment Renewal Due',
      description:
        'Annual verification cycle due. Please confirm your updated financial turnover and active ISO credentials.',
    },
  };

  const currentConfig = statusConfig[status] || statusConfig.Verified;
  const StatusIcon = currentConfig.icon;

  return (
    <div className="space-y-3">
      {/* Main Unified Status Workflow Banner */}
      <div
        className={`rounded-3xl border-2 p-5 sm:p-6 shadow-md transition-all ${currentConfig.borderColor}`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-indigo-100/80">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-2xl bg-indigo-600 text-white grid place-items-center shrink-0 shadow-sm">
              <StatusIcon className="size-6 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${currentConfig.badgeBg}`}
                >
                  {currentConfig.badgeText}
                </span>
                {status === 'Verification Pending' && (
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-300">
                    Verification Pending
                  </span>
                )}
                <span className="text-xs font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                  ID: {dossier.step6.vendorId || 'BITA-VND-2026-8942'}
                </span>
                <span className="text-xs font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Ref: {dossier.step6.referenceNumber || 'REF-MH-2026-091'}
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900">{currentConfig.title}</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed max-w-3xl">
                {currentConfig.description}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenSummary}
              className="text-xs bg-white border-slate-300 text-slate-800 hover:bg-slate-50 font-bold shadow-2xs"
            >
              <Printer className="size-3.5 mr-1.5 text-primary-700" /> View Registration Dossier
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => onNavigateTab('documents')}
              className="text-xs bg-primary-700 hover:bg-primary-800 text-white font-bold shadow-2xs"
            >
              Evidence Vault <ChevronRight className="size-3.5 ml-1" />
            </Button>
            {onSimulateApprove && status !== 'Verified' && (
              <Button
                type="button"
                size="sm"
                onClick={onSimulateApprove}
                className="text-xs bg-indigo-700 hover:bg-indigo-800 text-white font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="size-3.5" />
                <span>Simulate Desk Approval</span>
              </Button>
            )}
          </div>
        </div>

        {/* 3 Live Compliance Stats Cards (Joined into unified banner) */}
        {(status === 'Verification Pending' || status === 'Under Review' || status === 'Submitted') && (
          <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white border border-indigo-100 shadow-2xs">
              <span className="text-slate-400 font-bold uppercase text-[10px] block">GSTN Live Status</span>
              <span className="font-extrabold text-emerald-700 text-xs mt-0.5 block">✓ Verified Active (24 Months Filed)</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-indigo-100 shadow-2xs">
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Desk Queue</span>
              <span className="font-bold text-slate-800 text-xs mt-0.5 block">Desk 4B — Lead Auditor Assigned</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-indigo-100 shadow-2xs">
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Estimated Approval</span>
              <span className="font-bold text-indigo-700 text-xs mt-0.5 block">Today by 5:30 PM IST</span>
            </div>
          </div>
        )}

        {/* Auditor Remarks / Notes if present */}
        {(dossier.step6.adminRemarks || status === 'Verification Pending') && (
          <div className="mt-3.5 pt-3 border-t border-slate-200/80 flex items-start gap-2 text-xs text-slate-700">
            <span className="font-bold text-slate-900 shrink-0">Desk Remarks:</span>
            <span>
              {dossier.step6.adminRemarks ||
                'Application submitted and queued for GSTN & MCA cross-checks.'}
            </span>
          </div>
        )}
      </div>

      {/* Expiry Reminders Bar */}
      {expiringCerts.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-3.5 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="size-4 text-amber-700 shrink-0" />
            <div>
              <strong className="font-bold block sm:inline mr-1">Certificate Expiry Warning:</strong>
              <span>
                {expiringCerts.map((c) => `${c.certificateType} (Exp: ${c.expiryDate})`).join(', ')}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('certifications')}
            className="text-xs font-bold text-amber-900 underline hover:text-amber-950 shrink-0 self-start sm:self-auto"
          >
            Upload Renewal Certificate →
          </button>
        </div>
      )}
    </div>
  );
}
