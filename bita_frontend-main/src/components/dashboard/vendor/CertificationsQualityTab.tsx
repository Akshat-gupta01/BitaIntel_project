'use client';

import React, { useState } from 'react';
import { QualityCertificateRecord, RegulatoryApproval } from '@/types/vendorRegistration';
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
  const [newCert, setNewCert] = useState<Partial<QualityCertificateRecord>>({
    certificateType: STANDARD_CERTIFICATIONS[0],
    certificateNumber: '',
    issuingAuthority: '',
    issueDate: '',
    expiryDate: '',
    scope: '',
    applicableFacility: 'Unit 1: Chakan Plant',
    status: 'Active',
  });

  function handleSaveCert() {
    if (!newCert.certificateNumber || !newCert.issuingAuthority || !newCert.expiryDate) {
      toast.error('Please complete certificate number, authority, and expiry date.');
      return;
    }
    const item: QualityCertificateRecord = {
      id: `CERT-${Date.now()}`,
      certificateType: newCert.certificateType || STANDARD_CERTIFICATIONS[0],
      certificateNumber: newCert.certificateNumber || '',
      issuingAuthority: newCert.issuingAuthority || '',
      issueDate: newCert.issueDate || '2024-01-01',
      expiryDate: newCert.expiryDate || '2027-01-01',
      scope: newCert.scope || 'Quality Management & Precision Fabrication',
      applicableFacility: newCert.applicableFacility || 'All Facilities',
      status: 'Active',
    };
    onUpdateCertifications([...certifications, item]);
    setShowAddModal(false);
    setNewCert({
      certificateType: STANDARD_CERTIFICATIONS[0],
      certificateNumber: '',
      issuingAuthority: '',
      issueDate: '',
      expiryDate: '',
      scope: '',
      applicableFacility: 'Unit 1: Chakan Plant',
      status: 'Active',
    });
    toast.success('Certificate record updated and queued for registrar cross-validation.');
  }

  function handleRemoveCert(id: string) {
    onUpdateCertifications(certifications.filter((c) => c.id !== id));
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
                  <button
                    type="button"
                    onClick={() => handleRemoveCert(c.id)}
                    className="text-slate-400 hover:text-rose-600 p-0.5"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                <div>
                  <h4 className="text-xs font-mono font-black text-slate-900">{c.certificateNumber}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Registrar: <strong className="text-slate-700">{c.issuingAuthority}</strong>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Scope: {c.scope}</p>
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

      {/* Add Certificate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-sm font-bold text-slate-900">Add Quality / Regulatory Certificate</h4>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs"
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
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={handleSaveCert} className="font-bold">
                Save Certificate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
