import Link from "next/link";
import { ArrowRight, Flame, ShieldCheck, Tag, Timer } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { ProductCard } from "@/components/commerce/ProductCard";
import {
  getActivePromotions,
  type ActivePromotion,
} from "@/features/promotions/services/promotion-api.service";
import { mapPromotionToProductCard } from "@/features/promotions/services/promotion.mapper";

export default async function DealsPage() {
  let promotions: ActivePromotion[] = [];
  try {
    promotions = await getActivePromotions(false);
  } catch {
    promotions = [];
  }

  const products = promotions
    .filter((promotion) => promotion.active && promotion.availability !== "OUT_OF_STOCK")
    .map(mapPromotionToProductCard);

  return (
    <AppShell>
      <main className="min-h-screen bg-background">
        <section className="border-b border-neutral-200 bg-surface">
          <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-stretch">
              <div className="rounded-[28px] bg-gradient-to-br from-primary-50 via-surface to-neutral-50 p-7 ring-1 ring-neutral-200 sm:p-10">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1.5 text-[11px] font-bold text-primary-700">
                  <Flame className="h-3.5 w-3.5" />
                  العروض
                </div>
                <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-brand-ink sm:text-5xl">
                  العروض النشطة من كتالوج ALI STORE
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base">
                  كل خصم ظاهر هنا مرتبط بسجل ترويجي فعّال في الخادم، ويستخدم السعر نفسه عند بناء السلة والطلب.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-xl bg-surface px-4 py-2.5 text-xs font-bold text-neutral-700 shadow-sm ring-1 ring-neutral-200">
                    <Tag className="h-4 w-4 text-brand" />
                    خصومات موثقة
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-xl bg-surface px-4 py-2.5 text-xs font-bold text-neutral-700 shadow-sm ring-1 ring-neutral-200">
                    <ShieldCheck className="h-4 w-4 text-success-600" />
                    من مصدر الخادم
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-xl bg-surface px-4 py-2.5 text-xs font-bold text-neutral-700 shadow-sm ring-1 ring-neutral-200">
                    <Timer className="h-4 w-4 text-brand" />
                    تحقق زمني
                  </span>
                </div>
              </div>

              <div className="rounded-[28px] bg-brand-ink p-7 text-white sm:p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-200">العروض النشطة</p>
                <p className="mt-4 text-3xl font-bold">{products.length}</p>
                <p className="mt-1 text-sm text-primary-100/70">
                  عروض مرتبطة بمنتجات فعلية
                </p>
                <Link
                  href="/shop/products"
                  className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-surface text-sm font-bold text-brand-ink transition hover:bg-neutral-100"
                >
                  تصفّح المنتجات
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-surface p-12 text-center text-sm text-neutral-500">
              لا توجد عروض فعّالة مرتبطة بمنتجات متاحة حاليًا.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id + "-" + product.name} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
    </AppShell>
  );
}
