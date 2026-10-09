import { HttpApiError, apiClient } from "@/lib/api/http-client";

export type AiCatalogProduct = {
  id: number;
  name: string;
  slug: string;
  sku?: string | null;
  price: number | string;
  currency: string;
  availability?: string | null;
  availableQuantity?: number | null;
  categoryId?: number | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  brandId?: number | null;
  brandName?: string | null;
  images?: string[] | null;
  primaryImageUrl?: string | null;
};

export type AskAliResponse = {
  answer: string;
  suggestedQuery: string;
  products: AiCatalogProduct[];
  aiGenerated: boolean;
};

function validatePrompt(prompt: string) {
  const clean = prompt.trim();
  if (!clean) throw new Error("اكتب سؤالك أولًا.");
  if (clean.length > 1200) throw new Error("السؤال طويل جدًا.");
  return clean;
}

async function execute(prompt: string, mode: "ask" | "discover") {
  const clean = validatePrompt(prompt);
  try {
    return await apiClient.requestData<AskAliResponse>(`/api/v1/ai/${mode}`, {
      method: "POST",
      body: JSON.stringify({ prompt: clean }),
    });
  } catch (error) {
    if (error instanceof HttpApiError && error.status === 503) {
      throw new Error("خدمة Ask Ali غير متاحة حاليًا. استخدم البحث العادي للوصول إلى الكتالوج.");
    }
    throw error instanceof Error
      ? error
      : new Error("تعذر الاتصال بمساعد التسوق.");
  }
}

export function askAli(prompt: string) {
  return execute(prompt, "ask");
}

export function discoverWithAli(prompt: string) {
  return execute(prompt, "discover");
}