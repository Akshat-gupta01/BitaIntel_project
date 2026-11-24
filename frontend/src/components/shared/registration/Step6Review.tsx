'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FullVendorRegistrationDossier,
  Step6SubmissionData,
  VendorRegistrationStatus,
  DocumentVaultItem,
} from '@/types/vendorRegistration';
import { VENDOR_CATEGORIES, BUSINESS_TYPES } from '@/config/vendorMasterData';
import {
  isStep2Done,
  isStep5Done,
  calculateDossierCompletion,
} from '@/config/initialVendorDossier';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card } from '@/components/ui/Card';
import { BusinessAvatar } from '@/components/shared/BusinessLogoUploader';
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
  ExternalLink,
  Eye,
  RefreshCw,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import * as vendorService from '../../../../services/vendor.service';

interface Step6ReviewProps {
  dossier: FullVendorRegistrationDossier;
  onChangeStep: (stepNumber: number) => void;
  onSaveDraft: () => void;
  onSubmitVerification: (declarations: { accuracy: boolean; authority: boolean; privacy: boolean }) => void | Promise<void>;
  onPrev: () => void;
  isSubmitting?: boolean;
  onDossierChange?: (updated: FullVendorRegistrationDossier) => void;
}

export function Step6Review({
  dossier,
  onChangeStep,
  onSaveDraft,
  onSubmitVerification,
  onPrev,
  isSubmitting = false,
  onDossierChange,
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

  // Live database vaulted documents
  const [dbDocuments, setDbDocuments] = useState<DocumentVaultItem[]>([]);

  // Preview & Replace states
  const [previewDoc, setPreviewDoc] = useState<(DocumentVaultItem & { fullUrl: string }) | null>(null);
  const [replacingDocId, setReplacingDocId] = useState<string | null>(null);
  const [targetDocForReplace, setTargetDocForReplace] = useState<DocumentVaultItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    vendorService
      .getVendorDocuments()
      .then((res: any) => {
        const docs = res?.data?.documents;
        if (Array.isArray(docs) && docs.length > 0) {
          const formatted: DocumentVaultItem[] = docs.map((d: any) => ({
            id: String(d.id || d.categoryKey),
            name: d.categoryName || d.categoryKey || d.fileName,
            category:
              d.categoryKey?.includes('tax') || d.categoryKey?.includes('incorporation')
                ? 'Legal & Tax'
                : d.categoryKey?.includes('bank')
                ? 'Banking & Identity'
                : 'Facility & Licences',
            categoryKey: d.categoryKey,
            fileName: d.fileName || 'Statutory_Document.pdf',
            fileSize: d.fileSizeBytes
              ? `${(d.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`
              : '1.2 MB',
            uploadDate: d.createdAt
              ? new Date(d.createdAt).toISOString().split('T')[0]
              : 'Vaulted',
            verificationStatus: d.status === 'VERIFIED' ? 'Verified' : 'Under Review',
            downloadUrl: d.fullUrl || d.fileUrl,
          }));
          setDbDocuments(formatted);
        }
      })
      .catch(() => {});
  }, []);

  function handleViewDoc(doc: DocumentVaultItem) {
    if (!doc.downloadUrl) {
      toast.info('Preview Unavailable', {
        description: 'No uploaded file link found for this item.',
      });
      return;
    }
    const fullUrl = vendorService.getFullImageUrl(doc.downloadUrl);
    setPreviewDoc({
      ...doc,
      fullUrl,
    });
  }

  function handleTriggerReplace(doc: DocumentVaultItem) {
    setTargetDocForReplace(doc);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !targetDocForReplace) return;

    const doc = targetDocForReplace;
    setReplacingDocId(doc.id);

    try {
      let relativePath = '';
      let fullUrl = '';

      let catKey = doc.categoryKey || 'statutory_doc';
      let catName = doc.name;

      if (doc.id.includes('S5-BANK') || doc.name.toLowerCase().includes('bank')) {
        catKey = 'bank_proof';
        catName = 'Statutory Bank Proof (Cancelled Cheque)';
        const bankRes = await vendorService.uploadBankProof(file);
        relativePath = bankRes?.documentUrl || bankRes?.fileUrl || `/uploads/documents/${file.name}`;
      } else {
        if (doc.id.includes('S3-LIC') || doc.name.toLowerCase().includes('licence')) {
          catKey = 'manufacturing_licence';
          catName = 'Factory / Manufacturing Operating Licence';
        } else if (doc.id.includes('S3-AUD') || doc.name.toLowerCase().includes('audit')) {
          catKey = 'technical_audit';
          catName = 'Technical Audit & Inspection Report';
        } else if (doc.name.toLowerCase().includes('incorporation')) {
          catKey = 'incorporation';
          catName = 'Certificate of Incorporation / Registration Proof';
        } else if (doc.name.toLowerCase().includes('address') || doc.name.toLowerCase().includes('electricity')) {
          catKey = 'address_proof';
          catName = 'Corporate Address Proof / Electricity Bill';
        } else if (doc.name.toLowerCase().includes('tax') || doc.name.toLowerCase().includes('gst')) {
          catKey = 'tax_registration';
          catName = 'Applicable Tax Registrations (GST & PAN Copies)';
        } else if (doc.name.toLowerCase().includes('board') || doc.name.toLowerCase().includes('resolution')) {
          catKey = 'board_resolution';
          catName = 'Authorized Signatory Board Resolution / Letter';
        }

        const uploadRes: any = await vendorService.uploadStatutoryDocument(file, catKey, catName);
        const uploadedDoc = uploadRes?.data?.document || uploadRes?.document;
        relativePath = uploadedDoc?.fileUrl || `/uploads/documents/${file.name}`;
        fullUrl = uploadedDoc?.fullUrl || relativePath;
      }

      // Update local dbDocuments state immediately
      setDbDocuments((prev) => {
        const index = prev.findIndex(
          (d) => d.id === doc.id || d.name === doc.name || (catKey && d.categoryKey === catKey)
        );
        const updatedItem: DocumentVaultItem = {
          id: doc.id,
          name: doc.name,
          category: doc.category as any,
          categoryKey: catKey,
          fileName: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          uploadDate: new Date().toISOString().split('T')[0],
          verificationStatus: 'Under Review',
          downloadUrl: fullUrl || relativePath,
        };
        if (index >= 0) {
          const copy = [...prev];
          copy[index] = updatedItem;
          return copy;
        }
        return [updatedItem, ...prev];
      });

      // Update parent dossier if available
      if (onDossierChange) {
        const updatedDossier: FullVendorRegistrationDossier = {
          ...dossier,
          step3: {
            ...dossier.step3,
            ...(catKey === 'manufacturing_licence' ? { manufacturingLicenceDoc: relativePath } : {}),
            ...(catKey === 'technical_audit' ? { technicalAuditDoc: relativePath } : {}),
          },
          step5: {
            ...dossier.step5,
            ...(catKey === 'bank_proof' ? { bankProofDoc: relativePath } : {}),
          },
        };
        onDossierChange(updatedDossier);
      }

      toast.success('Document Replaced Successfully', {
        description: `Uploaded "${file.name}" to replace "${doc.name}".`,
      });
    } catch (err: any) {
      console.error('Replace document error:', err);
      toast.error('Failed to replace document', {
        description: err?.response?.data?.message || err?.message || 'Upload failed',
      });
    } finally {
      setReplacingDocId(null);
      setTargetDocForReplace(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  // Aggregated Checklist: Collects and unifies documents from Steps 2, 3, 4, 5, and DB Vault
  const aggregatedDocuments = useMemo(() => {
    const list: DocumentVaultItem[] = [];
    const seenRefs = new Set<string>();

    const addDoc = (doc: DocumentVaultItem) => {
      const key = (doc.fileName || doc.downloadUrl || doc.name).trim().toLowerCase();
      if (key && !seenRefs.has(key)) {
        seenRefs.add(key);
        list.push(doc);
      }
    };

    // 1. Documents from Database Vault (Step 2 ROC incorporation, GST, PAN, Board Resolution)
    dbDocuments.forEach(addDoc);

    // 2. Documents already in dossier.documentVault
    if (Array.isArray(dossier.documentVault)) {
      dossier.documentVault.forEach(addDoc);
    }

    // 3. Step 3: Manufacturing License & Capabilities
    if (dossier.step3?.manufacturingLicenceDoc) {
      const raw = dossier.step3.manufacturingLicenceDoc;
      const fileName = raw.split('/').pop() || raw.split('\\').pop() || 'Manufacturing_Licence.pdf';
      addDoc({
        id: 'DOC-S3-LIC',
        name: 'Factory / Manufacturing Operating Licence',
        category: 'Facility & Licences',
        fileName,
        fileSize: '1.8 MB',
        uploadDate: 'Attached in Step 3',
        verificationStatus: 'Under Review',
        downloadUrl: raw,
      });
    }

    if (dossier.step3?.technicalAuditDoc) {
      const raw = dossier.step3.technicalAuditDoc;
      const fileName = raw.split('/').pop() || raw.split('\\').pop() || 'Technical_Audit_Report.pdf';
      addDoc({
        id: 'DOC-S3-AUD',
        name: 'Technical Audit & Inspection Report',
        category: 'Facility & Licences',
        fileName,
        fileSize: '2.4 MB',
        uploadDate: 'Attached in Step 3',
        verificationStatus: 'Under Review',
        downloadUrl: raw,
      });
    }

    // 4. Step 4: Quality & Regulatory Certifications
    if (Array.isArray(dossier.step4?.certifications)) {
      dossier.step4.certifications.forEach((cert, idx) => {
        if (cert.evidenceDoc) {
          const raw = cert.evidenceDoc;
          const fileName = raw.split('/').pop() || raw.split('\\').pop() || `${cert.certificateType || 'Certificate'}.pdf`;
          addDoc({
            id: `DOC-S4-CERT-${idx}`,
            name: `${cert.certificateType} (Cert #${cert.certificateNumber || 'Attached'})`,
            category: 'Quality & Standards',
            fileName,
            fileSize: '1.2 MB',
            uploadDate: cert.issueDate || 'Attached in Step 4',
            issueDate: cert.issueDate,
            expiryDate: cert.expiryDate,
            verificationStatus: 'Verified',
            downloadUrl: raw,
          });
        }
      });
    }

    // 5. Step 4: Product Catalogues & Specification Sheets
    if (Array.isArray(dossier.step4?.products)) {
      dossier.step4.products.forEach((prod, idx) => {
        if (prod.catalogueDoc) {
          const raw = prod.catalogueDoc;
          const fileName = raw.split('/').pop() || raw.split('\\').pop() || `${prod.name}_Catalogue.pdf`;
          addDoc({
            id: `DOC-S4-CAT-${idx}`,
            name: `${prod.name} — Technical Specification / Catalogue`,
            category: 'Quality & Standards',
            fileName,
            fileSize: '3.1 MB',
            uploadDate: 'Attached in Step 4',
            verificationStatus: 'Under Review',
            downloadUrl: raw,
          });
        }
        if (prod.coaDoc) {
          const raw = prod.coaDoc;
          const fileName = raw.split('/').pop() || raw.split('\\').pop() || `${prod.name}_COA.pdf`;
          addDoc({
            id: `DOC-S4-COA-${idx}`,
            name: `${prod.name} — Certificate of Analysis (COA)`,
            category: 'Quality & Standards',
            fileName,
            fileSize: '1.4 MB',
            uploadDate: 'Attached in Step 4',
            verificationStatus: 'Under Review',
            downloadUrl: raw,
          });
        }
      });
    }

    // 6. Step 5: Statutory Banking Proof (Cancelled Cheque)
    if (dossier.step5?.bankProofDoc) {
      const raw = dossier.step5.bankProofDoc;
      const fileName = raw.split('/').pop() || raw.split('\\').pop() || 'Cancelled_Cheque_Statement.pdf';
      addDoc({
        id: 'DOC-S5-BANK',
        name: `Statutory Bank Proof (${dossier.step5.bankName || 'Cancelled Cheque'})`,
        category: 'Banking & Identity',
        fileName,
        fileSize: '1.5 MB',
        uploadDate: 'Attached in Step 5',
        verificationStatus: 'Verified',
        downloadUrl: raw,
      });
    }

    return list;
  }, [dossier, dbDocuments]);

  const isSubmitted =
    dossier.step6.status !== 'Draft' && !!dossier.step6.vendorId;

  // Lock re-submission only while already in the review pipeline.
  // 'Additional Information Required' / 'Rejected' must be allowed to resubmit.
  const isSubmissionLocked =
    dossier.step6.status === 'Verification Pending' ||
    dossier.step6.status === 'Submitted' ||
    dossier.step6.status === 'Under Review' ||
    dossier.step6.status === 'Verified' ||
    dossier.step6.status === 'Suspended';

  function handleSubmit() {
    if (!declarations.accuracy || !declarations.authority || !declarations.privacy) {
      toast.error('Declarations Required', {
        description: 'Please check all statutory and authorization declarations before submitting for verification.',
      });
      return;
    }
    if (!isStep2Done(dossier)) {
      toast.error('Company Profile Required', {
        description: 'Step 2 (Company Profile, GSTIN, PAN, Address) must be completed before official verification transmission.',
      });
      onChangeStep(2);
      return;
    }
    if (!isStep5Done(dossier)) {
      toast.error('Banking Details Required', {
        description: 'Step 5 Banking Details (Account Number & IFSC Code) must be configured before official verification transmission.',
      });
      onChangeStep(5);
      return;
    }
    onSubmitVerification(declarations);
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
                  {(() => { const date = dossier.step6.submissionDate ? new Date(dossier.step6.submissionDate) : new Date(); return date.toLocaleDateString(); })()}
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
          <span className="text-2xl font-black text-primary-700">
            {calculateDossierCompletion(dossier)}%
          </span>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-primary-600 h-full rounded-full transition-all"
              style={{
                width: `${calculateDossierCompletion(dossier)}%`,
              }}
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
          <span className="text-2xl font-black text-slate-900">{aggregatedDocuments.length} Files</span>
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
          {(() => {
            const signatory =
              dossier.step2.keyPersonnel?.find((p) => p.isAuthorizedSignatory) ||
              dossier.step2.keyPersonnel?.[0];
            const displayName = dossier.step1.authorizedName || signatory?.name || 'Authorized Signatory';
            const displayDesignation = dossier.step1.designation || signatory?.designation || 'Director / Authorized Signatory';
            const displayEmail = dossier.step1.email || signatory?.email || 'N/A';
            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px]">Authorized Person</span>
                  <strong className="text-slate-900">{displayName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Designation</span>
                  <span>{displayDesignation}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Corporate Email</span>
                  <span className="font-mono text-[11px]">{displayEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Dual OTP Status</span>
                  <span className="text-emerald-700 font-bold">Email & SMS Verified</span>
                </div>
              </div>
            );
          })()}
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
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <BusinessAvatar
              logoUrl={dossier.step2.logoUrl}
              businessName={dossier.step2.tradeName || dossier.step2.legalName}
              className="size-12 rounded-xl"
              textClassName="text-sm"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-700 flex-1">
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
              {!isStep5Done(dossier) ? (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Action Required
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Completed
                </span>
              )}
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
              <strong className="text-slate-900">{dossier.step5?.bankName || 'Not Configured'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Account Number</span>
              <span className="font-mono">{dossier.step5?.accountNumber || 'Not Configured'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">IFSC Code</span>
              <span className="font-mono">{dossier.step5?.ifscCode || 'Not Configured'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Incoterms</span>
              <span className="font-mono">
                {Array.isArray(dossier.step5?.preferredIncoterms) && dossier.step5.preferredIncoterms.length > 0
                  ? dossier.step5.preferredIncoterms.join(', ')
                  : 'FOB / Standard'}
              </span>
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
              Statutory Verification Document Checklist ({aggregatedDocuments.length} Vaulted)
            </h3>
          </div>
        </div>

        {aggregatedDocuments.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 space-y-2">
            <FileCheck2 className="size-8 mx-auto text-slate-400" />
            <h4 className="text-xs font-bold text-slate-800">No Documents Uploaded Yet</h4>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Documents uploaded across Step 2 (Tax/Incorp), Step 3 (Licence), Step 4 (Certificates), or Step 5 (Bank Proof) will automatically appear here for verification.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3">Document Title</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">File Reference</th>
                    <th className="p-3">Upload Date</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {aggregatedDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <FileText className="size-3.5 text-primary-600 shrink-0" />
                          <span>{doc.name}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold text-primary-800 bg-primary-50 px-2 py-0.5 rounded border border-primary-200 inline-block">
                          {doc.category}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-slate-700 truncate max-w-[200px]" title={doc.fileName}>
                            {doc.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">{doc.uploadDate}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleViewDoc(doc)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-primary-700 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-lg border border-primary-200 transition-colors cursor-pointer"
                            title="Inspect & check document"
                          >
                            <Eye className="size-3.5" />
                            <span>View</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTriggerReplace(doc)}
                            disabled={replacingDocId === doc.id}
                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
                            title="Replace this document"
                          >
                            {replacingDocId === doc.id ? (
                              <span className="size-3.5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <RefreshCw className="size-3.5" />
                            )}
                            <span>{replacingDocId === doc.id ? 'Replacing...' : 'Replace'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
          disabled={isSubmitting || isSubmissionLocked}
          onClick={handleSubmit}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-3 shadow-md text-sm w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Transmitting to Database...
            </>
          ) : isSubmissionLocked ? (
            <>
              <CheckCircle2 className="size-4" />
              {dossier.step6.status === 'Verified' ? 'Verified' : 'Submitted for Verification'}
            </>
          ) : (
            <>
              <Send className="size-4" /> Transmit for Official Verification
            </>
          )}
        </Button>
      </div>

      {/* Hidden File Input for Replace Document */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelected}
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        className="hidden"
      />

      {/* Document Inspection & Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-10 rounded-xl bg-primary-100 text-primary-800 grid place-items-center shrink-0">
                  <FileText className="size-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                    {previewDoc.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-mono text-slate-700">{previewDoc.fileName}</span>
                    <span>•</span>
                    <span className="text-primary-700 font-semibold">{previewDoc.category}</span>
                    <span>•</span>
                    <span>{previewDoc.uploadDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleTriggerReplace(previewDoc);
                  }}
                  className="text-xs h-8 text-slate-700 border-slate-300 hover:bg-slate-100 font-bold flex items-center gap-1.5"
                >
                  <RefreshCw className="size-3.5" />
                  <span>Replace</span>
                </Button>

                <a
                  href={previewDoc.fullUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 h-8 px-3 rounded-lg shadow-2xs"
                >
                  <ExternalLink className="size-3.5" />
                  <span>Open Full Tab</span>
                </a>

                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="size-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 grid place-items-center transition-colors cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Modal Body Preview */}
            <div className="p-4 flex-1 overflow-auto bg-slate-100/60 min-h-[440px] flex items-center justify-center">
              {previewDoc.fileName.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={previewDoc.fullUrl}
                  title={previewDoc.name}
                  className="w-full h-[540px] rounded-xl border border-slate-200 bg-white shadow-xs"
                />
              ) : (
                <div className="max-w-full max-h-[540px] flex items-center justify-center">
                  <img
                    src={previewDoc.fullUrl}
                    alt={previewDoc.name}
                    className="max-h-[540px] max-w-full rounded-xl object-contain shadow-md border border-slate-200 bg-white"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
