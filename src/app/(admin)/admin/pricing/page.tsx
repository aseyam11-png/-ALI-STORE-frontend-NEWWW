"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Plus, RefreshCcw, Trash2 } from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
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
      setError(err instanceof Error ? err.message : "تعذر تحميل قواعد التسعير.");
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
        if (active) setError(err instanceof Error ? err.message : "تعذر تحميل قواعد التسعير.");
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
      setError("قيمة الـMarkup يجب أن تكون صفرًا أو أكبر.");
      return;
    }
    if (!Number.isInteger(numericPriority)) {
      setError("الأولوية يجب أن تكون رقمًا صحيحًا.");
      return;
    }
    if (scope !== "GLOBAL" && (!Number.isInteger(numericTarget) || numericTarget! < 1)) {
      setError("أدخل معرف قسم أو منتج صحيح لهذا النطاق.");
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
      setError(err instanceof Error ? err.message : "تعذر إنشاء قاعدة التسعير.");
    }
  }

  async function remove(id: number) {
    setError("");
    try {
      await deletePricingRule(id);
      setRules((current) => current.filter((rule) => rule.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حذف قاعدة التسعير.");
    }
  }

  const activeRules = rules.filter((rule) => rule.active).length;
  const categoryRules = rules.filter((rule) => rule.scope === "CATEGORY").length;

  return (
    <AdminShell>
      <main className="min-h-screen bg-background">
        <AdminPageHeader
          eyebrow="التسعير"
          title="قواعد تسعير المتجر"
          description="القواعد محفوظة على الخادم وتحدد هامش المتجر فوق تكلفة المورد. الواجهة لا تحسب سعر بيع بديلًا ولا تتجاوز سياسة الـBackend."
          actions={
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-surface px-4 text-body-sm font-medium text-neutral-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-brand disabled:opacity-50"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
              تحديث
            </button>
          }
        />

        <div className="container-shell py-8">
          {error && (
            <div role="alert" className="mb-5 rounded-xl border border-danger-100 bg-danger-surface p-4 text-body-sm font-medium text-danger-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <AdminMetricCard icon={BarChart3} label="إجمالي القواعد" value={String(rules.length)} />
            <AdminMetricCard icon={BarChart3} label="القواعد النشطة" value={String(activeRules)} tone="success" />
            <AdminMetricCard icon={BarChart3} label="على مستوى الأقسام" value={String(categoryRules)} tone="neutral" />
          </div>

          <section className="mt-7 rounded-2xl border border-neutral-200 bg-surface p-5 shadow-raised sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-brand">
                <Plus className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-h3 font-bold text-foreground">إضافة قاعدة</h2>
                <p className="mt-1 text-caption leading-5 text-muted-foreground">
                  المنتج يتقدم على القسم، والقسم يتقدم على النطاق العام حسب منطق الخادم.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <SelectField label="النطاق" value={scope} onChange={(next) => { setScope(next as AdminPricingScope); setTargetId(""); }}>
                <option value="GLOBAL">عام</option>
                <option value="CATEGORY">قسم</option>
                <option value="PRODUCT">منتج</option>
              </SelectField>
              <SelectField label="النوع" value={type} onChange={(next) => setType(next as AdminPricingType)}>
                <option value="PERCENTAGE_MARKUP">نسبة مئوية</option>
                <option value="FIXED_MARKUP">قيمة ثابتة</option>
              </SelectField>
              <TextField label={type === "PERCENTAGE_MARKUP" ? "نسبة الـMarkup" : "قيمة الـMarkup"} value={value} onChange={setValue} type="number" />
              <TextField label="الأولوية" value={priority} onChange={setPriority} type="number" />
              <TextField label={scope === "CATEGORY" ? "معرّف القسم" : scope === "PRODUCT" ? "معرّف المنتج" : "الهدف"} value={targetId} onChange={setTargetId} disabled={scope === "GLOBAL"} />
            </div>

            <button
              type="button"
              onClick={() => void create()}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-body-sm font-medium text-white transition hover:bg-brand-hover focus-visible:ring-4 focus-visible:ring-primary-100"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              حفظ القاعدة
            </button>
          </section>

          <section className="mt-7 overflow-hidden rounded-2xl border border-neutral-200 bg-surface shadow-raised">
            <div className="border-b border-neutral-100 px-5 py-4 sm:px-6">
              <h2 className="text-h3 font-bold text-foreground">القواعد الحالية</h2>
              <p className="mt-1 text-caption text-muted-foreground">{rules.length} قاعدة محملة من الخادم.</p>
            </div>

            {loading ? (
              <div className="divide-y divide-neutral-100" aria-label="جاري تحميل القواعد">
                {[1, 2, 3].map((row) => (
                  <div key={row} className="animate-pulse p-6">
                    <div className="h-4 w-1/3 rounded bg-neutral-100" />
                    <div className="mt-3 h-3 w-1/2 rounded bg-neutral-100" />
                  </div>
                ))}
              </div>
            ) : rules.length === 0 ? (
              <div className="p-14 text-center">
                <p className="text-body-sm font-medium text-foreground">لا توجد قواعد تسعير.</p>
                <p className="mt-1 text-caption text-muted-foreground">أنشئ أول قاعدة من النموذج أعلاه.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {rules.map((rule) => (
                  <div key={rule.id} className="flex flex-col gap-4 p-5 transition-colors hover:bg-neutral-50 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-body font-bold text-foreground">#{rule.id}</p>
                        <AdminStatusPill label={rule.active ? "نشطة" : "متوقفة"} tone={rule.active ? "success" : "neutral"} />
                        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-caption font-medium text-neutral-600">
                          {rule.scope}
                        </span>
                      </div>
                      <p className="mt-2 text-body-sm text-neutral-600">
                        {rule.scope === "CATEGORY"
                          ? `القسم: ${rule.categoryName ?? rule.categoryId}`
                          : rule.scope === "PRODUCT"
                            ? `المنتج: ${rule.productName ?? rule.productId}`
                            : "كل المنتجات"}
                      </p>
                      <p className="mt-1 text-caption font-medium text-brand">
                        {rule.type === "PERCENTAGE_MARKUP" ? `+${rule.value}%` : `+${rule.value}`} · أولوية {rule.priority}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => void remove(rule.id)}
                      className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-danger-100 bg-danger-surface px-4 text-body-sm font-medium text-danger-700 transition hover:border-danger-500"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </AdminShell>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block text-body-sm font-medium text-neutral-600">
      {label}
      <input
        disabled={disabled}
        type={type}
        min={type === "number" ? "0" : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-body-sm text-foreground outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-neutral-100"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-body-sm font-medium text-neutral-600">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-body-sm text-foreground outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100"
      >
        {children}
      </select>
    </label>
  );
}
