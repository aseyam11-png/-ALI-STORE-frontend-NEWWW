"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Plus, Trash2, Calculator, X } from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import { formatSAR } from "@/features/localization/services/currency.service";
import {
  createPricingRule,
  deletePricingRule,
  getPricingRules,
  previewSellingPrice,
  type PricingRule,
  type PricingRuleInput,
} from "@/features/pricing/services/pricing-api.service";
import { getAdminProducts, type AdminProduct } from "@/features/admin/services/admin-commerce.service";
import { apiClient } from "@/lib/api/http-client";

type Category = { id: number; name: string; slug: string; active: boolean };

const emptyRule: PricingRuleInput = {
  name: "",
  scope: "CATEGORY",
  productId: null,
  categoryId: null,
  type: "PERCENTAGE",
  value: 20,
  priority: 10,
  active: true,
};

export default function AdminPricingPage() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyRule);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [previewProductId, setPreviewProductId] = useState<number | null>(null);
  const [preview, setPreview] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const [rulesPage, productsPage, nextCategories] = await Promise.all([
          getPricingRules(),
          getAdminProducts(0, 100),
          apiClient.request<Category[]>("/api/v1/categories"),
        ]);
        if (!active) return;
        setRules(rulesPage.content);
        setProducts(productsPage.content);
        setCategories(nextCategories.filter((item) => item.active));
      } catch (caughtError) {
        if (active) setError(caughtError instanceof Error ? caughtError.message : "تعذر تحميل قواعد التسعير.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, []);

  const categoryProducts = useMemo(
    () => products.filter((product) => product.status === "ACTIVE"),
    [products],
  );

  const saveRule = async () => {
    if (!form.name.trim()) {
      setError("اسم القاعدة مطلوب.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload: PricingRuleInput = {
        ...form,
        name: form.name.trim(),
        productId: form.scope === "PRODUCT" ? Number(form.productId) : null,
        categoryId: form.scope === "CATEGORY" ? Number(form.categoryId) : null,
        value: Number(form.value),
        priority: Number(form.priority),
      };

      const created = await createPricingRule(payload);
      setRules((current) => [...current, created]);
      setForm(emptyRule);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "تعذر حفظ قاعدة التسعير.");
    } finally {
      setSaving(false);
    }
  };

  const removeRule = async (id: number) => {
    setError("");
    try {
      await deletePricingRule(id);
      setRules((current) => current.filter((rule) => rule.id !== id));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "تعذر حذف قاعدة التسعير.");
    }
  };

  const showPreview = async (productId: number) => {
    setPreviewProductId(productId);
    setPreview(null);
    setError("");
    try {
      setPreview(await previewSellingPrice(productId));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "تعذر حساب المعاينة.");
    }
  };

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">Administration</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A]">Automated pricing</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Store prices are calculated from supplier cost by persistent rules. Product-level rules take precedence over category rules.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
          {error && (
            <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Create pricing rule</h2>
                <p className="mt-1 text-xs text-slate-400">Rules are stored in PostgreSQL and used by backend pricing.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              <Field label="Rule name" value={form.name} onChange={(value) => setForm((v) => ({ ...v, name: value }))} placeholder="Fashion + 20%" />

              <div>
                <label className="text-xs font-black text-slate-600">Scope</label>
                <select
                  value={form.scope}
                  onChange={(event) => setForm((v) => ({
                    ...v,
                    scope: event.target.value as PricingRule["scope"],
                    productId: null,
                    categoryId: null,
                  }))}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                >
                  <option value="CATEGORY">Category</option>
                  <option value="PRODUCT">Product</option>
                </select>
              </div>

              {form.scope === "CATEGORY" ? (
                <div>
                  <label className="text-xs font-black text-slate-600">Category</label>
                  <select
                    value={form.categoryId ?? ""}
                    onChange={(event) => setForm((v) => ({ ...v, categoryId: event.target.value ? Number(event.target.value) : null }))}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                  >
                    <option value="">Select...</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-black text-slate-600">Product</label>
                  <select
                    value={form.productId ?? ""}
                    onChange={(event) => setForm((v) => ({ ...v, productId: event.target.value ? Number(event.target.value) : null }))}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                  >
                    <option value="">Select...</option>
                    {categoryProducts.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-black text-slate-600">Rule type</label>
                <select
                  value={form.type}
                  onChange={(event) => setForm((v) => ({ ...v, type: event.target.value as PricingRule["type"] }))}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED">Fixed amount</option>
                </select>
              </div>

              <Field
                label={form.type === "PERCENTAGE" ? "Markup %" : "Markup"}
                value={String(form.value)}
                onChange={(value) => setForm((v) => ({ ...v, value: Number(value) || 0 }))}
                type="number"
                placeholder="20"
              />

              <Field
                label="Priority"
                value={String(form.priority)}
                onChange={(value) => setForm((v) => ({ ...v, priority: Number(value) || 0 }))}
                type="number"
                placeholder="10"
              />
            </div>

            <button
              type="button"
              disabled={saving || (form.scope === "PRODUCT" ? !form.productId : !form.categoryId)}
              onClick={() => void saveRule()}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {saving ? "Saving..." : "Add rule"}
            </button>
          </section>

          <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <h2 className="text-lg font-black text-slate-900">Stored rules</h2>
              <p className="mt-1 text-xs text-slate-400">{rules.length} rules loaded from backend.</p>
            </div>
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-12 text-center text-sm text-slate-500">جارٍ تحميل القواعد...</div>
              ) : rules.length === 0 ? (
                <div className="p-12 text-center text-sm text-slate-500">No pricing rules configured yet.</div>
              ) : (
                rules
                  .slice()
                  .sort((a, b) => b.priority - a.priority)
                  .map((rule) => (
                    <article key={rule.id} className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-black text-slate-900">{rule.name}</h3>
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                            {rule.active ? "ACTIVE" : "INACTIVE"}
                          </span>
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-blue-700">
                            P{rule.priority}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          {rule.scope === "PRODUCT" ? "Product: " + (rule.productName ?? rule.productId) : "Category: " + (rule.categoryName ?? rule.categoryId)}
                          {" · "}
                          <span className="font-black text-slate-700">
                            {rule.type === "FIXED" ? "+" + formatSAR(Number(rule.value)) : "+" + rule.value + "%"}
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {rule.productId && (
                          <button
                            type="button"
                            onClick={() => void showPreview(rule.productId!)}
                            className="inline-flex h-10 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-xs font-black text-blue-700"
                          >
                            <Calculator className="h-4 w-4" />
                            Preview price
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => void removeRule(rule.id)}
                          className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-black text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </article>
                  ))
              )}
            </div>
          </section>

          {previewProductId && preview !== null && (
            <section className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black text-blue-700">Automatic price preview</p>
                  <p className="mt-1 text-sm font-bold text-slate-700">
                    {products.find((product) => product.id === previewProductId)?.name ?? "Product"} → {formatSAR(Number(preview))}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewProductId(null);
                    setPreview(null);
                  }}
                  aria-label="Close preview"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-blue-700 hover:bg-blue-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </section>
          )}

          <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-black text-slate-900">Store price authority</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Customer pages read the final price from the backend product record. Supplier cost is never exposed to customers.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </AdminShell>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-black text-slate-600">{label}</label>
      <input
        type={type}
        min={type === "number" ? "0" : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}
