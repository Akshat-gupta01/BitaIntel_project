'use client';

import React from 'react';
import Link from 'next/link';
import { Business } from '@/data';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ScoreRing } from '@/components/business/ScoreRing';
import { EnquiryModal } from '@/components/business/EnquiryModal';
import { PersonaSwitcher } from '@/components/shared/PersonaSwitcher';
import {
  MapPin,
  ShieldCheck,
  ArrowLeft,
  LockKeyhole,
  CheckCircle2,
  Layers,
  Sparkles,
  Download,
  AlertTriangle,
  FileText,
  UserCheck,
  TrendingUp,
  Award,
  Lock,
  ExternalLink,
} from 'lucide-react';

import { toast } from 'sonner';

interface BusinessProfileClientProps {
  business: Business;
}

export function BusinessProfileClient({ business: b }: BusinessProfileClientProps) {
  const { role, user } = useAuth();

  const isVisitor = role === 'visitor';
  const isUnverified = role === 'unverified';
  const isPendingApproval = role === 'pending_approval';
  const isApproved = role === 'approved_business';
  const isPremium = role === 'premium_subscriber';

  const metadataRows = [
    ['Legal Entity Name', b.legalName],
    ['Corporate CIN', isVisitor ? `${b.cin.slice(0, 8)}********` : b.cin],
    ['GSTIN Identifier', isVisitor ? `${b.gstin.slice(0, 5)}******${b.gstin.slice(-2)}` : b.gstin],
    ['Industry Sector', b.industry],
    ['Registered Location', b.location],
    ['Operational Tenure', `${b.age} years active`],
    ['Headcount Band', isVisitor ? 'Gated for Visitors' : `${b.employees} personnel`],
    ['Annual Turnover Band', isVisitor ? 'Gated for Visitors' : b.turnover],
    ['Verification Tier', `Tier ${b.level} (Audited)`],
    ['Last Audit Date', b.lastAudited],
  ];

  const checkpoints = [
    { label: 'Corporate Legal Identity', value: b.identity, max: 10, pct: 100 },
    { label: 'Statutory Document Dossier', value: isVisitor ? 'Gated' : b.documents, max: 20, pct: isVisitor ? 50 : 95 },
    { label: 'Representative Identity & Contact', value: isVisitor ? 'Gated' : b.contact, max: 5, pct: isVisitor ? 50 : 100 },
    { label: 'Physical Plant / Office Geolocation', value: b.address, max: 5, pct: 90 },
    { label: 'Public Profile Completeness', value: `${b.profile}/15`, max: 15, pct: 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Role / Access Tier Notification Banner */}
      <div className="rounded-2xl border p-4 shadow-2xs transition-all bg-white border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`size-9 rounded-xl grid place-items-center shrink-0 text-white font-bold ${
              isVisitor
                ? 'bg-slate-700'
                : isUnverified
                ? 'bg-amber-600'
                : isPendingApproval
                ? 'bg-indigo-600'
                : isPremium
                ? 'bg-primary-600'
                : 'bg-emerald-600'
            }`}
          >
            {isVisitor && <Lock className="size-4" />}
            {isUnverified && <UserCheck className="size-4" />}
            {isPendingApproval && <AlertTriangle className="size-4" />}
            {isApproved && <CheckCircle2 className="size-4" />}
            {isPremium && <Sparkles className="size-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Viewing As: {role.replace('_', ' ').toUpperCase()}
              </span>
              {user && (
                <span className="text-xs font-semibold text-slate-800">
                  ({user.businessName})
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {isVisitor && 'Minimal public business information visible. Sensitive statutory filings are gated.'}
              {isUnverified && 'Limited access mode. Complete your vendor registration dashboard to unlock direct RFIs.'}
              {isPendingApproval && 'GST-verified awaiting approval. Detailed permitted company & product information accessible.'}
              {isApproved && 'Approved B2B business. Detailed permitted company and product information active.'}
              {isPremium && '💎 Premium B2B Subscriber: Additional analytics, competitor radar & intelligence dossier unlocked.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <PersonaSwitcher />
          {isUnverified && (
            <Button
              href="/demo/dashboard/vendor"
              size="sm"
              variant="outline"
              className="text-xs bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 font-bold"
            >
              Open Dashboard
            </Button>
          )}
          {isVisitor && (
            <Button
              href="/demo/register"
              size="sm"
              variant="primary"
              className="text-xs font-bold"
            >
              Register Business
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Main Dossier, Right Sidebar */}
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left Column: Comprehensive Dossier */}
        <div className="space-y-6">
          {/* Header Hero Card */}
          <Card variant="bento" className="relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400" />
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="flex flex-col xs:flex-row items-start gap-4">
                <div className="grid size-16 sm:size-20 shrink-0 place-items-center rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary-700 via-primary-800 to-slate-900 text-xl sm:text-2xl font-black text-white shadow-md shadow-primary-600/20">
                  {b.initials}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <Badge kind="verified">Verified Entity</Badge>
                    <Badge kind="level">Tier {b.level} Audited</Badge>
                    <Badge kind="mint" icon={false}>{b.industry}</Badge>
                    <Badge kind="amber" icon={false}>{b.badge} Accreditation</Badge>
                  </div>
                  <h1 className="mt-2.5 text-xl sm:text-3xl font-extrabold tracking-tight text-slate-900 break-words">
                    {b.name}
                  </h1>
                  <p className="mt-1 text-xs text-slate-500 font-medium break-all">
                    Legal: <span className="text-slate-700">{b.legalName}</span>
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="size-3 text-slate-400 shrink-0" />
                    <span>{b.location} · {b.industry}</span>
                  </p>
                </div>
              </div>

              {/* Score Widget */}
              <div className="flex items-center gap-3 self-start rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs">
                <ScoreRing score={b.score} size={54} strokeWidth={4} showGrade />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Trust Score
                  </span>
                  <span className="text-xs font-bold text-primary-600">
                    {b.score >= 90 ? 'Platinum Tier' : 'High Confidence'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Audited {b.lastAudited}
                  </span>
                </div>
              </div>
            </div>

            {/* Summary copy */}
            <p className="mt-6 text-sm leading-relaxed text-slate-600 border-t border-slate-100 pt-5">
              {b.summary}
            </p>

            {/* Quick stats triplet */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Incorporation
                </span>
                <span className="mt-1 text-sm font-bold text-slate-900 block">
                  {b.age} Years Active
                </span>
                <span className="text-[11px] text-slate-500">
                  Est. {new Date().getFullYear() - b.age}
                </span>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Turnover Band
                </span>
                <span className="mt-1 text-sm font-bold text-slate-900 block">
                  {isVisitor ? '₹ Confidential' : b.turnover}
                </span>
                <span className="text-[11px] text-slate-500">
                  {isVisitor ? 'Gated for Visitors' : 'Audited Financials'}
                </span>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Quality Standard
                </span>
                <span className="mt-1 text-sm font-bold text-primary-700 block truncate">
                  {b.isoCertified}
                </span>
                <span className="text-[11px] text-slate-500">Active Certification</span>
              </div>
            </div>
          </Card>

          {/* Premium Exclusive Competitor Radar & Market Intelligence Widget */}
          {isPremium && (
            <Card variant="bento" className="p-6 bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 text-white space-y-5 border border-primary-500/30 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-bold border border-primary-400/30">
                    <Sparkles className="size-3.5 text-primary-300" />
                    <span>Exclusive Premium Intelligence Feature</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white mt-2">
                    {b.name} — Competitor Intelligence & Radar Benchmark
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Peer group comparative risk index against top 15 category competitors.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      toast.success(`Dossier Exported for ${b.name}`, {
                        description: 'Downloaded complete intelligence report in PDF format.',
                      })
                    }
                    className="text-xs bg-primary-600 hover:bg-primary-500 text-white font-bold h-8"
                    icon={<Download className="size-3.5" />}
                  >
                    Export Dossier (PDF)
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Statutory Filing Consistency</span>
                  <span className="font-extrabold text-emerald-400 text-sm block">99.2% (Top 2%)</span>
                  <p className="text-[11px] text-slate-300">24 months consecutive GSTR-3B filed without penalty</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Credit & Solvency Grade</span>
                  <span className="font-extrabold text-primary-400 text-sm block">AA+ High Solvency</span>
                  <p className="text-[11px] text-slate-300">Calculated via MCA charge filings & bank confirmations</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Procurement Repeat Ratio</span>
                  <span className="font-extrabold text-cyan-400 text-sm block">91.4% Retention</span>
                  <p className="text-[11px] text-slate-300">Based on cross-vendor buyer feedback & RFI awards</p>
                </div>
              </div>
            </Card>
          )}

          {/* Statutory Verification Matrix Card (with gating for visitor) */}
          <Card variant="bento">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Statutory Verification Matrix
                </h2>
              </div>
              <span className="text-xs font-bold text-primary-600 inline-flex items-center gap-1">
                <CheckCircle2 className="size-3.5" /> 100% Checkpoint Clearance
              </span>
            </div>

            {isVisitor ? (
              <div className="my-5 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <div className="size-11 rounded-2xl bg-slate-100 text-slate-700 border border-slate-300 grid place-items-center mx-auto">
                  <LockKeyhole className="size-5" />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="text-sm font-bold text-slate-900">
                    Detailed Statutory Checklist Gated for Visitors
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Unregistered visitors can inspect high-level profiles. To access audited MCA director filings, GSTN returns, and plant compliance reports, create an account in 60 seconds.
                  </p>
                  <Button href="/demo/register" size="sm" variant="primary" className="mt-4 font-bold text-xs">
                    Create Free Account to Unlock →
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {checkpoints.map((cp, idx) => {
                  const barColors = [
                    'from-primary-600 to-primary-400 text-primary-700',
                    'from-primary-600 to-primary-400 text-primary-800',
                    'from-primary-500 to-primary-400 text-primary-700',
                    'from-amber-500 to-orange-400 text-amber-800',
                    'from-rose-500 to-pink-400 text-rose-700',
                  ];
                  const chosenColor = barColors[idx % barColors.length];
                  const [grad, textColor] = chosenColor.split(' ');

                  return (
                    <div key={cp.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{cp.label}</span>
                        <span className={`font-extrabold ${textColor}`}>{cp.value}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-700`}
                          style={{ width: `${cp.pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Capabilities & Products Card */}
          <Card variant="bento">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <Layers className="size-5 text-primary-600" />
              <h2 className="text-base font-bold text-slate-900">
                Verified Manufacturing & Capability Portfolio
              </h2>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Audited product lines and operational specializations registered with BITAINTEL:
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {b.products.map((p) => (
                <span
                  key={p}
                  className="rounded-full bg-slate-100/90 border border-slate-200 px-3.5 py-1 text-xs font-semibold text-slate-800"
                >
                  {p}
                </span>
              ))}
            </div>

            {/* Privacy Shield Box */}
            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
              <LockKeyhole className="size-5 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 leading-relaxed">
                Confidential unit pricing, bank credit facility agreements, and proprietary customer contracts are restricted under reciprocal NDA protocols and are not published on the open directory.
              </p>
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <aside className="space-y-6">
          {/* Quick Action Card with Modal Trigger */}
          <Card variant="bento" className="p-6">
            <span className="text-[10px] uppercase font-bold text-primary-700 tracking-wider block">
              Procurement Gateway
            </span>
            <h3 className="mt-2 text-base font-bold text-slate-900">
              Connect with {b.name}
            </h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Send a verified procurement enquiry or request access to the complete statutory audit pack.
            </p>

            <div className="mt-5 space-y-2.5">
              {isVisitor ? (
                <div className="space-y-2">
                  <Button
                    variant="primary"
                    className="w-full justify-center"
                    href="/demo/login"
                  >
                    Sign In to Send Enquiry
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-center text-xs"
                    href="/demo/register"
                  >
                    Create Vendor Account
                  </Button>
                </div>
              ) : (
                <EnquiryModal business={b} />
              )}

              <Button
                variant="secondary"
                className="w-full justify-center"
                href={`/demo/compare?ids=${b.id}`}
              >
                Compare with Another Business
              </Button>
            </div>
          </Card>

          {/* Profile At A Glance Table */}
          <Card variant="bento" className="p-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100">
              Corporate Metadata
            </h4>
            <dl className="mt-4 space-y-3">
              {metadataRows.map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between items-start gap-3 text-xs py-1.5 border-b border-slate-100 last:border-0"
                >
                  <dt className="text-slate-500 font-medium shrink-0">{label}</dt>
                  <dd className="font-semibold text-slate-900 text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {/* Disclaimer */}
          <div className="rounded-2xl border border-slate-200/60 bg-white/60 p-4 text-[11px] leading-relaxed text-slate-400 backdrop-blur-md">
            Disclaimer: Verification confirms statutory checks at the stated audit date. Corporate parties must independently conduct transaction-specific commercial due diligence.
          </div>
        </aside>
      </div>
    </div>
  );
}
