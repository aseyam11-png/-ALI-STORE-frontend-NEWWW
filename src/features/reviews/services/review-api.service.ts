import { apiClient } from "@/lib/api/http-client";

export type BackendReview = {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  comment?: string | null;
  createdAt: string;
};

export async function getProductReviews(productId: string) {
  const numericId = Number(productId);
  if (!Number.isInteger(numericId) || numericId < 1) {
    return [];
  }

  return apiClient.request<BackendReview[]>(
    "/api/v1/reviews/product/" + numericId,
  );
}

export async function addProductReview(input: {
  productId: string;
  rating: number;
  comment: string;
}) {
  const numericId = Number(input.productId);
  if (!Number.isInteger(numericId) || numericId < 1) {
    throw new Error("Invalid product id");
  }

  return apiClient.request<BackendReview>("/api/v1/reviews", {
    method: "POST",
    body: JSON.stringify({
      productId: numericId,
      rating: input.rating,
      comment: input.comment.trim(),
    }),
  });
}