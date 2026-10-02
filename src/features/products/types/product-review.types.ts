export type ProductReview = {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  title?: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
  helpfulCount: number;
};

export type ProductReviewPage = {
  items: ProductReview[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};
