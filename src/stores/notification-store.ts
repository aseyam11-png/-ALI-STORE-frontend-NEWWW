"use client";

import { create } from "zustand";

import type {
  CustomerNotification,
} from "@/features/notifications/types/notification.types";

interface NotificationState {
  notifications: CustomerNotification[];

  addNotification: (
    notification: Omit<
      CustomerNotification,
      "id" | "createdAt" | "read"
    >,
  ) => void;

  markAsRead: (
    id: string,
  ) => void;

  markAllAsRead: () => void;

  removeNotification: (
    id: string,
  ) => void;

  unreadCount: () => number;
}

export const useNotificationStore =
  create<NotificationState>(
    (set, get) => ({
      notifications: [
        {
          id: "NOTIF-1001",

          customerId:
            "customer-001",

          type:
            "SHIPMENT_UPDATE",

          title:
            "Your shipment is in transit",

          message:
            "Your NovaTech shipment has been handed to the carrier and is now in transit.",

          href:
            "/buyer/orders/AS-2026-10482",

          createdAt:
            "2026-08-15T14:30:00.000Z",

          read: false,
        },

        {
          id: "NOTIF-1002",

          customerId:
            "customer-001",

          type:
            "PRICE_DROP",

          title:
            "Price dropped",

          message:
            "A product from your wishlist is now available at a lower price.",

          href:
            "/buyer/wishlist",

          createdAt:
            "2026-08-15T12:00:00.000Z",

          read: false,
        },

        {
          id: "NOTIF-1003",

          customerId:
            "customer-001",

          type:
            "SUPPORT_MESSAGE",

          title:
            "New support message",

          message:
            "NovaTech Store replied to your order support conversation.",

          href:
            "/buyer/support/CHAT-1001",

          createdAt:
            "2026-08-15T11:12:00.000Z",

          read: false,
        },

        {
          id: "NOTIF-1004",

          customerId:
            "customer-001",

          type:
            "PROMOTION",

          title:
            "Free shipping unlocked",

          message:
            "Your cart qualifies for free shipping.",

          href:
            "/shop/cart",

          createdAt:
            "2026-08-15T09:30:00.000Z",

          read: true,
        },
      ],

      addNotification: (
        notification,
      ) => {
        set((state) => ({
          notifications: [
            {
              ...notification,

              id:
                `NOTIF-${Date.now()}`,

              createdAt:
                new Date().toISOString(),

              read: false,
            },

            ...state.notifications,
          ],
        }));
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications:
            state.notifications.map(
              (notification) =>
                notification.id ===
                id
                  ? {
                      ...notification,
                      read: true,
                    }
                  : notification,
            ),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications:
            state.notifications.map(
              (notification) => ({
                ...notification,
                read: true,
              }),
            ),
        }));
      },

      removeNotification: (
        id,
      ) => {
        set((state) => ({
          notifications:
            state.notifications.filter(
              (notification) =>
                notification.id !==
                id,
            ),
        }));
      },

      unreadCount: () =>
        get().notifications.filter(
          (notification) =>
            !notification.read,
        ).length,
    }),
  );