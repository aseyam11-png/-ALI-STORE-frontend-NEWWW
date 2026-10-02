"use client";

import {
  CheckCircle2,
  ThumbsUp,
} from "lucide-react";
import {
  useState,
} from "react";

import {
  useReviewModerationStore,
} from "@/stores/review-moderation-store";

import { StarRating } from "./StarRating";
import { ReviewSummary } from "./ReviewSummary";

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({
  productId,
}: ProductReviewsProps) {
  const reviews =
    useReviewModerationStore(
      (state) =>
        state.getProductReviews(
          productId,
        ),
    );

  const addReview =
    useReviewModerationStore(
      (state) =>
        state.addReview,
    );

  const markHelpful =
    useReviewModerationStore(
      (state) =>
        state.markHelpful,
    );

  const [
    rating,
    setRating,
  ] = useState(5);

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    body,
    setBody,
  ] = useState("");

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const submitReview = () => {
    if (
      !title.trim() ||
      !body.trim()
    ) {
      return;
    }

    addReview({
      productId,
      customerId:
        "customer-001",
      customerName:
        "Customer",
      rating,
      title:
        title.trim(),
      body:
        body.trim(),
      verifiedPurchase:
        true,
      productName:
        "Product",
    });

    setTitle("");
    setBody("");
    setRating(5);
    setSubmitted(true);

    window.setTimeout(
      () =>
        setSubmitted(
          false,
        ),
      2000,
    );
  };

  return (
    <section className="mt-8">

      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#2563EB]">
          Customer feedback
        </p>

        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
          Reviews & ratings
        </h2>

      </div>

      <div className="mt-5">
        <ReviewSummary
          productId={
            productId
          }
        />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div>
            <h3 className="text-lg font-black text-slate-900">
              Write a review
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Share your experience with other customers.
            </p>
          </div>

          {submitted && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              Review submitted — waiting for moderation
            </div>
          )}

        </div>

        <div className="mt-5">

          <p className="text-xs font-black text-slate-600">
            Your rating
          </p>

          <div className="mt-2">
            <StarRating
              value={rating}
              size="lg"
              interactive
              onChange={
                setRating
              }
            />
          </div>

        </div>

        <div className="mt-5 grid gap-4">

          <div>
            <label
              htmlFor="review-title"
              className="text-xs font-black text-slate-600"
            >
              Review title
            </label>

            <input
              id="review-title"
              value={title}
              onChange={(
                event,
              ) =>
                setTitle(
                  event.target
                    .value,
                )
              }
              placeholder="Summarize your experience"
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="review-body"
              className="text-xs font-black text-slate-600"
            >
              Your review
            </label>

            <textarea
              id="review-body"
              rows={5}
              value={body}
              onChange={(
                event,
              ) =>
                setBody(
                  event.target
                    .value,
                )
              }
              placeholder="What did you like or dislike?"
              className="mt-2 w-full resize-y rounded-xl border border-slate-200 p-3 text-sm leading-6 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100"
            />
          </div>

        </div>

        <button
          type="button"
          onClick={
            submitReview
          }
          disabled={
            !title.trim() ||
            !body.trim()
          }
          className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#2563EB] px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Submit review
        </button>

      </div>

      <div className="mt-6 space-y-4">

        {reviews.map(
          (review) => (
            <article
              key={
                review.id
              }
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                <div>

                  <div className="flex items-center gap-3">

                    <p className="text-sm font-black text-slate-900">
                      {
                        review.customerName
                      }
                    </p>

                    {review.verifiedPurchase && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-black text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified purchase
                      </span>
                    )}

                  </div>

                  <div className="mt-2">
                    <StarRating
                      value={
                        review.rating
                      }
                      size="sm"
                    />
                  </div>

                </div>

                <span className="text-[10px] text-slate-400">
                  {new Date(
                    review.createdAt,
                  ).toLocaleDateString(
                    "en-US",
                    {
                      year:
                        "numeric",
                      month:
                        "short",
                      day:
                        "numeric",
                    },
                  )}
                </span>

              </div>

              <h3 className="mt-4 text-sm font-black text-slate-900">
                {
                  review.title
                }
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {
                  review.body
                }
              </p>

              <button
                type="button"
                onClick={() =>
                  markHelpful(
                    review.id,
                  )
                }
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-black text-slate-500 hover:bg-slate-50"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                Helpful (
                {
                  review.helpfulCount
                }
                )
              </button>

            </article>
          ),
        )}

      </div>

    </section>
  );
}

