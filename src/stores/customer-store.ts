"use client";

import { create } from "zustand";

import type {
  CustomerAddress,
} from "@/features/customer/types/customer.types";

interface CustomerState {
  addresses: CustomerAddress[];

  defaultAddressId?: string;

  addAddress: (
    address: Omit<
      CustomerAddress,
      "id"
    >,
  ) => void;

  updateAddress: (
    id: string,
    patch: Partial<
      CustomerAddress
    >,
  ) => void;

  removeAddress: (
    id: string,
  ) => void;

  setDefaultAddress: (
    id: string,
  ) => void;

  getDefaultAddress: () =>
    | CustomerAddress
    | undefined;
}

export const useCustomerStore =
  create<CustomerState>(
    (set, get) => ({
      addresses: [
        {
          id: "address-001",
          label: "Home",
          fullName: "Customer",
          phone: "+000 000 000",
          addressLine1:
            "Main delivery address",
          city: "Gaza",
          country: "Palestine",
          postalCode: "",
          isDefault: true,
        },
      ],

      defaultAddressId:
        "address-001",

      addAddress: (
        address,
      ) => {
        set((state) => {
          const id = `address-${Date.now()}`;

          const shouldBeDefault =
            address.isDefault ||
            state.addresses.length ===
              0;

          const nextAddresses =
            state.addresses.map(
              (item) =>
                shouldBeDefault
                  ? {
                      ...item,
                      isDefault: false,
                    }
                  : item,
            );

          nextAddresses.push({
            ...address,
            id,
            isDefault:
              shouldBeDefault,
          });

          return {
            addresses:
              nextAddresses,

            defaultAddressId:
              shouldBeDefault
                ? id
                : state.defaultAddressId,
          };
        });
      },

      updateAddress: (
        id,
        patch,
      ) => {
        set((state) => {
          const wantsDefault =
            patch.isDefault === true;

          const addresses =
            state.addresses.map(
              (item) => {
                if (
                  wantsDefault &&
                  item.id !== id
                ) {
                  return {
                    ...item,
                    isDefault: false,
                  };
                }

                if (
                  item.id === id
                ) {
                  return {
                    ...item,
                    ...patch,
                  };
                }

                return item;
              },
            );

          return {
            addresses,

            defaultAddressId:
              wantsDefault
                ? id
                : state.defaultAddressId,
          };
        });
      },

      removeAddress: (id) => {
        set((state) => {
          const remaining =
            state.addresses.filter(
              (item) =>
                item.id !== id,
            );

          let defaultAddressId =
            state.defaultAddressId;

          if (
            defaultAddressId ===
            id
          ) {
            const fallback =
              remaining[0];

            defaultAddressId =
              fallback?.id;

            if (fallback) {
              remaining[0] = {
                ...fallback,
                isDefault: true,
              };
            }
          }

          return {
            addresses:
              remaining,
            defaultAddressId,
          };
        });
      },

      setDefaultAddress: (
        id,
      ) => {
        set((state) => ({
          addresses:
            state.addresses.map(
              (item) => ({
                ...item,
                isDefault:
                  item.id === id,
              }),
            ),

          defaultAddressId:
            id,
        }));
      },

      getDefaultAddress: () => {
        const state = get();

        return (
          state.addresses.find(
            (item) =>
              item.id ===
              state.defaultAddressId ||
              item.isDefault,
          ) ??
          state.addresses[0]
        );
      },
    }),
  );