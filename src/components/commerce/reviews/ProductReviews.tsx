"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, MessageSquare } from "lucide-react";

import { getProductReviews, addProductReview, type BackendReview } from "@/features/reviews/services/review-api.service";
import { StarRating } from "./StarRating";

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<BackendReview[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getProductReviews(productId)
      .then((data) => {
        if (active) setReviews(data);
      })
      .catch((caughtError: unknown) => {
        if (active) setError(caughtError instanceof Error ? caughtError.message : "تعذر تحميل المراجعات.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [productId]);

  const average = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length;
  }, [reviews]);

  const distribution = useMemo(() => {
    return [5, 4, 3, 2, 1].map((value) => {
      const count = reviews.filter((review) => review.rating === value).length;
      return { value, count };
    });
  }, [reviews]);

  const submitReview = async () => {
    if (!comment.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const created = await addProductReview({
        productId,
        rating,
        comment,
      });

      setReviews((current) => [created, ...current]);
      setComment("");
      setRating(5);
      setSubmitted(true);
      window.setTimeout(() => setSubmitted(false), 2500);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "تعذر إرسال المراجعة.",
      );
    } finally {
      setSubmitting(false);
    }
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

      <div className="mt-5 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-center">
            <p className="text-4xl font-black text-slate-900">
              {average.toFixed(1)}
            </p>
            <div className="mt-2 flex justify-center">
              <StarRating value={Math.round(average)} size="sm" />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {reviews.length} review{reviews.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="mt-5 space-y-2">
            {distribution.map((item) => (
              <div key={item.value} className="flex items-center gap-2 text-xs">
                <span className="w-7 font-bold text-slate-500">{item.value}★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{
                      width: reviews.length ? (item.count / reviews.length) * 100 + "%" : "0%",
                    }}
                  />
                </div>
                <span className="w-5 text-right text-slate-400">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Write a review</h3>
              <p className="mt-1 text-xs text-slate-400">
                Your review is stored in your account.
              </p>
            </div>
          </div>

          {submitted && (
            <div role="status" className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              تم إرسال المراجعة.
            </div>
          )}

          {error && (
            <div role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
              {error}
            </div>
          )}

          <div className="mt-5">
            <p className="text-xs font-black text-slate-600">Your rating</p>
            <div className="mt-2">
              <StarRating value={rating} size="lg" interactive onChange={setRating} />
            </div>
          </div>

          <label className="mt-5 block">
            <span className="text-xs font-black text-slate-600">Your review</span>
            <textarea
              rows={5}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="What did you like or dislike?"
              className="mt-2 w-full resize-y rounded-xl border border-slate-200 p-3 text-sm leading-6 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <button
            type="button"
            disabled={submitting || !comment.trim()}
            onClick={() => void submitReview()}
            className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#2563EB] px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting ? "جارٍ الإرسال..." : "Submit review"}
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            جارٍ تحميل المراجعات...
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            لا توجد مراجعات بعد.
          </div>
        ) : (
          reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <StarRating value={review.rating} size="sm" />
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(review.createdAt).toLocaleDateString("en-US")}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {review.comment || "—"}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
