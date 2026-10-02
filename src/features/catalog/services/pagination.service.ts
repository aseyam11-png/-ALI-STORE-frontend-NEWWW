import type {
  PaginatedResult,
} from "../types/pagination.types";

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  const safePage = Math.max(
    1,
    Math.floor(page),
  );

  const safePageSize = Math.max(
    1,
    Math.floor(pageSize),
  );

  const totalItems =
    items.length;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalItems /
        safePageSize,
    ),
  );

  const currentPage =
    Math.min(
      safePage,
      totalPages,
    );

  const start =
    (currentPage - 1) *
    safePageSize;

  return {
    items: items.slice(
      start,
      start + safePageSize,
    ),

    pagination: {
      page: currentPage,
      pageSize: safePageSize,
      totalItems,
      totalPages,
    },
  };
}