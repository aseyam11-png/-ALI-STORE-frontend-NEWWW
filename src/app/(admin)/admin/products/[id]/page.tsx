"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useParams } from "next/navigation";

import { AdminShell } from "@/components/layout/AdminShell";
import {
  getAdminProduct,
  updateAdminProduct,
  type AdminProduct,
} from "@/features/admin/products/services/admin-product-api.service";

export default function AdminProductPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<AdminProduct["status"]>("DRAFT");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    if (!params?.id) return;
    getAdminProduct(params.id)
      .then((next) => {
        setProduct(next);
        setName(next.name);
        setPrice(String(next.price));
        setStatus(next.status);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load product."))
      .finally(() => setLoading(false));
  }, [params?.id]);

  async function save() {
    if (!product) return;
    const numericPrice = Number(price);
    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      setError("Price must be zero or greater.");
      return;
    }

    setSaving(true);
    setError("");
    setSaved("");
    try {
      const updated = await updateAdminProduct(product.id, {
        name: name.trim(),
        price: numericPrice,
        status,
      });
      setProduct(updated);
      setName(updated.name);
      setPrice(String(updated.price));
      setStatus(updated.status);
      setSaved("Product changes saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update product.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <AdminShell><main className="min-h-screen bg-[#F8FAFC] p-12 text-center text-sm text-slate-500">Loading product...</main></AdminShell>;
  }

  if (!product) {
    return <AdminShell><main className="min-h-screen bg-[#F8FAFC] p-12 text-center text-sm text-red-600">{error || "Product not found."}</main></AdminShell>;
  }

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
            <Link href="/admin/products" className="inline-flex items-center gap-2 text-xs font-black text-[#2563EB]"><ArrowLeft className="h-3.5 w-3.5" />Back to products</Link>
            <h1 className="mt-4 text-3xl font-black text-[#0F172A]">{product.name}</h1>
            <p className="mt-2 text-xs text-slate-500">{product.sku} · supplier {product.supplierSku ?? "not configured"}</p>
          </div>
        </section>

        <div className="mx-auto max-w-[1000px] px-4 py-7 sm:px-6 lg:px-8">
          {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}
          {saved && <div role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{saved}</div>}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Store product name" value={name} onChange={setName} />
              <Field label={"Store price (" + product.currency + ")"} value={price} onChange={setPrice} type="number" />
              <label className="block text-xs font-black text-slate-600">
                Publication status
                <select value={status} onChange={(event) => setStatus(event.target.value as AdminProduct["status"])} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm">
                  <option value="DRAFT">DRAFT</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </label>
              <ReadOnly label="Category" value={product.categoryName ?? "—"} />
              <ReadOnly label="Brand" value={product.brandName ?? "—"} />
              <ReadOnly label="Supplier" value={product.supplierName ?? "—"} />
              <ReadOnly label="Supplier cost" value={product.supplierCost == null ? "—" : String(product.supplierCost) + " " + product.currency} />
              <ReadOnly label="Supplier SKU" value={product.supplierSku ?? "—"} />
            </div>

            <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
              Supplier cost and supplier identity remain source-of-truth data. Store price/status are merchant-owned controls.
            </div>

            <button type="button" disabled={saving} onClick={() => void save()} className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-black text-white disabled:opacity-50">
              <Save className="h-4 w-4" />{saving ? "Saving..." : "Save changes"}
            </button>
          </section>
        </div>
      </main>
    </AdminShell>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="block text-xs font-black text-slate-600">{label}<input type={type} min={type === "number" ? "0" : undefined} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#2563EB]" /></label>;
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-black text-slate-600">{label}</p><p className="mt-2 rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-700">{value}</p></div>;
}