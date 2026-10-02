import { create } from "zustand";

export interface CartItem {
  productId: string;
  serverItemId?: number;
  name: string;

  price: number;
  supplierPrice?: number;
  priceUnit: string;

  quantity: number;

  image?: string;

  minOrderQuantity: number;

  // Internal fulfillment source — never shown to customers
  supplierId?: string;
  supplier?: string;

  // Shipping information
  shippingCost?: number;
  shippingMethod?: string;
  estimatedDelivery?: string;

  // Optional product information
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

  setItems: (items: CartItem[]) => void;

  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;

  updateQuantity: (
    productId: string,
    quantity: number,
  ) => void;

  clearCart: () => void;

  getItemCount: () => number;
  getSubtotal: () => number;
  getShippingTotal: () => number;
  getGrandTotal: () => number;

  getEstimatedProfit: () => number;

  getShippingInfo: () => CartShippingInfo;
}

export const useCartStore = create<CartState>(
  (set, get) => ({
    items: [],

    setItems: (items) => {
      set({
        items,
      });
    },

    addItem: (item) => {
      set((state) => {
        const existingItem =
          state.items.find(
            (cartItem) =>
              cartItem.productId ===
                item.productId &&
              cartItem.variantId ===
                item.variantId,
          );

        if (existingItem) {
          return {
            items: state.items.map(
              (cartItem) =>
                cartItem.productId ===
                  item.productId &&
                cartItem.variantId ===
                  item.variantId
                  ? {
                      ...cartItem,
                      quantity:
                        cartItem.quantity +
                        item.quantity,
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
              quantity: Math.max(
                1,
                item.quantity,
              ),
            },
          ],
        };
      });
    },

    removeItem: (productId) => {
      set((state) => ({
        items: state.items.filter(
          (item) =>
            item.productId !==
            productId,
        ),
      }));
    },

    updateQuantity: (
      productId,
      quantity,
    ) => {
      set((state) => ({
        items: state.items.map(
          (item) =>
            item.productId === productId
              ? {
                  ...item,
                  quantity:
                    Math.max(
                      1,
                      Math.floor(
                        quantity,
                      ),
                    ),
                }
              : item,
        ),
      }));
    },

    clearCart: () => {
      set({ items: [] });
    },

    getItemCount: () => {
      return get().items.reduce(
        (total, item) =>
          total + item.quantity,
        0,
      );
    },

    getSubtotal: () => {
      return get().items.reduce(
        (total, item) =>
          total +
          item.price * item.quantity,
        0,
      );
    },

    getShippingTotal: () => {
      return get().getShippingInfo().cost;
    },

    getGrandTotal: () => {
      return (
        get().getSubtotal() +
        get().getShippingTotal()
      );
    },

    getEstimatedProfit: () => {
      return get().items.reduce(
        (total, item) =>
          total +
          Math.max(
            0,
            (item.price -
              (item.supplierPrice ?? item.price)) *
              item.quantity,
          ),
        0,
      );
    },

    // One flat shipment for the whole order — ALI STORE ships as a
    // single merchant, so shipping is a single order-level rate rather
    // than a fee summed per supplier group.
    getShippingInfo: () => {
      const items = get().items;

      if (items.length === 0) {
        return {
          cost: 0,
          method: "Standard shipping",
          estimatedDelivery: "",
        };
      }

      const rated = items.map((item) => ({
        item,
        cost: Math.max(0, Number(item.shippingCost ?? 0)),
      }));

      const highest = rated.reduce(
        (max, current) =>
          current.cost > max.cost ? current : max,
        rated[0],
      );

      return {
        cost: highest.cost,
        method:
          highest.item.shippingMethod ??
          "Standard shipping",
        estimatedDelivery:
          highest.item.estimatedDelivery ??
          "Delivery date will be confirmed at checkout",
      };
    },
  }),
);
