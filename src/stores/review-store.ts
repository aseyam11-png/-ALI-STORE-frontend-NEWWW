"use client";

import { create } from "zustand";

import type {
  ProductReview,
  ReviewSummary,
} from "@/features/reviews/types/review.types";

interface ReviewState {
  reviews: ProductReview[];

  addReview: (
    review: Omit<
      ProductReview,
      "id" | "createdAt" | "helpfulCount"
    >,
  ) => void;

  markHelpful: (
    reviewId: string,
  ) => void;

  getProductReviews: (
    productId: string,
  ) => ProductReview[];

  getSummary: (
    productId: string,
  ) => ReviewSummary;
}

export const useReviewStore =
  create<ReviewState>(
    (set, get) => ({
      reviews: [
        {
          id: "REV-1001",
          productId: "p-001",
          customerId:
            "customer-001",
          customerName:
            "Customer",
          rating: 5,
          title:
            "Excellent headphones",
          body:
            "Very comfortable and the sound quality is excellent.",
          verifiedPurchase: true,
          helpfulCount: 18,
          createdAt:
            "2026-08-10T10:00:00.000Z",
        },
        {
          id: "REV-1002",
          productId: "p-001",
          customerId:
            "customer-002",
          customerName:
            "Customer",
          rating: 4,
          title:
            "Very good value",
          body:
            "Good noise cancellation and strong battery life.",
          verifiedPurchase: true,
          helpfulCount: 11,
          createdAt:
            "2026-08-07T12:00:00.000Z",
        },
        {
          id: "REV-1003",
          productId: "p-001",
          customerId:
            "customer-003",
          customerName:
            "Customer",
          rating: 5,
          title:
            "Highly recommended",
          body:
            "The product arrived quickly and matched the description.",
          verifiedPurchase: true,
          helpfulCount: 7,
          createdAt:
            "2026-08-02T08:30:00.000Z",
        },
      ],

      addReview: (
        review,
      ) => {
        set((state) => ({
          reviews: [
            {
              ...review,
              id:
                `REV-${Date.now()}`,
              createdAt:
                new Date().toISOString(),
              helpfulCount: 0,
            },
            ...state.reviews,
          ],
        }));
      },

      markHelpful: (
        reviewId,
      ) => {
        set((state) => ({
          reviews:
            state.reviews.map(
              (review) =>
                review.id ===
                reviewId
                  ? {
                      ...review,
                      helpfulCount:
                        review.helpfulCount +
                        1,
                    }
                  : review,
            ),
        }));
      },

      getProductReviews: (
        productId,
      ) =>
        get().reviews.filter(
          (review) =>
            review.productId ===
            productId,
        ),

      getSummary: (
        productId,
      ) => {
        const reviews =
          get().reviews.filter(
            (review) =>
              review.productId ===
              productId,
          );

        const total =
          reviews.length;

        if (!total) {
          return {
            average: 0,
            total: 0,
            distribution: [
              5, 4, 3, 2, 1,
            ].map(
              (rating) => ({
                rating:
                  rating as
                    | 1
                    | 2
                    | 3
                    | 4
                    | 5,
                count: 0,
                percentage: 0,
              }),
            ),
          };
        }

        const average =
          reviews.reduce(
            (sum, review) =>
              sum +
              review.rating,
            0,
          ) / total;

        return {
          average:
            Math.round(
              average * 10,
            ) / 10,

          total,

          distribution:
            [5, 4, 3, 2, 1].map(
              (rating) => {
                const count =
                  reviews.filter(
                    (review) =>
                      review.rating ===
                      rating,
                  ).length;

                return {
                  rating:
                    rating as
                      | 1
                      | 2
                      | 3
                      | 4
                      | 5,

                  count,

                  percentage:
                    Math.round(
                      (count /
                        total) *
                        100,
                    ),
                };
              },
            ),
        };
      },
    }),
  );