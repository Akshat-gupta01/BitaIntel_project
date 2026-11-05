'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FullVendorRegistrationDossier,
  VendorRegistrationStatus,
} from '@/types/vendorRegistration';
import {
  INITIAL_EMPTY_DOSSIER,
  DEMO_PREFILLED_DOSSIER,
  getStoredVendorDossier,
  saveVendorDossierToStorage,
} from '@/config/initialVendorDossier';
import { Step1Account } from './registration/Step1Account';
import { Step2Company } from './registration/Step2Company';
import { Step3Business } from './registration/Step3Business';
import { Step4Products } from './registration/Step4Products';
import { Step5Commercial } from './registration/Step5Commercial';
import { Step6Review } from './registration/Step6Review';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  UserCheck,
  Building2,
  Layers,
  Package,
  DollarSign,
  FileCheck2,
  CheckCircle2,
  Sparkles,
  Save,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

export function RegistrationWizard() {
  const router = useRouter();

  // Active step (1 to 6)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [dossier, setDossier] = useState<FullVendorRegistrationDossier>(INITIAL_EMPTY_DOSSIER);
  const [isMounted, setIsMounted] = useState(false);

  // Load saved draft on mount
  useEffect(() => {
    setIsMounted(true);
    const saved = getStoredVendorDossier();
    if (saved) {
      setDossier(saved);
      // If already submitted, open on Step 6
      if (saved.step6.status !== 'Draft') {
        setCurrentStep(6);
      }
    }
  }, []);

  // Compute completion percentage
  function computeCompletion(data: FullVendorRegistrationDossier): number {
    let score = 0;
    if (data.step1.emailVerified && data.step1.mobileVerified) score += 15;
    if (data.step2.legalName && data.step2.gstin && data.step2.pan) score += 20;
    if (data.step3.businessTypeCodes.length && data.step3.selectedCategoryIds.length) score += 20;
    if (data.step4.products.length && data.step4.certifications.length) score += 20;
    if (data.step5.accountNumber && data.step5.bankName) score += 15;
    if (data.step6.accuracyConfirmed) score += 10;
    return Math.min(score, 100);
  }

  // Update dossier state & persist
  function updateDossier(updater: (prev: FullVendorRegistrationDossier) => FullVendorRegistrationDossier) {
    setDossier((prev) => {
      const updated = updater(prev);
      const completion = computeCompletion(updated);
      const completeWithPercentage = {
        ...updated,
        completionPercentage: completion,
        lastUpdated: new Date().toISOString(),
      };
      saveVendorDossierToStorage(completeWithPercentage);
      return completeWithPercentage;
    });
  }

  // Step 1 update
  function handleStep1Change(updated: Partial<typeof dossier.step1>) {
    updateDossier((prev) => ({
      ...prev,
      step1: { ...prev.step1, ...updated },
    }));
  }

  // Step 2 update
  function handleStep2Change(updated: Partial<typeof dossier.step2>) {
    updateDossier((prev) => ({
      ...prev,
      step2: { ...prev.step2, ...updated },
    }));
  }

  // Step 3 update
  function handleStep3Change(updated: Partial<typeof dossier.step3>) {
    updateDossier((prev) => ({
      ...prev,
      step3: { ...prev.step3, ...updated },
    }));
  }

  // Step 4 update
  function handleStep4Change(updated: Partial<typeof dossier.step4>) {
    updateDossier((prev) => ({
      ...prev,
      step4: { ...prev.step4, ...updated },
    }));
  }

  // Step 5 update
  function handleStep5Change(updated: Partial<typeof dossier.step5>) {
    updateDossier((prev) => ({
      ...prev,
      step5: { ...prev.step5, ...updated },
    }));
  }

  // Quick fill demo data
  function handleFillDemo() {
    setDossier(DEMO_PREFILLED_DOSSIER);
    saveVendorDossierToStorage(DEMO_PREFILLED_DOSSIER);
    toast.success('Demo Enterprise Data Populated', {
      description: 'Loaded comprehensive dossier for Meridian Steel Works Pvt. Ltd.',
    });
  }

  // Reset to empty draft
  function handleResetEmpty() {
    setDossier(INITIAL_EMPTY_DOSSIER);
    saveVendorDossierToStorage(INITIAL_EMPTY_DOSSIER);
    setCurrentStep(1);
    toast.info('Registration draft reset to blank state.');
  }

  // Save Draft action
  function handleSaveDraft() {
    saveVendorDossierToStorage(dossier);
    toast.success('Progress Saved as Draft', {
      description: `Saved ${dossier.completionPercentage}% completed application. You can resume anytime.`,
    });
  }

  // Final submit verification
  function handleSubmitVerification() {
    const vendorId = `BITA-VND-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const referenceNumber = `REF-${dossier.step2.state.slice(0, 2).toUpperCase() || 'IN'}-${Date.now().toString().slice(-6)}`;

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
        adminRemarks: 'Application received and assigned to Statutory Verification Desk.',
      },
      completionPercentage: 100,
      lastUpdated: new Date().toISOString(),
    };

    setDossier(submittedDossier);
    saveVendorDossierToStorage(submittedDossier);

    toast.success('Registration Successfully Submitted!', {
      description: `Your Vendor ID is ${vendorId}. Redirecting to your Vendor Dashboard...`,
    });

    setTimeout(() => {
      router.push('/demo/dashboard/vendor');
    }, 1200);
  }

  const stepsList = [
    { num: 1, label: 'Sign-in / Account', icon: UserCheck },
    { num: 2, label: 'Company Profile', icon: Building2 },
    { num: 3, label: 'Classification', icon: Layers },
    { num: 4, label: 'Products & Quality', icon: Package },
    { num: 5, label: 'Commercial & Trade', icon: DollarSign },
    { num: 6, label: 'Review & Submit', icon: FileCheck2 },
  ];

  if (!isMounted) return null;

  return (
    <Card className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 sm:p-8 shadow-xl backdrop-blur-xl">
      {/* Top Stepper Tracker */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Registration Progress
            </span>
            <span className="text-xs font-extrabold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
              {dossier.completionPercentage}% Complete
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFillDemo}
              className="text-xs border-primary-300 text-primary-700 hover:bg-primary-50 h-7"
            >
              <Sparkles className="size-3 mr-1 text-primary-600" />
              Demo Data
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              className="text-xs border-slate-200 text-slate-600 hover:bg-slate-50 h-7"
            >
              <Save className="size-3 mr-1" />
              Save Draft
            </Button>
          </div>
        </div>

        {/* Stepper Steps Row */}
        <div className="grid grid-cols-6 gap-2">
          {stepsList.map((s) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setCurrentStep(s.num)}
                className={`flex flex-col items-center text-center p-2 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-primary-50 text-primary-900 border border-primary-300 shadow-2xs font-bold'
                    : isCompleted
                    ? 'text-emerald-700 hover:bg-slate-50 font-semibold'
                    : 'text-slate-400 hover:bg-slate-50 font-medium'
                }`}
              >
                <div
                  className={`size-7 rounded-lg grid place-items-center mb-1 text-xs transition-all ${
                    isCurrent
                      ? 'bg-primary-600 text-white font-bold'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-800 font-bold'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="size-4" /> : <Icon className="size-3.5" />}
                </div>
                <span className="text-[10px] leading-tight hidden sm:block truncate w-full">
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Render Area */}
      <div>
        {currentStep === 1 && (
          <Step1Account
            data={dossier.step1}
            onChange={handleStep1Change}
            onNext={() => setCurrentStep(2)}
            onQuickFillDemo={handleFillDemo}
          />
        )}

        {currentStep === 2 && (
          <Step2Company
            data={dossier.step2}
            onChange={handleStep2Change}
            onNext={() => setCurrentStep(3)}
            onPrev={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <Step3Business
            data={dossier.step3}
            onChange={handleStep3Change}
            onNext={() => setCurrentStep(4)}
            onPrev={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <Step4Products
            data={dossier.step4}
            selectedCategoryIds={dossier.step3.selectedCategoryIds}
            onChange={handleStep4Change}
            onNext={() => setCurrentStep(5)}
            onPrev={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 5 && (
          <Step5Commercial
            data={dossier.step5}
            onChange={handleStep5Change}
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
    </Card>
  );
}
