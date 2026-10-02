import { apiClient } from "@/lib/api/http-client";
import type {
  BackendAddress,
} from "@/lib/api/contracts";
import type {
  CustomerAddress,
} from "@/features/addresses/types/address.types";

function mapAddress(
  address: BackendAddress,
): CustomerAddress {
  return {
    id: String(address.id),
    customerId: "",
    label: address.isDefault
      ? "Default address"
      : "Address",
    recipientName: "",
    phone: "",
    country: address.country,
    city: address.city,
    area: "",
    street: address.street,
    postalCode:
      address.postalCode ??
      undefined,
    isDefault:
      address.isDefault,
  };
}

export async function listAddresses(): Promise<CustomerAddress[]> {
  const addresses =
    await apiClient.request<BackendAddress[]>(
      "/api/v1/shipping-addresses/me",
    );

  return addresses.map(mapAddress);
}

export async function createAddress(
  address: Omit<CustomerAddress, "id">,
): Promise<CustomerAddress> {
  const response =
    await apiClient.request<BackendAddress>(
      "/api/v1/shipping-addresses",
      {
        method: "POST",
        body: JSON.stringify({
          street: address.street,
          city: address.city,
          state:
            address.area ||
            null,
          country: address.country,
          postalCode:
            address.postalCode ??
            null,
          isDefault:
            address.isDefault,
        }),
      },
    );

  return mapAddress(response);
}

export async function updateAddress(
  id: string,
  address: Partial<CustomerAddress>,
): Promise<CustomerAddress> {
  const response =
    await apiClient.request<BackendAddress>(
      `/api/v1/shipping-addresses/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        body: JSON.stringify({
          street:
            address.street ?? "",
          city:
            address.city ?? "",
          state:
            address.area ??
            null,
          country:
            address.country ?? "",
          postalCode:
            address.postalCode ??
            null,
          isDefault:
            address.isDefault,
        }),
      },
    );

  return mapAddress(response);
}

export async function deleteAddress(
  id: string,
): Promise<void> {
  await apiClient.request<void>(
    `/api/v1/shipping-addresses/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
}

export async function setDefaultAddress(
  id: string,
): Promise<CustomerAddress> {
  const response =
    await apiClient.request<BackendAddress>(
      `/api/v1/shipping-addresses/${encodeURIComponent(id)}/default`,
      {
        method: "PATCH",
      },
    );

  return mapAddress(response);
}
