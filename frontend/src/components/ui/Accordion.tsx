'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AccordionItem {
  q: string;
  a: string;
}

export interface AccordionProps {
  items: AccordionItem[];
  defaultOpenIndex?: number;
  className?: string;
}

export function Accordion({
  items,
  defaultOpenIndex = 0,
  className,
}: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  function toggle(idx: number) {
    setOpenIndex((current) => (current === idx ? null : idx));
  }

  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className={cn(
              'overflow-hidden rounded-2xl border transition-all duration-200',
              isOpen
                ? 'border-primary-200/80 bg-white/90 shadow-md backdrop-blur-xl'
                : 'border-slate-200/80 bg-white/70 backdrop-blur-md hover:bg-white/85 hover:border-slate-300'
            )}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => toggle(idx)}
              className="flex w-full items-center justify-between gap-4 p-5 text-left text-sm font-bold tracking-tight text-slate-900 transition-colors sm:text-base"
            >
              <span>{item.q}</span>
              <span
                className={cn(
                  'grid size-8 shrink-0 place-items-center rounded-full border border-slate-200/80 bg-white transition-transform duration-200',
                  isOpen && 'rotate-180 border-primary-200 bg-primary-50 text-primary-700'
                )}
              >
                <ChevronDown className="size-4" />
              </span>
            </button>
            {isOpen && (
              <div className="border-t border-slate-100 px-5 pb-5 pt-3">
                <p className="text-sm leading-relaxed text-slate-600">
                  {item.a}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
