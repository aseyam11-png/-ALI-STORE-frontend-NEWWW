"use client";

import { Camera, SearchCheck } from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { VisualSearch } from "@/components/search/VisualSearch";

export default function AdminProductVisualSearchPage() {
  return (
    <AdminShell>
      <main className="min-h-screen bg-background">
        <AdminPageHeader
          eyebrow="الكتالوج"
          title="البحث عن المنتج بالصورة"
          description="استخدم البحث البصري للوصول إلى المنتج المطابق أو الأقرب، ثم افتح إدارة المنتج لتعديل بياناته أو متابعة مصدره."
          actions={
            <div className="inline-flex items-center gap-2 rounded-xl bg-info-surface px-3 py-2 text-xs font-black text-brand">
              <Camera className="h-4 w-4" aria-hidden="true" />
              Product discovery
            </div>
          }
        />

        <div className="container-shell py-8">
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <section className="rounded-2xl border border-neutral-200 bg-surface p-5 shadow-raised md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-brand">
                  <SearchCheck className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-foreground">مسار الإدارة</h2>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    ارفع صورة المنتج للعثور على أقرب نتائج من الكتالوج، ثم افتح نتيجة محددة للانتقال مباشرة إلى صفحة إدارة المنتج.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <VisualSearch
            resultContext="admin"
            resultActionLabel="إدارة المنتج"
            resultHref={(productId) => `/admin/products/${encodeURIComponent(productId)}`}
          />
        </div>
      </main>
    </AdminShell>
  );
}
