"use client";

import { use } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import {
  getMyConversation,
  sendCustomerMessage,
} from "@/features/support/services/support-api.service";

export default function BuyerSupportConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  const query = useQuery({
    queryKey: ["support-conversation", id],
    queryFn: () => getMyConversation(id),
    refetchInterval: 10_000,
  });

  const sendMutation = useMutation({
    mutationFn: () => sendCustomerMessage(id, message.trim()),
    onSuccess: async () => {
      setMessage("");
      await queryClient.invalidateQueries({
        queryKey: ["support-conversation", id],
      });
    },
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [query.data?.messages.length]);

  return (
    <AccountWorkspace
      activeTab="support"
      title={query.data?.subject ?? "محادثة الدعم"}
      description="كل الرسائل محفوظة على خادم ALI STORE."
    >
      <Link
        href="/buyer/support"
        className="inline-flex items-center gap-2 text-xs font-bold text-brand"
      >
        <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
        العودة للدعم
      </Link>

      {query.isLoading ? (
        <div className="mt-6 h-[520px] animate-pulse rounded-2xl bg-neutral-100" />
      ) : query.isError || !query.data ? (
        <div className="mt-6 rounded-2xl border border-danger-100 bg-danger-surface p-8 text-center text-sm font-medium text-danger-700">
          تعذر تحميل المحادثة.
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-surface">
          <div className="flex h-[520px] flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {query.data.messages.map((item) => {
                const mine = item.senderRole === "CUSTOMER";
                return (
                  <div
                    key={item.id}
                    className={mine ? "flex justify-end" : "flex justify-start"}
                  >
                    <div
                      className={
                        "max-w-[85%] rounded-2xl px-4 py-3 " +
                        (mine
                          ? "bg-brand text-white"
                          : "bg-neutral-100 text-foreground")
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
              <div ref={endRef} />
            </div>

            <div className="border-t border-neutral-200 p-4">
              {sendMutation.isError && (
                <p className="mb-3 text-xs font-medium text-danger-700">
                  تعذر إرسال الرسالة.
                </p>
              )}
              <div className="flex gap-2">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  placeholder="اكتب رسالتك..."
                  className="min-h-11 flex-1 resize-none rounded-xl border border-neutral-200 p-3 text-sm outline-none focus:border-brand"
                />
                <button
                  type="button"
                  onClick={() => sendMutation.mutate()}
                  disabled={!message.trim() || sendMutation.isPending}
                  className="flex h-11 items-center gap-2 self-end rounded-xl bg-brand px-5 text-sm font-bold text-white disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  إرسال
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AccountWorkspace>
  );
}
