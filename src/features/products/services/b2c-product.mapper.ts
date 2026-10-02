import type { ProductSummary } from "../types/product.types";
import type { B2CProduct } from "../types/b2c-product.types";

export function normalizeB2CProduct(product: ProductSummary): B2CProduct {
  const price = product.price.amount;
  const originalPrice = product.price.originalAmount ??
    (product.discountPercentage ? Number((price / Math.max(0.01, 1 - product.discountPercentage / 100)).toFixed(2)) : undefined);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand?.name ?? "ALI STORE",
    category: product.category?.name ?? "General",
    description: product.shortDescription ?? "",
    price,
    supplierPrice: undefined,
    originalPrice,
    currency: product.price.currency,
    discountPercentage: product.discountPercentage,
    stock: product.stockQuantity,
    availability: product.availability,
    images: product.thumbnail ? [{ url: product.thumbnail.url, alt: product.thumbnail.alt }] : [],
    variants: [],
    rating: product.rating,
    reviewCount: product.reviewCount,
    shipping: {
      free: false,
      method: "يُحدد الشحن عند الدفع",
      estimatedDelivery: "تظهر المدة بعد اختيار الشحن",
    },
    returnPolicy: "14-day return policy",
    featured: product.featured,
    flashSale: Boolean(product.discountPercentage),
    tags: product.tags,
  };
}
