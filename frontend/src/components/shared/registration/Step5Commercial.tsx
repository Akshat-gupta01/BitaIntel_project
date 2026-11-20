'use client';

import React, { useState, useRef } from 'react';
import { Step5CommercialData, DepartmentContact } from '@/types/vendorRegistration';
import {
  CURRENCIES,
  PAYMENT_METHODS,
  INCOTERMS,
  STANDARD_DEPARTMENTS,
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
  UploadCloud,
  CheckCircle2,
  Trash2,
  Loader2,
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Star,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import * as vendorService from '../../../../services/vendor.service';

interface Step5CommercialProps {
  data: Step5CommercialData;
  onChange: (updated: Partial<Step5CommercialData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onDossierChange?: (step: number, percentage: number) => void;
}

export function Step5Commercial({
  data,
  onChange,
  onNext,
  onPrev,
  onDossierChange,
}: Step5CommercialProps) {
  const [uploadingBankProof, setUploadingBankProof] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const bankProofInputRef = useRef<HTMLInputElement | null>(null);

  // New Department Contact form state
  const [newContact, setNewContact] = useState<{
    department: string;
    name: string;
    designation: string;
    email: string;
    phone: string;
    isPrimary: boolean;
  }>({
    department: 'Sales & Inquiries',
    name: '',
    designation: 'Commercial / Sales Lead',
    email: '',
    phone: '',
    isPrimary: !(data.departmentContacts && data.departmentContacts.length > 0),
  });
  const [customDept, setCustomDept] = useState('');
  const [isAddingContact, setIsAddingContact] = useState(false);

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

  // Add a Department Contact and immediately persist to MySQL business_department_contacts
  async function handleAddContact() {
    const effectiveDept =
      newContact.department === 'Custom / Other'
        ? customDept.trim() || 'Other Department'
        : newContact.department;

    if (!newContact.name.trim()) {
      toast.error('Contact Person Name Required', {
        description: 'Please enter the full name of the department contact person.',
      });
      return;
    }

    if (
      newContact.email &&
      newContact.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newContact.email.trim())
    ) {
      toast.error('Invalid Email Format', {
        description: 'Please enter a valid corporate email format (e.g. name@company.com).',
      });
      return;
    }

    const payload: vendorService.DepartmentContactPayload = {
      department: effectiveDept,
      name: newContact.name.trim(),
      designation: newContact.designation?.trim() || null,
      email: newContact.email?.trim() || null,
      phone: newContact.phone?.trim() || null,
      isPrimary: Boolean(newContact.isPrimary),
    };

    let assignedId: string | number = `TEMP-${Date.now()}`;
    setIsAddingContact(true);
    try {
      const res = await vendorService.addDepartmentContact(payload);
      if (res?.data?.contact?.id) {
        assignedId = res.data.contact.id;
      }
      toast.success('Department Contact Saved to Database', {
        description: `${payload.name} (${payload.department}) successfully saved in business_department_contacts table.`,
      });
    } catch (err: any) {
      console.warn('Backend contact save note:', err.message);
      toast.info('Contact Added to Dossier', {
        description: `${payload.name} (${payload.department}) will sync upon proceeding.`,
      });
    } finally {
      setIsAddingContact(false);
    }

    // If new contact is primary, uncheck others
    const currentList = (data.departmentContacts || []).map((c) => ({
      ...c,
      isPrimary: newContact.isPrimary ? false : c.isPrimary,
    }));

    const item: DepartmentContact = {
      id: assignedId,
      department: effectiveDept,
      name: newContact.name.trim(),
      designation: newContact.designation?.trim() || '',
      email: newContact.email?.trim() || '',
      phone: newContact.phone?.trim() || '',
      isPrimary: Boolean(newContact.isPrimary),
    };

    const updatedContacts = [...currentList, item];
    onChange({ departmentContacts: updatedContacts });

    // Suggest next unassigned standard department
    const usedDepts = updatedContacts.map((c) => c.department);
    const nextDept =
      STANDARD_DEPARTMENTS.find((d) => d !== 'Custom / Other' && !usedDepts.includes(d)) ||
      'Procurement & Sourcing';

    setNewContact({
      department: nextDept,
      name: '',
      designation: '',
      email: '',
      phone: '',
      isPrimary: false,
    });
    setCustomDept('');
  }

  // Remove a department contact from database & state
  async function handleRemoveContact(index: number, contactId?: string | number) {
    const current = [...(data.departmentContacts || [])];
    const removed = current.splice(index, 1)[0];
    if (removed?.isPrimary && current.length > 0) {
      current[0].isPrimary = true;
    }
    onChange({ departmentContacts: current });

    if (contactId && typeof contactId === 'number') {
      try {
        await vendorService.deleteDepartmentContact(contactId);
        toast.success('Contact Removed from Database');
        return;
      } catch (err: any) {
        console.warn('Backend contact delete note:', err.message);
      }
    }
    toast.info('Contact Card Removed');
  }

  // Mark an existing contact as Primary
  function setPrimaryContact(index: number) {
    const current = [...(data.departmentContacts || [])];
    const updated = current.map((c, idx) => ({
      ...c,
      isPrimary: idx === index,
    }));
    onChange({ departmentContacts: updated });
    toast.success('Primary Point of Contact Updated', {
      description: `${updated[index]?.name || updated[index]?.department} is now marked as primary escalation lead.`,
    });
  }

  // Handle Bank Proof Upload (Cancelled Cheque / Bank Statement)
  async function handleBankProofSelect(e: React.ChangeEvent<HTMLInputElement>) {
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
      onChange({ bankProofDoc: docPath });
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
    onChange({ bankProofDoc: undefined });
    if (bankProofInputRef.current) bankProofInputRef.current.value = '';
    toast.info('Bank proof document removed');
  }

  async function handleProceed() {
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

    setIsSaving(true);
    try {
      let pendingContacts = [...(data.departmentContacts || [])];
      if (newContact.name.trim()) {
        const effectiveDept =
          newContact.department === 'Custom / Other'
            ? customDept.trim() || 'Other Department'
            : newContact.department;
        pendingContacts.push({
          department: effectiveDept,
          name: newContact.name.trim(),
          designation: newContact.designation?.trim() || '',
          email: newContact.email?.trim() || '',
          phone: newContact.phone?.trim() || '',
          isPrimary: Boolean(newContact.isPrimary),
        });
      }

      const payload: vendorService.CommercialPayload = {
        departmentContacts: pendingContacts.filter(
          (c) => c.name?.trim() || c.email?.trim() || c.phone?.trim()
        ),
        acceptedCurrencies:
          data.acceptedCurrencies && data.acceptedCurrencies.length > 0
            ? data.acceptedCurrencies
            : ['INR'],
        paymentMethods:
          data.paymentMethods && data.paymentMethods.length > 0
            ? data.paymentMethods
            : ['Bank Transfer (NEFT/RTGS)'],
        advancePaymentPercentage: data.advancePaymentPercentage || '20%',
        creditTermsDays: data.creditTermsDays || '30 Days',
        moqPolicy: data.moqPolicy || null,
        samplePolicy: data.samplePolicy || null,
        warrantyTerms: data.warrantyTerms || null,
        returnPolicy: data.returnPolicy || null,
        importerExporterStatus: data.importerExporterStatus || 'Domestic Only',
        iecNumber: data.iecNumber || null,
        sourcingCountries: data.sourcingCountries || null,
        exportMarkets: data.exportMarkets || null,
        annualTradeTurnover: data.annualTradeTurnover || null,
        preferredIncoterms:
          data.preferredIncoterms && data.preferredIncoterms.length > 0
            ? data.preferredIncoterms
            : ['FOB - Free on Board'],
        freightArrangements: data.freightArrangements || null,
        customsClearanceAssistance: Boolean(data.customsClearanceAssistance),
        exportPackagingStandards: data.exportPackagingStandards || null,
        coldChainCapability: Boolean(data.coldChainCapability),
        tradeReferences: data.tradeReferences || null,
        accountHolderName: data.accountHolderName.trim(),
        bankName: data.bankName.trim(),
        accountType: data.accountType || 'Current Account',
        accountNumber: data.accountNumber.trim(),
        ifscCode: data.ifscCode.trim(),
        swiftBicCode: data.swiftBicCode?.trim() || null,
        bankBranch: data.bankBranch?.trim() || null,
        bankCountry: data.bankCountry || 'India',
        bankProofDoc: data.bankProofDoc || null,
        lawfullyScreened: Boolean(data.lawfullyScreened),
        noConflictOfInterest: Boolean(data.noConflictOfInterest),
        sanctionsFreeDeclaration: Boolean(data.sanctionsFreeDeclaration),
        authorityConsent: Boolean(data.authorityConsent ?? true),
      };

      await vendorService.saveCommercial(payload);
      toast.success('Commercial & Financial Settlement Saved', {
        description: 'Banking credentials, trade terms and compliance declarations saved in relational database.',
      });
      onNext();
      // ✅ Update overall dossier progress percentage (Step 5 of 6 ≈ 83%)
      onDossierChange?.(5, 83);
    } catch (err: any) {
      console.error('Backend save error:', err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Could not save commercial details to database.';
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
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/80 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <PhoneCall className="size-5 text-primary-700" />
              <h3 className="text-base font-bold text-slate-900">
                1. Departmental Business Points of Contact
              </h3>
              <span className="text-[11px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200">
                {(data.departmentContacts || []).length} { (data.departmentContacts || []).length === 1 ? 'Contact Added' : 'Contacts Added'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Add authorized functional department leads (Sales, Procurement, Accounts, Quality) for commercial and operational engagements.
            </p>
          </div>
        </div>

        {/* The Form to Fill and Store Contact in Database */}
        <div className="rounded-2xl border border-primary-200/90 bg-gradient-to-br from-primary-50/40 via-white to-slate-50/60 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-primary-100/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Plus className="size-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Add Department Contact</h4>
                <p className="text-[11px] text-slate-500">Fill contact details and click Save Contact to persist to database</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department Function <span className="text-rose-500">*</span>
              </label>
              <Select
                value={newContact.department}
                onChange={(e) => setNewContact({ ...newContact, department: e.target.value })}
                options={STANDARD_DEPARTMENTS.map((dept) => ({
                  value: dept,
                  label: dept,
                }))}
                className="text-xs font-semibold"
              />
              {newContact.department === 'Custom / Other' && (
                <Input
                  value={customDept}
                  onChange={(e) => setCustomDept(e.target.value)}
                  placeholder="e.g. Legal & Compliance"
                  className="text-xs mt-1.5"
                />
              )}
            </div>

            {/* Contact Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact Person Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 size-3.5 text-slate-400 pointer-events-none" />
                <Input
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="e.g. Siddharth Rao"
                  className="text-xs pl-8.5 font-medium"
                />
              </div>
            </div>

            {/* Designation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Designation / Job Role
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 size-3.5 text-slate-400 pointer-events-none" />
                <Input
                  value={newContact.designation}
                  onChange={(e) => setNewContact({ ...newContact, designation: e.target.value })}
                  placeholder="e.g. VP — Global Sales"
                  className="text-xs pl-8.5 font-medium"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Corporate Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-3.5 text-slate-400 pointer-events-none" />
                <Input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  placeholder="e.g. sales@company.com"
                  className="text-xs pl-8.5 font-mono"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Direct Mobile / Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 size-3.5 text-slate-400 pointer-events-none" />
                <Input
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="e.g. +91 98201 44825"
                  className="text-xs pl-8.5 font-mono"
                />
              </div>
            </div>

            {/* Primary Toggle & Action Button */}
            <div className="flex flex-col justify-end gap-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <Checkbox
                  checked={newContact.isPrimary}
                  onChange={(checked) => setNewContact({ ...newContact, isPrimary: !!checked })}
                />
                <span>Primary Escalation Lead</span>
              </label>

              <Button
                type="button"
                size="sm"
                onClick={handleAddContact}
                disabled={isAddingContact}
                className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-xs w-full sm:w-auto self-start"
              >
                {isAddingContact ? (
                  <>
                    <Loader2 className="size-3.5 mr-1.5 animate-spin" /> Saving Contact...
                  </>
                ) : (
                  <>
                    <Plus className="size-3.5 mr-1.5" /> Save Contact to Database
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Saved Department Contacts Display */}
        {(data.departmentContacts && data.departmentContacts.length > 0) && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Saved Department Contacts ({(data.departmentContacts || []).length})
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.departmentContacts.map((contact, idx) => (
                <div
                  key={contact.id || idx}
                  className={`rounded-xl border p-4 transition-all shadow-xs space-y-2.5 ${
                    contact.isPrimary
                      ? 'border-primary-400 bg-gradient-to-b from-primary-50/40 to-white ring-1 ring-primary-300/50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-primary-900 bg-primary-100/80 px-2 py-0.5 rounded border border-primary-200 inline-flex items-center gap-1.5">
                        <Building2 className="size-3 text-primary-700" />
                        {contact.department}
                      </span>
                      {contact.isPrimary && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">
                          <Star className="size-2.5 fill-amber-500 text-amber-500" />
                          Primary Lead
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveContact(idx, contact.id)}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-md transition-colors cursor-pointer"
                      title="Remove contact"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-full bg-primary-100/70 border border-primary-200 flex items-center justify-center text-primary-800 font-bold text-xs shrink-0">
                      {contact.name ? contact.name.charAt(0).toUpperCase() : <User className="size-3.5 text-primary-700" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-slate-900 text-xs truncate">
                        {contact.name || 'Official Contact'}
                      </h5>
                      <p className="text-slate-500 text-[11px] truncate flex items-center gap-1 mt-0.5">
                        <Briefcase className="size-3 text-slate-400 shrink-0" />
                        {contact.designation || 'Representative'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-600 min-w-0">
                      <Mail className="size-3 text-slate-400 shrink-0" />
                      <span className="font-mono text-primary-700 truncate">{contact.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 min-w-0">
                      <Phone className="size-3 text-slate-400 shrink-0" />
                      <span className="font-mono text-slate-800 truncate">{contact.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bank Branch Location</label>
            <Input
              value={data.bankBranch || ''}
              onChange={(e) => onChange({ bankBranch: e.target.value })}
              placeholder="e.g. Nariman Point Branch, Mumbai"
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Settlement Country</label>
            <Input
              value={data.bankCountry || 'India'}
              onChange={(e) => onChange({ bankCountry: e.target.value })}
              placeholder="India"
              className="text-xs"
            />
          </div>
        </div>

        {/* Bank Proof Document Upload (Cancelled Cheque / Bank Statement) */}
        <div className="rounded-lg bg-white p-3.5 border border-slate-200 space-y-2 mt-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                <FileCheck2 className="size-3.5 text-primary-600" />
                Statutory Bank Account Proof (Cancelled Cheque / Bank Statement)
              </span>
              <p className="text-[10px] text-slate-400">
                Attach cancelled cheque or official statement showing account holder, account number & IFSC/SWIFT code.
              </p>
            </div>
            <input
              ref={bankProofInputRef}
              type="file"
              accept=".pdf,application/pdf,image/*"
              className="hidden"
              onChange={handleBankProofSelect}
            />
          </div>

          {data.bankProofDoc ? (
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-300 bg-emerald-50/70 text-emerald-900 text-xs">
              <div className="flex items-center gap-2 truncate">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span className="font-semibold truncate">
                  Bank Proof Attached: {data.bankProofDoc.split('/').pop()}
                </span>
                <a
                  href={vendorService.getFullImageUrl(data.bankProofDoc)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-primary-700 underline font-medium hover:text-primary-800 ml-2"
                >
                  View Document
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
                  title="Remove proof document"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => bankProofInputRef.current?.click()}
              className="border border-dashed border-slate-300 rounded-lg p-3 text-center cursor-pointer hover:bg-slate-50 hover:border-primary-400 transition-colors"
            >
              <UploadCloud className="size-5 text-slate-400 mx-auto mb-1" />
              <span className="text-xs font-semibold text-primary-700 hover:underline">
                {uploadingBankProof ? 'Uploading Bank Proof Document...' : 'Click to Upload Cancelled Cheque / Statement PDF or Image'}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Accepted: PDF, JPG, PNG (Max 15 MB) - Encrypted and stored securely in audit vault
              </p>
            </div>
          )}
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
          disabled={isSaving}
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
          {isSaving ? (
            <>
              <Loader2 className="size-3.5 mr-1.5 animate-spin" />
              Saving Commercial Details...
            </>
          ) : (
            'Save & Continue to Documents & Review'
          )}
        </Button>
      </div>
    </div>
  );
}
