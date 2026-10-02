"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  MessageSquareText,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

import { AdminShell } from "@/components/layout/AdminShell";

import {
  useReviewModerationStore,
} from "@/stores/review-moderation-store";

function statusClass(
  status: string,
) {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-50 text-emerald-700";

    case "PENDING":
      return "bg-amber-50 text-amber-700";

    case "REJECTED":
      return "bg-red-50 text-red-700";

    case "HIDDEN":
      return "bg-slate-100 text-slate-600";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function AdminReviewsPage() {
  const reviews =
    useReviewModerationStore(
      (state) =>
        state.reviews,
    );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState("PENDING");

  const filtered =
    useMemo(
      () =>
        reviews.filter(
          (review) => {
            const matchesStatus =
              status === "ALL" ||
              review.status ===
                status;

            const text = [
              review.id,
              review.productName,
              review.customerName,
              review.title,
              review.body,
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
        reviews,
        search,
        status,
      ],
    );

  const pending =
    reviews.filter(
      (review) =>
        review.status ===
        "PENDING",
    ).length;

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">

        <section className="border-b border-slate-200 bg-white">

          <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">

            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-500">
              Administration
            </p>

            <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <h1 className="text-3xl font-black tracking-tight text-[#0F172A]">
                  Review moderation
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Approve customer reviews before they are displayed on the
                  public product page.
                </p>

              </div>

              <div className="rounded-xl bg-amber-50 px-4 py-3">

                <p className="text-[10px] font-black uppercase tracking-wide text-amber-700">
                  Pending reviews
                </p>

                <p className="mt-1 text-2xl font-black text-slate-900">
                  {pending}
                </p>

              </div>

            </div>

          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 lg:px-8">

          <div className="mb-5 flex flex-col gap-3 lg:flex-row">

            <div className="flex h-11 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3">

              <Search className="h-4 w-4 text-slate-400" />

              <input
                value={
                  search
                }
                onChange={(
                  event,
                ) =>
                  setSearch(
                    event.target
                      .value,
                  )
                }
                placeholder="Search review, customer or product..."
                aria-label="Search reviews"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />

            </div>

            <select
              value={
                status
              }
              onChange={(
                event,
              ) =>
                setStatus(
                  event.target
                    .value,
                )
              }
              aria-label="Review status"
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none"
            >
              <option value="PENDING">
                Pending
              </option>

              <option value="APPROVED">
                Approved
              </option>

              <option value="REJECTED">
                Rejected
              </option>

              <option value="HIDDEN">
                Hidden
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
                    Customer reviews
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Only approved reviews are public.
                  </p>

                </div>

              </div>

            </div>

            <div className="divide-y divide-slate-100">

              {filtered.map(
                (review) => (
                  <Link
                    key={
                      review.id
                    }
                    href={`/admin/reviews/${review.id}`}
                    className="block p-5 transition hover:bg-slate-50"
                  >

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="text-sm font-black text-slate-900">
                            {
                              review.title
                            }
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[9px] font-black ${statusClass(
                              review.status,
                            )}`}
                          >
                            {
                              review.status
                            }
                          </span>

                          {review.verifiedPurchase && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-black text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" />
                              Verified
                            </span>
                          )}

                        </div>

                        <p className="mt-1 text-xs text-slate-400">
                          {
                            review.productName
                          }{" "}
                          ·{" "}
                          {
                            review.customerName
                          }
                        </p>

                        <div className="mt-2 flex items-center gap-1">

                          {[
                            1,
                            2,
                            3,
                            4,
                            5,
                          ].map(
                            (star) => (
                              <Star
                                key={
                                  star
                                }
                                className={`h-3.5 w-3.5 ${
                                  star <=
                                  review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-200"
                                }`}
                              />
                            ),
                          )}

                        </div>

                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                          {
                            review.body
                          }
                        </p>

                      </div>

                      <div className="flex shrink-0 items-center gap-2">

                        <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-black text-slate-700">
                          Review
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>

                      </div>

                    </div>

                  </Link>
                ),
              )}

              {filtered.length ===
                0 && (
                <div className="p-12 text-center">

                  <MessageSquareText className="mx-auto h-8 w-8 text-slate-300" />

                  <p className="mt-4 text-sm font-bold text-slate-600">
                    No reviews found.
                  </p>

                </div>
              )}

            </div>

          </section>

        </div>
      </main>
    </AdminShell>
  );
}