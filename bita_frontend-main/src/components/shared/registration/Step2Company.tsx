'use client';

import React, { useState } from 'react';
import { Step2CompanyData, FacilityAddress, KeyPersonnel } from '@/types/vendorRegistration';
import { CONSTITUTIONS } from '@/config/vendorMasterData';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import {
  Building2,
  Plus,
  Trash2,
  MapPin,
  Users,
  FileCheck,
  UploadCloud,
  FileText,
  UserPlus,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface Step2CompanyProps {
  data: Step2CompanyData;
  onChange: (updated: Partial<Step2CompanyData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Step2Company({ data, onChange, onNext, onPrev }: Step2CompanyProps) {
  // Facility / Plant adding state
  const [newFacility, setNewFacility] = useState<Partial<FacilityAddress>>({
    type: 'Manufacturing Plant',
    facilityName: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isOwned: true,
  });
  const [showAddFacility, setShowAddFacility] = useState(false);

  // Key Personnel profile adding state
  const [newPerson, setNewPerson] = useState<Partial<KeyPersonnel>>({
    name: '',
    designation: 'Marketing Head',
    email: '',
    mobile: '',
    isAuthorizedSignatory: false,
  });
  const [showAddPerson, setShowAddPerson] = useState(false);

  // Add Facility
  function handleAddFacility() {
    if (!newFacility.facilityName || !newFacility.city || !newFacility.state) {
      toast.error('Please enter facility name, city, and state.');
      return;
    }
    const item: FacilityAddress = {
      id: `FAC-${Date.now()}`,
      type: newFacility.type || 'Manufacturing Plant',
      facilityName: newFacility.facilityName || '',
      addressLine: newFacility.addressLine || '',
      city: newFacility.city || '',
      state: newFacility.state || '',
      pincode: newFacility.pincode || '',
      country: newFacility.country || 'India',
      isOwned: newFacility.isOwned ?? true,
    };
    onChange({ facilities: [...data.facilities, item] });
    setNewFacility({
      type: 'Manufacturing Plant',
      facilityName: '',
      addressLine: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      isOwned: true,
    });
    setShowAddFacility(false);
    toast.success('Facility / Plant Added', { description: item.facilityName });
  }

  function handleRemoveFacility(id: string) {
    onChange({ facilities: data.facilities.filter((f) => f.id !== id) });
    toast.info('Facility removed.');
  }

  // Add Key Personnel
  function handleAddPerson() {
    if (!newPerson.name || !newPerson.designation || !newPerson.email) {
      toast.error('Please enter personnel name, designation, and official email.');
      return;
    }
    const item: KeyPersonnel = {
      id: `KP-${Date.now()}`,
      name: newPerson.name || '',
      designation: newPerson.designation || '',
      email: newPerson.email || '',
      mobile: newPerson.mobile || '',
      isAuthorizedSignatory: !!newPerson.isAuthorizedSignatory,
    };
    onChange({ keyPersonnel: [...data.keyPersonnel, item] });
    setNewPerson({
      name: '',
      designation: 'Marketing Head',
      email: '',
      mobile: '',
      isAuthorizedSignatory: false,
    });
    setShowAddPerson(false);
    toast.success('Key Executive Added', { description: `${item.name} (${item.designation})` });
  }

  function handleRemovePerson(id: string) {
    onChange({ keyPersonnel: data.keyPersonnel.filter((p) => p.id !== id) });
    toast.info('Profile removed.');
  }

  function handleProceed() {
    if (!data.legalName.trim()) {
      toast.error('Please enter legal registered business name.');
      return;
    }
    if (!data.pan.trim()) {
      toast.error('Please enter Corporate PAN.');
      return;
    }
    if (!data.gstin.trim()) {
      toast.error('Please enter GSTIN.');
      return;
    }
    if (!data.registeredAddress.trim() || !data.city.trim() || !data.pincode.trim()) {
      toast.error('Please complete registered address details (address, city, PIN code).');
      return;
    }
    onNext();
  }

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="border-b border-slate-200/80 pb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-200">
          Step 2 of 6
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
          Account & Company Profile
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Company legal identity, statutory tax registrations, registered facilities, key management, and foundational documents.
        </p>
      </div>

      {/* Section 1: Company Identity */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <Building2 className="size-4 text-primary-700" />
          <h3 className="text-sm font-bold text-slate-900">1. Company Identity & Constitution</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Legal Registered Name <span className="text-rose-500">*</span>
            </label>
            <Input
              value={data.legalName}
              onChange={(e) => onChange({ legalName: e.target.value })}
              placeholder="e.g. Meridian Advanced Materials & Steelworks Pvt. Ltd."
              className="text-sm font-medium"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">Exact name as per MCA / PAN record</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Trade Name / Brand Name
            </label>
            <Input
              value={data.tradeName}
              onChange={(e) => onChange({ tradeName: e.target.value })}
              placeholder="e.g. Meridian Steel Works"
              className="text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Legal Constitution / Structure <span className="text-rose-500">*</span>
            </label>
            <Select
              value={data.constitution}
              onChange={(e) => onChange({ constitution: e.target.value })}
              options={CONSTITUTIONS.map((c) => ({ value: c, label: c }))}
              className="text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Incorporation / Establishment Date
            </label>
            <Input
              type="date"
              value={data.incorporationDate}
              onChange={(e) => onChange({ incorporationDate: e.target.value })}
              className="text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Official Corporate Website
            </label>
            <Input
              value={data.website}
              onChange={(e) => onChange({ website: e.target.value })}
              placeholder="e.g. https://www.meridiansteel.com"
              className="text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Employee Headcount Range
            </label>
            <Select
              value={data.employeeCount}
              onChange={(e) => onChange({ employeeCount: e.target.value })}
              options={[
                { value: '1–10 employees', label: 'Micro (1–10 employees)' },
                { value: '11–50 employees', label: 'Small (11–50 employees)' },
                { value: '51–250 employees', label: 'Medium (51–250 employees)' },
                { value: '251–1,000 employees', label: 'Mid-Corporate (251–1,000)' },
                { value: '1,000+ employees', label: 'Enterprise (1,000+ employees)' },
              ]}
              className="text-sm font-medium"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Company Brief Description
            </label>
            <textarea
              rows={2}
              value={data.companyDescription}
              onChange={(e) => onChange({ companyDescription: e.target.value })}
              placeholder="Summarize your company's core operational capabilities, primary industries served, and value proposition..."
              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Statutory Business Identity */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <Shield className="size-4 text-primary-700" />
          <h3 className="text-sm font-bold text-slate-900">2. Statutory Business Identity & Registrations</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              GSTIN <span className="text-rose-500">*</span>
            </label>
            <Input
              value={data.gstin}
              onChange={(e) => onChange({ gstin: e.target.value.toUpperCase() })}
              placeholder="e.g. 27AABCM8291Q1Z4"
              className="text-xs font-mono uppercase"
              maxLength={15}
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">15-digit Goods & Services Tax ID</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Corporate PAN <span className="text-rose-500">*</span>
            </label>
            <Input
              value={data.pan}
              onChange={(e) => onChange({ pan: e.target.value.toUpperCase() })}
              placeholder="e.g. AABCM8291Q"
              className="text-xs font-mono uppercase"
              maxLength={10}
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">10-digit Permanent Account Number</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              CIN / LLPIN (MCA Registration)
            </label>
            <Input
              value={data.cin}
              onChange={(e) => onChange({ cin: e.target.value.toUpperCase() })}
              placeholder="e.g. U27100PN2003PTC148921"
              className="text-xs font-mono uppercase"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Corporate Identity Number</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Udyam Registration (MSME)
            </label>
            <Input
              value={data.udyam}
              onChange={(e) => onChange({ udyam: e.target.value.toUpperCase() })}
              placeholder="e.g. UDYAM-MH-26-0038921"
              className="text-xs font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Import Export Code (IEC)
            </label>
            <Input
              value={data.iec}
              onChange={(e) => onChange({ iec: e.target.value.toUpperCase() })}
              placeholder="e.g. 0304018294"
              className="text-xs font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tax Deduction Account (TAN)
            </label>
            <Input
              value={data.tan}
              onChange={(e) => onChange({ tan: e.target.value.toUpperCase() })}
              placeholder="e.g. PNEA02941B"
              className="text-xs font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              D-U-N-S Number (Dun & Bradstreet)
            </label>
            <Input
              value={data.duns}
              onChange={(e) => onChange({ duns: e.target.value })}
              placeholder="e.g. 65-021-9842"
              className="text-xs font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Legal Entity Identifier (LEI)
            </label>
            <Input
              value={data.lei}
              onChange={(e) => onChange({ lei: e.target.value.toUpperCase() })}
              placeholder="e.g. 335800MRD9820144820 (20-character global LEI)"
              className="text-xs font-mono uppercase"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Registered Addresses & Dynamic Plant/Office Add */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-primary-700" />
            <h3 className="text-sm font-bold text-slate-900">3. Registered Addresses & Manufacturing Facilities</h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddFacility(!showAddFacility)}
            className="text-xs border-primary-300 text-primary-700 hover:bg-primary-50"
          >
            <Plus className="size-3.5 mr-1" /> Add Plant or Office
          </Button>
        </div>

        {/* Primary Registered Office */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Registered Head Office Address <span className="text-rose-500">*</span>
          </span>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                value={data.registeredAddress}
                onChange={(e) => onChange({ registeredAddress: e.target.value })}
                placeholder="Street address, industrial estate, plot/suite number"
                className="text-xs"
              />
            </div>
            <div>
              <Input
                value={data.city}
                onChange={(e) => onChange({ city: e.target.value })}
                placeholder="City (e.g. Pune)"
                className="text-xs"
              />
            </div>
            <div>
              <Input
                value={data.state}
                onChange={(e) => onChange({ state: e.target.value })}
                placeholder="State / Province (e.g. Maharashtra)"
                className="text-xs"
              />
            </div>
            <div>
              <Input
                value={data.pincode}
                onChange={(e) => onChange({ pincode: e.target.value })}
                placeholder="Postal PIN Code"
                className="text-xs"
              />
            </div>
            <div>
              <Input
                value={data.country}
                onChange={(e) => onChange({ country: e.target.value })}
                placeholder="Country (e.g. India)"
                className="text-xs"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Facility Adder Form */}
        {showAddFacility && (
          <div className="rounded-xl border border-primary-200 bg-primary-50/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-primary-900">Add Manufacturing Plant / Branch Office</h4>
              <button
                type="button"
                onClick={() => setShowAddFacility(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Facility Type</label>
                <Select
                  value={newFacility.type}
                  onChange={(e) => setNewFacility({ ...newFacility, type: e.target.value as any })}
                  options={[
                    { value: 'Manufacturing Plant', label: 'Manufacturing Plant / Factory' },
                    { value: 'Branch Office', label: 'Branch / Regional Office' },
                    { value: 'Warehouse / R&D Unit', label: 'Warehouse / R&D Facility' },
                  ]}
                  className="text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Facility / Plant Name</label>
                <Input
                  value={newFacility.facilityName}
                  onChange={(e) => setNewFacility({ ...newFacility, facilityName: e.target.value })}
                  placeholder="e.g. Unit 2: Precision CNC & Surface Treatment Facility"
                  className="text-xs"
                />
              </div>
              <div className="sm:col-span-3">
                <Input
                  value={newFacility.addressLine}
                  onChange={(e) => setNewFacility({ ...newFacility, addressLine: e.target.value })}
                  placeholder="Street / Industrial Zone Address"
                  className="text-xs"
                />
              </div>
              <div>
                <Input
                  value={newFacility.city}
                  onChange={(e) => setNewFacility({ ...newFacility, city: e.target.value })}
                  placeholder="City"
                  className="text-xs"
                />
              </div>
              <div>
                <Input
                  value={newFacility.state}
                  onChange={(e) => setNewFacility({ ...newFacility, state: e.target.value })}
                  placeholder="State"
                  className="text-xs"
                />
              </div>
              <div>
                <Input
                  value={newFacility.pincode}
                  onChange={(e) => setNewFacility({ ...newFacility, pincode: e.target.value })}
                  placeholder="PIN Code"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                size="sm"
                onClick={handleAddFacility}
                className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold"
              >
                Save Facility
              </Button>
            </div>
          </div>
        )}

        {/* Existing Added Facilities List */}
        {data.facilities.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.facilities.map((fac) => (
              <div
                key={fac.id}
                className="rounded-lg border border-slate-200 bg-white p-3.5 flex items-start justify-between gap-3 shadow-xs"
              >
                <div>
                  <span className="inline-block text-[10px] font-bold text-primary-800 bg-primary-50 px-2 py-0.5 rounded border border-primary-200 mb-1">
                    {fac.type}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">{fac.facilityName}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {fac.addressLine ? `${fac.addressLine}, ` : ''}
                    {fac.city}, {fac.state} {fac.pincode}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFacility(fac.id)}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 4: Key Personnel & Executive Profiles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary-700" />
            <h3 className="text-sm font-bold text-slate-900">4. Key Executives & Functional Department Heads</h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddPerson(!showAddPerson)}
            className="text-xs border-primary-300 text-primary-700 hover:bg-primary-50"
          >
            <UserPlus className="size-3.5 mr-1" /> Add Person Profile
          </Button>
        </div>

        {showAddPerson && (
          <div className="rounded-xl border border-primary-200 bg-primary-50/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-primary-900">Add Executive / Head Profile</h4>
              <button
                type="button"
                onClick={() => setShowAddPerson(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name</label>
                <Input
                  value={newPerson.name}
                  onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                  placeholder="e.g. Dr. Ananya Roy"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Role / Department</label>
                <Select
                  value={newPerson.designation}
                  onChange={(e) => setNewPerson({ ...newPerson, designation: e.target.value })}
                  options={[
                    { value: 'Marketing Head', label: 'Marketing Head / Commercial Lead' },
                    { value: 'Purchase Head', label: 'Purchase Head / Procurement Director' },
                    { value: 'Account Head', label: 'Account Head / CFO / Finance Controller' },
                    { value: 'Quality / R&D Head', label: 'Quality Assurance / R&D Head' },
                    { value: 'Director / Owner', label: 'Director / Promoter / Board Member' },
                  ]}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Official Corporate Email</label>
                <Input
                  type="email"
                  value={newPerson.email}
                  onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
                  placeholder="e.g. ananya@meridiansteel.com"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Direct Mobile</label>
                <Input
                  value={newPerson.mobile}
                  onChange={(e) => setNewPerson({ ...newPerson, mobile: e.target.value })}
                  placeholder="e.g. +91 98201 44825"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                size="sm"
                onClick={handleAddPerson}
                className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold"
              >
                Add Executive Profile
              </Button>
            </div>
          </div>
        )}

        {/* Existing Added Key Personnel */}
        {data.keyPersonnel.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.keyPersonnel.map((person) => (
              <div
                key={person.id}
                className="rounded-lg border border-slate-200 bg-white p-3.5 flex items-start justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary-100 font-bold text-primary-800 grid place-items-center text-xs">
                    {person.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{person.name}</h4>
                    <span className="text-[11px] font-semibold text-primary-700">{person.designation}</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {person.email} • {person.mobile}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePerson(person.id)}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 5: Basic Statutory Documents */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <FileText className="size-4 text-primary-700" />
          <h3 className="text-sm font-bold text-slate-900">5. Foundational Statutory Documents</h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              title: 'Certificate of Incorporation / Registration Proof',
              desc: 'Official Registrar of Companies (ROC) / Partnership deed',
            },
            {
              title: 'Corporate Address Proof / Electricity Bill',
              desc: 'Latest geotagged utility bill or registered lease deed',
            },
            {
              title: 'Applicable Tax Registrations (GST & PAN Copies)',
              desc: 'Mandatory GST registration certificate & PAN card scan',
            },
            {
              title: 'Authorized Signatory Board Resolution / Letter',
              desc: 'Authorizing representative to execute tenders and sign documents',
            },
          ].map((doc, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-4 text-center hover:bg-slate-50 transition-colors"
            >
              <UploadCloud className="size-6 text-primary-600 mx-auto mb-1.5" />
              <h5 className="text-xs font-bold text-slate-800">{doc.title}</h5>
              <p className="text-[11px] text-slate-400 mt-0.5 mb-2">{doc.desc}</p>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-200 cursor-pointer hover:bg-primary-100">
                <FileCheck className="size-3" /> Select Document (PDF / JPG)
              </span>
            </div>
          ))}
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
          Save & Continue to Business Classification
        </Button>
      </div>
    </div>
  );
}
