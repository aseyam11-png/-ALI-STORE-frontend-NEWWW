export type ReviewModerationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "HIDDEN";

export interface ModeratedReview {
  id: string;

  productId: string;
  productName: string;

  customerId: string;
  customerName: string;

  rating: number;

  title: string;
  body: string;

  verifiedPurchase: boolean;

  helpfulCount: number;

  status: ReviewModerationStatus;

  createdAt: string;

  adminNote?: string;
}