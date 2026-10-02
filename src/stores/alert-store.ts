"use client";

import { create } from "zustand";

export type AlertType =
  | "PRICE_DROP"
  | "BACK_IN_STOCK"
  | "ORDER_UPDATE"
  | "PROMOTION";

export interface ProductAlert {
  id: string;

  type: AlertType;

  title: string;
  message: string;

  productId?: string;

  createdAt: string;

  read: boolean;
}

interface AlertState {
  alerts: ProductAlert[];

  addAlert: (
    alert: Omit<
      ProductAlert,
      "id" | "createdAt" | "read"
    >,
  ) => void;

  markRead: (
    alertId: string,
  ) => void;

  markAllRead: () => void;

  unreadCount: () => number;

  clearAll: () => void;
}

export const useAlertStore =
  create<AlertState>(
    (set, get) => ({
      alerts: [
        {
          id: "alert-001",
          type: "PRICE_DROP",
          title: "Price dropped",
          message:
            "A product in your wishlist is now available at a lower price.",
          productId: "p-001",
          createdAt:
            new Date().toISOString(),
          read: false,
        },
        {
          id: "alert-002",
          type: "ORDER_UPDATE",
          title: "Order update",
          message:
            "Your shipment has been handed to the carrier.",
          createdAt:
            new Date().toISOString(),
          read: false,
        },
      ],

      addAlert: (alert) => {
        set((state) => ({
          alerts: [
            {
              ...alert,
              id: `alert-${Date.now()}`,
              createdAt:
                new Date().toISOString(),
              read: false,
            },
            ...state.alerts,
          ],
        }));
      },

      markRead: (alertId) => {
        set((state) => ({
          alerts: state.alerts.map(
            (alert) =>
              alert.id ===
              alertId
                ? {
                    ...alert,
                    read: true,
                  }
                : alert,
          ),
        }));
      },

      markAllRead: () => {
        set((state) => ({
          alerts: state.alerts.map(
            (alert) => ({
              ...alert,
              read: true,
            }),
          ),
        }));
      },

      unreadCount: () =>
        get().alerts.filter(
          (alert) =>
            !alert.read,
        ).length,

      clearAll: () => {
        set({ alerts: [] });
      },
    }),
  );