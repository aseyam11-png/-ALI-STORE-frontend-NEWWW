import { create } from "zustand";
import { persist } from "zustand/middleware";

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
}

export interface CartShippingInfo {
  cost: number;
  method: string;
  estimatedDelivery: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getShippingTotal: () => number;
  getGrandTotal: () => number;
  getEstimatedProfit: () => number;
  getShippingInfo: () => CartShippingInfo;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const quantity = Math.max(
            item.minOrderQuantity || 1,
            Math.floor(item.quantity),
          );

          const existingIndex = state.items.findIndex(
            (cartItem) =>
              cartItem.productId === item.productId &&
              cartItem.variantId === item.variantId,
          );

          if (existingIndex < 0) {
            return {
              items: [...state.items, { ...item, quantity }],
            };
          }

          const items = [...state.items];
          const existing = items[existingIndex];
          items[existingIndex] = {
            ...existing,
            price: item.price,
            supplierPrice: item.supplierPrice,
            image: item.image ?? existing.image,
            shippingCost: item.shippingCost,
            shippingMethod: item.shippingMethod,
            estimatedDelivery: item.estimatedDelivery,
            quantity: existing.quantity + quantity,
          };
          return { items };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  quantity: Math.max(
                    item.minOrderQuantity || 1,
                    Math.floor(Number.isFinite(quantity) ? quantity : 1),
                  ),
                }
              : item,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((total, item) => total + item.price * item.quantity, 0),

      getShippingTotal: () => get().getShippingInfo().cost,

      getGrandTotal: () =>
        get().getSubtotal() + get().getShippingTotal(),

      getEstimatedProfit: () =>
        get().items.reduce(
          (total, item) =>
            total +
            Math.max(
              0,
              (item.price - (item.supplierPrice ?? item.price)) * item.quantity,
            ),
          0,
        ),

      getShippingInfo: () => {
        const items = get().items;
        if (items.length === 0) {
          return {
            cost: 0,
            method: "STANDARD",
            estimatedDelivery: "",
          };
        }

        const rated = items.map((item) => ({
          item,
          cost: Math.max(0, Number(item.shippingCost ?? 0)),
        }));

        const highest = rated.reduce((max, current) =>
          current.cost > max.cost ? current : max,
        rated[0]);

        return {
          cost: highest.cost,
          method: highest.item.shippingMethod ?? "STANDARD",
          estimatedDelivery:
            highest.item.estimatedDelivery ??
            "Delivery estimate will be confirmed at checkout",
        };
      },
    }),
    {
      name: "alistore-cart",
      version: 2,
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
    },
  ),
);
