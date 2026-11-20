import Link from 'next/link';
import { ArrowUpRight, MapPin, Award, CheckCircle2 } from 'lucide-react';
import type { Business } from '@/data';
import { Badge, type BadgeKind } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { ScoreRing } from './ScoreRing';
import { cn } from '@/lib/utils';

export interface BusinessCardProps {
  business: Business;
  onCompareToggle?: (id: string) => void;
  isCompared?: boolean;
  className?: string;
}

const industryThemes: Record<
  string,
  {
    avatarGradient: string;
    badgeKind: BadgeKind;
    accentBg: string;
    accentText: string;
    borderHover: string;
  }
> = {
  Manufacturing: {
    avatarGradient: 'from-primary-700 to-slate-900',
    badgeKind: 'primary',
    accentBg: 'bg-primary-50/70',
    accentText: 'text-primary-800',
    borderHover: 'hover:border-primary-300',
  },
  'IT Services': {
    avatarGradient: 'from-primary-500 to-slate-900',
    badgeKind: 'primary',
    accentBg: 'bg-primary-50/70',
    accentText: 'text-primary-700',
    borderHover: 'hover:border-primary-300',
  },
  'Healthcare & Pharma': {
    avatarGradient: 'from-primary-600 to-indigo-900',
    badgeKind: 'primary',
    accentBg: 'bg-primary-50/70',
    accentText: 'text-primary-700',
    borderHover: 'hover:border-primary-300',
  },
  'Renewable Energy': {
    avatarGradient: 'from-amber-500 to-orange-800',
    badgeKind: 'amber',
    accentBg: 'bg-amber-50/70',
    accentText: 'text-amber-800',
    borderHover: 'hover:border-amber-300',
  },
  Packaging: {
    avatarGradient: 'from-orange-500 to-rose-800',
    badgeKind: 'peach',
    accentBg: 'bg-orange-50/70',
    accentText: 'text-orange-800',
    borderHover: 'hover:border-orange-300',
  },
  Textile: {
    avatarGradient: 'from-rose-500 to-purple-800',
    badgeKind: 'rose',
    accentBg: 'bg-rose-50/70',
    accentText: 'text-rose-700',
    borderHover: 'hover:border-rose-300',
  },
  'Wholesale & Logistics': {
    avatarGradient: 'from-purple-600 to-slate-900',
    badgeKind: 'violet',
    accentBg: 'bg-purple-50/70',
    accentText: 'text-purple-700',
    borderHover: 'hover:border-purple-300',
  },
  Agriculture: {
    avatarGradient: 'from-lime-600 to-slate-900',
    badgeKind: 'mint',
    accentBg: 'bg-lime-50/70',
    accentText: 'text-lime-800',
    borderHover: 'hover:border-lime-300',
  },
};

export function BusinessCard({
  business: b,
  onCompareToggle,
  isCompared = false,
  className,
}: BusinessCardProps) {
  const theme = industryThemes[b.industry] || {
    avatarGradient: 'from-slate-800 to-slate-950',
    badgeKind: 'neutral' as BadgeKind,
    accentBg: 'bg-slate-50',
    accentText: 'text-slate-700',
    borderHover: 'hover:border-slate-300',
  };

  return (
    <div
      className={cn(
        'group relative flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white/85 p-6 backdrop-blur-xl shadow-[0_4px_24px_-4px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_var(--primary-glow)] hover:bg-white',
        theme.borderHover,
        isCompared && 'ring-2 ring-primary-600 border-primary-600/70',
        className
      )}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <div
            className={cn(
              'grid size-12 shrink-0 place-items-center rounded-2xl text-sm font-black text-white shadow-xs group-hover:scale-105 transition-transform bg-gradient-to-br',
              theme.avatarGradient
            )}
          >
            {b.initials}
          </div>
          <div className="min-w-0">
            <Link
              href={`/demo/business/${b.id}`}
              className="text-base font-bold tracking-tight text-slate-900 hover:text-primary-700 transition-colors line-clamp-1"
            >
              {b.name}
            </Link>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="size-3 text-slate-400 shrink-0" />
              <span className="truncate">{b.location}</span>
            </p>
          </div>
        </div>

        {/* Score Ring with Grade */}
        <div className="shrink-0 flex flex-col items-center">
          <ScoreRing score={b.score} size={48} strokeWidth={4} showGrade />
          <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
            Trust Score
          </span>
        </div>
      </div>

      {/* Badges strip with pastel variety */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <Badge kind="verified">Verified Entity</Badge>
        <Badge kind="level">Tier {b.level}</Badge>
        <Badge kind={theme.badgeKind} icon={false}>
          {b.industry}
        </Badge>
      </div>

      {/* Summary */}
      <p className="mt-3.5 text-xs leading-relaxed text-slate-600 line-clamp-2">
        {b.summary}
      </p>

      {/* ISO / Certification callout */}
      {b.isoCertified && (
        <div
          className={cn(
            'mt-3 flex items-center gap-1.5 text-[11px] font-semibold rounded-xl px-2.5 py-1 border border-slate-200/60',
            theme.accentBg,
            theme.accentText
          )}
        >
          <Award className="size-3.5 shrink-0" />
          <span className="truncate">{b.isoCertified}</span>
        </div>
      )}

      {/* Capability tags */}
      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {b.products.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-100/70 px-2.5 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200/50"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Bottom Metrics Bar */}
      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div>
          <span className="text-[10px] block text-slate-400 uppercase tracking-wider">Tenure</span>
          <span className="font-semibold text-slate-800">{b.age} Years</span>
        </div>
        <div>
          <span className="text-[10px] block text-slate-400 uppercase tracking-wider">Turnover</span>
          <span className="font-semibold text-slate-800">{b.turnover}</span>
        </div>
        <div>
          <span className="text-[10px] block text-slate-400 uppercase tracking-wider">Audit</span>
          <span className="font-semibold text-primary-600 inline-flex items-center gap-0.5">
            <CheckCircle2 className="size-2.5" />
            Active
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <Button
          href={`/demo/business/${b.id}`}
          variant="dark"
          size="sm"
          className="flex-1 !text-white"
          rightIcon={<ArrowUpRight className="size-3.5 !text-white text-white" />}
        >
          View Full Dossier
        </Button>
        {onCompareToggle && (
          <div
            onClick={(e) => {
              e.preventDefault();
              onCompareToggle(b.id);
            }}
            className="flex items-center shrink-0 cursor-pointer select-none rounded-xl border border-slate-200/90 bg-white/90 px-3 py-1.5 shadow-2xs hover:border-slate-300 hover:bg-slate-50 transition-all"
            title={isCompared ? 'Remove from comparison' : 'Select to compare'}
          >
            <Checkbox
              checked={isCompared}
              onChange={() => onCompareToggle(b.id)}
              label={<span className="text-xs font-semibold text-slate-700">Compare</span>}
            />
          </div>
        )}
      </div>
    </div>
  );
}
