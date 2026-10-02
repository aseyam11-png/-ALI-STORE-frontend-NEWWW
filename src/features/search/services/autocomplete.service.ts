import { getProducts } from "@/features/products/services/product-api.service";
import type { AutocompleteSuggestion } from "../types/autocomplete.types";

export async function getAutocompleteSuggestions(
  query: string,
  limit = 8,
): Promise<AutocompleteSuggestion[]> {
  const clean = query.trim();
  if (clean.length < 2) return [];

  const response = await getProducts({
    q: clean,
    page: 0,
    pageSize: Math.min(20, Math.max(1, limit)),
    sort: "relevance",
  });

  return response.content.slice(0, limit).map((product, index) => ({
    id: product.id,
    type: "PRODUCT" as const,
    title: product.name,
    subtitle: product.brand + " · " + product.category,
    href: "/shop/products/" + encodeURIComponent(product.id),
    image: product.images[0]?.url,
    score: 100 - index,
  }));
}
