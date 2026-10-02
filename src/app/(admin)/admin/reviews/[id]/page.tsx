"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  MessageSquareText,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import {
  useState,
} from "react";

import { AdminShell } from "@/components/layout/AdminShell";

import {
  useReviewModerationStore,
} from "@/stores/review-moderation-store";

export default function AdminReviewDetailsPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const reviewId =
    params?.id ??
    "REV-1004";

  const review =
    useReviewModerationStore(
      (state) =>
        state.reviews.find(
          (item) =>
            item.id ===
            reviewId,
        ),
    );

  const approveReview =
    useReviewModerationStore(
      (state) =>
        state.approveReview,
    );

  const rejectReview =
    useReviewModerationStore(
      (state) =>
        state.rejectReview,
    );

  const hideReview =
    useReviewModerationStore(
      (state) =>
        state.hideReview,
    );

  const [
    note,
    setNote,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  if (!review) {
    return (
      <AdminShell>
        <main className="min-h-screen bg-[#F8FAFC]">
          <div className="mx-auto max-w-4xl px-4 py-12 text-center">

            <MessageSquareText className="mx-auto h-8 w-8 text-slate-300" />

            <h1 className="mt-4 text-2xl font-black text-slate-900">
              Review not found
            </h1>

            <Link
              href="/admin/reviews"
              className="mt-6 inline-flex h-11 items-center rounded-xl bg-[#2563EB] px-5 text-sm font-black text-white"
            >
              Back to reviews
            </Link>

          </div>
        </main>
      </AdminShell>
    );
  }

  const approve =
    () => {
      approveReview(
        review.id,
        note ||
          "Review approved by administrator.",
      );

      setMessage(
        "Review approved and is now eligible for public display.",
      );
    };

  const reject =
    () => {
      if (!note.trim()) {
        return;
      }

      rejectReview(
        review.id,
        note.trim(),
      );

      setMessage(
        "Review rejected.",
      );
    };

  const hide =
    () => {
      if (!note.trim()) {
        return;
      }

      hideReview(
        review.id,
        note.trim(),
      );

      setMessage(
        "Review hidden from public display.",
      );
    };

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">

        <section className="border-b border-slate-200 bg-white">

          <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6 lg:px-8">

            <Link
              href="/admin/reviews"
              className="inline-flex items-center gap-2 text-xs font-black text-[#2563EB]"
            >
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              Review moderation
            </Link>

            <div className="mt-5 flex items-end justify-between gap-4">

              <div>

                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-500">
                  Administrator review
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-tight text-[#0F172A]">
                  Customer review
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  {
                    review.productName
                  }
                </p>

              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black text-slate-600">
                {
                  review.status
                }
              </span>

            </div>

          </div>
        </section>

        <div className="mx-auto max-w-[1000px] px-4 py-7 sm:px-6 lg:px-8">

          {message && (
            <div
              role="status"
              className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700"
            >
              <CheckCircle2 className="h-5 w-5" />
              {message}
            </div>
          )}

          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <div className="flex items-center gap-2">

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
                          className={`h-5 w-5 ${
                            star <=
                            review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200"
                          }`}
                        />
                      ),
                    )}

                  </div>

                  <h2 className="mt-4 text-xl font-black text-slate-900">
                    {
                      review.title
                    }
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {
                      review.body
                    }
                  </p>

                </div>

                {review.verifiedPurchase && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[9px] font-black text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified purchase
                  </span>
                )}

              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">

                <Info
                  label="Customer"
                  value={
                    review.customerName
                  }
                />

                <Info
                  label="Product"
                  value={
                    review.productName
                  }
                />

                <Info
                  label="Helpful votes"
                  value={String(
                    review.helpfulCount,
                  )}
                />

              </div>

            </section>

            <aside className="space-y-5">

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-black text-slate-900">
                      Moderation decision
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      Only approved reviews are public.
                    </p>
                  </div>

                </div>

                <label
                  htmlFor="review-admin-note"
                  className="mt-5 block text-xs font-black text-slate-600"
                >
                  Admin note
                </label>

                <textarea
                  id="review-admin-note"
                  value={
                    note
                  }
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
                  placeholder="Required for rejection or hiding..."
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm leading-6 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={
                    approve
                  }
                  className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-xs font-black text-white hover:bg-emerald-700"
                >
                  <Check className="h-4 w-4" />
                  Approve review
                </button>

                <button
                  type="button"
                  disabled={
                    !note.trim()
                  }
                  onClick={
                    hide
                  }
                  className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 text-xs font-black text-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Hide review
                </button>

                <button
                  type="button"
                  disabled={
                    !note.trim()
                  }
                  onClick={
                    reject
                  }
                  className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-xs font-black text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <X className="h-4 w-4" />
                  Reject review
                </button>

              </section>

            </aside>

          </div>
        </div>
      </main>
    </AdminShell>
  );
}

function Info({
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

      <p className="mt-1 text-sm font-bold text-slate-800">
        {value}
      </p>

    </div>
  );
}