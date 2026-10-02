"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SupportConversation, SupportRole } from "@/features/support/types/support.types";

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

const initialConversation: SupportConversation = {
  id: "CHAT-1001",
  orderId: undefined,
  shipmentId: undefined,
  customerId: "public-demo",
  customerName: "Customer",
  subject: "Welcome to ALI STORE Support",
  category: "OTHER",
  status: "OPEN",
  participants: [
    { id: "public-demo", name: "Customer", role: "CUSTOMER" },
    { id: "admin-001", name: "ALI STORE Support", role: "ADMIN" },
  ],
  messages: [
    {
      id: "MSG-1001",
      conversationId: "CHAT-1001",
      senderId: "admin-001",
      senderName: "ALI STORE Support",
      senderRole: "ADMIN",
      body: "أهلاً بك. اكتب مشكلتك وسنتابعها من نفس المحادثة.",
      createdAt: "2026-09-01T10:00:00.000Z",
      read: false,
    },
  ],
  createdAt: "2026-09-01T10:00:00.000Z",
  updatedAt: "2026-09-01T10:00:00.000Z",
  lastMessageAt: "2026-09-01T10:00:00.000Z",
};

export const useSupportChatStore = create<SupportChatState>()(
  persist(
    (set, get) => ({
      conversations: [initialConversation],

      createConversation: (input) => {
        const now = new Date().toISOString();
        const id = `CHAT-${Date.now()}`;
        const conversation: SupportConversation = {
          id,
          orderId: input.orderId,
          shipmentId: input.shipmentId,
          customerId: input.customerId,
          customerName: input.customerName,
          subject: input.subject,
          category: input.category,
          status: "OPEN",
          participants: [
            { id: input.customerId, name: input.customerName, role: "CUSTOMER" },
            { id: "admin-001", name: "ALI STORE Support", role: "ADMIN" },
          ],
          messages: [],
          createdAt: now,
          updatedAt: now,
          lastMessageAt: now,
        };
        set((state) => ({
          conversations: [conversation, ...state.conversations],
        }));
        return id;
      },

      sendMessage: (conversationId, sender, body) => {
        const message = body.trim();
        if (!message) return;

        const now = new Date().toISOString();
        const id = `MSG-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        set((state) => ({
          conversations: state.conversations.map((conversation) => {
            if (conversation.id !== conversationId) return conversation;

            return {
              ...conversation,
              status: conversation.status === "CLOSED" ? "OPEN" : conversation.status,
              messages: [
                ...conversation.messages,
                {
                  id,
                  conversationId,
                  senderId: sender.id,
                  senderName: sender.name,
                  senderRole: sender.role,
                  body: message,
                  createdAt: now,
                  read: true,
                },
              ],
              updatedAt: now,
              lastMessageAt: now,
            };
          }),
        }));
      },

      markConversationRead: (conversationId, role) => {
        set((state) => ({
          conversations: state.conversations.map((conversation) => {
            if (conversation.id !== conversationId) return conversation;

            return {
              ...conversation,
              messages: conversation.messages.map((message) =>
                message.senderRole === role ? message : { ...message, read: true },
              ),
            };
          }),
        }));
      },

      setConversationStatus: (conversationId, status) => {
        set((state) => ({
          conversations: state.conversations.map((conversation) =>
            conversation.id === conversationId
              ? { ...conversation, status, updatedAt: new Date().toISOString() }
              : conversation,
          ),
        }));
      },

      getConversation: (conversationId) =>
        get().conversations.find((conversation) => conversation.id === conversationId),

      getCustomerConversations: (customerId) =>
        get().conversations.filter((conversation) => conversation.customerId === customerId),

      getAllConversations: () => get().conversations,
    }),
    {
      name: "alistore-support",
      partialize: (state) => ({ conversations: state.conversations }),
    },
  ),
);
