"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { LifeBuoy, MessageCircle } from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import { getAdminConversations } from "@/features/support/services/support-api.service";

const labels: Record<string, string> = {
  OPEN: "مفتوحة",
  PENDING: "قيد المتابعة",
  RESOLVED: "تم الحل",
  CLOSED: "مغلقة",
};

export default function AdminSupportPage() {
  const query = useQuery({
    queryKey: ["admin-support-conversations"],
    queryFn: getAdminConversations,
    refetchInterval: 10_000,
  });

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#2563EB]">
              Support
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#0F172A]">
              Customer support
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              جميع محادثات العملاء من مصدر واحد محفوظ في قاعدة البيانات.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
          {query.isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : query.isError ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-sm text-red-700">
              تعذر تحميل محادثات الدعم.
            </div>
          ) : query.data?.length ? (
            <div className="space-y-4">
              {query.data.map((conversation) => (
                <Link
                  key={conversation.id}
                  href={"/admin/support/" + conversation.id}
                  className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-sm font-black text-slate-900">
                          {conversation.subject}
                        </h2>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                          {labels[conversation.status] ?? conversation.status}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        {conversation.customerName} · {conversation.messages.length} رسالة · {new Date(conversation.lastMessageAt).toLocaleString("ar")}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <LifeBuoy className="mx-auto h-9 w-9 text-slate-300" />
              <h2 className="mt-4 text-xl font-black text-slate-900">لا توجد محادثات</h2>
              <p className="mt-2 text-sm text-slate-500">ستظهر محادثات العملاء هنا.</p>
            </div>
          )}
        </div>
      </main>
    </AdminShell>
  );
}
