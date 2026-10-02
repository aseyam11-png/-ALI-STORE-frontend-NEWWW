import type { ProductSummary } from "../types/product.types";
import type { B2CProduct } from "../types/b2c-product.types";

// Customer-facing B2C adapter over the canonical ProductSummary model.
// The backend owns discount calculation; this adapter only forwards the
// customer-safe reference price and discount percentage. Supplier cost and
// supplier pricing rules never enter the view model.
export function normalizeB2CProduct(product: ProductSummary): B2CProduct {
  const price = product.price.amount;
  const available = product.stockStatus === "in_stock" || product.stockStatus === "low_stock";

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,

    // Customer-facing brand is the product manufacturer label returned by the
    // catalog API. Supplier identity is kept out of the customer view model.
    brand: product.brand?.name ?? "ALI STORE",

    category: product.category?.name ?? "General",

    subcategory: undefined,

    description: product.shortDescription ?? "",

    price,
    // Supplier cost is never sent to the customer-facing model.
    supplierPrice: undefined,
    originalPrice: product.price.originalAmount,

    currency: product.price.currency,

    discountPercentage: product.discountPercentage,

    // Inventory availability is returned by the Spring catalog endpoint.
    // Unknown/out-of-stock is treated conservatively and never made addable.
    stock: available ? Math.max(product.availableQuantity, 1) : 0,

    images: product.thumbnail?.url
      ? [
          {
            url: product.thumbnail.url,
            alt: product.thumbnail.alt,
          },
        ]
      : [],

    variants: [],

    rating: product.rating,

    reviewCount: product.reviewCount,

    shipping: {
      free: false,
      method: product.shipping,
      estimatedDelivery:
        "Estimated delivery available at checkout",
    },

    returnPolicy: "14-day return policy",

    featured: product.featured,

    flashSale: Boolean(product.discountPercentage && product.discountPercentage > 0),

    tags: product.tags,
  };
}
