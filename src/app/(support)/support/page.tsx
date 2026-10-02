"use client";

import { useEffect, useState } from "react";
import { Headphones, Plus } from "lucide-react";

import { SupportConversation } from "@/components/support/SupportConversation";
import { useSupportChatStore } from "@/stores/support-chat-store";

export default function SupportPage() {
  const [conversationId, setConversationId] = useState("");
  const conversations = useSupportChatStore((state) => state.getCustomerConversations("public-demo"));
  const createConversation = useSupportChatStore((state) => state.createConversation);

  useEffect(() => {
    if (conversations[0]) {
      setConversationId(conversations[0].id);
      return;
    }
    const id = createConversation({
      customerId: "public-demo",
      customerName: "Customer",
      subject: "Customer support request",
      category: "OTHER",
    });
    setConversationId(id);
  }, [conversations, createConversation]);

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-neutral-200 bg-surface">
        <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 lg:px-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-black text-brand"><Headphones className="h-3.5 w-3.5" /> الدعم</p>
          <h1 className="mt-4 text-3xl font-black tracking-tight">مركز دعم ALI STORE</h1>
          <p className="mt-2 text-sm text-muted-foreground">نفس نموذج المحادثة المستخدم داخل حساب العميل والدعم الإداري.</p>
        </div>
      </section>

      <div className="mx-auto max-w-[900px] px-4 py-8 sm:px-6 lg:px-8">
        {conversationId ? (
          <SupportConversation
            conversationId={conversationId}
            currentUser={{ id: "public-demo", name: "Customer", role: "CUSTOMER" }}
          />
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-surface p-10 text-center">
            <p className="text-sm font-bold">جاري تجهيز المحادثة...</p>
          </div>
        )}

        {conversationId && (
          <button
            type="button"
            onClick={() => {
              const id = createConversation({
                customerId: "public-demo",
                customerName: "Customer",
                subject: "New support request",
                category: "OTHER",
              });
              setConversationId(id);
            }}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl border border-brand px-5 text-sm font-black text-brand"
          >
            <Plus className="h-4 w-4" /> محادثة جديدة
          </button>
        )}
      </div>
    </main>
  );
}
