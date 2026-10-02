"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Flame, ShieldCheck, Tag, Timer } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { B2CProductCard } from "@/components/commerce/B2CProductCard";
import { getProducts } from "@/features/products/services/product.service";
import { normalizeB2CProduct } from "@/features/products/services/b2c-product.mapper";

export default function DealsPage() {
  const query = useQuery({
    queryKey: ["catalog", "deals"],
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
        pageSize: 48,
      }),
    staleTime: 30_000,
  });

  const deals = (query.data?.items ?? []).map(normalizeB2CProduct);

  return (
    <AppShell>
      <main className="min-h-screen bg-background">
        <section className="border-b border-neutral-200 bg-surface">
          <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-stretch">
              <div className="rounded-[28px] bg-gradient-to-br from-amber-50 via-white to-blue-50 p-7 ring-1 ring-neutral-200 sm:p-10">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-[11px] font-black text-amber-700">
                  <Flame className="h-3.5 w-3.5" />
                  العروض الحالية
                </div>

                <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-foreground sm:text-5xl">
                  أسعار مخفّضة من الكتالوج المنشور.
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  الخصم والتوفر والسعر الأساسي تأتي من Backend، ويُعاد التحقق من السعر عند إنشاء الطلب.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-neutral-700 shadow-sm ring-1 ring-neutral-200">
                    <Tag className="h-4 w-4 text-amber-600" />
                    خصومات واضحة
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-neutral-700 shadow-sm ring-1 ring-neutral-200">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    كتالوج منشور
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-neutral-700 shadow-sm ring-1 ring-neutral-200">
                    <Timer className="h-4 w-4 text-blue-600" />
                    توفر حي
                  </span>
                </div>
              </div>

              <div className="rounded-[28px] bg-[#0F2747] p-7 text-white sm:p-8">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-200">
                  Deals
                </p>
                <p className="mt-4 text-3xl font-black">
                  {query.isPending ? "…" : deals.length}
                </p>
                <p className="mt-1 text-sm text-blue-100/70">عروض متاحة حاليًا</p>

                <div className="mt-7 space-y-4 border-t border-white/10 pt-6">
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-100/60">المصدر</span>
                    <span className="font-bold">Backend</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-100/60">التوفر</span>
                    <span className="font-bold">Live inventory</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-100/60">السعر</span>
                    <span className="font-bold">Server checked</span>
                  </div>
                </div>

                <Link
                  href="/shop/products"
                  className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-black text-[#0F2747] transition hover:bg-slate-100"
                >
                  جميع المنتجات
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand">
                Active offers
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">أفضل العروض</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                لا توجد هنا منتجات wholesale أو بيانات تجريبية منفصلة عن الكتالوج.
              </p>
            </div>
            <span className="rounded-full border border-neutral-200 bg-surface px-4 py-2 text-xs font-black text-muted-foreground">
              {query.isPending ? "…" : deals.length} عرض
            </span>
          </div>

          {query.isPending ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="aspect-[0.86] animate-pulse rounded-2xl bg-neutral-100" />
              ))}
            </div>
          ) : query.isError ? (
            <div className="mt-8 rounded-2xl border border-danger-100 bg-danger-surface p-10 text-center">
              <h3 className="text-lg font-black text-danger-700">تعذر تحميل العروض</h3>
              <button
                type="button"
                onClick={() => void query.refetch()}
                className="mt-5 rounded-xl bg-brand px-5 py-2.5 text-xs font-black text-white"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : deals.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {deals.map((product) => (
                <B2CProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-surface p-14 text-center">
              <Flame className="mx-auto h-10 w-10 text-neutral-300" />
              <h3 className="mt-4 text-lg font-black text-foreground">لا توجد عروض نشطة</h3>
              <p className="mt-2 text-sm text-muted-foreground">ستظهر العروض المنشورة هنا تلقائيًا.</p>
            </div>
          )}
        </section>
      </main>
    </AppShell>
  );
}
