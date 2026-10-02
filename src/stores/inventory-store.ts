"use client";

import { create } from "zustand";
import type { InventoryRecord } from "@/features/inventory/types/inventory.types";

interface InventoryState {
  records: Record<string, InventoryRecord>;

  seed: (
    records: InventoryRecord[],
  ) => void;

  getRecord: (
    productId: string,
  ) => InventoryRecord | undefined;

  getAvailableStock: (
    productId: string,
  ) => number;

  isAvailable: (
    productId: string,
  ) => boolean;

  updateRecord: (
    productId: string,
    patch: Partial<InventoryRecord>,
  ) => void;

  decrementStock: (
    productId: string,
    quantity: number,
  ) => void;

  incrementStock: (
    productId: string,
    quantity: number,
  ) => void;

  syncAll: () => void;
}

const initialInventory: InventoryRecord[] = [
  {
    productId: "p-001",
    sellerId: "seller-001",
    stock: 18,
    reserved: 2,
    available: 16,
    price: 89.99,
    currency: "SAR",
    lastSyncedAt: new Date().toISOString(),
    supplierStatus: "ONLINE",
  },
  {
    productId: "p-002",
    sellerId: "seller-002",
    stock: 4,
    reserved: 1,
    available: 3,
    price: 129.99,
    currency: "SAR",
    lastSyncedAt: new Date().toISOString(),
    supplierStatus: "ONLINE",
  },
  {
    productId: "p-003",
    sellerId: "seller-003",
    stock: 0,
    reserved: 0,
    available: 0,
    price: 49.99,
    currency: "SAR",
    lastSyncedAt: new Date().toISOString(),
    supplierStatus: "OUT_OF_STOCK",
  },
];

function normalize(record: InventoryRecord) {
  const stock = Math.max(
    0,
    Math.floor(record.stock),
  );

  const reserved = Math.min(
    stock,
    Math.max(
      0,
      Math.floor(record.reserved),
    ),
  );

  return {
    ...record,
    stock,
    reserved,
    available: Math.max(
      0,
      stock - reserved,
    ),
  };
}

export const useInventoryStore =
  create<InventoryState>((set, get) => ({
    records: Object.fromEntries(
      initialInventory.map((record) => [
        record.productId,
        normalize(record),
      ]),
    ),

    seed: (records) => {
      set({
        records: Object.fromEntries(
          records.map((record) => [
            record.productId,
            normalize(record),
          ]),
        ),
      });
    },

    getRecord: (productId) =>
      get().records[productId],

    getAvailableStock: (productId) =>
      get().records[productId]?.available ??
      0,

    isAvailable: (productId) =>
      (get().records[productId]?.available ??
        0) > 0,

    updateRecord: (
      productId,
      patch,
    ) => {
      set((state) => {
        const current =
          state.records[productId];

        if (!current) {
          return state;
        }

        const next = normalize({
          ...current,
          ...patch,
          productId,
        });

        return {
          records: {
            ...state.records,
            [productId]: next,
          },
        };
      });
    },

    decrementStock: (
      productId,
      quantity,
    ) => {
      set((state) => {
        const current =
          state.records[productId];

        if (!current) {
          return state;
        }

        const safeQuantity = Math.max(
          0,
          Math.floor(quantity),
        );

        const next = normalize({
          ...current,
          stock:
            current.stock -
            safeQuantity,
        });

        if (next.available === 0) {
          next.supplierStatus =
            "OUT_OF_STOCK";
        }

        return {
          records: {
            ...state.records,
            [productId]: next,
          },
        };
      });
    },

    incrementStock: (
      productId,
      quantity,
    ) => {
      set((state) => {
        const current =
          state.records[productId];

        if (!current) {
          return state;
        }

        const next = normalize({
          ...current,
          stock:
            current.stock +
            Math.max(
              0,
              Math.floor(quantity),
            ),
          supplierStatus: "ONLINE",
          lastSyncedAt:
            new Date().toISOString(),
        });

        return {
          records: {
            ...state.records,
            [productId]: next,
          },
        };
      });
    },

    syncAll: () => {
      set((state) => {
        const now =
          new Date().toISOString();

        const records = Object.fromEntries(
          Object.entries(
            state.records,
          ).map(([id, record]) => {
            const next =
              normalize({
                ...record,
                lastSyncedAt: now,
              });

            if (next.available === 0) {
              next.supplierStatus =
                "OUT_OF_STOCK";
            }

            return [id, next];
          }),
        );

        return { records };
      });
    },
  }));