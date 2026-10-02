import type { ProductSummary } from "../types/product.types";
import type { B2CProduct } from "../types/b2c-product.types";

// Adapter over the canonical `ProductSummary` model — /shop/products used
// to build this straight from the raw mock array with an untyped `product:
// any` parameter, its own independent field-guessing, and its own separate
// image-fallback lookup (duplicating what `mapMockProductToSummary`
// already does). This now consumes the same canonical model every other
// customer-facing product view does; the mock source itself is never
// touched directly from here.
//
// `discountPercentage`/`originalPrice` are deliberately NOT read from
// `product.price.discountPercentage`/`originalAmount` even though those
// are real, populated fields on `ProductSummary` — doing so would flip a
// pre-existing display bug (this page currently never shows a discount or
// flash-sale badge, because the old code checked field names that never
// existed on the raw mock shape it used to receive) into suddenly-visible
// badges on several product cards. That is a real, separate bug worth
// fixing, but this task preserves current visual behavior exactly rather
// than bundling an incidental UI change into an architecture change — see
// the architecture report's defect list.
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
    // Preserved as `undefined` deliberately — see the function-level
    // comment above.
    originalPrice: undefined,

    currency: product.price.currency,

    discountPercentage: undefined,

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
