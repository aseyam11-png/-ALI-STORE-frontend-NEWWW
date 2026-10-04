"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";

import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft } from "lucide-react";

import { B2CProductCard } from "@/components/commerce/B2CProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { normalizeB2CProduct } from "@/features/products/services/b2c-product.mapper";
import {
  getProducts,
} from "@/features/products/services/product.service";

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

  const products = (query.data?.items ?? []).map(normalizeB2CProduct);

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
          <B2CProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  };

  return (
    <section className="bg-background">
      <div className="container-shell py-14 sm:py-16 lg:py-20">
        <SectionHeading
          eyebrow="مختارات من الكتالوج"
          title="اكتشف المنتجات"
          description="منتجات متاحة من الكتالوج الحالي مع معلومات السعر والتوفر كما يعرضها النظام."
          action={
            <div className="flex items-center gap-2">
              {query.isFetching && !query.isPending ? (
                <span
                  className="hidden text-caption font-medium text-muted-foreground sm:block"
                  aria-live="polite"
                >
                  تحديث…
                </span>
              ) : null}
              <Link
                href={"/shop/products" as Route}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-surface px-4 text-body-sm font-medium text-neutral-700 transition-all duration-200 ease-brand hover:border-primary-200 hover:bg-primary-50 hover:text-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
              >
                عرض الكل
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </Link>
            </div>
          }
        />

        <div className="mt-8">
          {renderGrid()}
        </div>
      </div>
    </section>
  );
}
