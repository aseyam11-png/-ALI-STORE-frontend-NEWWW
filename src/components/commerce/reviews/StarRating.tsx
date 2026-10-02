"use client";

import {
  Star,
} from "lucide-react";

interface StarRatingProps {
  value: number;

  size?: "sm" | "md" | "lg";

  interactive?: boolean;

  onChange?: (
    value: number,
  ) => void;
}

export function StarRating({
  value,
  size = "md",
  interactive = false,
  onChange,
}: StarRatingProps) {
  const sizeClass =
    size === "sm"
      ? "h-3.5 w-3.5"
      : size === "lg"
        ? "h-6 w-6"
        : "h-4.5 w-4.5";

  return (
    <div
      className="flex items-center gap-0.5"
      role={
        interactive
          ? "radiogroup"
          : undefined
      }
      aria-label={`Rating ${value} out of 5`}
    >
      {[1, 2, 3, 4, 5].map(
        (star) => {
          const filled =
            star <= value;

          if (
            interactive
          ) {
            return (
              <button
                key={star}
                type="button"
                onClick={() =>
                  onChange?.(
                    star,
                  )
                }
                aria-label={`Rate ${star} out of 5`}
                className="rounded-sm p-0.5 transition hover:scale-110"
              >
                <Star
                  className={`${sizeClass} ${
                    filled
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300"
                  }`}
                />
              </button>
            );
          }

          return (
            <Star
              key={star}
              className={`${sizeClass} ${
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-300"
              }`}
            />
          );
        },
      )}
    </div>
  );
}