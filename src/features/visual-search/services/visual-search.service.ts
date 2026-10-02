import type { VisualSearchResult } from "../types/visual-search.types";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export async function searchByImage(
  file: File,
): Promise<VisualSearchResult[]> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image size must be 10 MB or less.");
  }

  throw new Error(
    "البحث بالصورة غير متاح حاليًا. سيتم تفعيله عند ربط محرك الرؤية بالـBackend.",
  );
}

export function getVisualSearchAvailability() {
  return {
    available: false as const,
    reason: "Visual search engine is not configured on the backend.",
  };
}
