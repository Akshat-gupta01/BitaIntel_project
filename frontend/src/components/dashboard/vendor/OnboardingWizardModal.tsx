'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FullVendorRegistrationDossier,
  VendorRegistrationStatus,
} from '@/types/vendorRegistration';
import {
  DEMO_PREFILLED_DOSSIER,
  saveVendorDossierToStorage,
  isStep1Done,
  isStep2Done,
  isStep3Done,
  isStep4Done,
  isStep5Done,
  isStep6Done,
  calculateDossierCompletion,
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
import * as vendorService from '@services/vendor.service';
import { showProfileCompletedToast } from '@/lib/profileCompletedToast';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: number;
  dossier: FullVendorRegistrationDossier;
  onDossierChange: (updated: FullVendorRegistrationDossier) => void;
}

/**
 * Dynamically computes vendor registration dossier completion percentage.
 * Uses the canonical step validation from initialVendorDossier.
 */
export function computeDossierCompletion(
  data: FullVendorRegistrationDossier,
  _activeStep?: number,
  _maxStep?: number
): number {
  return calculateDossierCompletion(data);
}

export function OnboardingWizardModal({
  isOpen,
  onClose,
  initialStep = 2,
  dossier,
  onDossierChange,
}: OnboardingWizardModalProps) {
  const { updateRegistrationProgress } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(
    initialStep ? Math.max(2, Math.min(6, initialStep)) : 2
  );
  const [highestStepReached, setHighestStepReached] = useState<number>(() => {
    let initialMax = initialStep ? Math.max(2, Math.min(6, initialStep)) : 2;
    if (isStep6Done(dossier)) return 6;
    if (isStep5Done(dossier)) initialMax = Math.max(initialMax, 5);
    if (isStep4Done(dossier)) initialMax = Math.max(initialMax, 4);
    if (isStep3Done(dossier)) initialMax = Math.max(initialMax, 3);
    return initialMax;
  });
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);

  // Compute live display completion score based strictly on actual filled data
  const displayPercentage = useMemo(() => {
    return calculateDossierCompletion(dossier);
  }, [dossier]);

  useEffect(() => {
    if (isOpen && initialStep) {
      const step = Math.max(2, Math.min(6, initialStep));
      setCurrentStep(step);
      setHighestStepReached((prev) => Math.max(prev, step));
    }
  }, [isOpen, initialStep]);

  // Keep dossier completionPercentage updated in parent and storage whenever percentage changes
  useEffect(() => {
    if (isOpen) {
      const currentCalculated = calculateDossierCompletion(dossier);
      if (dossier.completionPercentage !== currentCalculated) {
        const updated = {
          ...dossier,
          completionPercentage: currentCalculated,
          lastUpdated: new Date().toISOString(),
        };
        onDossierChange(updated);
        saveVendorDossierToStorage(updated, dossier.step1?.email);
        updateRegistrationProgress(currentCalculated, currentStep);
      }
    }
  }, [isOpen, dossier, currentStep]);

  if (!isOpen) return null;

  function goToStep(nextStep: number) {
    const clamped = Math.max(2, Math.min(6, nextStep));
    setCurrentStep(clamped);
    const newMax = Math.max(highestStepReached, clamped);
    setHighestStepReached(newMax);
    const newScore = calculateDossierCompletion(dossier);
    if (newScore !== dossier.completionPercentage) {
      const updated = {
        ...dossier,
        completionPercentage: newScore,
        lastUpdated: new Date().toISOString(),
      };
      onDossierChange(updated);
      saveVendorDossierToStorage(updated, dossier.step1?.email);
      updateRegistrationProgress(newScore, clamped);
    }
  }

  // Update dossier state
  function updateDossier(updater: (prev: FullVendorRegistrationDossier) => FullVendorRegistrationDossier) {
    const updated = updater(dossier);
    const score = calculateDossierCompletion(updated);
    const completeWithPercentage = {
      ...updated,
      completionPercentage: score,
      lastUpdated: new Date().toISOString(),
    };
    onDossierChange(completeWithPercentage);
    saveVendorDossierToStorage(completeWithPercentage, completeWithPercentage.step1?.email);
    updateRegistrationProgress(score, currentStep);
  }

  function handleFillDemo() {
    onDossierChange(DEMO_PREFILLED_DOSSIER);
    saveVendorDossierToStorage(DEMO_PREFILLED_DOSSIER, DEMO_PREFILLED_DOSSIER.step1?.email);
    updateRegistrationProgress(100, 6, 'pending_approval');
    toast.success('Enterprise Details Pre-Filled', {
      description: 'Loaded comprehensive audited profile for Meridian Steel Works Ltd.',
    });
  }

  async function handleSaveDraft() {
    if (dossier.step2.legalName || dossier.step2.registeredAddress) {
      try {
        await vendorService.updateVendorProfile({
          name: dossier.step2.tradeName || dossier.step2.legalName,
          legalName: dossier.step2.legalName,
          tradeName: dossier.step2.tradeName || null,
          companyType: dossier.step2.constitution,
          registeredAddress: dossier.step2.registeredAddress,
          postalCode: dossier.step2.pincode,
          pincode: dossier.step2.pincode,
          city: dossier.step2.city,
          state: dossier.step2.state,
          country: dossier.step2.country || 'India',
          summary: dossier.step2.companyDescription,
          companyDescription: dossier.step2.companyDescription,
          website: dossier.step2.website || null,
          employees: dossier.step2.employeeCount,
        });

        if (dossier.step2.gstin || dossier.step2.pan) {
          await vendorService.updateStatutory({
            gstin: dossier.step2.gstin,
            pan: dossier.step2.pan,
            cin: dossier.step2.cin,
            udyamMsme: dossier.step2.udyam,
            iecCode: dossier.step2.iec,
          }).catch(() => {});
        }

        // Sync pending facilities to business_facilities table
        if (dossier.step2.facilities && dossier.step2.facilities.length > 0) {
          for (const fac of dossier.step2.facilities) {
            if (fac.id && fac.id.startsWith('FAC-')) {
              try {
                const res = await vendorService.addFacility({
                  facilityType: fac.type,
                  facilityName: fac.facilityName,
                  addressLine: fac.addressLine || 'Facility Address',
                  city: fac.city || 'Mumbai',
                  state: fac.state || 'Maharashtra',
                  pincode: fac.pincode || '400001',
                  country: fac.country || 'India',
                  isOwned: fac.isOwned ?? true,
                });
                if (res?.data?.facility?.id) {
                  fac.id = String(res.data.facility.id);
                }
              } catch (_) {}
            }
          }
        }

        // Sync pending personnel to business_personnel table
        if (dossier.step2.keyPersonnel && dossier.step2.keyPersonnel.length > 0) {
          for (const kp of dossier.step2.keyPersonnel) {
            if (kp.id && kp.id.startsWith('KP-') && kp.name && kp.email) {
              try {
                const res = await vendorService.addPersonnel({
                  name: kp.name,
                  designation: kp.designation || 'Executive',
                  email: kp.email,
                  mobile: kp.mobile || '0000000000',
                  isAuthorizedSignatory: !!kp.isAuthorizedSignatory,
                });
                if (res?.data?.personnel?.id) {
                  kp.id = String(res.data.personnel.id);
                }
              } catch (_) {}
            }
          }
        }
        // Sync Step 3 Business Capabilities to normalized relational tables
        if (dossier.step3.businessTypeCodes && dossier.step3.businessTypeCodes.length > 0) {
          try {
            await vendorService.saveCapabilities({
              businessTypeCodes: dossier.step3.businessTypeCodes,
              selectedCategoryIds: dossier.step3.selectedCategoryIds || [],
              selectedSubcategoryIds: dossier.step3.selectedSubcategoryIds || [],
              businessActivities: dossier.step3.businessActivities || [],
              manufacturingProcesses: dossier.step3.manufacturingProcesses || null,
              machineryEquipment: dossier.step3.machineryEquipment || null,
              installedCapacity: dossier.step3.installedCapacity || null,
              availableCapacity: dossier.step3.availableCapacity || null,
              hasRdLab: Boolean(dossier.step3.hasRdLab),
              hasQcLab: Boolean(dossier.step3.hasQcLab),
              offersCustomDevelopment: Boolean(dossier.step3.offersCustomDevelopment),
              serviceTypes: dossier.step3.serviceTypes || null,
              serviceExpertise: dossier.step3.serviceExpertise || null,
              geographicCoverage: dossier.step3.geographicCoverage || null,
              deliveryCapacity: dossier.step3.deliveryCapacity || null,
              yearsInBusiness: dossier.step3.yearsInBusiness || null,
              numberOfFacilities: dossier.step3.numberOfFacilities || null,
              annualTurnoverRange: dossier.step3.annualTurnoverRange || null,
              totalWorkforce: dossier.step3.totalWorkforce || null,
              manufacturingLicenceDoc: dossier.step3.manufacturingLicenceDoc || null,
              facilityPhotos: dossier.step3.facilityPhotos || null,
              technicalAuditDoc: dossier.step3.technicalAuditDoc || null,
            });
          } catch (_) {}
        }
        // Sync pending Step 4 products to business_products table
        if (dossier.step4.products && dossier.step4.products.length > 0) {
          for (const prd of dossier.step4.products) {
            if (prd.id && prd.id.startsWith('PRD-')) {
              try {
                const res = await vendorService.addProduct({
                  name: prd.name,
                  type: prd.type,
                  categoryId: prd.categoryId,
                  subcategoryId: prd.subcategoryId || null,
                  brand: prd.brand || null,
                  description: prd.description || null,
                  specifications: prd.specifications || null,
                  grade: prd.grade || null,
                  standards: prd.standards || null,
                  hsnCode: prd.hsnCode || null,
                  countryOfOrigin: prd.countryOfOrigin || 'India',
                  moq: prd.moq || null,
                  standardOrderQty: prd.standardOrderQty || null,
                  monthlyCapacity: prd.monthlyCapacity || null,
                  availableStock: prd.availableStock || null,
                  leadTimeDays: prd.leadTimeDays || null,
                  sampleAvailability: prd.sampleAvailability,
                  indicativePrice: prd.indicativePrice || null,
                  currency: prd.currency || 'INR',
                  priceValidity: prd.priceValidity || null,
                  targetMarkets: prd.targetMarkets || null,
                  images: prd.images || [],
                  catalogueDoc: prd.catalogueDoc || null,
                  technicalDataSheetDoc: prd.technicalDataSheetDoc || null,
                  coaDoc: prd.coaDoc || null,
                  sdsDoc: prd.sdsDoc || null,
                });
                if (res?.data?.product?.id) {
                  prd.id = String(res.data.product.id);
                }
              } catch (_) {}
            }
          }
        }

        // Step 4 Certifications Sync
        if (dossier.step4?.certifications?.length) {
          for (const cert of dossier.step4.certifications) {
            if (cert.id && cert.id.startsWith('CERT-')) {
              try {
                const res = await vendorService.addCertification({
                  certificateType: cert.certificateType,
                  certificateNumber: cert.certificateNumber,
                  issuingAuthority: cert.issuingAuthority,
                  issueDate: cert.issueDate || null,
                  expiryDate: cert.expiryDate || null,
                  scope: cert.scope || null,
                  applicableFacility: cert.applicableFacility || 'All Facilities',
                  evidenceDoc: cert.evidenceDoc || null,
                  status: cert.status,
                });
                if (res?.data?.certification?.id) {
                  cert.id = String(res.data.certification.id);
                }
              } catch (_) {}
            }
          }
        }

        // Step 4 Section 3: Quality Systems & Testing Capabilities Sync
        if (dossier.step4?.testingCapabilities || dossier.step4?.qualityAssuranceProcedures) {
          try {
            await vendorService.updateQualitySystems({
              testingCapabilities: dossier.step4.testingCapabilities?.trim() || null,
              qualityAssuranceProcedures: dossier.step4.qualityAssuranceProcedures?.trim() || null,
            });
          } catch (_) {}
        }

        // Step 5: Commercial, Trade & Banking Settlement Sync
        if (
          dossier.step5?.accountNumber ||
          dossier.step5?.bankName ||
          dossier.step5?.ifscCode ||
          dossier.step5?.creditTermsDays ||
          (dossier.step5?.paymentMethods && dossier.step5.paymentMethods.length > 0) ||
          (dossier.step5?.departmentContacts && dossier.step5.departmentContacts.length > 0)
        ) {
          try {
            await vendorService.saveCommercial({
              departmentContacts: dossier.step5.departmentContacts || [],
              acceptedCurrencies: dossier.step5.acceptedCurrencies || ['INR'],
              paymentMethods: dossier.step5.paymentMethods || ['Bank Transfer (NEFT/RTGS)'],
              advancePaymentPercentage: dossier.step5.advancePaymentPercentage || '20%',
              creditTermsDays: dossier.step5.creditTermsDays || '30 Days',
              moqPolicy: dossier.step5.moqPolicy || null,
              samplePolicy: dossier.step5.samplePolicy || null,
              warrantyTerms: dossier.step5.warrantyTerms || null,
              returnPolicy: dossier.step5.returnPolicy || null,
              importerExporterStatus: dossier.step5.importerExporterStatus || 'Domestic Only',
              iecNumber: dossier.step5.iecNumber || null,
              sourcingCountries: dossier.step5.sourcingCountries || null,
              exportMarkets: dossier.step5.exportMarkets || null,
              annualTradeTurnover: dossier.step5.annualTradeTurnover || null,
              preferredIncoterms: dossier.step5.preferredIncoterms || ['FOB - Free on Board'],
              freightArrangements: dossier.step5.freightArrangements || null,
              customsClearanceAssistance: Boolean(dossier.step5.customsClearanceAssistance),
              exportPackagingStandards: dossier.step5.exportPackagingStandards || null,
              coldChainCapability: Boolean(dossier.step5.coldChainCapability),
              tradeReferences: dossier.step5.tradeReferences || null,
              accountHolderName: dossier.step5.accountHolderName?.trim() || '',
              bankName: dossier.step5.bankName?.trim() || '',
              accountType: dossier.step5.accountType || 'Current Account',
              accountNumber: dossier.step5.accountNumber?.trim() || '',
              ifscCode: dossier.step5.ifscCode?.trim() || '',
              swiftBicCode: dossier.step5.swiftBicCode?.trim() || null,
              bankBranch: dossier.step5.bankBranch?.trim() || null,
              bankCountry: dossier.step5.bankCountry || 'India',
              bankProofDoc: dossier.step5.bankProofDoc || null,
              lawfullyScreened: Boolean(dossier.step5.lawfullyScreened),
              noConflictOfInterest: Boolean(dossier.step5.noConflictOfInterest),
              sanctionsFreeDeclaration: Boolean(dossier.step5.sanctionsFreeDeclaration),
              authorityConsent: Boolean(dossier.step5.authorityConsent ?? true),
            });
          } catch (_) {}
        }
        toast.success('Registration Progress Saved', {
          description: `Saved ${dossier.completionPercentage}% of your dossier to database. You can resume anytime.`,
        });
      } catch (err: any) {
        console.error('Draft sync error:', err);
        toast.error('Could not save draft to database', {
          description: err?.message || 'Server communication failed.',
        });
      }
    } else {
      toast.info('No changes to save.');
    }
  }

  async function handleSubmitVerification(declarations?: {
    accuracy: boolean;
    authority: boolean;
    privacy: boolean;
  }) {
    if (!declarations || !declarations.accuracy || !declarations.authority || !declarations.privacy) {
      toast.error('Declarations Required', {
        description: 'Please accept all statutory and authorization declarations before submitting for verification.',
      });
      return;
    }

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
          adminRemarks: 'Application submitted and queued for GSTN & MCA cross-checks.',
        },
        completionPercentage: 100,
        lastUpdated: new Date().toISOString(),
      };

      onDossierChange(submittedDossier);
      updateRegistrationProgress(100, 6, 'pending_approval');

      onClose();
      showProfileCompletedToast(vendorId, referenceNumber);
    } catch (err: any) {
      console.error('Submit verification error:', err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to transmit dossier for verification.';
      toast.error('Transmission Failed', {
        description: errMsg,
      });
    } finally {
      setIsSubmittingVerification(false);
    }
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
                  {displayPercentage}% Done
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
            const isCompleted =
              s.num === 1
                ? isStep1Done(dossier)
                : s.num === 2
                ? isStep2Done(dossier)
                : s.num === 3
                ? isStep3Done(dossier)
                : s.num === 4
                ? isStep4Done(dossier)
                : s.num === 5
                ? isStep5Done(dossier)
                : isStep6Done(dossier);
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => goToStep(s.num)}
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
                goToStep(3);
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
              onNext={() => goToStep(4)}
              onPrev={() => goToStep(2)}
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
              onNext={() => goToStep(5)}
              onPrev={() => goToStep(3)}
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
              onNext={() => goToStep(6)}
              onPrev={() => goToStep(4)}
            />
          )}

          {currentStep === 6 && (
            <Step6Review
              dossier={dossier}
              onChangeStep={(stepNum) => goToStep(stepNum)}
              onSaveDraft={handleSaveDraft}
              onSubmitVerification={handleSubmitVerification}
              onPrev={() => goToStep(5)}
              isSubmitting={isSubmittingVerification}
              onDossierChange={onDossierChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
