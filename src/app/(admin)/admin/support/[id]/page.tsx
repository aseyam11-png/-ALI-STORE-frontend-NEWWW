"use client";

import { use } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight, Send } from "lucide-react";
import { useState } from "react";

import { AdminShell } from "@/components/layout/AdminShell";
import {
  getAdminConversation,
  sendAdminMessage,
  updateSupportStatus,
  type SupportStatus,
} from "@/features/support/services/support-api.service";

const statuses: SupportStatus[] = [
  "OPEN",
  "PENDING",
  "RESOLVED",
  "CLOSED",
];

export default function AdminSupportConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");

  const query = useQuery({
    queryKey: ["admin-support-conversation", id],
    queryFn: () => getAdminConversation(id),
    refetchInterval: 10_000,
  });

  const messageMutation = useMutation({
    mutationFn: () => sendAdminMessage(id, message.trim()),
    onSuccess: async () => {
      setMessage("");
      await queryClient.invalidateQueries({
        queryKey: ["admin-support-conversation", id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["admin-support-conversations"],
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status: SupportStatus) =>
      updateSupportStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-support-conversation", id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["admin-support-conversations"],
      });
    },
  });

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/admin/support"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#2563EB]"
          >
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            العودة للدعم
          </Link>

          {query.isLoading ? (
            <div className="mt-6 h-[600px] animate-pulse rounded-2xl bg-slate-100" />
          ) : query.isError || !query.data ? (
            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-sm text-red-700">
              تعذر تحميل المحادثة.
            </div>
          ) : (
            <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <header className="border-b border-slate-200 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs text-slate-400">
                      {query.data.customerName}
                    </p>
                    <h1 className="mt-1 text-xl font-black text-slate-900">
                      {query.data.subject}
                    </h1>
                  </div>

                  <select
                    value={query.data.status}
                    onChange={(e) =>
                      statusMutation.mutate(e.target.value as SupportStatus)
                    }
                    disabled={statusMutation.isPending}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </header>

              <div className="h-[520px] space-y-4 overflow-y-auto p-5">
                {query.data.messages.map((item) => {
                  const mine = item.senderRole === "ADMIN";
                  return (
                    <div
                      key={item.id}
                      className={
                        mine ? "flex justify-end" : "flex justify-start"
                      }
                    >
                      <div
                        className={
                          "max-w-[85%] rounded-2xl px-4 py-3 " +
                          (mine
                            ? "bg-[#2563EB] text-white"
                            : "bg-slate-100 text-slate-900")
                        }
                      >
                        <p className="text-[10px] font-bold opacity-70">
                          {item.senderName}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6">
                          {item.body}
                        </p>
                        <p className="mt-2 text-[10px] opacity-60">
                          {new Date(item.createdAt).toLocaleString("ar")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-200 p-4">
                {messageMutation.isError && (
                  <p className="mb-3 text-xs font-medium text-red-700">
                    تعذر إرسال الرسالة.
                  </p>
                )}
                <div className="flex gap-2">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={2}
                    placeholder="اكتب رد الدعم..."
                    className="min-h-11 flex-1 resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#2563EB]"
                  />
                  <button
                    type="button"
                    onClick={() => messageMutation.mutate()}
                    disabled={!message.trim() || messageMutation.isPending}
                    className="flex h-11 items-center gap-2 self-end rounded-xl bg-[#2563EB] px-5 text-sm font-bold text-white disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    إرسال
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </AdminShell>
  );
}
