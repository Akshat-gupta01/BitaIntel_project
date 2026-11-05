'use client';

import React from 'react';
import { Step5CommercialData } from '@/types/vendorRegistration';
import {
  CURRENCIES,
  PAYMENT_METHODS,
  INCOTERMS,
} from '@/config/vendorMasterData';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  DollarSign,
  Globe2,
  Landmark,
  ShieldAlert,
  FileCheck2,
  Users2,
  PhoneCall,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

interface Step5CommercialProps {
  data: Step5CommercialData;
  onChange: (updated: Partial<Step5CommercialData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Step5Commercial({ data, onChange, onNext, onPrev }: Step5CommercialProps) {
  // Toggle Currency
  function toggleCurrency(code: string) {
    const exists = data.acceptedCurrencies.includes(code);
    const updated = exists
      ? data.acceptedCurrencies.filter((c) => c !== code)
      : [...data.acceptedCurrencies, code];
    onChange({ acceptedCurrencies: updated });
  }

  // Toggle Payment Method
  function togglePaymentMethod(pm: string) {
    const exists = data.paymentMethods.includes(pm);
    const updated = exists
      ? data.paymentMethods.filter((p) => p !== pm)
      : [...data.paymentMethods, pm];
    onChange({ paymentMethods: updated });
  }

  // Toggle Incoterm
  function toggleIncoterm(term: string) {
    const exists = data.preferredIncoterms.includes(term);
    const updated = exists
      ? data.preferredIncoterms.filter((t) => t !== term)
      : [...data.preferredIncoterms, term];
    onChange({ preferredIncoterms: updated });
  }

  // Update specific department contact
  function updateDeptContact(
    index: number,
    field: 'name' | 'designation' | 'email' | 'phone',
    val: string
  ) {
    const updated = [...data.departmentContacts];
    updated[index] = { ...updated[index], [field]: val };
    onChange({ departmentContacts: updated });
  }

  function handleProceed() {
    if (!data.accountHolderName.trim() || !data.bankName.trim() || !data.accountNumber.trim()) {
      toast.error('Banking Information Required', {
        description: 'Please fill in Account Holder, Bank Name, and Account Number for statutory settlement.',
      });
      return;
    }
    if (!data.ifscCode.trim()) {
      toast.error('IFSC / SWIFT Code Required', {
        description: 'Please provide valid IFSC or SWIFT code.',
      });
      return;
    }
    if (!data.sanctionsFreeDeclaration || !data.noConflictOfInterest || !data.lawfullyScreened) {
      toast.error('Due Diligence Declarations Required', {
        description: 'Please accept all compliance declarations to satisfy enterprise KYC checks.',
      });
      return;
    }
    onNext();
  }

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="border-b border-slate-200/80 pb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-200">
          Step 5 of 6
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
          Commercial Terms, Trade & Financial Settlement
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Buyer engagement protocols, Incoterms, international trade operations, verified banking credentials, and due diligence.
        </p>
      </div>

      {/* 1. Departmental Business Contacts */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <PhoneCall className="size-4 text-primary-700" />
          <h3 className="text-sm font-bold text-slate-900">1. Departmental Business Points of Contact</h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {data.departmentContacts.map((contact, idx) => (
            <div key={contact.department} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2">
              <span className="text-[11px] font-bold text-primary-800 bg-primary-50 px-2 py-0.5 rounded border border-primary-200 inline-block">
                {contact.department}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={contact.name}
                  onChange={(e) => updateDeptContact(idx, 'name', e.target.value)}
                  placeholder="Contact Person Name"
                  className="text-xs"
                />
                <Input
                  value={contact.designation}
                  onChange={(e) => updateDeptContact(idx, 'designation', e.target.value)}
                  placeholder="Designation"
                  className="text-xs"
                />
                <Input
                  type="email"
                  value={contact.email}
                  onChange={(e) => updateDeptContact(idx, 'email', e.target.value)}
                  placeholder="Official Email"
                  className="text-xs"
                />
                <Input
                  value={contact.phone}
                  onChange={(e) => updateDeptContact(idx, 'phone', e.target.value)}
                  placeholder="Direct Phone / Mobile"
                  className="text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Commercial & Payment Terms */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <DollarSign className="size-4 text-primary-700" />
          <h3 className="text-sm font-bold text-slate-900">2. Commercial & Payment Terms</h3>
        </div>

        {/* Currencies */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Accepted Currencies</label>
          <div className="flex flex-wrap gap-2">
            {CURRENCIES.map((cur) => {
              const isSelected = data.acceptedCurrencies.includes(cur.code);
              return (
                <button
                  key={cur.code}
                  type="button"
                  onClick={() => toggleCurrency(cur.code)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cur.code} ({cur.symbol})
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Standard Payment Methods</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PAYMENT_METHODS.map((pm) => {
              const isSelected = data.paymentMethods.includes(pm);
              return (
                <label
                  key={pm}
                  className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs cursor-pointer font-medium ${
                    isSelected ? 'bg-primary-50 border-primary-400 text-primary-900 font-bold' : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <Checkbox checked={isSelected} onChange={() => togglePaymentMethod(pm)} className="mt-0.5" />
                  <span className="leading-tight text-[11px]">{pm}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Commercial Policies */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Standard Credit Terms</label>
            <Input
              value={data.creditTermsDays}
              onChange={(e) => onChange({ creditTermsDays: e.target.value })}
              placeholder="e.g. 30 Days Net from BL date"
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Advance Payment Requirement</label>
            <Input
              value={data.advancePaymentPercentage}
              onChange={(e) => onChange({ advancePaymentPercentage: e.target.value })}
              placeholder="e.g. 25% with order confirmation"
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Warranty Terms</label>
            <Input
              value={data.warrantyTerms}
              onChange={(e) => onChange({ warrantyTerms: e.target.value })}
              placeholder="e.g. 24 Months warranty against manufacturing defects"
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Return / Replacement Policy</label>
            <Input
              value={data.returnPolicy}
              onChange={(e) => onChange({ returnPolicy: e.target.value })}
              placeholder="e.g. 7-day replacement authorization upon NCR review"
              className="text-xs"
            />
          </div>
        </div>
      </div>

      {/* 3. International Logistics & Trade Operations */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <Globe2 className="size-4 text-primary-700" />
          <h3 className="text-sm font-bold text-slate-900">3. Trade Operations & International Logistics</h3>
        </div>

        {/* Incoterms */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Preferred Incoterms</label>
          <div className="flex flex-wrap gap-2">
            {INCOTERMS.map((term) => {
              const isSelected = data.preferredIncoterms.includes(term);
              return (
                <button
                  key={term}
                  type="button"
                  onClick={() => toggleIncoterm(term)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                    isSelected
                      ? 'bg-primary-700 text-white border-primary-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {term}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Trade Status</label>
            <Select
              value={data.importerExporterStatus}
              onChange={(e) => onChange({ importerExporterStatus: e.target.value as any })}
              options={[
                { value: 'Both Importer & Exporter', label: 'Both Importer & Exporter' },
                { value: 'Exporter Only', label: 'Exporter Only' },
                { value: 'Importer Only', label: 'Importer Only' },
                { value: 'Domestic Only', label: 'Domestic Market Only' },
              ]}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Annual Export/Trade Volume</label>
            <Input
              value={data.annualTradeTurnover}
              onChange={(e) => onChange({ annualTradeTurnover: e.target.value })}
              placeholder="e.g. $18.4M USD or ₹150 Crore"
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Key Export Markets / Destinations</label>
            <Input
              value={data.exportMarkets}
              onChange={(e) => onChange({ exportMarkets: e.target.value })}
              placeholder="e.g. United States, Germany, UAE, Singapore"
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Key Raw Material Sourcing Countries</label>
            <Input
              value={data.sourcingCountries}
              onChange={(e) => onChange({ sourcingCountries: e.target.value })}
              placeholder="e.g. Germany, Japan, South Korea"
              className="text-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Export Packaging & Handling Standards
            </label>
            <Input
              value={data.exportPackagingStandards}
              onChange={(e) => onChange({ exportPackagingStandards: e.target.value })}
              placeholder="e.g. ISPM-15 heat-treated export crates, VCI anti-corrosion barrier packing"
              className="text-xs"
            />
          </div>
        </div>
      </div>

      {/* 4. Banking Details & Masked Security */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
          <div className="flex items-center gap-2">
            <Landmark className="size-4 text-primary-700" />
            <h3 className="text-sm font-bold text-slate-900">
              4. Banking & Financial Settlement Details <span className="text-rose-500">*</span>
            </h3>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <Lock className="size-3" /> Encrypted Vault
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Beneficiary Account Holder Name <span className="text-rose-500">*</span>
            </label>
            <Input
              value={data.accountHolderName}
              onChange={(e) => onChange({ accountHolderName: e.target.value })}
              placeholder="Exact corporate account name"
              className="text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Bank Name <span className="text-rose-500">*</span>
            </label>
            <Input
              value={data.bankName}
              onChange={(e) => onChange({ bankName: e.target.value })}
              placeholder="e.g. HDFC Bank Ltd / State Bank of India"
              className="text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Account Number <span className="text-rose-500">*</span>
            </label>
            <Input
              value={data.accountNumber}
              onChange={(e) => onChange({ accountNumber: e.target.value })}
              placeholder="Enter corporate current account number"
              className="text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Account Type</label>
            <Select
              value={data.accountType}
              onChange={(e) => onChange({ accountType: e.target.value as any })}
              options={[
                { value: 'Current Account', label: 'Current Account (Corporate)' },
                { value: 'Cash Credit / Overdraft', label: 'Cash Credit / Overdraft (CC/OD)' },
                { value: 'Foreign Currency Account', label: 'EEFC / Foreign Currency Account' },
              ]}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              IFSC Code (India) <span className="text-rose-500">*</span>
            </label>
            <Input
              value={data.ifscCode}
              onChange={(e) => onChange({ ifscCode: e.target.value.toUpperCase() })}
              placeholder="e.g. HDFC0000039"
              className="text-xs font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">SWIFT / BIC Code (Cross-Border)</label>
            <Input
              value={data.swiftBicCode}
              onChange={(e) => onChange({ swiftBicCode: e.target.value.toUpperCase() })}
              placeholder="e.g. HDFCINBBXXX"
              className="text-xs font-mono uppercase"
            />
          </div>
        </div>
      </div>

      {/* 5. Due Diligence & Statutory Declarations */}
      <div className="rounded-xl border border-primary-100 bg-primary-50/60 p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert className="size-4 text-primary-800" />
          <h3 className="text-xs font-bold text-primary-950 uppercase tracking-wide">
            5. Enterprise Due Diligence & Compliance Declarations <span className="text-rose-500">*</span>
          </h3>
        </div>

        <div className="space-y-2.5">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <Checkbox
              checked={data.lawfullyScreened}
              onChange={(e) => onChange({ lawfullyScreened: e.target.checked })}
              className="mt-0.5"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              We declare that neither the entity nor any director/promoter is debarred, blacklisted, or subjected to
              adverse statutory bankruptcy proceedings.
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <Checkbox
              checked={data.noConflictOfInterest}
              onChange={(e) => onChange({ noConflictOfInterest: e.target.checked })}
              className="mt-0.5"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              We confirm no conflict of interest or unlawful business affiliations with BITAINTEL empanelled buyers.
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <Checkbox
              checked={data.sanctionsFreeDeclaration}
              onChange={(e) => onChange({ sanctionsFreeDeclaration: e.target.checked })}
              className="mt-0.5"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              We confirm compliance with global anti-money laundering (AML), FCPA, and anti-bribery statutes.
            </span>
          </label>
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
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-2.5 shadow-sm text-xs"
        >
          Save & Continue to Documents & Review
        </Button>
      </div>
    </div>
  );
}
