import { apiClient } from "@/lib/api/http-client";

export type BackendReview = {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  comment?: string | null;
  createdAt: string;
};

export async function getProductReviews(productId: string): Promise<BackendReview[]> {
  const numericId = Number(productId);
  if (!Number.isInteger(numericId) || numericId < 1) return [];
  return apiClient.requestData<BackendReview[]>(`/api/v1/reviews/product/${numericId}`);
}

export async function addProductReview(input: {
  productId: string;
  rating: number;
  comment: string;
}): Promise<BackendReview> {
  const numericId = Number(input.productId);
  if (!Number.isInteger(numericId) || numericId < 1) throw new Error("Invalid product id");
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    throw new Error("Rating must be an integer from 1 to 5");
  }

  return apiClient.requestData<BackendReview>("/api/v1/reviews", {
    method: "POST",
    body: JSON.stringify({
      productId: numericId,
      rating: input.rating,
      comment: input.comment.trim(),
    }),
  });
}