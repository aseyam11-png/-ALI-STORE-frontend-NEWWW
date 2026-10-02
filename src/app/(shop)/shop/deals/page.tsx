"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Flame,
  ShieldCheck,
  Tag,
  Timer,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { ProductCard } from "@/components/commerce/ProductCard";
import { getProducts } from "@/features/products/services/product.service";
import { mapProductSummaryToCard } from "@/features/products/services/product-card.mapper";
import type { ProductCardModel } from "@/features/products/types/product-card.types";

export default function DealsPage() {
  const [products, setProducts] = useState<ProductCardModel[]>([]);
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
      pageSize: 100,
    })
      .then((response) => {
        if (cancelled) return;
        setProducts(
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
          setProducts([]);
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

  const countLabel = useMemo(
    () => (loading ? "..." : String(products.length)),
    [loading, products.length],
  );

  return (
    <AppShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-stretch">
              <div className="rounded-[28px] bg-gradient-to-br from-amber-50 via-white to-blue-50 p-7 ring-1 ring-slate-200 sm:p-10">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-[11px] font-black text-amber-700">
                  <Flame className="h-3.5 w-3.5" />
                  Active offers
                </div>
                <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-[#0F172A] sm:text-5xl">
                  Live deals from the catalog.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                  Discounts shown here are calculated by the backend from the
                  product reference price and current selling price.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
                    <Tag className="h-4 w-4 text-amber-600" />
                    Transparent pricing
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Store catalog
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
                    <Timer className="h-4 w-4 text-blue-600" />
                    Availability checked
                  </span>
                </div>
              </div>

              <div className="rounded-[28px] bg-[#0F2747] p-7 text-white sm:p-8">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-200">
                  Current deals
                </p>
                <p className="mt-4 text-3xl font-black">
                  {countLabel}
                </p>
                <p className="mt-1 text-sm text-blue-100/70">
                  active discounted products
                </p>
                <Link
                  href="/shop/products"
                  className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-black text-[#0F2747] transition hover:bg-slate-100"
                >
                  Browse all products
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">
                Backend-priced offers
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#0F172A]">
                Current deals
              </h2>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-500">
              {countLabel} active
            </span>
          </div>

          {loading ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square animate-pulse rounded-2xl bg-neutral-100"
                />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center">
              <Flame className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="mt-4 text-lg font-black text-slate-800">
                No active deals
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                New offers will appear here when an admin configures a
                reference price above the current selling price.
              </p>
            </div>
          )}
        </section>
      </main>
    </AppShell>
  );
}
