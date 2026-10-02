"use client";

import Link from "next/link";
import {
  ArrowRight,
  Headphones,
  MessageCircle,
  Plus,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";

import {
  useSupportChatStore,
} from "@/stores/support-chat-store";

export default function BuyerSupportPage() {
  const conversations =
    useSupportChatStore(
      (state) =>
        state.getCustomerConversations(
          "customer-001",
        ),
    );

  const createConversation =
    useSupportChatStore(
      (state) =>
        state.createConversation,
    );

  const [
    search,
    setSearch,
  ] = useState("");

  const filtered =
    useMemo(
      () =>
        conversations.filter(
          (conversation) =>
            `${conversation.subject} ${conversation.orderId ?? ""}`
              .toLowerCase()
              .includes(
                search
                  .trim()
                  .toLowerCase(),
              ),
        ),
      [conversations, search],
    );

  const newConversation =
    () => {
      const id =
        createConversation({
          orderId:
            "AS-2026-10482",

          shipmentId:
            "SHIP-1001",

          customerId:
            "customer-001",

          customerName:
            "Customer",

          subject:
            "Customer support request",

          category: "ORDER",
        });

      window.location.href =
        `/buyer/support/${id}`;
    };

  return (
    <AppShell>
      <main className="min-h-screen bg-[#F8FAFC]">

        <section className="border-b border-slate-200 bg-white">

          <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 lg:px-8">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#2563EB]">
                  Customer support
                </p>

                <h1 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A]">
                  Support center
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Contact support about your order.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  newConversation
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-black text-white"
              >
                <Plus className="h-4 w-4" />
                New conversation
              </button>

            </div>

          </div>
        </section>

        <div className="mx-auto max-w-[1100px] px-4 py-7 sm:px-6 lg:px-8">

          <div className="mb-5 flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3">

            <Search className="h-4 w-4 text-slate-400" />

            <input
              value={search}
              onChange={(
                event,
              ) =>
                setSearch(
                  event
                    .target
                    .value,
                )
              }
              placeholder="Search conversations..."
              aria-label="Search support conversations"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />

          </div>

          <div className="space-y-4">

            {filtered.map(
              (conversation) => (
                <Link
                  key={
                    conversation.id
                  }
                  href={`/buyer/support/${conversation.id}`}
                  className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                >

                  <div className="flex items-start gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                      <MessageCircle className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <h2 className="text-sm font-black text-slate-900">
                          {
                            conversation.subject
                          }
                        </h2>

                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-black text-[#2563EB]">
                          {
                            conversation.status
                          }
                        </span>

                      </div>

                      <p className="mt-1 text-xs text-slate-400">

                        {conversation.orderId && (
                          <>
                            Order{" "}
                            {
                              conversation.orderId
                            }
                            {" · "}
                          </>
                        )}

                        Support

                      </p>

                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                        {conversation.messages.at(
                          -1,
                        )?.body ??
                          "No messages yet."}
                      </p>

                    </div>

                    <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-slate-300" />

                  </div>

                </Link>
              ),
            )}

            {filtered.length ===
              0 && (
              <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

                <Headphones className="mx-auto h-8 w-8 text-slate-300" />

                <h2 className="mt-4 text-xl font-black text-slate-900">
                  No conversations
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Start a support conversation about one of your orders.
                </p>

              </section>
            )}

          </div>

        </div>
      </main>
    </AppShell>
  );
}