export type PageResponse<T> = {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type BackendUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  role: string;
};

export type BackendProduct = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  currency: string;
  sku?: string | null;
  status:
    | "DRAFT"
    | "ACTIVE"
    | "ARCHIVED";
  availability:
    | "IN_STOCK"
    | "OUT_OF_STOCK"
    | "UNKNOWN";
  categoryId: number;
  categoryName: string;
  brandId?: number | null;
  brandName?: string | null;
  images: string[];
  primaryImageUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type BackendCartItem = {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  currency: string;
  quantity: number;
  subTotal: number;
};

export type BackendCart = {
  id: number | null;
  items: BackendCartItem[];
  totalPrice: number;
  currency?: string | null;
};

export type BackendShipmentSummary = {
  id: number;
  status:
    | "PENDING"
    | "PROCESSING"
    | "SHIPPED"
    | "IN_TRANSIT"
    | "DELIVERED"
    | "CANCELLED";
  carrier?: string | null;
  trackingNumber?: string | null;
  estimatedDeliveryDate?: string | null;
};

export type BackendOrderItem = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subTotal: number;
};

export type BackendOrder = {
  id: number;
  status:
    | "PENDING"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  totalAmount: number;
  currency?: string | null;
  couponCode?: string | null;
  discountAmount?: number | null;
  shippingAddress: string;
  createdAt: string;
  items: BackendOrderItem[];
  shipments: BackendShipmentSummary[];
};

export type BackendPayment = {
  id: number;
  orderId: number;
  amount: number;
  method:
    | "CREDIT_CARD"
    | "PAYPAL"
    | "CASH_ON_DELIVERY";
  status:
    | "PENDING"
    | "COMPLETED"
    | "FAILED"
    | "REFUNDED";
  transactionId?: string | null;
  createdAt: string;
};

export type BackendAddress = {
  id: number;
  street: string;
  city: string;
  state?: string | null;
  country: string;
  postalCode?: string | null;
  isDefault: boolean;
};

export type BackendWishlistItem = {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
};

export type BackendNotification = {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export type BackendCoupon = {
  id: number;
  code: string;
  discountPercentage: number;
  expirationDate: string;
  isActive: boolean;
  usageLimit?: number | null;
  timesUsed: number;
  minimumOrderAmount?: number | null;
};

export type CreateOrderPayload = {
  shippingAddress: string;
  couponCode?: string;
};

export type CreatePaymentPayload = {
  orderId: number;
  amount: number;
  method:
    | "CREDIT_CARD"
    | "PAYPAL"
    | "CASH_ON_DELIVERY";
};
