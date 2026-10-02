import type { ApiResponse } from "@/lib/api/contracts";
import { apiClient } from "@/lib/api/http-client";

export interface ShippingQuote {
  method: "STANDARD" | "EXPRESS";
  amount: number;
  currency: string;
  estimatedDelivery: string;
}

export async function getShippingQuote(
  method: ShippingQuote["method"],
  subtotal: number,
) {
  const response = await apiClient.request<ApiResponse<ShippingQuote>>(
    "/api/v1/shipping/quote?method=" +
      encodeURIComponent(method) +
      "&subtotal=" +
      encodeURIComponent(String(Math.max(0, subtotal))),
  );
  return response.data;
}
