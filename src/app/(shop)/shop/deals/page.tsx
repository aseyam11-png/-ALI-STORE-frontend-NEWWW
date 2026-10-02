import Link from "next/link";
import { ArrowRight, Flame, ShieldCheck, Tag, Timer } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { ProductCard } from "@/components/commerce/ProductCard";
import { getProducts } from "@/features/products/services/product.service";
import { mapProductSummaryToCard } from "@/features/products/services/product-card.mapper";

export default async function DealsPage() {
  let dealProducts = [];
  try {
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
      sort: "discount_desc",
      page: 1,
      pageSize: 48,
    });
    dealProducts = response.items
      .filter((product) => (product.discountPercentage ?? 0) > 0)
      .map(mapProductSummaryToCard);
  } catch {
    dealProducts = [];
  }

  return (
    <AppShell>
      <main className="min-h-screen bg-background">
        <section className="border-b border-neutral-200 bg-surface">
          <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="rounded-[28px] bg-primary-50 p-7 ring-1 ring-primary-100 sm:p-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-danger-surface px-3 py-1.5 text-[11px] font-black text-danger-600"><Flame className="h-3.5 w-3.5" /> عروض حقيقية</div>
              <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-foreground sm:text-5xl">عروض الكتالوج الحالية</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">المنتجات المعروضة هنا تأتي من الكتالوج المنشور والمخزون الفعلي في الخادم.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-xl bg-surface px-4 py-2.5 text-xs font-bold shadow-sm ring-1 ring-neutral-200"><Tag className="h-4 w-4 text-brand" /> خصومات من الخادم</span>
                <span className="inline-flex items-center gap-2 rounded-xl bg-surface px-4 py-2.5 text-xs font-bold shadow-sm ring-1 ring-neutral-200"><ShieldCheck className="h-4 w-4 text-success" /> التحقق قبل الطلب</span>
                <span className="inline-flex items-center gap-2 rounded-xl bg-surface px-4 py-2.5 text-xs font-bold shadow-sm ring-1 ring-neutral-200"><Timer className="h-4 w-4 text-warning" /> التوفر قابل للتغير</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-brand">Active offers</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">العروض المتاحة</h2>
              <p className="mt-2 text-sm text-muted-foreground">لا يوجد عدّاد وهمي؛ السعر والمخزون يعاد التحقق منهما عند الشراء.</p>
            </div>
            <span className="rounded-full border border-neutral-200 bg-surface px-4 py-2 text-xs font-black text-muted-foreground">{dealProducts.length} عروض</span>
          </div>

          {dealProducts.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {dealProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-surface p-14 text-center">
              <Flame className="mx-auto h-10 w-10 text-neutral-300" />
              <h3 className="mt-4 text-lg font-black">لا توجد عروض منشورة حاليًا</h3>
              <Link href="/shop/products" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-black text-white">تصفح المنتجات <ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link>
            </div>
          )}
        </section>
      </main>
    </AppShell>
  );
}
