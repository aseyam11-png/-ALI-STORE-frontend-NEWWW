const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export type VisualSearchAvailability =
  | { available: true }
  | { available: false; reason: string };

export async function searchByImage(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image size must be 10 MB or less.");
  }

  // The backend currently has no computer-vision/embedding endpoint.
  // Do not fabricate similarity scores or return unrelated products.
  throw new Error(
    "البحث بالصورة غير متاح حاليًا. سيتم تفعيله عند ربط محرك الرؤية بالـBackend.",
  );
}

export function getVisualSearchAvailability(): VisualSearchAvailability {
  return {
    available: false,
    reason: "Visual search engine is not configured on the backend.",
  };
}
