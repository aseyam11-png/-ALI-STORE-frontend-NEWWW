export interface ProductReview {
  id: string;

  productId: string;

  customerId: string;
  customerName: string;

  rating: number;

  title: string;
  body: string;

  verifiedPurchase: boolean;

  helpfulCount: number;

  createdAt: string;
}

export interface ReviewSummary {
  average: number;

  total: number;

  distribution: {
    rating: 1 | 2 | 3 | 4 | 5;
    count: number;
    percentage: number;
  }[];
}