"use client";

import { create } from "zustand";

import type {
  FinanceSummary,
  SettlementStatus,
  Transaction,
} from "@/features/store-finance/types/store-finance.types";

interface StoreFinanceState {
  transactions: Transaction[];

  getSummary: () => FinanceSummary;

  updateStatus: (
    transactionId: string,
    status: SettlementStatus,
  ) => void;
}

export const useStoreFinanceStore =
  create<StoreFinanceState>(
    (set, get) => ({
      transactions: [
        {
          id: "TX-10001",
          orderId: "AS-2026-10482",

          grossAmount: 208.99,
          fulfillmentCost: 160,
          processingFee: 0,
          adjustmentAmount: 0,

          netAmount: 160,
          profitAmount: 48.99,

          currency: "SAR",

          status: "AVAILABLE",

          createdAt:
            "2026-08-15T10:30:00.000Z",

          availableAt:
            "2026-08-16T10:30:00.000Z",

          note:
            "Customer payment captured. Fulfillment cost reserved and store markup recorded as profit.",
        },

        {
          id: "TX-10002",
          orderId: "AS-2026-10451",

          grossAmount: 389,
          fulfillmentCost: 300,
          processingFee: 0,
          adjustmentAmount: 0,

          netAmount: 300,
          profitAmount: 89,

          currency: "SAR",

          status: "PENDING",

          createdAt:
            "2026-08-12T10:30:00.000Z",

          availableAt:
            "2026-08-19T10:30:00.000Z",

          note:
            "Funds pending order completion.",
        },

        {
          id: "TX-10003",
          orderId: "AS-2026-10398",

          grossAmount: 119,
          fulfillmentCost: 90,
          processingFee: 0,
          adjustmentAmount: 0,

          netAmount: 90,
          profitAmount: 29,

          currency: "SAR",

          status: "PAID",

          createdAt:
            "2026-07-29T10:30:00.000Z",

          availableAt:
            "2026-08-01T10:30:00.000Z",

          paidAt:
            "2026-08-05T11:00:00.000Z",

          note:
            "Settlement paid out.",
        },
      ],

      getSummary: () => {
        return get().transactions.reduce(
          (summary, transaction) => {
            summary.grossSales +=
              transaction.grossAmount;

            summary.fulfillmentCosts +=
              transaction.fulfillmentCost;

            summary.processingFees +=
              transaction.processingFee;

            summary.adjustments +=
              transaction.adjustmentAmount;

            summary.profit +=
              transaction.profitAmount;

            summary.netRevenue +=
              transaction.netAmount;

            if (
              transaction.status ===
              "PENDING"
            ) {
              summary.pending +=
                transaction.netAmount;
            }

            if (
              transaction.status ===
              "AVAILABLE"
            ) {
              summary.available +=
                transaction.netAmount;
            }

            if (
              transaction.status ===
              "PAID"
            ) {
              summary.paid +=
                transaction.netAmount;
            }

            return summary;
          },
          {
            grossSales: 0,
            fulfillmentCosts: 0,
            processingFees: 0,
            adjustments: 0,
            profit: 0,

            pending: 0,
            available: 0,
            paid: 0,

            netRevenue: 0,
          },
        );
      },

      updateStatus: (
        transactionId,
        status,
      ) => {
        set((state) => ({
          transactions:
            state.transactions.map(
              (transaction) =>
                transaction.id ===
                transactionId
                  ? {
                      ...transaction,

                      status,

                      paidAt:
                        status ===
                        "PAID"
                          ? new Date().toISOString()
                          : transaction.paidAt,
                    }
                  : transaction,
            ),
        }));
      },
    }),
  );
