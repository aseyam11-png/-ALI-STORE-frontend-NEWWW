"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Headphones,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { SupportConversation } from "@/components/support/SupportConversation";
import { useAuthStore } from "@/stores/auth-store";

export default function BuyerSupportConversationPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const conversationId =
    params?.id ??
    "CHAT-1001";

  const user = useAuthStore((state) => state.user);
  const currentUser = user
    ? { id: String(user.id), name: `${user.firstName} ${user.lastName}`.trim(), role: "CUSTOMER" as const }
    : { id: "public-demo", name: "Customer", role: "CUSTOMER" as const };

  return (
    <AppShell>
      <main className="min-h-screen bg-[#F8FAFC]">

        <div className="mx-auto max-w-[1000px] px-4 py-7 sm:px-6 lg:px-8">

          <Link
            href="/buyer/support"
            className="inline-flex items-center gap-2 text-xs font-black text-[#2563EB]"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            Support center
          </Link>

          <div className="mb-5 mt-5 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
              <Headphones className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Customer support
              </p>

              <h1 className="mt-1 text-xl font-black text-slate-900">
                Order support
              </h1>
            </div>

          </div>

          <SupportConversation
            conversationId={
              conversationId
            }
            currentUser={currentUser}
          />

        </div>
      </main>
    </AppShell>
  );
}