"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ImageOff,
  Layers,
  Package,
  Send,
  ShieldCheck,
  Tag,
  X,
} from "lucide-react";
import { useState } from "react";

import { AdminShell } from "@/components/layout/AdminShell";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { formatSAR } from "@/features/localization/services/currency.service";
import { getCategoryFilters } from "@/features/catalog/services/filter.service";

import {
  useProductModerationStore,
} from "@/stores/product-moderation-store";

// Filter facets that describe how to *browse* the catalog (brand, rating,
// availability, shipping, deals) rather than the product itself — excluded
// from the Attributes tab, which only shows the category-specific facets
// (size/color/material, skin type/shade, ...) that are real product
// attributes.
const BROWSE_ONLY_FILTER_IDS = new Set([
  "brand",
  "rating",
  "availability",
  "shipping",
  "discount",
]);

function toCategorySlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminProductReviewPage() {
  const params =
    useParams<{ id: string }>();

  const submissionId =
    params?.id ??
    "SUB-1001";

  const submission =
    useProductModerationStore(
      (state) =>
        state.getSubmission(
          submissionId,
        ),
    );

  const approveSubmission =
    useProductModerationStore(
      (state) =>
        state.approveSubmission,
    );

  const rejectSubmission =
    useProductModerationStore(
      (state) =>
        state.rejectSubmission,
    );

  const requestChanges =
    useProductModerationStore(
      (state) =>
        state.requestChanges,
    );

  const [
    note,
    setNote,
  ] = useState("");

  const [
    actionDone,
    setActionDone,
  ] = useState("");

  if (!submission) {
    return (
      <AdminShell>
        <main className="min-h-screen bg-[#F8FAFC]">
          <div className="mx-auto max-w-4xl px-4 py-12 text-center">
            <Package className="mx-auto h-8 w-8 text-slate-300" />

            <h1 className="mt-4 text-2xl font-black text-slate-900">
              Submission not found
            </h1>

            <Link
              href="/admin/products"
              className="mt-6 inline-flex h-11 items-center rounded-xl bg-[#2563EB] px-5 text-sm font-black text-white"
            >
              Back to moderation
            </Link>
          </div>
        </main>
      </AdminShell>
    );
  }

  const handleApprove =
    () => {
      approveSubmission(
        submission.id,
        note ||
          "Approved by administrator.",
      );

      setActionDone(
        "Product approved and published.",
      );
    };

  const handleReject =
    () => {
      if (!note.trim()) {
        return;
      }

      rejectSubmission(
        submission.id,
        note.trim(),
      );

      setActionDone(
        "Product rejected.",
      );
    };

  const handleChanges =
    () => {
      if (!note.trim()) {
        return;
      }

      requestChanges(
        submission.id,
        note.trim(),
      );

      setActionDone(
        "Changes requested.",
      );
    };

  const categorySlug =
    toCategorySlug(
      submission.subcategory ??
        submission.category,
    );

  const categoryAttributes =
    getCategoryFilters(categorySlug).filters.filter(
      (filter) => !BROWSE_ONLY_FILTER_IDS.has(filter.id),
    );

  const workspaceTabs = [
    {
      id: "general",
      label: "General",
      content: (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <ReviewField label="Product name" value={submission.productName} />
            <ReviewField label="Brand" value={submission.brand} />
            <ReviewField label="SKU" value={submission.sku} />
            <ReviewField
              label="Status"
              value={submission.status.replace("_", " ")}
            />
            <div className="sm:col-span-2">
              <ReviewField label="Description" value={submission.description} />
            </div>
          </div>
        </section>
      ),
    },
    {
      id: "categorization",
      label: "Categorization",
      content: (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <ReviewField label="Category" value={submission.category} />
            <ReviewField
              label="Subcategory"
              value={submission.subcategory ?? "—"}
            />
          </div>
        </section>
      ),
    },
    {
      id: "attributes",
      label: "Attributes",
      content:
        categoryAttributes.length > 0 ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs text-slate-400">
              Attribute fields expected for this category — this submission
              model does not yet capture values for them.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {categoryAttributes.map((filter) => (
                <ReviewField
                  key={filter.id}
                  label={filter.label}
                  value="Not captured yet"
                />
              ))}
            </div>
          </section>
        ) : (
          <EmptyState
            icon={<Tag className="h-6 w-6" />}
            title="No category-aware attributes configured"
            description={`"${submission.category}" has no attribute set defined yet. Configure one in features/catalog/data/category-filters.ts.`}
          />
        ),
    },
    {
      id: "media",
      label: "Media",
      content:
        submission.images.length > 0 ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {submission.images.map((url, index) => (
                <div
                  key={url}
                  className="relative aspect-square overflow-hidden rounded-xl bg-slate-50"
                >
                  <Image
                    src={url}
                    alt={`${submission.productName} — ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 200px"
                    className="object-contain p-2"
                  />
                </div>
              ))}
            </div>
          </section>
        ) : (
          <EmptyState
            icon={<ImageOff className="h-6 w-6" />}
            title="No media submitted"
          />
        ),
    },
    {
      id: "pricing",
      label: "Pricing",
      content: (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <ReviewField label="Price" value={formatSAR(submission.price)} />
            <ReviewField label="Pricing mode" value={submission.pricingMode} />
            <ReviewField
              label="Discount"
              value={`${submission.discountPercentage}%`}
            />
          </div>
        </section>
      ),
    },
    {
      id: "inventory",
      label: "Inventory",
      content: (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-3">
            <ReviewField label="Stock" value={String(submission.stock)} />
            <ReviewField label="Method" value={submission.shippingMethod} />
            <ReviewField
              label="Estimated delivery"
              value={submission.estimatedDelivery}
            />
            <ReviewField
              label="Free shipping"
              value={submission.freeShipping ? "Yes" : "No"}
            />
          </div>
        </section>
      ),
    },
    {
      id: "variants",
      label: "Variants",
      content:
        submission.variants.length === 0 ? (
          <EmptyState
            icon={<Layers className="h-6 w-6" />}
            title="No variants submitted"
          />
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100 text-start">
                    <th className="px-3 py-3 text-[10px] font-black uppercase tracking-wide text-slate-400">
                      Option
                    </th>
                    <th className="px-3 py-3 text-[10px] font-black uppercase tracking-wide text-slate-400">
                      Value
                    </th>
                    <th className="px-3 py-3 text-[10px] font-black uppercase tracking-wide text-slate-400">
                      SKU
                    </th>
                    <th className="px-3 py-3 text-[10px] font-black uppercase tracking-wide text-slate-400">
                      Price
                    </th>
                    <th className="px-3 py-3 text-[10px] font-black uppercase tracking-wide text-slate-400">
                      Stock
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submission.variants.map((variant) => (
                    <tr key={variant.id}>
                      <td className="px-3 py-3 text-sm font-bold text-slate-800">
                        {variant.optionName}
                      </td>
                      <td className="px-3 py-3 text-sm font-bold text-[#2563EB]">
                        {variant.optionValue}
                      </td>
                      <td className="px-3 py-3 text-xs font-mono text-slate-400">
                        {variant.sku}
                      </td>
                      <td className="px-3 py-3 text-sm font-black text-slate-800">
                        {formatSAR(variant.price)}
                      </td>
                      <td className="px-3 py-3 text-sm font-black text-slate-800">
                        {variant.stock}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ),
    },
    {
      id: "seo",
      label: "SEO",
      content: (
        <EmptyState
          icon={<Tag className="h-6 w-6" />}
          title="SEO fields not modeled yet"
          description="ProductSubmission has no meta title/description/slug fields yet — this is a real gap, not a display bug."
        />
      ),
    },
    {
      id: "publishing",
      label: "Publishing",
      content: (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <ReviewField
              label="Status"
              value={submission.status.replace("_", " ")}
            />
            <ReviewField
              label="Submitted at"
              value={submission.submittedAt ?? "—"}
            />
            <ReviewField
              label="Reviewed at"
              value={submission.reviewedAt ?? "—"}
            />
            <ReviewField
              label="Version"
              value={String(submission.version)}
            />
          </div>
        </section>
      ),
    },
  ];

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">

            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 text-xs font-black text-[#2563EB]"
            >
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              Product moderation
            </Link>

            <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

              <div>

                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-500">
                  Administrator review
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-tight text-[#0F172A]">
                  {
                    submission.productName
                  }
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Submission{" "}
                  {submission.id}
                </p>

              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black text-[#2563EB]">
                {submission.status.replace(
                  "_",
                  " ",
                )}
              </span>

            </div>

          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">

          {actionDone && (
            <div
              role="status"
              className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-bold text-emerald-700"
            >
              <CheckCircle2 className="h-5 w-5" />
              {actionDone}
            </div>
          )}

          <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_380px]">

            <Tabs
              ariaLabel="Product workspace sections"
              items={workspaceTabs}
            />

            {/* Decision panel */}
            <aside className="h-fit space-y-5 xl:sticky xl:top-24">

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-sm font-black text-slate-900">
                      Admin decision
                    </h2>

                    <p className="mt-1 text-[11px] text-slate-400">
                      This controls customer publication.
                    </p>
                  </div>

                </div>

                <label
                  htmlFor="admin-note"
                  className="mt-5 block text-xs font-black text-slate-600"
                >
                  Review note
                </label>

                <textarea
                  id="admin-note"
                  value={note}
                  onChange={(
                    event,
                  ) =>
                    setNote(
                      event
                        .target
                        .value,
                    )
                  }
                  rows={5}
                  placeholder="Optional for approval, required for rejection or changes..."
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm leading-6 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={
                    handleApprove
                  }
                  disabled={
                    submission.status ===
                    "PUBLISHED"
                  }
                  className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-xs font-black text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Check className="h-4 w-4" />
                  Approve & publish
                </button>

                <button
                  type="button"
                  onClick={
                    handleChanges
                  }
                  disabled={
                    !note.trim()
                  }
                  className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 text-xs font-black text-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                  Request changes
                </button>

                <button
                  type="button"
                  onClick={
                    handleReject
                  }
                  disabled={
                    !note.trim()
                  }
                  className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-xs font-black text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <X className="h-4 w-4" />
                  Reject submission
                </button>

              </section>

              <section className="rounded-2xl bg-[#0F2747] p-5 text-white">

                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-200/60">
                  Publication rule
                </p>

                <p className="mt-3 text-sm font-bold leading-6">
                  Changes never reach the customer page directly.
                </p>

                <p className="mt-2 text-xs leading-5 text-blue-100/60">
                  Only the administrator can approve and publish the submitted
                  version.
                </p>

              </section>

            </aside>

          </div>
        </div>
      </main>
    </AdminShell>
  );
}

function ReviewField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold leading-6 text-slate-800">
        {value}
      </p>

    </div>
  );
}
