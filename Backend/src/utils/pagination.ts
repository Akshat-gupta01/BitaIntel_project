import type { Request } from "express";

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
  search: string;
  hasExplicitPagination: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function parsePagination(
  req: Request,
  defaults: { limit?: number; maxLimit?: number } = {}
): PaginationParams {
  const maxLimit = defaults.maxLimit ?? 200;
  const defaultLimit = defaults.limit ?? 10;

  const hasExplicitPagination =
    req.query.page !== undefined || req.query.limit !== undefined;

  const rawPage = Number(req.query.page);
  const rawLimit = Number(req.query.limit);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(maxLimit, Math.floor(rawLimit))
      : defaultLimit;

  const offset = (page - 1) * limit;
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

  return { page, limit, offset, search, hasExplicitPagination };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const safeLimit = Math.max(1, limit);
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  return {
    page,
    limit: safeLimit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
