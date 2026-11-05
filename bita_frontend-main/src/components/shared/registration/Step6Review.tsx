'use client';

import React, { useState } from 'react';
import {
  FullVendorRegistrationDossier,
  Step6SubmissionData,
  VendorRegistrationStatus,
} from '@/types/vendorRegistration';
import { VENDOR_CATEGORIES, BUSINESS_TYPES } from '@/config/vendorMasterData';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card } from '@/components/ui/Card';
import {
  CheckCircle2,
  FileCheck2,
  Printer,
  Edit3,
  ShieldCheck,
  Send,
  Save,
  ArrowRight,
  Clock,
  AlertCircle,
  Download,
  Building,
  Layers,
  Package,
  Award,
  DollarSign,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

interface Step6ReviewProps {
  dossier: FullVendorRegistrationDossier;
  onChangeStep: (stepNumber: number) => void;
  onSaveDraft: () => void;
  onSubmitVerification: () => void;
  onPrev: () => void;
}

export function Step6Review({
  dossier,
  onChangeStep,
  onSaveDraft,
  onSubmitVerification,
  onPrev,
}: Step6ReviewProps) {
  const [declarations, setDeclarations] = useState<{
    accuracy: boolean;
    authority: boolean;
    privacy: boolean;
  }>({
    accuracy: dossier.step6.accuracyConfirmed ?? true,
    authority: dossier.step6.verificationAuthorized ?? true,
    privacy: dossier.step6.declarationsAccepted ?? true,
  });

  const isSubmitted =
    dossier.step6.status !== 'Draft' && !!dossier.step6.vendorId;

  function handleSubmit() {
    if (!declarations.accuracy || !declarations.authority || !declarations.privacy) {
      toast.error('Declarations Required', {
        description: 'Please check all statutory and authorization declarations before submitting for verification.',
      });
      return;
    }
    onSubmitVerification();
  }

  // Find business type names
  const businessTypeNames = dossier.step3.businessTypeCodes
    .map((c) => BUSINESS_TYPES.find((bt) => bt.code === c)?.name || c)
    .join(', ');

  // Find category names
  const categoryNames = dossier.step3.selectedCategoryIds
    .map((c) => VENDOR_CATEGORIES.find((cat) => cat.id === c)?.name || c)
    .join(', ');

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="border-b border-slate-200/80 pb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-200">
          Step 6 of 6
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
          Documents, Review & Verification Submission
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Review your 5-step vendor dossier, verify statutory checklist attachments, and transmit for official verification.
        </p>
      </div>

      {/* Post-submission status display if already submitted */}
      {isSubmitted && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-6 text-slate-900 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-emerald-600 text-white grid place-items-center shadow-xs">
                <CheckCircle2 className="size-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                  Application Status: {dossier.step6.status}
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Vendor ID: {dossier.step6.vendorId}
                </h3>
                <p className="text-xs text-slate-600 font-mono">
                  Ref: {dossier.step6.referenceNumber} • Submitted:{' '}
                  {new Date(dossier.step6.submissionDate || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="text-xs border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50"
              >
                <Printer className="size-3.5 mr-1.5" /> Print Summary
              </Button>
              <a
                href="/demo/dashboard/vendor"
                className="inline-flex items-center text-xs font-bold px-3.5 py-2 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 shadow-xs"
              >
                Go to Vendor Dashboard <ArrowRight className="size-3.5 ml-1.5" />
              </a>
            </div>
          </div>

          {dossier.step6.adminRemarks && (
            <div className="rounded-lg bg-white/80 p-3 border border-emerald-200 text-xs text-slate-700">
              <strong className="text-emerald-950 font-bold block mb-0.5">Verification Desk Remark:</strong>
              {dossier.step6.adminRemarks}
            </div>
          )}
        </div>
      )}

      {/* Progress & Verification Tracking Card */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Dossier Completion</span>
          <span className="text-2xl font-black text-primary-700">{dossier.completionPercentage}%</span>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-primary-600 h-full rounded-full transition-all"
              style={{ width: `${dossier.completionPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Catalog Products</span>
          <span className="text-2xl font-black text-slate-900">{dossier.step4.products.length} Items</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Live in directory</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Quality Certificates</span>
          <span className="text-2xl font-black text-slate-900">
            {dossier.step4.certifications.length} Active
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Standards audited</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Uploaded Evidence</span>
          <span className="text-2xl font-black text-slate-900">{dossier.documentVault.length} Files</span>
          <span className="text-[10px] text-primary-700 font-semibold mt-1 block">Vaulted securely</span>
        </div>
      </div>

      {/* Section Previews with Edit Buttons */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Comprehensive Dossier Summary
        </h3>

        {/* Step 1 Preview */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary-700" />
              <h4 className="text-xs font-bold text-slate-900">Step 1: Authorized Account & Dual Verification</h4>
            </div>
            <button
              type="button"
              onClick={() => onChangeStep(1)}
              className="text-xs font-semibold text-primary-700 hover:underline flex items-center gap-1"
            >
              <Edit3 className="size-3" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-700">
            <div>
              <span className="text-slate-400 block text-[10px]">Authorized Person</span>
              <strong className="text-slate-900">{dossier.step1.authorizedName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Designation</span>
              <span>{dossier.step1.designation}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Corporate Email</span>
              <span className="font-mono text-[11px]">{dossier.step1.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Dual OTP Status</span>
              <span className="text-emerald-700 font-bold">Email & SMS Verified</span>
            </div>
          </div>
        </div>

        {/* Step 2 Preview */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Building className="size-4 text-primary-700" />
              <h4 className="text-xs font-bold text-slate-900">Step 2: Company Profile & Legal Registrations</h4>
            </div>
            <button
              type="button"
              onClick={() => onChangeStep(2)}
              className="text-xs font-semibold text-primary-700 hover:underline flex items-center gap-1"
            >
              <Edit3 className="size-3" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-700">
            <div>
              <span className="text-slate-400 block text-[10px]">Legal Name</span>
              <strong className="text-slate-900">{dossier.step2.legalName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Trade Name</span>
              <span>{dossier.step2.tradeName || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">GSTIN</span>
              <span className="font-mono">{dossier.step2.gstin}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Corporate PAN</span>
              <span className="font-mono">{dossier.step2.pan}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">CIN / Registration</span>
              <span className="font-mono text-[11px]">{dossier.step2.cin || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Registered City / State</span>
              <span>
                {dossier.step2.city}, {dossier.step2.state}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Additional Facilities</span>
              <span>{dossier.step2.facilities.length} Plants/Offices added</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Key Management</span>
              <span>{dossier.step2.keyPersonnel.length} Executives profiled</span>
            </div>
          </div>
        </div>

        {/* Step 3 Preview */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Layers className="size-4 text-primary-700" />
              <h4 className="text-xs font-bold text-slate-900">Step 3: Business Classification & Capabilities</h4>
            </div>
            <button
              type="button"
              onClick={() => onChangeStep(3)}
              className="text-xs font-semibold text-primary-700 hover:underline flex items-center gap-1"
            >
              <Edit3 className="size-3" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700">
            <div>
              <span className="text-slate-400 block text-[10px]">Business Types</span>
              <strong className="text-slate-900">{businessTypeNames || 'Manufacturer'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Selected Categories</span>
              <span className="line-clamp-1">{categoryNames}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Annual Turnover</span>
              <span>{dossier.step3.annualTurnoverRange}</span>
            </div>
          </div>
        </div>

        {/* Step 4 Preview */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Package className="size-4 text-primary-700" />
              <h4 className="text-xs font-bold text-slate-900">Step 4: Products & Quality Certifications</h4>
            </div>
            <button
              type="button"
              onClick={() => onChangeStep(4)}
              className="text-xs font-semibold text-primary-700 hover:underline flex items-center gap-1"
            >
              <Edit3 className="size-3" /> Edit
            </button>
          </div>
          <div className="text-xs text-slate-700 space-y-1">
            <p>
              <strong className="text-slate-900">{dossier.step4.products.length} Products registered</strong>{' '}
              with MOQs and lead time tolerances.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {dossier.step4.certifications.map((c) => (
                <span
                  key={c.id}
                  className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold"
                >
                  {c.certificateType} (Exp: {c.expiryDate})
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Step 5 Preview */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="size-4 text-primary-700" />
              <h4 className="text-xs font-bold text-slate-900">Step 5: Commercial, Trade & Banking</h4>
            </div>
            <button
              type="button"
              onClick={() => onChangeStep(5)}
              className="text-xs font-semibold text-primary-700 hover:underline flex items-center gap-1"
            >
              <Edit3 className="size-3" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-700">
            <div>
              <span className="text-slate-400 block text-[10px]">Bank Name</span>
              <strong className="text-slate-900">{dossier.step5.bankName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Account Number</span>
              <span className="font-mono">{dossier.step5.accountNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">IFSC Code</span>
              <span className="font-mono">{dossier.step5.ifscCode}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Incoterms</span>
              <span className="font-mono">{dossier.step5.preferredIncoterms.join(', ')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Document Checklist with Metadata */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-primary-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Statutory Verification Document Checklist ({dossier.documentVault.length} Vaulted)
            </h3>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3">Document Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">File Reference</th>
                  <th className="p-3">Upload Date</th>
                  <th className="p-3">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dossier.documentVault.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70">
                    <td className="p-3 font-semibold text-slate-900">{doc.name}</td>
                    <td className="p-3 text-slate-500">{doc.category}</td>
                    <td className="p-3 font-mono text-[11px] text-primary-700">{doc.fileName}</td>
                    <td className="p-3 text-slate-400">{doc.uploadDate}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="size-3" /> {doc.verificationStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Declarations & Consent */}
      <div className="rounded-xl border border-primary-100 bg-primary-50/70 p-4 sm:p-5 space-y-3">
        <h4 className="text-xs font-bold text-primary-950 uppercase tracking-wide">
          Official Declarations & Signatory Undertaking
        </h4>

        <div className="space-y-2.5">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <Checkbox
              checked={declarations.accuracy}
              onChange={(e) => setDeclarations({ ...declarations, accuracy: e.target.checked })}
              className="mt-0.5"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              I affirm that all information provided in this 5-stage dossier is true, accurate, and reflects the current
              operating status of the company.
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <Checkbox
              checked={declarations.authority}
              onChange={(e) => setDeclarations({ ...declarations, authority: e.target.checked })}
              className="mt-0.5"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              I certify that I possess full legal authority from the Board of Directors / Partners to execute this
              application and bind the business entity.
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <Checkbox
              checked={declarations.privacy}
              onChange={(e) => setDeclarations({ ...declarations, privacy: e.target.checked })}
              className="mt-0.5"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              I authorize BITAINTEL and its designated audit partners to electronically cross-verify corporate tax
              filings, MCA records, and industrial accreditations for network empanelment.
            </span>
          </label>
        </div>
      </div>

      {/* Submission Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={onPrev}
            className="text-xs font-bold text-slate-700 w-full sm:w-auto"
          >
            Previous Step
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onSaveDraft}
            className="text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-50 w-full sm:w-auto"
          >
            <Save className="size-3.5 mr-1.5" /> Save Draft & Exit
          </Button>
        </div>

        <Button
          type="button"
          onClick={handleSubmit}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-3 shadow-md text-sm w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <Send className="size-4" /> Transmit for Official Verification
        </Button>
      </div>
    </div>
  );
}
