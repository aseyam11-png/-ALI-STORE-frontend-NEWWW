"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Flame } from "lucide-react";

import { ProductCard } from "./ProductCard";
import { getProducts } from "@/features/products/services/product.service";
import { mapProductSummaryToCard } from "@/features/products/services/product-card.mapper";
import type { ProductCardModel } from "@/features/products/types/product-card.types";

export function FlashDeals() {
  const [deals, setDeals] = useState<ProductCardModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void getProducts({
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
      inStockOnly: false,
      featuredOnly: false,
      bestsellerOnly: false,
      newArrivalOnly: false,
      sort: "relevance",
      page: 1,
      pageSize: 8,
    })
      .then((response) => {
        if (cancelled) return;
        setDeals(
          response.items
            .filter((product) => (product.discountPercentage ?? 0) > 0)
            .sort(
              (a, b) =>
                (b.discountPercentage ?? 0) -
                (a.discountPercentage ?? 0),
            )
            .map(mapProductSummaryToCard),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setDeals([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && deals.length === 0) {
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

        <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square animate-pulse rounded-2xl bg-white/10"
                />
              ))
            : deals.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
        </div>
      </div>
    </section>
  );
}
