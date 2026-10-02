"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Package, RefreshCw, Search, ShieldCheck } from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import {
  getAdminProducts,
  type AdminProduct,
} from "@/features/admin/products/services/admin-product-api.service";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";

const STATUS_LABEL: Record<AdminProduct["status"], string> = {
  DRAFT: "مسودة",
  ACTIVE: "منشور",
  ARCHIVED: "مؤرشف",
};

function statusClass(status: AdminProduct["status"]) {
  if (status === "ACTIVE") return "bg-success-surface text-success";
  if (status === "ARCHIVED") return "bg-neutral-100 text-neutral-500";
  return "bg-warning-surface text-warning";
}

export default function AdminProductsPage() {
  const query = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => getAdminProducts(0, 100),
    staleTime: 10_000,
  });

  const products = query.data?.content ?? [];

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-black text-blue-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  الكتالوج المنشور
                </div>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                  إدارة المنتجات
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  المنتجات هنا هي المصدر الإداري الحقيقي، وحالة ACTIVE هي التي تسمح بعرض المنتج للعملاء.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void query.refetch()}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" />
                تحديث
              </button>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
          {query.isPending ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-2xl bg-white" />
              ))}
            </div>
          ) : query.isError ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
              <h2 className="text-lg font-black text-red-700">تعذر تحميل المنتجات</h2>
              <button
                type="button"
                onClick={() => void query.refetch()}
                className="mt-5 rounded-xl bg-[#2563EB] px-5 py-2.5 text-xs font-black text-white"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-4">
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    aria-label="بحث المنتجات"
                    className="h-11 flex-1 bg-transparent text-sm outline-none"
                    placeholder="بحث سريع داخل الصفحة"
                    onChange={(event) => {
                      const value = event.target.value.toLocaleLowerCase();
                      const rows = document.querySelectorAll<HTMLElement>("[data-admin-product]");
                      rows.forEach((row) => {
                        row.hidden = !row.dataset.adminProduct?.includes(value);
                      });
                    }}
                  />
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {products.map((product) => (
                  <article
                    key={product.id}
                    data-admin-product={(product.name + " " + product.sku).toLocaleLowerCase()}
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                        {product.primaryImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.primaryImageUrl} alt="" className="h-full w-full object-contain p-2" />
                        ) : (
                          <Package className="h-5 w-5 text-slate-300" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <Link
                          href={"/admin/products/" + product.id}
                          className="truncate text-sm font-black text-slate-900 hover:text-blue-600"
                        >
                          {product.name}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          <span dir="ltr">{product.sku}</span>
                          <span>·</span>
                          <span>{product.categoryName ?? "بدون قسم"}</span>
                          <span>·</span>
                          <span>{product.supplierName ?? "بدون مورد"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:justify-end">
                      <div className="text-end">
                        <LocalizedPrice amountUSD={Number(product.price)} className="text-sm font-black text-slate-900" />
                        <p className="mt-1 text-[10px] text-slate-400">
                          تكلفة المصدر: {product.supplierCost == null ? "—" : Number(product.supplierCost) + " " + product.currency}
                        </p>
                      </div>

                      <span className={"rounded-full px-3 py-1.5 text-[10px] font-black " + statusClass(product.status)}>
                        {STATUS_LABEL[product.status]}
                      </span>

                      <Link
                        href={"/admin/products/" + product.id}
                        className="inline-flex h-10 items-center rounded-xl border border-slate-200 px-4 text-xs font-black text-slate-700 hover:bg-slate-50"
                      >
                        إدارة
                      </Link>
                    </div>
                  </article>
                ))}

                {products.length === 0 && (
                  <div className="p-12 text-center text-sm text-slate-500">
                    لا توجد منتجات.
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </AdminShell>
  );
}
