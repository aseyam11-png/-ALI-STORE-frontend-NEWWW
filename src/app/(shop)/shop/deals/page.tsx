import Link from "next/link";
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

export default async function DealsPage() {
  const response = await getProducts({
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
    pageSize: 100,
  });

  const dealProducts = response.items
    .filter((product) => (product.discountPercentage ?? 0) > 0)
    .map(mapProductSummaryToCard);

  return (
    <AppShell>
      <main className="min-h-screen bg-[#F8FAFC]">

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">

            <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-stretch">

              <div className="rounded-[28px] bg-gradient-to-br from-amber-50 via-white to-blue-50 p-7 ring-1 ring-slate-200 sm:p-10">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-[11px] font-black text-amber-700">
                  <Flame className="h-3.5 w-3.5" />
                  Limited-time offers
                </div>

                <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-[#0F172A] sm:text-5xl">
                  Deals built for smarter buying.
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                  Compare discounted prices and shipping details before you
                  check out.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
                    <Tag className="h-4 w-4 text-amber-600" />
                    Transparent discounts
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Quality checked
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
                    <Timer className="h-4 w-4 text-blue-600" />
                    Limited availability
                  </span>
                </div>
              </div>

              <div className="rounded-[28px] bg-[#0F2747] p-7 text-white sm:p-8">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-200">
                  Today&apos;s deals
                </p>

                <p className="mt-4 text-3xl font-black">
                  {dealProducts.length}
                </p>

                <p className="mt-1 text-sm text-blue-100/70">
                  active discounted products
                </p>

                <div className="mt-7 space-y-4 border-t border-white/10 pt-6">
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-100/60">Quality</span>
                    <span className="font-bold">Checked</span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-blue-100/60">Shipping</span>
                    <span className="font-bold">Tracked</span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-blue-100/60">Pricing</span>
                    <span className="font-bold">Discounted</span>
                  </div>
                </div>

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
                Active offers
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#0F172A]">
                Best deals for you
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Compare discounted products with the same trusted ProductCard
                experience used throughout the store.
              </p>
            </div>

            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-500">
              {dealProducts.length} active deals
            </span>
          </div>

          {dealProducts.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {dealProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center">
                <Flame className="mx-auto h-10 w-10 text-slate-300" />
                <h3 className="mt-4 text-lg font-black text-slate-800">
                  No active deals
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  New offers will appear here when an active discount is published.
                </p>
              </div>
            </div>
          )}

        </section>
      </main>
    </AppShell>
  );
}