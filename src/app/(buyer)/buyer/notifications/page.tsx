"use client";

import type { Route } from "next";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Clock3,
  MessageCircle,
  Tag,
  Trash2,
  Truck,
  Zap,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import type { BackendNotification } from "@/lib/api/contracts";
import {
  deleteNotification,
  getNotifications,
  markNotificationRead,
} from "@/features/notifications/services/notification.service";

function getIcon(
  title: string,
) {
  const value =
    title.toLowerCase();

  if (
    value.includes("price") ||
    value.includes("discount")
  ) {
    return Tag;
  }

  if (
    value.includes("shipment") ||
    value.includes("shipping") ||
    value.includes("order")
  ) {
    return Truck;
  }

  if (
    value.includes("support") ||
    value.includes("message")
  ) {
    return MessageCircle;
  }

  if (
    value.includes("stock") ||
    value.includes("available")
  ) {
    return Zap;
  }

  return Bell;
}

export default function NotificationsPage() {
  const [
    notifications,
    setNotifications,
  ] = useState<
    BackendNotification[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    let cancelled = false;

    void getNotifications()
      .then((result) => {
        if (!cancelled) {
          setNotifications(
            result,
          );
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load notifications.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const unreadCount =
    useMemo(
      () =>
        notifications.filter(
          (item) =>
            !item.isRead,
        ).length,
      [notifications],
    );

  const markRead = async (
    id: number,
  ) => {
    try {
      const updated =
        await markNotificationRead(
          String(id),
        );

      setNotifications(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              updated.id
                ? updated
                : item,
          ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update notification.",
      );
    }
  };

  const remove = async (
    id: number,
  ) => {
    try {
      await deleteNotification(
        String(id),
      );

      setNotifications(
        (current) =>
          current.filter(
            (item) =>
              item.id !== id,
          ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete notification.",
      );
    }
  };

  const markAllRead =
    async () => {
      const unread =
        notifications.filter(
          (item) =>
            !item.isRead,
        );

      for (const item of unread) {
        try {
          await markNotificationRead(
            String(item.id),
          );
        } catch {
          // Continue updating the remaining unread notifications.
        }
      }

      setNotifications(
        (current) =>
          current.map(
            (item) => ({
              ...item,
              isRead: true,
            }),
          ),
      );
    };

  return (
    <AppShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6 lg:px-8">
            <Link
              href="/buyer"
              className="inline-flex items-center gap-2 text-xs font-black text-[#2563EB]"
            >
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              Account
            </Link>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Bell className="h-6 w-6 text-[#2563EB]" />
                  <h1 className="text-3xl font-black tracking-tight text-[#0F172A]">
                    Notifications
                  </h1>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Order and fulfillment updates from AliStore.
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    void markAllRead();
                  }}
                  className="text-xs font-black text-[#2563EB] hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1000px] px-4 py-7 sm:px-6 lg:px-8">
          {loading ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-14 text-center">
              <p className="text-sm font-bold text-slate-500">
                Loading notifications…
              </p>
            </section>
          ) : error ? (
            <section className="rounded-2xl border border-danger-100 bg-danger-surface p-10 text-center">
              <Bell className="mx-auto h-9 w-9 text-danger-500" />
              <h2 className="mt-4 text-xl font-black text-danger-700">
                Unable to load notifications
              </h2>
              <p className="mt-2 text-sm text-danger-600">
                {error}
              </p>
            </section>
          ) : (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {notifications.length === 0 ? (
                <div className="p-14 text-center">
                  <Bell className="mx-auto h-9 w-9 text-slate-300" />
                  <p className="mt-4 text-lg font-black text-slate-800">
                    No notifications
                  </p>
                </div>
              ) : (
                notifications.map(
                  (notification) => {
                    const Icon =
                      getIcon(
                        notification.title,
                      );

                    return (
                      <div
                        key={
                          notification.id
                        }
                        className={`border-b border-slate-100 p-5 ${
                          notification.isRead
                            ? "bg-white"
                            : "bg-blue-50/40"
                        }`}
                      >
                        <div className="flex gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#2563EB] shadow-sm">
                            <Icon className="h-4 w-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-slate-900">
                              {notification.title}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                              {notification.message}
                            </p>

                            <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
                              <Clock3 className="h-3 w-3" />
                              {new Date(
                                notification.createdAt,
                              ).toLocaleString(
                                "en-US",
                              )}
                            </div>
                          </div>

                          <div className="flex shrink-0 gap-1">
                            {!notification.isRead && (
                              <button
                                type="button"
                                onClick={() => {
                                  void markRead(
                                    notification.id,
                                  );
                                }}
                                aria-label="Mark as read"
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#2563EB] hover:bg-white"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                void remove(
                                  notification.id,
                                );
                              }}
                              aria-label="Delete notification"
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  },
                )
              )}
            </section>
          )}
        </div>
      </main>
    </AppShell>
  );
}
