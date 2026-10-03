"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { Tabs } from "@/components/ui/tabs";
import {
  getProducts,
} from "@/features/products/services/product.service";
import {
  mapProductSummaryToCard,
} from "@/features/products/services/product-card.mapper";

export function ProductDiscovery() {
  const query = useQuery({
    queryKey: ["home-catalog", "products"],
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
        discountOnly: false,
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

  const products = (query.data?.items ?? []).map(mapProductSummaryToCard);

  const renderGrid = () => {
    if (query.isPending) {
      return (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[0.86] animate-pulse rounded-2xl bg-neutral-100"
            />
          ))}
        </div>
      );
    }

    if (query.isError) {
      return (
        <div className="rounded-2xl border border-danger-100 bg-danger-surface p-8 text-center">
          <p className="text-sm font-bold text-danger-700">
            تعذر تحميل المنتجات من الخادم.
          </p>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="mt-4 rounded-xl bg-brand px-5 py-2.5 text-xs font-black text-white"
          >
            إعادة المحاولة
          </button>
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-surface p-10 text-center">
          <p className="text-sm font-bold text-neutral-700">
            لا توجد منتجات متاحة حاليًا.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:gap-6 xl:grid-cols-4">
        {products.map((product) => (
          <mapProductSummaryToCard />
        ))}
      </div>
    );
  };

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="flex items-end justify-between gap-5">
          <h2 className="text-h2 font-bold tracking-tight text-foreground lg:text-h1">
            اكتشف المنتجات
          </h2>
          {query.isFetching && !query.isPending && (
            <span
              className="text-xs font-bold text-neutral-400"
              aria-live="polite"
            >
              تحديث…
            </span>
          )}
        </div>

        <Tabs
          className="mt-8"
          ariaLabel="اكتشف المنتجات"
          items={[
            {
              id: "catalog",
              label: "المنتجات",
              content: renderGrid(),
            },
          ]}
        />
      </div>
    </section>
  );
}
