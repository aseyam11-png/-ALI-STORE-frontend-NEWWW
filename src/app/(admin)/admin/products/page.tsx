"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Package, Search } from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import { adminProductApi, type AdminProduct } from "@/features/products/services/admin-product-api.service";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { HttpApiError } from "@/lib/api/http-client";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const page = await adminProductApi.list();
      setProducts(page.content);
    } catch (e) {
      setError(e instanceof HttpApiError ? e.message : "تعذر تحميل المنتجات.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(
    () => products.filter((product) =>
      [product.name, product.sku, product.categoryName ?? "", product.brandName ?? ""]
        .join(" ").toLowerCase().includes(query.trim().toLowerCase()),
    ),
    [products, query],
  );

  const updateStatus = async (product: AdminProduct, status: "DRAFT" | "ACTIVE" | "ARCHIVED" | "DISCONTINUED") => {
    setError("");
    try {
      const updated = await adminProductApi.updateStatus(product.id, status);
      setProducts((current) => current.map((item) => item.id === product.id ? updated : item));
    } catch (e) {
      setError(e instanceof HttpApiError ? e.message : "تعذر تحديث حالة المنتج.");
    }
  };

  return (
    <AdminShell>
      <div>
        <h1 className="text-3xl font-black">الكتالوج والإدارة</h1>
        <p className="mt-2 text-sm text-muted-foreground">الحالة التي يغيّرها المسؤول هنا هي نفسها التي يتحقق منها كتالوج العملاء.</p>

        <div className="mt-6 flex h-11 max-w-2xl items-center gap-3 rounded-xl border border-neutral-200 bg-surface px-3">
          <Search className="h-4 w-4 text-neutral-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="الاسم أو SKU أو القسم أو العلامة" className="flex-1 bg-transparent text-sm outline-none" />
        </div>

        {error && <div role="alert" className="mt-5 rounded-2xl border border-danger-100 bg-danger-surface p-4 text-sm font-bold text-danger-600">{error}</div>}

        {loading ? (
          <div className="mt-7 rounded-2xl border border-neutral-200 bg-surface p-10 text-center">جاري تحميل الكتالوج...</div>
        ) : filtered.length === 0 ? (
          <div className="mt-7 rounded-2xl border border-dashed border-neutral-300 bg-surface p-12 text-center">
            <Package className="mx-auto h-8 w-8 text-neutral-300" />
            <p className="mt-3 text-sm font-bold">لا توجد منتجات مطابقة.</p>
          </div>
        ) : (
          <div className="mt-7 space-y-3">
            {filtered.map((product) => (
              <article key={product.id} className="rounded-2xl border border-neutral-200 bg-surface p-5 shadow-sm">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <Link href={`/admin/products/${product.id}`} className="min-w-0">
                    <p className="text-xs text-muted-foreground">{product.sku}</p>
                    <h2 className="mt-1 text-base font-black">{product.name}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">{product.categoryName ?? "بدون قسم"} · {product.brandName ?? "بدون علامة"}</p>
                  </Link>

                  <div className="flex flex-wrap items-center gap-4">
                    <LocalizedPrice amountUSD={Number(product.price)} className="font-black" />
                    {product.supplierCost != null && <span className="text-xs text-muted-foreground">تكلفة المورد: <LocalizedPrice amountUSD={Number(product.supplierCost)} /></span>}
                    <span className="rounded-full bg-info-surface px-3 py-1 text-[10px] font-black text-brand">{product.status}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {product.status !== "ACTIVE" && (
                      <button type="button" onClick={() => void updateStatus(product, "ACTIVE")} className="h-10 rounded-xl bg-success px-4 text-xs font-black text-white">نشر</button>
                    )}
                    {product.status === "ACTIVE" && (
                      <button type="button" onClick={() => void updateStatus(product, "DRAFT")} className="h-10 rounded-xl border border-warning-200 bg-warning-surface px-4 text-xs font-black text-warning-700">إيقاف النشر</button>
                    )}
                    {product.status !== "ARCHIVED" && (
                      <button type="button" onClick={() => void updateStatus(product, "ARCHIVED")} className="h-10 rounded-xl border border-danger-100 bg-danger-surface px-4 text-xs font-black text-danger-600">أرشفة</button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
