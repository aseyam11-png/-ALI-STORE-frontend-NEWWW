import type { ApiResponse } from "@/lib/api/contracts";
import { apiClient } from "@/lib/api/http-client";

export type SupportCategory =
  | "ORDER"
  | "SHIPPING"
  | "PRODUCT"
  | "PAYMENT"
  | "OTHER";

export type SupportStatus =
  | "OPEN"
  | "PENDING"
  | "RESOLVED"
  | "CLOSED";

export interface SupportMessage {
  id: number;
  conversationId: number;
  senderUserId: number;
  senderName: string;
  senderRole: "CUSTOMER" | "ADMIN";
  body: string;
  createdAt: string;
  read: boolean;
}

export interface SupportConversation {
  id: number;
  customerId: number;
  customerName: string;
  subject: string;
  category: SupportCategory;
  status: SupportStatus;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  messages: SupportMessage[];
}

export async function getMyConversations() {
  const response = await apiClient.request<
    ApiResponse<SupportConversation[]>
  >("/api/v1/support/conversations");
  return response.data;
}

export async function getMyConversation(id: string) {
  const response = await apiClient.request<
    ApiResponse<SupportConversation>
  >("/api/v1/support/conversations/" + encodeURIComponent(id));
  return response.data;
}

export async function createConversation(input: {
  subject: string;
  category: SupportCategory;
}) {
  const response = await apiClient.request<
    ApiResponse<SupportConversation>
  >("/api/v1/support/conversations", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function sendCustomerMessage(
  conversationId: string,
  body: string,
) {
  const response = await apiClient.request<
    ApiResponse<SupportConversation>
  >(
    "/api/v1/support/conversations/" +
      encodeURIComponent(conversationId) +
      "/messages",
    {
      method: "POST",
      body: JSON.stringify({ body }),
    },
  );
  return response.data;
}

export async function getAdminConversations() {
  const response = await apiClient.request<
    ApiResponse<SupportConversation[]>
  >("/api/v1/admin/support/conversations");
  return response.data;
}

export async function getAdminConversation(id: string) {
  const response = await apiClient.request<
    ApiResponse<SupportConversation>
  >("/api/v1/admin/support/conversations/" + encodeURIComponent(id));
  return response.data;
}

export async function sendAdminMessage(
  conversationId: string,
  body: string,
) {
  const response = await apiClient.request<
    ApiResponse<SupportConversation>
  >(
    "/api/v1/admin/support/conversations/" +
      encodeURIComponent(conversationId) +
      "/messages",
    {
      method: "POST",
      body: JSON.stringify({ body }),
    },
  );
  return response.data;
}

export async function updateSupportStatus(
  conversationId: string,
  status: SupportStatus,
) {
  const response = await apiClient.request<
    ApiResponse<SupportConversation>
  >(
    "/api/v1/admin/support/conversations/" +
      encodeURIComponent(conversationId) +
      "/status?status=" +
      encodeURIComponent(status),
    { method: "PATCH" },
  );
  return response.data;
}
