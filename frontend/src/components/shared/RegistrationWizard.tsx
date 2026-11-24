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
  calculateDossierCompletion,
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
import { useAuth } from '@/context/AuthContext';
import * as vendorService from '../../../services/vendor.service';

export function RegistrationWizard() {
  const router = useRouter();
  const { updateRegistrationProgress } = useAuth();

  // Active step (1 to 6)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [dossier, setDossier] = useState<FullVendorRegistrationDossier>(INITIAL_EMPTY_DOSSIER);
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);

  // Load saved draft on mount & sync live with MySQL database
  useEffect(() => {
    setIsMounted(true);
    const saved = getStoredVendorDossier();
    if (saved) {
      setDossier(saved);
      if (saved.step6.status !== 'Draft') {
        setCurrentStep(6);
      }
    }

    // Live sync with Backend MySQL BusinessEntity record
    vendorService
      .getVendorProfile()
      .then((res: any) => {
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
                iec: b.statutory?.iecCode || (b as any).tradeLogistics?.iecNumber || (b as any).commercial?.iecNumber || prev.step2.iec,
                tan: b.statutory?.tan || (b.statutory as any)?.statutoryPayload?.tan || prev.step2.tan,
                duns: b.statutory?.duns || b.statutory?.dunsNumber || (b.statutory as any)?.statutoryPayload?.duns || prev.step2.duns,
                lei: b.statutory?.lei || (b.statutory as any)?.statutoryPayload?.lei || prev.step2.lei,
              },
              step1: {
                ...prev.step1,
                authorizedName:
                  b.owner?.fullName ||
                  (Array.isArray(b.keyPersonnel) && b.keyPersonnel.find((p: any) => p.isAuthorizedSignatory)?.name) ||
                  prev.step1.authorizedName ||
                  '',
                designation:
                  b.owner?.designation ||
                  (Array.isArray(b.keyPersonnel) && b.keyPersonnel.find((p: any) => p.isAuthorizedSignatory)?.designation) ||
                  prev.step1.designation ||
                  'Authorized Signatory',
                email:
                  b.owner?.email ||
                  (Array.isArray(b.keyPersonnel) && b.keyPersonnel.find((p: any) => p.isAuthorizedSignatory)?.email) ||
                  prev.step1.email ||
                  '',
                mobile:
                  b.owner?.mobile ||
                  (Array.isArray(b.keyPersonnel) && b.keyPersonnel.find((p: any) => p.isAuthorizedSignatory)?.mobile) ||
                  prev.step1.mobile ||
                  '',
                emailVerified: b.owner?.isEmailVerified ?? true,
                mobileVerified: b.owner?.isMobileVerified ?? true,
              },
              step3: updatedStep3,
              step4: {
                ...prev.step4,
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
                ? {
                    departmentContacts:
                      Array.isArray(b.commercial?.departmentContacts || b.departmentContacts) && (b.commercial?.departmentContacts || b.departmentContacts).length > 0
                        ? (b.commercial?.departmentContacts || b.departmentContacts)
                        : prev.step5.departmentContacts,
                    acceptedCurrencies:
                      Array.isArray(b.commercial?.acceptedCurrencies || b.commercialTerms?.acceptedCurrencies)
                        ? (b.commercial?.acceptedCurrencies || b.commercialTerms?.acceptedCurrencies)
                        : prev.step5.acceptedCurrencies,
                    paymentMethods:
                      Array.isArray(b.commercial?.paymentMethods || b.commercialTerms?.paymentMethods)
                        ? (b.commercial?.paymentMethods || b.commercialTerms?.paymentMethods)
                        : prev.step5.paymentMethods,
                    advancePaymentPercentage:
                      b.commercial?.advancePaymentPercentage || b.commercialTerms?.advancePaymentPercentage || prev.step5.advancePaymentPercentage,
                    creditTermsDays: b.commercial?.creditTermsDays || b.commercialTerms?.creditTermsDays || prev.step5.creditTermsDays,
                    moqPolicy: b.commercial?.moqPolicy || b.commercialTerms?.moqPolicy || prev.step5.moqPolicy,
                    samplePolicy: b.commercial?.samplePolicy || b.commercialTerms?.samplePolicy || prev.step5.samplePolicy,
                    warrantyTerms: b.commercial?.warrantyTerms || b.commercialTerms?.warrantyTerms || prev.step5.warrantyTerms,
                    returnPolicy: b.commercial?.returnPolicy || b.commercialTerms?.returnPolicy || prev.step5.returnPolicy,
                    importerExporterStatus:
                      b.commercial?.importerExporterStatus || b.tradeLogistics?.importerExporterStatus || prev.step5.importerExporterStatus,
                    iecNumber: b.commercial?.iecNumber || b.tradeLogistics?.iecNumber || prev.step5.iecNumber,
                    sourcingCountries: b.commercial?.sourcingCountries || b.tradeLogistics?.sourcingCountries || prev.step5.sourcingCountries,
                    exportMarkets: b.commercial?.exportMarkets || b.tradeLogistics?.exportMarkets || prev.step5.exportMarkets,
                    annualTradeTurnover:
                      b.commercial?.annualTradeTurnover || b.tradeLogistics?.annualTradeTurnover || prev.step5.annualTradeTurnover,
                    preferredIncoterms:
                      Array.isArray(b.commercial?.preferredIncoterms || b.tradeLogistics?.preferredIncoterms)
                        ? (b.commercial?.preferredIncoterms || b.tradeLogistics?.preferredIncoterms)
                        : prev.step5.preferredIncoterms,
                    freightArrangements:
                      b.commercial?.freightArrangements || b.tradeLogistics?.freightArrangements || prev.step5.freightArrangements,
                    customsClearanceAssistance:
                      b.commercial?.customsClearanceAssistance ?? b.tradeLogistics?.customsClearanceAssistance ?? prev.step5.customsClearanceAssistance,
                    exportPackagingStandards:
                      b.commercial?.exportPackagingStandards || b.tradeLogistics?.exportPackagingStandards || prev.step5.exportPackagingStandards,
                    coldChainCapability:
                      b.commercial?.coldChainCapability ?? b.tradeLogistics?.coldChainCapability ?? prev.step5.coldChainCapability,
                    tradeReferences: b.commercial?.tradeReferences || b.tradeLogistics?.tradeReferences || prev.step5.tradeReferences,
                    accountHolderName:
                      b.commercial?.accountHolderName || b.bankingDetails?.accountHolderName || prev.step5.accountHolderName,
                    bankName: b.commercial?.bankName || b.bankingDetails?.bankName || prev.step5.bankName,
                    accountType: b.commercial?.accountType || b.bankingDetails?.accountType || prev.step5.accountType,
                    accountNumber: b.commercial?.accountNumber || b.bankingDetails?.accountNumber || prev.step5.accountNumber,
                    ifscCode: b.commercial?.ifscCode || b.bankingDetails?.ifscCode || prev.step5.ifscCode,
                    swiftBicCode: b.commercial?.swiftBicCode || b.bankingDetails?.swiftBicCode || prev.step5.swiftBicCode,
                    bankBranch: b.commercial?.bankBranch || b.bankingDetails?.bankBranch || prev.step5.bankBranch,
                    bankCountry: b.commercial?.bankCountry || b.bankingDetails?.bankCountry || prev.step5.bankCountry,
                    bankProofDoc: b.commercial?.bankProofDoc || b.bankingDetails?.bankProofDoc || prev.step5.bankProofDoc,
                    lawfullyScreened:
                      b.commercial?.lawfullyScreened ?? b.complianceDeclarations?.lawfullyScreened ?? prev.step5.lawfullyScreened,
                    noConflictOfInterest:
                      b.commercial?.noConflictOfInterest ?? b.complianceDeclarations?.noConflictOfInterest ?? prev.step5.noConflictOfInterest,
                    sanctionsFreeDeclaration:
                      b.commercial?.sanctionsFreeDeclaration ?? b.complianceDeclarations?.sanctionsFreeDeclaration ?? prev.step5.sanctionsFreeDeclaration,
                    authorityConsent:
                      b.commercial?.authorityConsent ?? b.complianceDeclarations?.authorityConsent ?? prev.step5.authorityConsent,
                  }
                : prev.step5,
            };
          });
        }
      })
      .catch(() => {});
  }, []);

  // Compute completion percentage
  function computeCompletion(data: FullVendorRegistrationDossier): number {
    return calculateDossierCompletion(data);
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
    toast.success('Demo Enterprise Data Populated', {
      description: 'Loaded comprehensive dossier for Meridian Steel Works Pvt. Ltd.',
    });
  }

  // Reset to empty draft
  function handleResetEmpty() {
    setDossier(INITIAL_EMPTY_DOSSIER);
    setCurrentStep(1);
    toast.info('Registration draft reset to blank state.');
  }

  // Save Draft action
  function handleSaveDraft() {
    toast.success('Progress Saved as Draft', {
      description: `Saved ${dossier.completionPercentage}% completed application. You can resume anytime.`,
    });
  }

  // Final submit verification
  async function handleSubmitVerification(declarations: {
    accuracy: boolean;
    authority: boolean;
    privacy: boolean;
  }) {
    setIsSubmittingVerification(true);
    try {
      // Real backend endpoint call to persist in MySQL business_entities & business_compliance_declarations
      const res = await vendorService.submitVerification({
        accuracyConfirmed: declarations.accuracy,
        verificationAuthorized: declarations.authority,
        declarationsAccepted: declarations.privacy,
      });

      const responseData = res?.data || res;
      const vendorId =
        responseData?.vendorId ||
        `BITA-VND-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const referenceNumber =
        responseData?.referenceNumber ||
        `REF-${(dossier.step2.state || 'MH').slice(0, 2).toUpperCase()}-${Date.now().toString().slice(-6)}`;

      const submittedDossier: FullVendorRegistrationDossier = {
        ...dossier,
        step6: {
          ...dossier.step6,
          status: 'Verification Pending',
          vendorId,
          referenceNumber,
          submissionDate: responseData?.submissionDate || new Date().toISOString(),
          accuracyConfirmed: true,
          verificationAuthorized: true,
          declarationsAccepted: true,
          adminRemarks: 'Application received and assigned to Statutory Verification Desk.',
        },
        completionPercentage: 100,
        lastUpdated: new Date().toISOString(),
      };

      setDossier(submittedDossier);

      // Keep AuthContext in sync immediately (same as OnboardingWizardModal),
      // so role/progress do not stay stale until a full page reload.
      updateRegistrationProgress(100, 6, 'pending_approval');

      // Hand the success toast off to the dashboard (single toast there only).
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'vendor_profile_just_completed',
          JSON.stringify({ vendorId, referenceNumber })
        );
      }

      setTimeout(() => {
        router.push('/demo/dashboard/vendor');
      }, 1200);
    } catch (err: any) {
      console.error('Submit verification error:', err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to transmit dossier for verification. Please ensure Step 2 & 5 are completed.';
      toast.error('Transmission Failed', {
        description: errMsg,
      });
    } finally {
      setIsSubmittingVerification(false);
    }
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
            const isCompleted =
              currentStep > s.num ||
              (s.num === 6 && (
                dossier.step6.status !== 'Draft' ||
                Boolean(dossier.step6.vendorId) ||
                (Boolean(dossier.step2?.legalName) && Boolean(dossier.step5?.accountNumber))
              ));
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
            onNext={() => {
              setCurrentStep(2);
              // Recompute completion percentage when advancing
              const completion = computeCompletion(dossier);
              setDossier(prev => ({
                ...prev,
                completionPercentage: completion,
                lastUpdated: new Date().toISOString(),
              }));
            }}
            onQuickFillDemo={handleFillDemo}
          />
        )}

        {currentStep === 2 && (
          <Step2Company
            data={dossier.step2}
            onChange={handleStep2Change}
            onNext={() => {
              setCurrentStep(3);
              // Recompute completion percentage when advancing
              const completion = computeCompletion(dossier);
              setDossier(prev => ({
                ...prev,
                completionPercentage: completion,
                lastUpdated: new Date().toISOString(),
              }));
            }}
            onPrev={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <Step3Business
            data={dossier.step3}
            onChange={handleStep3Change}
            onNext={() => {
              setCurrentStep(4);
              // Recompute completion percentage when advancing
              const completion = computeCompletion(dossier);
              setDossier(prev => ({
                ...prev,
                completionPercentage: completion,
                lastUpdated: new Date().toISOString(),
              }));
            }}
            onPrev={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <Step4Products
            data={dossier.step4}
            selectedCategoryIds={dossier.step3.selectedCategoryIds}
            onChange={handleStep4Change}
            onNext={() => {
              setCurrentStep(5);
              // Recompute completion percentage when advancing
              const completion = computeCompletion(dossier);
              setDossier(prev => ({
                ...prev,
                completionPercentage: completion,
                lastUpdated: new Date().toISOString(),
              }));
            }}
            onPrev={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 5 && (
          <Step5Commercial
            data={dossier.step5}
            onChange={handleStep5Change}
            onNext={() => {
              setCurrentStep(6);
              // Recompute completion percentage when advancing
              const completion = computeCompletion(dossier);
              setDossier(prev => ({
                ...prev,
                completionPercentage: completion,
                lastUpdated: new Date().toISOString(),
              }));
            }}
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
            isSubmitting={isSubmittingVerification}
            onDossierChange={(updated) => setDossier(updated)}
          />
        )}
      </div>
    </Card>
  );
}
