'use client';

import React from 'react';
import { Step5CommercialData } from '@/types/vendorRegistration';
import { Card } from '@/components/ui/Card';
import {
  DollarSign,
  Globe2,
  Landmark,
  ShieldCheck,
  Lock,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';

interface CommercialTradeTabProps {
  data: Step5CommercialData;
}

export function CommercialTradeTab({ data }: CommercialTradeTabProps) {
  return (
    <div className="space-y-6">
      {/* 1. Commercial & Payment Terms */}
      <Card variant="bento" className="p-6 bg-white space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <DollarSign className="size-5 text-primary-700" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Commercial & Payment Terms</h3>
            <p className="text-xs text-slate-500">Agreed procurement terms, accepted currencies, and settlement rules</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 block font-semibold">Accepted Currencies</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {data.acceptedCurrencies.map((c) => (
                <span
                  key={c}
                  className="px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-200 font-bold"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 block font-semibold">Standard Credit Terms</span>
            <span className="font-bold text-slate-900 text-sm mt-1 block">{data.creditTermsDays}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 block font-semibold">Advance Payment</span>
            <span className="font-bold text-slate-900 text-sm mt-1 block">
              {data.advancePaymentPercentage || '25% on PO'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 block font-semibold">Warranty Terms</span>
            <span className="font-bold text-slate-900 mt-1 block">{data.warrantyTerms}</span>
          </div>

          <div className="sm:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 block font-semibold mb-1">Payment Methods</span>
            <div className="flex flex-wrap gap-1.5">
              {data.paymentMethods.map((pm) => (
                <span key={pm} className="px-2 py-0.5 rounded bg-white text-slate-700 text-[11px] border border-slate-200">
                  {pm}
                </span>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 block font-semibold">Return & Replacement Policy</span>
            <span className="text-slate-700 mt-0.5 block">{data.returnPolicy}</span>
          </div>
        </div>
      </Card>

      {/* 2. Trade Operations & Logistics */}
      <Card variant="bento" className="p-6 bg-white space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Globe2 className="size-5 text-primary-700" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Trade Operations & Incoterms</h3>
            <p className="text-xs text-slate-500">Cross-border freight capabilities, destination markets, and packaging</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold">Preferred Incoterms</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {data.preferredIncoterms.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded bg-primary-50 text-primary-800 font-mono font-bold border border-primary-200">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] font-semibold">Trade Status</span>
            <span className="font-bold text-slate-900 mt-1 block">{data.importerExporterStatus}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] font-semibold">Annual Trade Volume</span>
            <span className="font-bold text-slate-900 mt-1 block">{data.annualTradeTurnover}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] font-semibold">Key Export Markets</span>
            <p className="text-slate-800 mt-0.5 font-medium">{data.exportMarkets}</p>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] font-semibold">Raw Material Sourcing</span>
            <p className="text-slate-800 mt-0.5 font-medium">{data.sourcingCountries}</p>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] font-semibold">Packaging Standards</span>
            <p className="text-slate-800 mt-0.5 font-medium">{data.exportPackagingStandards}</p>
          </div>
        </div>
      </Card>

      {/* 3. Masked Banking Credentials */}
      <Card variant="bento" className="p-6 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Landmark className="size-5 text-primary-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Verified Corporate Bank Account</h3>
              <p className="text-xs text-slate-500">Designated settlement account for commercial transactions</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <Lock className="size-3" /> Encrypted & Bank-Verified
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 block font-semibold">Account Holder</span>
            <strong className="text-slate-900 block mt-0.5">{data.accountHolderName}</strong>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 block font-semibold">Bank Name & Branch</span>
            <strong className="text-slate-900 block mt-0.5">{data.bankName}</strong>
            <span className="text-[11px] text-slate-500">{data.bankBranch}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 block font-semibold">Corporate Account Number</span>
            <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
              {data.accountNumber}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 block font-semibold">IFSC Code</span>
            <span className="font-mono font-bold text-slate-900 mt-0.5 block">{data.ifscCode}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 block font-semibold">SWIFT / BIC Code</span>
            <span className="font-mono font-bold text-slate-900 mt-0.5 block">{data.swiftBicCode}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 block font-semibold">Account Type</span>
            <span className="font-bold text-slate-900 mt-0.5 block">{data.accountType}</span>
          </div>
        </div>
      </Card>

      {/* 4. Departmental Business Contacts */}
      <Card variant="bento" className="p-6 bg-white space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <PhoneCall className="size-5 text-primary-700" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Official Departmental Points of Contact</h3>
            <p className="text-xs text-slate-500">Escalation contacts for commercial, technical, and accounting matters</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {data.departmentContacts.map((c) => (
            <div key={c.department} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1 text-xs">
              <span className="text-[10px] font-bold text-primary-800 bg-primary-50 px-2 py-0.5 rounded border border-primary-200 inline-block mb-1">
                {c.department}
              </span>
              <h5 className="font-bold text-slate-900">{c.name || 'Official Contact'}</h5>
              <p className="text-slate-500 text-[11px]">{c.designation}</p>
              <div className="pt-2 text-[11px] text-slate-600 space-y-0.5">
                <p>Email: <span className="font-mono font-semibold text-primary-700">{c.email}</span></p>
                <p>Phone: <span className="font-mono font-semibold text-slate-800">{c.phone}</span></p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
