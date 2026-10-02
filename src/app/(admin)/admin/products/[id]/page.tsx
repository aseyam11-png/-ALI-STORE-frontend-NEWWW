"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Archive, CheckCircle2, Clock3, Package, Save, ShieldCheck } from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import {
  getAdminProduct,
  updateAdminProduct,
  type AdminProduct,
} from "@/features/admin/products/services/admin-product-api.service";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";

const STATUS_LABEL: Record<AdminProduct["status"], string> = {
  DRAFT: "مسودة",
  ACTIVE: "منشور",
  ARCHIVED: "مؤرشف",
};

export default function AdminProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params?.id ?? "";

  const query = useQuery({
    queryKey: ["admin", "product", id],
    queryFn: () => getAdminProduct(id),
    enabled: Boolean(id),
  });

  const mutation = useMutation({
    mutationFn: (status: AdminProduct["status"]) =>
      updateAdminProduct(id, { status }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "product", id] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });

  if (query.isPending) {
    return (
      <AdminShell>
        <main className="min-h-screen bg-[#F8FAFC] p-8">
          <div className="mx-auto max-w-[1200px] h-72 animate-pulse rounded-2xl bg-white" />
        </main>
      </AdminShell>
    );
  }

  if (query.isError || !query.data) {
    return (
      <AdminShell>
        <main className="min-h-screen bg-[#F8FAFC] p-8">
          <div className="mx-auto max-w-[900px] rounded-2xl bg-white p-10 text-center">
            <Package className="mx-auto h-9 w-9 text-slate-300" />
            <h1 className="mt-5 text-2xl font-black">تعذر العثور على المنتج</h1>
            <Link href="/admin/products" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-black text-white">
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              المنتجات
            </Link>
          </div>
        </main>
      </AdminShell>
    );
  }

  const product = query.data;
  const canPublish =
    Boolean(product.supplierId) &&
    Boolean(product.supplierSku) &&
    product.supplierCost != null &&
    Number(product.supplierCost) > 0 &&
    Number(product.price) >= Number(product.supplierCost);

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
            <Link href="/admin/products" className="inline-flex items-center gap-2 text-xs font-black text-blue-600">
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              المنتجات
            </Link>

            <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Product #{product.id}
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                  {product.name}
                </h1>
                <p className="mt-2 text-sm text-slate-500">{product.sku} · {product.categoryName ?? "بدون قسم"}</p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700">
                {STATUS_LABEL[product.status]}
              </span>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex gap-5">
                <div className="flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-50">
                  {product.primaryImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.primaryImageUrl} alt="" className="h-full w-full object-contain p-4" />
                  ) : (
                    <Package className="h-8 w-8 text-slate-300" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">السعر</p>
                      <LocalizedPrice amountUSD={Number(product.price)} className="mt-2 text-xl font-black text-slate-900" />
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">تكلفة المصدر</p>
                      <p className="mt-2 text-xl font-black text-slate-900">
                        {product.supplierCost == null ? "—" : Number(product.supplierCost) + " " + product.currency}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-600">
                    <p><strong>المورد:</strong> {product.supplierName ?? "غير مربوط"}</p>
                    <p><strong>Supplier SKU:</strong> {product.supplierSku ?? "غير موجود"}</p>
                    <p><strong>الحالة:</strong> {STATUS_LABEL[product.status]}</p>
                    <p><strong>القسم:</strong> {product.categoryName ?? "غير محدد"}</p>
                  </div>
                </div>
              </div>
            </section>

            <aside className="h-fit space-y-4">
              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="text-sm font-black text-slate-900">حالة النشر</h2>

                {!canPublish && (
                  <div className="mt-4 rounded-xl bg-warning-surface p-4 text-xs leading-5 text-warning">
                    لا يمكن نشر المنتج حتى يكون مربوطًا بمورد وتكلفة مصدر صالحة، ويكون سعر البيع مساويًا أو أعلى من تكلفة المصدر.
                  </div>
                )}

                <button
                  type="button"
                  disabled={mutation.isPending || !canPublish}
                  onClick={() => mutation.mutate("ACTIVE")}
                  className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  نشر المنتج
                </button>

                <button
                  type="button"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate("DRAFT")}
                  className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <Clock3 className="h-4 w-4" />
                  تحويل إلى مسودة
                </button>

                <button
                  type="button"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate("ARCHIVED")}
                  className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-100 text-sm font-black text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <Archive className="h-4 w-4" />
                  أرشفة
                </button>

                {mutation.isError && (
                  <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600">
                    {mutation.error instanceof Error ? mutation.error.message : "فشل تحديث المنتج"}
                  </p>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <p className="text-xs leading-5 text-slate-500">
                    حالة ACTIVE هي بوابة النشر الفعلية للكتالوج العام. قرارات الإدارة محفوظة في Backend وليست في Zustand المحلي.
                  </p>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </AdminShell>
  );
}
