"use client";

import { create } from "zustand";

import type { CustomerAddress } from "@/features/addresses/types/address.types";
import {
  createAddress,
  deleteAddress,
  listAddresses,
  setDefaultAddress,
  updateAddress,
} from "@/features/addresses/services/address.service";

interface AddressState {
  addresses: CustomerAddress[];
  selectedAddressId: string | null;

  setAddresses: (
    addresses: CustomerAddress[],
  ) => void;

  hydrate: () => Promise<void>;

  addAddress: (
    address: Omit<CustomerAddress, "id">,
  ) => Promise<void>;

  updateAddress: (
    id: string,
    address: Partial<CustomerAddress>,
  ) => Promise<void>;

  deleteAddress: (
    id: string,
  ) => Promise<void>;

  setDefaultAddress: (
    id: string,
  ) => Promise<void>;

  selectAddress: (id: string) => void;

  getSelectedAddress: () =>
    | CustomerAddress
    | undefined;
}

function chooseSelection(
  addresses: CustomerAddress[],
  preferredId?: string | null,
) {
  return (
    addresses.find(
      (address) =>
        address.id === preferredId,
    )?.id ??
    addresses.find(
      (address) =>
        address.isDefault,
    )?.id ??
    addresses[0]?.id ??
    null
  );
}

export const useAddressStore =
  create<AddressState>(
    (set, get) => ({
      addresses: [],
      selectedAddressId: null,

      setAddresses: (addresses) => {
        set({
          addresses,
          selectedAddressId:
            chooseSelection(
              addresses,
              get().selectedAddressId,
            ),
        });
      },

      hydrate: async () => {
        const addresses =
          await listAddresses();

        set({
          addresses,
          selectedAddressId:
            chooseSelection(addresses),
        });
      },

      addAddress: async (
        address,
      ) => {
        const created =
          await createAddress(
            address,
          );

        set((state) => {
          const addresses =
            address.isDefault
              ? [
                  ...state.addresses.map(
                    (item) => ({
                      ...item,
                      isDefault:
                        false,
                    }),
                  ),
                  created,
                ]
              : [
                  ...state.addresses,
                  created,
                ];

          return {
            addresses,
            selectedAddressId:
              created.isDefault
                ? created.id
                : chooseSelection(
                    addresses,
                    state.selectedAddressId,
                  ),
          };
        });
      },

      updateAddress: async (
        id,
        address,
      ) => {
        const updated =
          await updateAddress(
            id,
            address,
          );

        set((state) => {
          const addresses =
            state.addresses.map(
              (item) =>
                item.id === id
                  ? updated
                  : address.isDefault
                    ? {
                        ...item,
                        isDefault:
                          false,
                      }
                    : item,
            );

          return {
            addresses,
            selectedAddressId:
              address.isDefault
                ? id
                : chooseSelection(
                    addresses,
                    state.selectedAddressId,
                  ),
          };
        });
      },

      deleteAddress: async (
        id,
      ) => {
        await deleteAddress(id);

        const addresses =
          await listAddresses();

        set((state) => ({
          addresses,
          selectedAddressId:
            chooseSelection(
              addresses,
              state.selectedAddressId ===
                id
                ? null
                : state.selectedAddressId,
            ),
        }));
      },

      setDefaultAddress: async (
        id,
      ) => {
        const updated =
          await setDefaultAddress(
            id,
          );

        set((state) => ({
          addresses:
            state.addresses.map(
              (item) =>
                item.id === id
                  ? updated
                  : {
                      ...item,
                      isDefault:
                        false,
                    },
            ),
          selectedAddressId:
            id,
        }));
      },

      selectAddress: (id) => {
        if (
          get().addresses.some(
            (address) =>
              address.id === id,
          )
        ) {
          set({
            selectedAddressId:
              id,
          });
        }
      },

      getSelectedAddress: () => {
        const state = get();

        return state.addresses.find(
          (address) =>
            address.id ===
            state.selectedAddressId,
        );
      },
    }),
  );
