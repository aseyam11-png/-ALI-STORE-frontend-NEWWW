import type { AutocompleteSuggestion } from "../types/autocomplete.types";
import { searchProducts } from "@/features/products/services/product.service";
import { getTopLevelCategories } from "@/features/catalog/services/category.service";

function normalize(value: string) {
  return value.trim().toLocaleLowerCase();
}

function scoreText(text: string, query: string) {
  const t = normalize(text);
  const q = normalize(query);
  if (!q) return 0;
  if (t === q) return 100;
  if (t.startsWith(q)) return 85;
  if (t.includes(q)) return 65;
  return 0;
}

export async function getAutocompleteSuggestions(
  query: string,
  limit = 8,
): Promise<AutocompleteSuggestion[]> {
  const normalizedQuery = normalize(query);
  if (normalizedQuery.length < 2) return [];

  const results: AutocompleteSuggestion[] = [];

  for (const category of getTopLevelCategories()) {
    const score = Math.max(
      scoreText(category.name, normalizedQuery),
      scoreText(category.description, normalizedQuery),
    );

    if (score > 0) {
      results.push({
        id: category.slug,
        type: "CATEGORY",
        title: category.name,
        subtitle: category.description,
        href: `/shop/categories/${category.slug}`,
        score: score + 5,
      });
    }
  }

  const products = await searchProducts(query);

  for (const product of products) {
    const score = Math.max(
      scoreText(product.name, normalizedQuery),
      scoreText(product.sku, normalizedQuery),
      scoreText(product.category?.name ?? "", normalizedQuery),
      scoreText(product.brand?.name ?? "", normalizedQuery),
    );

    if (score > 0) {
      results.push({
        id: product.id,
        type: "PRODUCT",
        title: product.name,
        subtitle: `${product.sku} · ${product.category?.name ?? ""}`,
        href: `/shop/products/${encodeURIComponent(product.id)}`,
        image: product.thumbnail?.url,
        score,
      });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, limit));
}
