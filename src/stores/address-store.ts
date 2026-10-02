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

  replaceAddresses: (
    addresses: CustomerAddress[],
  ) => void;
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
      selectedAddressId: null,

      addAddress: (address) => {
        set((state) => {
          const id = "ADDR-" + Date.now();
          const addresses = address.isDefault
            ? state.addresses.map((item) => ({ ...item, isDefault: false }))
            : state.addresses;

          const next = [...addresses, { ...address, id }];
          return {
            addresses: next,
            selectedAddressId: address.isDefault ? id : state.selectedAddressId,
          };
        });
      },

      updateAddress: (id, address) => {
        set((state) => ({
          addresses: state.addresses.map((item) =>
            item.id === id ? { ...item, ...address } : item,
          ),
        }));
      },

      deleteAddress: (id) => {
        set((state) => {
          const deleted = state.addresses.find((item) => item.id === id);
          const remaining = state.addresses.filter((item) => item.id !== id);

          if (remaining.length === 0) {
            return { addresses: [], selectedAddressId: null };
          }

          if (deleted?.isDefault) {
            remaining[0] = { ...remaining[0], isDefault: true };
          }

          const selectedExists = remaining.some(
            (item) => item.id === state.selectedAddressId,
          );

          return {
            addresses: remaining,
            selectedAddressId: selectedExists
              ? state.selectedAddressId
              : remaining[0].id,
          };
        });
      },

      setDefaultAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.map((item) => ({
            ...item,
            isDefault: item.id === id,
          })),
          selectedAddressId: id,
        }));
      },

      selectAddress: (id) => {
        if (get().addresses.some((item) => item.id === id)) {
          set({ selectedAddressId: id });
        }
      },

      getSelectedAddress: () => {
        const state = get();
        return state.addresses.find(
          (item) => item.id === state.selectedAddressId,
        );
      },

      replaceAddresses: (addresses) => {
        const selected =
          addresses.find((item) => item.isDefault) ?? addresses[0];

        set({
          addresses,
          selectedAddressId: selected?.id ?? null,
        });
      },
    }),
    {
      name: "alistore-addresses",
      version: 2,
      partialize: (state) => ({
        addresses: state.addresses,
        selectedAddressId: state.selectedAddressId,
      }),
    },
  ),
);