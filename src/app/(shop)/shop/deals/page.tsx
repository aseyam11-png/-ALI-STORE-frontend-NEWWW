import Link from "next/link";
import { ArrowRight, Flame, ShieldCheck, Tag, Timer } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
export default function DealsPage() {
  return (
    <AppShell>
      <main className="min-h-screen bg-background">
        <section className="border-b border-neutral-200 bg-surface">
          <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-stretch">
              <div className="rounded-[28px] bg-gradient-to-br from-primary-50 via-white to-neutral-50 p-7 ring-1 ring-neutral-200 sm:p-10">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1.5 text-[11px] font-black text-primary-700">
                  <Flame className="h-3.5 w-3.5" />
                  العروض
                </div>
                <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-brand-ink sm:text-5xl">
                  العروض المؤكدة من كتالوج ALI STORE
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base">
                  لا نعرض خصومات أو أسعارًا ترويجية غير موجودة في مصدر الأسعار
                  الحقيقي. ستظهر العروض هنا عند توفر بيانات Promotions من الخادم.
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
                    بدون عروض وهمية
                  </span>
                </div>
              </div>
              <div className="rounded-[28px] bg-brand-ink p-7 text-white sm:p-8">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary-200">
                  Active deals
                </p>
                <p className="mt-4 text-3xl font-black">0</p>
                <p className="mt-1 text-sm text-primary-100/70">
                  لا توجد عروض ترويجية مؤكدة في Backend حاليًا
                </p>
                <Link
                  href="/shop/products"
                  className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-surface text-sm font-black text-brand-ink transition hover:bg-neutral-100"
                >
                  تصفّح المنتجات
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}