'use client';

import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (nextPage: number) => void;
  onPageSizeChange?: (nextSize: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  itemLabel = 'records',
  className,
}: PaginationProps) {
  const normalizedTotalPages = Math.max(1, totalPages);
  const safePage = Math.max(1, Math.min(page, normalizedTotalPages));
  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, safePage * pageSize);

  const pageNumbers = useMemo<(number | 'ellipsis')[]>(() => {
    if (normalizedTotalPages <= 7) {
      return Array.from({ length: normalizedTotalPages }, (_, i) => i + 1);
    }

    const items: (number | 'ellipsis')[] = [1];
    if (safePage > 3) items.push('ellipsis');

    const start = Math.max(2, safePage - 1);
    const end = Math.min(normalizedTotalPages - 1, safePage + 1);
    for (let i = start; i <= end; i += 1) {
      items.push(i);
    }

    if (safePage < normalizedTotalPages - 2) items.push('ellipsis');
    items.push(normalizedTotalPages);
    return items;
  }, [normalizedTotalPages, safePage]);

  if (totalItems === 0) return null;

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs shadow-2xs',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3 text-slate-500">
        <span>
          Showing{' '}
          <strong className="font-bold text-slate-900">
            {startItem}–{endItem}
          </strong>{' '}
          of <strong className="font-bold text-slate-900">{totalItems}</strong> {itemLabel}
        </span>

        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} / page
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1">
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-45 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ChevronLeft className="size-3.5" />
          <span>Prev</span>
        </button>

        {pageNumbers.map((item, idx) =>
          item === 'ellipsis' ? (
            <span key={`e-${idx}`} className="px-1.5 text-slate-400 select-none">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === safePage ? 'page' : undefined}
              className={cn(
                'grid size-8 place-items-center rounded-lg font-bold transition-colors cursor-pointer',
                item === safePage
                  ? 'bg-primary-600 text-white shadow-2xs'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              )}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          disabled={safePage >= normalizedTotalPages}
          onClick={() => onPageChange(safePage + 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-45 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </nav>
  );
}
