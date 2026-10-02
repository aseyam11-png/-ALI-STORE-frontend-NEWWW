export type NotificationType =
  | "PRICE_DROP"
  | "BACK_IN_STOCK"
  | "ORDER_UPDATE"
  | "SHIPMENT_UPDATE"
  | "SUPPORT_MESSAGE"
  | "PROMOTION"
  | "SYSTEM";

export interface CustomerNotification {
  id: string;

  customerId: string;

  type: NotificationType;

  title: string;

  message: string;

  href?: string;

  createdAt: string;

  read: boolean;
}