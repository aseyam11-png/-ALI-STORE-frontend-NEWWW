import type { Product } from "@/mocks/products";

import {
  PRODUCT_DEFAULT_CURRENCY,
  PRODUCT_DEFAULT_UNIT,
} from "../constants/product.constants";

import type {
  ProductDetails,
  ProductImage,
  ProductSummary,
} from "../types/product.types";

// Verified real photo URLs for the mock catalog — every URL below was
// downloaded and visually inspected in this pass before being wired in
// (fetched via images.unsplash.com, the only host next.config.ts allows for
// remote images) and confirmed to genuinely depict its product. Every one of
// the 12 products in mocks/products.ts now has a verified match, so no
// homepage-facing card falls back to the empty-image placeholder state.
// Caveat: several of these stock photos show a real third-party brand mark
// (e.g. the perfume/skincare shots) — the product names deliberately stay
// generic ("عطر فاخر للنساء", not a brand name) so ALI STORE never claims to
// sell that brand; swap these for commissioned/licensed photography before
// this ships to real customers.
//
// Query params (w/q/fit) ask Unsplash's own imgix backend for an
// already-downsized JPEG instead of the multi-MB original — verified live in
// this pass: requesting the bare original URL made next/image's remote
// optimizer intermittently throw "upstream image response timed out" (seen
// in .next/dev/logs/next-development.log), which a ~1200px/75%-quality
// request does not.
const IMAGE_PARAMS = "auto=format&fit=crop&w=1200&q=75";

export const PRODUCT_IMAGE_URL: Record<string, string> = {
  "prod-001": `https://images.unsplash.com/photo-1595777457583-95e059d581b8?${IMAGE_PARAMS}`, // red evening dress
  "prod-002": `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?${IMAGE_PARAMS}`, // white t-shirt
  "prod-003": `https://images.unsplash.com/photo-1542291026-7eec264c27ff?${IMAGE_PARAMS}`, // red sneaker
  "prod-004": `https://images.unsplash.com/photo-1521369909029-2afed882baee?${IMAGE_PARAMS}`, // cap
  "prod-005": `https://images.unsplash.com/photo-1572635196237-14b3f281503f?${IMAGE_PARAMS}`, // sunglasses
  "prod-006": `https://images.unsplash.com/photo-1524805444758-089113d48a6d?${IMAGE_PARAMS}`, // leather watch
  "prod-007": `https://images.unsplash.com/photo-1584917865442-de89df76afd3?${IMAGE_PARAMS}`, // red handbag
  "prod-008": `https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?${IMAGE_PARAMS}`, // pearl necklace
  "prod-009": `https://images.unsplash.com/photo-1553062407-98eeb64c6a62?${IMAGE_PARAMS}`, // backpack
  "prod-010": `https://images.unsplash.com/photo-1541643600914-78b084683601?${IMAGE_PARAMS}`, // perfume
  "prod-011": `https://images.unsplash.com/photo-1596462502278-27bfdc403348?${IMAGE_PARAMS}`, // makeup flatlay
  "prod-012": `https://images.unsplash.com/photo-1556228720-195a672e8a03?${IMAGE_PARAMS}`, // skincare cream
};

function createProductImage(product: Product): ProductImage {
  return {
    id: `${product.id}-thumbnail`,
    url: PRODUCT_IMAGE_URL[product.id] ?? "",
    alt: product.name,
    sortOrder: 0,
  };
}

