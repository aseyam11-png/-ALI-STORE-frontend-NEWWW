"use client";

import Link from "next/link";
import { Camera } from "lucide-react";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import { Edit3, Package, RefreshCcw, Search } from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { getAdminProducts, type AdminProduct } from "@/features/admin/products/services/admin-product-api.service";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setProducts((await getAdminProducts(0, 100)).content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل المنتجات.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    getAdminProducts(0, 100)
      .then((page) => {
        if (active) setProducts(page.content);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "تعذر تحميل المنتجات.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return products;
    return products.filter((product) =>
      (product.name + " " + product.sku + " " + (product.supplierSku ?? ""))
        .toLowerCase()
        .includes(needle),
    );
  }, [products, search]);

  const liveCount = products.filter((product) =>
    ["ACTIVE", "PUBLISHED"].includes(product.status),
  ).length;
  const supplierLinkedCount = products.filter((product) => Boolean(product.supplierName)).length;

  return (
    <AdminShell>
      <main className="min-h-screen bg-background">
        <AdminPageHeader
          eyebrow="الكتالوج"
          title="المنتجات"
          description="كتالوج B2C حي يعتمد على مصدر المورد. البحث هنا محلي فوق النتائج التي يعيدها الـBackend، دون تغيير منطق الكتالوج."
          actions={
            <>
              <Link
                href="/admin/products/visual-search"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 text-body-sm font-medium text-brand transition hover:bg-primary-100"
              >
                <Camera className="h-4 w-4" aria-hidden="true" />
                بحث بالصورة
              </Link>
              <button
                type="button"
                onClick={() => void refresh()}
                disabled={loading}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-surface px-4 text-body-sm font-medium text-neutral-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
                تحديث
              </button>
            </>
          }
        />

        <div className="container-shell py-8">
          {error && (
            <div role="alert" className="mb-5 rounded-xl border border-danger-100 bg-danger-surface p-4 text-body-sm font-medium text-danger-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <AdminMetricCard icon={Package} label="إجمالي المنتجات" value={String(products.length)} detail="نتائج مملوءة من الخادم" />
            <AdminMetricCard icon={Package} label="منتجات نشطة" value={String(liveCount)} tone="success" detail="حسب status القادم من الـBackend" />
            <AdminMetricCard icon={Search} label="مرتبطة بمورد" value={String(supplierLinkedCount)} tone="neutral" detail="لديها supplierName فعلي" />
          </div>

          <section className="mt-7">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-h3 font-bold text-foreground">كتالوج المنتجات</h2>
                <p className="mt-1 text-body-sm text-muted-foreground">
                  {filtered.length} نتيجة{search ? " مطابقة للبحث" : ""}
                </p>
              </div>

              <div className="flex w-full max-w-xl items-center rounded-2xl border border-neutral-200 bg-surface px-3 shadow-raised focus-within:border-primary-300 focus-within:ring-4 focus-within:ring-primary-100/70">
                <Search className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden="true" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="ابحث بالاسم أو SKU أو Supplier SKU…"
                  aria-label="البحث في المنتجات"
                  className="h-12 min-w-0 flex-1 bg-transparent px-3 text-body-sm text-foreground outline-none placeholder:text-neutral-400"
                />
              </div>
            </div>

            <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-surface shadow-raised">
              {loading ? (
                <LoadingRows />
              ) : filtered.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
                    <Package className="h-5 w-5" />
                  </span>
                  <p className="mt-4 text-body-sm font-medium text-foreground">لا توجد منتجات مطابقة.</p>
                  <p className="mt-1 text-caption text-muted-foreground">غيّر كلمة البحث أو حدّث البيانات القادمة من الخادم.</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {filtered.map((product) => (
                    <article key={product.id} className="group p-5 transition-colors hover:bg-neutral-50 sm:p-6">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-body font-medium text-foreground">{product.name}</p>
                            <AdminStatusPill
                              label={product.status}
                              tone={["ACTIVE", "PUBLISHED"].includes(product.status) ? "success" : "neutral"}
                            />
                          </div>
                          <p className="mt-1 text-caption text-muted-foreground">
                            {product.sku} · {product.categoryName ?? "بدون قسم"} · {product.brandName ?? "بدون علامة"}
                          </p>
                          <p className="mt-2 text-body-sm text-neutral-600">
                            المورد: <span className="font-medium text-foreground">{product.supplierName ?? "غير مضبوط"}</span>
                            <span className="mx-1 text-neutral-300">·</span>
                            SKU المورد: {product.supplierSku ?? "غير متاح"}
                          </p>
                        </div>

                        <Link
                          href={("/admin/products/" + product.id) as Route}
                          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-body-sm font-medium text-white transition hover:bg-brand-hover focus-visible:ring-4 focus-visible:ring-primary-100"
                        >
                          <Edit3 className="h-4 w-4" aria-hidden="true" />
                          إدارة المنتج
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </section>
        </div>
      </main>
    </AdminShell>
  );
}

function LoadingRows() {
  return (
    <div aria-label="جاري تحميل المنتجات" className="divide-y divide-neutral-100">
      {[1, 2, 3, 4].map((row) => (
        <div key={row} className="animate-pulse p-5 sm:p-6">
          <div className="h-4 w-2/3 rounded bg-neutral-100" />
          <div className="mt-3 h-3 w-1/2 rounded bg-neutral-100" />
          <div className="mt-2 h-3 w-1/3 rounded bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}
