'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Scale,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  MapPin,
  Award,
  Layers,
  ExternalLink,
  ChevronRight,
  Filter,
  Sparkles,
  Users,
  Factory,
  Cpu,
  FlaskConical,
  Stethoscope,
  Sun,
  Package,
  Shield,
  Lock,
  FileCheck2,
  ArrowUpRight,
  HelpCircle,
  Check,
  Copy,
  Calendar,
  FileText,
  Zap,
  Activity,
  Info,
  BarChart3,
  Fingerprint,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Badge, type BadgeKind } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ScoreRing } from '@/components/business/ScoreRing';
import { BusinessCard } from '@/components/business/BusinessCard';
import { EnquiryModal } from '@/components/business/EnquiryModal';
import { Accordion } from '@/components/ui/Accordion';
import { Logo } from '@/components/ui/Logo';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { businesses, type Business } from '@/data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/* ==========================================================================
   1. BUYER HERO WITH SEARCH + THE LIVE VERIFICATION ENGINE CONSOLE
   ========================================================================== */
export function BuyerHero() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState('All');
  const [activeEngineTab, setActiveEngineTab] = useState<'entity' | 'statutory' | 'risk'>('entity');

  const industries = [
    'All',
    'Manufacturing',
    'Healthcare & Pharma',
    'Renewable Energy',
    'IT Services',
    'Packaging',
    'Textile',
  ];

  const popularSearches = [
    { label: 'Precision CNC Machining', industry: 'Manufacturing' },
    { label: 'WHO-GMP Botanical Extracts', industry: 'Healthcare & Pharma' },
    { label: 'Zero-Trust Cloud Infrastructure', industry: 'IT Services' },
    { label: 'Active 24Mo GSTN Filings', industry: 'All' },
    { label: 'Tier 4 Platinum Audited', industry: 'All' },
    { label: 'Solar Arrays & BESS Storage', industry: 'Renewable Energy' },
  ];

  function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    if (industry && industry !== 'All') params.set('industry', industry);
    router.push(`/demo/directory?${params.toString()}`);
  }

  function handleChipClick(chipLabel: string, chipIndustry: string) {
    setQuery(chipLabel);
    setIndustry(chipIndustry);
    const params = new URLSearchParams();
    params.set('search', chipLabel);
    if (chipIndustry !== 'All') params.set('industry', chipIndustry);
    router.push(`/demo/directory?${params.toString()}`);
  }

  return (
    <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute left-1/4 top-0 -translate-y-1/2 size-[650px] rounded-full bg-gradient-to-tr from-primary-400/20 via-primary-200/15 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-1/4 size-[520px] rounded-full bg-gradient-to-bl from-primary-400/20 via-cyan-200/15 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 bottom-0 size-[500px] rounded-full bg-gradient-to-t from-primary-200/15 via-primary-100/10 to-transparent blur-3xl" />

      <Container className="relative">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <Badge kind="primary" icon={false}>B2B Buyer Intelligence</Badge>
          <Badge kind="mint" icon={false}>Audited Supplier Dossiers</Badge>
          <Badge kind="lavender" icon={false}>Side-by-Side Comparison</Badge>
          <Badge kind="amber" icon={false}>100% Statutory Verified</Badge>
        </div>

        {/* Hero Headings */}
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/95 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-800 shadow-2xs backdrop-blur-md">
            <span className="size-2 rounded-full bg-primary-500 animate-pulse" />
            Zero Guesswork B2B Procurement
          </div>

          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-6xl lg:text-7xl leading-[1.08]">
            Find, verify & compare <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-cyan-500 bg-clip-text text-transparent">
              audited suppliers.
            </span>
          </h1>

          <p className="mt-5 mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600">
            Search verified corporate profiles, inspect government statutory filings, and compare supplier credentials side-by-side before issuing RFIs or signing contracts.
          </p>

          {/* Interactive Buyer Search Box */}
          <div className="mt-8 mx-auto max-w-3xl">
            <form
              onSubmit={handleSearch}
              className="rounded-3xl border border-primary-200/80 bg-white/95 p-2 sm:p-2.5 shadow-xl shadow-primary-950/5 backdrop-blur-xl flex flex-col md:flex-row gap-2"
            >
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-4 size-5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by company, product (e.g. CNC, Pharma), GSTIN or city..."
                  className="w-full pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 rounded-2xl bg-transparent outline-none font-medium"
                />
              </div>

              {/* Industry Filter Custom Dropdown */}
              <div className="w-full md:w-56 border-t md:border-t-0 md:border-l border-slate-100 px-1 pt-2 md:pt-0 flex items-center">
                <CustomDropdown
                  value={industry}
                  onChange={(val) => setIndustry(val)}
                  options={industries.map((ind) => ({
                    value: ind,
                    label: ind === 'All' ? 'All Industries' : ind,
                  }))}
                  placeholder="Select Industry"
                  buttonClassName="border-0 bg-transparent shadow-none min-h-11 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50/80 rounded-xl focus:ring-0 focus:border-0"
                  menuClassName="min-w-56 shadow-2xl"
                />
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full md:w-auto shrink-0 justify-center rounded-2xl"
                rightIcon={<ArrowRight className="size-4" />}
              >
                Search Suppliers
              </Button>
            </form>

            {/* Popular Searches Quick Pills */}
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
                <Sparkles className="size-3 text-primary-500" /> Popular:
              </span>
              {popularSearches.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleChipClick(chip.label, chip.industry)}
                  className="rounded-full bg-slate-100/90 hover:bg-primary-50 text-slate-600 hover:text-primary-700 border border-slate-200/80 hover:border-primary-200 px-2.5 py-1 text-[11px] font-semibold transition-all"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ==================================================================
            THE VERIFICATION ENGINE CONSOLE (Bespoke Software Console)
            ================================================================== */}
        <div className="mt-12 max-w-5xl mx-auto">
          {/* Micro trust signals strip */}
          <div className="mb-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
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

          <div className="rounded-3xl border border-white/95 bg-white/85 p-4 sm:p-7 shadow-[0_20px_60px_-15px_rgba(14,14,26,0.07)] backdrop-blur-2xl">
            {/* Top Mock Window Bar with macOS style dots */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="size-2.5 sm:size-3 rounded-full bg-rose-300" />
                <span className="size-2.5 sm:size-3 rounded-full bg-amber-300" />
                <span className="size-2.5 sm:size-3 rounded-full bg-primary-300" />
                <div className="ml-1 sm:ml-2 flex items-center gap-1.5">
                  <Logo variant="icon" size="sm" />
                  <span className="text-[10px] sm:text-xs font-bold text-slate-800 uppercase tracking-wider truncate">
                    VERIFICATION ENGINE
                  </span>
                </div>
              </div>

              {/* Segmented control tabs */}
              <div className="flex items-center gap-1 sm:gap-1.5 rounded-full bg-slate-100/90 p-1 border border-slate-200/70 text-xs self-start sm:self-auto">
                {(['entity', 'statutory', 'risk'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveEngineTab(tab)}
                    className={cn(
                      'rounded-full px-3 py-1 text-[11px] sm:text-xs font-bold capitalize transition-all',
                      activeEngineTab === tab
                        ? 'bg-slate-900 !text-white text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    {tab === 'entity' ? 'Entity' : tab === 'statutory' ? 'Statutory' : 'Risk'}
                  </button>
                ))}
              </div>
            </div>

            {/* Inner Bento Grid */}
            <div className="mt-6 grid gap-5 md:grid-cols-12">
              {/* Left Column: Stat Cards */}
              <div className="md:col-span-4 flex flex-col gap-4">
                {/* Stat 1: 99.4% */}
                <div className="rounded-2xl border border-primary-200/80 bg-gradient-to-br from-primary-50/80 to-white/90 p-4 sm:p-5 shadow-2xs backdrop-blur-md">
                  <span className="text-2xl sm:text-4xl font-black tracking-tight text-primary-700">
                    99.4%
                  </span>
                  <p className="mt-1 text-xs font-bold text-primary-950 uppercase tracking-wide">
                    STATUTORY ACCURACY
                  </p>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    Automated multi-point reconciliation against live MCA and GSTN data layers.
                  </p>
                </div>

                {/* Stat 2: 14,200+ */}
                <div className="rounded-2xl border border-primary-200/80 bg-gradient-to-br from-primary-50/80 to-white/90 p-4 sm:p-5 shadow-2xs backdrop-blur-md">
                  <span className="text-2xl sm:text-4xl font-black tracking-tight text-primary-700">
                    14,200+
                  </span>
                  <p className="mt-1 text-xs font-bold text-primary-950 uppercase tracking-wide">
                    ENTERPRISE PROFILES
                  </p>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    Audited suppliers and manufacturing hubs active across national corridors.
                  </p>
                </div>

                {/* Stat 3: Audit Status */}
                <div className="rounded-2xl border border-orange-200/80 bg-gradient-to-br from-orange-50/80 to-white/90 p-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider block">
                      AUDIT STATUS
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      Tier 4 Verified Entity
                    </span>
                  </div>
                  <Badge kind="mint">100% Validated</Badge>
                </div>
              </div>

              {/* Right Column: Live Company Card & Tabs */}
              <div className="md:col-span-8 flex flex-col gap-4 min-w-0">
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
                          TRUST INDEX
                        </span>
                        <span className="text-xs font-bold text-primary-600">
                          Highest Confidence
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tab 1: Entity */}
                  {activeEngineTab === 'entity' && (
                    <div className="mt-5 space-y-3 pt-4 border-t border-slate-100 animate-in fade-in">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-3 rounded-xl bg-primary-50/50 border border-primary-100/70">
                          <span className="text-[10px] text-primary-700 uppercase font-bold block">TENURE</span>
                          <span className="font-bold text-slate-800">23 Years</span>
                        </div>
                        <div className="p-3 rounded-xl bg-cyan-50/50 border border-cyan-100/70">
                          <span className="text-[10px] text-cyan-700 uppercase font-bold block">TURNOVER</span>
                          <span className="font-bold text-slate-800">₹50–100 Cr</span>
                        </div>
                        <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/70">
                          <span className="text-[10px] text-indigo-600 uppercase font-bold block">EMPLOYEES</span>
                          <span className="font-bold text-slate-800">250–500</span>
                        </div>
                        <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100/70">
                          <span className="text-[10px] text-orange-600 uppercase font-bold block">ISO CERTIFIED</span>
                          <span className="font-bold text-primary-800">IATF 16949</span>
                        </div>
                      </div>

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

                  {/* Tab 2: Statutory */}
                  {activeEngineTab === 'statutory' && (
                    <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-100 animate-in fade-in text-xs">
                      {[
                        ['Ministry of Corporate Affairs (ROC)', 'Active & Compliant · Filings current', '20/20', 'mint'],
                        ['Central Board of Indirect Taxes (GSTN)', 'Regular 100% on-time return cycle', '20/20', 'primary'],
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

                  {/* Tab 3: Risk */}
                  {activeEngineTab === 'risk' && (
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

                {/* Bottom Status Strip */}
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
   2. MASTER-DETAIL DUE DILIGENCE TERMINAL (ONE SIDE ELEMENTS, ONE SIDE DETAILS)
   ========================================================================== */
export function LiveDossierTerminal() {
  const terminalVendors = businesses.slice(0, 5);
  const [selectedId, setSelectedId] = useState<string>(terminalVendors[0].id);
  const [inspectorTab, setInspectorTab] = useState<'statutory' | 'premises' | 'quality' | 'financials'>('statutory');

  const activeVendor = terminalVendors.find((v) => v.id === selectedId) || terminalVendors[0];

  function copyCin(cin: string) {
    navigator.clipboard?.writeText(cin);
    toast.success('CIN Copied to Clipboard', {
      description: cin,
    });
  }

  // Realistic monthly GSTR-3B filing health (12 months)
  const monthlyFilings = [
    { month: 'Nov 25', onTime: true },
    { month: 'Dec 25', onTime: true },
    { month: 'Jan 26', onTime: true },
    { month: 'Feb 26', onTime: true },
    { month: 'Mar 26', onTime: true },
    { month: 'Apr 26', onTime: true },
    { month: 'May 26', onTime: true },
    { month: 'Jun 26', onTime: true },
    { month: 'Jul 26', onTime: true },
    { month: 'Aug 26', onTime: true },
    { month: 'Sep 26', onTime: true },
    { month: 'Oct 26', onTime: true },
  ];

  return (
    <section className="section-pad bg-slate-50/70 border-y border-slate-200/80">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <span className="eyebrow">Interactive Due Diligence Terminal</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Live Dossier Inspector: <span className="text-primary-700">Select & verify records.</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600 max-w-2xl">
              Choose an enterprise on the left to inspect real-time government statutory records, physical plant geotags, and audited capacity on the right.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              MCA Gateway Live
            </span>
            <Button href="/demo/directory" variant="secondary" size="sm" rightIcon={<ArrowRight className="size-3.5" />}>
              All 12+ Profiles
            </Button>
          </div>
        </div>

        {/* Master-Detail Split Grid */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* ================================================================
              LEFT COLUMN: SELECTABLE ENTERPRISE ELEMENTS
              ================================================================ */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="flex items-center justify-between px-2 pb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Candidate Enterprise Elements ({terminalVendors.length})
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Click to inspect</span>
            </div>

            {/* Quick Enterprise Jump Dropdown for Mobile */}
            <div className="block lg:hidden">
              <CustomDropdown
                label="Quick Enterprise Jump"
                value={selectedId}
                onChange={(val) => setSelectedId(val)}
                options={terminalVendors.map((vendor) => ({
                  value: vendor.id,
                  label: `${vendor.name} (${vendor.badge} · Score ${vendor.score})`,
                }))}
                buttonClassName="min-h-10 py-2 text-xs font-bold"
              />
            </div>

            {terminalVendors.map((vendor) => {
              const isSelected = vendor.id === selectedId;
              return (
                <div
                  key={vendor.id}
                  onClick={() => setSelectedId(vendor.id)}
                  className={cn(
                    'group relative rounded-2xl p-4 sm:p-4.5 cursor-pointer transition-all duration-200 border text-left',
                    isSelected
                      ? 'bg-white border-primary-500 shadow-md shadow-primary-950/5 ring-2 ring-primary-500/20'
                      : 'bg-white/80 hover:bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
                  )}
                >
                  {/* Left accent bar for active item */}
                  {isSelected && (
                    <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-primary-600 rounded-r-full" />
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={cn(
                          'size-11 rounded-xl font-bold grid place-items-center text-sm shrink-0 transition-colors',
                          isSelected
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                        )}
                      >
                        {vendor.initials}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-slate-900 truncate">
                            {vendor.name}
                          </h4>
                          {vendor.verified && (
                            <CheckCircle2 className="size-3.5 text-primary-600 shrink-0" />
                          )}
                        </div>

                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {vendor.industry} · {vendor.city}, {vendor.state}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60 font-mono">
                            Tier {vendor.level} Audited
                          </span>
                          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                            MCA Active
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score badge & chevron */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-1 font-mono font-black text-sm text-slate-900 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/70">
                        <span className="text-primary-700">{vendor.score}</span>
                        <span className="text-[10px] text-slate-400">/100</span>
                      </div>
                      <ChevronRight
                        className={cn(
                          'size-4 transition-transform',
                          isSelected ? 'text-primary-600 translate-x-0.5' : 'text-slate-300'
                        )}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ================================================================
              RIGHT COLUMN: DEEP LIVE INSPECTION DETAILS
              ================================================================ */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl shadow-primary-950/5 backdrop-blur-xl">
              {/* Header: Vendor Details */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-800 text-[11px] font-bold border border-primary-200">
                      {activeVendor.badge} Accreditation
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-emerald-500" /> Statutory Verified
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {activeVendor.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Legal Name: <span className="text-slate-700 font-semibold">{activeVendor.legalName}</span>
                  </p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-mono">
                    <span className="inline-flex items-center gap-1">
                      CIN: <code className="font-bold text-slate-800">{activeVendor.cin}</code>
                      <button
                        type="button"
                        onClick={() => copyCin(activeVendor.cin)}
                        className="text-slate-400 hover:text-primary-600"
                        title="Copy CIN"
                      >
                        <Copy className="size-3" />
                      </button>
                    </span>
                    <span>GSTIN: <code className="font-bold text-slate-800">{activeVendor.gstin}</code></span>
                  </div>
                </div>

                {/* Score Widget */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary-50/70 border border-primary-200/80 self-start">
                  <ScoreRing score={activeVendor.score} size={48} strokeWidth={3.5} showGrade />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary-800 block">
                      Trust Score
                    </span>
                    <span className="text-xs font-bold text-primary-600">
                      {activeVendor.score >= 90 ? 'Platinum Tier' : 'High Confidence'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Audited {activeVendor.lastAudited}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sub-Tabs Selector */}
              <div className="mt-5 flex flex-wrap items-center gap-1.5 pb-4 border-b border-slate-100">
                {[
                  { id: 'statutory', label: 'Statutory Filings' },
                  { id: 'premises', label: 'Physical Plant & Geotags' },
                  { id: 'quality', label: 'Certifications & Hash' },
                  { id: 'financials', label: 'Financials & UDIN' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setInspectorTab(tab.id as typeof inspectorTab)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
                      inspectorTab === tab.id
                        ? 'bg-primary-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: Statutory Filings */}
              {inspectorTab === 'statutory' && (
                <div className="mt-5 space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Ministry of Corporate Affairs Status
                      </span>
                      <span className="mt-1 font-bold text-slate-900 block flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                        Active Incorporation (ROC RoC-{activeVendor.state})
                      </span>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Tenure: {activeVendor.age} Years Active · Authorized Capital: ₹5.00 Cr
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Director KYC & DIN Clearance
                      </span>
                      <span className="mt-1 font-bold text-slate-900 block flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                        3 Registered DINs Verified Active
                      </span>
                      <p className="mt-1 text-[11px] text-slate-500">
                        No disqualification notices under Section 164(2) of Companies Act.
                      </p>
                    </div>
                  </div>

                  {/* 12-Month GSTN GSTR-3B Grid */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <BarChart3 className="size-4 text-primary-600" />
                        Consecutive GSTN GSTR-3B & GSTR-1 Filing History (Last 12 Months)
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        100% On-Time
                      </span>
                    </div>

                    <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 pt-1">
                      {monthlyFilings.map((f) => (
                        <div
                          key={f.month}
                          className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-slate-200 text-center"
                        >
                          <span className="text-[9px] font-mono text-slate-500 font-semibold">{f.month}</span>
                          <span className="mt-1 size-2 rounded-full bg-emerald-500" />
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Reconciled via automated GSTN API gateway. All statutory tax liability remittances cleared without interest penalties.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: Physical Plant & Geotags */}
              {inspectorTab === 'premises' && (
                <div className="mt-5 space-y-3.5 animate-in fade-in text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Audited Facility & Manufacturing Site
                    </span>
                    <div className="flex items-start gap-2 text-slate-800 font-medium">
                      <MapPin className="size-4 text-primary-600 shrink-0 mt-0.5" />
                      <span>
                        Plot 48/B, Industrial Corridor, MIDC Industrial Area, {activeVendor.city}, {activeVendor.state} — Pin 411018
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
                        GPS Geotag: 18.5204° N, 73.8567° E
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                        Physical On-Site Audit Passed
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Sanctioned Power Load Verification
                      </span>
                      <span className="mt-1 font-bold text-slate-900 block flex items-center gap-1.5">
                        <Zap className="size-4 text-amber-600" />
                        450 kVA High-Tension (HT) Line
                      </span>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Verified via official electricity utility meter registration #EB-9281.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Premises Title / Lease Tenure
                      </span>
                      <span className="mt-1 font-bold text-slate-900 block flex items-center gap-1.5">
                        <FileText className="size-4 text-indigo-600" />
                        99-Year Industrial Lease Deed
                      </span>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Registered with Department of Revenue & Stamps. Non-encumbered.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Quality & Certifications */}
              {inspectorTab === 'quality' && (
                <div className="mt-5 space-y-3.5 animate-in fade-in text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-sm">
                        {activeVendor.isoCertified}
                      </span>
                      <Badge kind="mint">Active Certification</Badge>
                    </div>
                    <p className="mt-1.5 text-slate-500 text-[11px] leading-relaxed">
                      Audited by TÜV SÜD South Asia / BSI Management Systems. Quality manual, traceability matrices, and calibration logs verified.
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
                      <span>Cert ID: QA-IND-2024-9104</span>
                      <span>Valid Thru: 18 Nov 2028</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-primary-50/50 border border-primary-100 flex items-start gap-3">
                    <Fingerprint className="size-5 text-primary-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">
                        Cryptographic Evidence Audit Hash
                      </span>
                      <code className="text-[10px] text-slate-500 font-mono break-all mt-0.5 block">
                        SHA-256: 0x8a91c49f82d3e901f4b7c8a6b2c4e1f8d9a3b7c2e4f6a8b1c3d5e7f9a2b4c6e8
                      </code>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Financials & UDIN */}
              {inspectorTab === 'financials' && (
                <div className="mt-5 space-y-3.5 animate-in fade-in text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Annual Turnover</span>
                      <span className="mt-1 text-base font-bold text-slate-900 block">{activeVendor.turnover}</span>
                      <span className="text-[10px] text-slate-500">Audited Financials</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Workforce Band</span>
                      <span className="mt-1 text-base font-bold text-slate-900 block">{activeVendor.employees}</span>
                      <span className="text-[10px] text-slate-500">EPFO Verified</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Operating Tenure</span>
                      <span className="mt-1 text-base font-bold text-slate-900 block">{activeVendor.age} Years</span>
                      <span className="text-[10px] text-slate-500">Continuous Operations</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Chartered Accountant Attestation
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-800 block">
                      UDIN: 24082914AAAAAA1234 · ICAI Attested
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Balance sheet audited under Indian Accounting Standards (Ind AS). Solvent debt service coverage ratio.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Footer Bar */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    href={`/demo/business/${activeVendor.id}`}
                    variant="primary"
                    size="sm"
                    rightIcon={<ArrowRight className="size-3.5" />}
                  >
                    View Complete Profile
                  </Button>
                  <Button
                    href={`/demo/compare?ids=${activeVendor.id}`}
                    variant="secondary"
                    size="sm"
                    rightIcon={<Scale className="size-3.5" />}
                  >
                    Compare in Matrix
                  </Button>
                </div>

                <EnquiryModal business={activeVendor} />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ==========================================================================
   3. INTERACTIVE SIDE-BY-SIDE COMPARISON SANDBOX FOR BUYERS
   ========================================================================== */
export function BuyerComparisonSandbox() {
  const comparisonPresets = [
    {
      title: 'Precision Steel vs. Cloud Infrastructure',
      ids: ['meridian-steel-works', 'nexora-cloud-systems'],
      summary: 'Compare Tier-4 heavy materials fabrication against Tier-4 cloud security architecture',
    },
    {
      title: 'Bio Extracts vs. Solar Energy Systems',
      ids: ['greenleaf-bio-extracts', 'aurora-clean-energy'],
      summary: 'Benchmark WHO-GMP botanical formulations against ISO 14001 commercial solar BESS',
    },
    {
      title: 'Packaging Films vs. Electro-Mechanical Components',
      ids: ['propack-sustainable', 'bluepeak-precision-parts'],
      summary: 'Side-by-side compliance, operational tenure & revenue bands',
    },
  ];

  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const activePreset = comparisonPresets[activePresetIndex];

  const candidateA = businesses.find((b) => b.id === activePreset.ids[0]) || businesses[0];
  const candidateB = businesses.find((b) => b.id === activePreset.ids[1]) || businesses[1];

  const comparePoints = [
    {
      label: 'Composite Trust Score',
      renderA: (b: Business) => (
        <div className="flex items-center gap-2">
          <ScoreRing score={b.score} size={36} strokeWidth={3} showGrade />
          <span className="font-extrabold text-slate-900 text-sm">{b.score} / 100</span>
        </div>
      ),
      renderB: (b: Business) => (
        <div className="flex items-center gap-2">
          <ScoreRing score={b.score} size={36} strokeWidth={3} showGrade />
          <span className="font-extrabold text-slate-900 text-sm">{b.score} / 100</span>
        </div>
      ),
    },
    {
      label: 'Statutory Verification Tier',
      renderA: (b: Business) => <Badge kind="level">Tier {b.level} Audited</Badge>,
      renderB: (b: Business) => <Badge kind="level">Tier {b.level} Audited</Badge>,
    },
    {
      label: 'MCA & Active GSTN Status',
      renderA: () => <Badge kind="verified">Active & Reconciled</Badge>,
      renderB: () => <Badge kind="verified">Active & Reconciled</Badge>,
    },
    {
      label: 'Quality & ISO Accreditation',
      renderA: (b: Business) => <span className="font-bold text-primary-800">{b.isoCertified}</span>,
      renderB: (b: Business) => <span className="font-bold text-primary-800">{b.isoCertified}</span>,
    },
    {
      label: 'Operational Tenure',
      renderA: (b: Business) => <span className="font-semibold text-slate-800">{b.age} Years Operational</span>,
      renderB: (b: Business) => <span className="font-semibold text-slate-800">{b.age} Years Operational</span>,
    },
    {
      label: 'Annual Turnover Range',
      renderA: (b: Business) => <span className="font-semibold text-slate-800">{b.turnover}</span>,
      renderB: (b: Business) => <span className="font-semibold text-slate-800">{b.turnover}</span>,
    },
    {
      label: 'Corporate CIN',
      renderA: (b: Business) => <code className="font-mono text-[11px] text-slate-600">{b.cin}</code>,
      renderB: (b: Business) => <code className="font-mono text-[11px] text-slate-600">{b.cin}</code>,
    },
    {
      label: 'Registered Location',
      renderA: (b: Business) => <span className="text-slate-600">{b.location}</span>,
      renderB: (b: Business) => <span className="text-slate-600">{b.location}</span>,
    },
    {
      label: 'Core Capabilities',
      renderA: (b: Business) => (
        <div className="flex flex-wrap gap-1">
          {b.products.slice(0, 2).map((p) => (
            <span key={p} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700 font-medium">
              {p}
            </span>
          ))}
        </div>
      ),
      renderB: (b: Business) => (
        <div className="flex flex-wrap gap-1">
          {b.products.slice(0, 2).map((p) => (
            <span key={p} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700 font-medium">
              {p}
            </span>
          ))}
        </div>
      ),
    },
  ];

  return (
    <section className="section-pad">
      <Container>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <span className="eyebrow">Instant Supplier Evaluation</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Compare candidate vendors <span className="text-primary-700">side-by-side.</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600 max-w-2xl">
              Procurement teams don&apos;t rely on sales brochures. See how two candidate suppliers match up across statutory filings, audited capabilities, and independent trust scores.
            </p>
          </div>

          {/* Preset Selector: Desktop Buttons + Mobile CustomDropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="hidden sm:flex flex-wrap items-center gap-2">
              {comparisonPresets.map((preset, idx) => (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => setActivePresetIndex(idx)}
                  className={cn(
                    'rounded-full px-3.5 py-1.5 text-xs font-bold transition-all border',
                    activePresetIndex === idx
                      ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-100'
                  )}
                >
                  {preset.title}
                </button>
              ))}
            </div>

            <div className="block sm:hidden w-full min-w-[260px]">
              <CustomDropdown
                label="Select Comparison Pair"
                value={activePresetIndex.toString()}
                onChange={(val) => setActivePresetIndex(Number(val))}
                options={comparisonPresets.map((preset, idx) => ({
                  value: idx.toString(),
                  label: preset.title,
                }))}
                buttonClassName="min-h-10 py-2 text-xs font-bold"
              />
            </div>
          </div>
        </div>

        {/* Live Comparison Sandbox Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-6 sm:p-8 shadow-xl shadow-primary-950/5 backdrop-blur-xl">
          {/* Header Row: Vendor A vs. Vendor B */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
            {/* Vendor A */}
            <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-primary-50/50 border border-primary-100">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-primary-700 text-white font-bold grid place-items-center text-sm shadow-md shadow-primary-600/20">
                  {candidateA.initials}
                </div>
                <div>
                  <Badge kind="verified" icon={true} className="mb-1">Verified Entity</Badge>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {candidateA.name}
                  </h3>
                  <p className="text-xs text-slate-500">{candidateA.city}, {candidateA.state}</p>
                </div>
              </div>
              <Button href={`/demo/business/${candidateA.id}`} variant="ghost" size="sm" rightIcon={<ArrowUpRight className="size-3.5" />}>
                Dossier
              </Button>
            </div>

            {/* Vendor B */}
            <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-slate-800 text-white font-bold grid place-items-center text-sm shadow-md">
                  {candidateB.initials}
                </div>
                <div>
                  <Badge kind="level" icon={true} className="mb-1">Tier {candidateB.level} Audited</Badge>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {candidateB.name}
                  </h3>
                  <p className="text-xs text-slate-500">{candidateB.city}, {candidateB.state}</p>
                </div>
              </div>
              <Button href={`/demo/business/${candidateB.id}`} variant="ghost" size="sm" rightIcon={<ArrowUpRight className="size-3.5" />}>
                Dossier
              </Button>
            </div>
          </div>

          {/* Comparison Points Table */}
          <div className="mt-4 divide-y divide-slate-100">
            {comparePoints.map((row) => (
              <div
                key={row.label}
                className="py-3.5 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center text-xs hover:bg-slate-50/60 rounded-xl px-2 transition-colors"
              >
                <div className="md:col-span-4 font-bold text-slate-600">
                  {row.label}
                </div>
                <div className="md:col-span-4 flex items-center">
                  {row.renderA(candidateA)}
                </div>
                <div className="md:col-span-4 flex items-center">
                  {row.renderB(candidateB)}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Action Bar */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="size-4 text-primary-600" />
              <span>Want to add a 3rd or 4th supplier to this matrix?</span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                href={`/demo/compare?ids=${candidateA.id},${candidateB.id}`}
                variant="primary"
                className="w-full sm:w-auto justify-center"
                rightIcon={<Scale className="size-4" />}
              >
                Open Full Comparison Matrix
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ==========================================================================
   4. INDUSTRY VERTICALS EXPLORER FOR BUYERS
   ========================================================================== */
export function BuyerCategoryGrid() {
  const categories = [
    {
      title: 'Precision CNC & Machining',
      count: '480+ Audited Facilities',
      desc: 'Tier-1 & Tier-2 component suppliers with active ISO 9001 and automotive IATF 16949.',
      icon: Factory,
      tag: 'Manufacturing',
      industryParam: 'Manufacturing',
    },
    {
      title: 'Industrial Electronics & IoT',
      count: '320+ Verified Makers',
      desc: 'PCB assembly, embedded hardware, sensory equipment, and automation panels.',
      icon: Cpu,
      tag: 'IT Services',
      industryParam: 'IT+Services',
    },
    {
      title: 'Healthcare, Pharma & APIs',
      count: '190+ Inspected Labs',
      desc: 'WHO-GMP validated pharmaceutical formulations, active ingredients, and hospital tech.',
      icon: Stethoscope,
      tag: 'Healthcare & Pharma',
      industryParam: 'Healthcare+%26+Pharma',
    },
    {
      title: 'Specialty Chemicals & Polymers',
      count: '240+ Verified Producers',
      desc: 'Polymer extrusions, organic solvents, industrial adhesives with SPCB pollution clearance.',
      icon: FlaskConical,
      tag: 'Chemicals',
      industryParam: 'Manufacturing',
    },
    {
      title: 'CleanTech & Solar Energy',
      count: '160+ Audited Suppliers',
      desc: 'Photovoltaic modules, inverters, battery storage solutions, and EV charging components.',
      icon: Sun,
      tag: 'CleanTech',
      industryParam: 'CleanTech+%26+Energy',
    },
    {
      title: 'Enterprise Packaging & Logistics',
      count: '210+ Verified Networks',
      desc: 'Corrugated cartons, cold-chain distributors, and high-volume freight logistics partners.',
      icon: Package,
      tag: 'Logistics',
      industryParam: 'Logistics+%26+Packaging',
    },
  ];

  return (
    <section className="section-pad bg-slate-50/60 border-t border-slate-200/80">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <span className="eyebrow">Industry Breakdown</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Browse verified suppliers by <span className="text-primary-700">sector.</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600 max-w-xl">
              Target specific industry capabilities. All listed entities feature validated statutory filings and audited plant parameters.
            </p>
          </div>
          <Button href="/demo/directory" variant="secondary" rightIcon={<ArrowRight className="size-4" />}>
            Explore All Sectors
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <Link
                key={cat.title}
                href={`/demo/directory?industry=${cat.industryParam}`}
                className="group relative rounded-3xl border border-slate-200/80 bg-white p-7 transition-all duration-300 hover:border-primary-300 hover:shadow-lg hover:shadow-primary-950/5 hover:-translate-y-1 block"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="size-12 rounded-2xl bg-primary-50 text-primary-700 grid place-items-center group-hover:bg-primary-600 group-hover:text-white transition-colors duration-200">
                    <IconComponent className="size-6" />
                  </div>
                  <span className="text-[11px] font-bold text-primary-800 bg-primary-50 px-3 py-1 rounded-full border border-primary-200/70">
                    {cat.count}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-primary-700 transition-colors">
                  {cat.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  {cat.desc}
                </p>

                <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-primary-700 group-hover:gap-2.5 transition-all">
                  <span>View Verified Companies</span>
                  <ArrowRight className="size-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* ==========================================================================
   5. FEATURED BUSINESSES WITH INSTANT COMPARE CHECKBOX
   ========================================================================== */
export function BuyerFeaturedSuppliers() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');

  const filterTabs = [
    'All',
    'Manufacturing',
    'Healthcare & Pharma',
    'Renewable Energy',
    'IT Services',
  ];

  const filteredBusinesses =
    selectedIndustry === 'All'
      ? businesses.slice(0, 6)
      : businesses
          .filter((b) => b.industry.toLowerCase().includes(selectedIndustry.toLowerCase()))
          .slice(0, 6);

  return (
    <section className="section-pad">
      <Container>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <span className="eyebrow">Audited Directory Spotlight</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Top verified suppliers ready for <span className="text-primary-700">evaluation.</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600 max-w-xl">
              Inspect corporate profiles, check the comparison box on any card to compare side-by-side, or jump into the complete dossier.
            </p>
          </div>

          {/* Desktop Filter Pills */}
          <div className="hidden sm:flex flex-wrap items-center gap-1.5">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedIndustry(tab)}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-xs font-bold transition-all border',
                  selectedIndustry === tab
                    ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-100'
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Mobile Filter via CustomDropdown */}
          <div className="block sm:hidden w-full min-w-[220px]">
            <CustomDropdown
              label="Filter by Sector"
              value={selectedIndustry}
              onChange={(val) => setSelectedIndustry(val)}
              options={filterTabs.map((tab) => ({
                value: tab,
                label: tab === 'All' ? 'All Industries' : tab,
              }))}
              buttonClassName="min-h-10 py-2 text-xs font-bold"
            />
          </div>
        </div>

        {/* Business Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBusinesses.map((b) => (
            <BusinessCard key={b.id} business={b} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button href="/demo/directory" variant="secondary" size="lg" rightIcon={<ArrowRight className="size-4" />}>
            Explore All {businesses.length}+ Audited Businesses in Directory
          </Button>
        </div>
      </Container>
    </section>
  );
}

/* ==========================================================================
   6. WHY BUYERS TRUST BITAINTEL (DERISKING BENTO)
   ========================================================================== */
export function BuyerWhyUsBento() {
  return (
    <section className="section-pad bg-slate-50/70 border-y border-slate-200/80">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="eyebrow">Enterprise Procurement Safeguards</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Why procurement teams choose <span className="text-primary-700">BITAINTEL.</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600">
            Objective data replaces marketing claims. We synthesize multi-source statutory records into verifiable trust indicators.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-12">
          {/* Bento 1: Statutory Registry Cross-Checks */}
          <div className="md:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xs">
            <div className="size-12 rounded-2xl bg-primary-50 text-primary-700 grid place-items-center mb-5">
              <ShieldCheck className="size-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Direct MCA & GSTN Government API Reconciliation
            </h3>
            <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
              We eliminate shell companies and ghost suppliers by confirming active corporate status against Ministry of Corporate Affairs records and verifying uninterrupted 24-month GSTR-3B filings.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700">MCA Active CIN Check</span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700">Live GSTIN Sync</span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700">Director DIN Verification</span>
            </div>
          </div>

          {/* Bento 2: No Pay-to-Win Ratings */}
          <div className="md:col-span-5 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xs">
            <div className="size-12 rounded-2xl bg-amber-50 text-amber-700 grid place-items-center mb-5">
              <Award className="size-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Unbiased Mathematical Scoring
            </h3>
            <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Suppliers cannot pay for higher positions or inflated stars. Every 0–100 Trust Score is generated by published mathematical weights across documented audit modules.
            </p>
            <div className="mt-6">
              <span className="text-xs font-bold text-primary-700 inline-flex items-center gap-1">
                <CheckCircle2 className="size-4" /> 100% Transparent Algorithm
              </span>
            </div>
          </div>

          {/* Bento 3: Geotagged Physical Premises */}
          <div className="md:col-span-5 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xs">
            <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-700 grid place-items-center mb-5">
              <Building2 className="size-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Physical Factory & Office Audits
            </h3>
            <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Dossiers verify registered factory titles, lease deeds, electricity load utility bills, and geotagged operational locations to ensure suppliers have genuine production capability.
            </p>
          </div>

          {/* Bento 4: Direct Bilateral RFIs */}
          <div className="md:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xs">
            <div className="size-12 rounded-2xl bg-indigo-50 text-indigo-700 grid place-items-center mb-5">
              <FileCheck2 className="size-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Direct Bilateral Inquiries & Zero Middleman Cut
            </h3>
            <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Buyers connect directly with authorized corporate signatories. Send structured specifications, request audit documentation, and initiate commercial dialogue without paying broker commission.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Button href="/demo/directory" variant="secondary" size="sm">
                Search Suppliers Now
              </Button>
              <Button href="/demo/compare" variant="ghost" size="sm">
                Compare Shortlist
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ==========================================================================
   7. BUYER-FOCUSED FAQS
   ========================================================================== */
export function BuyerFaqSection() {
  const buyerFaqs = [
    {
      q: 'Is BITAINTEL free for buyers and procurement officers?',
      a: 'Yes. Exploring the verified corporate directory, inspecting public statutory dossiers, reviewing 0–100 Trust Scores, and running side-by-side vendor comparisons are completely free for buyers and procurement teams.',
    },
    {
      q: 'How do you verify supplier authenticity and physical existence?',
      a: 'Every listed business undergoes automated and human-led statutory checks: incorporation status via MCA 21, continuous 24-month GSTN return filings, director DIN KYC, electricity utility meter verification, and registered premises title deeds.',
    },
    {
      q: 'Can I compare multiple candidate vendors side-by-side?',
      a: 'Yes. You can select up to 4 businesses from anywhere in the directory or search results and open the comparison matrix to evaluate compliance tiers, quality accreditations, operational tenure, and capabilities side-by-side.',
    },
    {
      q: 'How does sending a procurement enquiry work?',
      a: 'Click "Send Direct Enquiry" on any business dossier. Your commercial inquiry, delivery requirements, and target timeline are routed directly to the verified corporate representative without intermediaries.',
    },
    {
      q: 'What if a company I want to evaluate is not listed in BITAINTEL yet?',
      a: 'You can invite the vendor to get audited on BITAINTEL by directing them to our vendor onboarding page (/for-vendors) or contact our advisory team to initiate a custom vendor due-diligence audit.',
    },
  ];

  return (
    <section className="section-pad">
      <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <span className="eyebrow">Procurement Clarity</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Frequently asked questions for <span className="text-primary-700">buyers.</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600">
            Learn how BITAINTEL streamlines counterparty risk assessment, protects commercial confidentiality, and accelerates your vendor empanelment process.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button
              href="/demo/faq"
              variant="secondary"
              rightIcon={<ArrowRight className="size-4" />}
            >
              All Frequently Asked Questions
            </Button>
            <Button href="/demo/contact" variant="ghost">
              Contact Trust Team
            </Button>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white/70 p-4 text-xs text-slate-500 backdrop-blur-md flex items-start gap-3">
            <HelpCircle className="size-5 text-primary-600 shrink-0 mt-0.5" />
            <span>
              Need a bespoke supplier verification screening for an upcoming tender? Our compliance team provides custom due-diligence protocols.
            </span>
          </div>
        </div>

        <Accordion items={buyerFaqs} defaultOpenIndex={0} />
      </Container>
    </section>
  );
}

/* ==========================================================================
   8. BUYER BOTTOM CTA + VENDOR DUAL PERSONA BANNER
   ========================================================================== */
export function BuyerBottomCta() {
  return (
    <section className="section-pad bg-gradient-to-b from-transparent to-slate-50/80">
      <Container>
        {/* Main Buyer Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 p-8 sm:p-14 text-white shadow-2xl shadow-primary-950/20">
          <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-primary-400/20 blur-3xl" />
          <div className="pointer-events-none absolute right-1/3 -bottom-20 size-64 rounded-full bg-cyan-300/15 blur-2xl" />

          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-400/30 bg-primary-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary-300">
              <ShieldCheck className="size-3.5" />
              Derisk Your Commercial Supply Chain
            </span>

            <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Start finding and comparing verified suppliers today.
            </h2>

            <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-200">
              Access complete statutory dossiers, view transparent 0–100 Trust Scores, and build partnerships on verifiable evidence.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                size="lg"
                variant="primary"
                href="/demo/directory"
                className="bg-white !text-primary-900 hover:bg-primary-50 border-white shadow-lg"
                rightIcon={<ArrowRight className="size-4" />}
              >
                Browse Directory
              </Button>
              <Button
                size="lg"
                variant="dark"
                href="/demo/compare"
                className="border-primary-400/30 bg-primary-950/40 hover:bg-primary-900/50 text-white"
                rightIcon={<Scale className="size-4" />}
              >
                Launch Comparison Tool
              </Button>
            </div>
          </div>
        </div>

        {/* Secondary Vendor Switcher Strip */}
        <div className="mt-6 rounded-2xl border border-primary-200 bg-primary-50/80 p-5 sm:p-6 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="size-10 rounded-xl bg-primary-600 text-white grid place-items-center shrink-0">
              <Building2 className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Are you a manufacturer, supplier, or enterprise vendor?
              </h4>
              <p className="text-xs text-slate-600">
                Showcase your audited compliance to active corporate buyers and win higher-value contracts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button href="/demo/vendor" variant="secondary" size="sm">
              Visit For Vendors Hub
            </Button>
            <Button href="/demo/register" variant="primary" size="sm" rightIcon={<ArrowRight className="size-3.5" />}>
              Get Verified
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
