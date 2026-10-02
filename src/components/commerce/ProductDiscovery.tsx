"use client";

import { useEffect, useMemo, useState } from "react";

import { getProducts } from "@/features/products/services/product.service";
import { mapProductSummaryToCard } from "@/features/products/services/product-card.mapper";

import { Tabs } from "@/components/ui/tabs";
import { ProductCard } from "./ProductCard";

export function ProductDiscovery() {
  const [products, setProducts] = useState<
    ReturnType<typeof mapProductSummaryToCard>[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

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
      discountOnly: false,
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
        setProducts(response.items.map(mapProductSummaryToCard));
        setFailed(false);
      })
      .catch(() => {
        if (cancelled) return;
        setProducts([]);
        setFailed(true);
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

  const bestSellers = useMemo(
    () =>
      [...products].sort(
        (a, b) =>
          b.rating - a.rating ||
          b.reviewCount - a.reviewCount,
      ),
    [products],
  );

  const renderGrid = (
    items: typeof products,
  ) => (
    <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:gap-6 xl:grid-cols-4">
      {items.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <h2 className="text-h2 font-bold tracking-tight text-foreground lg:text-h1">
          اكتشف المنتجات
        </h2>

        {loading ? (
          <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square animate-pulse rounded-2xl bg-neutral-100"
              />
            ))}
          </div>
        ) : failed ? (
          <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-surface p-10 text-center">
            <p className="text-sm font-bold text-text-muted">
              تعذر تحميل المنتجات حاليًا.
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-surface p-10 text-center">
            <p className="text-sm font-bold text-text-muted">
              لا توجد منتجات منشورة حاليًا.
            </p>
          </div>
        ) : (
          <Tabs
            className="mt-8"
            ariaLabel="اكتشف المنتجات"
            items={[
              {
                id: "featured",
                label: "المميزة",
                content: renderGrid(products),
              },
              {
                id: "best-sellers",
                label: "الأكثر مبيعًا",
                content: renderGrid(bestSellers),
              },
            ]}
          />
        )}
      </div>
    </section>
  );
}
