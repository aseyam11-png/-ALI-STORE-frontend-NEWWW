"use client";

import { Loader2 } from "lucide-react";

interface LoadMoreProductsProps {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}

export function LoadMoreProducts({
  hasMore,
  loading,
  onLoadMore,
}: LoadMoreProductsProps) {
  if (!hasMore) {
    return (
      <p className="mt-8 text-center text-xs font-semibold text-slate-400">
        You have reached the end of the catalog.
      </p>
    );
  }

  return (
    <div className="mt-8 flex justify-center">
      <button
        type="button"
        onClick={onLoadMore}
        disabled={loading}
        className="inline-flex h-11 min-w-40 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}

        {loading
          ? "Loading..."
          : "Load more products"}
      </button>
    </div>
  );
}