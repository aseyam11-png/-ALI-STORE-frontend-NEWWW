import { apiClient } from "@/lib/api/http-client";

export type BackendNotification = {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export async function getMyNotifications(): Promise<BackendNotification[]> {
  return apiClient.requestData<BackendNotification[]>("/api/v1/notifications/me");
}

export async function markNotificationAsRead(id: string): Promise<BackendNotification> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) throw new Error("Invalid notification id");
  return apiClient.requestData<BackendNotification>(`/api/v1/notifications/${numericId}/read`, {
    method: "PATCH",
  });
}

export async function deleteNotification(id: string): Promise<void> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) throw new Error("Invalid notification id");
  await apiClient.requestData<void>(`/api/v1/notifications/${numericId}`, {
    method: "DELETE",
  });
}