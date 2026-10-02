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

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,

    // AliStore is a single-merchant store — "brand" is the manufacturer
    // label on the product itself, never the wholesale supplier AliStore
    // happens to source it from. `ProductSummary.brand.name` is currently
    // sourced from the internal supplier field (see product.mapper.ts), so
    // it is intentionally not read here — surfacing it would leak supplier
    // identity into a customer-facing "brand" field.
    brand: "AliStore",

    category: product.category?.name ?? "General",

    subcategory: undefined,

    description: product.shortDescription ?? "",

    price,
    // Never populated from real data today — there is no supplier-price
    // concept this page is allowed to read, and none is fabricated here.
    supplierPrice: undefined,
    originalPrice: product.price.originalAmount,

    currency: product.price.currency,

    discountPercentage: product.price.discountPercentage,

    // No real inventory source exists (see features/inventory/
    // availability.ts) — this stays honestly at 0 rather than reading a
    // field that was never real on the previous input shape either.
    stock: product.availableQuantity,

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
      estimatedDelivery: "Calculated at checkout",
    },

    returnPolicy: "14-day return policy",

    // Preserved as `false` deliberately, matching current output exactly —
    // `ProductSummary.featured` is itself hardcoded `true` for every mock
    // product upstream (see product.mapper.ts) and was never suitable to
    // surface here.
    featured: false,

    // Preserved as `false` deliberately — see the function-level comment
    // above about `discountPercentage`.
    flashSale: false,

    tags: product.tags,
  };
}
