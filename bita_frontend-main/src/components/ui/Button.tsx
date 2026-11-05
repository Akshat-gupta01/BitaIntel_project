import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'dark' | 'glass' | 'ghost' | 'outline' | 'pastel';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
  isLoading?: boolean;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  href?: string;
  children: ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
  pill = true,
  isLoading = false,
  icon,
  rightIcon,
  href,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]';

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      'bg-primary-600 !text-white text-white hover:bg-primary-700 hover:!text-white shadow-[0_4px_18px_var(--primary-glow)] hover:shadow-[0_6px_24px_var(--primary-glow)] border border-transparent',
    secondary:
      'border border-slate-200/90 bg-white/90 text-slate-800 backdrop-blur-md hover:bg-white hover:border-slate-300 hover:text-slate-950 shadow-2xs',
    dark:
      'bg-primary-950 !text-white text-white hover:bg-primary-900 hover:!text-white shadow-[0_4px_18px_rgba(0,0,0,0.2)] border border-primary-950',
    glass:
      'bg-white/80 backdrop-blur-xl border border-white/90 text-slate-900 hover:bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]',
    pastel:
      'bg-primary-50 text-primary-800 hover:bg-primary-100/90 border border-primary-200/80 shadow-2xs',
    ghost:
      'text-slate-700 hover:bg-primary-50/70 hover:text-primary-900 border border-transparent',
    outline:
      'border border-primary-300/80 bg-transparent text-primary-800 hover:bg-primary-50/60 hover:border-primary-400',
  };

  const sizeClasses: Record<ButtonSize, string> = {
    xs: 'min-h-7 px-2.5 text-xs',
    sm: 'min-h-9 px-3.5 text-xs font-semibold',
    md: 'min-h-11 px-5 text-sm font-semibold',
    lg: 'min-h-12 px-6 text-base font-semibold',
  };

  const roundedClasses = pill ? 'rounded-full' : 'rounded-2xl';

  const isLightTextVariant = variant === 'dark' || variant === 'primary';

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    roundedClasses,
    className
  );

  const content = (
    <>
      {isLoading ? (
        <Loader2 className={cn("size-4 animate-spin shrink-0", isLightTextVariant && "!text-white text-white")} />
      ) : (
        icon && <span className={cn("shrink-0", isLightTextVariant && "!text-white text-white")}>{icon}</span>
      )}
      <span className={cn(isLightTextVariant && "!text-white text-white")}>{children}</span>
      {!isLoading && rightIcon && (
        <span className={cn("shrink-0", isLightTextVariant && "!text-white text-white")}>{rightIcon}</span>
      )}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes} data-variant={variant}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} data-variant={variant} disabled={disabled || isLoading} {...props}>
      {content}
    </button>
  );
}
