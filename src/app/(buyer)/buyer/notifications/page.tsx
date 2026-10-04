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
  const notifications = useNotificationStore(
    (state) => state.notifications,
  );
  const replaceNotifications = useNotificationStore(
    (state) => state.replaceNotifications,
  );
  const markAsRead = useNotificationStore(
    (state) => state.markAsRead,
  );
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

  return (
    <AccountWorkspace
      activeTab="notifications"
      title="الإشعارات"
      description="تابع تحديثات الحساب والطلبات والتنبيهات المهمة من مكان واحد."
    >
          {session.status === "loading" ? (
            <section
              className="rounded-2xl border border-neutral-200 bg-surface p-10 text-center shadow-sm"
            >
              <Bell className="mx-auto h-9 w-9 text-neutral-300" />
              <h2 className="mt-4 text-h3 font-bold text-foreground">
                جارٍ التحقق من الجلسة...
              </h2>
            </section>
          ) : session.status !== "authenticated" ? (
            <section className="rounded-2xl border border-neutral-200 bg-surface p-10 text-center shadow-sm">
              <LogIn className="mx-auto h-9 w-9 text-neutral-300" />
              <h2 className="mt-4 text-h3 font-bold text-foreground">
                سجّل الدخول لعرض إشعاراتك
              </h2>
              <p className="mx-auto mt-2 max-w-md text-body-sm leading-6 text-muted-foreground">
                الإشعارات مرتبطة بحسابك ولا يتم عرض بيانات تجريبية للزائر.
              </p>
              <Link
                href="/login?next=/buyer/notifications"
                className="mt-6 inline-flex h-11 items-center rounded-md bg-brand px-6 text-body font-medium text-white hover:bg-brand-hover"
              >
                تسجيل الدخول
              </Link>
            </section>
          ) : (
            <>
              {error && (
                <div
                  role="alert"
                  className="mb-5 rounded-md border border-danger-100 bg-danger-surface px-4 py-3 text-body-sm font-medium text-danger-600"
                >
                  {error}
                </div>
              )}

              <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-surface shadow-sm">
                {loading ? (
                  <div className="space-y-4 p-8">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-20 animate-pulse rounded-xl bg-neutral-100"
                      />
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-14 text-center">
                    <Bell className="mx-auto h-9 w-9 text-neutral-300" />
                    <h2 className="mt-4 text-h3 font-bold text-foreground">
                      لا توجد إشعارات
                    </h2>
                    <p className="mt-2 text-body-sm text-muted-foreground">
                      ستظهر هنا تحديثات الحساب والطلبات عندما ينشئها النظام.
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <article
                      key={notification.id}
                      className={
                        "border-b border-neutral-100 p-5 last:border-0 " +
                        (notification.read
                          ? "bg-surface"
                          : "bg-primary-50/40")
                      }
                    >
                      <div className="flex items-start gap-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-brand shadow-sm">
                          <Bell className="h-4 w-4" />
                        </span>

                        <div className="min-w-0 flex-1">
                          <h2 className="text-body-sm font-bold text-foreground">
                            {notification.title}
                          </h2>
                          <p className="mt-1 text-body-sm leading-6 text-muted-foreground">
                            {notification.message}
                          </p>
                          <p className="mt-2 text-caption text-muted-foreground">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          {!notification.read && (
                            <button
                              type="button"
                              onClick={() => void markRead(notification.id)}
                              aria-label="تحديد كمقروء"
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-brand hover:bg-neutral-100"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => void remove(notification.id)}
                            aria-label="حذف الإشعار"
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:bg-danger-surface hover:text-danger-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </section>
            </>
          )}
    </AccountWorkspace>
  );
}
