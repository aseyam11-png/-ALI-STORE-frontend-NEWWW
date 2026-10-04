import Link from "next/link";
import {
  ArrowLeft,
  Camera,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { VisualSearch } from "@/components/search/VisualSearch";

export default function VisualSearchPage() {
  return (
    <AppShell>
      <main className="min-h-screen bg-background">

        <section className="border-b border-neutral-200 bg-surface">

          <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">

            <Link
              href="/shop/products"
              className="inline-flex items-center gap-2 text-xs font-black text-brand"
            >
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />المنتجات</Link>

            <div className="mt-5 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-brand">
                <Camera className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-brand">
                  Visual discovery
                </p>

                <h1 className="mt-1 text-3xl font-black tracking-tight text-brand-ink">ابحث عن المنتجات بالصورة</h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
                  Upload a photo and discover visually similar products in the
                  catalog.
                </p>
              </div>

            </div>

          </div>

        </section>

        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
          <VisualSearch />
        </div>

      </main>
    </AppShell>
  );
}