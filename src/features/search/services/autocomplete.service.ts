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

function editDistance(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let i = 1; i <= left.length; i += 1) {
    const current = [i];

    for (let j = 1; j <= right.length; j += 1) {
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1),
      );
    }

    for (let j = 0; j < current.length; j += 1) {
      previous[j] = current[j];
    }
  }

  return previous[right.length];
}

function fuzzyTextScore(text: string, query: string): number {
  const normalizedText = normalize(text);
  const normalizedQuery = normalize(query);

  if (normalizedQuery.length < 3 || !normalizedText) return 0;

  const tokens = normalizedText.split(/[\s\-_/.]+/).filter(Boolean);
  const candidates = [normalizedText, ...tokens];

  const maxDistance =
    normalizedQuery.length <= 5
      ? 1
      : Math.max(1, Math.floor(normalizedQuery.length / 4));

  let bestDistance = Number.POSITIVE_INFINITY;
  for (const candidate of candidates) {
    if (
      Math.abs(candidate.length - normalizedQuery.length) >
      maxDistance + 1
    ) {
      continue;
    }

    bestDistance = Math.min(
      bestDistance,
      editDistance(normalizedQuery, candidate),
    );
  }

  if (bestDistance > maxDistance) return 0;
  return 58 - bestDistance * 12;
}

function productScore(product: ProductSummary, query: string) {
  return Math.max(
    scoreText(product.name, query),
    scoreText(product.sku, query),
    scoreText(product.brand?.name ?? "", query),
    scoreText(product.category?.name ?? "", query) - 10,
    fuzzyTextScore(product.name, query),
    fuzzyTextScore(product.sku, query),
    fuzzyTextScore(product.brand?.name ?? "", query) - 3,
  );
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
  const brands = new Map<string, { id: string; name: string }>();

  for (const product of products) {
    const name = product.brand?.name?.trim();
    if (!name) continue;

    const brandId = product.brand?.id;
    const numericBrandId = Number(brandId);
    if (!brandId || !Number.isInteger(numericBrandId) || numericBrandId < 1) continue;

    brands.set(name.toLocaleLowerCase(), { id: brandId, name });
  }

  return Array.from(brands.values())
    .map((brand) => ({
      id: `brand-${brand.id}`,
      type: "BRAND" as const,
      title: brand.name,
      subtitle: "Brand",
      href: `/shop/products?brand=${encodeURIComponent(brand.id)}`,
      score: scoreText(brand.name, query) + 3,
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

  const fuzzyCandidates =
    response.items.length > 0
      ? response.items
      : (
          await getProducts({
            search: "",
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
            pageSize: 100,
          })
        ).items;

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
    ...productSuggestions(fuzzyCandidates, normalizedQuery),
    ...brandSuggestions(fuzzyCandidates, normalizedQuery),
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Math.min(20, limit)));
}
