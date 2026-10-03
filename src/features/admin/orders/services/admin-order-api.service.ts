import { apiClient } from "@/lib/api/http-client";
import type { BackendOrder } from "@/features/orders/services/order.service";

export type AdminOrderPage = {
  content: BackendOrder[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
};

export async function getAdminOrders(page = 0, size = 50): Promise<AdminOrderPage> {
  return apiClient.requestData<AdminOrderPage>(
    `/api/v1/admin/orders?page=${Math.max(0, page)}&size=${Math.min(100, Math.max(1, size))}`,
  );
}

export async function updateAdminOrderStatus(
  id: string | number,
  status: BackendOrder["status"],
): Promise<BackendOrder> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) throw new Error("Invalid order id");

  return apiClient.requestData<BackendOrder>(
    `/api/v1/admin/orders/${numericId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
}