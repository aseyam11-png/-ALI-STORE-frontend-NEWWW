"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { useSession } from "@/features/auth/session";
import {
  addProductReview,
  getProductReviews,
  type BackendReview,
} from "@/features/reviews/services/review-api.service";

export function LiveProductReviews({
  productId,
  summary,
}: {
  productId: string;
  summary?: {
    rating: number;
    reviewCount: number;
    distribution: { one: number; two: number; three: number; four: number; five: number };
  };
}) {
  const session = useSession();
  const [reviews, setReviews] = useState<BackendReview[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setReviews(await getProductReviews(productId));
    } catch (error) {
      setError(error instanceof Error ? error.message : "تعذر تحميل التقييمات.");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    let active = true;
    getProductReviews(productId)
      .then((nextReviews) => {
        if (active) setReviews(nextReviews);
      })
      .catch((error) => {
        if (active) {
          setError(error instanceof Error ? error.message : "تعذر تحميل التقييمات.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [productId]);

  const average = useMemo(
    () =>
      reviews.length
        ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length
        : summary?.rating ?? 0,
    [reviews, summary],
  );

  const distribution = useMemo(() => {
    if (reviews.length > 0) {
      return [1, 2, 3, 4, 5].map((value) => ({
        rating: value,
        count: reviews.filter((review) => review.rating === value).length,
      }));
    }
    return [
      { rating: 1, count: summary?.distribution.one ?? 0 },
      { rating: 2, count: summary?.distribution.two ?? 0 },
      { rating: 3, count: summary?.distribution.three ?? 0 },
      { rating: 4, count: summary?.distribution.four ?? 0 },
      { rating: 5, count: summary?.distribution.five ?? 0 },
    ];
  }, [reviews, summary]);

  const distributionTotal = distribution.reduce((sum, item) => sum + item.count, 0);
  const displayedReviewCount = reviews.length || summary?.reviewCount || 0;

  const submit = async () => {
    if (saving || !comment.trim()) return;
    if (session.status !== "authenticated") {
      setError("سجّل الدخول لإرسال تقييم.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await addProductReview({
        productId,
        rating,
        comment: comment.trim(),
      });
      setComment("");
      setRating(5);
      await load();
    } catch (error) {
      setError(error instanceof Error ? error.message : "تعذر إرسال التقييم.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-neutral-200 bg-surface p-6 sm:p-8">
      <h2 className="text-xl font-black text-foreground">تقييمات العملاء</h2>
      <p className="mt-1 text-sm text-neutral-400">
        التقييمات المرتبطة بهذا المنتج من الخادم.
      </p>

      <div className="mt-6 flex flex-col gap-6 md:flex-row">
        <div className="rounded-2xl bg-neutral-50 p-6 text-center md:w-44">
          <div className="text-4xl font-black">{average.toFixed(1)}</div>
          <div
            className="mt-2 flex justify-center gap-1"
            aria-label={"متوسط " + average.toFixed(1) + " من 5"}
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={
                  "h-4 w-4 " +
                  (index < Math.round(average)
                    ? "fill-warning-500 text-warning-500"
                    : "text-neutral-300")
                }
              />
            ))}
          </div>
          <div className="mt-2 text-xs text-neutral-400">
            {displayedReviewCount} تقييم
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="rounded-xl border border-neutral-200 p-5">
            <p className="text-sm font-black text-neutral-800">توزيع التقييمات</p>
            <div className="mt-4 space-y-2.5">
              {[...distribution].reverse().map((item) => {
                const percentage =
                  distributionTotal > 0
                    ? Math.round((item.count / distributionTotal) * 100)
                    : 0;
                return (
                  <div key={item.rating} className="grid grid-cols-[28px_1fr_42px] items-center gap-3 text-xs">
                    <span className="font-bold text-neutral-500">{item.rating}</span>
                    <div
                      className="h-2 overflow-hidden rounded-full bg-neutral-100"
                      role="img"
                      aria-label={item.rating + " نجوم: " + item.count + " تقييم"}
                    >
                      <div className="h-full rounded-full bg-warning-500" style={{ width: percentage + "%" }} />
                    </div>
                    <span className="text-end text-neutral-400">{item.count}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-[11px] text-neutral-400">
              التوزيع مبني على التقييمات الفعلية من الخادم.
            </p>
          </div>
          {loading ? (
            <div className="rounded-xl bg-neutral-50 p-5 text-sm text-neutral-400">
              جارٍ تحميل التقييمات...
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-200 p-5 text-sm text-neutral-400">
              لا توجد تقييمات حتى الآن.
            </div>
          ) : (
            reviews.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-neutral-200 p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={
                          "h-4 w-4 " +
                          (index < item.rating
                            ? "fill-warning-500 text-warning-500"
                            : "text-neutral-300")
                        }
                      />
                    ))}
                  </div>
                  <time
                    dateTime={item.createdAt}
                    className="text-[10px] text-neutral-400"
                  >
                    {new Date(item.createdAt).toLocaleDateString("ar")}
                  </time>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-600">
                  {item.comment || "بدون تعليق نصي."}
                </p>
              </article>
            ))
          )}
        </div>
      </div>

      <div className="mt-7 rounded-2xl border border-neutral-200 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black">أضف تقييمك</h3>
            <p className="mt-1 text-xs text-neutral-400">
              التقييم مرتبط بحسابك الحالي.
            </p>
          </div>
          {session.status !== "authenticated" && (
            <Link
              href="/login"
              className="text-xs font-black text-brand hover:underline"
            >
              تسجيل الدخول
            </Link>
          )}
        </div>

        <div
          className="mt-4 flex gap-1"
          role="radiogroup"
          aria-label="تقييم المنتج"
        >
          {Array.from({ length: 5 }).map((_, index) => {
            const value = index + 1;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={value === rating}
                aria-label={value + " من 5"}
                onClick={() => setRating(value)}
                className="rounded-md p-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
              >
                <Star
                  className={
                    "h-5 w-5 " +
                    (value <= rating
                      ? "fill-warning-500 text-warning-500"
                      : "text-neutral-300")
                  }
                />
              </button>
            );
          })}
        </div>

        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="اكتب تجربتك مع المنتج..."
          className="mt-4 w-full rounded-xl border border-neutral-200 p-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-primary-100"
        />

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700"
          >
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => void submit()}
          disabled={
            saving ||
            session.status !== "authenticated" ||
            !comment.trim()
          }
          className="mt-4 h-11 rounded-xl bg-brand px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {saving ? "جارٍ الإرسال..." : "إرسال التقييم"}
        </button>
      </div>
    </section>
  );
}
