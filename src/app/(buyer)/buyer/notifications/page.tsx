"use client";

import type { Route } from "next";
import Link from "next/link";
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

import {
  useNotificationStore,
} from "@/stores/notification-store";

function getIcon(
  type: string,
) {
  switch (type) {
    case "PRICE_DROP":
      return Tag;

    case "BACK_IN_STOCK":
      return Zap;

    case "SHIPMENT_UPDATE":
      return Truck;

    case "SUPPORT_MESSAGE":
      return MessageCircle;

    case "PROMOTION":
      return Zap;

    default:
      return Bell;
  }
}

export default function NotificationsPage() {
  const notifications =
    useNotificationStore(
      (state) =>
        state.notifications,
    );

  const markAsRead =
    useNotificationStore(
      (state) =>
        state.markAsRead,
    );

  const removeNotification =
    useNotificationStore(
      (state) =>
        state.removeNotification,
    );

  const markAllAsRead =
    useNotificationStore(
      (state) =>
        state.markAllAsRead,
    );

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
                  Order, shipping, wishlist and promotional updates.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  markAllAsRead
                }
                className="text-xs font-black text-[#2563EB] hover:underline"
              >
                Mark all as read
              </button>

            </div>

          </div>
        </section>

        <div className="mx-auto max-w-[1000px] px-4 py-7 sm:px-6 lg:px-8">

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {notifications.length ===
            0 ? (
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
                      notification.type,
                    );

                  return (
                    <div
                      key={
                        notification.id
                      }
                      className={`border-b border-slate-100 p-5 ${
                        notification.read
                          ? "bg-white"
                          : "bg-blue-50/40"
                      }`}
                    >

                      <div className="flex gap-4">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#2563EB] shadow-sm">
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">

                          {notification.href ? (
                            <Link
                              href={notification.href as Route}
                              onClick={() =>
                                markAsRead(
                                  notification.id,
                                )
                              }
                              className="block"
                            >
                              <p className="text-sm font-black text-slate-900">
                                {
                                  notification.title
                                }
                              </p>

                              <p className="mt-1 text-sm leading-6 text-slate-500">
                                {
                                  notification.message
                                }
                              </p>
                            </Link>
                          ) : (
                            <>
                              <p className="text-sm font-black text-slate-900">
                                {
                                  notification.title
                                }
                              </p>

                              <p className="mt-1 text-sm leading-6 text-slate-500">
                                {
                                  notification.message
                                }
                              </p>
                            </>
                          )}

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

                          {!notification.read && (
                            <button
                              type="button"
                              onClick={() =>
                                markAsRead(
                                  notification.id,
                                )
                              }
                              aria-label="Mark as read"
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#2563EB] hover:bg-white"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              removeNotification(
                                notification.id,
                              )
                            }
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

        </div>
      </main>
    </AppShell>
  );
}