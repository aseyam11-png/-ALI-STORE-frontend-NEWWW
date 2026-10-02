"use client";

import {
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react";

import { useState } from "react";

import { AdminShell } from "@/components/layout/AdminShell";
import { formatSAR } from "@/features/localization/services/currency.service";

import {
  usePricingRuleStore,
} from "@/stores/pricing-rule-store";

import type {
  PricingRuleType,
} from "@/features/pricing/types/pricing.types";

const categories = [
  "Electronics",
  "Home & Garden",
  "Fashion",
  "Beauty",
  "Sports & Outdoors",
  "Furniture",
  "Premium",
];

export default function AdminPricingPage() {
  const rules =
    usePricingRuleStore(
      (state) => state.rules,
    );

  const addRule =
    usePricingRuleStore(
      (state) => state.addRule,
    );

  const updateRule =
    usePricingRuleStore(
      (state) => state.updateRule,
    );

  const removeRule =
    usePricingRuleStore(
      (state) => state.removeRule,
    );

  const [
    name,
    setName,
  ] = useState("");

  const [
    productId,
    setProductId,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState(
    "Electronics",
  );

  const [
    type,
    setType,
  ] =
    useState<PricingRuleType>(
      "FIXED",
    );

  const [
    value,
    setValue,
  ] = useState("10");

  const [
    priority,
    setPriority,
  ] = useState("10");

  const [
    scope,
    setScope,
  ] = useState<
    "CATEGORY" | "PRODUCT"
  >("CATEGORY");

  const createRule = () => {
    if (!name.trim()) {
      return;
    }

    if (
      scope === "PRODUCT" &&
      !productId.trim()
    ) {
      return;
    }

    addRule({
      name: name.trim(),
      productId:
        scope === "PRODUCT"
          ? productId.trim()
          : undefined,
      category:
        scope === "CATEGORY"
          ? category
          : undefined,
      type,
      value:
        Number(value) || 0,
      active: true,
      priority:
        Number(priority) || 0,
    });

    setName("");
    setProductId("");
    setValue("10");
    setPriority("10");
  };

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">

        <section className="border-b border-slate-200 bg-white">

          <div className="mx-auto max-w-[1300px] px-4 py-8 sm:px-6 lg:px-8">

            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-500">
              Administration
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A]">
              Pricing rules
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Configure automatic store pricing by category or product.
              Manual product prices can override automatic rules.
            </p>

          </div>

        </section>

        <div className="mx-auto max-w-[1300px] px-4 py-7 sm:px-6 lg:px-8">

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                <Plus className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Create pricing rule
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Product rules have higher priority than category rules.
                </p>
              </div>

            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">

              <Field
                label="Rule name"
                value={name}
                onChange={setName}
                placeholder="Electronics + 10 SAR"
              />

              <div>
                <label className="text-xs font-black text-slate-600">
                  Scope
                </label>

                <select
                  value={scope}
                  onChange={(event) =>
                    setScope(
                      event.target.value as
                        | "CATEGORY"
                        | "PRODUCT",
                    )
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                >
                  <option value="CATEGORY">
                    Category
                  </option>

                  <option value="PRODUCT">
                    Product
                  </option>
                </select>
              </div>

              {scope === "PRODUCT" ? (
                <Field
                  label="Product ID"
                  value={productId}
                  onChange={setProductId}
                  placeholder="p-001"
                />
              ) : (
                <div>
                  <label className="text-xs font-black text-slate-600">
                    Category
                  </label>

                  <select
                    value={category}
                    onChange={(event) =>
                      setCategory(
                        event.target.value,
                      )
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                  >
                    {categories.map(
                      (item) => (
                        <option key={item}>
                          {item}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-black text-slate-600">
                  Rule type
                </label>

                <select
                  value={type}
                  onChange={(event) =>
                    setType(
                      event.target.value as
                        PricingRuleType,
                    )
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                >
                  <option value="FIXED">
                    Fixed amount
                  </option>

                  <option value="PERCENTAGE">
                    Percentage
                  </option>
                </select>
              </div>

              <Field
                label={
                  type === "FIXED"
                    ? "Markup"
                    : "Markup %"
                }
                value={value}
                onChange={setValue}
                type="number"
                placeholder="10"
              />

              <Field
                label="Priority"
                value={priority}
                onChange={setPriority}
                type="number"
                placeholder="10"
              />

            </div>

            <button
              type="button"
              onClick={
                createRule
              }
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-black text-white"
            >
              <Plus className="h-4 w-4" />
              Add rule
            </button>

          </section>

          <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 p-5">

              <h2 className="text-lg font-black text-slate-900">
                Pricing rules
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Higher priority rules are selected first.
              </p>

            </div>

            <div className="divide-y divide-slate-100">

              {rules
                .slice()
                .sort(
                  (a, b) =>
                    b.priority -
                    a.priority,
                )
                .map(
                  (rule) => (
                    <div
                      key={rule.id}
                      className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between"
                    >

                      <div>

                        <div className="flex flex-wrap items-center gap-2">

                          <p className="text-sm font-black text-slate-900">
                            {rule.name}
                          </p>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                              rule.active
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {rule.active
                              ? "ACTIVE"
                              : "INACTIVE"}
                          </span>

                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-blue-700">
                            P{rule.priority}
                          </span>

                        </div>

                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">

                          <span>
                            {rule.productId
                              ? `Product: ${rule.productId}`
                              : `Category: ${rule.category ?? "All"}`}
                          </span>

                          <span>
                            ·
                          </span>

                          <span className="font-black text-slate-700">
                            {rule.type ===
                            "FIXED"
                              ? `+${formatSAR(rule.value)}`
                              : `+${rule.value}%`}
                          </span>

                        </div>

                      </div>

                      <div className="flex flex-wrap gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            updateRule(
                              rule.id,
                              {
                                active:
                                  !rule.active,
                              },
                            )
                          }
                          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-black text-slate-700"
                        >
                          <CheckCircle2 className="h-4 w-4" />

                          {rule.active
                            ? "Disable"
                            : "Enable"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            removeRule(
                              rule.id,
                            )
                          }
                          className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-black text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>

                      </div>

                    </div>
                  ),
                )}

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
  onChange: (
    value: string,
  ) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-black text-slate-600">
        {label}
      </label>

      <input
        type={type}
        min={
          type === "number"
            ? "0"
            : undefined
        }
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}
