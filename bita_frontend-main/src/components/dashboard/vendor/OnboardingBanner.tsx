'use client';

import React from 'react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { FullVendorRegistrationDossier } from '@/types/vendorRegistration';
import { Button } from '@/components/ui/Button';
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Building2,
  Layers,
  Package,
  DollarSign,
  FileCheck2,
  AlertCircle,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface OnboardingBannerProps {
  dossier: FullVendorRegistrationDossier;
  onOpenWizard: (step?: number) => void;
  onSimulateApprove?: () => void;
  onSimulatePremium?: () => void;
}

export function OnboardingBanner({
  dossier,
  onOpenWizard,
  onSimulateApprove,
  onSimulatePremium,
}: OnboardingBannerProps) {
  const { user, role, setRole, updateRegistrationProgress } = useAuth();

  // If user is already approved and not pending, we render a verified enterprise ribbon with quick upgrade option
  if (role === 'approved_business') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/90 via-white to-primary-50/50 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 grid place-items-center shrink-0">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                Tier: Approved B2B Business
              </span>
              <span className="text-xs font-mono font-bold text-slate-700">
                GSTIN: {user?.gstin || dossier.step2.gstin || '27AABCM8291Q1Z4'}
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">
              Profile Fully Verified & Empaneled on BITAINTEL Network
            </h3>
            <p className="text-xs text-slate-600">
              Detailed permitted company and product information is actively visible to corporate procurement teams.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenWizard(2)}
            className="text-xs bg-white text-slate-700 border-slate-300 hover:bg-slate-50 font-semibold"
          >
            Update Profile Data
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (onSimulatePremium) onSimulatePremium();
              else setRole('premium_subscriber');
            }}
            className="text-xs bg-primary-600 hover:bg-primary-700 text-white font-bold"
          >
            <Sparkles className="size-3.5 mr-1 text-primary-200" />
            Switch to Premium Subscriber
          </Button>
        </div>
      </div>
    );
  }

  if (role === 'premium_subscriber') {
    return (
      <div className="rounded-2xl border border-primary-300 bg-gradient-to-r from-primary-50/90 via-white to-amber-50/50 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary-600 text-white shadow-sm grid place-items-center shrink-0">
            <Award className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary-800 bg-primary-100/80 px-2 py-0.5 rounded-full">
                Tier: Premium B2B Subscriber
              </span>
              <span className="text-xs font-mono font-bold text-slate-700">
                Score: 96/100 · Elite Intelligence Tier
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">
              Advanced Analytics, Competitor Radar & Due Diligence Dossiers Unlocked
            </h3>
            <p className="text-xs text-slate-600">
              You have access to priority RFI placement, buyer demand forecasting, and unredacted market comparison reports.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setRole('approved_business')}
            className="text-xs bg-white text-slate-700 border-slate-300 hover:bg-slate-50 font-semibold"
          >
            Test as Approved Business
          </Button>
        </div>
      </div>
    );
  }

  // Pending Approval State (GST verified, awaiting audit desk)
  if (role === 'pending_approval') {
    return (
      <div className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-b from-indigo-50/90 via-white to-slate-50 p-5 sm:p-7 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-indigo-100">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-2xl bg-indigo-600 text-white grid place-items-center shrink-0 shadow-sm">
              <Clock className="size-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-300">
                  Tier: GST-Verified Business Awaiting Approval
                </span>
                <span className="text-xs font-mono font-bold text-slate-700">
                  Dossier Ref: {dossier.step6.referenceNumber || 'REF-MH-2026-942'}
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900">
                Statutory Verification Under Compliance Review
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Your GSTIN and company profile have been authenticated. Our statutory verification desk is reviewing your uploaded licenses and facility records. Turnaround: typically within 24 business hours.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenWizard(6)}
              className="text-xs bg-white text-slate-700 border-slate-300 hover:bg-slate-50 font-bold"
            >
              Review Submitted Dossier
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (onSimulateApprove) onSimulateApprove();
                else {
                  setRole('approved_business');
                  toast.success('Simulation: Business Approved by Compliance Desk!');
                }
              }}
              className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-xs"
            >
              <CheckCircle2 className="size-3.5 mr-1" />
              Simulate Desk Approval
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs">
          <div className="p-3 rounded-xl bg-white border border-indigo-100">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">GSTN Live Status</span>
            <span className="font-extrabold text-emerald-700 text-xs mt-0.5 block">✓ Verified Active (24 Months Filed)</span>
          </div>
          <div className="p-3 rounded-xl bg-white border border-indigo-100">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Desk Queue</span>
            <span className="font-bold text-slate-800 text-xs mt-0.5 block">Desk 4B — Lead Auditor Assigned</span>
          </div>
          <div className="p-3 rounded-xl bg-white border border-indigo-100">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Estimated Approval</span>
            <span className="font-bold text-indigo-700 text-xs mt-0.5 block">Today by 5:30 PM IST</span>
          </div>
        </div>
      </div>
    );
  }

  // Unverified User (Just completed Step 1)
  const stepsChecklist = [
    {
      num: 1,
      title: 'Authorized Account & Dual OTP',
      desc: 'Signed up with corporate credentials',
      done: true,
      icon: CheckCircle2,
    },
    {
      num: 2,
      title: 'Company Profile & GSTIN Identification',
      desc: 'Legal constitution, GSTIN, PAN, and plant addresses',
      done: !!dossier.step2.gstin && dossier.step2.gstin !== 'Pending GSTIN',
      icon: Building2,
    },
    {
      num: 3,
      title: 'Business Classification & Scale',
      desc: 'Select categories from 240 subcategories & factory capacity',
      done: dossier.step3.selectedCategoryIds.length > 0,
      icon: Layers,
    },
    {
      num: 4,
      title: 'Products, Services & ISO Standards',
      desc: 'Catalog specifications, MOQ, lead times & quality certs',
      done: dossier.step4.products.length > 0,
      icon: Package,
    },
    {
      num: 5,
      title: 'Commercial, Trade & Settlement',
      desc: 'Incoterms, payment terms & masked banking details',
      done: !!dossier.step5.accountNumber,
      icon: DollarSign,
    },
    {
      num: 6,
      title: 'Review & Submit for Verification',
      desc: 'Statutory declarations & transmittal to audit desk',
      done: dossier.step6.accuracyConfirmed,
      icon: FileCheck2,
    },
  ];

  const currentPercent = user?.registrationProgress || 25;

  return (
    <div className="rounded-3xl border-2 border-primary-300 bg-gradient-to-b from-primary-50/70 via-white to-slate-50 p-5 sm:p-7 shadow-lg relative overflow-hidden">
      {/* Decorative top accent */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-700" />

      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 pb-6 border-b border-primary-100">
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-2xl bg-primary-600 text-white grid place-items-center shrink-0 shadow-md">
            <Sparkles className="size-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-900 bg-primary-100 px-2.5 py-0.5 rounded-full border border-primary-200">
                Tier: Logged-in, Unverified User
              </span>
              <span className="text-xs font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Step 1 Complete ({currentPercent}% Overall Progress)
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              Welcome to your Vendor Dashboard, {user?.name || 'Signatory'}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Your basic account has been created. To activate your official <strong>BITAINTEL Trust Badge</strong>, unlock live buyer inquiries, and publish your corporate profile to buyers, please complete your remaining statutory steps.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <Button
            type="button"
            onClick={() => onOpenWizard(2)}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs py-2.5 px-4 shadow-sm flex items-center justify-center gap-2"
          >
            <span>Complete Profile Steps (Step 2 - 6)</span>
            <ArrowRight className="size-3.5" />
          </Button>

          {/* Quick simulation helper for effortless client evaluation */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              updateRegistrationProgress(85, 2, 'pending_approval');
              toast.success('Simulated Step 2 GST submission: Role moved to Pending Approval');
            }}
            className="text-xs bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 font-bold"
            title="Fast-forward to GST-Verified status for testing"
          >
            ⚡ Fast-Forward to Step 2 (GST)
          </Button>
        </div>
      </div>

      {/* Progress Bar & Interactive 6-Step Checklist */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-slate-700">Dossier Completion Tracker</span>
          <span className="font-extrabold font-mono text-primary-700">{currentPercent}% Completed</span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80 mb-5">
          <div
            className="h-full bg-gradient-to-r from-primary-600 to-primary-500 rounded-full transition-all duration-700"
            style={{ width: `${currentPercent}%` }}
          />
        </div>

        {/* 6 Step Cards */}
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {stepsChecklist.map((step) => {
            const Icon = step.icon;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => onOpenWizard(step.num)}
                className={cn(
                  'text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3',
                  step.done
                    ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50'
                    : step.num === 2
                    ? 'border-primary-400 bg-white ring-2 ring-primary-500/20 shadow-xs'
                    : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50'
                )}
              >
                <div
                  className={cn(
                    'size-8 rounded-xl grid place-items-center shrink-0 text-xs font-bold mt-0.5',
                    step.done
                      ? 'bg-emerald-100 text-emerald-800'
                      : step.num === 2
                      ? 'bg-primary-600 text-white animate-pulse'
                      : 'bg-slate-100 text-slate-500'
                  )}
                >
                  {step.done ? <CheckCircle2 className="size-4" /> : <span>0{step.num}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{step.title}</h4>
                    {step.done ? (
                      <span className="text-[10px] font-bold text-emerald-700">Done</span>
                    ) : step.num === 2 ? (
                      <span className="text-[10px] font-bold text-primary-700 bg-primary-100 px-1.5 py-0.2 rounded">
                        Next
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5 truncate">{step.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
