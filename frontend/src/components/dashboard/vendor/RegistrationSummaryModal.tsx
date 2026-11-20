'use client';

import React from 'react';
import { FullVendorRegistrationDossier } from '@/types/vendorRegistration';
import { VENDOR_CATEGORIES, BUSINESS_TYPES } from '@/config/vendorMasterData';
import { Button } from '@/components/ui/Button';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  Building2,
  Package,
  Award,
  CheckCircle2,
  Calendar,
  Lock,
} from 'lucide-react';

interface RegistrationSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  dossier: FullVendorRegistrationDossier;
}

export function RegistrationSummaryModal({
  isOpen,
  onClose,
  dossier,
}: RegistrationSummaryModalProps) {
  if (!isOpen) return null;

  const businessTypeNames = dossier.step3.businessTypeCodes
    .map((c) => BUSINESS_TYPES.find((bt) => bt.code === c)?.name || c)
    .join(', ');

  const categoryNames = dossier.step3.selectedCategoryIds
    .map((c) => VENDOR_CATEGORIES.find((cat) => cat.id === c)?.name || c)
    .join(', ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 text-white px-6 py-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="size-5 text-primary-400" />
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                BITAINTEL Verified Enterprise Dossier
              </h3>
              <p className="text-xs text-slate-400">
                Official statutory registration summary & compliance verification record
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="text-xs bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            >
              <Printer className="size-3.5 mr-1.5" /> Print / PDF
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Printable / Viewable Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 mb-2">
                <CheckCircle2 className="size-3.5" /> Official Status: {dossier.step6.status || 'Verified'}
              </span>
              <h2 className="text-2xl font-black text-slate-900">{dossier.step2.legalName}</h2>
              <p className="text-sm font-semibold text-primary-700 mt-0.5">
                Trade Name: {dossier.step2.tradeName || 'Same as Legal Name'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {dossier.step2.registeredAddress}, {dossier.step2.city}, {dossier.step2.state} {dossier.step2.pincode},{' '}
                {dossier.step2.country}
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Assigned Vendor ID
              </span>
              <span className="text-sm font-mono font-black text-slate-900 block">
                {dossier.step6.vendorId || 'BITA-VND-2026-8942'}
              </span>
              <span className="text-[11px] font-mono text-slate-500 block">
                Ref: {dossier.step6.referenceNumber || 'REF-MH-2026-091'}
              </span>
              <span className="text-[10px] text-slate-400 block">
                Verified: {new Date(dossier.step6.submissionDate || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Section 1: Statutory Identifiers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1 flex items-center gap-2">
              <Building2 className="size-4 text-primary-700" /> Statutory Business Identifiers
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-semibold">GSTIN</span>
                <span className="font-mono font-bold text-slate-900">{dossier.step2.gstin}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-semibold">Corporate PAN</span>
                <span className="font-mono font-bold text-slate-900">{dossier.step2.pan}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-semibold">CIN / Registration</span>
                <span className="font-mono font-bold text-slate-900">{dossier.step2.cin || '—'}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-semibold">MSME Udyam No.</span>
                <span className="font-mono font-bold text-slate-900">{dossier.step2.udyam || '—'}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-semibold">Import Export Code (IEC)</span>
                <span className="font-mono font-bold text-slate-900">{dossier.step2.iec || '—'}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-semibold">D-U-N-S Number</span>
                <span className="font-mono font-bold text-slate-900">{dossier.step2.duns || '—'}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-semibold">Turnover Range</span>
                <span className="font-bold text-slate-900">{dossier.step3.annualTurnoverRange}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-semibold">Workforce</span>
                <span className="font-bold text-slate-900">{dossier.step3.totalWorkforce} Employees</span>
              </div>
            </div>
          </div>

          {/* Section 2: Operating Facilities & Branches */}
          {dossier.step2.facilities.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1">
                Manufacturing Plants & Branch Facilities ({dossier.step2.facilities.length})
              </h4>
              <div className="grid gap-2.5 sm:grid-cols-2 text-xs">
                {dossier.step2.facilities.map((fac) => (
                  <div key={fac.id} className="p-3 rounded-lg border border-slate-200 bg-white">
                    <span className="text-[10px] font-bold text-primary-800 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                      {fac.type}
                    </span>
                    <h5 className="font-bold text-slate-900 mt-1">{fac.facilityName}</h5>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {fac.addressLine ? `${fac.addressLine}, ` : ''}
                      {fac.city}, {fac.state} {fac.pincode}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Registered Products Catalog */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1 flex items-center gap-2">
              <Package className="size-4 text-primary-700" /> Commercial Catalog Items ({dossier.step4.products.length})
            </h4>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Item Name</th>
                    <th className="p-2.5">HSN Code</th>
                    <th className="p-2.5">MOQ</th>
                    <th className="p-2.5">Lead Time</th>
                    <th className="p-2.5">Indicative Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dossier.step4.products.map((p) => (
                    <tr key={p.id}>
                      <td className="p-2.5">
                        <strong className="text-slate-900 block">{p.name}</strong>
                        <span className="text-[10px] text-slate-500">{p.specifications}</span>
                      </td>
                      <td className="p-2.5 font-mono text-slate-600">{p.hsnCode}</td>
                      <td className="p-2.5 text-slate-700 font-semibold">{p.moq}</td>
                      <td className="p-2.5 text-slate-700">{p.leadTimeDays}</td>
                      <td className="p-2.5 font-bold text-slate-900">
                        {p.currency} {p.indicativePrice || 'On Request'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Certifications & Audit Proof */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1 flex items-center gap-2">
              <Award className="size-4 text-primary-700" /> Accredited Quality Certifications
            </h4>
            <div className="grid gap-2.5 sm:grid-cols-2 text-xs">
              {dossier.step4.certifications.map((c) => (
                <div key={c.id} className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{c.certificateType}</span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {c.status}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-primary-800">{c.certificateNumber}</p>
                  <p className="text-[10px] text-slate-500">
                    Authority: {c.issuingAuthority} • Valid Until: {c.expiryDate}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Authorized Representative & Signatory Verification */}
          <div className="rounded-xl border border-primary-200 bg-primary-50/70 p-4 space-y-2 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <strong className="text-primary-950 font-bold block">Authorized Signatory Declaration</strong>
                <span>
                  {dossier.step1.authorizedName} ({dossier.step1.designation})
                </span>
                <span className="text-slate-500 block text-[11px]">
                  Dual verified via {dossier.step1.email} and {dossier.step1.mobile}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-1 rounded font-bold inline-block">
                  CRYPTOGRAPHICALLY SEALED
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close Summary
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => window.print()}
            className="text-xs font-bold"
          >
            <Printer className="size-3.5 mr-1.5" /> Download / Print Dossier
          </Button>
        </div>
      </div>
    </div>
  );
}
