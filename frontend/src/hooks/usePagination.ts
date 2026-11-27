'use client';

import { useMemo, useState } from 'react';

export function usePagination<T>(items: T[], defaultPageSize = 10) {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.max(1, Math.min(page, totalPages));

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  const handlePageChange = (nextPage: number) => {
    setPage(Math.max(1, Math.min(nextPage, totalPages)));
  };

  const handlePageSizeChange = (nextSize: number) => {
    setPageSize(nextSize);
    setPage(1);
  };

  const resetPage = () => setPage(1);

  return {
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems,
    setPage: handlePageChange,
    setPageSize: handlePageSizeChange,
    resetPage,
  };
}
