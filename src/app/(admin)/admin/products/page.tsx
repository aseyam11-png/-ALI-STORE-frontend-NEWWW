"use client";

import Link from "next/link";
import {
  ArrowRight,
  Package,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";

import { AdminShell } from "@/components/layout/AdminShell";
import { formatSAR } from "@/features/localization/services/currency.service";

import {
  useProductModerationStore,
} from "@/stores/product-moderation-store";

function statusClass(
  status: string,
) {
  switch (status) {
    case "PUBLISHED":
      return "bg-emerald-50 text-emerald-700";

    case "PENDING_REVIEW":
      return "bg-blue-50 text-blue-700";

    case "CHANGES_REQUESTED":
      return "bg-amber-50 text-amber-700";

    case "REJECTED":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function AdminProductsPage() {
  const submissions =
    useProductModerationStore(
      (state) =>
        state.submissions,
    );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState(
    "PENDING_REVIEW",
  );

  const filtered =
    useMemo(
      () =>
        submissions.filter(
          (submission) => {
            const matchesStatus =
              status ===
                "ALL" ||
              submission.status ===
                status;

            const text = [
              submission.id,
              submission.productName,
              submission.sku,
            ]
              .join(" ")
              .toLowerCase();

            const matchesSearch =
              !search.trim() ||
              text.includes(
                search
                  .trim()
                  .toLowerCase(),
              );

            return (
              matchesStatus &&
              matchesSearch
            );
          },
        ),
      [
        submissions,
        search,
        status,
      ],
    );

  const pendingCount =
    submissions.filter(
      (item) =>
        item.status ===
        "PENDING_REVIEW",
    ).length;

  const changesCount =
    submissions.filter(
      (item) =>
        item.status ===
        "CHANGES_REQUESTED",
    ).length;

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">

            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-500">
              Administration
            </p>

            <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

              <div>
                <h1 className="text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl">
                  Product moderation
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Review products before they become visible to customers.
                </p>
              </div>

              <div className="flex gap-2">

                <div className="rounded-xl bg-blue-50 px-4 py-3">
                  <p className="text-[10px] font-black text-[#2563EB]">
                    Pending
                  </p>

                  <p className="mt-1 text-xl font-black text-slate-900">
                    {
                      pendingCount
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-amber-50 px-4 py-3">
                  <p className="text-[10px] font-black text-amber-700">
                    Changes
                  </p>

                  <p className="mt-1 text-xl font-black text-slate-900">
                    {
                      changesCount
                    }
                  </p>
                </div>

              </div>

            </div>

          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">

          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex h-11 max-w-xl flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3">
              <Search className="h-4 w-4 text-slate-400" />

              <input
                value={
                  search
                }
                onChange={(
                  event,
                ) =>
                  setSearch(
                    event
                      .target
                      .value,
                  )
                }
                placeholder="Search product or SKU..."
                aria-label="Search product submissions"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </div>

            <label
              htmlFor="moderation-status"
              className="sr-only"
            >
              Submission status
            </label>

            <select
              id="moderation-status"
              value={
                status
              }
              onChange={(
                event,
              ) =>
                setStatus(
                  event
                    .target
                    .value,
                )
              }
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none"
            >
              <option value="PENDING_REVIEW">
                Pending review
              </option>

              <option value="CHANGES_REQUESTED">
                Changes requested
              </option>

              <option value="PUBLISHED">
                Published
              </option>

              <option value="REJECTED">
                Rejected
              </option>

              <option value="ALL">
                All
              </option>
            </select>

          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 bg-slate-50/70 p-5">

              <div className="flex items-center gap-3">

                <ShieldCheck className="h-5 w-5 text-[#2563EB]" />

                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Product submissions
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Only approved submissions become customer-facing products.
                  </p>
                </div>

              </div>

            </div>

            <div className="divide-y divide-slate-100">

              {filtered.length ===
              0 ? (
                <div className="p-12 text-center">

                  <Package className="mx-auto h-8 w-8 text-slate-300" />

                  <h2 className="mt-4 text-xl font-black text-slate-900">
                    No submissions found
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    There are no products matching this review queue.
                  </p>

                </div>
              ) : (
                filtered.map(
                  (
                    submission,
                  ) => (
                    <Link
                      key={
                        submission.id
                      }
                      href={`/admin/products/${submission.id}`}
                      className="block p-5 transition hover:bg-slate-50"
                    >

                      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                        <div className="flex min-w-0 items-start gap-4">

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                            <Package className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="text-sm font-black text-slate-900">
                                {
                                  submission.productName
                                }
                              </h3>

                              <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-black ${statusClass(
                                  submission.status,
                                )}`}
                              >
                                {submission.status.replace(
                                  "_",
                                  " ",
                                )}
                              </span>

                            </div>

                            <p className="mt-1 text-[10px] font-mono text-slate-400">
                              {submission.sku} · Version{" "}
                              {
                                submission.version
                              }
                            </p>

                          </div>

                        </div>

                        <div className="flex items-center justify-between gap-6 xl:justify-end">

                          <div className="text-right">

                            <p className="text-lg font-black text-[#0F2747]">
                              {formatSAR(submission.price)}
                            </p>

                            <p className="mt-1 text-[10px] text-slate-400">
                              Stock{" "}
                              {
                                submission.stock
                              }
                            </p>

                          </div>

                          <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-black text-slate-700">
                            Review
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>

                        </div>

                      </div>

                    </Link>
                  ),
                )
              )}

            </div>

          </section>

        </div>
      </main>
    </AdminShell>
  );
}