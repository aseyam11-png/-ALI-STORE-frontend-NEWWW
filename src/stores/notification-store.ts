"use client";

import { create } from "zustand";

import type { CustomerNotification } from "@/features/notifications/types/notification.types";

interface NotificationState {
  notifications: CustomerNotification[];
  replaceNotifications: (
    notifications: CustomerNotification[],
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  unreadCount: () => number;
}

export const useNotificationStore =
  create<NotificationState>((set, get) => ({
    notifications: [],

    replaceNotifications: (notifications) => {
      set({ notifications });
    },

    markAsRead: (id) => {
      set((state) => ({
        notifications: state.notifications.map(
          (notification) =>
            notification.id === id
              ? { ...notification, read: true }
              : notification,
        ),
      }));
    },

    markAllAsRead: () => {
      set((state) => ({
        notifications: state.notifications.map(
          (notification) => ({
            ...notification,
            read: true,
          }),
        ),
      }));
    },

    removeNotification: (id) => {
      set((state) => ({
        notifications: state.notifications.filter(
          (notification) => notification.id !== id,
        ),
      }));
    },

    unreadCount: () =>
      get().notifications.filter(
        (notification) => !notification.read,
      ).length,
  }));
