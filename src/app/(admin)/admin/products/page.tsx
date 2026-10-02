"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, Package, RefreshCw } from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import {
  getAdminProducts,
  updateAdminProductStatus,
  type BackendAdminProduct,
} from "@/features/products/services/product-api.service";

const labels: Record<string, string> = {
  DRAFT: "مسودة",
  ACTIVE: "نشط / منشور",
  ARCHIVED: "مؤرشف",
  DISCONTINUED: "متوقف",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<BackendAdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const page = await getAdminProducts(0, 50);
      setProducts(page.content);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "تعذر تحميل منتجات الإدارة.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const setStatus = async (
    id: number,
    status: BackendAdminProduct["status"],
  ) => {
    setWorkingId(id);
    setError("");
    try {
      const updated = await updateAdminProductStatus(id, status);
      setProducts((current) =>
        current.map((item) => (item.id === id ? updated : item)),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "تعذر تحديث حالة المنتج.",
      );
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <AdminShell>
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-brand">
                Catalog moderation
              </p>
              <h1 className="mt-2 text-3xl font-black text-foreground">
                المنتجات
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                هذه الصفحة تغيّر حالة المنتج على الـbackend نفسه؛ أي منتج يصبح
                ACTIVE يظهر في الكتالوج العام وفق قواعد النشر والمورد.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-surface px-4 text-xs font-black"
            >
              <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              تحديث
            </button>
          </div>

          {error && (
            <div role="alert" className="mt-6 rounded-2xl border border-danger-100 bg-danger-surface p-4 text-sm font-bold text-danger-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-8 flex items-center justify-center rounded-2xl border border-neutral-200 bg-surface p-14">
              <Loader2 className="h-6 w-6 animate-spin text-brand" />
            </div>
          ) : products.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-surface p-14 text-center">
              <Package className="mx-auto h-10 w-10 text-neutral-300" />
              <h2 className="mt-4 text-lg font-black">لا توجد منتجات</h2>
            </div>
          ) : (
            <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-surface">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="border-b border-neutral-200 bg-neutral-50 text-xs text-muted-foreground">
                    <tr>
                      <th className="px-4 py-4 text-start">المنتج</th>
                      <th className="px-4 py-4 text-start">SKU</th>
                      <th className="px-4 py-4 text-start">السعر</th>
                      <th className="px-4 py-4 text-start">المورد</th>
                      <th className="px-4 py-4 text-start">الحالة</th>
                      <th className="px-4 py-4 text-start">إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-neutral-100 last:border-0">
                        <td className="px-4 py-4">
                          <Link
                            href={"/admin/products/" + product.id}
                            className="font-black hover:text-brand"
                          >
                            {product.name}
                          </Link>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {product.categoryName}
                          </p>
                        </td>
                        <td className="px-4 py-4 font-mono text-xs" dir="ltr">
                          {product.sku}
                        </td>
                        <td className="px-4 py-4 font-black" dir="ltr">
                          {product.price} {product.currency}
                        </td>
                        <td className="px-4 py-4 text-xs">
                          {product.supplierName ?? "غير مربوط"}
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-info-surface px-3 py-1 text-[11px] font-black text-brand">
                            {labels[product.status] ?? product.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            {product.status !== "ACTIVE" && (
                              <button
                                type="button"
                                disabled={workingId === product.id}
                                onClick={() => void setStatus(product.id, "ACTIVE")}
                                className="rounded-lg bg-success-600 px-3 py-2 text-[11px] font-black text-white disabled:opacity-50"
                              >
                                نشر
                              </button>
                            )}
                            {product.status === "ACTIVE" && (
                              <button
                                type="button"
                                disabled={workingId === product.id}
                                onClick={() => void setStatus(product.id, "ARCHIVED")}
                                className="rounded-lg border border-neutral-200 px-3 py-2 text-[11px] font-black text-neutral-700 disabled:opacity-50"
                              >
                                أرشفة
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </AdminShell>
  );
}
