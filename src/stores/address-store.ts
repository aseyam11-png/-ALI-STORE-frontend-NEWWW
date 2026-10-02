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

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],
      selectedAddressId: null,

      addAddress: (address) => set((state) => {
        const id = `address-${Date.now()}`;
        const makeDefault = address.isDefault || state.addresses.length === 0;
        const next = state.addresses.map((item) => makeDefault ? { ...item, isDefault: false } : item);
        next.push({ ...address, id, isDefault: makeDefault });
        return { addresses: next, selectedAddressId: makeDefault ? id : state.selectedAddressId };
      }),

      updateAddress: (id, patch) => set((state) => {
        const makeDefault = patch.isDefault === true;
        const next = state.addresses.map((item) => {
          if (makeDefault && item.id !== id) return { ...item, isDefault: false };
          return item.id === id ? { ...item, ...patch } : item;
        });
        return { addresses: next, selectedAddressId: makeDefault ? id : state.selectedAddressId };
      }),

      deleteAddress: (id) => set((state) => {
        const next = state.addresses.filter((item) => item.id !== id);
        const selectedAddressId = state.selectedAddressId === id ? next[0]?.id ?? null : state.selectedAddressId;
        return { addresses: next, selectedAddressId };
      }),

      setDefaultAddress: (id) => set((state) => ({
        addresses: state.addresses.map((item) => ({ ...item, isDefault: item.id === id })),
        selectedAddressId: id,
      })),

      selectAddress: (id) => set({ selectedAddressId: id }),

      getSelectedAddress: () => {
        const state = get();
        return state.addresses.find((item) => item.id === state.selectedAddressId)
          ?? state.addresses.find((item) => item.isDefault)
          ?? state.addresses[0];
      },
    }),
    {
      name: "alistore-addresses",
      partialize: (state) => ({
        addresses: state.addresses,
        selectedAddressId: state.selectedAddressId,
      }),
    },
  ),
);
