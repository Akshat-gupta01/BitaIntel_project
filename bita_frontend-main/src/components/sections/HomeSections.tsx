'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Scale,
  CheckCircle2,
  Lock,
  Sparkles,
  ChevronRight,
  Activity,
  Check,
} from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Badge, type BadgeKind } from '@/components/ui/Badge';
import { BusinessCard } from '@/components/business/BusinessCard';
import { ScoreRing } from '@/components/business/ScoreRing';
import { Logo } from '@/components/ui/Logo';
import { businesses, steps, trustMetrics, verificationCheckpoints } from '@/data';
import { cn } from '@/lib/utils';

/* ==========================================================================
   1. HERO SECTION (Rich Pastel & Apple Glass Bento)
   ========================================================================== */
export function Hero() {
  const [activeTab, setActiveTab] = useState<'entity' | 'statutory' | 'risk'>('entity');

  return (
    <section className="relative overflow-hidden pt-10 pb-20 sm:pt-16 sm:pb-28">
      {/* Ambient background aura (Tailwind Theme Primary glows) */}
      <div className="pointer-events-none absolute left-1/4 top-0 -translate-y-1/2 size-[600px] rounded-full bg-gradient-to-tr from-primary-300/20 via-primary-200/15 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-1/4 size-[480px] rounded-full bg-gradient-to-bl from-primary-400/20 via-cyan-200/15 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 bottom-0 size-[500px] rounded-full bg-gradient-to-t from-primary-200/15 via-primary-100/10 to-transparent blur-3xl" />

      <Container className="relative">
        {/* Top Tag Pills Strip with rich pastel complements */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <Badge kind="lavender" icon={false}>B2B Intelligence</Badge>
          <Badge kind="primary" icon={false}>AI-Driven Due Diligence</Badge>
          <Badge kind="mint" icon={false}>Statutory Verification</Badge>
          <Badge kind="rose" icon={false}>Verified Network</Badge>
          <Badge kind="amber" icon={false}>Corporate Trust Index</Badge>
        </div>

        {/* Central Hero Text Block */}
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/90 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-800 shadow-2xs backdrop-blur-md">
            <span className="size-2 rounded-full bg-primary-500 animate-pulse" />
            Empowering Zero-Risk Enterprise Procurement
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-6xl lg:text-7xl leading-[1.08]">
            Verify before <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 bg-clip-text text-transparent">
              you trust.
            </span>
          </h1>

          <p className="mt-6 mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600">
            Make confident business decisions with structured statutory cross-checks, audited document review, and an objective trust score — synthesized in one verifiable dossier.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              variant="primary"
              href="/demo/directory"
              rightIcon={<ArrowRight className="size-4" />}
            >
              Explore Verified Businesses
            </Button>
            <Button
              size="lg"
              variant="secondary"
              href="/demo/register"
            >
              Register Your Business
            </Button>
          </div>

          {/* Micro trust signals with pastel check icons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-primary-500" /> MCA & ROC Active
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-cyan-500" /> Live GSTN Filing Sync
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-indigo-500" /> ISO & Quality Audited
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-orange-500" /> Consent-Protected Data
            </span>
          </div>
        </div>

        {/* Hero Interactive Bento Showcase */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="rounded-3xl border border-white/90 bg-white/75 p-4 sm:p-7 shadow-[0_20px_60px_-15px_rgba(14,14,26,0.06)] backdrop-blur-2xl">
            {/* Top Mock Window Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="size-2.5 sm:size-3 rounded-full bg-rose-300" />
                <span className="size-2.5 sm:size-3 rounded-full bg-amber-300" />
                <span className="size-2.5 sm:size-3 rounded-full bg-primary-300" />
                <div className="ml-1 sm:ml-2 flex items-center gap-1.5">
                  <Logo variant="icon" size="sm" />
                  <span className="text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider truncate">
                    Verification Engine
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 rounded-full bg-slate-100/90 p-1 border border-slate-200/70 text-xs self-start sm:self-auto">
                {(['entity', 'statutory', 'risk'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'rounded-full px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-bold capitalize transition-all',
                      activeTab === tab
                        ? 'bg-slate-900 !text-white text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Bento Inner Grid with rich pastel cards */}
            <div className="mt-6 grid gap-5 md:grid-cols-12">
              {/* Left Column: Multi-Color Pastel Stat Cards */}
              <div className="md:col-span-4 flex flex-col gap-4">
                {/* Stat 1: Primary card */}
                <div className="rounded-2xl border border-primary-200/80 bg-gradient-to-br from-primary-50/80 to-white/90 p-4 sm:p-5 shadow-2xs backdrop-blur-md">
                  <span className="text-2xl sm:text-4xl font-black tracking-tight text-primary-700">
                    99.4%
                  </span>
                  <p className="mt-1 text-xs font-bold text-primary-950 uppercase tracking-wide">
                    Statutory Accuracy
                  </p>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    Automated multi-point reconciliation against live MCA and GSTN data layers.
                  </p>
                </div>

                {/* Stat 2: Primary card */}
                <div className="rounded-2xl border border-primary-200/80 bg-gradient-to-br from-primary-50/80 to-white/90 p-4 sm:p-5 shadow-2xs backdrop-blur-md">
                  <span className="text-2xl sm:text-4xl font-black tracking-tight text-primary-700">
                    14,200+
                  </span>
                  <p className="mt-1 text-xs font-bold text-primary-950 uppercase tracking-wide">
                    Enterprise Profiles
                  </p>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    Audited suppliers and manufacturing hubs active across national corridors.
                  </p>
                </div>

                {/* Stat 3: Peach card */}
                <div className="rounded-2xl border border-orange-200/80 bg-gradient-to-br from-orange-50/80 to-white/90 p-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider block">
                      Audit Status
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      Tier 4 Verified Entity
                    </span>
                  </div>
                  <Badge kind="mint">100% Validated</Badge>
                </div>
              </div>

              {/* Center & Right Column: Interactive Trust Card & Simulated Transaction */}
              <div className="md:col-span-8 flex flex-col gap-4 min-w-0">
                {/* Main Card: Meridian Steel Works Live Profile */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-sm relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="grid size-12 sm:size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-500 to-cyan-400 text-white font-black text-base sm:text-lg shadow-sm shadow-primary-500/20">
                        MS
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                            Meridian Steel Works
                          </h2>
                          <Badge kind="verified">Platinum Tier</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          GSTIN: 27AABCM8291Q1Z4 · Pune, Maharashtra
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 sm:gap-3 self-start sm:self-center bg-primary-50/70 p-2 sm:p-2.5 rounded-2xl border border-primary-200/80">
                      <ScoreRing score={96} size={46} strokeWidth={3.5} showGrade />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-primary-800 block tracking-wider">
                          Trust Index
                        </span>
                        <span className="text-xs font-bold text-primary-600">
                          Highest Confidence
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Tab Content with pastel chips */}
                  {activeTab === 'entity' && (
                    <div className="mt-5 space-y-3 pt-4 border-t border-slate-100 animate-in fade-in">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-3 rounded-xl bg-primary-50/50 border border-primary-100/70">
                          <span className="text-[10px] text-primary-700 uppercase font-bold block">Tenure</span>
                          <span className="font-bold text-slate-800">23 Years</span>
                        </div>
                        <div className="p-3 rounded-xl bg-cyan-50/50 border border-cyan-100/70">
                          <span className="text-[10px] text-cyan-700 uppercase font-bold block">Turnover</span>
                          <span className="font-bold text-slate-800">₹50–100 Cr</span>
                        </div>
                        <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/70">
                          <span className="text-[10px] text-indigo-600 uppercase font-bold block">Employees</span>
                          <span className="font-bold text-slate-800">250–500</span>
                        </div>
                        <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100/70">
                          <span className="text-[10px] text-orange-600 uppercase font-bold block">ISO Certified</span>
                          <span className="font-bold text-primary-800">IATF 16949</span>
                        </div>
                      </div>

                      {/* Floating callout chips */}
                      <div className="pt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700 border border-primary-200/70 inline-flex items-center gap-1">
                          <Check className="size-3 text-primary-600" /> MCA Active Incorporation
                        </span>
                        <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700 border border-cyan-200/70 inline-flex items-center gap-1">
                          <Check className="size-3 text-cyan-600" /> GSTN 3B Reconciled (Consecutive 36 Mo)
                        </span>
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-800 border border-indigo-200/70 inline-flex items-center gap-1">
                          <Check className="size-3 text-indigo-600" /> Geolocation Plant Audited
                        </span>
                      </div>
                    </div>
                  )}

                  {activeTab === 'statutory' && (
                    <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-100 animate-in fade-in text-xs">
                      {[
                        ['Ministry of Corporate Affairs (ROC)', 'Active & Compliant · Filings current', '20/20', 'mint'],
                        ['Central Board of Indirect Taxes (GSTN)', 'Regular 100% on-time return cycle', '20/20', 'sky'],
                        ['Employees Provident Fund Org (EPFO)', '380 active salaried registrations verified', '10/10', 'lavender'],
                      ].map(([agency, desc, score, badgeKind]) => (
                        <div key={agency} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div>
                            <span className="font-bold text-slate-900 block">{agency}</span>
                            <span className="text-slate-500 text-[11px]">{desc}</span>
                          </div>
                          <Badge kind={badgeKind as BadgeKind}>{score}</Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'risk' && (
                    <div className="mt-5 pt-4 border-t border-slate-100 animate-in fade-in space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">Commercial Risk Assessment</span>
                        <Badge kind="mint">Tier A (Negligible Risk)</Badge>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary-600 to-cyan-400 rounded-full" style={{ width: '96%' }} />
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Zero statutory penalties recorded in the preceding 60 months. Director identification numbers (DIN) fully matched with no disqualification history.
                      </p>
                    </div>
                  )}
                </div>

                {/* Simulated Real-Time Audit Transaction Card with soft primary tint */}
                <div className="rounded-2xl border border-primary-200/80 bg-gradient-to-r from-primary-50/70 via-white to-cyan-50/50 p-4 shadow-2xs backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-primary-100 grid place-items-center text-primary-600">
                      <CheckCircle2 className="size-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Statutory Verification Check Completed
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Cryptographic audit hash generated · 12 Oct 2026
                      </span>
                    </div>
                  </div>
                  <Button
                    size="xs"
                    variant="dark"
                    href="/demo/business/meridian-steel-works"
                    rightIcon={<ArrowRight className="size-3" />}
                  >
                    View Full Dossier
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ==========================================================================
   2. TRUST METRICS STRIP (Multi-Color Pastel Stats)
   ========================================================================== */
export function TrustStrip() {
  const metricPastels = [
    { border: 'hover:border-primary-300', bg: 'bg-primary-50/40', text: 'text-primary-700' },
    { border: 'hover:border-cyan-300', bg: 'bg-cyan-50/40', text: 'text-cyan-700' },
    { border: 'hover:border-indigo-300', bg: 'bg-indigo-50/40', text: 'text-indigo-700' },
    { border: 'hover:border-orange-300', bg: 'bg-orange-50/40', text: 'text-orange-800' },
  ];

  return (
    <section className="border-y border-slate-200/80 bg-white/70 backdrop-blur-md py-8 cv-auto">
      <Container>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {trustMetrics.map((item, idx) => {
            const pastel = metricPastels[idx % metricPastels.length];
            return (
              <div
                key={item.label}
                className={cn(
                  'flex flex-col p-4 rounded-2xl border border-slate-200/70 transition-all duration-200 hover:-translate-y-0.5 shadow-2xs',
                  pastel.bg,
                  pastel.border
                )}
              >
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  {item.value}
                </span>
                <span className={cn('mt-1 text-xs font-bold uppercase tracking-wider', pastel.text)}>
                  {item.label}
                </span>
                <span className="mt-0.5 text-xs text-slate-500 leading-snug">
                  {item.sub}
                </span>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* ==========================================================================
   3. BENEFITS BENTO GRID (Image 3 Inspiration with Pastel Variations)
   ========================================================================== */
export function BenefitsBento() {
  return (
    <section className="section-pad cv-auto">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="eyebrow">Platform Capabilities</span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
              BENEFITS & METHODOLOGY
            </h2>
            <p className="mt-3 text-slate-600 max-w-xl text-sm sm:text-base leading-relaxed">
              Designed to eliminate guesswork from commercial partner evaluation with structured verification.
            </p>
          </div>
          <Button variant="secondary" href="/demo/how-it-works" rightIcon={<ArrowRight className="size-4" />}>
            Explore Methodology
          </Button>
        </div>

        {/* Bento Grid */}
        <div className="grid gap-6 md:grid-cols-12">
          {/* Card 1: Instant Verification (Theme Primary tint) */}
          <div className="md:col-span-7 rounded-3xl border border-primary-200/80 bg-gradient-to-br from-white via-primary-50/30 to-cyan-50/20 p-8 backdrop-blur-xl shadow-[0_4px_24px_rgba(14,14,26,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <Badge kind="mint">Instant Verification</Badge>
                <Activity className="size-5 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                Instant Entity Resolution
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-lg">
                Receive verifiable business profiles in seconds. Real-time reconciliation revolutionizes B2B vendor onboarding and supplier due diligence.
              </p>
            </div>

            {/* Simulated Verification Workflow */}
            <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white/95 p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pb-2 border-b border-slate-100">
                <span>Verification Checkpoint Pipeline</span>
                <span>Audit Score</span>
              </div>

              {[
                { label: 'Corporate Legal Identity (CIN / ROC)', time: '0.4s', score: '20/20', kind: 'mint' },
                { label: 'Live GSTN Filing Reconciliation', time: '0.6s', score: '20/20', kind: 'sage' },
                { label: 'ISO 9001 / Quality Standard Audit', time: '1.1s', score: '18/20', kind: 'peach' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-200/60 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="size-6 rounded-full bg-primary-100 text-primary-600 grid place-items-center">
                      <Check className="size-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block">{item.label}</span>
                      <span className="text-[10px] text-slate-400">Response time: {item.time}</span>
                    </div>
                  </div>
                  <Badge kind={item.kind as BadgeKind}>{item.score}</Badge>
                </div>
              ))}

              {/* Floating Success Pill */}
              <div className="rounded-xl border border-primary-300 bg-primary-50/90 p-3 sm:p-3.5 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="size-6 shrink-0 rounded-full bg-primary-600 text-white grid place-items-center">
                    <Check className="size-3.5" />
                  </div>
                  <span className="text-xs font-bold text-primary-900">
                    Verification successful · Grade A+
                  </span>
                </div>
                <Link
                  href="/demo/directory"
                  className="rounded-full bg-slate-900 px-3.5 py-1 text-xs font-bold !text-white text-white hover:bg-slate-800 transition-colors self-end xs:self-auto"
                >
                  Continue →
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2 & 3: Right Stack */}
          <div className="md:col-span-5 flex flex-col gap-6">
            {/* Dark Card with deep theme primary glow */}
            <div className="rounded-3xl border border-primary-900/50 bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 size-48 rounded-full bg-primary-500/15 blur-2xl pointer-events-none" />
              <div className="absolute left-10 bottom-0 size-40 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

              <span className="rounded-full border border-primary-400/30 bg-primary-500/20 px-3 py-1 text-xs font-bold text-primary-300">
                Statutory Synthesis
              </span>
              <h3 className="mt-5 text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
                Platform synthesizes government registries to ensure <span className="text-primary-300">transparency</span> of every transaction.
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Direct statutory API pipelines eliminate reliance on static, unverified corporate brochures and manual self-declaration.
              </p>
            </div>

            {/* Enhanced Security Card with soft peach/amber warm tint */}
            <div className="rounded-3xl border border-orange-200/80 bg-gradient-to-br from-white via-orange-50/40 to-amber-50/30 p-7 backdrop-blur-xl shadow-2xs flex items-start justify-between gap-4">
              <div>
                <Badge kind="peach">Granular Controls</Badge>
                <h3 className="mt-3 text-lg font-bold text-slate-900">
                  Enhanced Enterprise Security
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  Enjoy peace of mind with our state-of-the-art consent management, ensuring sensitive financial and customer data is protected.
                </p>
              </div>
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-orange-500 text-white shadow-md shadow-orange-500/20">
                <Lock className="size-6" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ==========================================================================
   4. HOW IT WORKS WORKFLOW (5-Step Visual Pipeline with Distinct Pastels)
   ========================================================================== */
export function HowItWorks() {
  const stepPastels: BadgeKind[] = ['lavender', 'sky', 'mint', 'amber', 'rose'];

  return (
    <section className="section-pad bg-gradient-to-b from-slate-50/80 via-white to-slate-50/80 border-y border-slate-200/80 cv-auto">
      <Container>
        <div className="mx-auto max-w-2xl text-center mb-14">
          <span className="eyebrow">The Five-Step Pipeline</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            From registration to verified trust.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            A structured workflow helps corporate buyers and suppliers navigate identity submission, document review, and transparent scoring.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s, idx) => {
            const pastelKind = stepPastels[idx % stepPastels.length];
            return (
              <div
                key={s.number}
                style={{ zIndex: 10 - idx }}
                className="relative flex flex-col h-full rounded-3xl border border-slate-200/80 bg-white/90 p-5 lg:p-4.5 xl:p-6 shadow-2xs backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary-300/80"
              >
                <div className="flex items-center justify-between gap-1.5 mb-3.5">
                  <span className="text-[11px] font-black tracking-widest text-primary-700 uppercase shrink-0">
                    STEP {s.number}
                  </span>
                  <Badge kind={pastelKind} icon={false} className="text-[10px] sm:text-[10.5px] px-2 py-0.5 whitespace-nowrap shrink-0">
                    {s.tag}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                  {s.title}
                </h3>
                <p className="mt-2.5 text-xs leading-relaxed text-slate-500">
                  {s.description}
                </p>
                {idx < steps.length - 1 && (
                  <div className="max-lg:hidden flex items-center justify-center absolute -right-3 top-1/2 -translate-y-1/2 z-20 size-6 rounded-full bg-white border border-slate-200 text-slate-400 shadow-2xs">
                    <ChevronRight className="size-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* ==========================================================================
   5. FEATURED BUSINESSES BENTO SHOWCASE
   ========================================================================== */
export function FeaturedBusinesses() {
  return (
    <section className="section-pad cv-auto">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <span className="eyebrow">Enterprise Directory</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Explore Verified Profiles
            </h2>
            <p className="mt-2 text-sm text-slate-500 max-w-xl">
              Preview representative corporate profiles across manufacturing, technology, renewable energy, and life sciences.
            </p>
          </div>
          <Button variant="secondary" href="/demo/directory" rightIcon={<ArrowUpRight className="size-4" />}>
            Browse All 14,200+ Businesses
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {businesses.slice(0, 6).map((b) => (
            <BusinessCard key={b.id} business={b} />
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200/70 bg-white/70 p-4 text-center text-xs text-slate-500 backdrop-blur-md">
          Notice: Corporate names, scores, and identifiers shown are illustrative demonstration entries synthesized for interface evaluation.
        </div>
      </Container>
    </section>
  );
}

/* ==========================================================================
   6. SCORING METHODOLOGY EXPLAINER
   ========================================================================== */
export function ScoreExplainer() {
  const barGradients = [
    'from-primary-600 to-cyan-400',
    'from-primary-500 to-primary-400',
    'from-amber-500 to-orange-400',
    'from-primary-500 to-cyan-400',
    'from-rose-500 to-pink-400',
    'from-purple-500 to-violet-400',
  ];

  return (
    <section className="section-pad bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white relative overflow-hidden cv-auto">
      <div className="absolute right-0 top-0 size-96 rounded-full bg-primary-500/15 blur-3xl pointer-events-none" />
      <div className="absolute left-0 bottom-0 size-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-400/30 bg-primary-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary-300">
              <Scale className="size-3.5" />
              Transparent Indexing
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              An objective score <br />
              with a clear methodology.
            </h2>
            <p className="mt-5 text-sm sm:text-base leading-relaxed text-slate-300 max-w-lg">
              The BITAINTEL index synthesizes published corporate factors into a transparent 0–100 score. It helps organize due-diligence data for review without acting as a credit rating or commercial performance guarantee.
            </p>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                ['90–100', 'Platinum Tier', 'Negligible Risk', 'text-primary-300'],
                ['80–89', 'Gold Tier', 'Low Risk', 'text-primary-300'],
                ['70–79', 'Silver Tier', 'Standard Risk', 'text-indigo-300'],
                ['50–69', 'Audited', 'Moderate Risk', 'text-amber-300'],
                ['< 50', 'Under Review', 'Action Required', 'text-rose-300'],
              ].map(([range, tier, desc, colorClass]) => (
                <div
                  key={range}
                  className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md"
                >
                  <span className={cn('text-sm font-extrabold block', colorClass)}>
                    {range}
                  </span>
                  <span className="mt-1 text-xs font-bold text-white block">
                    {tier}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-none">
                    {desc}
                  </span>
                </div>
              ))}
            </div>

            <Button
              variant="glass"
              href="/demo/how-it-works"
              className="mt-8 text-white border-white/20 bg-white/10 hover:bg-white/20"
              rightIcon={<ArrowRight className="size-4" />}
            >
              Read Full Scoring Specifications
            </Button>
          </div>

          {/* Scoring Weight Breakdown Card */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Score Weighting Matrix</h3>
                <p className="text-xs text-slate-400 mt-0.5">Total Composite Weight · 100%</p>
              </div>
              <Badge kind="glass">Phase 1 Specs</Badge>
            </div>

            <div className="space-y-4">
              {verificationCheckpoints.map((cp, idx) => (
                <div key={cp.title} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{cp.title}</span>
                    <span className="font-extrabold text-primary-300">{cp.weight}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-1000', barGradients[idx % barGradients.length])}
                      style={{ width: cp.weight }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    {cp.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ==========================================================================
   7. BOTTOM CTA SECTION (Luxurious Deep Theme Primary Gradient)
   ========================================================================== */
export function BottomCta() {
  return (
    <section className="section-pad cv-auto">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-primary-500/30 bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 p-8 sm:p-14 text-white shadow-2xl">
          <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-primary-400/10 blur-3xl" />
          <div className="pointer-events-none absolute left-1/3 -bottom-20 size-64 rounded-full bg-cyan-400/15 blur-2xl" />

          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-400/30 bg-primary-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-300">
              <Sparkles className="size-3.5" />
              Elevate Your Corporate Trust Profile
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Make trust part of your procurement process.
            </h2>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-primary-100/90 max-w-xl">
              Register your enterprise today or search our verified directory to evaluate commercial partners with complete clarity.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                variant="primary"
                size="lg"
                href="/demo/register"
                rightIcon={<ArrowRight className="size-4" />}
              >
                Register Your Business
              </Button>
              <Button
                variant="secondary"
                size="lg"
                href="/demo/directory"
                className="!bg-white !text-slate-900 hover:!bg-slate-100 hover:!text-slate-950 !border-white shadow-md font-bold"
              >
                Explore Directory
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
