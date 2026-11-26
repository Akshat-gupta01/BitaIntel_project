'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { Business } from '@/data';
import { useAuth } from '@/context/AuthContext';
import { ScoreRing } from '@/components/business/ScoreRing';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatBusinessLocation } from '@/lib/verificationBadge';
import {
  ExternalLink,
  Lock,
  Sparkles,
  Download,
  ShieldCheck,
  Plus,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export type CompareBusiness = Business & {
  verificationStatus?: string;
  grade?: string;
  riskLevel?: string;
  productsCount?: number;
  facilitiesCount?: number;
  certificationsCount?: number;
  openComplaintsCount?: number;
  creditTermsDays?: string | null;
  preferredIncoterms?: string[];
};

interface CompareTableClientProps {
  selected: CompareBusiness[];
  availableBusinesses?: CompareBusiness[];
}

function buildCompareExportFilename(): string {
  return `bitaintel_comparison_matrix_${Date.now()}.xlsx`;
}

function deriveGradeAndRisk(b: CompareBusiness): { grade: string; risk: string } {
  if (b.grade && b.riskLevel) return { grade: b.grade, risk: b.riskLevel };
  if (b.score >= 95) return { grade: 'A+', risk: 'Negligible risk' };
  if (b.score >= 90) return { grade: 'A', risk: 'Negligible risk' };
  if (b.score >= 85) return { grade: 'B+', risk: 'Low risk' };
  if (b.score >= 80) return { grade: 'B', risk: 'Low risk' };
  if (b.score >= 75) return { grade: 'C+', risk: 'Standard risk' };
  if (b.score >= 70) return { grade: 'C', risk: 'Standard risk' };
  if (b.score >= 40) return { grade: 'D', risk: 'Moderate risk' };
  return { grade: 'F', risk: 'High risk' };
}

export function CompareTableClient({ selected, availableBusinesses = [] }: CompareTableClientProps) {
  const router = useRouter();
  const { role } = useAuth();
  const [candidateId, setCandidateId] = useState('');

  const isVisitor = role === 'visitor';
  const isPremium = role === 'premium_subscriber';

  const selectedKeySet = new Set(
    selected.flatMap((b) => [b.id.toLowerCase(), (b.slug || '').toLowerCase()].filter(Boolean))
  );
  const addableOptions = availableBusinesses.filter(
    (b) => !selectedKeySet.has(b.id.toLowerCase()) && !selectedKeySet.has((b.slug || '').toLowerCase())
  );

  function navigateWithIds(nextIds: string[]) {
    if (nextIds.length === 0) {
      router.push('/demo/compare');
      return;
    }
    router.push(`/demo/compare?ids=${nextIds.map((id) => encodeURIComponent(id)).join(',')}`);
  }

  function handleAddCandidate() {
    if (!candidateId) return;
    if (selected.length >= 4) {
      toast.error('Maximum 4 businesses can be compared at once.');
      return;
    }
    const nextIds = [...selected.map((b) => b.id), candidateId];
    setCandidateId('');
    navigateWithIds(nextIds);
  }

  function handleRemoveCompany(idToRemove: string) {
    const nextIds = selected.filter((b) => b.id !== idToRemove).map((b) => b.id);
    navigateWithIds(nextIds);
  }

  function handleExportMatrix() {
    try {
      const exportRows = selected.map((b) => {
        const { grade, risk } = deriveGradeAndRisk(b);
        return {
          Company: b.name,
          'Legal Name': b.legalName,
          Industry: b.industry,
          Location: b.location,
          'Trust Score': `${b.score}/100`,
          Grade: grade,
          'Risk Level': risk,
          'Verification Tier': `Tier ${b.level}`,
          Status: b.verified ? 'Verified' : b.verificationStatus || 'Pending Verification',
          'Tenure (Years)': b.age,
          'Corporate CIN': isVisitor ? `${(b.cin || 'N/A').slice(0, 7)}****` : b.cin || '—',
          GSTIN: isVisitor ? `${(b.gstin || 'N/A').slice(0, 4)}******` : b.gstin || '—',
          Certifications: b.isoCertified || '—',
          'Turnover Band': isVisitor ? 'Gated for Visitors' : b.turnover,
          'Workforce Band': isVisitor ? 'Gated for Visitors' : b.employees,
          'Catalog Products': (b.products || []).join(', ') || '—',
          'Open Complaints': b.openComplaintsCount ?? 0,
        };
      });

      const ws = XLSX.utils.json_to_sheet(exportRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Comparison_Matrix');
      XLSX.writeFile(wb, buildCompareExportFilename());
      toast.success('Comparative Matrix Exported (XLSX)', {
        description: `Downloaded comparison report for ${selected.length} supplier(s).`,
      });
    } catch {
      toast.error('Failed to export XLSX comparison matrix.');
    }
  }

  const attributes: [string, (b: CompareBusiness) => React.ReactNode, boolean][] = [
    [
      'Trust Index & Grade',
      (b) => (
        <div className="flex items-center gap-2.5">
          <ScoreRing score={b.score} size={42} strokeWidth={3.5} showGrade />
          <div>
            <span className="font-extrabold text-slate-900 block">{b.score} / 100</span>
            <span className="text-[10px] text-primary-700 font-semibold">{b.badge} Tier</span>
          </div>
        </div>
      ),
      false,
    ],
    ['Industry Sector', (b) => <span className="font-medium text-slate-700">{b.industry}</span>, false],
    ['Registered Location', (b) => <span className="text-slate-600">{formatBusinessLocation(b)}</span>, false],
    [
      'Verification Tier',
      (b) => <Badge kind="level">Tier {b.level} Audited</Badge>,
      false,
    ],
    [
      'Statutory Status',
      (b) => {
        const statusStr = String(b.verificationStatus || '').toLowerCase();
        if (b.verified || statusStr === 'verified' || statusStr === 'approved') {
          return <Badge kind="verified">Verified & Compliant</Badge>;
        }
        if (statusStr.includes('pending') || statusStr.includes('review')) {
          return <Badge kind="amber">Verification Pending</Badge>;
        }
        return <Badge kind="neutral">Registered / Unverified</Badge>;
      },
      false,
    ],
    ['Operational Tenure', (b) => <strong className="text-slate-900">{b.age} Years Operational</strong>, false],

    // Statutory Deep Attributes (Gated for Visitors)
    [
      'Corporate CIN',
      (b) => {
        const cinVal = b.cin || '—';
        return isVisitor ? (
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <Lock className="size-3 text-slate-400" />
            <span>{cinVal !== '—' ? `${cinVal.slice(0, 7)}****` : 'Gated'}</span>
          </span>
        ) : (
          <code className="text-[11px] font-mono text-slate-700">{cinVal}</code>
        );
      },
      isVisitor,
    ],
    [
      'GSTIN Identifier',
      (b) => {
        const gstVal = b.gstin || '—';
        return isVisitor ? (
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <Lock className="size-3 text-slate-400" />
            <span>{gstVal !== '—' ? `${gstVal.slice(0, 4)}******` : 'Gated'}</span>
          </span>
        ) : (
          <code className="text-[11px] font-mono text-slate-700">{gstVal}</code>
        );
      },
      isVisitor,
    ],
    ['ISO / Quality Audit', (b) => <span className="text-xs font-semibold text-primary-800">{b.isoCertified}</span>, false],
    [
      'Legal Identity Checkpoint',
      (b) =>
        isVisitor ? (
          <span className="text-xs text-slate-400 italic">Sign in to view</span>
        ) : (
          <span className="font-bold text-slate-800">{b.identity}</span>
        ),
      isVisitor,
    ],
    [
      'Document Dossier Checkpoint',
      (b) =>
        isVisitor ? (
          <span className="text-xs text-slate-400 italic">Sign in to view</span>
        ) : (
          <span className="font-bold text-slate-800">{b.documents}</span>
        ),
      isVisitor,
    ],
    [
      'Premise Geolocation Audit',
      (b) =>
        isVisitor ? (
          <span className="text-xs text-slate-400 italic">Sign in to view</span>
        ) : (
          <span className="font-bold text-slate-800">{b.address}</span>
        ),
      isVisitor,
    ],
    [
      'Turnover Range Band',
      (b) =>
        isVisitor ? (
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Lock className="size-3" /> Gated for Visitors
          </span>
        ) : (
          <span className="font-semibold text-slate-800">{b.turnover}</span>
        ),
      isVisitor,
    ],
    [
      'Staff Headcount Band',
      (b) =>
        isVisitor ? (
          <span className="text-xs text-slate-400">Gated for Visitors</span>
        ) : (
          <span className="font-semibold text-slate-800">{b.employees}</span>
        ),
      isVisitor,
    ],
    [
      'Facilities & Catalog',
      (b) => (
        <span className="text-xs font-semibold text-slate-700">
          {b.facilitiesCount ?? 1} Plant(s) · {b.productsCount ?? (b.products?.length || 0)} Catalog Item(s)
        </span>
      ),
      false,
    ],
    [
      'Core Capabilities',
      (b) => {
        const prods = Array.isArray(b.products) ? b.products.slice(0, 3) : [];
        if (prods.length === 0) {
          return <span className="text-xs text-slate-400 italic">No catalog items listed</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {prods.map((p) => (
              <span key={p} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700 font-medium">
                {p}
              </span>
            ))}
          </div>
        );
      },
      false,
    ],
  ];

  return (
    <div className="space-y-6">
      {/* Inline Selector Bar: Add Live DB or Demo Business (2-4) */}
      {availableBusinesses.length > 0 && selected.length < 4 && (
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            {selected.length < 2 ? (
              <span className="font-semibold text-amber-800">
                1 company selected — pick a 2nd company below to compare side-by-side:
              </span>
            ) : (
              <span>
                Comparing <strong className="text-slate-900">{selected.length} of 4</strong> companies. Add another candidate:
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
              className="flex-1 sm:w-64 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-primary-600"
            >
              <option value="">Select company to add...</option>
              {addableOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name} ({opt.city || opt.location})
                </option>
              ))}
            </select>
            <Button
              type="button"
              size="sm"
              variant="primary"
              disabled={!candidateId}
              onClick={handleAddCandidate}
              icon={<Plus className="size-3.5" />}
              className="shrink-0 text-xs font-bold"
            >
              Add
            </Button>
          </div>
        </div>
      )}

      {/* Tier Switcher / Mode Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary-50 text-primary-700 border border-primary-200 grid place-items-center shrink-0">
            {isPremium ? <Sparkles className="size-4 text-primary-600" /> : <ShieldCheck className="size-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Mode: {role.replace('_', ' ').toUpperCase()}
              </span>
              {isPremium && (
                <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                  💎 Deep Comparison & Risk Index Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isVisitor
                ? 'Minimal comparison visible. Sensitive statutory CIN/GSTN and financial turnover rows are locked.'
                : isPremium
                ? 'Premium comparison enabled: Side-by-side credit risk scores, exportable Excel matrix, and radar benchmarks.'
                : 'Full permitted company and product comparison active.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isPremium && (
            <Button
              size="sm"
              onClick={handleExportMatrix}
              className="text-xs bg-primary-600 hover:bg-primary-700 text-white font-bold h-8"
              icon={<Download className="size-3.5" />}
            >
              Export Matrix
            </Button>
          )}
        </div>
      </div>

      {/* Premium Exclusive: Side-by-Side Risk Assessment Card */}
      {isPremium && (
        <div className="rounded-2xl border border-primary-300 bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 text-white p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary-400" />
              <h3 className="text-sm font-extrabold text-white">
                Premium Risk Benchmark & Commercial Credit Assessment
              </h3>
            </div>
            <span className="text-[10px] font-mono text-primary-300 uppercase tracking-wider">
              Updated Live
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 pt-1">
            {selected.map((b) => {
              const { grade, risk } = deriveGradeAndRisk(b);
              const openComplaints = b.openComplaintsCount ?? 0;
              return (
                <div key={b.id} className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                  <span className="text-xs font-bold text-white block truncate">{b.name}</span>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Audit Grade & Risk:</span>
                    <span className="font-bold text-emerald-400">
                      {grade} ({risk})
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Open Complaints:</span>
                    <span className={cn('font-bold', openComplaints === 0 ? 'text-cyan-400' : 'text-amber-400')}>
                      {openComplaints} Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Verification Level:</span>
                    <span className="font-bold text-emerald-400">Tier {b.level} Audited</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-xs">
        <table className="w-full min-w-[780px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="sticky left-0 z-20 min-w-44 bg-slate-50 p-4 sm:p-5 font-bold uppercase tracking-wider text-slate-500 shadow-[1px_0_0_0_rgba(226,232,240,0.8)]">
                Audit Metric
              </th>
              {selected.map((b) => (
                <th key={b.id} className="min-w-52 p-4 sm:p-5 align-top">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/demo/business/${b.id}`}
                        className="font-bold text-sm text-slate-900 hover:text-primary-700 transition-colors block"
                      >
                        {b.name}
                      </Link>
                      <span className="text-[11px] text-slate-500 font-normal">
                        {formatBusinessLocation(b)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Link
                        href={`/demo/business/${b.id}`}
                        className="rounded-full bg-slate-900 p-1.5 !text-white text-white hover:bg-slate-800"
                        title={`Open ${b.name} dossier`}
                      >
                        <ExternalLink className="size-3" />
                      </Link>
                      {selected.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCompany(b.id)}
                          className="rounded-full bg-slate-200/80 p-1.5 text-slate-600 hover:bg-rose-100 hover:text-rose-700 transition-colors"
                          title={`Remove ${b.name} from comparison`}
                        >
                          <X className="size-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {attributes.map(([label, renderFn, isGated], idx) => (
              <tr
                key={label}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50 hover:bg-primary-50/30'}
              >
                <th
                  className={cn(
                    'sticky left-0 z-10 p-3.5 sm:p-4 font-bold text-slate-700 shadow-[1px_0_0_0_rgba(226,232,240,0.8)]',
                    idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    {isGated && <Lock className="size-3 text-slate-400" />}
                    <span>{label}</span>
                  </div>
                </th>
                {selected.map((b) => (
                  <td key={b.id} className="p-3.5 sm:p-4 align-middle">
                    {renderFn(b)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
