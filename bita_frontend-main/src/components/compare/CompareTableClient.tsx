'use client';

import React from 'react';
import Link from 'next/link';
import { Business } from '@/data';
import { useAuth } from '@/context/AuthContext';
import { ScoreRing } from '@/components/business/ScoreRing';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PersonaSwitcher } from '@/components/shared/PersonaSwitcher';
import {
  ExternalLink,
  Lock,
  Sparkles,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CompareTableClientProps {
  selected: Business[];
}

export function CompareTableClient({ selected }: CompareTableClientProps) {
  const { role, user } = useAuth();

  const isVisitor = role === 'visitor';
  const isPremium = role === 'premium_subscriber';

  const attributes: [string, (b: Business) => React.ReactNode, boolean][] = [
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
    ['Registered Location', (b) => <span className="text-slate-600">{b.location}</span>, false],
    [
      'Verification Tier',
      (b) => <Badge kind="level">Tier {b.level} Audited</Badge>,
      false,
    ],
    [
      'Statutory Status',
      () => <Badge kind="verified">Active & Compliant</Badge>,
      false,
    ],
    ['Operational Tenure', (b) => <strong className="text-slate-900">{b.age} Years Operational</strong>, false],

    // Statutory Deep Attributes (Gated for Visitors)
    [
      'Corporate CIN',
      (b) =>
        isVisitor ? (
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <Lock className="size-3 text-slate-400" />
            <span>{b.cin.slice(0, 7)}****</span>
          </span>
        ) : (
          <code className="text-[11px] font-mono text-slate-700">{b.cin}</code>
        ),
      isVisitor,
    ],
    [
      'GSTIN Identifier',
      (b) =>
        isVisitor ? (
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <Lock className="size-3 text-slate-400" />
            <span>{b.gstin.slice(0, 4)}******</span>
          </span>
        ) : (
          <code className="text-[11px] font-mono text-slate-700">{b.gstin}</code>
        ),
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
      'Core Capabilities',
      (b) => (
        <div className="flex flex-wrap gap-1">
          {b.products.slice(0, 2).map((p) => (
            <span key={p} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700 font-medium">
              {p}
            </span>
          ))}
        </div>
      ),
      false,
    ],
  ];

  return (
    <div className="space-y-6">
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
          <PersonaSwitcher />
          {isPremium && (
            <Button
              size="sm"
              onClick={() =>
                toast.success('Comparative Matrix Exported (XLSX)', {
                  description: 'Downloaded side-by-side due diligence spreadsheet.',
                })
              }
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
            {selected.map((b) => (
              <div key={b.id} className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <span className="text-xs font-bold text-white block truncate">{b.name}</span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Credit Risk:</span>
                  <span className="font-bold text-emerald-400">AA (Low Risk)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">GSTR-3B Filing:</span>
                  <span className="font-bold text-cyan-400">100% On-Time</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Default Probability:</span>
                  <span className="font-bold text-emerald-400">&lt; 0.2%</span>
                </div>
              </div>
            ))}
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
                        {b.city}, {b.state}
                      </span>
                    </div>
                    <Link
                      href={`/demo/business/${b.id}`}
                      className="rounded-full bg-slate-900 p-1.5 !text-white text-white hover:bg-slate-800"
                    >
                      <ExternalLink className="size-3" />
                    </Link>
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
