'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { FullVendorRegistrationDossier } from '@/types/vendorRegistration';
import {
  isStep1Done,
  isStep2Done,
  isStep3Done,
  isStep4Done,
  isStep5Done,
  isStep6Done,
  calculateDossierCompletion,
} from '@/config/initialVendorDossier';
import { Button } from '@/components/ui/Button';
import {
  CheckCircle2,
  Sparkles,
  Building2,
  Layers,
  Package,
  DollarSign,
  FileCheck2,
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
  // onSimulateApprove (unused simulation prop - kept for interface compatibility)
  // onSimulatePremium (unused simulation prop)
}: OnboardingBannerProps) {
  const { user, role, updateRegistrationProgress } = useAuth();

  // If not unverified, the status is managed exclusively by VendorStatusBanner to eliminate duplicate banners
  if (role !== 'unverified') {
    return null;
  }

  // Prerequisite check for each step using canonical validation
  const isStep1 = isStep1Done(dossier);
  const isStep2 = isStep2Done(dossier);
  const isStep3 = isStep3Done(dossier);
  const isStep4 = isStep4Done(dossier);
  const isStep5 = isStep5Done(dossier);
  const isStep6 = isStep6Done(dossier);

  // Unverified User (Just completed Step 1)
  const stepsChecklist = [
    {
      num: 1,
      title: 'Authorized Account & Dual OTP',
      desc: 'Signed up with corporate credentials',
      done: isStep1,
      icon: CheckCircle2,
    },
    {
      num: 2,
      title: 'Company Profile & GSTIN Identification',
      desc: 'Legal constitution, GSTIN, PAN, and plant addresses',
      done: isStep2,
      icon: Building2,
    },
    {
      num: 3,
      title: 'Business Classification & Scale',
      desc: 'Select categories from 240 subcategories & factory capacity',
      done: isStep3,
      icon: Layers,
    },
    {
      num: 4,
      title: 'Products, Services & ISO Standards',
      desc: 'Catalog specifications, MOQ, lead times & quality certs',
      done: isStep4,
      icon: Package,
    },
    {
      num: 5,
      title: 'Commercial, Trade & Settlement',
      desc: 'Incoterms, payment terms & masked banking details',
      done: isStep5,
      icon: DollarSign,
    },
    {
      num: 6,
      title: 'Review & Submit for Verification',
      desc: isStep6
        ? 'Dossier complete & ready for verification'
        : 'Statutory declarations & transmittal to audit desk',
      done: isStep6,
      icon: isStep6 ? CheckCircle2 : FileCheck2,
    },
  ];

  const currentPercent = calculateDossierCompletion(dossier);
  const completedStepsCount = stepsChecklist.filter((s) => s.done).length;

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
                {completedStepsCount === 6
                  ? 'All 6 Steps Complete (100% Ready for Verification)'
                  : `${completedStepsCount} of 6 Steps Complete (${currentPercent}% Overall Progress)`}
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
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => onOpenWizard(step.num === 1 ? 2 : step.num)}
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
