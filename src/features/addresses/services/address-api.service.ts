import { apiClient } from "@/lib/api/http-client";

export interface BackendShippingAddress {
  id: number;
  label?: string | null;
  recipientName?: string | null;
  phone?: string | null;
  street: string;
  area?: string | null;
  building?: string | null;
  apartment?: string | null;
  notes?: string | null;
  city: string;
  state?: string | null;
  country: string;
  postalCode?: string | null;
  isDefault: boolean;
}

export interface ShippingAddressInput {
  label?: string;
  recipientName?: string;
  phone?: string;
  street: string;
  area?: string;
  building?: string;
  apartment?: string;
  notes?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  isDefault?: boolean;
}

export async function getBackendAddresses() {
  return apiClient.request<BackendShippingAddress[]>("/v1/shipping-addresses/me");
}

export async function createBackendAddress(input: ShippingAddressInput) {
  return apiClient.request<BackendShippingAddress>("/v1/shipping-addresses", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateBackendAddress(id: number, input: ShippingAddressInput) {
  return apiClient.request<BackendShippingAddress>("/v1/shipping-addresses/" + id, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function setBackendDefaultAddress(id: number) {
  return apiClient.request<BackendShippingAddress>(
    "/v1/shipping-addresses/" + id + "/default",
    { method: "PATCH" },
  );
}

export async function deleteBackendAddress(id: number) {
  return apiClient.request<void>("/v1/shipping-addresses/" + id, {
    method: "DELETE",
  });
}
