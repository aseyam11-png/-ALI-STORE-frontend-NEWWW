"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { cartApi, type BackendCart } from "@/features/cart/services/cart-api.service";
import { HttpApiError } from "@/lib/api/http-client";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  supplierPrice?: number;
  priceUnit: string;
  quantity: number;
  image?: string;
  minOrderQuantity: number;
  supplierId?: string;
  supplier?: string;
  shippingCost?: number;
  shippingMethod?: string;
  estimatedDelivery?: string;
  variantId?: string;
  variantLabel?: string;
  serverItemId?: string;
}

export interface CartShippingInfo {
  cost: number;
  method: string;
  estimatedDelivery: string;
}

interface CartState {
  items: CartItem[];
  syncing: boolean;
  error: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  hydrateRemote: (mergeLocal?: boolean) => Promise<void>;
  getItemCount: () => number;
  getSubtotal: () => number;
  getShippingTotal: () => number;
  getGrandTotal: () => number;
  getEstimatedProfit: () => number;
  getShippingInfo: () => CartShippingInfo;
}

function numericProductId(id: string) {
  return /^\d+$/.test(id) ? Number(id) : null;
}

function mapRemote(cart: BackendCart, current: CartItem[]) {
  return cart.items.map((item) => {
    const existing = current.find((candidate) => candidate.productId === String(item.productId));
    return {
      productId: String(item.productId),
      name: item.productName,
      price: Number(item.productPrice),
      supplierPrice: existing?.supplierPrice,
      priceUnit: "piece",
      quantity: item.quantity,
      image: existing?.image,
      minOrderQuantity: 1,
      shippingMethod: "Delivery confirmed at fulfillment",
      estimatedDelivery: "Confirmed after supplier acceptance",
      serverItemId: String(item.id),
      variantId: existing?.variantId,
      variantLabel: existing?.variantLabel,
    } satisfies CartItem;
  });
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      syncing: false,
      error: null,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (candidate) => candidate.productId === item.productId && candidate.variantId === item.variantId,
          );
          if (existing) {
            return {
              items: state.items.map((candidate) =>
                candidate.productId === item.productId && candidate.variantId === item.variantId
                  ? { ...candidate, quantity: candidate.quantity + item.quantity }
                  : candidate,
              ),
              error: null,
            };
          }
          return { items: [...state.items, { ...item, quantity: Math.max(1, item.quantity) }], error: null };
        });

        const productId = numericProductId(item.productId);
        if (productId !== null) {
          void cartApi.add(productId, Math.max(1, item.quantity))
            .then((cart) => set({ items: mapRemote(cart, get().items), error: null }))
            .catch((error) => {
              if (error instanceof HttpApiError && error.status === 401) return;
              set({ error: error instanceof Error ? error.message : "تعذر تحديث السلة." });
            });
        }
      },

      removeItem: (productId) => {
        const item = get().items.find((candidate) => candidate.productId === productId);
        set((state) => ({ items: state.items.filter((candidate) => candidate.productId !== productId), error: null }));

        if (item?.serverItemId) {
          void cartApi.remove(Number(item.serverItemId))
            .then((cart) => set({ items: mapRemote(cart, get().items) }))
            .catch((error) => {
              if (error instanceof HttpApiError && error.status === 401) return;
              void get().hydrateRemote();
            });
        }
      },

      updateQuantity: (productId, quantity) => {
        const next = Math.max(1, Math.floor(quantity));
        const item = get().items.find((candidate) => candidate.productId === productId);
        set((state) => ({
          items: state.items.map((candidate) => candidate.productId === productId ? { ...candidate, quantity: next } : candidate),
          error: null,
        }));

        if (item?.serverItemId) {
          void cartApi.update(Number(item.serverItemId), next)
            .then((cart) => set({ items: mapRemote(cart, get().items) }))
            .catch((error) => {
              if (error instanceof HttpApiError && error.status === 401) return;
              void get().hydrateRemote();
            });
        }
      },

      clearCart: () => {
        set({ items: [], error: null });
        void cartApi.clear().catch(() => undefined);
      },

      hydrateRemote: async (mergeLocal = false) => {
        set({ syncing: true });
        const local = get().items;
        try {
          const remote = await cartApi.get();
          if (mergeLocal) {
            for (const item of local) {
              const productId = numericProductId(item.productId);
              if (productId === null) continue;
              const remoteItem = remote.items.find((candidate) => candidate.productId === productId);
              const missing = Math.max(0, item.quantity - (remoteItem?.quantity ?? 0));
              if (missing > 0) await cartApi.add(productId, missing);
            }
            const merged = await cartApi.get();
            set({ items: mapRemote(merged, local), syncing: false, error: null });
          } else {
            set({ items: mapRemote(remote, local), syncing: false, error: null });
          }
        } catch (error) {
          if (error instanceof HttpApiError && error.status === 401) {
            set({ syncing: false });
            return;
          }
          set({ syncing: false, error: error instanceof Error ? error.message : "تعذر مزامنة السلة." });
        }
      },

      getItemCount: () => get().items.reduce((total, item) => total + item.quantity, 0),
      getSubtotal: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
      getShippingTotal: () => get().getShippingInfo().cost,
      getGrandTotal: () => get().getSubtotal() + get().getShippingTotal(),
      getEstimatedProfit: () => get().items.reduce((total, item) => total + Math.max(0, (item.price - (item.supplierPrice ?? item.price)) * item.quantity), 0),
      getShippingInfo: () => ({
        cost: 0,
        method: "Delivery confirmed at fulfillment",
        estimatedDelivery: "Confirmed after supplier acceptance",
      }),
    }),
    { name: "alistore-cart", partialize: (state) => ({ items: state.items }) },
  ),
);
