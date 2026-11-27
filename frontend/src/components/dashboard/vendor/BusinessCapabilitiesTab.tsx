'use client';

import React from 'react';
import { Step3BusinessData } from '@/types/vendorRegistration';
import {
  BUSINESS_TYPES,
  VENDOR_CATEGORIES,
} from '@/config/vendorMasterData';
import { Card } from '@/components/ui/Card';
import { resolveBackendDocumentUrl } from '@/lib/verificationBadge';
import {
  Layers,
  Factory,
  Cpu,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  FileText,
  ExternalLink,
} from 'lucide-react';

interface BusinessCapabilitiesTabProps {
  data: Step3BusinessData;
}

export function BusinessCapabilitiesTab({ data }: BusinessCapabilitiesTabProps) {
  // Map selected BT codes to full objects
  const activeBusinessTypes = BUSINESS_TYPES.filter((bt) =>
    data.businessTypeCodes.includes(bt.code)
  );

  // Map selected Category IDs to objects
  const activeCategories = VENDOR_CATEGORIES.filter((cat) =>
    data.selectedCategoryIds.includes(cat.id)
  );

  return (
    <div className="space-y-6">
      {/* 1. Business Type Master List (BT01 - BT14) */}
      <Card variant="bento" className="p-6 bg-white space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Layers className="size-5 text-primary-700" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Registered Business Types ({activeBusinessTypes.length})
            </h3>
            <p className="text-xs text-slate-500">
              Official classification under BITAINTEL vendor taxonomy (BT01–BT14)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {BUSINESS_TYPES.map((bt) => {
            const isSelected = data.businessTypeCodes.includes(bt.code);
            return (
              <div
                key={bt.code}
                className={`p-3 rounded-xl border text-xs transition-all ${
                  isSelected
                    ? 'border-primary-400 bg-primary-50/80 text-primary-950 font-bold shadow-2xs'
                    : 'border-slate-200 bg-slate-50/50 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-500">{bt.code}</span>
                  {isSelected && <CheckCircle2 className="size-3.5 text-primary-600" />}
                </div>
                <span className="mt-1 block truncate">{bt.name}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 2. 20 Main Categories & 240 Subcategories */}
      <Card variant="bento" className="p-6 bg-white space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Cpu className="size-5 text-primary-700" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              BITAINTEL 20 Main Categories & 240 Dynamic Subcategories
            </h3>
            <p className="text-xs text-slate-500">
              Primary industries and specific capability subcategory nodes
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {activeCategories.map((cat) => {
            const activeSubs = cat.subcategories.filter((s) =>
              data.selectedSubcategoryIds.includes(s.id)
            );

            return (
              <div key={cat.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary-700 bg-white px-2 py-0.5 rounded border border-primary-200">
                      {cat.id}
                    </span>
                    <h4 className="text-xs font-black text-slate-900">{cat.name}</h4>
                  </div>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    {activeSubs.length} of {cat.subcategories.length} subcategories active
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeSubs.map((sub) => (
                    <span
                      key={sub.id}
                      className="px-2.5 py-1 rounded-lg bg-white border border-primary-300 text-primary-950 font-bold text-[11px] shadow-2xs flex items-center gap-1"
                    >
                      <span className="font-mono text-[9px] text-slate-400">{sub.id}</span>
                      {sub.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 3. Manufacturing Infrastructure & Operational Profile */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="bento" className="p-6 bg-white space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Factory className="size-5 text-primary-700" />
            <h3 className="text-sm font-bold text-slate-900">Manufacturing Capabilities</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">Processes & Technology</span>
              <p className="font-medium text-slate-800 mt-0.5 leading-relaxed">
                {data.manufacturingProcesses || '5-Axis CNC Milling, Precision Welding, Heat Treatment'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">Machinery & Installed Units</span>
              <p className="font-medium text-slate-800 mt-0.5 leading-relaxed">
                {data.machineryEquipment || 'Mazak Variaxis 5-Axis (4 units), KUKA Welding Robots, 1500T Stamping'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] font-semibold">Installed Capacity</span>
                <span className="font-bold text-slate-900">{data.installedCapacity || '4,500 MT / Month'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] font-semibold">Available Spare Capacity</span>
                <span className="font-bold text-emerald-700">{data.availableCapacity || '1,200 MT / Month'}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 text-[11px] font-semibold">
              {data.hasRdLab && (
                <span className="px-2 py-0.5 rounded bg-primary-50 text-primary-800 border border-primary-200">
                  ✓ In-House R&D Laboratory
                </span>
              )}
              {data.hasQcLab && (
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  ✓ Metrology & QC Inspection Lab
                </span>
              )}
              {data.offersCustomDevelopment && (
                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                  ✓ Custom Engineering & Prototyping
                </span>
              )}
            </div>
          </div>
        </Card>

        <Card variant="bento" className="p-6 bg-white space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <TrendingUp className="size-5 text-primary-700" />
            <h3 className="text-sm font-bold text-slate-900">Operating Profile & Scale</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-semibold">Years in Business</span>
              <span className="text-xl font-black text-slate-900">{data.yearsInBusiness} Years</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-semibold">Annual Turnover Range</span>
              <span className="text-sm font-black text-slate-900">{data.annualTurnoverRange}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-semibold">Operating Facilities</span>
              <span className="text-xl font-black text-slate-900">{data.numberOfFacilities} Units</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-semibold">Total Workforce</span>
              <span className="text-xl font-black text-slate-900">{data.totalWorkforce} Staff</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block font-semibold mb-1">
              Permitted Business Activities
            </span>
            <div className="flex flex-wrap gap-1.5">
              {data.businessActivities.map((act) => (
                <span
                  key={act}
                  className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]"
                >
                  {act}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* 3b. Service Capabilities & Geographic Delivery */}
      {(data.serviceTypes ||
        data.serviceExpertise ||
        data.geographicCoverage ||
        data.serviceEquipment ||
        data.deliveryCapacity) && (
        <Card variant="bento" className="p-6 bg-white space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <TrendingUp className="size-5 text-indigo-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Service Capabilities &amp; Geographic Delivery
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-semibold">Service Types</span>
              <span className="font-bold text-slate-900">{data.serviceTypes || '—'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-semibold">Service Expertise</span>
              <span className="font-bold text-slate-900">{data.serviceExpertise || '—'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-semibold">Geographic Coverage</span>
              <span className="font-bold text-slate-900">{data.geographicCoverage || '—'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-semibold">
                Equipment &amp; Field Tools
              </span>
              <span className="font-bold text-slate-900">{data.serviceEquipment || '—'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 sm:col-span-2 lg:col-span-2">
              <span className="text-[10px] text-slate-400 block font-semibold">
                Delivery Capacity &amp; SLA
              </span>
              <span className="font-bold text-slate-900">{data.deliveryCapacity || '—'}</span>
            </div>
          </div>
        </Card>
      )}

      {/* 4. Regulatory Approvals, Licences & Filings */}
      {(data.regulatoryFilingDetails ||
        data.regulatoryApprovalDoc ||
        data.technicalAuditDoc) && (
        <Card variant="bento" className="p-6 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary-700" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Regulatory Approvals, Manufacturing Licences &amp; Filings
                </h3>
                <p className="text-xs text-slate-500">
                  Compliance evidence (DMF/USDMF, CEP, and manufacturing operating licences)
                </p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Provided
            </span>
          </div>

          {data.regulatoryFilingDetails && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Regulatory Filing Details &amp; Reference Numbers
              </span>
              <p className="font-medium text-slate-800 whitespace-pre-line">
                {data.regulatoryFilingDetails}
              </p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3 text-xs">
            {[
              {
                label: 'Regulatory Approvals / Manufacturing Licence',
                path: data.regulatoryApprovalDoc,
              },
              {
                label: 'Technical Audit Report',
                path: data.technicalAuditDoc,
              },
            ]
              .filter((doc) => Boolean(doc.path))
              .map((doc) => {
                const url = resolveBackendDocumentUrl(doc.path);
                const filename = doc.path!.split('/').pop() || doc.path!.split('\\').pop() || 'Document';
                return (
                  <div
                    key={doc.label}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        {doc.label}
                      </span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5 truncate">
                        <FileText className="size-3.5 text-primary-700 shrink-0" />
                        <span className="truncate">{filename}</span>
                      </span>
                    </div>
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-primary-700 hover:bg-primary-50 font-bold text-[11px] shrink-0"
                      >
                        <ExternalLink className="size-3" /> View
                      </a>
                    )}
                  </div>
                );
              })}
          </div>
        </Card>
      )}
    </div>
  );
}
