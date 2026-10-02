import { MessageSquare, Star } from "lucide-react";

interface ProductReviewsProps {
  rating: number;
  reviews: number;
}

// The previous version rendered a hardcoded 78/15/5/1/1 star-percentage
// bar chart for every product regardless of its real rating or review
// count, directly above a note admitting no real reviews exist yet — a
// fabricated-data UI. Nothing in the data model tracks a real per-star
// breakdown, so this version shows only the real rating/review count and
// an honest state instead of inventing one.
export function ProductReviews({
  rating,
  reviews,
}: ProductReviewsProps) {
  const normalizedRating = Math.min(
    5,
    Math.max(0, rating),
  );

  const hasReviews = reviews > 0;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-surface p-6 sm:p-8">

      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning-surface text-warning-700">
          <MessageSquare className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-black text-foreground">
            Customer reviews
          </h2>

          <p className="mt-1 text-sm text-neutral-400">
            Ratings and feedback from buyers
          </p>
        </div>
      </div>

      <div className="mt-7 flex flex-col items-center gap-6 sm:flex-row">

        <div className="flex flex-col items-center justify-center rounded-2xl bg-neutral-50 px-8 py-6">
          <span className="text-5xl font-black text-foreground">
            {normalizedRating.toFixed(1)}
          </span>

          <div className="mt-3 flex items-center gap-1">
            {Array.from({ length: 5 }).map(
              (_, index) => (
                <Star
                  key={index}
                  className={`h-4 w-4 ${
                    index <
                    Math.round(
                      normalizedRating,
                    )
                      ? "fill-warning-500 text-warning-500"
                      : "text-neutral-300"
                  }`}
                />
              ),
            )}
          </div>

          <span className="mt-2 text-xs font-semibold text-neutral-400">
            {reviews.toLocaleString()}{" "}
            {reviews === 1 ? "review" : "reviews"}
          </span>
        </div>

        <div className="flex-1 rounded-xl border border-dashed border-neutral-200 p-5">
          <p className="text-sm font-bold text-neutral-800">
            {hasReviews
              ? "Review breakdown"
              : "No reviews yet"}
          </p>

          <p className="mt-1 text-sm leading-6 text-text-muted">
            {hasReviews
              ? "A detailed rating breakdown will appear here as more customers review this product."
              : "Be the first to review this product after your order."}
          </p>
        </div>

      </div>

    </section>
  );
}
