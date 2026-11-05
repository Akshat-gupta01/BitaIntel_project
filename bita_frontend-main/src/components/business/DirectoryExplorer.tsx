'use client';

import { useMemo, useState, useDeferredValue } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowRight,
  LayoutGrid,
  List,
  CheckCircle2,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { businesses, industries, type Business } from '@/data';
import { BusinessCard } from './BusinessCard';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { ScoreRing } from './ScoreRing';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { Checkbox } from '@/components/ui/Checkbox';
import { Slider } from '@/components/ui/Slider';
import { toast } from 'sonner';

const industryPastelPill: Record<string, { active: string; inactive: string }> = {
  'All industries': {
    active: 'bg-slate-900 !text-white text-white border-slate-900 shadow-2xs',
    inactive: 'bg-white/80 text-slate-700 border-slate-200/90 hover:bg-white hover:border-slate-300',
  },
  Manufacturing: {
    active: 'bg-primary-700 text-white border-primary-700 shadow-2xs',
    inactive: 'bg-primary-50/70 text-primary-800 border-primary-200/70 hover:bg-primary-100/70',
  },
  'IT Services': {
    active: 'bg-primary-600 text-white border-primary-600 shadow-2xs',
    inactive: 'bg-primary-50/70 text-primary-700 border-primary-200/70 hover:bg-primary-100/70',
  },
  'Healthcare & Pharma': {
    active: 'bg-primary-600 text-white border-primary-600 shadow-2xs',
    inactive: 'bg-primary-50/70 text-primary-700 border-primary-200/70 hover:bg-primary-100/70',
  },
  'Renewable Energy': {
    active: 'bg-amber-600 text-white border-amber-600 shadow-2xs',
    inactive: 'bg-amber-50/70 text-amber-800 border-amber-200/70 hover:bg-amber-100/70',
  },
  Packaging: {
    active: 'bg-orange-600 text-white border-orange-600 shadow-2xs',
    inactive: 'bg-orange-50/70 text-orange-800 border-orange-200/70 hover:bg-orange-100/70',
  },
  Textile: {
    active: 'bg-rose-600 text-white border-rose-600 shadow-2xs',
    inactive: 'bg-rose-50/70 text-rose-700 border-rose-200/70 hover:bg-rose-100/70',
  },
  'Wholesale & Logistics': {
    active: 'bg-purple-600 text-white border-purple-600 shadow-2xs',
    inactive: 'bg-purple-50/70 text-purple-700 border-purple-200/70 hover:bg-purple-100/70',
  },
  Agriculture: {
    active: 'bg-lime-700 text-white border-lime-700 shadow-2xs',
    inactive: 'bg-lime-50/70 text-lime-800 border-lime-200/70 hover:bg-lime-100/70',
  },
};

