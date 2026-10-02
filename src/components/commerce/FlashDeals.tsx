"use client";

import Link from "next/link";
import { ArrowLeft, Flame } from "lucide-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { getProducts } from "@/features/products/services/product.service";
import { normalizeB2CProduct } from "@/features/products/services/b2c-product.mapper";
import { B2CProductCard } from "./B2CProductCard";

export function FlashDeals() {
  const query = useQuery({
    queryKey: ["home-catalog", "deals"],
    queryFn: () =>
      getProducts({
        search: "",
        categoryId: undefined,
        subcategoryId: undefined,
        brand: undefined,
        supplierId: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        minRating: undefined,
        verifiedSupplierOnly: false,
        discountOnly: true,
        inStockOnly: true,
        featuredOnly: false,
        bestsellerOnly: false,
        newArrivalOnly: false,
        sort: "relevance",
        page: 1,
        pageSize: 8,
      }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  const deals = (query.data?.items ?? []).map(normalizeB2CProduct);

  if (!query.isPending && !query.isError && deals.length === 0) {
    return null;
  }

  return (
    <section className="bg-ink-900">
      <div className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-sm bg-discount px-3 py-1.5 text-label font-medium text-white">
              <Flame className="h-3.5 w-3.5" />
              عروض محدودة
            </div>
            <h2 className="mt-4 text-h2 font-bold tracking-tight text-white lg:text-h1">
              عروض اليوم
            </h2>
          </div>

          <Link
            href="/shop/deals"
            className="inline-flex items-center gap-2 text-body-sm font-medium text-white transition-colors duration-200 ease-brand hover:text-primary-300"
          >
            تصفّح جميع العروض
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>

        <div className="mt-10">
          {query.isPending ? (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="aspect-[0.86] animate-pulse rounded-2xl bg-white/10" />
              ))}
            </div>
          ) : query.isError ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/70">
              تعذر تحميل العروض الآن.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
              {deals.map((product) => (
                <B2CProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
