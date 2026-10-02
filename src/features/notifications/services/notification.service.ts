import { apiClient } from "@/lib/api/http-client";
import type {
  BackendNotification,
} from "@/lib/api/contracts";

export async function getNotifications(): Promise<
  BackendNotification[]
> {
  return apiClient.request<BackendNotification[]>(
    "/api/v1/notifications/me",
  );
}

export async function getUnreadNotifications(): Promise<
  BackendNotification[]
> {
  return apiClient.request<BackendNotification[]>(
    "/api/v1/notifications/me/unread",
  );
}

export async function markNotificationRead(
  id: string,
): Promise<BackendNotification> {
  return apiClient.request<BackendNotification>(
    `/api/v1/notifications/${encodeURIComponent(id)}/read`,
    {
      method: "PATCH",
    },
  );
}


export async function deleteNotification(
  id: string,
): Promise<void> {
  await apiClient.request<void>(
    `/api/v1/notifications/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
}
