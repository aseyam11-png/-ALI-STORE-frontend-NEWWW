"use client";

import { create } from "zustand";

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

const initialAddresses: CustomerAddress[] = [];

export const useAddressStore =
  create<AddressState>(
    (set, get) => ({
      addresses:
        initialAddresses,

      selectedAddressId:
        null,

      addAddress: (
        address,
      ) => {
        set((state) => {
          const id =
            `ADDR-${Date.now()}`;

          let addresses =
            state.addresses;

          if (
            address.isDefault
          ) {
            addresses =
              addresses.map(
                (
                  existing,
                ) => ({
                  ...existing,
                  isDefault:
                    false,
                }),
              );
          }

          const newAddress: CustomerAddress =
            {
              ...address,
              id,
            };

          addresses = [
            ...addresses,
            newAddress,
          ];

          return {
            addresses,
            selectedAddressId:
              newAddress.isDefault
                ? id
                : state.selectedAddressId,
          };
        });
      },

      updateAddress: (
        id,
        address,
      ) => {
        set((state) => {
          let addresses =
            state.addresses;

          if (
            address.isDefault
          ) {
            addresses =
              addresses.map(
                (
                  existing,
                ) => ({
                  ...existing,
                  isDefault:
                    existing.id ===
                    id,
                }),
              );
          }

          addresses =
            addresses.map(
              (existing) =>
                existing.id === id
                  ? {
                      ...existing,
                      ...address,
                    }
                  : existing,
            );

          return {
            addresses,
          };
        });
      },

      deleteAddress: (
        id,
      ) => {
        set((state) => {
          const remaining =
            state.addresses.filter(
              (address) =>
                address.id !== id,
            );

          if (
            remaining.length === 0
          ) {
            return {
              addresses: [],
              selectedAddressId:
                null,
            };
          }

          const deletedWasDefault =
            state.addresses.some(
              (address) =>
                address.id === id &&
                address.isDefault,
            );

          if (
            deletedWasDefault
          ) {
            remaining[0] = {
              ...remaining[0],
              isDefault: true,
            };
          }

          const selectedStillExists =
            remaining.some(
              (address) =>
                address.id ===
                state.selectedAddressId,
            );

          return {
            addresses:
              remaining,

            selectedAddressId:
              selectedStillExists
                ? state.selectedAddressId
                : remaining[0].id,
          };
        });
      },

      setDefaultAddress: (
        id,
      ) => {
        set((state) => ({
          addresses:
            state.addresses.map(
              (address) => ({
                ...address,
                isDefault:
                  address.id === id,
              }),
            ),

          selectedAddressId:
            id,
        }));
      },

      selectAddress: (
        id,
      ) => {
        const exists =
          get().addresses.some(
            (address) =>
              address.id === id,
          );

        if (!exists) {
          return;
        }

        set({
          selectedAddressId:
            id,
        });
      },

      getSelectedAddress: () => {
        const state =
          get();

        return state.addresses.find(
          (address) =>
            address.id ===
            state.selectedAddressId,
        );
      },
    }),
  );