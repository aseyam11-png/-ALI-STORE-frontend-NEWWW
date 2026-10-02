"use client";

import Link from "next/link";
import {
  ArrowRight,
  Headphones,
  MessageCircle,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";

import { AdminShell } from "@/components/layout/AdminShell";

import {
  useSupportChatStore,
} from "@/stores/support-chat-store";

export default function AdminSupportPage() {
  const conversations =
    useSupportChatStore(
      (state) =>
        state.getAllConversations(),
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
            `${conversation.id} ${conversation.subject} ${conversation.customerName} ${conversation.orderId ?? ""}`
              .toLowerCase()
              .includes(
                search
                  .trim()
                  .toLowerCase(),
              ),
        ),
      [conversations, search],
    );

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">

        <section className="border-b border-slate-200 bg-white">

          <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">

            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-500">
              Administration
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A]">
              Support operations
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Monitor customer support conversations and respond when
              needed.
            </p>

          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 lg:px-8">

          <div className="mb-5 flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3">

            <Search className="h-4 w-4 text-slate-400" />

            <input
              value={search}
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target
                    .value,
                )
              }
              placeholder="Search conversation, customer or order..."
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
                  href={`/admin/support/${conversation.id}`}
                  className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200"
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

                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-[9px] font-black text-red-600">
                          ADMIN
                        </span>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black text-slate-500">
                          {
                            conversation.status
                          }
                        </span>

                      </div>

                      <p className="mt-1 text-xs text-slate-400">

                        Customer:{" "}
                        {
                          conversation.customerName
                        }

                        {conversation.orderId &&
                          ` · Order ${conversation.orderId}`}

                      </p>

                      <p className="mt-3 line-clamp-2 text-sm text-slate-500">
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

          </div>

          {filtered.length ===
            0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

              <Headphones className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-4 text-sm font-bold text-slate-600">
                No conversations found.
              </p>

            </div>
          )}

        </div>
      </main>
    </AdminShell>
  );
}