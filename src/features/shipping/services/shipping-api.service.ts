import { apiClient } from "@/lib/api/http-client";

export type ShippingMethod = {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  estimatedMinDays: number;
  estimatedMaxDays: number;
  countryCode?: string | null;
  active: boolean;
};

export async function getShippingMethods(
  country?: string,
  currency?: string,
): Promise<ShippingMethod[]> {
  const params = new URLSearchParams();
  if (country?.trim()) params.set("country", country.trim().toUpperCase());
  if (currency?.trim()) params.set("currency", currency.trim().toUpperCase());

  const query = params.toString();
  return apiClient.requestData<ShippingMethod[]>(
    "/api/v1/shipping/methods" + (query ? "?" + query : ""),
  );
}