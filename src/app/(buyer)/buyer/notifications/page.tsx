"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  CheckCircle2,
  LogIn,
  Trash2,
} from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { useSession } from "@/features/auth/session";
import {
  deleteNotification,
  getMyNotifications,
  markNotificationAsRead,
} from "@/features/notifications/services/notification-api.service";
import { useNotificationStore } from "@/stores/notification-store";

export default function NotificationsPage() {
  const session = useSession();
  const notifications = useNotificationStore((state) => state.notifications);
  const replaceNotifications = useNotificationStore(
    (state) => state.replaceNotifications,
  );
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const removeNotification = useNotificationStore(
    (state) => state.removeNotification,
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session.status !== "authenticated") {
      return;
    }

    let active = true;

    void getMyNotifications()
      .then((items) => {
        if (!active) return;

        replaceNotifications(
          items.map((item) => ({
            id: String(item.id),
            customerId: String(item.userId),
            type: "SYSTEM" as const,
            title: item.title,
            message: item.message,
            createdAt: item.createdAt,
            read: item.isRead,
          })),
        );
      })
      .catch((caughtError) => {
        if (!active) return;
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "تعذر تحميل الإشعارات.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [replaceNotifications, session.status]);

  const markRead = async (id: string) => {
    setError("");

    try {
      await markNotificationAsRead(id);
      markAsRead(id);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "تعذر تحديث الإشعار.",
      );
    }
  };

  const remove = async (id: string) => {
    setError("");

    try {
      await deleteNotification(id);
      removeNotification(id);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "تعذر حذف الإشعار.",
      );
    }
  };

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <AccountWorkspace
      activeTab="notifications"
      title="الإشعارات"
      description="تابع تحديثات الحساب والطلبات والتنبيهات المهمة من مكان واحد."
    >
      {session.status === "loading" ? (
        <section className="rounded-2xl border border-neutral-200 bg-surface p-8 shadow-raised" aria-busy="true">
          <div className="animate-pulse space-y-4">
            <div className="h-5 w-36 rounded bg-neutral-100" />
            <div className="h-3 w-64 rounded bg-neutral-100" />
            <div className="h-20 rounded-2xl bg-neutral-100" />
            <div className="h-20 rounded-2xl bg-neutral-100" />
          </div>
        </section>
      ) : session.status !== "authenticated" ? (
        <section className="rounded-2xl border border-neutral-200 bg-surface p-8 text-center shadow-raised sm:p-10">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-brand">
            <LogIn className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-h3 font-bold text-foreground">
            سجّل الدخول لعرض إشعاراتك
          </h2>
          <p className="mx-auto mt-2 max-w-md text-body-sm leading-6 text-muted-foreground">
            الإشعارات مرتبطة بحسابك ولا يتم عرض بيانات تجريبية للزائر.
          </p>
          <Link
            href="/login?next=/buyer/notifications"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-brand px-6 text-body-sm font-bold text-white transition-all duration-200 ease-brand hover:-translate-y-0.5 hover:bg-brand-hover"
          >
            تسجيل الدخول
          </Link>
        </section>
      ) : (
        <div className="space-y-5">
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-danger-100 bg-danger-surface px-4 py-3 text-body-sm font-bold text-danger-700"
            >
              {error}
            </div>
          )}

          <section className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-surface p-5 shadow-raised sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-brand">
                <Bell className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-label font-bold uppercase tracking-wide text-brand">
                  مركز التنبيهات
                </p>
                <h2 className="mt-1 text-h4 font-bold text-foreground">
                  {notifications.length === 0
                    ? "لا توجد تحديثات"
                    : unreadCount > 0
                      ? "لديك " + unreadCount + " إشعارات غير مقروءة"
                      : "كل الإشعارات مقروءة"}
                </h2>
              </div>
            </div>
            <span className="w-fit rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-caption font-bold text-muted-foreground">
              {notifications.length} إجمالي
            </span>
          </section>

          <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-surface shadow-raised">
            {loading ? (
              <div className="space-y-3 p-5 sm:p-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-20 animate-pulse rounded-xl bg-neutral-100" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center sm:p-14">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
                  <Bell className="h-6 w-6" aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-h3 font-bold text-foreground">
                  لا توجد إشعارات
                </h2>
                <p className="mx-auto mt-2 max-w-md text-body-sm leading-6 text-muted-foreground">
                  ستظهر هنا تحديثات الحساب والطلبات عندما ينشئها النظام.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <article
                  key={notification.id}
                  className={
                    "border-b border-neutral-100 p-5 last:border-0 sm:p-6 " +
                    (notification.read
                      ? "bg-surface"
                      : "bg-primary-50/50")
                  }
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <span
                      className={
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm " +
                        (notification.read
                          ? "bg-neutral-100 text-neutral-500"
                          : "bg-surface text-brand")
                      }
                    >
                      <Bell className="h-4 w-4" aria-hidden="true" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-body-sm font-bold text-foreground">
                          {notification.title}
                        </h2>
                        {!notification.read && (
                          <span className="rounded-full bg-brand px-2 py-1 text-[9px] font-bold leading-none text-white">
                            جديد
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-body-sm leading-6 text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-caption text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString("ar-PS", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      {!notification.read && (
                        <button
                          type="button"
                          onClick={() => void markRead(notification.id)}
                          aria-label="تحديد الإشعار كمقروء"
                          title="تحديد كمقروء"
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-brand transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
                        >
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => void remove(notification.id)}
                        aria-label="حذف الإشعار"
                        title="حذف الإشعار"
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-400 transition-colors hover:bg-danger-surface hover:text-danger-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-danger-100"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        </div>
      )}
    </AccountWorkspace>
  );
}
