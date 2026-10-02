import { apiClient } from "@/lib/api/http-client";

type ApiResponse<T> = { success: boolean; message: string; data: T };

export type ShippingQuote = {
  method: "STANDARD" | "EXPRESS";
  amount: number | string;
  currency: string;
  estimatedMinDays: number;
  estimatedMaxDays: number;
  free: boolean;
};

export async function getShippingQuote(subtotal: number, method: "STANDARD" | "EXPRESS") {
  const params = new URLSearchParams({
    subtotal: String(Math.max(0, subtotal)),
    method,
  });
  const response = await apiClient.request<ApiResponse<ShippingQuote>>(
    "/api/v1/shipping/quote?" + params.toString(),
  );
  if (!response.success) throw new Error(response.message);
  return response.data;
}
