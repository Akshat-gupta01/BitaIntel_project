'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Step5CommercialData, DepartmentContact } from '@/types/vendorRegistration';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  CURRENCIES,
  PAYMENT_METHODS,
  INCOTERMS,
} from '@/config/vendorMasterData';
import {
  DollarSign,
  Globe2,
  Landmark,
  ShieldCheck,
  Lock,
  PhoneCall,
  CheckCircle2,
  Pencil,
  Save,
  X,
  UploadCloud,
  FileCheck2,
  Trash2,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import * as vendorService from '../../../../services/vendor.service';

interface CommercialTradeTabProps {
  data: Step5CommercialData;
  onUpdateCommercial?: (updated: Step5CommercialData) => void;
}

export function CommercialTradeTab({ data, onUpdateCommercial }: CommercialTradeTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Step5CommercialData>(data);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingBankProof, setUploadingBankProof] = useState(false);
  const bankProofInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  // Currency toggle
  function toggleCurrency(code: string) {
    const exists = formData.acceptedCurrencies.includes(code);
    const updated = exists
      ? formData.acceptedCurrencies.filter((c) => c !== code)
      : [...formData.acceptedCurrencies, code];
    setFormData((prev) => ({ ...prev, acceptedCurrencies: updated }));
  }

  // Payment method toggle
  function togglePaymentMethod(pm: string) {
    const exists = formData.paymentMethods.includes(pm);
    const updated = exists
      ? formData.paymentMethods.filter((p) => p !== pm)
      : [...formData.paymentMethods, pm];
    setFormData((prev) => ({ ...prev, paymentMethods: updated }));
  }

  // Incoterm toggle
  function toggleIncoterm(term: string) {
    const exists = formData.preferredIncoterms.includes(term);
    const updated = exists
      ? formData.preferredIncoterms.filter((t) => t !== term)
      : [...formData.preferredIncoterms, term];
    setFormData((prev) => ({ ...prev, preferredIncoterms: updated }));
  }

  // Department contact update
  function updateDeptContact(
    index: number,
    field: keyof DepartmentContact,
    value: string
  ) {
    const updated = [...formData.departmentContacts];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, departmentContacts: updated }));
  }

  // Handle Bank Proof Upload (Cancelled Cheque / Bank Statement)
  async function handleBankProofUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size exceeds 15 MB limit');
      return;
    }

    setUploadingBankProof(true);
    try {
      const res = await vendorService.uploadBankProof(file);
      const docPath = res?.data?.path || res?.data?.url;
      setFormData((prev) => ({ ...prev, bankProofDoc: docPath }));
      if (!isEditing && onUpdateCommercial) {
        onUpdateCommercial({ ...data, bankProofDoc: docPath });
      }
      toast.success('Bank Proof Attached Successfully', {
        description: `${file.name} uploaded as cancelled cheque / bank statement.`,
      });
    } catch (err: any) {
      console.error('Bank proof upload error:', err);
      toast.error('Failed to upload bank proof document', {
        description: err.message || 'Please check backend server connection.',
      });
    } finally {
      setUploadingBankProof(false);
      if (bankProofInputRef.current) bankProofInputRef.current.value = '';
    }
  }

  function handleRemoveBankProof() {
    setFormData((prev) => ({ ...prev, bankProofDoc: undefined }));
    if (!isEditing && onUpdateCommercial) {
      onUpdateCommercial({ ...data, bankProofDoc: undefined });
    }
    if (bankProofInputRef.current) bankProofInputRef.current.value = '';
    toast.info('Bank proof document removed');
  }

  // Save changes to backend
  async function handleSaveCommercial() {
    if (!formData.accountHolderName?.trim() || !formData.bankName?.trim() || !formData.accountNumber?.trim()) {
      toast.error('Banking Information Required', {
        description: 'Account Holder Name, Bank Name, and Account Number are mandatory.',
      });
      return;
    }
    if (!formData.ifscCode?.trim()) {
      toast.error('IFSC / SWIFT Code Required', {
        description: 'Please provide valid IFSC or SWIFT code.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload: vendorService.CommercialPayload = {
        departmentContacts: formData.departmentContacts.filter(
          (c) => c.name?.trim() || c.email?.trim() || c.phone?.trim()
        ),
        acceptedCurrencies:
          formData.acceptedCurrencies && formData.acceptedCurrencies.length > 0
            ? formData.acceptedCurrencies
            : ['INR'],
        paymentMethods:
          formData.paymentMethods && formData.paymentMethods.length > 0
            ? formData.paymentMethods
            : ['Bank Transfer (NEFT/RTGS)'],
        advancePaymentPercentage: formData.advancePaymentPercentage || '20%',
        creditTermsDays: formData.creditTermsDays || '30 Days',
        moqPolicy: formData.moqPolicy || null,
        samplePolicy: formData.samplePolicy || null,
        warrantyTerms: formData.warrantyTerms || null,
        returnPolicy: formData.returnPolicy || null,
        importerExporterStatus: formData.importerExporterStatus || 'Domestic Only',
        iecNumber: formData.iecNumber || null,
        sourcingCountries: formData.sourcingCountries || null,
        exportMarkets: formData.exportMarkets || null,
        annualTradeTurnover: formData.annualTradeTurnover || null,
        preferredIncoterms:
          formData.preferredIncoterms && formData.preferredIncoterms.length > 0
            ? formData.preferredIncoterms
            : ['FOB - Free on Board'],
        freightArrangements: formData.freightArrangements || null,
        customsClearanceAssistance: Boolean(formData.customsClearanceAssistance),
        exportPackagingStandards: formData.exportPackagingStandards || null,
        coldChainCapability: Boolean(formData.coldChainCapability),
        tradeReferences: formData.tradeReferences || null,
        accountHolderName: formData.accountHolderName.trim(),
        bankName: formData.bankName.trim(),
        accountType: formData.accountType || 'Current Account',
        accountNumber: formData.accountNumber.trim(),
        ifscCode: formData.ifscCode.trim(),
        swiftBicCode: formData.swiftBicCode?.trim() || null,
        bankBranch: formData.bankBranch?.trim() || null,
        bankCountry: formData.bankCountry || 'India',
        bankProofDoc: formData.bankProofDoc || null,
        lawfullyScreened: Boolean(formData.lawfullyScreened),
        noConflictOfInterest: Boolean(formData.noConflictOfInterest),
        sanctionsFreeDeclaration: Boolean(formData.sanctionsFreeDeclaration),
        authorityConsent: Boolean(formData.authorityConsent ?? true),
      };

      await vendorService.saveCommercial(payload);
      toast.success('Commercial & Financial Settlement Saved', {
        description: 'Updated terms and banking information stored in relational database.',
      });
      if (onUpdateCommercial) {
        onUpdateCommercial(formData);
      }
      setIsEditing(false);
    } catch (err: any) {
      console.error('Save commercial error:', err);
      toast.error('Failed to update commercial terms', {
        description: err.message || 'Please check backend server connection.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancelEdit() {
    setFormData(data);
    setIsEditing(false);
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Commercial Terms, Trade & Financial Settlement</h2>
          <p className="text-xs text-slate-500">
            Enterprise procurement terms, multi-currency settlement rules, and bank-encrypted credentials
          </p>
        </div>
        <div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="text-xs"
              >
                <X className="size-3.5 mr-1" /> Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveCommercial}
                disabled={isSaving}
                className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-3.5 mr-1 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="size-3.5 mr-1" /> Save Terms
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-xs border-primary-300 text-primary-700 hover:bg-primary-50"
            >
              <Pencil className="size-3.5 mr-1" /> Edit Terms & Banking
            </Button>
          )}
        </div>
      </div>

      {/* Hidden file input for bank proof */}
      <input
        ref={bankProofInputRef}
        type="file"
        accept=".pdf,application/pdf,image/*"
        className="hidden"
        onChange={handleBankProofUpload}
      />

      {isEditing ? (
        /* ======================== EDIT MODE ======================== */
        <div className="space-y-6 animate-in fade-in">
          {/* 1. Department Contacts Edit */}
          <Card variant="bento" className="p-6 bg-white space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <PhoneCall className="size-5 text-primary-700" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">1. Departmental Points of Contact</h3>
                <p className="text-xs text-slate-500">Official escalation contacts for commercial and technical queries</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {formData.departmentContacts.map((contact, idx) => (
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
                      placeholder="Phone / Mobile"
                      className="text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 2. Commercial & Payment Terms Edit */}
          <Card variant="bento" className="p-6 bg-white space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <DollarSign className="size-5 text-primary-700" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">2. Commercial & Payment Terms</h3>
                <p className="text-xs text-slate-500">Currencies, payment methods, and standard trade policies</p>
              </div>
            </div>

            {/* Currencies */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Accepted Currencies</label>
              <div className="flex flex-wrap gap-2">
                {CURRENCIES.map((cur) => {
                  const isSelected = formData.acceptedCurrencies.includes(cur.code);
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
                  const isSelected = formData.paymentMethods.includes(pm);
                  return (
                    <label
                      key={pm}
                      className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs cursor-pointer font-medium ${
                        isSelected
                          ? 'bg-primary-50 border-primary-400 text-primary-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-600'
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
                  value={formData.creditTermsDays}
                  onChange={(e) => setFormData((prev) => ({ ...prev, creditTermsDays: e.target.value }))}
                  placeholder="e.g. 30 Days Net from BL date"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Advance Payment Requirement</label>
                <Input
                  value={formData.advancePaymentPercentage}
                  onChange={(e) => setFormData((prev) => ({ ...prev, advancePaymentPercentage: e.target.value }))}
                  placeholder="e.g. 25% with order confirmation"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Warranty Terms</label>
                <Input
                  value={formData.warrantyTerms}
                  onChange={(e) => setFormData((prev) => ({ ...prev, warrantyTerms: e.target.value }))}
                  placeholder="e.g. 24 Months warranty against manufacturing defects"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Return / Replacement Policy</label>
                <Input
                  value={formData.returnPolicy}
                  onChange={(e) => setFormData((prev) => ({ ...prev, returnPolicy: e.target.value }))}
                  placeholder="e.g. 7-day replacement authorization upon NCR review"
                  className="text-xs"
                />
              </div>
            </div>
          </Card>

          {/* 3. Trade Operations Edit */}
          <Card variant="bento" className="p-6 bg-white space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Globe2 className="size-5 text-primary-700" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">3. Trade Operations & Logistics</h3>
                <p className="text-xs text-slate-500">Cross-border freight capabilities, destination markets, and packaging</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Preferred Incoterms</label>
              <div className="flex flex-wrap gap-2">
                {INCOTERMS.map((term) => {
                  const isSelected = formData.preferredIncoterms.includes(term);
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
                  value={formData.importerExporterStatus}
                  onChange={(e) => setFormData((prev) => ({ ...prev, importerExporterStatus: e.target.value as any }))}
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
                  value={formData.annualTradeTurnover}
                  onChange={(e) => setFormData((prev) => ({ ...prev, annualTradeTurnover: e.target.value }))}
                  placeholder="e.g. $18.4M USD or ₹150 Crore"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Key Export Markets</label>
                <Input
                  value={formData.exportMarkets}
                  onChange={(e) => setFormData((prev) => ({ ...prev, exportMarkets: e.target.value }))}
                  placeholder="e.g. United States, Germany, UAE"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Raw Material Sourcing Countries</label>
                <Input
                  value={formData.sourcingCountries}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sourcingCountries: e.target.value }))}
                  placeholder="e.g. Germany, Japan, South Korea"
                  className="text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Packaging & Handling Standards</label>
                <Input
                  value={formData.exportPackagingStandards}
                  onChange={(e) => setFormData((prev) => ({ ...prev, exportPackagingStandards: e.target.value }))}
                  placeholder="e.g. ISPM-15 heat-treated export crates"
                  className="text-xs"
                />
              </div>
            </div>
          </Card>

          {/* 4. Masked Banking Credentials Edit */}
          <Card variant="bento" className="p-6 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Landmark className="size-5 text-primary-700" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">4. Corporate Bank Account & Settlement</h3>
                  <p className="text-xs text-slate-500">Designated settlement account for commercial transactions</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <Lock className="size-3" /> Encrypted Vault
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Beneficiary Account Holder Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={formData.accountHolderName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, accountHolderName: e.target.value }))}
                  placeholder="Exact corporate account name"
                  className="text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bank Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={formData.bankName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bankName: e.target.value }))}
                  placeholder="e.g. HDFC Bank Ltd / State Bank of India"
                  className="text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Account Number <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={formData.accountNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, accountNumber: e.target.value }))}
                  placeholder="Enter corporate current account number"
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Type</label>
                <Select
                  value={formData.accountType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, accountType: e.target.value as any }))}
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
                  value={formData.ifscCode}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))}
                  placeholder="e.g. HDFC0000039"
                  className="text-xs font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">SWIFT / BIC Code</label>
                <Input
                  value={formData.swiftBicCode}
                  onChange={(e) => setFormData((prev) => ({ ...prev, swiftBicCode: e.target.value.toUpperCase() }))}
                  placeholder="e.g. HDFCINBBXXX"
                  className="text-xs font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bank Branch Location</label>
                <Input
                  value={formData.bankBranch || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bankBranch: e.target.value }))}
                  placeholder="e.g. Nariman Point Branch, Mumbai"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Settlement Country</label>
                <Input
                  value={formData.bankCountry || 'India'}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bankCountry: e.target.value }))}
                  placeholder="India"
                  className="text-xs"
                />
              </div>
            </div>

            {/* Bank Proof Document Upload */}
            <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-200 space-y-2 mt-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                    <FileCheck2 className="size-3.5 text-primary-600" />
                    Statutory Bank Account Proof (Cancelled Cheque / Bank Statement)
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Upload official document showing account holder name, account number & IFSC/SWIFT code.
                  </p>
                </div>
              </div>

              {formData.bankProofDoc ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-300 bg-emerald-50/70 text-emerald-900 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold truncate">
                      Bank Proof: {formData.bankProofDoc.split('/').pop()}
                    </span>
                    <a
                      href={vendorService.getFullImageUrl(formData.bankProofDoc)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-primary-700 underline font-medium hover:text-primary-800 ml-2"
                    >
                      View
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => bankProofInputRef.current?.click()}
                      className="text-[11px] text-primary-700 hover:underline font-semibold cursor-pointer"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveBankProof}
                      className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                      title="Remove proof"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => bankProofInputRef.current?.click()}
                  className="border border-dashed border-slate-300 rounded-lg p-3 text-center cursor-pointer hover:bg-slate-100 hover:border-primary-400 transition-colors"
                >
                  <UploadCloud className="size-5 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs font-semibold text-primary-700 hover:underline">
                    {uploadingBankProof ? 'Uploading Bank Proof...' : 'Click to Upload Cancelled Cheque / Statement'}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Accepted: PDF, JPG, PNG (Max 15 MB)
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Edit Action Bar */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveCommercial}
              disabled={isSaving}
              className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="size-3.5 mr-1.5" /> Save Changes to Database
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        /* ======================== VIEW MODE ======================== */
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
                  {formData.acceptedCurrencies.map((c) => (
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
                <span className="font-bold text-slate-900 text-sm mt-1 block">{formData.creditTermsDays}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-semibold">Advance Payment</span>
                <span className="font-bold text-slate-900 text-sm mt-1 block">
                  {formData.advancePaymentPercentage || '25% on PO'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-semibold">Warranty Terms</span>
                <span className="font-bold text-slate-900 mt-1 block">{formData.warrantyTerms}</span>
              </div>

              <div className="sm:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-semibold mb-1">Payment Methods</span>
                <div className="flex flex-wrap gap-1.5">
                  {formData.paymentMethods.map((pm) => (
                    <span key={pm} className="px-2 py-0.5 rounded bg-white text-slate-700 text-[11px] border border-slate-200">
                      {pm}
                    </span>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-semibold">Return & Replacement Policy</span>
                <span className="text-slate-700 mt-0.5 block">{formData.returnPolicy}</span>
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
                  {formData.preferredIncoterms.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-primary-50 text-primary-800 font-mono font-bold border border-primary-200">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] font-semibold">Trade Status</span>
                <span className="font-bold text-slate-900 mt-1 block">{formData.importerExporterStatus}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] font-semibold">Annual Trade Volume</span>
                <span className="font-bold text-slate-900 mt-1 block">{formData.annualTradeTurnover}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] font-semibold">Key Export Markets</span>
                <p className="text-slate-800 mt-0.5 font-medium">{formData.exportMarkets}</p>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] font-semibold">Raw Material Sourcing</span>
                <p className="text-slate-800 mt-0.5 font-medium">{formData.sourcingCountries}</p>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] font-semibold">Packaging Standards</span>
                <p className="text-slate-800 mt-0.5 font-medium">{formData.exportPackagingStandards}</p>
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
                <strong className="text-slate-900 block mt-0.5">{formData.accountHolderName}</strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-semibold">Bank Name & Branch</span>
                <strong className="text-slate-900 block mt-0.5">{formData.bankName}</strong>
                <span className="text-[11px] text-slate-500">{formData.bankBranch}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-semibold">Corporate Account Number</span>
                <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                  {formData.accountNumber}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-semibold">IFSC Code</span>
                <span className="font-mono font-bold text-slate-900 mt-0.5 block">{formData.ifscCode}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-semibold">SWIFT / BIC Code</span>
                <span className="font-mono font-bold text-slate-900 mt-0.5 block">{formData.swiftBicCode || 'N/A'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-semibold">Account Type</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{formData.accountType}</span>
              </div>
            </div>

            {/* Bank Proof Document Status */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileCheck2 className="size-4 text-primary-600" />
                <span className="font-semibold text-slate-700">Statutory Bank Proof:</span>
                {formData.bankProofDoc ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="size-3 text-emerald-600" />
                    Verified Document Attached
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Not Uploaded Yet
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {formData.bankProofDoc && (
                  <a
                    href={vendorService.getFullImageUrl(formData.bankProofDoc)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:text-primary-800 hover:underline"
                  >
                    <ExternalLink className="size-3" /> View Cheque/Statement
                  </a>
                )}
                <button
                  type="button"
                  disabled={uploadingBankProof}
                  onClick={() => bankProofInputRef.current?.click()}
                  className="text-xs text-primary-700 hover:underline font-semibold cursor-pointer ml-2"
                >
                  {uploadingBankProof
                    ? 'Uploading...'
                    : formData.bankProofDoc
                    ? 'Replace Document'
                    : 'Upload Cheque / Statement'}
                </button>
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
              {formData.departmentContacts.map((c) => (
                <div key={c.department} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-primary-800 bg-primary-50 px-2 py-0.5 rounded border border-primary-200 inline-block mb-1">
                    {c.department}
                  </span>
                  <h5 className="font-bold text-slate-900">{c.name || 'Official Contact'}</h5>
                  <p className="text-slate-500 text-[11px]">{c.designation}</p>
                  <div className="pt-2 text-[11px] text-slate-600 space-y-0.5">
                    <p>Email: <span className="font-mono font-semibold text-primary-700">{c.email || 'N/A'}</span></p>
                    <p>Phone: <span className="font-mono font-semibold text-slate-800">{c.phone || 'N/A'}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
