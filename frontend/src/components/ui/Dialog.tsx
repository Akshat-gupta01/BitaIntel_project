'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
  bodyClassName,
  size = 'md',
}: DialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!open || !mounted) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-5xl',
  };

  return createPortal(
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
          'relative z-10 w-full max-h-[92vh] overflow-hidden flex flex-col rounded-2xl sm:rounded-3xl border border-white/80 bg-white/95 shadow-2xl backdrop-blur-2xl transition-all duration-300 animate-in zoom-in-95',
          sizeClasses[size],
          className
        )}
      >
        {(title || description) ? (
          <div className="flex items-start justify-between gap-4 p-4 sm:p-8 pb-3 sm:pb-4 border-b border-slate-100/80 bg-white/50 backdrop-blur-sm shrink-0">
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
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0"
            >
              <X className="size-5" />
            </button>
          </div>
        ) : (
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-full p-2 text-slate-400 bg-white/80 hover:bg-slate-100 hover:text-slate-700 transition-colors shadow-2xs border border-slate-200/60"
            >
              <X className="size-5" />
            </button>
          </div>
        )}

        <div className={cn("overflow-y-auto custom-scrollbar p-4 sm:p-8 flex-1", (title || description) && "pt-4 sm:pt-6", bodyClassName)}>
          {children}
        </div>
      </section>
    </div>,
    document.body
  );
}
