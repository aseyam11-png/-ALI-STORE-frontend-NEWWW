"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  CustomerAddress,
} from "@/features/addresses/types/address.types";

interface AddressState {
  addresses: CustomerAddress[];

  selectedAddressId: string | null;

  addAddress: (
    address: Omit<
      CustomerAddress,
      "id"
    >,
  ) => void;

  updateAddress: (
    id: string,
    address: Partial<CustomerAddress>,
  ) => void;

  deleteAddress: (
    id: string,
  ) => void;

  setDefaultAddress: (
    id: string,
  ) => void;

  selectAddress: (
    id: string,
  ) => void;

  getSelectedAddress: () =>
    | CustomerAddress
    | undefined;
}

const initialAddresses: CustomerAddress[] =
  [
    {
      id: "ADDR-1001",

      customerId:
        "customer-001",

      label: "Home",

      recipientName:
        "Customer",

      phone:
        "+970 59 000 0000",

      country:
        "Palestine",

      city:
        "Gaza",

      area:
        "Al-Rimal",

      street:
        "Main Street",

      building:
        "12",

      apartment:
        "4",

      postalCode:
        "",

      notes:
        "Please call before delivery.",

      isDefault:
        true,
    },

    {
      id: "ADDR-1002",

      customerId:
        "customer-001",

      label:
        "Work",

      recipientName:
        "Customer",

      phone:
        "+970 59 000 0000",

      country:
        "Palestine",

      city:
        "Gaza",

      area:
        "Al-Nasr",

      street:
        "Office Road",

      building:
        "8",

      apartment:
        "2",

      postalCode:
        "",

      notes:
        "",

      isDefault:
        false,
    },
  ];

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],
      selectedAddressId: undefined,

      addAddress: (address) => {
        set((state) => {
          const id = `address-${Date.now()}`;
          const makeDefault = address.isDefault || state.addresses.length === 0;
          const addresses = state.addresses.map((item) => makeDefault ? { ...item, isDefault: false } : item);
          addresses.push({ ...address, id, isDefault: makeDefault });
          return { addresses, selectedAddressId: makeDefault ? id : state.selectedAddressId };
        });
      },

      updateAddress: (id, patch) => {
        set((state) => {
          const makeDefault = patch.isDefault === true;
          const addresses = state.addresses.map((item) => {
            if (makeDefault && item.id !== id) return { ...item, isDefault: false };
            return item.id === id ? { ...item, ...patch } : item;
          });
          return { addresses, selectedAddressId: makeDefault ? id : state.selectedAddressId };
        });
      },

      deleteAddress: (id) => {
        set((state) => {
          const addresses = state.addresses.filter((item) => item.id !== id);
          const selectedAddressId = state.selectedAddressId === id ? addresses[0]?.id : state.selectedAddressId;
          return { addresses, selectedAddressId };
        });
      },

      setDefaultAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.map((item) => ({ ...item, isDefault: item.id === id })),
          selectedAddressId: id,
        }));
      },

      selectAddress: (id) => set({ selectedAddressId: id }),

      getSelectedAddress: () => {
        const state = get();
        return state.addresses.find((item) => item.id === state.selectedAddressId) ?? state.addresses.find((item) => item.isDefault) ?? state.addresses[0];
      },
    }),
    { name: "alistore-addresses", partialize: (state) => ({ addresses: state.addresses, selectedAddressId: state.selectedAddressId }) },
  ),
);
