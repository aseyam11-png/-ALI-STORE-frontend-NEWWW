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
  VisualSearchResult,
} from "../types/visual-search.types";

const products =
  featuredProducts
    .map(mapMockProductToSummary)
    .map(normalizeB2CProduct);

function calculateSimilarity(
  sourceName: string,
  sourceCategory: string,
  product: (typeof products)[number],
) {
  const sourceTokens =
    `${sourceName} ${sourceCategory}`
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

  const targetText =
    `${product.name} ${product.category} ${product.brand}`
      .toLowerCase();

  const matches =
    sourceTokens.filter(
      (token) =>
        token.length > 2 &&
        targetText.includes(token),
    ).length;

  return Math.min(
    98,
    58 +
      matches * 8 +
      Math.round(
        product.rating,
      ),
  );
}

/*
  FRONTEND MOCK ONLY.

  In production this function will send the image
  to the Spring Boot visual-search endpoint, which
  can then call an image/embedding/search service.
*/
export async function searchByImage(
  file: File,
): Promise<VisualSearchResult[]> {
  if (!file.type.startsWith("image/")) {
    throw new Error(
      "Please select an image file.",
    );
  }

  if (
    file.size >
    10 * 1024 * 1024
  ) {
    throw new Error(
      "Image size must be 10 MB or less.",
    );
  }

  await new Promise(
    (resolve) =>
      window.setTimeout(
        resolve,
        700,
      ),
  );

  const fileName =
    file.name
      .replace(
        /\.[^/.]+$/,
        "",
      )
      .replace(
        /[-_]+/g,
        " ",
      );

  return products
    .map(
      (product) => ({
        id: `visual-${product.id}`,
        productId:
          product.id,
        productName:
          product.name,
        image:
          product.images[0]?.url,
        similarity:
          calculateSimilarity(
            fileName,
            product.category,
            product,
          ),
        price:
          product.price,
        brand:
          product.brand,
        category:
          product.category,
      }),
    )
    .sort(
      (a, b) =>
        b.similarity -
        a.similarity,
    )
    .slice(
      0,
      6,
    );
}