"use client";

import { create } from "zustand";

import type {
  SupportConversation,
  SupportRole,
} from "@/features/support/types/support.types";

interface SupportChatState {
  conversations: SupportConversation[];

  createConversation: (
    input: {
      orderId?: string;
      shipmentId?: string;
      customerId: string;
      customerName: string;
      subject: string;
      category:
        | "ORDER"
        | "SHIPPING"
        | "PRODUCT"
        | "PAYMENT"
        | "OTHER";
    },
  ) => string;

  sendMessage: (
    conversationId: string,
    sender: {
      id: string;
      name: string;
      role: SupportRole;
    },
    body: string,
  ) => void;

  markConversationRead: (
    conversationId: string,
    role: SupportRole,
  ) => void;

  setConversationStatus: (
    conversationId: string,
    status:
      | "OPEN"
      | "PENDING"
      | "RESOLVED"
      | "CLOSED",
  ) => void;

  getConversation: (
    conversationId: string,
  ) =>
    | SupportConversation
    | undefined;

  getCustomerConversations: (
    customerId: string,
  ) => SupportConversation[];

  getAllConversations: () =>
    SupportConversation[];
}

const initialConversation: SupportConversation = {
  id: "CHAT-1001",

  orderId: "AS-2026-10482",
  shipmentId: "SHIP-1001",

  customerId: "customer-001",
  customerName: "Customer",

  subject:
    "Where is my headphones order?",

  category: "SHIPPING",

  status: "OPEN",

  participants: [
    {
      id: "customer-001",
      name: "Customer",
      role: "CUSTOMER",
    },
    {
      id: "admin-001",
      name: "ALI STORE Support",
      role: "ADMIN",
    },
  ],

  messages: [
    {
      id: "MSG-1001",
      conversationId: "CHAT-1001",
      senderId: "customer-001",
      senderName: "Customer",
      senderRole: "CUSTOMER",
      body:
        "Can you tell me where my shipment is?",
      createdAt:
        "2026-08-15T11:00:00.000Z",
      read: true,
    },
    {
      id: "MSG-1002",
      conversationId: "CHAT-1001",
      senderId: "admin-001",
      senderName: "ALI STORE Support",
      senderRole: "ADMIN",
      body:
        "Your package has already been handed to the carrier.",
      createdAt:
        "2026-08-15T11:12:00.000Z",
      read: false,
    },
  ],

  createdAt:
    "2026-08-15T11:00:00.000Z",

  updatedAt:
    "2026-08-15T11:12:00.000Z",

  lastMessageAt:
    "2026-08-15T11:12:00.000Z",
};

export const useSupportChatStore =
  create<SupportChatState>(
    (set, get) => ({
      conversations: [
        initialConversation,
      ],

      createConversation: (
        input,
      ) => {
        const id =
          `CHAT-${Date.now()}`;

        const now =
          new Date().toISOString();

        const participants: SupportConversation["participants"] =
          [
            {
              id: input.customerId,
              name: input.customerName,
              role: "CUSTOMER",
            },
          ];

        participants.push({
          id: "admin-001",
          name: "ALI STORE Support",
          role: "ADMIN",
        });

        set((state) => ({
          conversations: [
            {
              id,
              orderId:
                input.orderId,
              shipmentId:
                input.shipmentId,

              customerId:
                input.customerId,

              customerName:
                input.customerName,

              subject:
                input.subject,

              category:
                input.category,

              status: "OPEN",

              participants,

              messages: [],

              createdAt: now,
              updatedAt: now,
              lastMessageAt: now,
            },
            ...state.conversations,
          ],
        }));

        return id;
      },

      sendMessage: (
        conversationId,
        sender,
        body,
      ) => {
        const message =
          body.trim();

        if (!message) {
          return;
        }

        const now =
          new Date().toISOString();

        set((state) => ({
          conversations:
            state.conversations.map(
              (conversation) =>
                conversation.id ===
                conversationId
                  ? {
                      ...conversation,

                      status:
                        conversation.status ===
                        "CLOSED"
                          ? "OPEN"
                          : conversation.status,

                      messages: [
                        ...conversation.messages,
                        {
                          id: `MSG-${Date.now()}`,
                          conversationId,
                          senderId:
                            sender.id,
                          senderName:
                            sender.name,
                          senderRole:
                            sender.role,
                          body: message,
                          createdAt:
                            now,
                          read: true,
                        },
                      ],

                      updatedAt:
                        now,

                      lastMessageAt:
                        now,
                    }
                  : conversation,
            ),
        }));
      },

      markConversationRead: (
        conversationId,
        role,
      ) => {
        set((state) => ({
          conversations:
            state.conversations.map(
              (conversation) =>
                conversation.id ===
                conversationId
                  ? {
                      ...conversation,
                      messages:
                        conversation.messages.map(
                          (message) => ({
                            ...message,
                            read:
                              message.senderRole ===
                              role
                                ? message.read
                                : true,
                          }),
                        ),
                    }
                  : conversation,
            ),
        }));
      },

      setConversationStatus: (
        conversationId,
        status,
      ) => {
        set((state) => ({
          conversations:
            state.conversations.map(
              (conversation) =>
                conversation.id ===
                conversationId
                  ? {
                      ...conversation,
                      status,
                      updatedAt:
                        new Date().toISOString(),
                    }
                  : conversation,
            ),
        }));
      },

      getConversation: (
        conversationId,
      ) =>
        get().conversations.find(
          (conversation) =>
            conversation.id ===
            conversationId,
        ),

      getCustomerConversations: (
        customerId,
      ) =>
        get().conversations.filter(
          (conversation) =>
            conversation.customerId ===
            customerId,
        ),

      getAllConversations: () =>
        get().conversations,
    }),
  );