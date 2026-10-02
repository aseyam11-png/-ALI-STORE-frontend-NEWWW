"use client";

import { create } from "zustand";

import type {
  WishlistProduct,
} from "@/features/wishlist/types/wishlist.types";

interface WishlistState {
  items: WishlistProduct[];

  setItems: (
    items: WishlistProduct[],
  ) => void;

  /*
   * Backward-compatible fields used by older components.
   */
  productIds: string[];

  addItem: (
    product: WishlistProduct,
  ) => void;

  removeItem: (
    productId: string,
  ) => void;

  toggleItem: (
    product: WishlistProduct,
  ) => void;

  /*
   * Backward-compatible alias.
   */
  toggle: (
    product: WishlistProduct | string,
  ) => void;

  isInWishlist: (
    productId: string,
  ) => boolean;

  clearWishlist: () => void;
}

function buildProductIds(
  items: WishlistProduct[],
) {
  return items.map(
    (item) => item.id,
  );
}

export const useWishlistStore =
  create<WishlistState>(
    (set, get) => ({
      items: [],
      productIds: [],

      setItems: (items) =>
        set({
          items,
          productIds:
            buildProductIds(items),
        }),

      addItem: (product) => {
        set((state) => {
          const exists =
            state.items.some(
              (item) =>
                item.id ===
                product.id,
            );

          if (exists) {
            return state;
          }

          const items = [
            ...state.items,
            product,
          ];

          return {
            items,
            productIds:
              buildProductIds(
                items,
              ),
          };
        });
      },

      removeItem: (
        productId,
      ) => {
        set((state) => {
          const items =
            state.items.filter(
              (item) =>
                item.id !==
                productId,
            );

          return {
            items,
            productIds:
              buildProductIds(
                items,
              ),
          };
        });
      },

      toggleItem: (product) => {
        const exists =
          get().items.some(
            (item) =>
              item.id ===
              product.id,
          );

        if (exists) {
          get().removeItem(
            product.id,
          );
        } else {
          get().addItem(
            product,
          );
        }
      },

      toggle: (product) => {
        if (typeof product === "string") {
          const exists = get().items.some(
            (item) => item.id === product,
          );

          if (exists) {
            get().removeItem(product);
          }

          return;
        }

        get().toggleItem(product);
      },

      isInWishlist: (
        productId,
      ) =>
        get().items.some(
          (item) =>
            item.id ===
            productId,
        ),

      clearWishlist: () => {
        set({
          items: [],
          productIds: [],
        });
      },
    }),
  );
