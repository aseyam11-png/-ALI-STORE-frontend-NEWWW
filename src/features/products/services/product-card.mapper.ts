import type { Product } from "@/mocks/products";

import { mapMockProductToSummary } from "./product.mapper";

import type { ProductSummary } from "../types/product.types";
import type { ProductCardModel } from "../types/product-card.types";

export function mapProductSummaryToCard(
  product: ProductSummary,
): ProductCardModel {
  return {
    id: product.id,
    name: product.name,

    price: {
      amount: product.price.amount,
      currency: product.price.currency,
      unit: product.price.unit,
      originalAmount:
        product.price.originalAmount,
    },

    minOrderQuantity:
      product.minOrderQuantity,

    rating: product.rating,

    reviewCount:
      product.reviewCount,

    // `product.supplier.rating` is an internal, currently-hardcoded value
    // (see product.mapper.ts) — it is never forwarded here. Nothing in the
    // codebase renders it today, but `ProductCardModel` is the canonical
    // customer-facing view model, and a fabricated supplier rating has no
    // legitimate reason to exist in it, rendered or not.
    supplier: {
      id: product.supplier.id,
      name: product.supplier.name,
      verified:
        product.supplier.verified,
    },

    shipping:
      product.shipping,

    discountPercentage:
      product.discountPercentage,

    image:
      product.thumbnail,

    stockStatus:
      product.stockStatus,

    category:
      product.category?.name,

    brand:
      product.brand?.name,

    featured:
      product.featured,

    bestseller:
      product.bestseller,

    newArrival:
      product.newArrival,
  };
}

// A thin adapter, not an independent pipeline: routes the legacy mock
// `Product` through the same canonical mapping (mapMockProductToSummary →
// mapProductSummaryToCard) every other customer-facing card consumer uses,
// instead of recomputing price/rating/image/stock logic a second time.
// `category`/`brand` are explicitly cleared afterward — Homepage's
// `ProductCard` never renders them, and `ProductSummary.brand.name` is
// sourced from the internal supplier field (see product.mapper.ts), not a
// real customer-facing brand, so this path must not start exposing it.
export function mapLegacyProductToCard(
  product: Product,
): ProductCardModel {
  const card = mapProductSummaryToCard(
    mapMockProductToSummary(product),
  );

  return {
    ...card,
    category: undefined,
    brand: undefined,
  };
}
