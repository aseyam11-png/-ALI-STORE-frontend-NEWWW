import type { VisualSearchResult } from "../types/visual-search.types";

export async function searchByImage(file: File): Promise<VisualSearchResult[]> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file.");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Image size must be 10 MB or less.");
  }

  throw new Error(
    "البحث بالصورة غير مفعّل بعد لأن خدمة الرؤية/البحث المتجهي غير موصولة بالـbackend. لم يتم إنشاء نتائج وهمية.",
  );
}
