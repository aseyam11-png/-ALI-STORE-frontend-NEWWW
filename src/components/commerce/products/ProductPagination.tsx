"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ProductPaginationProps {
  page: number;
  totalPages: number;
  onChange: (
    page: number,
  ) => void;
}

export function ProductPagination({
  page,
  totalPages,
  onChange,
}: ProductPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages: number[] = [];

  const start = Math.max(
    1,
    page - 2,
  );

  const end = Math.min(
    totalPages,
    page + 2,
  );

  for (
    let current = start;
    current <= end;
    current++
  ) {
    pages.push(current);
  }

  return (
    <nav
      aria-label="Product pagination"
      className="mt-8 flex items-center justify-center gap-2"
    >
      <button
        type="button"
        onClick={() =>
          onChange(page - 1)
        }
        disabled={page <= 1}
        aria-label="Previous page"
        className="flex h-10 items-center justify-center gap-1 rounded-xl border border-neutral-200 bg-surface px-3 text-xs font-bold text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
      >
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
        Previous
      </button>

      {start > 1 && (
        <>
          <button
            type="button"
            onClick={() =>
              onChange(1)
            }
            className="h-10 min-w-10 rounded-xl border border-neutral-200 bg-surface px-3 text-xs font-bold text-neutral-600 hover:bg-neutral-50"
          >
            1
          </button>

          {start > 2 && (
            <span className="px-1 text-neutral-400">
              …
            </span>
          )}
        </>
      )}

      {pages.map(
        (pageNumber) => (
          <button
            key={
              pageNumber
            }
            type="button"
            onClick={() =>
              onChange(
                pageNumber,
              )
            }
            aria-current={
              pageNumber ===
              page
                ? "page"
                : undefined
            }
            className={`h-10 min-w-10 rounded-xl px-3 text-xs font-black transition ${
              pageNumber ===
              page
                ? "bg-brand text-white"
                : "border border-neutral-200 bg-surface text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {pageNumber}
          </button>
        ),
      )}

      {end < totalPages && (
        <>
          {end <
            totalPages - 1 && (
            <span className="px-1 text-neutral-400">
              …
            </span>
          )}

          <button
            type="button"
            onClick={() =>
              onChange(
                totalPages,
              )
            }
            className="h-10 min-w-10 rounded-xl border border-neutral-200 bg-surface px-3 text-xs font-bold text-neutral-600 hover:bg-neutral-50"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        type="button"
        onClick={() =>
          onChange(page + 1)
        }
        disabled={
          page >= totalPages
        }
        aria-label="Next page"
        className="flex h-10 items-center justify-center gap-1 rounded-xl border border-neutral-200 bg-surface px-3 text-xs font-bold text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
      >
        Next
        <ChevronRight className="h-4 w-4 rtl:rotate-180" />
      </button>
    </nav>
  );
}
