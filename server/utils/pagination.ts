export interface ParsedPagination {
  page: number;
  limit: number;
  skip: number;
}

export const parsePagination = (query: Record<string, unknown>): ParsedPagination => {
  const rawPage = Array.isArray(query.page) ? query.page[0] : query.page;
  const rawLimit = Array.isArray(query.limit) ? query.limit[0] : query.limit;
  const page = Math.max(1, parseInt(String(rawPage ?? '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(rawLimit ?? '10'), 10) || 10));

  return { page, limit, skip: (page - 1) * limit };
};

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const buildPaginationMeta = (page: number, limit: number, total: number): PaginationMeta => {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return { page, limit, total, totalPages };
};
