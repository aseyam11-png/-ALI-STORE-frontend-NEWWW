import { getProducts } from "@/features/products/services/product.service";
import { getCategories, flattenCategoryTree } from "@/features/catalog/services/category-api.service";
import type { ProductSummary } from "@/features/products/types/product.types";

import type {
  AutocompleteSuggestion,
} from "../types/autocomplete.types";

function normalize(value: string) {
  return value.trim().toLocaleLowerCase();
}

function scoreText(text: string, query: string) {
  const normalizedText = normalize(text);
  const normalizedQuery = normalize(query);

  if (normalizedText === normalizedQuery) return 100;
  if (normalizedText.startsWith(normalizedQuery)) return 85;
  if (normalizedText.includes(normalizedQuery)) return 65;

  return 0;
}

function productScore(product: ProductSummary, query: string) {
  return Math.max(
    scoreText(product.name, query),
    scoreText(product.sku, query),
    scoreText(product.brand?.name ?? "", query),
    scoreText(product.category?.name ?? "", query) - 10,
  );
}

function categorySuggestions(query: string): AutocompleteSuggestion[] {
  return getTopLevelCategories()
    .map((category) => ({
      id: category.slug,
      type: "CATEGORY" as const,
      title: category.name,
      subtitle: category.description,
      href: `/shop/categories/${category.slug}`,
      score: Math.max(
        scoreText(category.name, query),
        scoreText(category.description, query),
      ) + 5,
    }))
    .filter((suggestion) => suggestion.score > 5);
}

function productSuggestions(
  products: ProductSummary[],
  query: string,
): AutocompleteSuggestion[] {
  return products
    .map((product) => ({
      id: product.id,
      type: "PRODUCT" as const,
      title: product.name,
      subtitle: [product.brand?.name, product.category?.name]
        .filter(Boolean)
        .join(" · "),
      href: `/shop/products/${encodeURIComponent(product.id)}`,
      image: product.thumbnail?.url,
      score: productScore(product, query),
    }))
    .filter((suggestion) => suggestion.score > 0);
}

function brandSuggestions(
  products: ProductSummary[],
  query: string,
): AutocompleteSuggestion[] {
  const brands = new Map<string, string>();

  for (const product of products) {
    const name = product.brand?.name?.trim();
    if (!name) continue;

    brands.set(name.toLocaleLowerCase(), name);
  }

  return Array.from(brands.values())
    .map((brand) => ({
      id: `brand-${brand.toLocaleLowerCase()}`,
      type: "BRAND" as const,
      title: brand,
      subtitle: "Brand",
      href: `/shop/products?brand=${encodeURIComponent(brand)}`,
      score: scoreText(brand, query) + 3,
    }))
    .filter((suggestion) => suggestion.score > 3);
}

export async function getAutocompleteSuggestions(
  query: string,
  limit = 8,
): Promise<AutocompleteSuggestion[]> {
  const normalizedQuery = normalize(query);

  if (normalizedQuery.length < 2) return [];

  const [response, categories] = await Promise.all([
    getProducts({
    search: normalizedQuery,
    categoryId: undefined,
    subcategoryId: undefined,
    brand: undefined,
    supplierId: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    minRating: undefined,
    verifiedSupplierOnly: false,
    discountOnly: false,
    inStockOnly: true,
    featuredOnly: false,
    bestsellerOnly: false,
    newArrivalOnly: false,
    sort: "relevance",
    page: 1,
    pageSize: Math.min(24, Math.max(8, limit * 2)),
    }),
    getCategories(),
  ]);

  const liveCategories = flattenCategoryTree(categories);

  const categoryResults = liveCategories
    .map((category) => ({
      id: category.slug,
      type: "CATEGORY" as const,
      title: category.name,
      subtitle: category.description,
      href: "/shop/categories/" + category.slug,
      score: Math.max(
        scoreText(category.name, normalizedQuery),
        scoreText(category.description, normalizedQuery),
      ) + 5,
    }))
    .filter((suggestion) => suggestion.score > 5);

  return [
    ...categoryResults,
    ...productSuggestions(response.items, normalizedQuery),
    ...brandSuggestions(response.items, normalizedQuery),
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Math.min(20, limit)));
}
