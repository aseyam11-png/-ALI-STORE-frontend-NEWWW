"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  SupportConversation,
  SupportRole,
} from "@/features/support/types/support.types";

interface SupportChatState {
  conversations: SupportConversation[];
  createConversation: (input: {
    orderId?: string;
    shipmentId?: string;
    customerId: string;
    customerName: string;
    subject: string;
    category: "ORDER" | "SHIPPING" | "PRODUCT" | "PAYMENT" | "OTHER";
  }) => string;
  sendMessage: (
    conversationId: string,
    sender: { id: string; name: string; role: SupportRole },
    body: string,
  ) => void;
  markConversationRead: (conversationId: string, role: SupportRole) => void;
  setConversationStatus: (
    conversationId: string,
    status: "OPEN" | "PENDING" | "RESOLVED" | "CLOSED",
  ) => void;
  getConversation: (conversationId: string) => SupportConversation | undefined;
  getCustomerConversations: (customerId: string) => SupportConversation[];
  getAllConversations: () => SupportConversation[];
}

function now() {
  return new Date().toISOString();
}

export const useSupportChatStore = create<SupportChatState>()(
  persist(
    (set, get) => ({
      conversations: [],

      createConversation: (input) => {
        const timestamp = now();
        const id = "CHAT-" + Date.now();

        const conversation: SupportConversation = {
          id,
          orderId: input.orderId,
          shipmentId: input.shipmentId,
          customerId: input.customerId,
          customerName: input.customerName,
          subject: input.subject.trim() || "Support request",
          category: input.category,
          status: "OPEN",
          participants: [
            {
              id: input.customerId,
              name: input.customerName,
              role: "CUSTOMER",
            },
          ],
          messages: [],
          createdAt: timestamp,
          updatedAt: timestamp,
          lastMessageAt: timestamp,
        };

        set((state) => ({
          conversations: [conversation, ...state.conversations],
        }));

        return id;
      },

      sendMessage: (conversationId, sender, body) => {
        const cleanBody = body.trim();
        if (!cleanBody) return;

        const timestamp = now();
        set((state) => ({
          conversations: state.conversations.map((conversation) => {
            if (conversation.id !== conversationId) return conversation;

            const message = {
              id: "MSG-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
              conversationId,
              senderId: sender.id,
              senderName: sender.name,
              senderRole: sender.role,
              body: cleanBody,
              createdAt: timestamp,
              read: sender.role === "CUSTOMER",
            };

            const hasParticipant = conversation.participants.some(
              (participant) => participant.id === sender.id,
            );

            return {
              ...conversation,
              participants: hasParticipant
                ? conversation.participants
                : [...conversation.participants, { ...sender }],
              messages: [...conversation.messages, message],
              updatedAt: timestamp,
              lastMessageAt: timestamp,
              status: sender.role === "CUSTOMER" ? "OPEN" : "PENDING",
            };
          }),
        }));
      },

      markConversationRead: (conversationId, role) => {
        set((state) => ({
          conversations: state.conversations.map((conversation) =>
            conversation.id !== conversationId
              ? conversation
              : {
                  ...conversation,
                  messages: conversation.messages.map((message) =>
                    message.senderRole === role
                      ? message
                      : { ...message, read: true },
                  ),
                },
          ),
        }));
      },

      setConversationStatus: (conversationId, status) => {
        set((state) => ({
          conversations: state.conversations.map((conversation) =>
            conversation.id === conversationId
              ? { ...conversation, status, updatedAt: now() }
              : conversation,
          ),
        }));
      },

      getConversation: (conversationId) =>
        get().conversations.find((conversation) => conversation.id === conversationId),

      getCustomerConversations: (customerId) =>
        get()
          .conversations
          .filter((conversation) => conversation.customerId === customerId)
          .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)),

      getAllConversations: () =>
        [...get().conversations].sort((a, b) =>
          b.lastMessageAt.localeCompare(a.lastMessageAt),
        ),
    }),
    {
      name: "alistore-support",
      version: 1,
      partialize: (state) => ({ conversations: state.conversations }),
      skipHydration: true,
    },
  ),
);
