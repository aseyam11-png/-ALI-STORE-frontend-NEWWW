"use client";

import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  FolderTree,
} from "lucide-react";
import { useState } from "react";

import type {
  CategoryNode,
} from "@/features/catalog/types/category.types";

interface CategoryTreeProps {
  categories: CategoryNode[];
  level?: number;
}

export function CategoryTree({
  categories,
  level = 0,
}: CategoryTreeProps) {
  const [
    expanded,
    setExpanded,
  ] = useState<
    Record<string, boolean>
  >({});

  if (!categories.length) {
    return null;
  }

  return (
    <div
      className={
        level === 0
          ? "space-y-1"
          : "mt-1 space-y-1 border-s border-slate-100 ps-3"
      }
    >
      {categories.map(
        (category) => {
          const hasChildren =
            category.children
              .length > 0;

          const isExpanded =
            expanded[
              category.slug
            ] ?? level === 0;

          return (
            <div
              key={
                category.slug
              }
            >
              <div className="flex items-center gap-1">

                <Link
                  href={`/shop/categories/${encodeURIComponent(category.slug)}`}
                  className="min-w-0 flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-info-surface hover:text-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
                >
                  <span className="flex items-center gap-2">
                    {level === 0 && (
                      <FolderTree className="h-4 w-4 shrink-0 text-brand" />
                    )}

                    <span className="truncate">
                      {category.name}
                    </span>
                  </span>
                </Link>

                {hasChildren && (
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded(
                        (current) => ({
                          ...current,
                          [category.slug]:
                            !isExpanded,
                        }),
                      )
                    }
                    aria-label={
                      isExpanded
                        ? `طي ${category.name}`
                        : `فتح ${category.name}`
                    }
                    aria-expanded={
                      isExpanded
                    }
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                    )}
                  </button>
                )}

              </div>

              {hasChildren &&
                isExpanded && (
                  <CategoryTree
                    categories={
                      category.children
                    }
                    level={
                      level + 1
                    }
                  />
                )}

            </div>
          );
        },
      )}
    </div>
  );
}