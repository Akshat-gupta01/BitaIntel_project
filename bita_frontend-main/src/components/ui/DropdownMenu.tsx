'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DropdownMenuItem {
  label: string;
  onSelect: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
}

export interface DropdownMenuProps {
  label: ReactNode;
  items: DropdownMenuItem[];
  align?: 'left' | 'right';
  className?: string;
}

export function DropdownMenu({
  label,
  items,
  align = 'right',
  className,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200/90 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 backdrop-blur-md shadow-xs transition-all hover:bg-white hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]',
          className
        )}
      >
        <span>{label}</span>
        <ChevronDown
          className={cn(
            'size-3.5 text-slate-400 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute z-40 mt-2 min-w-52 rounded-2xl border border-white/80 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl transition-all animate-in fade-in zoom-in-95',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item, idx) => (
            <button
              key={idx}
              role="menuitem"
              type="button"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-40',
                item.danger
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
