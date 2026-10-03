"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { apiClient } from "@/lib/api/http-client";

import type {
  WishlistProduct,
} from "@/features/wishlist/types/wishlist.types";

interface WishlistState {
  items: WishlistProduct[];

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
  hydrateRemote: () => Promise<void>;
}

function buildProductIds(
  items: WishlistProduct[],
) {
  return items.map(
    (item) => item.id,
  );
}

export const useWishlistStore =
  create<WishlistState>()(
    persist(
      (set, get) => ({
      items: [],

      productIds: [],

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

      toggleItem: async (product) => {
        const exists = get().productIds.includes(product.id);
        const previousItems = get().items;
        const previousIds = get().productIds;

        if (exists) get().removeItem(product.id);
        else get().addItem(product);

        if (!/^\d+$/.test(product.id)) return;

        try {
          if (exists) {
            await apiClient.request(`/api/v1/wishlists/product/${encodeURIComponent(product.id)}`, { method: "DELETE" });
          } else {
            await apiClient.request("/api/v1/wishlists", {
              method: "POST",
              body: JSON.stringify({ productId: Number(product.id) }),
            });
          }
        } catch (error) {
          const status = typeof error === "object" && error !== null && "status" in error
            ? Number((error as { status?: number }).status)
            : 0;
          if (status !== 401) set({ items: previousItems, productIds: previousIds });
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
        set({ items: [], productIds: [] });
      },

      hydrateRemote: async () => {
        try {
          const response = await apiClient.request<{
            success: boolean;
            message: string;
            data: Array<{ productId: number }>;
          }>("/api/v1/wishlists");
          const remoteIds = response.data.map((item) => String(item.productId));
          set((state) => ({
            productIds: Array.from(new Set([...state.productIds, ...remoteIds])),
          }));
        } catch (error) {
          const status = typeof error === "object" && error !== null && "status" in error
            ? Number((error as { status?: number }).status)
            : 0;
          if (status !== 401) throw error;
        }
      },
      }),
      {
        name: "alistore-wishlist",
        partialize: (state) => ({
          items: state.items,
          productIds: state.productIds,
        }),
      },
    ),
  );
