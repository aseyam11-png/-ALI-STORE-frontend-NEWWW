"use client";

import {
  Star,
} from "lucide-react";

import {
  useReviewModerationStore,
} from "@/stores/review-moderation-store";

import { StarRating } from "./StarRating";

interface ReviewSummaryProps {
  productId: string;
}

export function ReviewSummary({
  productId,
}: ReviewSummaryProps) {
  const reviews =
    useReviewModerationStore(
      (state) =>
        state.getProductReviews(
          productId,
        ),
    );

  const total = reviews.length;

  const average =
    total > 0
      ? reviews.reduce(
          (sum, review) =>
            sum + review.rating,
          0,
        ) / total
      : 0;

  const summary = {
    average,
    total,
    distribution: [5, 4, 3, 2, 1].map(
      (rating) => {
        const count =
          reviews.filter(
            (review) =>
              review.rating === rating,
          ).length;

        return {
          rating,
          count,
          percentage:
            total > 0
              ? Math.round(
                  (count / total) * 100,
                )
              : 0,
        };
      },
    ),
  };

  if (
    summary.total ===
    0
  ) {
    return (
      <div className="rounded-xl bg-slate-50 p-4">
        <p className="text-sm font-black text-slate-800">
          No reviews yet
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Be the first customer to review this product.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      <div className="grid gap-6 sm:grid-cols-[170px_minmax(0,1fr)]">

        <div className="text-center sm:border-e sm:border-slate-100 sm:pe-6">

          <p className="text-4xl font-black text-[#0F2747]">
            {
              summary.average.toFixed(
                1,
              )
            }
          </p>

          <div className="mt-2 flex justify-center">
            <StarRating
              value={
                Math.round(
                  summary.average,
                )
              }
              size="md"
            />
          </div>

          <p className="mt-2 text-xs text-slate-400">
            Based on{" "}
            <span className="font-bold text-slate-600">
              {summary.total}
            </span>{" "}
            reviews
          </p>

        </div>

        <div className="space-y-2">

          {summary.distribution.map(
            (item) => (
              <div
                key={
                  item.rating
                }
                className="flex items-center gap-3"
              >

                <div className="flex w-10 items-center gap-1 text-xs font-bold text-slate-500">

                  <span>
                    {
                      item.rating
                    }
                  </span>

                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />

                </div>

                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-amber-400 transition-all"
                    style={{
                      width: `${item.percentage}%`,
                    }}
                  />

                </div>

                <span className="w-9 text-right text-[10px] font-bold text-slate-400">
                  {
                    item.count
                  }
                </span>

              </div>
            ),
          )}

        </div>

      </div>

    </div>
  );
}

