import { getProducts } from "@/features/products/services/product.service";
import { getCategories, flattenCategoryTree } from "@/features/catalog/services/category-api.service";
import { formatCurrency } from "@/features/localization/services/currency.service";
import type { SearchSuggestion } from "../types/search.types";

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

export async function searchSuggestions(
  query: string,
): Promise<SearchSuggestion[]> {
  const cleanQuery = normalize(query);

  if (!cleanQuery) return [];

  const response = await getProducts({
    search: cleanQuery,
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
    pageSize: 24,
  });

  const products: SearchSuggestion[] = response.items.map((product) => ({
    id: `product-${product.id}`,
    label: product.name,
    subtitle: [
      product.brand?.name,
      formatCurrency(product.price.amount, product.price.currency),
    ]
      .filter(Boolean)
      .join(" · "),
    type: "PRODUCT",
    image: product.thumbnail?.url,
    href: `/shop/products/${encodeURIComponent(product.id)}`,
  }));

  const brandMap = new Map<string, string>();
  for (const product of response.items) {
    const name = product.brand?.name?.trim();
    const id = product.brand?.id;
    const numericId = Number(id);
    if (!name || !id || !Number.isInteger(numericId) || numericId < 1) continue;
    brandMap.set(name.toLocaleLowerCase(), id);
  }

  const brands: SearchSuggestion[] = Array.from(brandMap.entries())
    .filter(([name]) => scoreText(name, cleanQuery) > 0)
    .slice(0, 3)
    .map(([name, id]) => ({
      id: `brand-${id}`,
      label: name,
      subtitle: "Brand",
      type: "BRAND" as const,
      href: `/shop/products?brand=${encodeURIComponent(id)}`,
    }));

  const categories = flattenCategoryTree(
    await getCategories(),
  )
    .filter(
      (category) =>
        scoreText(category.name, cleanQuery) > 0 ||
        scoreText(category.description, cleanQuery) > 0,
    )
    .slice(0, 3)
    .map((category) => ({
      id: "cat-" + category.slug,
      label: category.name,
      subtitle: category.description,
      type: "CATEGORY" as const,
      href: "/shop/categories/" + category.slug,
    }));

  return [
    ...categories,
    ...products,
    ...brands,
    {
      id: `query-${cleanQuery}`,
      label: cleanQuery,
      subtitle: "Search all products",
      type: "QUERY" as const,
      href: `/shop/products?q=${encodeURIComponent(cleanQuery)}`,
    },
  ].slice(0, 12);
}
