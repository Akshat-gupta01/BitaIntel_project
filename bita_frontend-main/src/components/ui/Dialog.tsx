'use client';

import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
  size = 'md',
}: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Apple-style frosted backdrop */}
      <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-md transition-opacity duration-300 animate-in fade-in" />

      {/* Modal Card */}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
        className={cn(
          'relative z-10 w-full max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl border border-white/80 bg-white/95 p-4 sm:p-8 shadow-2xl backdrop-blur-2xl transition-all duration-300 animate-in zoom-in-95',
          sizeClasses[size],
          className
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            {title && (
              <h2
                id="dialog-title"
                className="text-xl font-bold tracking-tight text-slate-900"
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-6">{children}</div>
      </section>
    </div>
  );
}
