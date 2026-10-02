"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

import { AdminShell } from "@/components/layout/AdminShell";
import {
  getAdminProduct,
  updateAdminProductStatus,
  type BackendAdminProduct,
} from "@/features/products/services/product-api.service";

const statusLabels: Record<string, string> = {
  DRAFT: "مسودة",
  ACTIVE: "نشط / منشور",
  ARCHIVED: "مؤرشف",
  DISCONTINUED: "متوقف",
};

export default function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [product, setProduct] = useState<BackendAdminProduct | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    void params.then(({ id }) => {
      const numericId = Number(id);
      if (!Number.isInteger(numericId) || numericId < 1) {
        setError("رقم المنتج غير صالح.");
        setLoading(false);
        return;
      }

      return getAdminProduct(numericId)
        .then(setProduct)
        .catch((requestError) => {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "تعذر تحميل المنتج.",
          );
        })
        .finally(() => setLoading(false));
    });
  }, [params]);

  const changeStatus = async (
    status: BackendAdminProduct["status"],
  ) => {
    if (!product) return;
    setWorking(true);
    setError("");
    try {
      const updated = await updateAdminProductStatus(product.id, status);
      setProduct(updated);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "تعذر تحديث الحالة.",
      );
    } finally {
      setWorking(false);
    }
  };

  return (
    <AdminShell>
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-xs font-black text-brand"
          >
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            العودة للمنتجات
          </Link>

          {loading ? (
            <div className="mt-8 flex items-center justify-center rounded-2xl border border-neutral-200 bg-surface p-14">
              <Loader2 className="h-6 w-6 animate-spin text-brand" />
            </div>
          ) : error || !product ? (
            <div role="alert" className="mt-8 rounded-2xl border border-danger-100 bg-danger-surface p-6 text-sm font-bold text-danger-700">
              {error || "المنتج غير موجود."}
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              <section className="rounded-2xl border border-neutral-200 bg-surface p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-brand">
                      Moderation
                    </p>
                    <h1 className="mt-2 text-3xl font-black text-foreground">
                      {product.name}
                    </h1>
                    <p className="mt-2 font-mono text-xs text-muted-foreground" dir="ltr">
                      {product.sku}
                    </p>
                  </div>
                  <span className="rounded-full bg-info-surface px-3 py-1 text-xs font-black text-brand">
                    {statusLabels[product.status] ?? product.status}
                  </span>
                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl bg-neutral-50 p-4">
                    <p className="text-xs text-muted-foreground">سعر البيع</p>
                    <p className="mt-2 font-black" dir="ltr">
                      {product.price} {product.currency}
                    </p>
                  </div>
                  <div className="rounded-xl bg-neutral-50 p-4">
                    <p className="text-xs text-muted-foreground">المورد</p>
                    <p className="mt-2 font-black">{product.supplierName ?? "غير مربوط"}</p>
                  </div>
                  <div className="rounded-xl bg-neutral-50 p-4">
                    <p className="text-xs text-muted-foreground">Supplier SKU</p>
                    <p className="mt-2 font-mono text-xs" dir="ltr">{product.supplierSku ?? "—"}</p>
                  </div>
                  <div className="rounded-xl bg-neutral-50 p-4">
                    <p className="text-xs text-muted-foreground">Supplier Cost</p>
                    <p className="mt-2 font-black" dir="ltr">
                      {product.supplierCost ?? "—"} {product.supplierCost != null ? product.currency : ""}
                    </p>
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  {product.status !== "ACTIVE" && (
                    <button
                      type="button"
                      disabled={working}
                      onClick={() => void changeStatus("ACTIVE")}
                      className="inline-flex h-11 items-center rounded-xl bg-success-600 px-5 text-sm font-black text-white disabled:opacity-50"
                    >
                      {working ? "جارٍ التحقق..." : "نشر المنتج"}
                    </button>
                  )}
                  {product.status === "ACTIVE" && (
                    <button
                      type="button"
                      disabled={working}
                      onClick={() => void changeStatus("ARCHIVED")}
                      className="inline-flex h-11 items-center rounded-xl border border-neutral-200 px-5 text-sm font-black text-foreground disabled:opacity-50"
                    >
                      أرشفة المنتج
                    </button>
                  )}
                </div>

                <p className="mt-5 text-xs leading-5 text-muted-foreground">
                  النشر لا يتم في الواجهة وحدها: الـbackend يتحقق من وجود المورد
                  الخارجي، Supplier SKU، Supplier Cost، وصلاحية المورد قبل قبول ACTIVE.
                </p>
              </section>
            </div>
          )}
        </div>
      </main>
    </AdminShell>
  );
}
