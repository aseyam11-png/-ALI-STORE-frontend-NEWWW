import Link from "next/link";
import { ArrowLeft, Flame } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";

export default function DealsPage() {
  return (
    <AppShell>
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-info-surface text-brand">
            <Flame className="h-6 w-6" />
          </div>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.18em] text-brand">
            Promotions
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
            العروض الحالية
          </h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            لا توجد حاليًا حملة عروض موصلة بمصدر الترويج المركزي. لن نعرض خصومات
            تجريبية أو أسعارًا مصطنعة بدلًا من بيانات حقيقية.
          </p>
          <Link
            href="/shop/products"
            className="mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-6 text-sm font-black text-white"
          >
            تصفح المنتجات
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      </main>
    </AppShell>
  );
}
