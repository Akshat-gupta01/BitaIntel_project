import React from 'react';
import { toast } from 'sonner';
import { CheckCircle2, ShieldCheck, Building2 } from 'lucide-react';

/**
 * Triggers the official top toaster message when a vendor completes 100%
 * of all 6 steps in the BITAINTEL Vendor Complete Profile form.
 */
export function showProfileCompletedToast(
  vendorId?: string,
  referenceNumber?: string
) {
  const vid = vendorId || 'BITA-VND-2026-8942';
  const ref = referenceNumber || 'REF-MH-2026-849201';

  toast.success('Vendor Profile Completed', {
    position: 'top-center',
    duration: 12000,
    className: '!bg-white !text-slate-900 border-2 !border-emerald-500 shadow-2xl p-4 min-w-[340px] sm:min-w-[480px]',
    description: (
      <div className="mt-2 space-y-2 text-xs text-slate-700">
        <p className="font-semibold text-slate-900 leading-relaxed">
          Your 6-step statutory registration dossier has reached <span className="text-emerald-700 font-extrabold">100% completion</span> and has been securely submitted to the BITAINTEL Compliance Audit Desk.
        </p>

        <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
          <span className="text-slate-600">Vendor ID: <strong className="text-slate-900 font-bold">{vid}</strong></span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600">Dossier Ref: <strong className="text-slate-900 font-bold">{ref}</strong></span>
        </div>

        <div className="flex items-start gap-1.5 text-[11px] text-emerald-800 bg-emerald-50/80 px-2.5 py-1.5 rounded-lg border border-emerald-200">
          <ShieldCheck className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <span className="leading-tight">
            <strong>Desk 4B Assigned:</strong> Statutory cross-checks against MCA21 filings and GSTN portal are active. Standard compliance turnaround is 24 business hours.
          </span>
        </div>
      </div>
    ),
  });
}
