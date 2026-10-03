import { apiClient } from "@/lib/api/http-client";
import type { CustomerAddress } from "../types/address.types";

export type BackendAddress = {
  id: number;
  street: string;
  city: string;
  label?: string | null;
  recipientName?: string | null;
  phone?: string | null;
  street: string;
  city: string;
  state?: string | null;
  country: string;
  postalCode?: string | null;
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
    area: address.state ?? "",
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
    street: address.street.trim(),
    city: address.city.trim(),
    state: address.area.trim() || undefined,
    country: address.country.trim(),
    postalCode: address.postalCode?.trim() || undefined,
    label: address.label.trim() || undefined,
    recipientName: address.recipientName.trim() || undefined,
    phone: address.phone.trim() || undefined,
    building: address.building?.trim() || undefined,
    apartment: address.apartment?.trim() || undefined,
    notes: address.notes?.trim() || undefined,
    isDefault: Boolean(address.isDefault),
  };
}

export async function getMyAddresses(): Promise<CustomerAddress[]> {
  return (await apiClient.requestData<BackendAddress[]>("/api/v1/shipping-addresses/me"))
    .map(fromBackend);
}

export async function createAddress(address: Omit<CustomerAddress, "id">): Promise<CustomerAddress> {
  const response = await apiClient.requestData<BackendAddress>("/api/v1/shipping-addresses", {
    method: "POST",
    body: JSON.stringify(toBackend(address)),
  });
  return fromBackend(response);
}

export async function updateAddress(id: string, address: Omit<CustomerAddress, "id">): Promise<CustomerAddress> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) throw new Error("Invalid address id");
  const response = await apiClient.requestData<BackendAddress>(`/api/v1/shipping-addresses/${numericId}`, {
    method: "PUT",
    body: JSON.stringify(toBackend(address)),
  });
  return fromBackend(response);
}

export async function setDefaultAddress(id: string): Promise<CustomerAddress> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) throw new Error("Invalid address id");
  const response = await apiClient.requestData<BackendAddress>(
    `/api/v1/shipping-addresses/${numericId}/default`,
    { method: "PATCH" },
  );
  return fromBackend(response);
}

export async function deleteAddress(id: string): Promise<void> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) throw new Error("Invalid address id");
  await apiClient.requestData<void>(`/api/v1/shipping-addresses/${numericId}`, {
    method: "DELETE",
  });
}