import type { ProductSummary } from "../types/product.types";
import type { B2CProduct } from "../types/b2c-product.types";

export function normalizeB2CProduct(
  product: ProductSummary,
): B2CProduct {
  return {
    id: product.id,
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    brand: product.brand?.name ?? "",

    category:
      product.category?.name ??
      "General",

    subcategory: undefined,

    description:
      product.shortDescription ??
      "",

    price: product.price.amount,
    supplierPrice: undefined,
    originalPrice:
      product.price.originalAmount,

    currency:
      product.price.currency,

    discountPercentage:
      product.price.discountPercentage,

    stock:
      product.availableQuantity,

    stockStatus:
      product.stockStatus,

    images:
      product.thumbnail?.url
        ? [
            {
              url:
                product.thumbnail.url,
              alt:
                product.thumbnail.alt,
            },
          ]
        : [],

    variants: [],

    rating:
      product.rating,

    reviewCount:
      product.reviewCount,

    shipping: {
      free: false,
      method:
        product.shipping ||
        "Calculated at checkout",
      estimatedDelivery:
        "Calculated at checkout",
    },

    returnPolicy: undefined,

    featured: false,
    flashSale: false,
    tags:
      product.tags,
  };
}
