'use client';

import React, { useState } from 'react';
import {
  FullVendorRegistrationDossier,
  VendorRegistrationStatus,
} from '@/types/vendorRegistration';
import {
  DEMO_PREFILLED_DOSSIER,
  saveVendorDossierToStorage,
} from '@/config/initialVendorDossier';
import { Step2Company } from '@/components/shared/registration/Step2Company';
import { Step3Business } from '@/components/shared/registration/Step3Business';
import { Step4Products } from '@/components/shared/registration/Step4Products';
import { Step5Commercial } from '@/components/shared/registration/Step5Commercial';
import { Step6Review } from '@/components/shared/registration/Step6Review';
import { Button } from '@/components/ui/Button';
import {
  X,
  Building2,
  Layers,
  Package,
  DollarSign,
  FileCheck2,
  CheckCircle2,
  Sparkles,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: number;
  dossier: FullVendorRegistrationDossier;
  onDossierChange: (updated: FullVendorRegistrationDossier) => void;
}

export function OnboardingWizardModal({
  isOpen,
  onClose,
  initialStep = 2,
  dossier,
  onDossierChange,
}: OnboardingWizardModalProps) {
  const { updateRegistrationProgress } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(initialStep || 2);

  if (!isOpen) return null;

  // Compute completion score
  function computeCompletion(data: FullVendorRegistrationDossier): number {
    let score = 25; // Step 1 is already completed
    if (data.step2.legalName && data.step2.gstin && data.step2.pan) score += 20;
    if (data.step3.businessTypeCodes.length && data.step3.selectedCategoryIds.length) score += 20;
    if (data.step4.products.length && data.step4.certifications.length) score += 20;
    if (data.step5.accountNumber && data.step5.bankName) score += 10;
    if (data.step6.accuracyConfirmed) score += 5;
    return Math.min(score, 100);
  }

  // Update dossier state
  function updateDossier(updater: (prev: FullVendorRegistrationDossier) => FullVendorRegistrationDossier) {
    const updated = updater(dossier);
    const score = computeCompletion(updated);
    const completeWithPercentage = {
      ...updated,
      completionPercentage: score,
      lastUpdated: new Date().toISOString(),
    };
    saveVendorDossierToStorage(completeWithPercentage);
    onDossierChange(completeWithPercentage);
    updateRegistrationProgress(score, currentStep);
  }

  function handleFillDemo() {
    onDossierChange(DEMO_PREFILLED_DOSSIER);
    saveVendorDossierToStorage(DEMO_PREFILLED_DOSSIER);
    updateRegistrationProgress(100, 6, 'pending_approval');
    toast.success('Enterprise Details Pre-Filled', {
      description: 'Loaded comprehensive audited profile for Meridian Steel Works Ltd.',
    });
  }

  function handleSaveDraft() {
    saveVendorDossierToStorage(dossier);
    toast.success('Registration Progress Saved', {
      description: `Saved ${dossier.completionPercentage}% of your dossier. You can resume anytime.`,
    });
  }

  function handleSubmitVerification() {
    const vendorId = `BITA-VND-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const referenceNumber = `REF-${(dossier.step2.state || 'MH').slice(0, 2).toUpperCase()}-${Date.now().toString().slice(-6)}`;

    const submittedDossier: FullVendorRegistrationDossier = {
      ...dossier,
      step6: {
        ...dossier.step6,
        status: 'Verification Pending',
        vendorId,
        referenceNumber,
        submissionDate: new Date().toISOString(),
        accuracyConfirmed: true,
        verificationAuthorized: true,
        declarationsAccepted: true,
        adminRemarks: 'Application submitted and queued for GSTN & MCA cross-checks.',
      },
      completionPercentage: 100,
      lastUpdated: new Date().toISOString(),
    };

    onDossierChange(submittedDossier);
    saveVendorDossierToStorage(submittedDossier);
    updateRegistrationProgress(100, 6, 'pending_approval');

    toast.success('Registration Transmitted for Statutory Review!', {
      description: `Vendor Reference Number: ${referenceNumber}. Your profile is now under verification review.`,
    });

    onClose();
  }

  const steps = [
    { num: 2, label: 'Company Profile & GST', icon: Building2 },
    { num: 3, label: 'Classification & Scope', icon: Layers },
    { num: 4, label: 'Products & ISO Standards', icon: Package },
    { num: 5, label: 'Commercial & Banking', icon: DollarSign },
    { num: 6, label: 'Review & Submit', icon: FileCheck2 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-white rounded-3xl border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary-600 text-white grid place-items-center shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Complete Vendor Registration Dossier
                </h3>
                <span className="text-xs font-mono font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                  {dossier.completionPercentage}% Done
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Fill at your own pace. All changes are saved automatically.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFillDemo}
              className="text-xs border-primary-300 text-primary-700 hover:bg-primary-50 h-8 font-bold"
            >
              <Sparkles className="size-3.5 mr-1 text-primary-600" />
              <span className="hidden sm:inline">Fill Sample Data</span>
              <span className="sm:hidden">Sample</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              className="text-xs border-slate-200 text-slate-700 hover:bg-slate-100 h-8"
            >
              <Save className="size-3.5 mr-1" />
              Save
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="size-8 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200 grid place-items-center"
              aria-label="Close modal"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Stepper Tabs */}
        <div className="px-4 py-2 border-b border-slate-100 bg-white grid grid-cols-5 gap-1.5 shrink-0 overflow-x-auto">
          {steps.map((s) => {
            const Icon = s.icon;
            const isCurrent = currentStep === s.num;
            const isCompleted = currentStep > s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setCurrentStep(s.num)}
                className={`flex items-center gap-2 p-2 rounded-xl text-xs transition-all ${
                  isCurrent
                    ? 'bg-primary-50 text-primary-900 font-extrabold border border-primary-300 shadow-2xs'
                    : isCompleted
                    ? 'text-emerald-700 font-bold hover:bg-slate-50'
                    : 'text-slate-500 hover:bg-slate-50 font-medium'
                }`}
              >
                <div
                  className={`size-6 rounded-lg grid place-items-center text-xs shrink-0 ${
                    isCurrent
                      ? 'bg-primary-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="size-3.5" /> : <span>0{s.num}</span>}
                </div>
                <span className="truncate hidden sm:inline">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Step Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-7 bg-white">
          {currentStep === 2 && (
            <Step2Company
              data={dossier.step2}
              onChange={(updated) =>
                updateDossier((prev) => ({
                  ...prev,
                  step2: { ...prev.step2, ...updated },
                }))
              }
              onNext={() => {
                // If GSTIN entered, advance role to pending_approval
                if (dossier.step2.gstin) {
                  updateRegistrationProgress(50, 2, 'pending_approval');
                }
                setCurrentStep(3);
              }}
              onPrev={onClose}
            />
          )}

          {currentStep === 3 && (
            <Step3Business
              data={dossier.step3}
              onChange={(updated) =>
                updateDossier((prev) => ({
                  ...prev,
                  step3: { ...prev.step3, ...updated },
                }))
              }
              onNext={() => setCurrentStep(4)}
              onPrev={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && (
            <Step4Products
              data={dossier.step4}
              selectedCategoryIds={dossier.step3.selectedCategoryIds}
              onChange={(updated) =>
                updateDossier((prev) => ({
                  ...prev,
                  step4: { ...prev.step4, ...updated },
                }))
              }
              onNext={() => setCurrentStep(5)}
              onPrev={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 5 && (
            <Step5Commercial
              data={dossier.step5}
              onChange={(updated) =>
                updateDossier((prev) => ({
                  ...prev,
                  step5: { ...prev.step5, ...updated },
                }))
              }
              onNext={() => setCurrentStep(6)}
              onPrev={() => setCurrentStep(4)}
            />
          )}

          {currentStep === 6 && (
            <Step6Review
              dossier={dossier}
              onChangeStep={(stepNum) => setCurrentStep(stepNum)}
              onSaveDraft={handleSaveDraft}
              onSubmitVerification={handleSubmitVerification}
              onPrev={() => setCurrentStep(5)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
