"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import {
  createPricingRule,
  deletePricingRule,
  getPricingRules,
  type AdminPricingRule,
  type AdminPricingScope,
  type AdminPricingType,
} from "@/features/admin/pricing/services/pricing-rule-api.service";

export default function AdminPricingPage() {
  const [rules, setRules] = useState<AdminPricingRule[]>([]);
  const [scope, setScope] = useState<AdminPricingScope>("CATEGORY");
  const [type, setType] = useState<AdminPricingType>("PERCENTAGE_MARKUP");
  const [value, setValue] = useState("10");
  const [priority, setPriority] = useState("10");
  const [targetId, setTargetId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setRules(await getPricingRules());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load pricing rules.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    getPricingRules()
      .then((nextRules) => {
        if (active) setRules(nextRules);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Unable to load pricing rules.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function create() {
    setError("");
    const numericValue = Number(value);
    const numericPriority = Number(priority);
    const numericTarget = targetId ? Number(targetId) : undefined;

    if (!Number.isFinite(numericValue) || numericValue < 0) {
      setError("Markup value must be zero or greater.");
      return;
    }
    if (!Number.isInteger(numericPriority)) {
      setError("Priority must be an integer.");
      return;
    }
    if ((scope !== "GLOBAL") && (!Number.isInteger(numericTarget) || numericTarget! < 1)) {
      setError("A valid category or product id is required for this scope.");
      return;
    }

    try {
      await createPricingRule({
        scope,
        type,
        value: numericValue,
        priority: numericPriority,
        active: true,
        ...(scope === "CATEGORY" ? { categoryId: numericTarget } : {}),
        ...(scope === "PRODUCT" ? { productId: numericTarget } : {}),
      });
      setTargetId("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create pricing rule.");
    }
  }

  async function remove(id: number) {
    try {
      await deletePricingRule(id);
      setRules((current) => current.filter((rule) => rule.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete pricing rule.");
    }
  }

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1300px] px-4 py-8 sm:px-6 lg:px-8">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-500">Administration</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A]">Pricing rules</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Store-owned markup policies are persisted and applied against supplier cost.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1300px] px-4 py-7 sm:px-6 lg:px-8">
          {error && (
            <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
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
                <p className="mt-1 text-xs text-slate-400">Product scope overrides category, which overrides global.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <SelectField label="Scope" value={scope} onChange={(v) => { setScope(v as AdminPricingScope); setTargetId(""); }}>
                <option value="GLOBAL">Global</option>
                <option value="CATEGORY">Category</option>
                <option value="PRODUCT">Product</option>
              </SelectField>
              <SelectField label="Type" value={type} onChange={(v) => setType(v as AdminPricingType)}>
                <option value="PERCENTAGE_MARKUP">Percentage markup</option>
                <option value="FIXED_MARKUP">Fixed markup</option>
              </SelectField>
              <TextField label={type === "PERCENTAGE_MARKUP" ? "Markup %" : "Markup amount"} value={value} onChange={setValue} type="number" />
              <TextField label="Priority" value={priority} onChange={setPriority} type="number" />
              <TextField label={scope === "CATEGORY" ? "Category ID" : scope === "PRODUCT" ? "Product ID" : "Target"} value={targetId} onChange={setTargetId} disabled={scope === "GLOBAL"} />
            </div>

            <button
              type="button"
              onClick={() => void create()}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-black text-white"
            >
              <Plus className="h-4 w-4" />
              Add rule
            </button>
          </section>

          <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <div className="p-10 text-center text-sm text-slate-500">Loading rules...</div>
            ) : rules.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">No pricing rules configured.</div>
            ) : (
              rules.map((rule) => (
                <div key={rule.id} className="flex flex-col gap-4 border-b border-slate-100 p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-slate-900">#{rule.id} · {rule.scope}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {rule.scope === "CATEGORY"
                        ? `Category: ${rule.categoryName ?? rule.categoryId}`
                        : rule.scope === "PRODUCT"
                          ? `Product: ${rule.productName ?? rule.productId}`
                          : "All products"}
                    </p>
                    <p className="mt-2 text-xs font-black text-blue-700">
                      {rule.type === "PERCENTAGE_MARKUP" ? `+${rule.value}%` : `+${rule.value}`} · priority {rule.priority}
                    </p>
                  </div>
                  <button type="button" onClick={() => void remove(rule.id)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-black text-red-700">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              ))
            )}
          </section>
        </div>
      </main>
    </AdminShell>
  );
}

function TextField({ label, value, onChange, type = "text", disabled = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; disabled?: boolean }) {
  return (
    <label className="block text-xs font-black text-slate-600">
      {label}
      <input
        disabled={disabled}
        type={type}
        min={type === "number" ? "0" : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none disabled:bg-slate-100"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <label className="block text-xs font-black text-slate-600">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none">
        {children}
      </select>
    </label>
  );
}