"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Trash2 } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import {
  deleteNotification,
  getMyNotifications,
  markNotificationAsRead,
  type BackendNotification,
} from "@/features/notifications/services/notification-api.service";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setNotifications(await getMyNotifications());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    getMyNotifications()
      .then((nextNotifications) => {
        if (active) setNotifications(nextNotifications);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Unable to load notifications.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function markRead(id: number) {
    try {
      const updated = await markNotificationAsRead(String(id));
      setNotifications((current) =>
        current.map((item) => (item.id === id ? updated : item)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update notification.");
    }
  }

  async function remove(id: number) {
    try {
      await deleteNotification(String(id));
      setNotifications((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete notification.");
    }
  }

  return (
    <AppShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-[#2563EB]" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#2563EB]">
                  Account
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-[#0F172A]">
                  Notifications
                </h1>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Live order and account notifications from ALI STORE.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1000px] px-4 py-7 sm:px-6 lg:px-8">
          {error && (
            <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-sm text-slate-500">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-14 text-center">
                <Bell className="mx-auto h-9 w-9 text-slate-300" />
                <p className="mt-4 text-lg font-black text-slate-800">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <article
                  key={notification.id}
                  className={`border-b border-slate-100 p-5 last:border-0 ${
                    notification.isRead ? "bg-white" : "bg-blue-50/40"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#2563EB] shadow-sm">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm font-black text-slate-900">{notification.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{notification.message}</p>
                      <p className="mt-2 text-[10px] text-slate-400">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {!notification.isRead && (
                        <button
                          type="button"
                          onClick={() => void markRead(notification.id)}
                          aria-label="Mark notification as read"
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#2563EB] hover:bg-white"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => void remove(notification.id)}
                        aria-label="Delete notification"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        </div>
      </main>
    </AppShell>
  );
}