"use client";

import type { ProductCardModel } from "@/features/products/types/product-card.types";
import { B2CProductCard } from "./B2CProductCard";

export function ProductCard({ product }: { product: ProductCardModel }) {
  const discount = product.discountPercentage ?? 0;
  return (
    <B2CProductCard
      product={{
        id: product.id,
        slug: product.id,
        name: product.name,
        brand: product.brand ?? "ALI STORE",
        category: product.category ?? "General",
        price: product.price.amount,
        originalPrice: product.price.originalAmount,
        currency: product.price.currency,
        discountPercentage: discount > 0 ? discount : undefined,
        stock: product.stockStatus === "out_of_stock" ? 0 : 1,
        availability: product.stockStatus === "out_of_stock" ? "OUT_OF_STOCK" : "IN_STOCK",
        images: product.image ? [{ url: product.image.url, alt: product.image.alt }] : [],
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
        flashSale: discount > 0,
        tags: [],
      }}
    />
  );
}
