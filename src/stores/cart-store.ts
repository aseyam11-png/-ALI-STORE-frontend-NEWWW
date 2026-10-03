import { create } from "zustand";

export interface CartItem {
  productId: string;
  backendItemId?: number;
  name: string;

  price: number;
  priceUnit: string;
  currency?: string;

  quantity: number;

  image?: string;

  minOrderQuantity: number;

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
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  replaceItems: (items: CartItem[]) => void;

  getItemCount: () => number;
  getSubtotal: () => number;
  getShippingTotal: () => number;
  getGrandTotal: () => number;
  getShippingInfo: () => CartShippingInfo;
}

function isSameCartLine(item: CartItem, productId: string, variantId?: string) {
  return item.productId === productId && item.variantId === variantId;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) => {
    set((state) => {
      const existingItem = state.items.find((cartItem) =>
        isSameCartLine(cartItem, item.productId, item.variantId),
      );

      if (existingItem) {
        return {
          items: state.items.map((cartItem) =>
            isSameCartLine(cartItem, item.productId, item.variantId)
              ? {
                  ...cartItem,
                  quantity: cartItem.quantity + item.quantity,
                }
              : cartItem,
          ),
        };
      }

      return {
        items: [
          ...state.items,
          {
            ...item,
            quantity: Math.max(1, item.quantity),
          },
        ],
      };
    });
  },

  removeItem: (productId, variantId) => {
    set((state) => ({
      items: state.items.filter(
        (item) => !isSameCartLine(item, productId, variantId),
      ),
    }));
  },

  updateQuantity: (productId, quantity, variantId) => {
    set((state) => ({
      items: state.items.map((item) =>
        isSameCartLine(item, productId, variantId)
          ? {
              ...item,
              quantity: Math.max(1, Math.floor(quantity)),
            }
          : item,
      ),
    }));
  },

  clearCart: () => {
    set({ items: [] });
  },

  replaceItems: (items) => {
    set({
      items: items.map((item) => ({
        ...item,
        quantity: Math.max(1, Math.floor(item.quantity)),
      })),
    });
  },

  getItemCount: () =>
    get().items.reduce((total, item) => total + item.quantity, 0),

  getSubtotal: () =>
    get().items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    ),

  getShippingTotal: () => get().getShippingInfo().cost,

  getGrandTotal: () =>
    get().getSubtotal() + get().getShippingTotal(),

  getShippingInfo: () => ({
    cost: 0,
    method: "Calculated at checkout",
    estimatedDelivery: "Calculated at checkout",
  }),
}));
