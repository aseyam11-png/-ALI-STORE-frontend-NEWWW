import { apiClient } from "@/lib/api/http-client";

import type { VisualSearchResult } from "../types/visual-search.types";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type BackendVisualSearchResult = {
  productId: number;
  productName: string;
  image?: string;
  similarity: number;
  price: number;
  brand: string;
  category: string;
};

function validateImage(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Please choose a JPG, PNG or WEBP image.");
  }
  if (file.size <= 0) {
    throw new Error("The selected image is empty.");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image must be 10 MB or less.");
  }
}

export async function searchByImage(file: File): Promise<VisualSearchResult[]> {
  validateImage(file);

  const formData = new FormData();
  formData.append("image", file, file.name);

  const results = await apiClient.requestData<BackendVisualSearchResult[]>(
    "/api/v1/visual-search",
    { method: "POST", body: formData },
  );

  return results.map((result) => ({
    id: "visual-" + result.productId,
    productId: String(result.productId),
    productName: result.productName,
    image: result.image,
    similarity: result.similarity,
    price: result.price,
    brand: result.brand,
    category: result.category,
  }));
}
