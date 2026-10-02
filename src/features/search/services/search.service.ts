import { formatSAR } from "@/features/localization/services/currency.service";
import type {
  SearchSuggestion,
} from "../types/search.types";

import { featuredProducts } from "@/mocks/products";
import { normalizeB2CProduct } from "@/features/products/services/b2c-product.mapper";
import { mapMockProductToSummary } from "@/features/products/services/product.mapper";
import { getTopLevelCategories } from "@/features/catalog/services/category.service";

// Derived from the one canonical category source rather than a second,
// independently-hardcoded department list — the previous hardcoded copy
// had drifted (e.g. a "fashion" entry pointing at the non-existent
// /shop/categories/apparel slug).
const categorySuggestions: SearchSuggestion[] = getTopLevelCategories().map(
  (category) => ({
    id: `cat-${category.slug}`,
    label: category.name,
    subtitle: category.description,
    type: "CATEGORY",
    href: `/shop/categories/${category.slug}`,
  }),
);

function normalize(value: string) {
  return value
    .trim()
    .toLocaleLowerCase();
}

/*
  PUBLISHED CATALOG BOUNDARY

  Production search must consume
  only products whose moderation status
  is PUBLISHED.

  The current frontend autocomplete remains
  mock-backed until the Spring Boot search API
  is connected.
*/

export async function searchSuggestions(
  query: string,
): Promise<SearchSuggestion[]> {
  const cleanQuery =
    normalize(query);

  if (!cleanQuery) {
    return [];
  }

  const products =
    featuredProducts
      .map(mapMockProductToSummary)
      .map(normalizeB2CProduct);

  const productSuggestions =
    products
      .filter((product) => {
        const haystack = [
          product.name,
          product.brand,
          product.category,
          product.subcategory ?? "",
        ]
          .join(" ")
          .toLocaleLowerCase();

        return haystack.includes(
          cleanQuery,
        );
      })
      .slice(0, 5)
      .map((product) => ({
        id: `product-${product.id}`,
        label: product.name,
        subtitle: `${product.brand} · ${formatSAR(product.price)}`,
        type: "PRODUCT" as const,
        href: `/shop/products/${encodeURIComponent(product.id)}`,
        image:
          product.images[0]?.url,
      }));

  const brandNames =
    Array.from(
      new Set(
        products
          .map(
            (product) =>
              product.brand,
          )
          .filter(Boolean),
      ),
    );

  const brandSuggestions =
    brandNames
      .filter((brand) =>
        normalize(brand).includes(
          cleanQuery,
        ),
      )
      .slice(0, 3)
      .map((brand) => ({
        id: `brand-${brand}`,
        label: brand,
        subtitle: "Brand",
        type: "BRAND" as const,
        href: `/shop/products?brand=${encodeURIComponent(brand)}`,
      }));

  const matchingCategories =
    categorySuggestions.filter(
      (category) =>
        normalize(
          category.label,
        ).includes(
          cleanQuery,
        ),
    );

  const directQuery: SearchSuggestion[] =
    cleanQuery.length >= 2
      ? [
          {
            id: `query-${cleanQuery}`,
            label: cleanQuery,
            subtitle: "Search all products",
            type: "QUERY",
            href: `/shop/products?q=${encodeURIComponent(cleanQuery)}`,
          },
        ]
      : [];

  return [
    ...matchingCategories.slice(
      0,
      3,
    ),
    ...productSuggestions,
    ...brandSuggestions,
    ...directQuery,
  ].slice(0, 9);
}

/*
  Future API boundary:

  GET /api/search/suggestions?q=elec

  Next.js
      ↓
  Spring Boot
      ↓
  Search Service
      ↓
  Elasticsearch / Meilisearch
*/