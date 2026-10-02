import type { AutocompleteSuggestion } from "../types/autocomplete.types";

import { getTopLevelCategories } from "@/features/catalog/services/category.service";
import { searchProducts } from "@/features/products/services/product.service";

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

const categories = getTopLevelCategories().map((category) => ({
  id: category.slug,
  title: category.name,
  subtitle: category.description,
  href: "/shop/products?category=" + encodeURIComponent(category.slug),
}));

export async function getAutocompleteSuggestions(
  query: string,
  limit = 8,
): Promise<AutocompleteSuggestion[]> {
  const normalizedQuery = normalize(query);

  if (normalizedQuery.length < 2) {
    return [];
  }

  const products = await searchProducts(query);
  const results: AutocompleteSuggestion[] = [];

  for (const product of products) {
    const score = Math.max(
      scoreText(product.name, normalizedQuery),
      scoreText(product.brand?.name ?? "", normalizedQuery),
      scoreText(product.category?.name ?? "", normalizedQuery) - 10,
      scoreText(product.sku, normalizedQuery),
    );

    if (score > 0) {
      results.push({
        id: product.id,
        type: "PRODUCT",
        title: product.name,
        subtitle:
          (product.brand?.name ?? "ALI STORE") +
          " · " +
          (product.category?.name ?? "General"),
        href: "/shop/products/" + encodeURIComponent(product.id),
        image: product.thumbnail?.url,
        score,
      });
    }
  }

  for (const category of categories) {
    const score = Math.max(
      scoreText(category.title, normalizedQuery),
      scoreText(category.subtitle, normalizedQuery),
    );

    if (score > 0) {
      results.push({
        id: category.id,
        type: "CATEGORY",
        title: category.title,
        subtitle: category.subtitle,
        href: category.href,
        score: score + 5,
      });
    }
  }

  const uniqueBrands = new Map<string, string>();

  for (const product of products) {
    const brand = product.brand?.name?.trim();

    if (brand) {
      uniqueBrands.set(normalize(brand), brand);
    }
  }

  for (const brand of uniqueBrands.values()) {
    const score = scoreText(brand, normalizedQuery);

    if (score > 0) {
      results.push({
        id: "brand-" + normalize(brand),
        type: "BRAND",
        title: brand,
        subtitle: "Brand",
        href:
          "/shop/products?brand=" +
          encodeURIComponent(brand),
        score: score + 3,
      });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