export function mapMockProductToSummary(
  product: Product,
): ProductSummary {
  const discountPercentage =
    product.discount !== undefined
      ? Math.max(0, Math.min(100, product.discount))
      : undefined;

  const stockQuantity =
    Math.max(product.minOrderQuantity * 20, 100);

  return {
    id: product.id,
    sku: `SKU-${product.id.toUpperCase()}`,
    name: product.name,
    slug: product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),

    shortDescription:
      `High-quality ${product.name}, sold and shipped directly by AliStore.`,

    price: {
      amount: product.price,
      currency: PRODUCT_DEFAULT_CURRENCY,
      unit: PRODUCT_DEFAULT_UNIT,
      originalAmount:
        discountPercentage !== undefined
          ? Number(
              (
                product.price /
                (1 - discountPercentage / 100)
              ).toFixed(2),
            )
          : undefined,
      discountPercentage,
    },

    minOrderQuantity: product.minOrderQuantity,

    rating: Math.max(0, Math.min(5, product.rating)),
    reviewCount: Math.max(0, product.reviews),

    supplier: {
      id: `supplier-${product.id}`,
      name: product.supplier,
      verified: product.verifiedSupplier,

    },

    shipping: product.shipping,

    thumbnail: createProductImage(product),

    discountPercentage,

    // Real category, not the old hardcoded placeholder — needed so
    // related-product lookups can actually group by category. See
    // docs/agency/DESIGN-DECISIONS.md, Product Detail rebuild notes.
    category: {
      id: product.category
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-"),
      name: product.category,
      slug: product.category
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-"),
    },

    brand: {
      id: `brand-${product.id}`,
      name: product.supplier,
      slug: product.supplier
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-"),
    },

    stockQuantity,
    availableQuantity: stockQuantity,

    stockStatus:
      stockQuantity <= product.minOrderQuantity * 2
        ? "low_stock"
        : "in_stock",

    status: "active",

    featured: true,
    bestseller: product.rating >= 4.8,
    newArrival: product.id === "prod-006",

    tags: [
      "alistore",
      "quality-checked",
    ],

    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
  };
}

export function mapMockProductToDetails(
  product: Product,
): ProductDetails {
  const summary = mapMockProductToSummary(product);

  // Only include images that actually resolve to a real URL — an empty
  // `src` is an invalid next/image prop, not a harmless placeholder, so a
  // product with no verified photo yet gets a genuinely empty gallery
  // (ProductGallery renders its own "no images" state for that), not a
  // gallery padded with broken entries.
  const images: ProductImage[] = [createProductImage(product)].filter(
    (image) => image.url !== "",
  );

  return {
    ...summary,

    description:
      `Premium ${product.name}, sold and shipped directly by AliStore. ` +
      `Backed by our quality guarantee and fast, tracked delivery.`,

    images,

    videos: [],

    variants: [
      {
        id: `${product.id}-standard`,
        sku: summary.sku,
        name: "Standard",
        price: summary.price,
        stockQuantity: summary.stockQuantity,
        availableQuantity: summary.availableQuantity,
        options: [
          {
            id: `${product.id}-option-standard`,
            name: "Type",
            value: "Standard",
          },
        ],
        image: images[0],
        active: true,
      },
    ],

    specifications: [
      {
        key: "product_type",
        label: "Product Type",
        value: product.name,
        group: "General",
      },
      {
        key: "minimum_order",
        label: "Minimum Order Quantity",
        value: String(product.minOrderQuantity),
        group: "Commercial",
      },
      {
        key: "shipping",
        label: "Shipping",
        value: product.shipping,
        group: "Logistics",
      },
    ],

    priceTiers: [
      {
        minQuantity: product.minOrderQuantity,
        unitPrice: product.price,
        currency: PRODUCT_DEFAULT_CURRENCY,
      },
      {
        minQuantity: product.minOrderQuantity * 5,
        unitPrice: Number(
          (product.price * 0.95).toFixed(2),
        ),
        currency: PRODUCT_DEFAULT_CURRENCY,
      },
      {
        minQuantity: product.minOrderQuantity * 10,
        unitPrice: Number(
          (product.price * 0.9).toFixed(2),
        ),
        currency: PRODUCT_DEFAULT_CURRENCY,
      },
    ],

    shippingMethods: [
      {
        id: `${product.id}-standard-shipping`,
        name: "Standard Shipping",
        description: product.shipping,
        price: 0,
        currency: PRODUCT_DEFAULT_CURRENCY,
        estimatedMinDays: 7,
        estimatedMaxDays: 15,
        available: true,
      },
    ],

    reviewSummary: {
      rating: summary.rating,
      reviewCount: summary.reviewCount,
      distribution: {
        five: Math.round(summary.reviewCount * 0.65),
        four: Math.round(summary.reviewCount * 0.2),
        three: Math.round(summary.reviewCount * 0.08),
        two: Math.round(summary.reviewCount * 0.04),
        one: Math.round(summary.reviewCount * 0.03),
      },
    },

    seo: {
      title: `${product.name} | AliStore`,
      description:
        `Buy ${product.name} from AliStore. Fast shipping, secure checkout, ` +
        `easy returns.`,
      keywords: [
        product.name,
        product.category,
        "AliStore",
      ],
    },

    relatedProductIds: [],
  };
}
