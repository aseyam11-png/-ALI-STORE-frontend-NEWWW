import type { ApiResponse } from "@/lib/api/contracts";
import { apiClient } from "@/lib/api/http-client";

export interface BackendAddress {
  id: number;
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  isDefault: boolean;
}

export interface AddressInput {
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  isDefault?: boolean;
}

export async function getServerAddresses() {
  const response = await apiClient.request<ApiResponse<BackendAddress[]>>(
    "/api/v1/shipping-addresses/me",
  );
  return response.data;
}

export async function createServerAddress(input: AddressInput) {
  const response = await apiClient.request<ApiResponse<BackendAddress>>(
    "/api/v1/shipping-addresses",
    { method: "POST", body: JSON.stringify(input) },
  );
  return response.data;
}

export async function updateServerAddress(id: number, input: AddressInput) {
  const response = await apiClient.request<ApiResponse<BackendAddress>>(
    "/api/v1/shipping-addresses/" + id,
    { method: "PUT", body: JSON.stringify(input) },
  );
  return response.data;
}

export async function deleteServerAddress(id: number) {
  await apiClient.request<ApiResponse<null>>(
    "/api/v1/shipping-addresses/" + id,
    { method: "DELETE" },
  );
}

export async function setServerDefaultAddress(id: number) {
  const response = await apiClient.request<ApiResponse<BackendAddress>>(
    "/api/v1/shipping-addresses/" + id + "/default",
    { method: "PATCH" },
  );
  return response.data;
}
