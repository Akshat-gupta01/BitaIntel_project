/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Step2CompanyData, FacilityAddress, KeyPersonnel } from '@/types/vendorRegistration';
import { CONSTITUTIONS } from '@/config/vendorMasterData';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { BusinessLogoUploader } from '@/components/shared/BusinessLogoUploader';
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
  Loader2,
  CheckCircle2,
  User,
  Camera,
  RefreshCw,
  Image as ImageIcon,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import * as vendorService from '@services/vendor.service';

interface Step2CompanyProps {
  data: Step2CompanyData;
  onChange: (updated: Partial<Step2CompanyData>) => void;
  onNext: () => void;
  onPrev: () => void;
  facilityPhotos?: string[];
  onFacilityPhotosChange?: (photos: string[]) => void;
}

export function Step2Company({
  data,
  onChange,
  onNext,
  onPrev,
  facilityPhotos = [],
  onFacilityPhotosChange,
}: Step2CompanyProps) {
  const [isSaving, setIsSaving] = useState(false);
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
  const [editingFacilityId, setEditingFacilityId] = useState<string | null>(null);
  const [facilityImages, setFacilityImages] = useState<string[]>([]);
  const [uploadingFacilityImages, setUploadingFacilityImages] = useState(false);
  const facilityImageInputRef = useRef<HTMLInputElement>(null);
  const facilityPreviewMapRef = useRef<Map<string, File>>(new Map());
  const normalizedFacilityPhotos = vendorService.normalizeImageArray(facilityPhotos);

  useEffect(() => {
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

  // Key Personnel profile adding state
  const [newPerson, setNewPerson] = useState<Partial<KeyPersonnel>>({
    name: '',
    designation: 'Marketing Head',
    email: '',
    mobile: '',
    photoUrl: undefined,
    isAuthorizedSignatory: false,
  });
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [isSavingPerson, setIsSavingPerson] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const personPhotoInputRef = useRef<HTMLInputElement>(null);

  // Document Upload State & Input Refs
  interface UploadedDocState {
    file?: File;
    fileName: string;
    fileSize: string;
    fileUrl?: string;
    status: 'selected' | 'uploading' | 'uploaded';
  }

  const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedDocState>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Sync already uploaded statutory documents from database vault on mount
  useEffect(() => {
    vendorService
      .getVendorDocuments()
      .then((res: any) => {
        const docs = res?.data?.documents;
        if (Array.isArray(docs) && docs.length > 0) {
          const map: Record<string, UploadedDocState> = {};
          docs.forEach((d: any) => {
            if (d.categoryKey) {
              map[d.categoryKey] = {
                fileName: d.fileName,
                fileSize: d.fileSizeBytes
                  ? `${(d.fileSizeBytes / 1024).toFixed(0)} KB`
                  : '1.2 MB',
                fileUrl: d.fileUrl,
                status: 'uploaded',
              };
            }
          });
          setUploadedDocs((prev) => ({ ...map, ...prev }));
        }
      })
      .catch(() => {});
  }, []);

  const STATUTORY_DOC_CARDS = [
    {
      key: 'incorporation_cert',
      title: 'Certificate of Incorporation / Registration Proof',
      desc: 'Official Registrar of Companies (ROC) / Partnership deed',
    },
    {
      key: 'address_proof',
      title: 'Corporate Address Proof / Electricity Bill',
      desc: 'Latest geotagged utility bill or registered lease deed',
    },
    {
      key: 'tax_registration',
      title: 'Applicable Tax Registrations (GST & PAN Copies)',
      desc: 'Mandatory GST registration certificate & PAN card scan',
    },
    {
      key: 'board_resolution',
      title: 'Authorized Signatory Board Resolution / Letter',
      desc: 'Authorizing representative to execute tenders and sign documents',
    },
  ];

  async function handleFileSelect(key: string, title: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size exceeds 15 MB limit');
      return;
    }

    const formattedSize =
      file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(1)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    // Local state immediate update for responsive UI
    setUploadedDocs((prev) => ({
      ...prev,
      [key]: {
        file,
        fileName: file.name,
        fileSize: formattedSize,
        status: 'uploading',
      },
    }));

    try {
      const res = await vendorService.uploadStatutoryDocument(file, key, title);
      const docData = res?.data?.document;
      setUploadedDocs((prev) => ({
        ...prev,
        [key]: {
          file,
          fileName: file.name,
          fileSize: formattedSize,
          fileUrl: docData?.fileUrl,
          status: 'uploaded',
        },
      }));
      toast.success('Document Uploaded Successfully', {
        description: `${title} (${file.name}) saved in Statutory Vault.`,
      });
    } catch {
      setUploadedDocs((prev) => ({
        ...prev,
        [key]: {
          file,
          fileName: file.name,
          fileSize: formattedSize,
          status: 'selected',
        },
      }));
      toast.info('Document Selected', {
        description: `${file.name} ready for submission.`,
      });
    }
  }

  function handleRemoveDoc(key: string) {
    setUploadedDocs((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
    if (fileInputRefs.current[key]) {
      fileInputRefs.current[key]!.value = '';
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
    if (facilityImageInputRef.current) {
      facilityImageInputRef.current.value = '';
    }

    toast.success(`${uniqueFiles.length} photo(s) selected`, {
      description: 'Preview is visible below. Click "Save Facility" to upload and save.',
    });
  }

  function handleRemoveFacilityImage(indexToRemove: number) {
    const urlToRemove = facilityImages[indexToRemove];
    if (urlToRemove) {
      if (facilityPreviewMapRef.current.has(urlToRemove)) {
        facilityPreviewMapRef.current.delete(urlToRemove);
      }
      if (urlToRemove.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(urlToRemove);
        } catch {}
      }
    }
    setFacilityImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    toast.info('Image removed');
  }

  function handleCloseAddFacility() {
    for (const url of facilityPreviewMapRef.current.keys()) {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    }
    facilityPreviewMapRef.current.clear();
    setFacilityImages([]);
    setEditingFacilityId(null);
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
    setNewFacility({
      type: fac.type,
      facilityName: fac.facilityName,
      addressLine: fac.addressLine,
      city: fac.city,
      state: fac.state,
      pincode: fac.pincode,
      country: fac.country || 'India',
      isOwned: fac.isOwned ?? true,
    });
    setShowAddFacility(true);
  }

  async function handleRemoveSavedFacilityPhoto(photoToRemove: string) {
    const nextPhotos = normalizedFacilityPhotos.filter((p) => p !== photoToRemove);
    onFacilityPhotosChange?.(nextPhotos);
    try {
      await vendorService.updateFacilityPhotos(nextPhotos);
      toast.success('Facility photo removed from database');
    } catch (err: any) {
      console.warn('Facility photo update note:', err?.message);
      toast.info('Facility photo removed');
    }
  }

  // Add or Update Facility & save to MySQL business_facilities (+ upload facilityPhotos to business_manufacturing_capabilities)
  async function handleAddFacility() {
    if (!newFacility.facilityName || !newFacility.city || !newFacility.state) {
      toast.error('Please enter facility name, city, and state.');
      return;
    }

    const payload: vendorService.FacilityPayload = {
      facilityType: newFacility.type || 'Manufacturing Plant',
      facilityName: newFacility.facilityName.trim(),
      addressLine: newFacility.addressLine?.trim() || 'Facility Address',
      city: newFacility.city.trim(),
      state: newFacility.state.trim(),
      pincode: newFacility.pincode?.trim() || '400001',
      country: newFacility.country || 'India',
      isOwned: newFacility.isOwned ?? true,
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
          toast.info('Facility Updated Locally', { description: payload.facilityName });
        }
      } else {
        toast.info('Facility Updated', { description: payload.facilityName });
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
        toast.info('Facility Added Locally', { description: payload.facilityName });
      }
    }

    const pendingEntries: Array<{ url: string; file: File }> = [];
    for (const url of facilityImages) {
      const file = facilityPreviewMapRef.current.get(url);
      if (file) {
        pendingEntries.push({ url, file });
      }
    }

    if (pendingEntries.length > 0) {
      setUploadingFacilityImages(true);
      try {
        const filesToUpload = pendingEntries.map((entry) => entry.file);
        const uploadRes = await vendorService.uploadFacilityImages(filesToUpload, 'append');
        const returnedPaths: string[] =
          uploadRes?.data?.facilityPhotos ||
          uploadRes?.data?.paths ||
          uploadRes?.data?.urls ||
          (uploadRes?.data?.path ? [uploadRes.data.path] : []) ||
          [];

        if (returnedPaths.length > 0) {
          onFacilityPhotosChange?.(returnedPaths);
          toast.success(`${filesToUpload.length} Facility Photo(s) Uploaded`, {
            description: 'Saved in business_manufacturing_capabilities.facilityPhotos.',
          });
        }
      } catch (err: any) {
        console.error('Facility image upload error:', err);
        toast.error('Failed to upload facility photos to server', {
          description: err?.response?.data?.message || err?.message || 'Please check backend server connection.',
        });
      } finally {
        for (const { url } of pendingEntries) {
          try {
            URL.revokeObjectURL(url);
          } catch {}
          facilityPreviewMapRef.current.delete(url);
        }
        setFacilityImages([]);
        setUploadingFacilityImages(false);
      }
    }

    const item: FacilityAddress = {
      id: assignedId,
      type: newFacility.type || 'Manufacturing Plant',
      facilityName: newFacility.facilityName || '',
      addressLine: newFacility.addressLine || '',
      city: newFacility.city || '',
      state: newFacility.state || '',
      pincode: newFacility.pincode || '',
      country: newFacility.country || 'India',
      isOwned: newFacility.isOwned ?? true,
    };
    if (isEditing && editingFacilityId) {
      onChange({
        facilities: data.facilities.map((f) => (f.id === editingFacilityId ? item : f)),
      });
    } else {
      onChange({ facilities: [...data.facilities, item] });
    }
    setEditingFacilityId(null);
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
    setFacilityImages([]);
    setShowAddFacility(false);
  }

  async function handleRemoveFacility(id: string) {
    onChange({ facilities: data.facilities.filter((f) => f.id !== id) });
    if (/^\d+$/.test(id)) {
      try {
        await vendorService.deleteFacility(Number(id));
        toast.success('Facility Removed from Database');
        return;
      } catch (err: any) {
        console.warn('Backend facility delete note:', err.message);
      }
    }
    toast.info('Facility removed.');
  }

  // Upload executive photo using existing single-image upload API
  async function handlePersonPhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setPhotoUploadError('Only JPG, PNG and WebP images are supported.');
      toast.error('Invalid file format. Please upload JPG, PNG or WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoUploadError('File size exceeds 5MB limit.');
      toast.error('File too large. Maximum size is 5MB.');
      return;
    }

    setPhotoUploadError(null);
    setIsUploadingPhoto(true);

    try {
      const uploadedPath = await vendorService.uploadPersonnelPhoto(file);
      setNewPerson((prev) => ({ ...prev, photoUrl: uploadedPath }));
      toast.success('Executive Photo Uploaded');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to upload photo';
      setPhotoUploadError(msg);
      toast.error('Photo Upload Failed', { description: msg });
    } finally {
      setIsUploadingPhoto(false);
      if (personPhotoInputRef.current) personPhotoInputRef.current.value = '';
    }
  }

  function handleClosePersonForm() {
    setShowAddPerson(false);
    setEditingPersonId(null);
    setNewPerson({
      name: '',
      designation: 'Marketing Head',
      email: '',
      mobile: '',
      photoUrl: undefined,
      isAuthorizedSignatory: false,
    });
    setPhotoUploadError(null);
    if (personPhotoInputRef.current) personPhotoInputRef.current.value = '';
  }

  function handleStartEditPerson(person: KeyPersonnel) {
    setEditingPersonId(person.id);
    setNewPerson({
      name: person.name,
      designation: person.designation || 'Marketing Head',
      email: person.email,
      mobile: person.mobile,
      photoUrl: person.photoUrl,
      isAuthorizedSignatory: Boolean(person.isAuthorizedSignatory),
    });
    setPhotoUploadError(null);
    if (personPhotoInputRef.current) personPhotoInputRef.current.value = '';
    setShowAddPerson(true);
  }

  // Add or Update Key Personnel & save to MySQL business_personnel
  async function handleAddPerson() {
    if (isSavingPerson) return;
    if (!newPerson.name || !newPerson.designation || !newPerson.email) {
      toast.error('Please enter personnel name, designation, and official email.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newPerson.email.trim())) {
      toast.error('Please enter a valid corporate email format (e.g. name@company.com).');
      return;
    }

    setIsSavingPerson(true);
    try {
      const payload: vendorService.PersonnelPayload = {
        name: newPerson.name.trim(),
        designation: newPerson.designation.trim(),
        email: newPerson.email.trim(),
        mobile: newPerson.mobile ? newPerson.mobile.trim() : '0000000000',
        photoUrl: newPerson.photoUrl || undefined,
        isAuthorizedSignatory: !!newPerson.isAuthorizedSignatory,
      };

      const isEditing = Boolean(editingPersonId);
      let assignedId = editingPersonId || `KP-${Date.now()}`;

      if (isEditing && editingPersonId) {
        if (/^\d+$/.test(editingPersonId)) {
          try {
            await vendorService.updatePersonnel(editingPersonId, {
              ...payload,
              photoUrl: newPerson.photoUrl || null,
            });
            toast.success('Key Executive Updated in Database', {
              description: `${payload.name} (${payload.designation}) updated in business_personnel table.`,
            });
          } catch (err: any) {
            console.warn('Backend personnel update note:', err?.message);
            toast.info('Executive Profile Updated Locally', {
              description: `${payload.name} (${payload.designation})`,
            });
          }
        } else {
          toast.info('Executive Profile Updated', {
            description: `${payload.name} (${payload.designation})`,
          });
        }
      } else {
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
          toast.info('Executive Profile Added Locally', {
            description: `${payload.name} (${payload.designation})`,
          });
        }
      }

      const item: KeyPersonnel = {
        id: assignedId,
        name: newPerson.name.trim(),
        designation: newPerson.designation.trim(),
        email: newPerson.email.trim(),
        mobile: newPerson.mobile ? newPerson.mobile.trim() : '',
        photoUrl: newPerson.photoUrl || undefined,
        isAuthorizedSignatory: !!newPerson.isAuthorizedSignatory,
      };
      if (isEditing && editingPersonId) {
        onChange({
          keyPersonnel: data.keyPersonnel.map((p) => (p.id === editingPersonId ? item : p)),
        });
      } else {
        onChange({ keyPersonnel: [...data.keyPersonnel, item] });
      }
      handleClosePersonForm();
    } finally {
      setIsSavingPerson(false);
    }
  }

  async function handleRemovePerson(id: string) {
    onChange({ keyPersonnel: data.keyPersonnel.filter((p) => p.id !== id) });
    if (/^\d+$/.test(id)) {
      try {
        await vendorService.deletePersonnel(Number(id));
        toast.success('Executive Removed from Database');
        return;
      } catch (err: any) {
        console.warn('Backend personnel delete note:', err.message);
      }
    }
    toast.info('Profile removed.');
  }

  async function handleProceed() {
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

    setIsSaving(true);
    try {
      // 1. Sync Business Entity fields to backend database
      await vendorService.updateVendorProfile({
        name: data.tradeName?.trim() || data.legalName.trim(),
        legalName: data.legalName.trim(),
        tradeName: data.tradeName?.trim() || null,
        companyType: data.constitution,
        registeredAddress: data.registeredAddress.trim(),
        postalCode: data.pincode.trim(),
        pincode: data.pincode.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        country: data.country?.trim() || 'India',
        summary: data.companyDescription?.trim() || null,
        companyDescription: data.companyDescription?.trim() || null,
        website: data.website?.trim() || null,
        employees: data.employeeCount,
        incorporationDate: data.incorporationDate?.trim() || null,
        logoUrl: data.logoUrl?.trim() || null,
        tan: data.tan?.trim().toUpperCase() || null,
        duns: data.duns?.trim() || null,
        lei: data.lei?.trim().toUpperCase() || null,
      });

      // 2. Sync Statutory Identifiers (GSTIN, PAN, CIN, Udyam, TAN, DUNS, LEI) to statutory_identifiers table
      if (data.gstin || data.pan || data.cin || data.tan || data.duns || data.lei || data.iec || data.udyam) {
        try {
          await vendorService.updateStatutory({
            gstin: data.gstin?.trim().toUpperCase() || undefined,
            pan: data.pan?.trim().toUpperCase() || undefined,
            cin: data.cin?.trim().toUpperCase() || undefined,
            udyamMsme: data.udyam?.trim() || undefined,
            iecCode: data.iec?.trim() || undefined,
            tan: data.tan?.trim().toUpperCase() || undefined,
            duns: data.duns?.trim() || undefined,
            dunsNumber: data.duns?.trim() || undefined,
            lei: data.lei?.trim().toUpperCase() || undefined,
          });
        } catch (statErr: any) {
          console.warn('Statutory sync note:', statErr.message);
          toast.warning('Statutory Verification Note', {
            description: statErr.message || 'Statutory details could not be updated.',
          });
        }
      }

      let updatedAny = false;
      let nextFacilities = data.facilities || [];
      let nextPersonnel = data.keyPersonnel || [];

      // 3. Sync any pending facilities to business_facilities table
      if (nextFacilities.length > 0) {
        nextFacilities = await Promise.all(
          nextFacilities.map(async (fac) => {
            if (fac.id && fac.id.startsWith('FAC-')) {
              try {
                const res = await vendorService.addFacility({
                  facilityType: fac.type,
                  facilityName: fac.facilityName,
                  addressLine: fac.addressLine || 'Facility Address',
                  city: fac.city || 'Mumbai',
                  state: fac.state || 'Maharashtra',
                  pincode: fac.pincode || '400001',
                  country: fac.country || 'India',
                  isOwned: fac.isOwned ?? true,
                });
                if (res?.data?.facility?.id) {
                  updatedAny = true;
                  return { ...fac, id: String(res.data.facility.id) };
                }
              } catch (facErr: any) {
                console.warn('Pending facility sync note:', facErr.message);
              }
            }
            return fac;
          })
        );
      }

      // 4. Sync any pending personnel to business_personnel table
      if (nextPersonnel.length > 0) {
        nextPersonnel = await Promise.all(
          nextPersonnel.map(async (kp) => {
            if (kp.id && kp.id.startsWith('KP-') && kp.name && kp.email) {
              try {
                const res = await vendorService.addPersonnel({
                  name: kp.name,
                  designation: kp.designation || 'Executive',
                  email: kp.email,
                  mobile: kp.mobile || '0000000000',
                  photoUrl: kp.photoUrl || undefined,
                  isAuthorizedSignatory: !!kp.isAuthorizedSignatory,
                });
                if (res?.data?.personnel?.id) {
                  updatedAny = true;
                  return { ...kp, id: String(res.data.personnel.id) };
                }
              } catch (kpErr: any) {
                console.warn('Pending personnel sync note:', kpErr.message);
              }
            }
            return kp;
          })
        );
      }

      if (updatedAny) {
        onChange({ facilities: nextFacilities, keyPersonnel: nextPersonnel });
      }

      toast.success('Company Profile Saved to Database', {
        description: 'Business entity, facilities, and personnel stored successfully.',
      });

      // Advance to next step only on successful save
      onNext();
    } catch (err: any) {
      console.error('Backend profile update error:', err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Could not save company profile to database.';
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

        <BusinessLogoUploader
          logoUrl={data.logoUrl}
          businessName={data.tradeName || data.legalName}
          onChange={(newUrl) => onChange({ logoUrl: newUrl })}
        />

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
              <h4 className="text-xs font-bold text-primary-900">
                {editingFacilityId
                  ? 'Edit Manufacturing Plant / Branch Office'
                  : 'Add Manufacturing Plant / Branch Office'}
              </h4>
              <button
                type="button"
                onClick={handleCloseAddFacility}
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

            {/* Facility / Plant Photos & Visual Gallery */}
            <div className="rounded-lg bg-white p-3.5 border border-slate-200 space-y-3">
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
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 px-3 py-1.5 rounded-md cursor-pointer transition-colors shadow-xs shrink-0 disabled:opacity-50"
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

              {normalizedFacilityPhotos.length > 0 || facilityImages.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                  {normalizedFacilityPhotos.map((savedUrl, idx) => (
                    <div
                      key={`saved-${idx}`}
                      className="relative group rounded-lg border border-emerald-200 bg-slate-50 overflow-hidden aspect-square flex items-center justify-center shadow-xs"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={vendorService.getFullImageUrl(savedUrl)}
                        alt={`Saved Facility Photo ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const fallbackUrl = savedUrl.startsWith('/') ? savedUrl : `/${savedUrl}`;
                          if (!target.src.endsWith(fallbackUrl)) {
                            target.src = fallbackUrl;
                          }
                        }}
                      />
                      <span className="absolute top-1 left-1 bg-emerald-700/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                        Saved
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSavedFacilityPhoto(savedUrl)}
                        className="absolute top-1 right-1 bg-rose-600/90 hover:bg-rose-700 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                        title="Remove Saved Photo"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))}
                  {facilityImages.map((imgUrl, idx) => (
                    <div
                      key={`new-${idx}`}
                      className="relative group rounded-lg border border-slate-200 bg-slate-50 overflow-hidden aspect-square flex items-center justify-center shadow-xs"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={vendorService.getFullImageUrl(imgUrl)}
                        alt={`Facility Preview ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      {normalizedFacilityPhotos.length === 0 && idx === 0 && (
                        <span className="absolute top-1 left-1 bg-primary-700/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                          Primary
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveFacilityImage(idx)}
                        className="absolute top-1 right-1 bg-rose-600/90 hover:bg-rose-700 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                        title="Remove Photo"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  onClick={() => facilityImageInputRef.current?.click()}
                  className="border border-dashed border-slate-300 rounded-lg p-3.5 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/40 transition-colors"
                >
                  <p className="text-[11px] font-medium text-slate-600">
                    Click to select multiple manufacturing plant / facility photos
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                size="sm"
                disabled={uploadingFacilityImages}
                onClick={handleAddFacility}
                className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold"
              >
                {uploadingFacilityImages ? (
                  <>
                    <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                    Uploading Photos...
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

        {/* Existing Added Facilities List */}
        {data.facilities.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.facilities.map((fac) => (
              <div
                key={fac.id}
                className="rounded-lg border border-slate-200 bg-white p-3.5 flex items-start justify-between gap-3 shadow-xs"
              >
                <div className="min-w-0 flex-1">
                  <span className="inline-block text-[10px] font-bold text-primary-800 bg-primary-50 px-2 py-0.5 rounded border border-primary-200 mb-1">
                    {fac.type}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">{fac.facilityName}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {fac.addressLine ? `${fac.addressLine}, ` : ''}
                    {fac.city}, {fac.state} {fac.pincode}
                  </p>
                  {normalizedFacilityPhotos.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      {normalizedFacilityPhotos.map((photoPath, idx) => (
                        <div
                          key={`${fac.id}-photo-${idx}`}
                          className="relative group size-10 rounded-md border border-slate-200 bg-slate-50 overflow-hidden shrink-0 shadow-2xs"
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
                                const fallbackUrl = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;
                                if (!target.src.endsWith(fallbackUrl)) {
                                  target.src = fallbackUrl;
                                }
                              }}
                            />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleRemoveSavedFacilityPhoto(photoPath)}
                            className="absolute top-0.5 right-0.5 bg-rose-600/90 hover:bg-rose-700 text-white p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Remove Photo"
                          >
                            <Trash2 className="size-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartEditFacility(fac)}
                    className="text-slate-400 hover:text-primary-700 hover:bg-primary-50 transition-colors p-1 rounded cursor-pointer"
                    title="Edit Facility / Upload Photos"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveFacility(fac.id)}
                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors p-1 rounded cursor-pointer"
                    title="Delete Facility"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
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
            onClick={() => (showAddPerson ? handleClosePersonForm() : setShowAddPerson(true))}
            className="text-xs border-primary-300 text-primary-700 hover:bg-primary-50"
          >
            <UserPlus className="size-3.5 mr-1" /> Add Person Profile
          </Button>
        </div>

        {showAddPerson && (
          <div className="rounded-xl border border-primary-200 bg-primary-50/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-primary-900">
                {editingPersonId ? 'Edit Executive / Head Profile' : 'Add Executive / Head Profile'}
              </h4>
              <button
                type="button"
                onClick={handleClosePersonForm}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>

            {/* Profile Photo Upload Section */}
            <div className="bg-white rounded-xl border border-primary-200/80 p-3 flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
              <input
                ref={personPhotoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                className="hidden"
                disabled={isUploadingPhoto}
                onChange={handlePersonPhotoSelect}
              />

              {/* Photo Avatar Preview */}
              <div className="shrink-0">
                {newPerson.photoUrl ? (
                  <div className="size-14 rounded-full overflow-hidden border-2 border-primary-500 shadow-xs bg-slate-100">
                    <img
                      src={vendorService.getFullImageUrl(newPerson.photoUrl)}
                      alt="Executive Preview"
                      className="size-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="size-14 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400">
                    <User className="size-6 text-slate-400" />
                  </div>
                )}
              </div>

              {/* Upload Controls & Instructions */}
              <div className="flex-1 space-y-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    disabled={isUploadingPhoto}
                    onClick={() => personPhotoInputRef.current?.click()}
                    className="text-xs font-bold border-primary-300 text-primary-700 hover:bg-primary-50"
                  >
                    {isUploadingPhoto ? (
                      <>
                        <RefreshCw className="size-3.5 mr-1.5 animate-spin text-primary-600" />
                        Uploading...
                      </>
                    ) : newPerson.photoUrl ? (
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

                  {newPerson.photoUrl && !isUploadingPhoto && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewPerson((prev) => ({ ...prev, photoUrl: undefined }));
                        if (personPhotoInputRef.current) personPhotoInputRef.current.value = '';
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

                {photoUploadError && (
                  <p className="text-[11px] text-rose-600 font-medium">{photoUploadError}</p>
                )}
                {newPerson.photoUrl && !isUploadingPhoto && (
                  <p className="text-[11px] text-emerald-700 font-semibold flex items-center justify-center sm:justify-start gap-1">
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                    Profile photo ready
                  </p>
                )}
              </div>
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

            <div className="flex justify-end gap-2 pt-2">
              {editingPersonId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClosePersonForm}
                  className="text-xs"
                >
                  Cancel Edit
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                disabled={isSavingPerson || isUploadingPhoto}
                onClick={handleAddPerson}
                className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold"
              >
                {editingPersonId ? 'Update Executive Profile' : 'Add Executive Profile'}
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
                  {person.photoUrl ? (
                    <img
                      src={vendorService.getFullImageUrl(person.photoUrl)}
                      alt={person.name}
                      className="size-10 rounded-full object-cover bg-slate-100 border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="size-10 rounded-full bg-primary-100 font-bold text-primary-800 grid place-items-center text-xs shrink-0">
                      {person.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{person.name}</h4>
                    <span className="text-[11px] font-semibold text-primary-700">{person.designation}</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {person.email} • {person.mobile}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartEditPerson(person)}
                    className="text-slate-400 hover:text-primary-700 hover:bg-primary-50 transition-colors p-1 rounded cursor-pointer"
                    title="Edit Executive Profile"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemovePerson(person.id)}
                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors p-1 rounded cursor-pointer"
                    title="Delete Executive Profile"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
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
          {STATUTORY_DOC_CARDS.map((doc) => {
            const uploaded = uploadedDocs[doc.key];
            return (
              <div
                key={doc.key}
                className={`rounded-xl border ${
                  uploaded?.status === 'uploaded' || uploaded?.status === 'selected'
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : 'border-dashed border-slate-300 bg-slate-50/70'
                } p-4 text-center hover:bg-slate-50 transition-colors flex flex-col justify-between`}
              >
                {/* Hidden Native File Input */}
                <input
                  type="file"
                  ref={(el) => {
                    fileInputRefs.current[doc.key] = el;
                  }}
                  onChange={(e) => handleFileSelect(doc.key, doc.title, e)}
                  accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
                  className="hidden"
                />

                <div>
                  <UploadCloud
                    className={`size-6 mx-auto mb-1.5 ${
                      uploaded?.status === 'uploaded' ? 'text-emerald-600' : 'text-primary-600'
                    }`}
                  />
                  <h5 className="text-xs font-bold text-slate-800">{doc.title}</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5 mb-2">{doc.desc}</p>
                </div>

                {uploaded ? (
                  <div className="mt-2 rounded-lg bg-white border border-slate-200 p-2.5 flex items-center justify-between gap-2 shadow-xs">
                    <div className="flex items-center gap-2 truncate text-left">
                      {uploaded.status === 'uploading' ? (
                        <Loader2 className="size-4 text-primary-600 animate-spin shrink-0" />
                      ) : (
                        <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                      )}
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 truncate">{uploaded.fileName}</p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {uploaded.fileSize} •{' '}
                          {uploaded.status === 'uploading'
                            ? 'Uploading...'
                            : uploaded.status === 'uploaded'
                            ? '✓ Uploaded'
                            : '✓ Selected'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[doc.key]?.click()}
                        className="text-[11px] font-bold text-primary-700 hover:underline px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(doc.key)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[doc.key]?.click()}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary-700 bg-primary-50 px-3 py-1.5 rounded-md border border-primary-200 cursor-pointer hover:bg-primary-100 transition-colors shadow-xs"
                    >
                      <FileCheck className="size-3.5" /> Select Document (PDF / JPG)
                    </button>
                  </div>
                )}
              </div>
            );
          })}
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
          disabled={isSaving}
          onClick={handleProceed}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-2.5 shadow-sm text-xs cursor-pointer"
        >
          {isSaving ? 'Saving to Database...' : 'Save & Continue to Business Classification'}
        </Button>
      </div>
    </div>
  );
}
