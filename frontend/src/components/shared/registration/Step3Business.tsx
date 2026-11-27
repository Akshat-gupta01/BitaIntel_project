/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useMemo, useState } from 'react';
import { Step3BusinessData } from '@/types/vendorRegistration';
import * as vendorService from '../../../../services/vendor.service';
import {
  BUSINESS_TYPES,
  VENDOR_CATEGORIES,
  BUSINESS_ACTIVITIES,
} from '@/config/vendorMasterData';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { resolveBackendDocumentUrl } from '@/lib/verificationBadge';
import {
  Layers,
  Factory,
  Briefcase,
  Check,
  Cpu,
  UploadCloud,
  ShieldCheck,
  Trash2,
  Plus,
  Pencil,
  FileCheck,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const REGULATORY_APPROVAL_TYPES = [
  'DMF / USDMF Filing',
  'CEP (Certificate of Suitability)',
  'Manufacturing Licence (Drug / API / Factory)',
  'WHO-GMP / EU-GMP Compliance',
  'CDSCO / USFDA / Regulatory Filing',
  'Other Regulatory Approval',
];

interface RegulatoryDraft {
  approvalType: string;
  referenceNumber: string;
  issuingAuthority: string;
  applicableScope: string;
}

function parseRegulatoryDetails(raw?: string): RegulatoryDraft {
  const fallback: RegulatoryDraft = {
    approvalType: REGULATORY_APPROVAL_TYPES[0],
    referenceNumber: '',
    issuingAuthority: '',
    applicableScope: 'All Facilities',
  };
  if (!raw || !raw.trim()) return fallback;

  const text = raw.trim();
  const typeMatch = REGULATORY_APPROVAL_TYPES.find((t) => text.startsWith(t));
  const refMatch = text.match(/Ref:\s*([^|•\n]+)/i);
  const authMatch = text.match(/Authority:\s*([^|•\n]+)/i);
  const scopeMatch = text.match(/Scope:\s*([^|•\n]+)/i);

  if (typeMatch || refMatch || authMatch || scopeMatch) {
    return {
      approvalType: typeMatch || REGULATORY_APPROVAL_TYPES[0],
      referenceNumber: refMatch?.[1]?.trim() || (!typeMatch ? text : ''),
      issuingAuthority: authMatch?.[1]?.trim() || '',
      applicableScope: scopeMatch?.[1]?.trim() || 'All Facilities',
    };
  }

  return {
    ...fallback,
    referenceNumber: text,
  };
}

interface Step3BusinessProps {
  data: Step3BusinessData;
  onChange: (updated: Partial<Step3BusinessData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Step3Business({ data, onChange, onNext, onPrev }: Step3BusinessProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingDocField, setUploadingDocField] = useState<
    'regulatoryApprovalDoc' | 'technicalAuditDoc' | null
  >(null);
  const [showRegulatoryForm, setShowRegulatoryForm] = useState(false);
  const [isEditingRegulatory, setIsEditingRegulatory] = useState(false);
  const [regDraft, setRegDraft] = useState<RegulatoryDraft>(() =>
    parseRegulatoryDetails(data.regulatoryFilingDetails)
  );

  const hasSavedRegulatoryRecord = Boolean(
    data.regulatoryFilingDetails?.trim() ||
      data.regulatoryApprovalDoc ||
      data.technicalAuditDoc
  );

  function handleOpenNewRegulatoryForm() {
    setIsEditingRegulatory(false);
    setRegDraft(parseRegulatoryDetails(data.regulatoryFilingDetails));
    setShowRegulatoryForm(true);
  }

  function handleStartEditRegulatory() {
    setIsEditingRegulatory(true);
    setRegDraft(parseRegulatoryDetails(data.regulatoryFilingDetails));
    setShowRegulatoryForm(true);
  }

  function handleCancelRegulatoryForm() {
    setIsEditingRegulatory(false);
    setShowRegulatoryForm(false);
  }

  function formatRegulatoryDraft(): string {
    const parts: string[] = [];
    if (regDraft.referenceNumber.trim()) {
      parts.push(`Ref: ${regDraft.referenceNumber.trim()}`);
    }
    if (regDraft.issuingAuthority.trim()) {
      parts.push(`Authority: ${regDraft.issuingAuthority.trim()}`);
    }
    if (regDraft.applicableScope.trim() && regDraft.applicableScope.trim() !== 'All Facilities') {
      parts.push(`Scope: ${regDraft.applicableScope.trim()}`);
    } else if (regDraft.referenceNumber.trim() || regDraft.issuingAuthority.trim()) {
      parts.push(`Scope: ${regDraft.applicableScope.trim() || 'All Facilities'}`);
    }

    return parts.length > 0
      ? `${regDraft.approvalType} • ${parts.join(' | ')}`
      : data.regulatoryApprovalDoc || data.technicalAuditDoc
      ? regDraft.approvalType
      : '';
  }

  function buildCapabilitiesPayload(regulatoryDetails: string | null) {
    return {
      businessTypeCodes: data.businessTypeCodes,
      selectedCategoryIds: data.selectedCategoryIds,
      selectedSubcategoryIds: data.selectedSubcategoryIds,
      businessActivities: data.businessActivities || [],
      manufacturingProcesses: data.manufacturingProcesses || null,
      machineryEquipment: data.machineryEquipment || null,
      installedCapacity: data.installedCapacity || null,
      availableCapacity: data.availableCapacity || null,
      hasRdLab: Boolean(data.hasRdLab),
      hasQcLab: Boolean(data.hasQcLab),
      offersCustomDevelopment: Boolean(data.offersCustomDevelopment),
      serviceTypes: data.serviceTypes || null,
      serviceExpertise: data.serviceExpertise || null,
      geographicCoverage: data.geographicCoverage || null,
      serviceEquipment: data.serviceEquipment || null,
      deliveryCapacity: data.deliveryCapacity || null,
      yearsInBusiness: data.yearsInBusiness || null,
      numberOfFacilities: data.numberOfFacilities || null,
      annualTurnoverRange: data.annualTurnoverRange || null,
      totalWorkforce: data.totalWorkforce || null,
      facilityPhotos: data.facilityPhotos || null,
      technicalAuditDoc: data.technicalAuditDoc || null,
      regulatoryApprovalDoc: data.regulatoryApprovalDoc || null,
      regulatoryFilingDetails: regulatoryDetails,
    };
  }

  async function handleSaveRegulatoryRecord() {
    const formattedDetails = formatRegulatoryDraft();

    if (!formattedDetails && !data.regulatoryApprovalDoc && !data.technicalAuditDoc) {
      toast.error('Please enter filing/licence details or upload a supporting document.');
      return;
    }

    onChange({ regulatoryFilingDetails: formattedDetails });
    setShowRegulatoryForm(false);
    setIsEditingRegulatory(false);

    if (
      data.businessTypeCodes.length > 0 &&
      data.selectedCategoryIds.length > 0 &&
      data.selectedSubcategoryIds.length > 0
    ) {
      try {
        await vendorService.saveCapabilities(buildCapabilitiesPayload(formattedDetails || null));
      } catch (err) {
        console.warn('Background regulatory save deferred until Save & Continue:', err);
      }
    }

    toast.success(
      isEditingRegulatory ? 'Regulatory Record Updated' : 'Regulatory Record Added',
      { description: formattedDetails || 'Attached document linked to Step 3.' }
    );
  }

  function handleRemoveRegulatoryRecord() {
    onChange({
      regulatoryFilingDetails: '',
      regulatoryApprovalDoc: '',
      technicalAuditDoc: '',
    });
    setRegDraft({
      approvalType: REGULATORY_APPROVAL_TYPES[0],
      referenceNumber: '',
      issuingAuthority: '',
      applicableScope: 'All Facilities',
    });
    toast.info('Regulatory record cleared.');
  }

  async function handleUploadOptionalDoc(
    file: File,
    docField: 'regulatoryApprovalDoc' | 'technicalAuditDoc',
    categoryKey: string,
    categoryName: string
  ) {
    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size exceeds 15 MB limit');
      return;
    }

    setUploadingDocField(docField);
    try {
      const res: any = await vendorService.uploadStatutoryDocument(
        file,
        categoryKey,
        categoryName,
        'Module C'
      );
      const uploadedUrl =
        res?.data?.document?.fileUrl ||
        res?.data?.url ||
        res?.data?.path ||
        res?.document?.fileUrl ||
        res?.data?.fileUrl;
      if (!uploadedUrl) {
        throw new Error('Server did not return uploaded document URL.');
      }
      onChange({ [docField]: uploadedUrl });
      toast.success(`${categoryName} Uploaded`, {
        description: `${file.name} saved to your compliance document vault.`,
      });
    } catch (err: any) {
      toast.error('Document Upload Failed', {
        description: err?.response?.data?.message || err?.message || 'Could not upload file.',
      });
    } finally {
      setUploadingDocField(null);
    }
  }

  // Check if manufacturing capability should conditionally render
  const isManufacturingSelected = useMemo(() => {
    return (
      data.businessTypeCodes.some((code) => ['BT01', 'BT02', 'BT03'].includes(code)) ||
      data.businessActivities.some((act) =>
        ['Manufacturing', 'Contract Manufacturing', 'Private Label'].includes(act)
      )
    );
  }, [data.businessTypeCodes, data.businessActivities]);

  // Dynamically compute available subcategories based on selected category IDs
  const availableSubcategories = useMemo(() => {
    if (!data.selectedCategoryIds.length) return [];
    return VENDOR_CATEGORIES.filter((cat) => data.selectedCategoryIds.includes(cat.id)).flatMap(
      (cat) =>
        cat.subcategories.map((sub) => ({
          ...sub,
          parentCategoryName: cat.name,
        }))
    );
  }, [data.selectedCategoryIds]);

  // Toggle Business Type (BT01 - BT14)
  function toggleBusinessType(code: string) {
    const exists = data.businessTypeCodes.includes(code);
    const updated = exists
      ? data.businessTypeCodes.filter((c) => c !== code)
      : [...data.businessTypeCodes, code];
    onChange({ businessTypeCodes: updated });
  }

  // Toggle Category (CAT001 - CAT020)
  function toggleCategory(catId: string) {
    const exists = data.selectedCategoryIds.includes(catId);
    let updatedCats: string[];
    let updatedSubcats = [...data.selectedSubcategoryIds];

    if (exists) {
      updatedCats = data.selectedCategoryIds.filter((c) => c !== catId);
      // Remove subcategories belonging to this removed category
      const removedCat = VENDOR_CATEGORIES.find((c) => c.id === catId);
      if (removedCat) {
        const removedSubIds = removedCat.subcategories.map((s) => s.id);
        updatedSubcats = updatedSubcats.filter((subId) => !removedSubIds.includes(subId));
      }
    } else {
      updatedCats = [...data.selectedCategoryIds, catId];
    }

    onChange({
      selectedCategoryIds: updatedCats,
      selectedSubcategoryIds: updatedSubcats,
    });
  }

  // Toggle Subcategory
  function toggleSubcategory(subId: string) {
    const exists = data.selectedSubcategoryIds.includes(subId);
    const updated = exists
      ? data.selectedSubcategoryIds.filter((s) => s !== subId)
      : [...data.selectedSubcategoryIds, subId];
    onChange({ selectedSubcategoryIds: updated });
  }

  // Toggle Business Activity
  function toggleActivity(act: string) {
    const exists = data.businessActivities.includes(act);
    const updated = exists
      ? data.businessActivities.filter((a) => a !== act)
      : [...data.businessActivities, act];
    onChange({ businessActivities: updated });
  }

  async function handleProceed() {
    if (!data.businessTypeCodes.length) {
      toast.error('Please select at least one Business Type (e.g. Manufacturer, Trader).');
      return;
    }
    if (!data.selectedCategoryIds.length) {
      toast.error('Please select at least one BITAINTEL Industry Category.');
      return;
    }
    if (!data.selectedSubcategoryIds.length) {
      toast.error('Please select at least one relevant Subcategory.');
      return;
    }

    const syncedRegulatoryDetails = showRegulatoryForm
      ? formatRegulatoryDraft() || data.regulatoryFilingDetails || null
      : data.regulatoryFilingDetails || null;

    if (showRegulatoryForm && syncedRegulatoryDetails && syncedRegulatoryDetails !== data.regulatoryFilingDetails) {
      onChange({ regulatoryFilingDetails: syncedRegulatoryDetails });
    }

    setIsSaving(true);
    try {
      await vendorService.saveCapabilities(buildCapabilitiesPayload(syncedRegulatoryDetails));

      toast.success('Business Capabilities Saved to Database', {
        description: 'Business classification, categories, and operational capabilities stored in database.',
      });
      // Advance to next step only on successful save
      onNext();
    } catch (err: any) {
      console.error('Backend capabilities save error:', err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Could not save business capabilities to database.';
      toast.error('Database Save Failed', {
        description: errMsg,
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="border-b border-slate-200/80 pb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-200">
          Step 3 of 6
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
          Business Classification & Capabilities
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Select your business model, primary categories, dynamically filtered subcategories, and operational capacities.
        </p>
      </div>

      {/* 1. Business Type Selection (BT01 - BT14) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-primary-700" />
            <h3 className="text-sm font-bold text-slate-900">
              1. Business Type Master Selection (Select All That Apply) <span className="text-rose-500">*</span>
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold">
            {data.businessTypeCodes.length} selected
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {BUSINESS_TYPES.map((bt) => {
            const isSelected = data.businessTypeCodes.includes(bt.code);
            return (
              <button
                key={bt.code}
                type="button"
                onClick={() => toggleBusinessType(bt.code)}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all text-xs font-semibold ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50/80 text-primary-900 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="truncate">
                  <span className="text-[10px] font-mono text-slate-400 block">{bt.code}</span>
                  <span className="truncate">{bt.name}</span>
                </div>
                {isSelected && <Check className="size-4 text-primary-600 shrink-0 ml-1.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. 20 Main Vendor Categories Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Factory className="size-4 text-primary-700" />
            <h3 className="text-sm font-bold text-slate-900">
              2. BITAINTEL 20 Main Categories <span className="text-rose-500">*</span>
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold">
            {data.selectedCategoryIds.length} categories chosen
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {VENDOR_CATEGORIES.map((cat) => {
            const isSelected = data.selectedCategoryIds.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all text-xs font-semibold ${
                  isSelected
                    ? 'border-primary-600 bg-primary-50/90 text-primary-950 ring-1 ring-primary-500 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block">{cat.id}</span>
                  <span>{cat.name}</span>
                </div>
                {isSelected && <Check className="size-4 text-primary-600 shrink-0 ml-1.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Dynamically Filtered Subcategories (from the 240 master entries) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Cpu className="size-4 text-primary-700" />
            <h3 className="text-sm font-bold text-slate-900">
              3. Dynamic Subcategory Specializations <span className="text-rose-500">*</span>
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold">
            {data.selectedSubcategoryIds.length} subcategories active
          </span>
        </div>

        {availableSubcategories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-slate-400 text-xs">
            Please select at least one main category above to populate dynamic subcategories.
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-4">
            {data.selectedCategoryIds.map((catId) => {
              const cat = VENDOR_CATEGORIES.find((c) => c.id === catId);
              if (!cat) return null;
              return (
                <div key={cat.id} className="space-y-2">
                  <h4 className="text-xs font-black text-primary-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-primary-600"></span>
                    {cat.name} ({cat.id})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {cat.subcategories.map((sub) => {
                      const isSubSelected = data.selectedSubcategoryIds.includes(sub.id);
                      return (
                        <label
                          key={sub.id}
                          className={`flex items-start gap-2 p-2 rounded-md border cursor-pointer text-xs transition-colors ${
                            isSubSelected
                              ? 'bg-white border-primary-400 text-primary-950 font-bold shadow-2xs'
                              : 'bg-white/80 border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <Checkbox
                            checked={isSubSelected}
                            onChange={() => toggleSubcategory(sub.id)}
                            className="mt-0.5"
                          />
                          <span className="leading-tight text-[11px]">
                            <span className="font-mono text-[9px] text-slate-400 mr-1">{sub.id}</span>
                            {sub.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Business Activities */}
      <div className="space-y-3">
        <div className="border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-900">4. Business Activities</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {BUSINESS_ACTIVITIES.map((act) => {
            const isAct = data.businessActivities.includes(act);
            return (
              <label
                key={act}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer font-semibold ${
                  isAct ? 'bg-primary-50/80 border-primary-400 text-primary-900' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <Checkbox checked={isAct} onChange={() => toggleActivity(act)} />
                <span>{act}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 5. Conditional Capabilities: Manufacturing vs Service */}
      {isManufacturingSelected && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Factory className="size-4 text-amber-700" />
            <h3 className="text-sm font-bold text-amber-950">
              Manufacturing Capabilities & Technical Infrastructure
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Core Production Processes & Technology
              </label>
              <textarea
                rows={2}
                value={data.manufacturingProcesses || ''}
                onChange={(e) => onChange({ manufacturingProcesses: e.target.value })}
                placeholder="e.g. 5-Axis CNC Milling, Robotic MIG/TIG Welding, Heat Treatment, Clean Room Packing..."
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Major Machinery & Installed Equipment
              </label>
              <textarea
                rows={2}
                value={data.machineryEquipment || ''}
                onChange={(e) => onChange({ machineryEquipment: e.target.value })}
                placeholder="e.g. Mazak CNCs, KUKA Robots, 1500T Stamping Press, Laser Cutters..."
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Installed Capacity</label>
              <Input
                value={data.installedCapacity || ''}
                onChange={(e) => onChange({ installedCapacity: e.target.value })}
                placeholder="e.g. 5,000 MT / Month or 25,000 Units / Month"
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Available / Spare Capacity</label>
              <Input
                value={data.availableCapacity || ''}
                onChange={(e) => onChange({ availableCapacity: e.target.value })}
                placeholder="e.g. 1,500 MT / Month available for new contracts"
                className="text-xs"
              />
            </div>

            <div className="sm:col-span-2 flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <Checkbox
                  checked={!!data.hasRdLab}
                  onChange={(e) => onChange({ hasRdLab: e.target.checked })}
                />
                In-house R&D / Laboratory
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <Checkbox
                  checked={!!data.hasQcLab}
                  onChange={(e) => onChange({ hasQcLab: e.target.checked })}
                />
                QC / QA Metrology Lab
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <Checkbox
                  checked={!!data.offersCustomDevelopment}
                  onChange={(e) => onChange({ offersCustomDevelopment: e.target.checked })}
                />
                Custom Product Engineering & Prototyping
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 4b. Service Capabilities & Geographic Delivery (Always visible) */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Briefcase className="size-4 text-indigo-700" />
          <div>
            <h3 className="text-sm font-bold text-indigo-950">
              Service Capabilities &amp; Geographic Delivery
            </h3>
            <p className="text-[11px] text-indigo-800/80">
              Specify service types, specialized expertise, geographic coverage, field equipment, and delivery SLA.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Service Types</label>
            <Input
              value={data.serviceTypes || ''}
              onChange={(e) => onChange({ serviceTypes: e.target.value })}
              placeholder="e.g. AMC, Turnkey Installation, Testing & Calibration, Consulting"
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Service Expertise</label>
            <Input
              value={data.serviceExpertise || ''}
              onChange={(e) => onChange({ serviceExpertise: e.target.value })}
              placeholder="e.g. Industrial Automation Consulting & Calibration"
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Geographic Coverage</label>
            <Input
              value={data.geographicCoverage || ''}
              onChange={(e) => onChange({ geographicCoverage: e.target.value })}
              placeholder="e.g. Pan-India, Middle East, Southeast Asia"
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Equipment &amp; Field Tools
            </label>
            <Input
              value={data.serviceEquipment || ''}
              onChange={(e) => onChange({ serviceEquipment: e.target.value })}
              placeholder="e.g. Fluke Calibration Kits, PLC Diagnostic Rigs, NDT Scanners"
              className="text-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Delivery Capacity &amp; SLA
            </label>
            <Input
              value={data.deliveryCapacity || ''}
              onChange={(e) => onChange({ deliveryCapacity: e.target.value })}
              placeholder="e.g. 50+ on-site deployment engineers, 24/7 SLA"
              className="text-xs"
            />
          </div>
        </div>
      </div>

      {/* 5. Regulatory Approvals, Licences & Filings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary-700" />
            <h3 className="text-sm font-bold text-slate-900">
              5. Regulatory Approvals, Manufacturing Licences &amp; Filings ({hasSavedRegulatoryRecord ? 1 : 0})
            </h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              showRegulatoryForm ? handleCancelRegulatoryForm() : handleOpenNewRegulatoryForm()
            }
            className="text-xs border-primary-300 text-primary-700 hover:bg-primary-50"
          >
            <Plus className="size-3.5 mr-1" /> Add Regulatory Record
          </Button>
        </div>

        {/* Dynamic Add / Edit Regulatory Record Form (matches Step 4 Card UI) */}
        {showRegulatoryForm && (
          <div className="rounded-xl border border-primary-200 bg-primary-50/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-primary-950 flex items-center gap-1.5">
                {isEditingRegulatory ? (
                  <>
                    <Pencil className="size-3.5 text-primary-700" />
                    Edit Regulatory Approval &amp; Licence Record
                  </>
                ) : (
                  'Add Regulatory Approval & Licence Record'
                )}
              </h4>
              <button
                type="button"
                onClick={handleCancelRegulatoryForm}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Approval / Filing Standard
                </label>
                <Select
                  value={regDraft.approvalType}
                  onChange={(e) => setRegDraft({ ...regDraft, approvalType: e.target.value })}
                  options={REGULATORY_APPROVAL_TYPES.map((t) => ({ value: t, label: t }))}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Filing / Licence Number
                </label>
                <Input
                  value={regDraft.referenceNumber}
                  onChange={(e) => setRegDraft({ ...regDraft, referenceNumber: e.target.value })}
                  placeholder="e.g. USDMF #034921 / MH-1024 / CEP-2026"
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Issuing Authority / Agency
                </label>
                <Input
                  value={regDraft.issuingAuthority}
                  onChange={(e) => setRegDraft({ ...regDraft, issuingAuthority: e.target.value })}
                  placeholder="e.g. USFDA / EDQM / CDSCO / State FDA"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Applicable Facility / Scope
                </label>
                <Input
                  value={regDraft.applicableScope}
                  onChange={(e) => setRegDraft({ ...regDraft, applicableScope: e.target.value })}
                  placeholder="All Facilities"
                  className="text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Regulatory / Manufacturing Licence Document — DMF / USDMF, CEP (PDF / JPG)
                </label>
                {(() => {
                  const currentPath = data.regulatoryApprovalDoc || '';
                  const previewUrl = resolveBackendDocumentUrl(currentPath);
                  const isUploading = uploadingDocField === 'regulatoryApprovalDoc';
                  const currentFileName = currentPath
                    ? currentPath.split('/').pop() || currentPath.split('\\').pop() || 'Attached Document'
                    : '';

                  return currentPath ? (
                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-300 bg-emerald-50/70">
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="size-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-semibold text-emerald-900 truncate" title={currentFileName}>
                          {currentFileName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {previewUrl && (
                          <a
                            href={previewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-bold text-primary-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <ExternalLink className="size-3" /> View
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => onChange({ regulatoryApprovalDoc: '' })}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          title="Remove Document"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-slate-300 hover:border-primary-400 bg-white hover:bg-primary-50/40 text-xs font-medium text-slate-600 hover:text-primary-700 transition-colors cursor-pointer">
                      {isUploading ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin text-primary-700" />
                          <span>Uploading Document...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="size-4 text-primary-600" />
                          <span>Upload Regulatory / Licence Proof (PDF / JPG / PNG, Max 15 MB)</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
                        disabled={uploadingDocField !== null}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          if (file) {
                            handleUploadOptionalDoc(
                              file,
                              'regulatoryApprovalDoc',
                              'regulatory_approval_dmf',
                              'Regulatory Approvals & Manufacturing Licences (DMF / USDMF, CEP)'
                            );
                          }
                        }}
                      />
                    </label>
                  );
                })()}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Technical Audit &amp; Inspection Report (PDF / JPG)
                </label>
                {(() => {
                  const techPath = data.technicalAuditDoc || '';
                  const techPreviewUrl = resolveBackendDocumentUrl(techPath);
                  const isUploadingTech = uploadingDocField === 'technicalAuditDoc';
                  const techFileName = techPath
                    ? techPath.split('/').pop() || techPath.split('\\').pop() || 'Technical_Audit_Report.pdf'
                    : '';

                  return techPath ? (
                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-300 bg-emerald-50/70">
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="size-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-semibold text-emerald-900 truncate" title={techFileName}>
                          {techFileName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {techPreviewUrl && (
                          <a
                            href={techPreviewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-bold text-primary-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <ExternalLink className="size-3" /> View
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => onChange({ technicalAuditDoc: '' })}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          title="Remove Technical Document"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-slate-300 hover:border-primary-400 bg-white hover:bg-primary-50/40 text-xs font-medium text-slate-600 hover:text-primary-700 transition-colors cursor-pointer">
                      {isUploadingTech ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin text-primary-700" />
                          <span>Uploading Technical Document...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="size-4 text-primary-600" />
                          <span>Upload Technical Audit / Inspection PDF (PDF / JPG / PNG, Max 15 MB)</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
                        disabled={uploadingDocField !== null}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          if (file) {
                            handleUploadOptionalDoc(
                              file,
                              'technicalAuditDoc',
                              'technical_audit',
                              'Technical Audit & Inspection Report'
                            );
                          }
                        }}
                      />
                    </label>
                  );
                })()}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {isEditingRegulatory && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancelRegulatoryForm}
                  className="text-xs"
                >
                  Cancel Edit
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                onClick={handleSaveRegulatoryRecord}
                className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold"
              >
                {isEditingRegulatory ? 'Update Regulatory Record' : 'Save Regulatory Record'}
              </Button>
            </div>
          </div>
        )}

        {/* Saved Regulatory Record Summary Card */}
        {hasSavedRegulatoryRecord && (
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex items-start justify-between gap-3 shadow-xs hover:border-slate-300 transition-colors">
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {parseRegulatoryDetails(data.regulatoryFilingDetails).approvalType}
                </span>
              </div>
              {data.regulatoryFilingDetails && (
                <p className="text-xs font-medium text-slate-800 whitespace-pre-line">
                  {data.regulatoryFilingDetails}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {data.regulatoryApprovalDoc && resolveBackendDocumentUrl(data.regulatoryApprovalDoc) && (
                  <a
                    href={resolveBackendDocumentUrl(data.regulatoryApprovalDoc)!}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-700 hover:underline bg-primary-50 px-2 py-0.5 rounded border border-primary-200"
                  >
                    <FileCheck className="size-3" /> Regulatory / Manufacturing Licence PDF <ExternalLink className="size-2.5" />
                  </a>
                )}
                {data.technicalAuditDoc && resolveBackendDocumentUrl(data.technicalAuditDoc) && (
                  <a
                    href={resolveBackendDocumentUrl(data.technicalAuditDoc)!}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-700 hover:underline bg-primary-50 px-2 py-0.5 rounded border border-primary-200"
                  >
                    <FileCheck className="size-3" /> Technical Audit Report PDF <ExternalLink className="size-2.5" />
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleStartEditRegulatory}
                className="text-slate-400 hover:text-primary-700 hover:bg-primary-50 transition-colors p-1 rounded cursor-pointer"
                title="Edit Regulatory Record"
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={handleRemoveRegulatoryRecord}
                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors p-1 rounded cursor-pointer"
                title="Remove Regulatory Record"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. Operating Profile & Turnover */}
      <div className="space-y-4">
        <div className="border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-900">6. Operating Profile & Turnover</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Years in Business</label>
            <Input
              value={data.yearsInBusiness}
              onChange={(e) => onChange({ yearsInBusiness: e.target.value })}
              placeholder="e.g. 15"
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Number of Facilities</label>
            <Input
              value={data.numberOfFacilities}
              onChange={(e) => onChange({ numberOfFacilities: e.target.value })}
              placeholder="e.g. 3"
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Annual Turnover Range</label>
            <Select
              value={data.annualTurnoverRange}
              onChange={(e) => onChange({ annualTurnoverRange: e.target.value })}
              options={[
                { value: 'Under ₹5 crore', label: 'Under ₹5 crore' },
                { value: '₹5–25 crore', label: '₹5–25 crore' },
                { value: '₹25–50 crore', label: '₹25–50 crore' },
                { value: '₹50–100 crore', label: '₹50–100 crore' },
                { value: '₹100–500 crore', label: '₹100–500 crore' },
                { value: '₹500+ crore', label: '₹500+ crore' },
              ]}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Total Workforce</label>
            <Input
              value={data.totalWorkforce}
              onChange={(e) => onChange({ totalWorkforce: e.target.value })}
              placeholder="e.g. 240"
              className="text-xs"
            />
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          className="text-xs font-bold text-slate-700"
        >
          Previous Step
        </Button>
        <Button
          type="button"
          onClick={handleProceed}
          disabled={isSaving}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-2.5 shadow-sm text-xs"
        >
          {isSaving ? 'Saving Capabilities...' : 'Save & Continue to Products & Quality'}
        </Button>
      </div>
    </div>
  );
}
