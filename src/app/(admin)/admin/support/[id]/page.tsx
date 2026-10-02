"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Headphones,
} from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import { SupportConversation } from "@/components/support/SupportConversation";

export default function AdminSupportConversationPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const conversationId =
    params?.id ??
    "CHAT-1001";

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">

        <div className="mx-auto max-w-[1000px] px-4 py-7 sm:px-6 lg:px-8">

          <Link
            href="/admin/support"
            className="inline-flex items-center gap-2 text-xs font-black text-[#2563EB]"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            Support operations
          </Link>

          <div className="mb-5 mt-5 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Headphones className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-500">
                Administrator support
              </p>

              <h1 className="mt-1 text-xl font-black text-slate-900">
                Conversation control
              </h1>
            </div>

          </div>

          <SupportConversation
            conversationId={
              conversationId
            }
            currentUser={{
              id: "admin-001",
              name: "ALI STORE Support",
              role: "ADMIN",
            }}
            showAdminControls
          />

        </div>
      </main>
    </AdminShell>
  );
}