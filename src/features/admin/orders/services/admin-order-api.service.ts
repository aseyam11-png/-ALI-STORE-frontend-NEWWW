import { apiClient } from "@/lib/api/http-client";
import type { BackendOrder } from "@/features/orders/services/order-api.service";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type BackendOrderPage = {
  content: BackendOrder[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
};

export async function getAdminOrders(page = 0, size = 50) {
  const response = await apiClient.request<ApiResponse<BackendOrderPage>>(
    "/api/v1/admin/orders?page=" + page + "&size=" + size,
  );
  if (!response.success) throw new Error(response.message);
  return response.data;
}

export async function updateAdminOrderStatus(
  id: string | number,
  status: string,
) {
  const response = await apiClient.request<ApiResponse<BackendOrder>>(
    "/api/v1/admin/orders/" + encodeURIComponent(String(id)) + "/status",
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
  if (!response.success) throw new Error(response.message);
  return response.data;
}
