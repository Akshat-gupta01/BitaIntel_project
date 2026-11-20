'use client';

import React, { useState, useRef } from 'react';
import { QualityCertificateRecord, RegulatoryApproval } from '@/types/vendorRegistration';
import * as vendorService from '../../../../services/vendor.service';
import { STANDARD_CERTIFICATIONS } from '@/config/vendorMasterData';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Award,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Calendar,
  FileCheck2,
  ShieldCheck,
  UploadCloud,
  Pencil,
  Loader2,
  ExternalLink,
  FileCheck,
} from 'lucide-react';
import { toast } from 'sonner';

interface CertificationsQualityTabProps {
  certifications: QualityCertificateRecord[];
  onUpdateCertifications: (certs: QualityCertificateRecord[]) => void;
  testingCapabilities: string;
  qualityAssuranceProcedures: string;
}

export function CertificationsQualityTab({
  certifications,
  onUpdateCertifications,
  testingCapabilities,
  qualityAssuranceProcedures,
}: CertificationsQualityTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCert, setEditingCert] = useState<QualityCertificateRecord | null>(null);
  const [uploadingCertDoc, setUploadingCertDoc] = useState(false);
  const certDocInputRef = useRef<HTMLInputElement | null>(null);
  const [certDocFileName, setCertDocFileName] = useState<string | null>(null);

  const [newCert, setNewCert] = useState<Partial<QualityCertificateRecord>>({
    certificateType: STANDARD_CERTIFICATIONS[0],
    certificateNumber: '',
    issuingAuthority: '',
    issueDate: '',
    expiryDate: '',
    scope: '',
    applicableFacility: 'Unit 1: Chakan Plant',
    evidenceDoc: undefined,
    status: 'Active',
  });

  async function handleCertDocSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error('Certificate file exceeds 15 MB limit');
      return;
    }

    setUploadingCertDoc(true);
    try {
      const res = await vendorService.uploadCertificationDocument(
        file,
        editingCert && /^\d+$/.test(editingCert.id) ? Number(editingCert.id) : undefined
      );
      const docPath = res?.data?.path || res?.data?.url;
      setNewCert((prev) => ({ ...prev, evidenceDoc: docPath }));
      setCertDocFileName(file.name);
      toast.success('Certificate Document Attached', {
        description: `${file.name} uploaded successfully.`,
      });
    } catch (err: any) {
      console.error('Cert doc upload error:', err);
      toast.error('Failed to upload certificate document', { description: err.message });
    } finally {
      setUploadingCertDoc(false);
      if (certDocInputRef.current) certDocInputRef.current.value = '';
    }
  }

  function handleRemoveCertDoc() {
    setNewCert((prev) => ({ ...prev, evidenceDoc: undefined }));
    setCertDocFileName(null);
    if (certDocInputRef.current) certDocInputRef.current.value = '';
    toast.info('Certificate document removed');
  }

  function handleStartEditCert(c: QualityCertificateRecord) {
    setEditingCert(c);
    setNewCert({
      certificateType: c.certificateType,
      certificateNumber: c.certificateNumber,
      issuingAuthority: c.issuingAuthority,
      issueDate: c.issueDate,
      expiryDate: c.expiryDate,
      scope: c.scope,
      applicableFacility: c.applicableFacility,
      evidenceDoc: c.evidenceDoc,
      status: c.status,
    });
    setCertDocFileName(c.evidenceDoc ? c.evidenceDoc.split('/').pop() || 'Attached Document' : null);
    setShowAddModal(true);
  }

  function handleCloseModal() {
    setShowAddModal(false);
    setEditingCert(null);
    setCertDocFileName(null);
    setNewCert({
      certificateType: STANDARD_CERTIFICATIONS[0],
      certificateNumber: '',
      issuingAuthority: '',
      issueDate: '',
      expiryDate: '',
      scope: '',
      applicableFacility: 'Unit 1: Chakan Plant',
      evidenceDoc: undefined,
      status: 'Active',
    });
  }

  async function handleSaveCert() {
    if (!newCert.certificateNumber || !newCert.issuingAuthority || !newCert.expiryDate) {
      toast.error('Please complete certificate number, authority, and expiry date.');
      return;
    }

    const payload: vendorService.CertificationPayload = {
      certificateType: newCert.certificateType || STANDARD_CERTIFICATIONS[0],
      certificateNumber: newCert.certificateNumber || '',
      issuingAuthority: newCert.issuingAuthority || '',
      issueDate: newCert.issueDate || null,
      expiryDate: newCert.expiryDate || null,
      scope: newCert.scope || 'Quality Management & Precision Fabrication',
      applicableFacility: newCert.applicableFacility || 'All Facilities',
      evidenceDoc: newCert.evidenceDoc || null,
      status: (newCert.status as any) || 'Active',
    };

    if (editingCert) {
      if (/^\d+$/.test(editingCert.id)) {
        try {
          await vendorService.updateCertification(Number(editingCert.id), payload);
          toast.success('Certificate Updated in Database', {
            description: `${payload.certificateType} updated in certifications table.`,
          });
        } catch (err: any) {
          console.error('Update cert error:', err);
          toast.error('Failed to update certificate', { description: err.message });
        }
      } else {
        toast.info('Certificate Updated Locally', { description: payload.certificateNumber });
      }

      const updated = certifications.map((c) =>
        c.id === editingCert.id
          ? {
              ...c,
              certificateType: newCert.certificateType || STANDARD_CERTIFICATIONS[0],
              certificateNumber: newCert.certificateNumber || '',
              issuingAuthority: newCert.issuingAuthority || '',
              issueDate: newCert.issueDate || '2024-01-01',
              expiryDate: newCert.expiryDate || '2027-01-01',
              scope: newCert.scope || 'Quality Management & Precision Fabrication',
              applicableFacility: newCert.applicableFacility || 'All Facilities',
              evidenceDoc: newCert.evidenceDoc,
              status: (newCert.status as any) || 'Active',
            }
          : c
      );
      onUpdateCertifications(updated as QualityCertificateRecord[]);
      handleCloseModal();
      return;
    }

    let assignedId = `CERT-${Date.now()}`;
    try {
      const res = await vendorService.addCertification(payload);
      if (res?.data?.certification?.id) {
        assignedId = String(res.data.certification.id);
      }
      toast.success('Quality Certificate Saved to Database', {
        description: `${payload.certificateType} stored in certifications table.`,
      });
    } catch (err: any) {
      console.warn('Backend certification save note:', err.message);
      toast.info('Certificate added locally.');
    }

    const item: QualityCertificateRecord = {
      id: assignedId,
      certificateType: newCert.certificateType || STANDARD_CERTIFICATIONS[0],
      certificateNumber: newCert.certificateNumber || '',
      issuingAuthority: newCert.issuingAuthority || '',
      issueDate: newCert.issueDate || '2024-01-01',
      expiryDate: newCert.expiryDate || '2027-01-01',
      scope: newCert.scope || 'Quality Management & Precision Fabrication',
      applicableFacility: newCert.applicableFacility || 'All Facilities',
      evidenceDoc: newCert.evidenceDoc,
      status: 'Active',
    };
    onUpdateCertifications([...certifications, item]);
    handleCloseModal();
  }

  async function handleRemoveCert(id: string) {
    onUpdateCertifications(certifications.filter((c) => c.id !== id));
    if (/^\d+$/.test(id)) {
      try {
        await vendorService.deleteCertification(Number(id));
        toast.success('Certificate removed from database.');
        return;
      } catch (err: any) {
        console.warn('Backend delete cert error:', err.message);
      }
    }
    toast.info('Certificate removed.');
  }

  return (
    <div className="space-y-6">
      {/* Certifications Management */}
      <Card variant="bento" className="p-6 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Award className="size-5 text-primary-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Quality, Safety & Standards Certifications ({certifications.length})
              </h3>
              <p className="text-xs text-slate-500">
                Audited ISO certifications, Bureau of Indian Standards (BIS), and CE accreditations
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="text-xs font-bold"
          >
            <Plus className="size-3.5 mr-1" /> Add Certificate
          </Button>
        </div>

        {/* Certificate Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certifications.map((c) => {
            const isExpiringSoon = c.status === 'Expiring Soon';

            return (
              <div
                key={c.id}
                className={`rounded-2xl border p-4 space-y-3 transition-all ${
                  isExpiringSoon
                    ? 'border-amber-300 bg-amber-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-bold text-primary-900 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                    {c.certificateType}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEditCert(c)}
                      className="text-slate-400 hover:text-primary-700 hover:bg-primary-50 p-1 rounded cursor-pointer transition-colors"
                      title="Edit Certificate"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveCert(c.id)}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded cursor-pointer transition-colors"
                      title="Delete Certificate"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono font-black text-slate-900">{c.certificateNumber}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Registrar: <strong className="text-slate-700">{c.issuingAuthority}</strong>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Scope: {c.scope}</p>
                  {c.evidenceDoc && (
                    <div className="pt-1.5">
                      <a
                        href={vendorService.getFullImageUrl(c.evidenceDoc)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-700 hover:underline bg-primary-50 px-2 py-0.5 rounded border border-primary-200"
                      >
                        <FileCheck className="size-3" /> Certificate PDF <ExternalLink className="size-2.5" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Calendar className="size-3 text-slate-400" />
                    <span>Valid: {c.expiryDate}</span>
                  </div>

                  {isExpiringSoon ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="size-3" /> Expiring Soon
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="size-3" /> Active
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* QA, Metrology & Testing Infrastructure */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card variant="bento" className="p-6 bg-white space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <ShieldCheck className="size-4 text-primary-700" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Testing Capabilities & Metrology Calibration
            </h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {testingCapabilities ||
              'Spectrometer PMI chemical verification, CMM 3D coordinate measuring machine, 600kN tensile tester, Ultrasonic NDT flaw detection.'}
          </p>
        </Card>

        <Card variant="bento" className="p-6 bg-white space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <FileCheck2 className="size-4 text-primary-700" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Quality Assurance Protocols & SOPs
            </h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {qualityAssuranceProcedures ||
              'PPAP Level 3 compliance, APQP process failure mode analysis (FMEA), 100% laser barcode tracking per heat batch number.'}
          </p>
        </Card>
      </div>

      {/* Add / Edit Certificate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                {editingCert ? (
                  <>
                    <Pencil className="size-3.5 text-primary-700" />
                    Edit Quality / Regulatory Certificate
                  </>
                ) : (
                  'Add Quality / Regulatory Certificate'
                )}
              </h4>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Standard</label>
                <select
                  value={newCert.certificateType}
                  onChange={(e) => setNewCert({ ...newCert, certificateType: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-white"
                >
                  {STANDARD_CERTIFICATIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Certificate No.</label>
                <Input
                  value={newCert.certificateNumber}
                  onChange={(e) => setNewCert({ ...newCert, certificateNumber: e.target.value })}
                  placeholder="e.g. ISO-9001-2024-912"
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Issuing Authority</label>
                <Input
                  value={newCert.issuingAuthority}
                  onChange={(e) => setNewCert({ ...newCert, issuingAuthority: e.target.value })}
                  placeholder="e.g. TÜV Rheinland / DNV"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Issue Date</label>
                <Input
                  type="date"
                  value={newCert.issueDate}
                  onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Expiry Date</label>
                <Input
                  type="date"
                  value={newCert.expiryDate}
                  onChange={(e) => setNewCert({ ...newCert, expiryDate: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Scope of Audit</label>
                <Input
                  value={newCert.scope}
                  onChange={(e) => setNewCert({ ...newCert, scope: e.target.value })}
                  placeholder="Manufacturing and fabrication of alloy assemblies"
                  className="text-xs"
                />
              </div>

              {/* Certificate Proof Upload (PDF / JPG) */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 block">
                  Certificate Document / Proof (PDF / JPG)
                </label>
                <input
                  ref={certDocInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
                  className="hidden"
                  onChange={handleCertDocSelect}
                />
                {newCert.evidenceDoc ? (
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-300 bg-emerald-50/70">
                    <div className="flex items-center gap-2 truncate">
                      <FileCheck className="size-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-semibold text-emerald-900 truncate">
                        {certDocFileName || 'Certificate Document Attached'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={vendorService.getFullImageUrl(newCert.evidenceDoc)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-primary-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="size-3" /> View
                      </a>
                      <button
                        type="button"
                        onClick={handleRemoveCertDoc}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Remove Document"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={uploadingCertDoc}
                    onClick={() => certDocInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-slate-300 hover:border-primary-400 bg-slate-50/50 hover:bg-primary-50/40 text-xs font-medium text-slate-600 hover:text-primary-700 transition-colors cursor-pointer"
                  >
                    {uploadingCertDoc ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin text-primary-700" />
                        <span>Uploading Document...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="size-4 text-primary-600" />
                        <span>Upload Certificate Proof (PDF / JPG / PNG, Max 15 MB)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={handleSaveCert} className="font-bold">
                {editingCert ? 'Update Certificate' : 'Save Certificate'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
