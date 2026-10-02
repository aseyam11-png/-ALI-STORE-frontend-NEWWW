"use client";

import { create } from "zustand";

import type {
  ModeratedReview,
  ReviewModerationStatus,
} from "@/features/reviews/types/review-moderation.types";

interface ReviewModerationState {
  reviews: ModeratedReview[];

  addReview: (
    review: Omit<
      ModeratedReview,
      "id" | "createdAt" | "helpfulCount" | "status" | "productName"
    > & {
      productName?: string;
    },
  ) => void;

  markHelpful: (
    reviewId: string,
  ) => void;

  approveReview: (
    reviewId: string,
    note?: string,
  ) => void;

  rejectReview: (
    reviewId: string,
    note: string,
  ) => void;

  hideReview: (
    reviewId: string,
    note: string,
  ) => void;

  setStatus: (
    reviewId: string,
    status: ReviewModerationStatus,
    note?: string,
  ) => void;

  getByStatus: (
    status: ReviewModerationStatus,
  ) => ModeratedReview[];

  getAll: () => ModeratedReview[];

  getProductReviews: (
    productId: string,
  ) => ModeratedReview[];
}

export const useReviewModerationStore =
  create<ReviewModerationState>(
    (set, get) => ({
      reviews: [
        {
          id: "REV-1001",
          productId: "p-001",
          productName:
            "Wireless Noise Cancelling Headphones",
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
          status:
            "APPROVED",
          createdAt:
            "2026-08-10T10:00:00.000Z",
        },
        {
          id: "REV-1002",
          productId: "p-001",
          productName:
            "Wireless Noise Cancelling Headphones",
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
          status:
            "APPROVED",
          createdAt:
            "2026-08-07T12:00:00.000Z",
        },
        {
          id: "REV-1003",
          productId: "p-001",
          productName:
            "Wireless Noise Cancelling Headphones",
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
          status:
            "APPROVED",
          createdAt:
            "2026-08-02T08:30:00.000Z",
        },
        {
          id: "REV-1004",
          productId: "p-001",
          productName:
            "Wireless Noise Cancelling Headphones",
          customerId:
            "customer-004",
          customerName:
            "Customer",
          rating: 1,
          title:
            "Please review this",
          body:
            "This review is waiting for administrator moderation.",
          verifiedPurchase: false,
          helpfulCount: 0,
          status:
            "PENDING",
          createdAt:
            "2026-08-15T13:10:00.000Z",
        },
      ],

      addReview: (review) => {
        set((state) => ({
          reviews: [
            {
              ...review,
              id: `REV-${Date.now()}`,
              productName:
                review.productName ??
                "Product",
              createdAt:
                new Date().toISOString(),
              helpfulCount: 0,
              status: "PENDING",
            },
            ...state.reviews,
          ],
        }));
      },

      markHelpful: (reviewId) => {
        set((state) => ({
          reviews: state.reviews.map(
            (review) =>
              review.id === reviewId
                ? {
                    ...review,
                    helpfulCount:
                      review.helpfulCount + 1,
                  }
                : review,
          ),
        }));
      },

      approveReview: (
        reviewId,
        note,
      ) => {
        set((state) => ({
          reviews:
            state.reviews.map(
              (review) =>
                review.id ===
                reviewId
                  ? {
                      ...review,
                      status:
                        "APPROVED",
                      adminNote:
                        note ??
                        "Approved by administrator.",
                    }
                  : review,
            ),
        }));
      },

      rejectReview: (
        reviewId,
        note,
      ) => {
        set((state) => ({
          reviews:
            state.reviews.map(
              (review) =>
                review.id ===
                reviewId
                  ? {
                      ...review,
                      status:
                        "REJECTED",
                      adminNote:
                        note,
                    }
                  : review,
            ),
        }));
      },

      hideReview: (
        reviewId,
        note,
      ) => {
        set((state) => ({
          reviews:
            state.reviews.map(
              (review) =>
                review.id ===
                reviewId
                  ? {
                      ...review,
                      status:
                        "HIDDEN",
                      adminNote:
                        note,
                    }
                  : review,
            ),
        }));
      },

      setStatus: (
        reviewId,
        status,
        note,
      ) => {
        set((state) => ({
          reviews:
            state.reviews.map(
              (review) =>
                review.id ===
                reviewId
                  ? {
                      ...review,
                      status,
                      adminNote:
                        note ??
                        review.adminNote,
                    }
                  : review,
            ),
        }));
      },

      getByStatus: (
        status,
      ) =>
        get().reviews.filter(
          (review) =>
            review.status ===
            status,
        ),

      getAll: () =>
        get().reviews,

      getProductReviews: (
        productId,
      ) =>
        get().reviews.filter(
          (review) =>
            review.productId ===
              productId &&
            review.status ===
              "APPROVED",
        ),
    }),
  );
