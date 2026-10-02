import {
  featuredProducts,
} from "@/mocks/products";

import {
  normalizeB2CProduct,
} from "@/features/products/services/b2c-product.mapper";

import {
  mapMockProductToSummary,
} from "@/features/products/services/product.mapper";

import type {
  RecommendationItem,
  RecommendationType,
} from "../types/recommendation.types";

const products =
  featuredProducts
    .map(mapMockProductToSummary)
    .map(normalizeB2CProduct);

function similarityScore(
  source: (typeof products)[number],
  target: (typeof products)[number],
) {
  let score = 0;

  if (
    source.category ===
    target.category
  ) {
    score += 40;
  }

  if (
    source.brand ===
    target.brand
  ) {
    score += 25;
  }

  if (
    source.subcategory &&
    target.subcategory &&
    source.subcategory ===
      target.subcategory
  ) {
    score += 20;
  }

  const sharedTags =
    (source.tags ?? []).filter(
      (tag) =>
        target.tags?.includes(
          tag,
        ),
    );

  score +=
    sharedTags.length * 5;

  return score;
}

export function getSimilarProducts(
  productId: string,
  limit = 4,
): RecommendationItem[] {
  const source =
    products.find(
      (product) =>
        product.id ===
        productId,
    );

  if (!source) {
    return [];
  }

  return products
    .filter(
      (product) =>
        product.id !==
        productId,
    )
    .map(
      (product) => ({
        productId:
          product.id,
        reason:
          "SIMILAR" as RecommendationType,
        score:
          similarityScore(
            source,
            product,
          ),
      }),
    )
    .filter(
      (item) =>
        item.score > 0,
    )
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

export function getFrequentlyBoughtProducts(
  productId: string,
  limit = 3,
): RecommendationItem[] {
  const source =
    products.find(
      (product) =>
        product.id ===
        productId,
    );

  if (!source) {
    return [];
  }

  return products
    .filter(
      (product) =>
        product.id !==
        productId,
    )
    .map(
      (product) => ({
        productId:
          product.id,
        reason:
          "FREQUENTLY_BOUGHT" as RecommendationType,
        score:
          similarityScore(
            source,
            product,
          ) +
          (product.rating *
            5),
      }),
    )
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