export function DirectoryExplorer() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [industry, setIndustry] = useState('All industries');
  const [level, setLevel] = useState('Any level');
  const [minimumScore, setMinimumScore] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [sortBy, setSortBy] = useState<'score' | 'tenure' | 'name'>('score');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [previewBusiness, setPreviewBusiness] = useState<Business | null>(null);

  const results = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const filtered = businesses.filter((b) => {
      const matchesQuery =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.legalName.toLowerCase().includes(q) ||
        b.industry.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q) ||
        b.gstin.toLowerCase().includes(q) ||
        b.products.some((p) => p.toLowerCase().includes(q));

      const matchesIndustry =
        industry === 'All industries' || b.industry === industry;
      const matchesLevel =
        level === 'Any level' || b.level >= Number(level);
      const matchesScore = b.score >= minimumScore;
      const matchesVerified = !verifiedOnly || b.verified;

      return matchesQuery && matchesIndustry && matchesLevel && matchesScore && matchesVerified;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'tenure') return b.age - a.age;
      return a.name.localeCompare(b.name);
    });
  }, [deferredQuery, industry, level, minimumScore, verifiedOnly, sortBy]);

  function toggleCompare(id: string) {
    const business = businesses.find((b) => b.id === id);
    const bName = business ? business.name : id;

    setCompareIds((prev) => {
      if (prev.includes(id)) {
        toast.info(`Removed ${bName} from comparison`);
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 4) {
        toast.error('Maximum Comparison Limit', {
          description: 'You can compare up to 4 enterprises simultaneously.',
        });
        return prev;
      }
      toast.success(`Added ${bName} to comparison (${prev.length + 1}/4)`);
      return [...prev, id];
    });
  }

  function resetFilters() {
    setQuery('');
    setIndustry('All industries');
    setLevel('Any level');
    setMinimumScore(0);
    setVerifiedOnly(false);
    setSortBy('score');
  }

  return (
    <div className="space-y-6">
      {/* Search & Quick Controls Console */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 sm:p-6 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(14,14,26,0.03)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by company name, GSTIN, CIN, industry, product, or city..."
              className="w-full min-h-12 rounded-full border border-slate-200/90 bg-white px-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-primary-600 focus:ring-4 focus:ring-primary-100"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? 'dark' : 'secondary'}
              size="md"
              onClick={() => setShowFilters(!showFilters)}
              icon={<SlidersHorizontal className="size-4" />}
            >
              <span>Filters</span>
              {(industry !== 'All industries' || level !== 'Any level' || minimumScore > 0) && (
                <span className="size-2 rounded-full bg-primary-600" />
              )}
            </Button>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center rounded-full border border-slate-200/80 bg-white p-1 shadow-2xs">
              <button
                type="button"
                aria-label="Grid view"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'rounded-full p-2 transition-colors',
                  viewMode === 'grid'
                    ? 'bg-slate-900 !text-white text-white'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Table view"
                onClick={() => setViewMode('table')}
                className={cn(
                  'rounded-full p-2 transition-colors',
                  viewMode === 'table'
                    ? 'bg-slate-900 !text-white text-white'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                <List className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Industry Pills Bar with colorful pastel styling */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {industries.map((ind) => {
            const isSelected = industry === ind;
            const pillStyle =
              industryPastelPill[ind] || {
                active: 'bg-primary-600 text-white border-primary-600',
                inactive: 'bg-slate-100 text-slate-700 border-slate-200',
              };

            return (
              <button
                key={ind}
                type="button"
                onClick={() => setIndustry(ind)}
                className={cn(
                  'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 border',
                  isSelected ? pillStyle.active : pillStyle.inactive
                )}
              >
                {ind}
              </button>
            );
          })}
        </div>

        {/* Expandable Advanced Filter Drawer */}
        {showFilters && (
          <div className="mt-5 border-t border-slate-100 pt-5 grid gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-200">
            {/* Verification Tier */}
            <div>
              <CustomDropdown
                label="Verification Tier"
                value={level}
                onChange={(val) => setLevel(val)}
                options={[
                  { value: 'Any level', label: 'Any Tier Level' },
                  { value: '4', label: 'Tier 4 (Comprehensive Audit)' },
                  { value: '3', label: 'Tier 3 (Document Verified)' },
                  { value: '2', label: 'Tier 2 (Statutory Cross-Check)' },
                  { value: '1', label: 'Tier 1 (Identity Basic)' },
                ]}
                buttonClassName="min-h-11 rounded-xl py-2.5"
              />
            </div>

            {/* Minimum Score Slider */}
            <div>
              <Slider
                label="Minimum Score"
                min={0}
                max={95}
                step={5}
                value={minimumScore}
                onChange={(val) => setMinimumScore(val)}
                valueFormatter={(val) => `${val} / 100`}
              />
            </div>

            {/* Sort By */}
            <div>
              <CustomDropdown
                label="Sort Results"
                value={sortBy}
                onChange={(val) => setSortBy(val as 'score' | 'tenure' | 'name')}
                options={[
                  { value: 'score', label: 'Highest Trust Score' },
                  { value: 'tenure', label: 'Established Tenure (Longest)' },
                  { value: 'name', label: 'Company Name (A–Z)' },
                ]}
                buttonClassName="min-h-11 rounded-xl py-2.5"
              />
            </div>

            {/* Checkbox */}
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                Verification Status
              </p>
              <div className="flex min-h-11 items-center rounded-xl border border-slate-200/90 bg-white px-3 shadow-2xs">
                <Checkbox
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  label="Active Verified Status Only"
                />
              </div>
            </div>
          </div>
        )}

        {/* Counter & Clear Filter strip */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <strong className="font-bold text-slate-900">{results.length}</strong>{' '}
            verified enterprise entities
          </div>
          {(query || industry !== 'All industries' || level !== 'Any level' || minimumScore > 0) && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 font-semibold text-primary-700 hover:text-primary-900 transition-colors"
            >
              <X className="size-3.5" />
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Floating Comparison Dock (If any selected) */}
      {compareIds.length > 0 && (
        <div className="sticky top-24 z-30 rounded-3xl border border-primary-500/30 bg-gradient-to-r from-primary-950 to-primary-800 p-4 text-white shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-primary-600 text-white font-bold text-sm">
              {compareIds.length}
            </div>
            <div>
              <p className="text-sm font-bold">
                {compareIds.length} of 4 businesses selected for side-by-side comparison
              </p>
              <p className="text-xs text-slate-300">
                Compare compliance matrices, scoring breakdowns, and statutory audit status.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setCompareIds([])}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800"
            >
              Clear
            </button>
            <Button
              size="sm"
              variant="primary"
              href={`/demo/compare?ids=${compareIds.join(',')}`}
              disabled={compareIds.length < 2}
              rightIcon={<ArrowRight className="size-3.5" />}
              className="w-full xs:w-auto justify-center"
            >
              Compare Dossiers ({compareIds.length})
            </Button>
          </div>
        </div>
      )}

      {/* Grid or Table Results */}
      {viewMode === 'grid' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 min-h-[500px]">
          {results.map((b) => (
            <div key={b.id} className="relative">
              <BusinessCard
                business={b}
                onCompareToggle={toggleCompare}
                isCompared={compareIds.includes(b.id)}
              />
              <button
                type="button"
                onClick={() => setPreviewBusiness(b)}
                aria-label={`Quick look ${b.name}`}
                className="absolute right-6 top-6 size-7 rounded-full bg-slate-100 text-slate-500 hover:bg-primary-50 hover:text-primary-700 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ExternalLink className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-2xs">
          <table className="w-full min-w-[760px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider">
                <th className="p-4">Entity Name & Identifiers</th>
                <th className="p-4">Industry Sector</th>
                <th className="p-4">Location</th>
                <th className="p-4">Tier & Score</th>
                <th className="p-4">Tenure</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-primary-50/40 transition-colors cursor-pointer"
                  onClick={() => setPreviewBusiness(b)}
                >
                  <td className="p-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-900 !text-white text-white font-bold text-xs">
                        {b.initials}
                      </div>
                      <div>
                        <span className="font-bold hover:text-primary-700">
                          {b.name}
                        </span>
                        <p className="text-[10px] text-slate-400 font-normal">
                          GSTIN: {b.gstin}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-medium">
                      {b.industry}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3 text-slate-400" />
                      {b.location}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <ScoreRing score={b.score} size={36} strokeWidth={3} />
                      <Badge kind="level">Tier {b.level}</Badge>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 font-medium">{b.age} yrs</td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2.5">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompare(b.id);
                        }}
                        className="flex items-center cursor-pointer select-none rounded-lg border border-slate-200/90 bg-white/90 px-2.5 py-1 shadow-2xs hover:border-slate-300 hover:bg-slate-50 transition-all"
                        title={compareIds.includes(b.id) ? 'Remove from comparison' : 'Select to compare'}
                      >
                        <Checkbox
                          checked={compareIds.includes(b.id)}
                          onChange={() => toggleCompare(b.id)}
                          label={<span className="text-[11px] font-semibold text-slate-700">Compare</span>}
                        />
                      </div>
                      <Link
                        href={`/demo/business/${b.id}`}
                        className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold !text-white text-white hover:bg-slate-800"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {results.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-12 text-center backdrop-blur-xl">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <Search className="size-7" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900">
            No matching verified businesses
          </h3>
          <p className="mt-1.5 text-sm text-slate-500 max-w-md mx-auto">
            We couldn&apos;t find any businesses matching your search criteria. Try modifying your search term or lowering your minimum score threshold.
          </p>
          <Button variant="secondary" className="mt-6" onClick={resetFilters}>
            Reset All Filters
          </Button>
        </div>
      )}

      {/* Quick Preview Sheet Drawer */}
      <Sheet
        open={!!previewBusiness}
        onClose={() => setPreviewBusiness(null)}
        title={previewBusiness?.name || 'Business Preview'}
        description={`Legal Entity: ${previewBusiness?.legalName || ''}`}
      >
        {previewBusiness && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-primary-50/60 border border-primary-200/80">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-2xl bg-primary-700 text-white font-black text-sm shadow-xs">
                  {previewBusiness.initials}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{previewBusiness.name}</h4>
                  <p className="text-xs text-slate-500">{previewBusiness.location}</p>
                </div>
              </div>
              <ScoreRing score={previewBusiness.score} size={48} showGrade />
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge kind="verified">Verified Profile</Badge>
              <Badge kind="level">Tier {previewBusiness.level}</Badge>
              <Badge kind="primary">{previewBusiness.industry}</Badge>
              {previewBusiness.isoCertified && (
                <Badge kind="lavender">{previewBusiness.isoCertified}</Badge>
              )}
            </div>

            {/* Summary */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Executive Overview
              </h5>
              <p className="text-xs leading-relaxed text-slate-600">
                {previewBusiness.summary}
              </p>
            </div>

            {/* Checkpoints */}
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Statutory Checkpoints
              </h5>
              {[
                ['GSTIN Identifier', previewBusiness.gstin, true],
                ['Corporate CIN', previewBusiness.cin, true],
                ['Identity Verification', previewBusiness.identity, true],
                ['Document Dossier', previewBusiness.documents, true],
                ['Audited Tenure', `${previewBusiness.age} Years Operational`, true],
                ['Annual Turnover Band', previewBusiness.turnover, true],
              ].map(([lbl, val, checked]) => (
                <div key={lbl as string} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                  <span className="text-slate-500">{lbl as string}</span>
                  <span className="font-semibold text-slate-900 inline-flex items-center gap-1">
                    {checked && <CheckCircle2 className="size-3 text-primary-600" />}
                    {val as string}
                  </span>
                </div>
              ))}
            </div>

            {/* Capabilities */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Capabilities & Products
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {previewBusiness.products.map((p) => (
                  <span
                    key={p}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 border-t border-slate-100 flex gap-2">
              <Button
                href={`/demo/business/${previewBusiness.id}`}
                variant="primary"
                className="flex-1 justify-center"
                rightIcon={<ArrowRight className="size-4" />}
              >
                Open Full Dossier
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  toggleCompare(previewBusiness.id);
                  setPreviewBusiness(null);
                }}
              >
                {compareIds.includes(previewBusiness.id) ? 'Remove Compare' : 'Add to Compare'}
              </Button>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
