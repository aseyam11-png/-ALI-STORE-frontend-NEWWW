"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Headphones, MessageCircle, Plus } from "lucide-react";
import { useState } from "react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { useSession } from "@/features/auth/session";
import {
  createConversation,
  getMyConversations,
  type SupportCategory,
} from "@/features/support/services/support-api.service";

const categories: Array<{ value: SupportCategory; label: string }> = [
  { value: "ORDER", label: "طلب" },
  { value: "SHIPPING", label: "شحن" },
  { value: "PRODUCT", label: "منتج" },
  { value: "PAYMENT", label: "دفع" },
  { value: "OTHER", label: "أخرى" },
];

const statusLabels: Record<string, string> = {
  OPEN: "مفتوحة",
  PENDING: "قيد المتابعة",
  RESOLVED: "تم الحل",
  CLOSED: "مغلقة",
};

export default function BuyerSupportPage() {
  const session = useSession();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<SupportCategory>("OTHER");
  const [error, setError] = useState("");

  const query = useQuery({
    queryKey: ["support-conversations"],
    queryFn: getMyConversations,
    enabled: session.status === "authenticated",
    staleTime: 5_000,
  });

  const createMutation = useMutation({
    mutationFn: () => createConversation({ subject, category }),
    onSuccess: async (conversation) => {
      await queryClient.invalidateQueries({ queryKey: ["support-conversations"] });
      setSubject("");
      setCategory("OTHER");
      setShowCreate(false);
      window.location.assign("/buyer/support/" + conversation.id);
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof Error ? mutationError.message : "تعذر إنشاء المحادثة.",
      );
    },
  });

  return (
    <AccountWorkspace
      activeTab="support"
      title="الدعم"
      description="محادثات الدعم محفوظة على حسابك وتستمر بين الجلسات والأجهزة."
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {query.data?.length ?? 0} محادثة
        </p>
        <button
          type="button"
          onClick={() => {
            setShowCreate(true);
            setError("");
          }}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-white hover:bg-brand-hover"
        >
          <Plus className="h-4 w-4" />
          محادثة جديدة
        </button>
      </div>

      {showCreate && (
        <section className="mt-6 rounded-2xl border border-neutral-200 bg-surface p-6">
          <h2 className="text-lg font-bold text-foreground">فتح طلب دعم</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_220px]">
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="اكتب موضوع المشكلة"
              className="h-11 rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-brand"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SupportCategory)}
              className="h-11 rounded-xl border border-neutral-200 bg-surface px-3 text-sm outline-none focus:border-brand"
            >
              {categories.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>
          {error && (
            <p role="alert" className="mt-3 text-sm font-medium text-danger-700">{error}</p>
          )}
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => createMutation.mutate()}
              disabled={!subject.trim() || createMutation.isPending}
              className="h-11 rounded-xl bg-brand px-5 text-sm font-bold text-white disabled:opacity-50"
            >
              {createMutation.isPending ? "جاري الإنشاء..." : "بدء المحادثة"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="h-11 rounded-xl border border-neutral-200 px-5 text-sm font-bold"
            >
              إلغاء
            </button>
          </div>
        </section>
      )}

      {query.isLoading ? (
        <div className="mt-7 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-neutral-100" />
          ))}
        </div>
      ) : query.isError ? (
        <div className="mt-7 rounded-2xl border border-danger-100 bg-danger-surface p-8 text-center text-sm text-danger-700">
          تعذر تحميل محادثات الدعم.
        </div>
      ) : query.data?.length ? (
        <div className="mt-7 space-y-4">
          {query.data.map((conversation) => (
            <Link
              key={conversation.id}
              href={"/buyer/support/" + conversation.id}
              className="block rounded-2xl border border-neutral-200 bg-surface p-5 transition hover:border-brand hover:shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-brand">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-sm font-bold text-foreground">
                      {conversation.subject}
                    </h3>
                    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold text-neutral-600">
                      {statusLabels[conversation.status] ?? conversation.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {conversation.messages.length} رسالة · {new Date(conversation.lastMessageAt).toLocaleString("ar")}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-2xl border border-dashed border-neutral-300 bg-surface p-12 text-center">
          <Headphones className="mx-auto h-9 w-9 text-neutral-300" />
          <h2 className="mt-4 text-xl font-bold text-foreground">لا توجد محادثات</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            افتح محادثة عند وجود مشكلة في طلب أو شحن أو دفع.
          </p>
        </div>
      )}
    </AccountWorkspace>
  );
}
