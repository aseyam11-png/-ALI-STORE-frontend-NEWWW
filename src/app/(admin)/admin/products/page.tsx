"use client";

import Link from "next/link";
import { Package, Search, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AdminShell } from "@/components/layout/AdminShell";
import { getAdminProducts, updateAdminProductStatus, type AdminProduct } from "@/features/admin/services/admin-commerce.service";
import { formatSAR } from "@/features/localization/services/currency.service";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [status, setStatus] = useState("ACTIVE");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    getAdminProducts()
      .then((page) => {
        if (active) setProducts(page.content);
      })
      .catch((caughtError: unknown) => {
        if (active) {
          setError(caughtError instanceof Error ? caughtError.message : "تعذر تحميل المنتجات.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const changeStatus = async (productId: number, nextStatus: AdminProduct["status"]) => {
    setUpdatingId(productId);
    setError("");
    try {
      const updated = await updateAdminProductStatus(productId, nextStatus);
      setProducts((current) => current.map((item) => item.id === productId ? updated : item));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "تعذر تحديث حالة المنتج.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(
    () =>
      products.filter((product) => {
        const matchesStatus = status === "ALL" || product.status === status;
        const query = search.trim().toLowerCase();
        const matchesSearch =
          !query ||
          [product.name, product.sku, product.slug, product.categoryName, product.brandName ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(query);

        return matchesStatus && matchesSearch;
      }),
    [products, search, status],
  );

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">Administration</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A]">Products</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Customer catalog and supplier mapping from the backend.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row">
            <div className="flex h-11 max-w-xl flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search product, SKU or category..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </div>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none"
            >
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
              <option value="ALL">All statuses</option>
            </select>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
              جارٍ تحميل المنتجات...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm font-bold text-red-700">
              {error}
            </div>
          ) : (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="divide-y divide-slate-100">
                {filtered.map((product) => (
                  <article key={product.id} className="p-5">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                          <Package className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-sm font-black text-slate-900">{product.name}</h2>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600">
                              {product.status}
                            </span>
                          </div>
                          <p className="mt-1 text-[10px] font-mono text-slate-400">
                            {product.sku} · {product.categoryName}
                            {product.brandName ? " · " + product.brandName : ""}
                          </p>
                          <p className="mt-2 text-xs text-slate-500">
                            Supplier: {product.supplierName ?? "Not assigned"} 
                            {product.supplierSku ? " · " + product.supplierSku : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-6">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Store price</p>
                          <p className="mt-1 text-lg font-black text-[#0F2747]">{formatSAR(Number(product.price))}</p>
                        </div>

                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Supplier cost</p>
                          <p className="mt-1 text-sm font-bold text-slate-700">
                            {product.supplierCost != null ? formatSAR(Number(product.supplierCost)) : "Not set"}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={"/admin/products/" + product.id}
                            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-black text-slate-700 hover:bg-slate-50"
                          >
                            Details
                            <Truck className="h-3.5 w-3.5" />
                          </Link>
                          {product.status !== "ACTIVE" && (
                            <button
                              type="button"
                              disabled={updatingId === product.id}
                              onClick={() => void changeStatus(product.id, "ACTIVE")}
                              className="inline-flex h-10 items-center rounded-xl bg-emerald-600 px-4 text-xs font-black text-white disabled:opacity-50"
                            >
                              {updatingId === product.id ? "Updating..." : "Publish"}
                            </button>
                          )}
                          {product.status === "ACTIVE" && (
                            <button
                              type="button"
                              disabled={updatingId === product.id}
                              onClick={() => void changeStatus(product.id, "ARCHIVED")}
                              className="inline-flex h-10 items-center rounded-xl border border-amber-200 bg-amber-50 px-4 text-xs font-black text-amber-700 disabled:opacity-50"
                            >
                              Archive
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}

                {filtered.length === 0 && (
                  <div className="p-12 text-center text-sm text-slate-500">
                    No products found.
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
