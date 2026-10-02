"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Plus, RefreshCw, Trash2 } from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import {
  createPricingRule,
  deletePricingRule,
  getPricingRules,
  updatePricingRule,
  type AdminPricingRule,
} from "@/features/admin/pricing/services/pricing-rule-api.service";

export default function AdminPricingPage() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["admin", "pricing-rules"],
    queryFn: getPricingRules,
    staleTime: 10_000,
  });

  const [name, setName] = useState("");
  const [type, setType] = useState<AdminPricingRule["type"]>("PERCENTAGE");
  const [value, setValue] = useState("25");
  const [priority, setPriority] = useState("10");

  const createMutation = useMutation({
    mutationFn: () =>
      createPricingRule({
        name: name.trim(),
        type,
        value: Number(value),
        active: true,
        priority: Number(priority),
        productId: null,
        categoryId: null,
      }),
    onSuccess: async () => {
      setName("");
      await queryClient.invalidateQueries({ queryKey: ["admin", "pricing-rules"] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (rule: AdminPricingRule) =>
      updatePricingRule(rule.id, {
        ...rule,
        value: Number(rule.value),
        active: !rule.active,
        productId: rule.productId ?? null,
        categoryId: rule.categoryId ?? null,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "pricing-rules"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePricingRule,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "pricing-rules"] }),
  });

  const rules = useMemo(() => query.data ?? [], [query.data]);

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-black text-blue-700">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Pricing engine
                </div>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900">قواعد التسعير</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  السعر النهائي يُحسب في Backend انطلاقًا من تكلفة المورد وقاعدة المنتج/القسم.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void query.refetch()}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700"
              >
                <RefreshCw className="h-4 w-4" />
                تحديث
              </button>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black text-slate-900">إضافة قاعدة عامة</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-[1.5fr_180px_140px_120px_auto]">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="اسم القاعدة"
                className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
              />
              <select
                value={type}
                onChange={(event) => setType(event.target.value as AdminPricingRule["type"])}
                className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
              >
                <option value="PERCENTAGE">نسبة مئوية</option>
                <option value="FIXED">مبلغ ثابت</option>
              </select>
              <input
                type="number"
                min="0.01"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
                aria-label="قيمة القاعدة"
              />
              <input
                type="number"
                min="0"
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
                aria-label="أولوية القاعدة"
              />
              <button
                type="button"
                disabled={!name.trim() || createMutation.isPending}
                onClick={() => void createMutation.mutate()}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 text-xs font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Plus className="h-4 w-4" />
                إضافة
              </button>
            </div>

            {createMutation.isError && (
              <p role="alert" className="mt-3 text-xs font-bold text-red-600">
                {createMutation.error instanceof Error ? createMutation.error.message : "تعذر إنشاء القاعدة"}
              </p>
            )}
          </section>

          <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {query.isPending ? (
              <div className="p-8 text-sm text-slate-400">جاري تحميل قواعد التسعير…</div>
            ) : query.isError ? (
              <div className="p-8 text-center">
                <p className="text-sm font-bold text-red-600">تعذر تحميل قواعد التسعير.</p>
                <button type="button" onClick={() => void query.refetch()} className="mt-4 rounded-xl bg-[#2563EB] px-5 py-2.5 text-xs font-black text-white">
                  إعادة المحاولة
                </button>
              </div>
            ) : rules.length === 0 ? (
              <div className="p-12 text-center text-sm text-slate-500">لا توجد قواعد تسعير.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {rules.map((rule) => (
                  <article key={rule.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-black text-slate-900">{rule.name}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {rule.productId ? "منتج #" + rule.productId : rule.categoryId ? "قسم #" + rule.categoryId : "قاعدة عامة"}
                        {" · "}الأولوية {rule.priority}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700">
                        {rule.type === "PERCENTAGE" ? Number(rule.value) + "%" : Number(rule.value) + " SAR"}
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleMutation.mutate(rule)}
                        className={"rounded-full px-3 py-1.5 text-xs font-black " + (rule.active ? "bg-success-surface text-success" : "bg-neutral-100 text-neutral-500")}
                      >
                        {rule.active ? "مفعّلة" : "متوقفة"}
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(rule.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                        aria-label="حذف القاعدة"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </AdminShell>
  );
}
