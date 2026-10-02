"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Package, ShieldCheck } from "lucide-react";
import { useParams } from "next/navigation";

import { AdminShell } from "@/components/layout/AdminShell";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { adminProductApi, type AdminProduct } from "@/features/products/services/admin-product-api.service";
import { HttpApiError } from "@/lib/api/http-client";

export default function AdminProductDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!/^\d+$/.test(id)) return;
    void adminProductApi.get(id)
      .then(setProduct)
      .catch((e) => setError(e instanceof HttpApiError ? e.message : "تعذر تحميل المنتج."));
  }, [id]);

  const updateStatus = async (status: "DRAFT" | "ACTIVE" | "ARCHIVED" | "DISCONTINUED") => {
    if (!product) return;
    setBusy(true);
    setError("");
    try {
      setProduct(await adminProductApi.updateStatus(product.id, status));
    } catch (e) {
      setError(e instanceof HttpApiError ? e.message : "تعذر تحديث المنتج.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminShell>
      <div>
        <Link href="/admin/products" className="inline-flex items-center gap-2 text-sm font-bold text-brand"><ArrowLeft className="h-4 w-4" /> العودة للكتالوج</Link>

        {error && <div role="alert" className="mt-5 rounded-xl border border-danger-100 bg-danger-surface p-4 text-sm font-bold text-danger-600">{error}</div>}

        {!product ? (
          <div className="mt-7 rounded-2xl border border-neutral-200 bg-surface p-10 text-center">
            <Package className="mx-auto h-8 w-8 text-neutral-300" />
            <p className="mt-4 text-sm font-bold">جاري تحميل المنتج...</p>
          </div>
        ) : (
          <>
            <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground">{product.sku}</p>
                <h1 className="mt-1 text-3xl font-black">{product.name}</h1>
                <p className="mt-2 text-sm text-muted-foreground">{product.categoryName ?? "بدون قسم"} · {product.brandName ?? "بدون علامة"}</p>
              </div>
              <span className="rounded-full bg-info-surface px-3 py-1.5 text-xs font-black text-brand">{product.status}</span>
            </div>

            <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_360px]">
              <section className="space-y-6">
                <div className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm">
                  <h2 className="text-lg font-black">بيانات المنتج</h2>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{product.description ?? "لا يوجد وصف."}</p>
                  {product.primaryImageUrl && <div className="mt-6 aspect-square max-w-sm overflow-hidden rounded-2xl bg-neutral-50"><img src={product.primaryImageUrl} alt={product.name} className="h-full w-full object-contain p-6" /></div>}
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm">
                  <h2 className="text-lg font-black">المصدر والتسعير</h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div><p className="text-xs text-muted-foreground">سعر ALI STORE</p><LocalizedPrice amountUSD={Number(product.price)} className="mt-1 text-xl font-black" /></div>
                    <div><p className="text-xs text-muted-foreground">تكلفة المورد</p><span className="mt-1 block text-xl font-black">{product.supplierCost == null ? "غير مضبوط" : <LocalizedPrice amountUSD={Number(product.supplierCost)} />}</span></div>
                    <div><p className="text-xs text-muted-foreground">Supplier</p><p className="mt-1 text-sm font-bold">{product.supplierName ?? "غير مربوط"}</p></div>
                    <div><p className="text-xs text-muted-foreground">Supplier SKU</p><p className="mt-1 text-sm font-mono">{product.supplierSku ?? "غير مضبوط"}</p></div>
                  </div>
                </div>
              </section>

              <aside className="h-fit rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm lg:sticky lg:top-24">
                <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-brand" /><h2 className="text-lg font-black">النشر</h2></div>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">الكتالوج العام يعرض ACTIVE فقط؛ النشر هنا يمر عبر قواعد المورد والتكلفة في الخادم.</p>
                <button type="button" disabled={busy || product.status === "ACTIVE"} onClick={() => void updateStatus("ACTIVE")} className="mt-5 h-11 w-full rounded-xl bg-success text-xs font-black text-white disabled:opacity-40"><CheckCircle2 className="mx-auto h-4 w-4" /> نشر المنتج</button>
                <button type="button" disabled={busy || product.status !== "ACTIVE"} onClick={() => void updateStatus("DRAFT")} className="mt-3 h-11 w-full rounded-xl border border-warning-200 bg-warning-surface text-xs font-black text-warning-700 disabled:opacity-40">إيقاف النشر</button>
                <button type="button" disabled={busy || product.status === "ARCHIVED"} onClick={() => void updateStatus("ARCHIVED")} className="mt-3 h-11 w-full rounded-xl border border-danger-100 bg-danger-surface text-xs font-black text-danger-600 disabled:opacity-40">أرشفة</button>
              </aside>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
