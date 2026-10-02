import type { AutocompleteSuggestion } from "../types/autocomplete.types";
import { fetchProducts, fetchCategories } from "@/features/products/services/product-api.service";

export async function getAutocompleteSuggestions(query: string, limit = 8): Promise<AutocompleteSuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const [products, categories] = await Promise.all([
    fetchProducts({ q, page: 0, pageSize: Math.min(12, limit) }),
    fetchCategories(),
  ]);

  const productSuggestions: AutocompleteSuggestion[] = products.content.slice(0, limit).map((product) => ({
    id: String(product.id),
    type: "PRODUCT",
    title: product.name,
    subtitle: product.sku ?? product.categoryName ?? "",
    href: `/shop/products/${product.id}`,
    image: product.primaryImageUrl ?? undefined,
    score: 100,
  }));

  const categorySuggestions: AutocompleteSuggestion[] = categories
    .filter((category) => category.active && category.name.toLocaleLowerCase().includes(q.toLocaleLowerCase()))
    .slice(0, 3)
    .map((category) => ({
      id: String(category.id),
      type: "CATEGORY",
      title: category.name,
      subtitle: category.description ?? "",
      href: `/shop/products?category=${encodeURIComponent(category.slug)}`,
      score: 110,
    }));

  return [...categorySuggestions, ...productSuggestions]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, limit);
}
