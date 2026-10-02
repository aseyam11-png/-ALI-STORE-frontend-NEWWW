import type {
  AutocompleteSuggestion,
} from "../types/autocomplete.types";

import {
  featuredProducts,
} from "@/mocks/products";

import {
  normalizeB2CProduct,
} from "@/features/products/services/b2c-product.mapper";

import {
  mapMockProductToSummary,
} from "@/features/products/services/product.mapper";

import {
  getTopLevelCategories,
} from "@/features/catalog/services/category.service";

const products =
  featuredProducts
    .map(mapMockProductToSummary)
    .map(normalizeB2CProduct);

// Derived from the one canonical category source rather than a second,
// independently-hardcoded department list — previously this array drifted
// out of sync with features/catalog/data/category-tree.ts (the source
// /shop/categories/[slug] actually reads).
const categories = getTopLevelCategories().map(
  (category) => ({
    id: category.slug,
    title: category.name,
    subtitle: category.description,
    href: `/shop/products?category=${category.slug}`,
  }),
);

const brands = Array.from(
  new Map(
    products.map(
      (product) => [
        product.brand
          .trim()
          .toLowerCase(),
        product.brand.trim(),
      ],
    ),
  ).values(),
);

function normalize(
  value: string,
) {
  return value
    .trim()
    .toLowerCase();
}

function scoreText(
  text: string,
  query: string,
) {
  const normalizedText =
    normalize(text);

  const normalizedQuery =
    normalize(query);

  if (
    normalizedText ===
    normalizedQuery
  ) {
    return 100;
  }

  if (
    normalizedText.startsWith(
      normalizedQuery,
    )
  ) {
    return 85;
  }

  if (
    normalizedText.includes(
      normalizedQuery,
    )
  ) {
    return 65;
  }

  return 0;
}

export function getAutocompleteSuggestions(
  query: string,
  limit = 8,
): AutocompleteSuggestion[] {
  const normalizedQuery =
    normalize(query);

  if (
    normalizedQuery.length <
    2
  ) {
    return [];
  }

  const results: AutocompleteSuggestion[] =
    [];

  for (const product of products) {
    const score = Math.max(
      scoreText(
        product.name,
        normalizedQuery,
      ),
      scoreText(
        product.brand,
        normalizedQuery,
      ),
      scoreText(
        product.category,
        normalizedQuery,
      ) - 10,
    );

    if (score > 0) {
      results.push({
        id:
          product.id,
        type:
          "PRODUCT",
        title:
          product.name,
        subtitle:
          `${product.brand} · ${product.category}`,
        href:
          `/shop/products/${encodeURIComponent(
            product.id,
          )}`,
        image:
          product.images[0]
            ?.url,
        score,
      });
    }
  }

  for (const category of categories) {
    const score = Math.max(
      scoreText(
        category.title,
        normalizedQuery,
      ),
      scoreText(
        category.subtitle,
        normalizedQuery,
      ),
    );

    if (score > 0) {
      results.push({
        id:
          category.id,
        type:
          "CATEGORY",
        title:
          category.title,
        subtitle:
          category.subtitle,
        href:
          category.href,
        score:
          score + 5,
      });
    }
  }

  for (const brand of brands) {
    const score =
      scoreText(
        brand,
        normalizedQuery,
      );

    if (score > 0) {
      results.push({
        id:
          `brand-${brand}`,
        type:
          "BRAND",
        title:
          brand,
        subtitle:
          "Brand",
        href:
          `/shop/products?brand=${encodeURIComponent(
            brand,
          )}`,
        score:
          score + 3,
      });
    }
  }

  return results
    .sort(
      (a, b) =>
        b.score -
        a.score,
    )
    .slice(
      0,
      limit,
    );
}