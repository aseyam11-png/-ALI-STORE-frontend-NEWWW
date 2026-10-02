import type { AutocompleteSuggestion } from "../types/autocomplete.types";
import { searchProducts } from "@/features/products/services/product.service";
import { getTopLevelCategories } from "@/features/catalog/services/category.service";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function scoreText(text: string, query: string) {
  const normalizedText = normalize(text);
  const normalizedQuery = normalize(query);

  if (normalizedText === normalizedQuery) return 100;
  if (normalizedText.startsWith(normalizedQuery)) return 85;
  if (normalizedText.includes(normalizedQuery)) return 65;
  return 0;
}

export async function getAutocompleteSuggestions(
  query: string,
  limit = 8,
): Promise<AutocompleteSuggestion[]> {
  const normalizedQuery = normalize(query);
  if (normalizedQuery.length < 2) return [];

  const products = await searchProducts(query);
  const results: AutocompleteSuggestion[] = [];

  for (const product of products) {
    const score = Math.max(
      scoreText(product.name, normalizedQuery),
      scoreText(product.sku, normalizedQuery),
      scoreText(product.category?.name ?? "", normalizedQuery) - 10,
      scoreText(product.brand?.name ?? "", normalizedQuery) - 10,
    );

    if (score > 0) {
      results.push({
        id: product.id,
        type: "PRODUCT",
        title: product.name,
        subtitle: product.brand?.name ?? product.category?.name ?? "ALI STORE",
        href: `/shop/products/${encodeURIComponent(product.id)}`,
        image: product.thumbnail?.url,
        score,
      });
    }
  }

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
        href: `/shop/products?category=${encodeURIComponent(category.slug)}`,
        score: score + 5,
      });
    }
  }

  const brands = Array.from(
    new Map(
      products
        .filter((product) => product.brand?.name)
        .map((product) => [product.brand!.name.toLowerCase(), product.brand!.name]),
    ).values(),
  );

  for (const brand of brands) {
    const score = scoreText(brand, normalizedQuery);
    if (score > 0) {
      results.push({
        id: `brand-${brand.toLowerCase()}`,
        type: "BRAND",
        title: brand,
        subtitle: "Brand",
        href: `/shop/products?brand=${encodeURIComponent(brand)}`,
        score: score + 3,
      });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
