"use client";

import type { Route } from "next";

import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Clock3,
  MessageCircle,
  Tag,
  Truck,
  Zap,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNotificationStore,
} from "@/stores/notification-store";
import {
  useLocalizationStore,
} from "@/stores/localization-store";
import {
  markNotificationAsRead,
} from "@/features/notifications/services/notification-api.service";
import { useSession } from "@/features/auth/session";

function notificationIcon(
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

    case "ORDER_UPDATE":
      return CheckCircle2;

    default:
      return Bell;
  }
}

export function NotificationBell() {
  const [
    open,
    setOpen,
  ] = useState(false);

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

  const markAllAsRead =
    useNotificationStore(
      (state) =>
        state.markAllAsRead,
    );

  const unreadCount =
    useNotificationStore(
      (state) =>
        state.unreadCount(),
    );

  const locale =
    useLocalizationStore(
      (state) =>
        state.locale,
    );
  const session = useSession();

  const containerRef =
    useRef<HTMLDivElement>(
      null,
    );

  useEffect(() => {
    const handleOutside = (
      event: MouseEvent,
    ) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutside,
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleOutside,
      );
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
    >

      <button
        type="button"
        disabled={session.status !== "authenticated"}
        onClick={() =>
          setOpen(
            (value) =>
              !value,
          )
        }
        aria-label="Notifications"
        aria-expanded={
          open
        }
        className="relative rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-[#2563EB]"
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white">
            {unreadCount >
            9
              ? "9+"
              : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute start-0 top-[calc(100%+10px)] z-[100] w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">

            <div>
              <p className="text-sm font-black text-slate-900">
                Notifications
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                {unreadCount} unread
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={
                  markAllAsRead
                }
                className="text-[10px] font-black text-[#2563EB] hover:underline"
              >
                Mark all read
              </button>
            )}

          </div>

          <div className="max-h-[430px] overflow-y-auto">

            {notifications.length ===
            0 ? (
              <div className="p-10 text-center">

                <Bell className="mx-auto h-7 w-7 text-slate-300" />

                <p className="mt-3 text-sm font-bold text-slate-600">
                  No notifications
                </p>

              </div>
            ) : (
              notifications
                .slice(
                  0,
                  8,
                )
                .map(
                  (
                    notification,
                  ) => {
                    const Icon =
                      notificationIcon(
                        notification.type,
                      );

                    return (
                      <div
                        key={
                          notification.id
                        }
                        className={`border-b border-slate-100 p-4 ${
                          notification.read
                            ? "bg-white"
                            : "bg-blue-50/50"
                        }`}
                      >

                        <div className="flex gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#2563EB] shadow-sm">
                            <Icon className="h-4 w-4" />
                          </div>

                          <div className="min-w-0 flex-1">

                            {notification.href ? (
                              <Link
                                href={notification.href as Route}
                                onClick={() => {
                                  if (
                                    session.status === "authenticated"
                                  ) {
                                    void markNotificationAsRead(
                                      notification.id,
                                    )
                                      .then(() =>
                                        markAsRead(notification.id),
                                      )
                                      .catch(() => undefined);
                                  }
                                  setOpen(false);
                                }}
                              >
                                <p className="text-xs font-black text-slate-900">
                                  {
                                    notification.title
                                  }
                                </p>

                                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                                  {
                                    notification.message
                                  }
                                </p>
                              </Link>
                            ) : (
                              <>
                                <p className="text-xs font-black text-slate-900">
                                  {
                                    notification.title
                                  }
                                </p>

                                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                                  {
                                    notification.message
                                  }
                                </p>
                              </>
                            )}

                            <div className="mt-2 flex items-center gap-2 text-[9px] text-slate-400">

                              <Clock3 className="h-3 w-3" />

                              {new Date(
                                notification.createdAt,
                              ).toLocaleString(
                                locale === "ar"
                                  ? "ar-SA"
                                  : "en-US",
                              )}

                            </div>

                          </div>

                          {!notification.read && (
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  session.status !== "authenticated"
                                ) {
                                  return;
                                }

                                void markNotificationAsRead(
                                  notification.id,
                                )
                                  .then(() =>
                                    markAsRead(notification.id),
                                  )
                                  .catch(() => undefined);
                              }}
                              aria-label="Mark notification as read"
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#2563EB] hover:bg-white"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </button>
                          )}

                        </div>

                      </div>
                    );
                  },
                )
            )}

          </div>

          <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-3">

            <Link
              href="/buyer/notifications"
              onClick={() =>
                setOpen(false)
              }
              className="flex items-center justify-center text-xs font-black text-[#2563EB]"
            >
              View all notifications
            </Link>

          </div>

        </div>
      )}

    </div>
  );
}