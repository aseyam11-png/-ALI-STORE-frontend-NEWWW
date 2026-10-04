"use client";

import Link from "next/link";
import type { Route } from "next";
import { useQueries } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { B2CProductCard } from "@/components/commerce/B2CProductCard";
import { normalizeB2CProduct } from "@/features/products/services/b2c-product.mapper";
import { getProducts } from "@/features/products/services/product.service";

// Homepage category shelves are catalog-driven; an empty backend category stays hidden.

interface HomeCategorySectionProps {
  title: string;
  description: string;
  categoryIds: string[];
  href: string;
}

const EMPTY_FILTERS = {
  search: "",
  subcategoryId: undefined,
  brand: undefined,
  supplierId: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  minRating: undefined,
  verifiedSupplierOnly: false,
  discountOnly: false,
  inStockOnly: true,
  featuredOnly: false,
  bestsellerOnly: false,
  newArrivalOnly: false,
  sort: "relevance" as const,
  page: 1,
  pageSize: 4,
};

export function HomeCategorySection({
  title,
  description,
  categoryIds,
  href,
}: HomeCategorySectionProps) {
  const queries = useQueries({
    queries: categoryIds.map((categoryId) => ({
      queryKey: ["home-category", categoryId],
      queryFn: () =>
        getProducts({
          ...EMPTY_FILTERS,
          categoryId,
        }),
      staleTime: 60_000,
    })),
  });

  if (categoryIds.length === 0) return null;

  const products = Array.from(
    new Map(
      queries
        .flatMap((query) => query.data?.items ?? [])
        .map((product) => [product.id, normalizeB2CProduct(product)]),
    ).values(),
  ).slice(0, 4);

  const loading = queries.some((query) => query.isPending);
  const failedEveryRequest =
    queries.length > 0 &&
    queries.every((query) => query.isError);

  if (!loading && (failedEveryRequest || products.length === 0)) {
    return null;
  }

  return (
    <section className="bg-background" aria-labelledby={`${title}-home-section`}>
      <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        <div className="flex items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-label font-bold uppercase tracking-[0.14em] text-brand">
              اختيارات ALI STORE
            </p>
            <h2
              id={`${title}-home-section`}
              className="mt-2 text-h2 font-bold tracking-tight text-foreground lg:text-h1"
            >
              {title}
            </h2>
            <p className="mt-2 text-body-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>

          <Link
            href={href as Route}
            className="hidden shrink-0 items-center gap-2 rounded-xl border border-neutral-200 bg-surface px-4 py-2.5 text-body-sm font-bold text-neutral-700 transition hover:border-primary-200 hover:bg-info-surface hover:text-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 sm:inline-flex"
          >
            شاهد الكل
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-7">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6" aria-busy="true">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[0.86] animate-pulse rounded-2xl bg-neutral-100"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
              {products.map((product) => (
                <B2CProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        <Link
          href={href as Route}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-surface px-4 py-3 text-body-sm font-bold text-neutral-700 sm:hidden"
        >
          شاهد كل منتجات {title}
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
