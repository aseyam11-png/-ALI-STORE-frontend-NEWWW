import { getProducts } from "@/features/products/services/product.service";
import { getTopLevelCategories } from "@/features/catalog/services/category.service";
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

  const brands: SearchSuggestion[] = Array.from(
    new Map(
      response.items
        .map((product) => product.brand?.name?.trim())
        .filter((brand): brand is string => Boolean(brand))
        .map((brand) => [brand.toLocaleLowerCase(), brand]),
    ).values(),
  )
    .filter((brand) => scoreText(brand, cleanQuery) > 0)
    .slice(0, 3)
    .map((brand) => ({
      id: `brand-${brand.toLocaleLowerCase()}`,
      label: brand,
      subtitle: "Brand",
      type: "BRAND" as const,
      href: `/shop/products?brand=${encodeURIComponent(brand)}`,
    }));

  const categories: SearchSuggestion[] = getTopLevelCategories()
    .filter(
      (category) =>
        scoreText(category.name, cleanQuery) > 0 ||
        scoreText(category.description, cleanQuery) > 0,
    )
    .slice(0, 3)
    .map((category) => ({
      id: `cat-${category.slug}`,
      label: category.name,
      subtitle: category.description,
      type: "CATEGORY" as const,
      href: `/shop/categories/${category.slug}`,
    }));

  return [
    ...categories,
    ...products,
    ...brands,
    {
      id: `query-${cleanQuery}`,
      label: cleanQuery,
      subtitle: "Search all products",
      type: "QUERY",
      href: `/shop/products?q=${encodeURIComponent(cleanQuery)}`,
    },
  ].slice(0, 12);
}
