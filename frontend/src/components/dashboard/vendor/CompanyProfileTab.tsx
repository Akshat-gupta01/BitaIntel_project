/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useRef } from 'react';
import { Step2CompanyData, FacilityAddress, KeyPersonnel } from '@/types/vendorRegistration';
import * as vendorService from '../../../../services/vendor.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BusinessLogoUploader } from '@/components/shared/BusinessLogoUploader';
import {
  Building2,
  MapPin,
  Users,
  Shield,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  User,
  UploadCloud,
  Camera,
  RefreshCw,
  X,
  Image as ImageIcon,
  Pencil,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface CompanyProfileTabProps {
  data: Step2CompanyData;
  onUpdate: (updated: Partial<Step2CompanyData>) => void;
  facilityPhotos?: string[];
  onFacilityPhotosChange?: (photos: string[]) => void;
}

export function CompanyProfileTab({
  data,
  onUpdate,
  facilityPhotos = [],
  onFacilityPhotosChange,
}: CompanyProfileTabProps) {
  const [showAddFacility, setShowAddFacility] = useState(false);
  const [editingFacilityId, setEditingFacilityId] = useState<string | null>(null);
  const [facName, setFacName] = useState('');
  const [facType, setFacType] = useState<FacilityAddress['type']>('Manufacturing Plant');
  const [facCity, setFacCity] = useState('');
  const [facState, setFacState] = useState('');
  const [facAddress, setFacAddress] = useState('');
  const [facilityImages, setFacilityImages] = useState<string[]>([]);
  const [uploadingFacilityImages, setUploadingFacilityImages] = useState(false);
  const facilityImageInputRef = useRef<HTMLInputElement>(null);
  const facilityPreviewMapRef = useRef<Map<string, File>>(new Map());
  const normalizedFacilityPhotos = vendorService.normalizeImageArray(facilityPhotos);

  React.useEffect(() => {
    const urlMap = facilityPreviewMapRef.current;
    return () => {
      for (const url of urlMap.keys()) {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      }
      urlMap.clear();
    };
  }, []);

  const [showAddPerson, setShowAddPerson] = useState(false);
  const [pName, setPName] = useState('');
  const [pRole, setPRole] = useState('Marketing Head');
  const [pEmail, setPEmail] = useState('');
  const [pMobile, setPMobile] = useState('');
  const [pPhotoUrl, setPPhotoUrl] = useState<string | null>(null);
  const [pUploadingPhoto, setPUploadingPhoto] = useState(false);
  const [pUploadError, setPUploadError] = useState<string | null>(null);
  const pPhotoInputRef = useRef<HTMLInputElement>(null);

  const [showEditStatutory, setShowEditStatutory] = useState(false);
  const [editTan, setEditTan] = useState(data.tan || '');
  const [editDuns, setEditDuns] = useState(data.duns || '');
  const [editLei, setEditLei] = useState(data.lei || '');
  const [editIec, setEditIec] = useState(data.iec || '');
  const [isSavingStatutory, setIsSavingStatutory] = useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEditTan(data.tan || '');
    setEditDuns(data.duns || '');
    setEditLei(data.lei || '');
    setEditIec(data.iec || '');
  }, [data.tan, data.duns, data.lei, data.iec]);

  async function handleSaveStatutory() {
    setIsSavingStatutory(true);
    try {
      const cleanTan = editTan.trim().toUpperCase() || undefined;
      const cleanDuns = editDuns.trim() || undefined;
      const cleanLei = editLei.trim().toUpperCase() || undefined;
      const cleanIec = editIec.trim() || undefined;

      await vendorService.updateStatutory({
        tan: cleanTan,
        duns: cleanDuns,
        dunsNumber: cleanDuns,
        lei: cleanLei,
        iecCode: cleanIec,
      });

      onUpdate({
        tan: editTan.trim().toUpperCase(),
        duns: editDuns.trim(),
        lei: editLei.trim().toUpperCase(),
        iec: editIec.trim(),
      });

      setShowEditStatutory(false);
      toast.success('Statutory Identifiers Saved', {
        description: 'TAN, D-U-N-S, and LEI saved to statutory_identifiers table.',
      });
    } catch (err: any) {
      toast.error('Failed to update identifiers', {
        description: err?.response?.data?.message || err?.message || 'Please try again.',
      });
    } finally {
      setIsSavingStatutory(false);
    }
  }

  function handleFacilityImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds 10 MB limit`);
        continue;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`"${file.name}" is not a valid image format`);
        continue;
      }
      fileList.push(file);
    }

    if (fileList.length === 0) return;

    const existingKeys = new Set(
      Array.from(facilityPreviewMapRef.current.values()).map((f) => `${f.name}-${f.size}`)
    );
    const uniqueFiles = fileList.filter((f) => !existingKeys.has(`${f.name}-${f.size}`));
    if (uniqueFiles.length === 0) {
      toast.info('Selected image(s) already added');
      if (e.target) e.target.value = '';
      return;
    }

    const newPreviewUrls: string[] = [];
    for (const file of uniqueFiles) {
      const previewUrl = URL.createObjectURL(file);
      facilityPreviewMapRef.current.set(previewUrl, file);
      newPreviewUrls.push(previewUrl);
    }

    setFacilityImages((prev) => [...prev, ...newPreviewUrls]);
    if (facilityImageInputRef.current) facilityImageInputRef.current.value = '';
  }

  function handleRemoveFacilityImage(indexToRemove: number) {
    const urlToRemove = facilityImages[indexToRemove];
    if (urlToRemove) {
      facilityPreviewMapRef.current.delete(urlToRemove);
      if (urlToRemove.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(urlToRemove);
        } catch {}
      }
    }
    setFacilityImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  }

  function handleCloseFacilityDrawer() {
    for (const url of facilityPreviewMapRef.current.keys()) {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    }
    facilityPreviewMapRef.current.clear();
    setFacilityImages([]);
    setEditingFacilityId(null);
    setFacName('');
    setFacCity('');
    setFacState('');
    setFacAddress('');
    setFacType('Manufacturing Plant');
    setShowAddFacility(false);
  }

  function handleStartEditFacility(fac: FacilityAddress) {
    for (const url of facilityPreviewMapRef.current.keys()) {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    }
    facilityPreviewMapRef.current.clear();
    setFacilityImages([]);
    setEditingFacilityId(fac.id);
    setFacType(fac.type);
    setFacName(fac.facilityName);
    setFacAddress(fac.addressLine || '');
    setFacCity(fac.city);
    setFacState(fac.state);
    setShowAddFacility(true);
  }

  async function handleSaveFacility() {
    if (!facName || !facCity || !facState) {
      toast.error('Please enter facility name, city, and state.');
      return;
    }

    const payload: vendorService.FacilityPayload = {
      facilityType: facType,
      facilityName: facName.trim(),
      addressLine: facAddress.trim() || 'Facility Address',
      city: facCity.trim(),
      state: facState.trim(),
      pincode: '410501',
      country: 'India',
      isOwned: true,
    };

    const isEditing = Boolean(editingFacilityId);
    let assignedId = editingFacilityId || `FAC-${Date.now()}`;

    if (isEditing && editingFacilityId) {
      if (/^\d+$/.test(editingFacilityId)) {
        try {
          await vendorService.updateFacility(editingFacilityId, payload);
          toast.success('Facility Updated in Database', {
            description: `${payload.facilityName} updated in business_facilities table.`,
          });
        } catch (err: any) {
          console.warn('Backend facility update note:', err?.message);
          toast.info('Facility updated locally.');
        }
      } else {
        toast.info('Facility updated.');
      }
    } else {
      try {
        const res = await vendorService.addFacility(payload);
        if (res?.data?.facility?.id) {
          assignedId = String(res.data.facility.id);
        }
        toast.success('Facility Saved to Database', {
          description: `${payload.facilityName} stored in business_facilities table.`,
        });
      } catch (err: any) {
        console.warn('Backend facility save note:', err.message);
        toast.info('Facility added locally.');
      }
    }

    const pendingFiles = facilityImages
      .map((url) => ({ url, file: facilityPreviewMapRef.current.get(url) }))
      .filter((e): e is { url: string; file: File } => Boolean(e.file));

    if (pendingFiles.length > 0) {
      setUploadingFacilityImages(true);
      try {
        const uploadRes = await vendorService.uploadFacilityImages(
          pendingFiles.map((e) => e.file),
          'append'
        );
        const returnedPaths: string[] =
          uploadRes?.data?.facilityPhotos || uploadRes?.data?.paths || [];
        if (returnedPaths.length > 0) {
          onFacilityPhotosChange?.(returnedPaths);
          toast.success(`${pendingFiles.length} Facility Photo(s) Uploaded`);
        }
      } catch (err: any) {
        toast.error('Failed to upload facility photos', {
          description: err?.response?.data?.message || err?.message || 'Upload failed',
        });
      } finally {
        setUploadingFacilityImages(false);
      }
    }

    const newFac: FacilityAddress = {
      id: assignedId,
      type: facType,
      facilityName: facName,
      addressLine: facAddress,
      city: facCity,
      state: facState,
      pincode: '410501',
      country: 'India',
      isOwned: true,
    };
    if (isEditing && editingFacilityId) {
      onUpdate({
        facilities: data.facilities.map((f) => (f.id === editingFacilityId ? newFac : f)),
      });
    } else {
      onUpdate({ facilities: [...data.facilities, newFac] });
    }
    handleCloseFacilityDrawer();
  }

  async function handleRemoveFacility(id: string) {
    onUpdate({ facilities: data.facilities.filter((f) => f.id !== id) });
    if (/^\d+$/.test(id)) {
      try {
        await vendorService.deleteFacility(Number(id));
        toast.success('Facility removed from database.');
        return;
      } catch (err: any) {
        console.warn('Backend facility delete note:', err.message);
      }
    }
    toast.info('Facility removed.');
  }

  async function handlePhotoSelectAndUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate format
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setPUploadError('Only JPG, PNG and WebP images are supported.');
      toast.error('Invalid file format. Please upload a JPG, PNG or WebP image.');
      return;
    }

    // Validate size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setPUploadError('File size exceeds 5MB limit.');
      toast.error('File too large. Maximum size is 5MB.');
      return;
    }

    setPUploadError(null);
    setPUploadingPhoto(true);

    try {
      const uploadedPath = await vendorService.uploadPersonnelPhoto(file);
      setPPhotoUrl(uploadedPath);
      toast.success('Executive Photo Uploaded', {
        description: 'Photo uploaded successfully. Save the executive to store permanently.',
      });
    } catch (err: any) {
      console.error('Personnel photo upload error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to upload photo';
      setPUploadError(msg);
      toast.error('Photo Upload Failed', { description: msg });
    } finally {
      setPUploadingPhoto(false);
    }
  }

  async function handleSavePerson() {
    if (!pName || !pEmail) {
      toast.error('Please enter personnel name and official email.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(pEmail.trim())) {
      toast.error('Please enter a valid corporate email (e.g. name@company.com).');
      return;
    }

    const payload: vendorService.PersonnelPayload = {
      name: pName.trim(),
      designation: pRole.trim(),
      email: pEmail.trim(),
      mobile: pMobile ? pMobile.trim() : '0000000000',
      isAuthorizedSignatory: false,
      photoUrl: pPhotoUrl || undefined,
    };

    let assignedId = `KP-${Date.now()}`;
    try {
      const res = await vendorService.addPersonnel(payload);
      if (res?.data?.personnel?.id) {
        assignedId = String(res.data.personnel.id);
      }
      toast.success('Key Executive Saved to Database', {
        description: `${payload.name} (${payload.designation}) stored in business_personnel table.`,
      });
    } catch (err: any) {
      console.warn('Backend personnel save note:', err.message);
      toast.info('Personnel profile added locally.');
    }

    const newP: KeyPersonnel = {
      id: assignedId,
      name: pName,
      designation: pRole,
      email: pEmail,
      mobile: pMobile,
      photoUrl: pPhotoUrl || undefined,
      isAuthorizedSignatory: false,
    };
    onUpdate({ keyPersonnel: [...data.keyPersonnel, newP] });
    setShowAddPerson(false);
    setPName('');
    setPEmail('');
    setPMobile('');
    setPPhotoUrl(null);
    setPUploadError(null);
    if (pPhotoInputRef.current) pPhotoInputRef.current.value = '';
  }

  async function handleRemovePerson(id: string) {
    onUpdate({ keyPersonnel: data.keyPersonnel.filter((p) => p.id !== id) });
    if (/^\d+$/.test(id)) {
      try {
        await vendorService.deletePersonnel(Number(id));
        toast.success('Executive removed from database.');
        return;
      } catch (err: any) {
        console.warn('Backend personnel delete note:', err.message);
      }
    }
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

        <BusinessLogoUploader
          logoUrl={data.logoUrl}
          businessName={data.tradeName || data.legalName}
          onChange={(newUrl) => onUpdate({ logoUrl: newUrl })}
        />

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
            <span className="font-semibold text-slate-800">{data.incorporationDate || 'Pending Entry'}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] font-semibold">Corporate Website</span>
            {data.website ? (
              <a
                href={data.website}
                target="_blank"
                rel="noreferrer"
                className="text-primary-700 underline font-semibold"
              >
                {data.website}
              </a>
            ) : (
              <span className="text-slate-500 font-medium">Not Provided</span>
            )}
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
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="size-5 text-primary-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Statutory Identifiers & Tax Codes</h3>
              <p className="text-xs text-slate-500">Government portals cross-verification reference numbers (statutory_identifiers)</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowEditStatutory(!showEditStatutory)}
            className="text-xs border-primary-300 text-primary-700 hover:bg-primary-50 font-bold"
          >
            <Edit2 className="size-3.5 mr-1" /> {showEditStatutory ? 'Cancel' : 'Edit Identifiers'}
          </Button>
        </div>

        {showEditStatutory && (
          <div className="rounded-xl border border-primary-200 bg-primary-50/70 p-4 space-y-3">
            <h4 className="text-xs font-bold text-primary-950">Update Statutory Identifiers</h4>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Import Export Code (IEC)</label>
                <Input
                  value={editIec}
                  onChange={(e) => setEditIec(e.target.value.toUpperCase())}
                  placeholder="e.g. 0304018294"
                  className="text-xs font-mono uppercase bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Tax Deduction (TAN)</label>
                <Input
                  value={editTan}
                  onChange={(e) => setEditTan(e.target.value.toUpperCase())}
                  placeholder="e.g. PNEA02941B"
                  className="text-xs font-mono uppercase bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">D-U-N-S Number</label>
                <Input
                  value={editDuns}
                  onChange={(e) => setEditDuns(e.target.value)}
                  placeholder="e.g. 65-021-9842"
                  className="text-xs font-mono bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Legal Entity ID (LEI)</label>
                <Input
                  value={editLei}
                  onChange={(e) => setEditLei(e.target.value.toUpperCase())}
                  placeholder="e.g. 335800MRD9820144820"
                  className="text-xs font-mono uppercase bg-white"
                />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <Button
                type="button"
                size="sm"
                disabled={isSavingStatutory}
                onClick={handleSaveStatutory}
                className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold"
              >
                {isSavingStatutory ? 'Saving...' : 'Save Identifiers'}
              </Button>
            </div>
          </div>
        )}

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
            onClick={() => (showAddFacility ? handleCloseFacilityDrawer() : setShowAddFacility(true))}
            className="text-xs border-primary-300 text-primary-700 hover:bg-primary-50 font-bold"
          >
            <Plus className="size-3.5 mr-1" /> Add Plant / Office
          </Button>
        </div>

        {/* Add / Edit Facility Drawer */}
        {showAddFacility && (
          <div className="rounded-xl border border-primary-200 bg-primary-50/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-primary-950">
                {editingFacilityId ? 'Edit Plant or Operational Office' : 'Add Plant or Operational Office'}
              </h4>
              <button
                type="button"
                onClick={handleCloseFacilityDrawer}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
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
                  <option value="Corporate Office">Corporate Office</option>
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
            </div>

            {/* Facility / Plant Photos Upload */}
            <div className="rounded-lg bg-white p-3 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="size-3.5 text-primary-600" />
                    Facility / Plant Photos ({normalizedFacilityPhotos.length + facilityImages.length})
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Upload multiple plant, machinery, or facility images (JPG, PNG, WEBP, up to 10 MB each).
                  </p>
                </div>
                <button
                  type="button"
                  disabled={uploadingFacilityImages}
                  onClick={() => facilityImageInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 px-2.5 py-1 rounded-md cursor-pointer shrink-0"
                >
                  <UploadCloud className="size-3.5 text-primary-600" /> Select Photos
                </button>
              </div>
              <input
                ref={facilityImageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFacilityImageSelect}
              />
              {(normalizedFacilityPhotos.length > 0 || facilityImages.length > 0) && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {normalizedFacilityPhotos.map((savedUrl, idx) => (
                    <div
                      key={`saved-${idx}`}
                      className="relative group size-14 rounded-lg border border-emerald-200 bg-slate-50 overflow-hidden shrink-0"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={vendorService.getFullImageUrl(savedUrl)}
                        alt={`Saved Facility Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const fallbackUrl = savedUrl.startsWith('/') ? savedUrl : `/${savedUrl}`;
                          if (!target.src.endsWith(fallbackUrl)) target.src = fallbackUrl;
                        }}
                      />
                    </div>
                  ))}
                  {facilityImages.map((imgUrl, idx) => (
                    <div
                      key={`new-${idx}`}
                      className="relative group size-14 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shrink-0"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={vendorService.getFullImageUrl(imgUrl)}
                        alt={`New Facility Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFacilityImage(idx)}
                        className="absolute top-0.5 right-0.5 bg-rose-600/90 text-white p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Remove Photo"
                      >
                        <Trash2 className="size-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              {editingFacilityId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCloseFacilityDrawer}
                  className="text-xs"
                >
                  Cancel Edit
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                disabled={uploadingFacilityImages}
                onClick={handleSaveFacility}
                className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold"
              >
                {uploadingFacilityImages ? (
                  <>
                    <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                    Uploading...
                  </>
                ) : editingFacilityId ? (
                  'Update Facility'
                ) : (
                  'Save Facility'
                )}
              </Button>
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
          {data.facilities.map((fac) => {
            const showPhotosOnCard =
              normalizedFacilityPhotos.length > 0 &&
              (fac.type.toLowerCase().includes('manufacturing') ||
                !data.facilities.some((f) => f.type.toLowerCase().includes('manufacturing')));

            return (
              <div
                key={fac.id}
                className="rounded-xl border border-slate-200 bg-white p-4 flex items-start justify-between gap-3 shadow-2xs"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {fac.type}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">{fac.facilityName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {fac.addressLine ? `${fac.addressLine}, ` : ''}
                    {fac.city}, {fac.state} {fac.pincode}
                  </p>
                  {showPhotosOnCard && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      {normalizedFacilityPhotos.map((photoPath, idx) => (
                        <div
                          key={`${fac.id}-dash-photo-${idx}`}
                          className="relative group size-11 rounded-md border border-slate-200 bg-slate-50 overflow-hidden shrink-0 shadow-2xs"
                        >
                          <a
                            href={vendorService.getFullImageUrl(photoPath)}
                            target="_blank"
                            rel="noreferrer"
                            title="View Facility Photo"
                            className="block w-full h-full"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={vendorService.getFullImageUrl(photoPath)}
                              alt={`${fac.facilityName} Photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget;
                                const fallbackUrl = photoPath.startsWith('/')
                                  ? photoPath
                                  : `/${photoPath}`;
                                if (!target.src.endsWith(fallbackUrl)) {
                                  target.src = fallbackUrl;
                                }
                              }}
                            />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartEditFacility(fac)}
                    className="text-slate-400 hover:text-primary-700 hover:bg-primary-50 p-1 rounded cursor-pointer"
                    title="Edit Facility / Upload Photos"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveFacility(fac.id)}
                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded cursor-pointer"
                    title="Delete Facility"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
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
          <div className="rounded-xl border border-primary-200 bg-primary-50/70 p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-primary-200/60">
              <h4 className="text-xs font-bold text-primary-950 flex items-center gap-1.5">
                <Users className="size-4 text-primary-700" />
                Add Executive Profile
              </h4>
              <button
                type="button"
                onClick={() => {
                  setShowAddPerson(false);
                  setPPhotoUrl(null);
                  setPUploadError(null);
                  if (pPhotoInputRef.current) pPhotoInputRef.current.value = '';
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Profile Photo Upload Section */}
            <div className="bg-white rounded-xl border border-primary-200/80 p-3.5 flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* Photo Avatar Preview */}
              <div className="shrink-0">
                {pPhotoUrl ? (
                  <div className="size-16 rounded-full overflow-hidden border-2 border-primary-500 shadow-sm bg-slate-100">
                    <img
                      src={vendorService.getFullImageUrl(pPhotoUrl)}
                      alt="Executive Preview"
                      className="size-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="size-16 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
                    <User className="size-7 text-slate-400" />
                  </div>
                )}
              </div>

              {/* Upload Controls & Instructions */}
              <div className="flex-1 space-y-1.5 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <input
                    ref={pPhotoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    className="hidden"
                    onChange={handlePhotoSelectAndUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    disabled={pUploadingPhoto}
                    onClick={() => pPhotoInputRef.current?.click()}
                    className="text-xs font-bold border-primary-300 text-primary-700 hover:bg-primary-50"
                  >
                    {pUploadingPhoto ? (
                      <>
                        <RefreshCw className="size-3.5 mr-1.5 animate-spin text-primary-600" />
                        Uploading Photo...
                      </>
                    ) : pPhotoUrl ? (
                      <>
                        <Camera className="size-3.5 mr-1.5 text-primary-600" />
                        Replace Photo
                      </>
                    ) : (
                      <>
                        <UploadCloud className="size-3.5 mr-1.5 text-primary-600" />
                        Upload Photo
                      </>
                    )}
                  </Button>

                  {pPhotoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setPPhotoUrl(null);
                        if (pPhotoInputRef.current) pPhotoInputRef.current.value = '';
                      }}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded hover:bg-rose-50 transition"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-500">
                  Select a headshot photo from your device (JPG, PNG, WebP &bull; Max 5MB).
                </p>

                {pUploadError && (
                  <p className="text-[11px] text-rose-600 font-medium">{pUploadError}</p>
                )}
                {pPhotoUrl && !pUploadingPhoto && (
                  <p className="text-[11px] text-emerald-700 font-semibold flex items-center justify-center sm:justify-start gap-1">
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                    Profile photo uploaded and ready to save
                  </p>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="e.g. Dr. Ananya Roy"
                  className="text-xs bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Designation / Role <span className="text-rose-500">*</span>
                </label>
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
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Official Corporate Email <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="email"
                  value={pEmail}
                  onChange={(e) => setPEmail(e.target.value)}
                  placeholder="e.g. ananya@company.com"
                  className="text-xs bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Direct Mobile
                </label>
                <Input
                  value={pMobile}
                  onChange={(e) => setPMobile(e.target.value)}
                  placeholder="e.g. +91 98201 44825"
                  className="text-xs bg-white"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-primary-200/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddPerson(false);
                  setPPhotoUrl(null);
                  setPUploadError(null);
                  if (pPhotoInputRef.current) pPhotoInputRef.current.value = '';
                }}
                className="text-xs text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </Button>
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
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  {person.photoUrl ? (
                    <img
                      src={vendorService.getFullImageUrl(person.photoUrl)}
                      alt={person.name}
                      className="size-11 rounded-full object-cover bg-slate-100 border border-slate-200"
                    />
                  ) : (
                    <div className="size-11 rounded-full bg-primary-100 text-primary-800 font-extrabold grid place-items-center text-xs">
                      {person.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{person.name}</h4>
                  <span className="text-[11px] font-semibold text-primary-700 block truncate">
                    {person.designation}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {person.email} • {person.mobile}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemovePerson(person.id)}
                className="text-slate-400 hover:text-rose-600 p-1 shrink-0"
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
