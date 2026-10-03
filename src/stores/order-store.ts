import { create } from "zustand";
import type { CartItem } from "./cart-store";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type ShipmentStatus =
  | "PENDING"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED";

export interface OrderTrackingEvent {
  id: string;
  status: ShipmentStatus;
  title: string;
  description: string;
  location?: string;
  timestamp: string;
  completed: boolean;
}

export interface OrderAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface Order {
  id: string;
  createdAt: string;

  customerName: string;
  customerEmail: string;

  address: OrderAddress;

  paymentMethod: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED";

  subtotal: number;
  shippingCost: number;
  grandTotal: number;

  fulfillmentCost: number;
  estimatedProfit: number;

  status: OrderStatus;

  items: CartItem[];

  shippingMethod: string;
  estimatedDelivery: string;

  shipmentStatus: ShipmentStatus;
  carrier?: string;
  trackingNumber?: string;

  events: OrderTrackingEvent[];

  updatedAt: string;
}

interface CreateOrderInput {
  customerName: string;
  customerEmail: string;

  address: OrderAddress;

  paymentMethod: string;

  items: CartItem[];

  shippingMethod: string;
  estimatedDelivery: string;

  subtotal: number;
  shippingCost: number;
  grandTotal: number;
}

interface OrderState {
  orders: Order[];

  createOrder: (
    input: CreateOrderInput,
  ) => Order;

  getOrder: (orderId: string) => Order | undefined;

  updateOrderStatus: (
    orderId: string,
    status: ShipmentStatus,
  ) => void;

  updateOrderTracking: (
    orderId: string,
    carrier: string,
    trackingNumber: string,
    estimatedDelivery: string,
  ) => void;

  addTrackingEvent: (
    orderId: string,
    status: ShipmentStatus,
    title: string,
    description: string,
    location?: string,
  ) => void;

  getCustomerOrders: (
    customerEmail: string,
  ) => Order[];
}

function createOrderId() {
  const timestamp =
    Date.now().toString().slice(-8);

  return `AS-${timestamp}`;
}

export const useOrderStore =
  create<OrderState>((set, get) => ({
    orders: [],

    createOrder: (input) => {
      const orderId =
        createOrderId();

      const timestamp =
        new Date().toISOString();

      const fulfillmentCost =
        input.items.reduce(
          (total, item) =>
            total +
            (item.supplierPrice ?? 0) *
              item.quantity,
          0,
        );

      const estimatedProfit =
        input.items.reduce(
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

      const order: Order = {
        id: orderId,

        createdAt: timestamp,

        customerName:
          input.customerName,

        customerEmail:
          input.customerEmail,

        address:
          input.address,

        paymentMethod:
          input.paymentMethod,

        paymentStatus: "PAID",

        subtotal:
          input.subtotal,

        shippingCost:
          input.shippingCost,

        grandTotal:
          input.grandTotal,

        fulfillmentCost,

        estimatedProfit,

        status: "PAID",

        items: input.items,

        shippingMethod:
          input.shippingMethod,

        estimatedDelivery:
          input.estimatedDelivery,

        shipmentStatus: "PROCESSING",

        events: [
          {
            id: `${orderId}-EV1`,
            status: "PROCESSING",
            title: "Order received",
            description:
              "Your order has been received and is being prepared.",
            timestamp,
            completed: true,
          },
          {
            id: `${orderId}-EV2`,
            status: "PACKED",
            title: "Package packed",
            description:
              "Your package is being packed for shipment.",
            timestamp,
            completed: false,
          },
          {
            id: `${orderId}-EV3`,
            status: "SHIPPED",
            title: "Package shipped",
            description:
              "Your package has been handed to the carrier.",
            timestamp,
            completed: false,
          },
          {
            id: `${orderId}-EV4`,
            status: "IN_TRANSIT",
            title: "In transit",
            description:
              "Your package is moving through the delivery network.",
            location: "Regional hub",
            timestamp,
            completed: false,
          },
          {
            id: `${orderId}-EV5`,
            status: "OUT_FOR_DELIVERY",
            title: "Out for delivery",
            description:
              "Your package is out for delivery.",
            location: "Destination",
            timestamp,
            completed: false,
          },
          {
            id: `${orderId}-EV6`,
            status: "DELIVERED",
            title: "Delivered",
            description:
              "Your package was delivered successfully.",
            location: "Destination",
            timestamp,
            completed: false,
          },
        ],

        updatedAt: timestamp,
      };

      set((state) => ({
        orders: [
          order,
          ...state.orders,
        ],
      }));

      return order;
    },

    getOrder: (orderId) =>
      get().orders.find(
        (order) =>
          order.id === orderId,
      ),

    updateOrderStatus: (
      orderId,
      status,
    ) => {
      const timestamp =
        new Date().toISOString();

      set((state) => ({
        orders: state.orders.map(
          (order) => {
            if (order.id !== orderId) {
              return order;
            }

            return {
              ...order,

              shipmentStatus: status,

              events:
                order.events.map(
                  (event) => ({
                    ...event,

                    completed:
                      event.completed ||
                      event.status ===
                        status,

                    timestamp:
                      event.status ===
                      status
                        ? timestamp
                        : event.timestamp,
                  }),
                ),

              updatedAt:
                timestamp,
            };
          },
        ),
      }));
    },

    updateOrderTracking: (
      orderId,
      carrier,
      trackingNumber,
      estimatedDelivery,
    ) => {
      const timestamp =
        new Date().toISOString();

      set((state) => ({
        orders: state.orders.map(
          (order) =>
            order.id === orderId
              ? {
                  ...order,

                  carrier:
                    carrier.trim() ||
                    undefined,

                  trackingNumber:
                    trackingNumber.trim() ||
                    undefined,

                  estimatedDelivery:
                    estimatedDelivery.trim(),

                  updatedAt:
                    timestamp,
                }
              : order,
        ),
      }));
    },

    addTrackingEvent: (
      orderId,
      status,
      title,
      description,
      location,
    ) => {
      const timestamp =
        new Date().toISOString();

      set((state) => ({
        orders: state.orders.map(
          (order) => {
            if (order.id !== orderId) {
              return order;
            }

            return {
              ...order,

              shipmentStatus: status,

              events: [
                ...order.events.map(
                  (event) => ({
                    ...event,

                    completed:
                      event.completed ||
                      event.status ===
                        status,
                  }),
                ),

                {
                  id: `${orderId}-${Date.now()}`,

                  status,

                  title,

                  description,

                  location,

                  timestamp,

                  completed: true,
                },
              ],

              updatedAt:
                timestamp,
            };
          },
        ),
      }));
    },

    getCustomerOrders: (
      customerEmail,
    ) =>
      get().orders.filter(
        (order) =>
          order.customerEmail ===
          customerEmail,
      ),
  }));
