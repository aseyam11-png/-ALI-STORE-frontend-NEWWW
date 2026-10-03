import { apiClient } from "@/lib/api/http-client";
import type { BackendShipment } from "@/features/orders/services/order.service";

export async function updateAdminShipmentStatus(
  id: number,
  status: BackendShipment["status"],
): Promise<BackendShipment> {
  if (!Number.isInteger(id) || id < 1) throw new Error("Invalid shipment id");
  return apiClient.requestData<BackendShipment>(
    `/api/v1/shipments/${id}/status?status=${encodeURIComponent(status)}`,
    { method: "PATCH" },
  );
}