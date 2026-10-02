"use client";

import { create } from "zustand";

import type {
  ProductSubmission,
  ProductSubmissionStatus,
} from "@/features/product-moderation/types/product-moderation.types";

interface ProductModerationState {
  submissions: ProductSubmission[];

  submitForReview: (
    id: string,
  ) => void;

  approveSubmission: (
    id: string,
    note?: string,
  ) => void;

  rejectSubmission: (
    id: string,
    note: string,
  ) => void;

  requestChanges: (
    id: string,
    note: string,
  ) => void;

  getSubmission: (
    id: string,
  ) =>
    | ProductSubmission
    | undefined;

  getByStatus: (
    status: ProductSubmissionStatus,
  ) => ProductSubmission[];
}

export const useProductModerationStore =
  create<ProductModerationState>(
    (set, get) => ({
      submissions: [
        {
          id: "SUB-1001",
          productId: "p-001",

          productName:
            "Wireless Noise Cancelling Headphones",

          brand: "NovaTech",

          category:
            "Electronics",

          subcategory:
            "Audio",

          description:
            "Premium wireless headphones with active noise cancellation.",

          sku:
            "NOVA-HC-001",

          supplierPrice: 70,
          sellingPrice: 89.99,
          pricingMode: "AUTOMATIC",
          pricingRuleId: "RULE-001",
          price: 89.99,
          stock: 18,

          discountPercentage: 10,

          images: [],

          variants: [
            {
              id: "SUB-V-1",
              optionName: "Color",
              optionValue: "Black",
              sku: "NOVA-HC-BLK",
              supplierPrice: 70,
              sellingPrice: 89.99,
              pricingMode: "AUTOMATIC",
              price: 89.99,
              stock: 12,
            },
            {
              id: "SUB-V-2",
              optionName: "Color",
              optionValue: "White",
              sku: "NOVA-HC-WHT",
              supplierPrice: 70,
              sellingPrice: 91.99,
              pricingMode: "AUTOMATIC",
              price: 91.99,
              stock: 6,
            },
          ],

          shippingMethod:
            "Standard shipping",

          estimatedDelivery:
            "3ط£آ¢أ¢â€ڑآ¬أ¢â‚¬إ“7 business days",

          freeShipping: true,

          status:
            "PENDING_REVIEW",

          submittedAt:
            "2026-08-15T09:30:00.000Z",

          version: 2,
        },

        {
          id: "SUB-1002",

          productName:
            "Smart LED Home Starter Kit",

          brand: "SmartHome",

          category:
            "Home & Garden",

          description:
            "Smart lighting starter kit for modern homes.",

          sku:
            "HOME-KIT-002",

          supplierPrice: 100,
          sellingPrice: 129.99,
          pricingMode: "AUTOMATIC",
          pricingRuleId: "RULE-002",
          price: 129.99,
          stock: 25,

          discountPercentage: 0,

          images: [],

          variants: [],

          shippingMethod:
            "Express shipping",

          estimatedDelivery:
            "2ط£آ¢أ¢â€ڑآ¬أ¢â‚¬إ“4 business days",

          freeShipping: false,

          status:
            "CHANGES_REQUESTED",

          submittedAt:
            "2026-08-14T15:20:00.000Z",

          reviewedAt:
            "2026-08-14T16:10:00.000Z",

          adminNote:
            "Please provide clearer product images and specify the included items.",

          version: 1,
        },
      ],

      syncAutomaticPrice: (
        id: string,
        supplierPrice: number,
        ruleType: "FIXED" | "PERCENTAGE",
        ruleValue: number,
        pricingRuleId?: string,
      ) => {
        set((state) => ({
          submissions:
            state.submissions.map(
              (submission) => {
                if (
                  submission.id !== id ||
                  submission.pricingMode !==
                    "AUTOMATIC"
                ) {
                  return submission;
                }

                const sellingPrice =
                  ruleType === "FIXED"
                    ? Math.max(
                        0,
                        supplierPrice +
                          ruleValue,
                      )
                    : Math.max(
                        0,
                        supplierPrice *
                          (1 +
                            ruleValue / 100),
                      );

                return {
                  ...submission,
                  supplierPrice,
                  sellingPrice,
                  price: sellingPrice,
                  pricingRuleId,
                };
              },
            ),
        }));
      },

      updateSupplierPrice: (
        id: string,
        supplierPrice: number,
      ) => {
        set((state) => ({
          submissions:
            state.submissions.map(
              (submission) => {
                if (
                  submission.id !== id
                ) {
                  return submission;
                }

                return {
                  ...submission,
                  supplierPrice,
                };
              },
            ),
        }));
      },

      submitForReview: (
        id,
      ) => {
        set((state) => ({
          submissions:
            state.submissions.map(
              (submission) =>
                submission.id ===
                id
                  ? {
                      ...submission,
                      status:
                        "PENDING_REVIEW",
                      submittedAt:
                        new Date().toISOString(),
                      reviewedAt:
                        undefined,
                      adminNote:
                        undefined,
                    }
                  : submission,
            ),
        }));
      },

      approveSubmission: (
        id,
        note,
      ) => {
        set((state) => ({
          submissions:
            state.submissions.map(
              (submission) =>
                submission.id ===
                id
                  ? {
                      ...submission,
                      /*
                      Only the administrator can transition
                      a submission to PUBLISHED.
                    */
                    status:
                        "PUBLISHED",
                      reviewedAt:
                        new Date().toISOString(),
                      adminNote:
                        note ??
                        "Approved by administrator.",
                    }
                  : submission,
            ),
        }));
      },

      rejectSubmission: (
        id,
        note,
      ) => {
        set((state) => ({
          submissions:
            state.submissions.map(
              (submission) =>
                submission.id ===
                id
                  ? {
                      ...submission,
                      status:
                        "REJECTED",
                      reviewedAt:
                        new Date().toISOString(),
                      adminNote:
                        note,
                    }
                  : submission,
            ),
        }));
      },

      requestChanges: (
        id,
        note,
      ) => {
        set((state) => ({
          submissions:
            state.submissions.map(
              (submission) =>
                submission.id ===
                id
                  ? {
                      ...submission,
                      status:
                        "CHANGES_REQUESTED",
                      reviewedAt:
                        new Date().toISOString(),
                      adminNote:
                        note,
                    }
                  : submission,
            ),
        }));
      },

      getSubmission: (
        id,
      ) =>
        get().submissions.find(
          (submission) =>
            submission.id === id,
        ),

      getByStatus: (
        status,
      ) =>
        get().submissions.filter(
          (submission) =>
            submission.status ===
            status,
        ),
    }),
  );







