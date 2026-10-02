export type SupportRole =
  | "CUSTOMER"
  | "ADMIN";

export type SupportConversationStatus =
  | "OPEN"
  | "PENDING"
  | "RESOLVED"
  | "CLOSED";

export interface SupportParticipant {
  id: string;
  name: string;
  role: SupportRole;
}

export interface SupportMessage {
  id: string;

  conversationId: string;

  senderId: string;
  senderName: string;
  senderRole: SupportRole;

  body: string;

  createdAt: string;

  read: boolean;
}

export interface SupportConversation {
  id: string;

  orderId?: string;
  shipmentId?: string;

  customerId: string;
  customerName: string;

  subject: string;

  category:
    | "ORDER"
    | "SHIPPING"
    | "PRODUCT"
    | "PAYMENT"
    | "OTHER";

  status: SupportConversationStatus;

  participants: SupportParticipant[];

  messages: SupportMessage[];

  createdAt: string;
  updatedAt: string;

  lastMessageAt: string;
}