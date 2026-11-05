'use client';

import React, { useState } from 'react';
import { Step2CompanyData, FacilityAddress, KeyPersonnel } from '@/types/vendorRegistration';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Building2,
  MapPin,
  Users,
  Shield,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

interface CompanyProfileTabProps {
  data: Step2CompanyData;
  onUpdate: (updated: Partial<Step2CompanyData>) => void;
}

export function CompanyProfileTab({ data, onUpdate }: CompanyProfileTabProps) {
  const [showAddFacility, setShowAddFacility] = useState(false);
  const [facName, setFacName] = useState('');
  const [facType, setFacType] = useState<'Manufacturing Plant' | 'Branch Office' | 'Warehouse / R&D Unit'>('Manufacturing Plant');
  const [facCity, setFacCity] = useState('');
  const [facState, setFacState] = useState('');
  const [facAddress, setFacAddress] = useState('');

  const [showAddPerson, setShowAddPerson] = useState(false);
  const [pName, setPName] = useState('');
  const [pRole, setPRole] = useState('Marketing Head');
  const [pEmail, setPEmail] = useState('');
  const [pMobile, setPMobile] = useState('');

  function handleSaveFacility() {
    if (!facName || !facCity || !facState) {
      toast.error('Please enter facility name, city, and state.');
      return;
    }
    const newFac: FacilityAddress = {
      id: `FAC-${Date.now()}`,
      type: facType,
      facilityName: facName,
      addressLine: facAddress,
      city: facCity,
      state: facState,
      pincode: '410501',
      country: 'India',
      isOwned: true,
    };
    onUpdate({ facilities: [...data.facilities, newFac] });
    setShowAddFacility(false);
    setFacName('');
    setFacCity('');
    setFacState('');
    setFacAddress('');
    toast.success('Facility added successfully.');
  }

  function handleRemoveFacility(id: string) {
    onUpdate({ facilities: data.facilities.filter((f) => f.id !== id) });
    toast.info('Facility removed.');
  }

  function handleSavePerson() {
    if (!pName || !pEmail) {
      toast.error('Please enter personnel name and official email.');
      return;
    }
    const newP: KeyPersonnel = {
      id: `KP-${Date.now()}`,
      name: pName,
      designation: pRole,
      email: pEmail,
      mobile: pMobile,
      isAuthorizedSignatory: false,
    };
    onUpdate({ keyPersonnel: [...data.keyPersonnel, newP] });
    setShowAddPerson(false);
    setPName('');
    setPEmail('');
    setPMobile('');
    toast.success('Personnel profile added.');
  }

  function handleRemovePerson(id: string) {
    onUpdate({ keyPersonnel: data.keyPersonnel.filter((p) => p.id !== id) });
    toast.info('Personnel removed.');
  }

  return (
    <div className="space-y-6">
      {/* 1. Legal Identity Card */}
      <Card variant="bento" className="p-6 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="size-5 text-primary-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Company Legal Identity & Constitution</h3>
              <p className="text-xs text-slate-500">Statutory incorporation data cross-referenced with MCA records</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            MCA21 Verified
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold">Legal Registered Name</span>
            <span className="font-bold text-slate-900 text-sm">{data.legalName}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] font-semibold">Trade Name / Brand</span>
            <span className="font-semibold text-slate-800">{data.tradeName || '—'}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] font-semibold">Legal Constitution</span>
            <span className="font-semibold text-slate-800">{data.constitution}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] font-semibold">Incorporation Date</span>
            <span className="font-semibold text-slate-800">{data.incorporationDate || '2003-04-14'}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] font-semibold">Corporate Website</span>
            <a
              href={data.website || '#'}
              target="_blank"
              rel="noreferrer"
              className="text-primary-700 underline font-semibold"
            >
              {data.website || 'https://meridiansteel.example.com'}
            </a>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] font-semibold">Employee Headcount</span>
            <span className="font-semibold text-slate-800">{data.employeeCount}</span>
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <span className="text-slate-400 block text-[10px] font-semibold">Company Profile Description</span>
            <p className="text-slate-700 leading-relaxed mt-0.5">{data.companyDescription}</p>
          </div>
        </div>
      </Card>

      {/* 2. Statutory Registrations & Tax IDs */}
      <Card variant="bento" className="p-6 bg-white space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Shield className="size-5 text-primary-700" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Statutory Identifiers & Tax Codes</h3>
            <p className="text-xs text-slate-500">Government portals cross-verification reference numbers</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-semibold text-slate-400 block">GSTIN (15-Digit)</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{data.gstin}</span>
            <span className="text-[10px] font-bold text-emerald-700 block mt-1">✓ Active (GSTN)</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-semibold text-slate-400 block">Corporate PAN</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{data.pan}</span>
            <span className="text-[10px] font-bold text-emerald-700 block mt-1">✓ NSDL Validated</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-semibold text-slate-400 block">CIN / LLPIN (MCA)</span>
            <span className="font-mono font-bold text-slate-900">{data.cin || '—'}</span>
            <span className="text-[10px] text-slate-400 block mt-1">MCA21 Filings</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-semibold text-slate-400 block">Udyam Registration</span>
            <span className="font-mono font-bold text-slate-900">{data.udyam || '—'}</span>
            <span className="text-[10px] text-emerald-700 font-semibold block mt-1">MSME Verified</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-semibold text-slate-400 block">Import Export Code (IEC)</span>
            <span className="font-mono font-bold text-slate-900">{data.iec || '—'}</span>
            <span className="text-[10px] text-primary-700 font-semibold block mt-1">DGFT Valid</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-semibold text-slate-400 block">Tax Deduction (TAN)</span>
            <span className="font-mono font-bold text-slate-900">{data.tan || '—'}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-semibold text-slate-400 block">D-U-N-S Number</span>
            <span className="font-mono font-bold text-slate-900">{data.duns || '—'}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-semibold text-slate-400 block">Legal Entity ID (LEI)</span>
            <span className="font-mono font-bold text-slate-900 truncate block">{data.lei || '—'}</span>
          </div>
        </div>
      </Card>

      {/* 3. Registered Plants & Facility Management */}
      <Card variant="bento" className="p-6 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="size-5 text-primary-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Operating Plants, Warehouses & Regional Offices ({data.facilities.length + 1})
              </h3>
              <p className="text-xs text-slate-500">Physical facility footprints and inspection locations</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddFacility(!showAddFacility)}
            className="text-xs border-primary-300 text-primary-700 hover:bg-primary-50 font-bold"
          >
            <Plus className="size-3.5 mr-1" /> Add Plant / Office
          </Button>
        </div>

        {/* Add Facility Drawer */}
        {showAddFacility && (
          <div className="rounded-xl border border-primary-200 bg-primary-50/70 p-4 space-y-3">
            <h4 className="text-xs font-bold text-primary-950">Add Plant or Operational Office</h4>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Facility Type</label>
                <select
                  value={facType}
                  onChange={(e) => setFacType(e.target.value as any)}
                  className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-white"
                >
                  <option value="Manufacturing Plant">Manufacturing Plant</option>
                  <option value="Branch Office">Branch Office</option>
                  <option value="Warehouse / R&D Unit">Warehouse / R&D Unit</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Facility Name</label>
                <Input
                  value={facName}
                  onChange={(e) => setFacName(e.target.value)}
                  placeholder="e.g. Unit 3: Robotic Finishing Cell"
                  className="text-xs"
                />
              </div>
              <div className="sm:col-span-3">
                <Input
                  value={facAddress}
                  onChange={(e) => setFacAddress(e.target.value)}
                  placeholder="Street / Industrial Zone address"
                  className="text-xs"
                />
              </div>
              <div>
                <Input
                  value={facCity}
                  onChange={(e) => setFacCity(e.target.value)}
                  placeholder="City"
                  className="text-xs"
                />
              </div>
              <div>
                <Input
                  value={facState}
                  onChange={(e) => setFacState(e.target.value)}
                  placeholder="State"
                  className="text-xs"
                />
              </div>
              <div className="flex justify-end items-center">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveFacility}
                  className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold"
                >
                  Save Facility
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {/* Head Office */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-1">
            <span className="text-[10px] font-bold text-primary-800 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
              Registered Corporate Head Office
            </span>
            <h4 className="text-xs font-bold text-slate-900 mt-1">Headquarters & Admin Center</h4>
            <p className="text-xs text-slate-600">
              {data.registeredAddress}, {data.city}, {data.state} {data.pincode}, {data.country}
            </p>
          </div>

          {/* Additional facilities */}
          {data.facilities.map((fac) => (
            <div
              key={fac.id}
              className="rounded-xl border border-slate-200 bg-white p-4 flex items-start justify-between gap-3 shadow-2xs"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {fac.type}
                </span>
                <h4 className="text-xs font-bold text-slate-900 mt-1">{fac.facilityName}</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {fac.addressLine ? `${fac.addressLine}, ` : ''}
                  {fac.city}, {fac.state} {fac.pincode}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveFacility(fac.id)}
                className="text-slate-400 hover:text-rose-600 p-1"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* 4. Key Management & Executive Profiles */}
      <Card variant="bento" className="p-6 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="size-5 text-primary-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Key Management & Functional Department Heads ({data.keyPersonnel.length})
              </h3>
              <p className="text-xs text-slate-500">Executive profiles with contact and authorization details</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddPerson(!showAddPerson)}
            className="text-xs border-primary-300 text-primary-700 hover:bg-primary-50 font-bold"
          >
            <Plus className="size-3.5 mr-1" /> Add Executive Profile
          </Button>
        </div>

        {/* Add Person Drawer */}
        {showAddPerson && (
          <div className="rounded-xl border border-primary-200 bg-primary-50/70 p-4 space-y-3">
            <h4 className="text-xs font-bold text-primary-950">Add Executive Profile</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Input
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="Full Name"
                  className="text-xs"
                />
              </div>
              <div>
                <select
                  value={pRole}
                  onChange={(e) => setPRole(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-white"
                >
                  <option value="Marketing Head">Marketing Head</option>
                  <option value="Purchase Head">Purchase Head</option>
                  <option value="Account Head">Account Head / CFO</option>
                  <option value="Quality / R&D Head">Quality / R&D Head</option>
                  <option value="Director / Promoter">Director / Promoter</option>
                </select>
              </div>
              <div>
                <Input
                  type="email"
                  value={pEmail}
                  onChange={(e) => setPEmail(e.target.value)}
                  placeholder="Official Email"
                  className="text-xs"
                />
              </div>
              <div>
                <Input
                  value={pMobile}
                  onChange={(e) => setPMobile(e.target.value)}
                  placeholder="Direct Mobile"
                  className="text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={handleSavePerson}
                className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold"
              >
                Save Executive
              </Button>
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {data.keyPersonnel.map((person) => (
            <div
              key={person.id}
              className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-full bg-primary-100 text-primary-800 font-extrabold grid place-items-center text-xs">
                  {person.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{person.name}</h4>
                  <span className="text-[11px] font-semibold text-primary-700 block">
                    {person.designation}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {person.email} • {person.mobile}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemovePerson(person.id)}
                className="text-slate-400 hover:text-rose-600 p-1"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
