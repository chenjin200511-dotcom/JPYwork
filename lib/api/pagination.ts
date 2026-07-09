// Purpose: Normalizes pagination metadata for list API responses.
export function getPagination(page: number, pageSize: number) {
  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

export function paginationMeta(input: {
  page: number;
  pageSize: number;
  total: number;
}) {
  return {
    page: input.page,
    pageSize: input.pageSize,
    total: input.total,
    totalPages: Math.max(1, Math.ceil(input.total / input.pageSize)),
  };
}

export function containsSearch(search: string | undefined) {
  if (!search) {
    return undefined;
  }

  return {
    contains: search,
  };
}
