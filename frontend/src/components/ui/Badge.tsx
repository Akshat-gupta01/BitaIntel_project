import React from 'react';
import { CheckCircle2, ShieldCheck, Sparkles, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BadgeKind =
  | 'primary'
  | 'verified'
  | 'level'
  | 'neutral'
  | 'glass'
  | 'warning'
  | 'info'
  | 'dark'
  | 'success'
  | 'lavender'
  | 'mint'
  | 'sage'
  | 'peach'
  | 'sky'
  | 'rose'
  | 'amber'
  | 'violet';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  kind?: BadgeKind;
  children: React.ReactNode;
  icon?: boolean;
}

export function Badge({
  children,
  kind = 'neutral',
  icon = true,
  className,
  ...props
}: BadgeProps) {
  const kindClasses: Record<BadgeKind, string> = {
    primary:
      'bg-primary-50/95 text-primary-800 border-primary-200/80 shadow-2xs',
    verified:
      'bg-primary-50/95 text-primary-800 border-primary-200/80 shadow-2xs',
    success:
      'bg-emerald-50/95 text-emerald-800 border-emerald-200/80 shadow-2xs',
    level:
      'bg-primary-50/95 text-primary-800 border-primary-200/80 shadow-2xs',
    glass:
      'bg-white/80 backdrop-blur-md text-slate-800 border-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)]',
    neutral:
      'bg-slate-100/90 text-slate-700 border-slate-200/70',
    warning:
      'bg-amber-50/95 text-amber-800 border-amber-200/80',
    info:
      'bg-primary-50/95 text-primary-800 border-primary-200/80',
    dark:
      'bg-slate-900 !text-white text-white border-slate-800 shadow-2xs',
    lavender:
      'bg-purple-50/90 text-purple-700 border-purple-200/80',
    mint:
      'bg-emerald-50/90 text-emerald-700 border-emerald-200/80',
    sage:
      'bg-indigo-50/70 text-indigo-800 border-indigo-200/70',
    peach:
      'bg-orange-50/90 text-orange-800 border-orange-200/80',
    sky:
      'bg-primary-50/90 text-primary-700 border-primary-200/80',
    rose:
      'bg-rose-50/90 text-rose-700 border-rose-200/80',
    amber:
      'bg-amber-50/90 text-amber-800 border-amber-200/80',
    violet:
      'bg-purple-50/90 text-purple-700 border-purple-200/80',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide border transition-all duration-200 select-none whitespace-nowrap',
        kindClasses[kind],
        className
      )}
      {...props}
    >
      {icon && (kind === 'verified' || kind === 'level' || kind === 'primary') && (
        <CheckCircle2 className="size-3.5 shrink-0 text-primary-600" />
      )}
      {icon && (kind === 'mint' || kind === 'success') && (
        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
      )}
      {icon && kind === 'sage' && (
        <ShieldCheck className="size-3.5 shrink-0 text-indigo-600" />
      )}
      {icon && (kind === 'lavender' || kind === 'violet') && (
        <ShieldCheck className="size-3.5 shrink-0 text-purple-600" />
      )}
      {icon && (kind === 'warning' || kind === 'amber') && (
        <AlertCircle className="size-3.5 shrink-0 text-amber-600" />
      )}
      {icon && (kind === 'info' || kind === 'sky') && (
        <Info className="size-3.5 shrink-0 text-primary-600" />
      )}
      {icon && kind === 'glass' && (
        <Sparkles className="size-3 shrink-0 text-primary-500" />
      )}
      <span>{children}</span>
    </span>
  );
}
