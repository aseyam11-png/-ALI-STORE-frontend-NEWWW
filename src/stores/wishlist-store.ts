"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { WishlistProduct } from "@/features/wishlist/types/wishlist.types";

interface WishlistState {
  items: WishlistProduct[];
  productIds: string[];
  addItem: (product: WishlistProduct) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: WishlistProduct) => void;
  toggle: (product: WishlistProduct | string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

function buildProductIds(items: WishlistProduct[]) {
  return items.map((item) => item.id);
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      productIds: [],

      addItem: (product) => {
        set((state) => {
          if (state.items.some((item) => item.id === product.id)) {
            return state;
          }

          const items = [...state.items, product];
          return { items, productIds: buildProductIds(items) };
        });
      },

      removeItem: (productId) => {
        set((state) => {
          const items = state.items.filter((item) => item.id !== productId);
          return { items, productIds: buildProductIds(items) };
        });
      },

      toggleItem: (product) => {
        if (get().isInWishlist(product.id)) {
          get().removeItem(product.id);
        } else {
          get().addItem(product);
        }
      },

      // Legacy string callers are kept as a safe removal-only operation.
      // Customer-facing components pass the full product to toggleItem so
      // new wishlist entries always contain display data.
      toggle: (product) => {
        if (typeof product === "string") {
          get().removeItem(product);
          return;
        }

        get().toggleItem(product);
      },

      isInWishlist: (productId) =>
        get().items.some((item) => item.id === productId),

      clearWishlist: () => {
        set({ items: [], productIds: [] });
      },
    }),
    {
      name: "alistore-wishlist-v1",
      partialize: (state) => ({
        items: state.items,
        productIds: state.productIds,
      }),
    },
  ),
);
