"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomerAddress } from "@/features/addresses/types/address.types";

interface AddressState {
  addresses: CustomerAddress[];
  selectedAddressId: string | null;
  addAddress: (address: Omit<CustomerAddress, "id">) => void;
  updateAddress: (id: string, address: Partial<CustomerAddress>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  selectAddress: (id: string) => void;
  getSelectedAddress: () => CustomerAddress | undefined;
}

function normalize(addresses: CustomerAddress[]) {
  const firstDefault = addresses.findIndex((address) => address.isDefault);

  if (firstDefault === -1 && addresses.length > 0) {
    return addresses.map((address, index) => ({
      ...address,
      isDefault: index === 0,
    }));
  }

  return addresses.map((address, index) => ({
    ...address,
    isDefault: firstDefault === index,
  }));
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],
      selectedAddressId: null,

      addAddress: (address) => {
        set((state) => {
          const id = "ADDR-" + Date.now();
          const next = {
            ...address,
            id,
          };
          const addresses = normalize(
            address.isDefault
              ? [...state.addresses.map((item) => ({ ...item, isDefault: false })), next]
              : [...state.addresses, next],
          );
          return {
            addresses,
            selectedAddressId: address.isDefault
              ? id
              : state.selectedAddressId ?? id,
          };
        });
      },

      updateAddress: (id, patch) => {
        set((state) => {
          const addresses = state.addresses.map((address) =>
            address.id === id ? { ...address, ...patch } : address,
          );
          return {
            addresses: patch.isDefault
              ? normalize(addresses)
              : addresses,
          };
        });
      },

      deleteAddress: (id) => {
        set((state) => {
          const remaining = state.addresses.filter((address) => address.id !== id);
          const addresses = normalize(remaining);
          return {
            addresses,
            selectedAddressId:
              state.selectedAddressId === id
                ? addresses[0]?.id ?? null
                : state.selectedAddressId,
          };
        });
      },

      setDefaultAddress: (id) => {
        set((state) => ({
          addresses: normalize(
            state.addresses.map((address) => ({
              ...address,
              isDefault: address.id === id,
            })),
          ),
          selectedAddressId: id,
        }));
      },

      selectAddress: (id) => {
        if (!get().addresses.some((address) => address.id === id)) return;
        set({ selectedAddressId: id });
      },

      getSelectedAddress: () => {
        const state = get();
        return state.addresses.find((address) => address.id === state.selectedAddressId);
      },
    }),
    {
      name: "alistore-addresses",
      version: 2,
      partialize: (state) => ({
        addresses: state.addresses,
        selectedAddressId: state.selectedAddressId,
      }),
      skipHydration: true,
    },
  ),
);
