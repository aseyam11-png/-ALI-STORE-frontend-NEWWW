"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Edit3, Package, RefreshCcw, Search } from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
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
      setError(err instanceof Error ? err.message : "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  const filtered = products.filter((product) =>
    (product.name + " " + product.sku + " " + (product.supplierSku ?? ""))
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-500">Administration</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A]">Store products</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">Live B2C catalog with supplier-backed source data.</p>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
          {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}

          <div className="mb-5 flex gap-3 rounded-xl border border-slate-200 bg-white px-3">
            <Search className="mt-3.5 h-4 w-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product, SKU or supplier SKU..." className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none" />
            <button type="button" onClick={() => void refresh()} aria-label="Refresh products" className="flex h-9 w-9 items-center justify-center self-center rounded-lg text-slate-500 hover:bg-slate-50"><RefreshCcw className="h-4 w-4" /></button>
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {loading ? <div className="p-12 text-center text-sm text-slate-500">Loading products...</div> :
              filtered.length === 0 ? <div className="p-12 text-center"><Package className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-4 text-sm text-slate-500">No matching products.</p></div> :
              <div className="divide-y divide-slate-100">
                {filtered.map((product) => (
                  <article key={product.id} className="p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-black text-slate-900">{product.name}</p>
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-[#2563EB]">{product.status}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">{product.sku} · {product.categoryName ?? "No category"} · {product.brandName ?? "No brand"}</p>
                        <p className="mt-2 text-xs text-slate-500">Supplier: {product.supplierName ?? "Not configured"} · {product.supplierSku ?? "No supplier SKU"}</p>
                      </div>
                      <Link href={"/admin/products/" + product.id} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563EB] px-4 text-xs font-black text-white"><Edit3 className="h-4 w-4" />Manage</Link>
                    </div>
                  </article>
                ))}
              </div>}
          </section>
        </div>
      </main>
    </AdminShell>
  );
}
