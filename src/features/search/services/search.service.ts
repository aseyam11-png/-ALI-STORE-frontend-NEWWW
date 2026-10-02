import type { SearchSuggestion } from "../types/search.types";
import { searchProducts } from "@/features/products/services/product.service";
import { getTopLevelCategories } from "@/features/catalog/services/category.service";
import { formatSAR } from "@/features/localization/services/currency.service";

export async function searchSuggestions(query: string): Promise<SearchSuggestion[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const lower = cleanQuery.toLocaleLowerCase();
  const suggestions: SearchSuggestion[] = [];

  for (const category of getTopLevelCategories()) {
    if (
      category.name.toLocaleLowerCase().includes(lower) ||
      category.description.toLocaleLowerCase().includes(lower)
    ) {
      suggestions.push({
        id: "cat-" + category.slug,
        label: category.name,
        subtitle: category.description,
        type: "CATEGORY",
        href: "/shop/categories/" + category.slug,
      });
    }
  }

  const products = await searchProducts(cleanQuery);

  for (const product of products.slice(0, 6)) {
    suggestions.push({
      id: "product-" + product.id,
      label: product.name,
      subtitle:
        product.sku +
        " · " +
        formatSAR(product.price.amount),
      type: "PRODUCT",
      href: "/shop/products/" + encodeURIComponent(product.id),
      image: product.thumbnail?.url,
    });
  }

  if (cleanQuery.length >= 2) {
    suggestions.push({
      id: "query-" + cleanQuery,
      label: cleanQuery,
      subtitle: "البحث في جميع المنتجات",
      type: "QUERY",
      href: "/shop/products?q=" + encodeURIComponent(cleanQuery),
    });
  }

  return suggestions.slice(0, 9);
}
