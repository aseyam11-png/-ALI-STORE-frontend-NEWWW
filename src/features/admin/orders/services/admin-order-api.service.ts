import { apiClient } from "@/lib/api/http-client";
import type { BackendOrder } from "@/features/orders/services/order.service";

export type AdminOrderItem = {
  id: number;
  productId: number;
  productSku?: string | null;
  productName: string;
  quantity: number;
  price: number;
  subTotal: number;
};

/**
 * Admin-only order payload. Customer contact information is returned only by
 * /api/v1/admin/orders and is not added to the customer-facing order contract.
 */
export type AdminOrder = Omit<BackendOrder, "items"> & {
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  items: AdminOrderItem[];
};

export type AdminOrderPage = {
  content: AdminOrder[];
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
  status: AdminOrder["status"],
): Promise<AdminOrder> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) throw new Error("Invalid order id");

  return apiClient.requestData<AdminOrder>(
    `/api/v1/admin/orders/${numericId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
}
