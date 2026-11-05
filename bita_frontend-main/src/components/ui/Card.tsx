import React from 'react';
import { cn } from '@/lib/utils';

export type CardVariant = 'default' | 'glass' | 'bento' | 'dark' | 'interactive';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: React.ReactNode;
}

export function Card({
  children,
  className,
  variant = 'default',
  ...props
}: CardProps) {
  const variantStyles: Record<CardVariant, string> = {
    default:
      'bg-white border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-3xl',
    glass:
      'bg-white/75 backdrop-blur-xl border border-white/70 shadow-[0_8px_32px_0_rgba(15,23,42,0.04)] rounded-3xl',
    bento:
      'bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.04)] rounded-3xl p-6 sm:p-8',
    dark:
      'bg-slate-950 text-white border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.35)] rounded-3xl',
    interactive:
      'bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_-6px_var(--primary-glow)] hover:border-primary-300/70 hover:-translate-y-1 transition-all duration-300 rounded-3xl',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden transition-all duration-200',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col space-y-1.5 pb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'text-lg font-bold tracking-tight text-slate-900',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-slate-500 leading-relaxed', className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('relative', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center pt-4 border-t border-slate-100', className)}
      {...props}
    >
      {children}
    </div>
  );
}
