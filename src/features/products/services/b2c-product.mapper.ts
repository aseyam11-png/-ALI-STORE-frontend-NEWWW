import type { ProductSummary } from "../types/product.types";
import type { B2CProduct } from "../types/b2c-product.types";

export function normalizeB2CProduct(product: ProductSummary): B2CProduct {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand?.name ?? "ALI STORE",
    category: product.category?.name ?? "General",
    subcategory: undefined,
    description: product.shortDescription ?? "",
    price: product.price.amount,
    supplierPrice: undefined,
    originalPrice: undefined,
    currency: product.price.currency,
    discountPercentage: product.discountPercentage,
    stock: product.availableQuantity,
    images: product.thumbnail?.url
      ? [{ url: product.thumbnail.url, alt: product.thumbnail.alt }]
      : [],
    variants: [],
    rating: product.rating,
    reviewCount: product.reviewCount,
    shipping: {
      free: false,
      method: "Delivery confirmed at fulfillment",
      estimatedDelivery: "Confirmed after supplier acceptance",
    },
    returnPolicy: "14-day return policy",
    featured: product.featured,
    flashSale: Boolean(product.discountPercentage),
    tags: product.tags,
  };
}
