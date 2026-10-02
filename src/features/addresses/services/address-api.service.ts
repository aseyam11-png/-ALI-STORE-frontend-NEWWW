import { apiClient } from "@/lib/api/http-client";
import type { CustomerAddress } from "../types/address.types";

export type BackendAddress = {
  id: number;
  street: string;
  city: string;
  state?: string | null;
  country: string;
  postalCode?: string | null;
  label?: string | null;
  recipientName?: string | null;
  phone?: string | null;
  area?: string | null;
  building?: string | null;
  apartment?: string | null;
  notes?: string | null;
  isDefault: boolean;
};

function fromBackend(address: BackendAddress): CustomerAddress {
  return {
    id: String(address.id),
    customerId: "me",
    label: address.label ?? "Address",
    recipientName: address.recipientName ?? "",
    phone: address.phone ?? "",
    country: address.country,
    city: address.city,
    area: address.area ?? "",
    street: address.street,
    building: address.building ?? "",
    apartment: address.apartment ?? "",
    postalCode: address.postalCode ?? "",
    notes: address.notes ?? "",
    isDefault: Boolean(address.isDefault),
  };
}

function toBackend(address: Omit<CustomerAddress, "id">) {
  return {
    street: address.street,
    city: address.city,
    state: address.area || undefined,
    country: address.country,
    postalCode: address.postalCode || undefined,
    label: address.label,
    recipientName: address.recipientName,
    phone: address.phone,
    area: address.area,
    building: address.building,
    apartment: address.apartment,
    notes: address.notes,
    isDefault: address.isDefault,
  };
}

export async function getMyAddresses(): Promise<CustomerAddress[]> {
  const data = await apiClient.request<BackendAddress[]>("/api/v1/shipping-addresses/me");
  return data.map(fromBackend);
}

export async function createAddress(address: Omit<CustomerAddress, "id">) {
  const data = await apiClient.request<BackendAddress>("/api/v1/shipping-addresses", {
    method: "POST",
    body: JSON.stringify(toBackend(address)),
  });
  return fromBackend(data);
}

export async function updateAddress(id: string, address: Omit<CustomerAddress, "id">) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) throw new Error("Invalid address id");

  const data = await apiClient.request<BackendAddress>(`/api/v1/shipping-addresses/${numericId}`, {
    method: "PUT",
    body: JSON.stringify(toBackend(address)),
  });
  return fromBackend(data);
}

export async function setDefaultAddress(id: string) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) throw new Error("Invalid address id");

  const data = await apiClient.request<BackendAddress>(`/api/v1/shipping-addresses/${numericId}/default`, {
    method: "PATCH",
  });
  return fromBackend(data);
}

export async function deleteAddress(id: string) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) throw new Error("Invalid address id");
  await apiClient.request<void>(`/api/v1/shipping-addresses/${numericId}`, {
    method: "DELETE",
  });
}
