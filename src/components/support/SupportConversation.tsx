"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  Send,
  UserRound,
} from "lucide-react";

import {
  useSupportChatStore,
} from "@/stores/support-chat-store";

import type {
  SupportRole,
} from "@/features/support/types/support.types";

interface SupportConversationProps {
  conversationId: string;

  currentUser: {
    id: string;
    name: string;
    role: SupportRole;
  };

  showAdminControls?: boolean;
}

export function SupportConversation({
  conversationId,
  currentUser,
  showAdminControls = false,
}: SupportConversationProps) {
  const conversation =
    useSupportChatStore(
      (state) =>
        state.getConversation(
          conversationId,
        ),
    );

  const sendMessage =
    useSupportChatStore(
      (state) =>
        state.sendMessage,
    );

  const markRead =
    useSupportChatStore(
      (state) =>
        state.markConversationRead,
    );

  const setStatus =
    useSupportChatStore(
      (state) =>
        state.setConversationStatus,
    );

  const [
    message,
    setMessage,
  ] = useState("");

  useEffect(() => {
    markRead(
      conversationId,
      currentUser.role,
    );
  }, [
    conversationId,
    currentUser.role,
    markRead,
  ]);

  if (!conversation) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm font-bold text-slate-600">
          Conversation not found.
        </p>
      </div>
    );
  }

  const submit = () => {
    const value =
      message.trim();

    if (!value) {
      return;
    }

    sendMessage(
      conversationId,
      currentUser,
      value,
    );

    setMessage("");
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <header className="border-b border-slate-100 p-5">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-lg font-black text-slate-900">
              {
                conversation.subject
              }
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {conversation.orderId
                ? `Order ${conversation.orderId}`
                : "Support"}
            </p>
          </div>

          {showAdminControls && (
            <div className="flex gap-2">

              {[
                "OPEN",
                "PENDING",
                "RESOLVED",
                "CLOSED",
              ].map(
                (status) => (
                  <button
                    key={
                      status
                    }
                    type="button"
                    onClick={() =>
                      setStatus(
                        conversationId,
                        status as
                          | "OPEN"
                          | "PENDING"
                          | "RESOLVED"
                          | "CLOSED",
                      )
                    }
                    className={`rounded-lg px-2.5 py-1.5 text-[9px] font-black ${
                      conversation.status ===
                      status
                        ? "bg-blue-50 text-[#2563EB]"
                        : "text-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    {
                      status
                    }
                  </button>
                ),
              )}

            </div>
          )}

        </div>

      </header>

      <div className="max-h-[560px] min-h-[420px] space-y-4 overflow-y-auto bg-slate-50/70 p-5">

        {conversation.messages.map(
          (item) => {
            const mine =
              item.senderId ===
              currentUser.id;

            return (
              <div
                key={
                  item.id
                }
                className={`flex ${
                  mine
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                <div
                  className={`max-w-[82%] ${
                    mine
                      ? "items-end"
                      : "items-start"
                  }`}
                >

                  <div className="mb-1 flex items-center gap-2 text-[10px] text-slate-400">

                    {!mine && (
                      <UserRound className="h-3 w-3" />
                    )}

                    <span className="font-bold">
                      {
                        item.senderName
                      }
                    </span>

                    <span>
                      {
                        item.senderRole
                      }
                    </span>

                  </div>

                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                      mine
                        ? "rounded-br-md bg-[#2563EB] text-white"
                        : "rounded-bl-md bg-white text-slate-700 shadow-sm"
                    }`}
                  >
                    {
                      item.body
                    }
                  </div>

                  <p className="mt-1 text-[9px] text-slate-400">
                    {new Date(
                      item.createdAt,
                    ).toLocaleTimeString(
                      "en-US",
                      {
                        hour:
                          "2-digit",
                        minute:
                          "2-digit",
                      },
                    )}
                  </p>

                </div>

              </div>
            );
          },
        )}

        {conversation.messages.length ===
          0 && (
          <div className="flex min-h-[360px] items-center justify-center text-sm text-slate-400">
            Start the conversation.
          </div>
        )}

      </div>

      <footer className="border-t border-slate-100 bg-white p-4">

        <div className="flex items-end gap-2">

          <textarea
            value={message}
            onChange={(event) =>
              setMessage(
                event.target.value,
              )
            }
            onKeyDown={(event) => {
              if (
                event.key ===
                  "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();
                submit();
              }
            }}
            rows={2}
            placeholder="Write your message..."
            aria-label="Support message"
            className="min-h-[52px] flex-1 resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100"
          />

          <button
            type="button"
            onClick={
              submit
            }
            disabled={
              !message.trim()
            }
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>

        </div>

        {conversation.status ===
          "RESOLVED" && (
          <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-emerald-700">

            <CheckCircle2 className="h-3.5 w-3.5" />

            Conversation resolved

          </div>
        )}

      </footer>

    </section>
  );
}