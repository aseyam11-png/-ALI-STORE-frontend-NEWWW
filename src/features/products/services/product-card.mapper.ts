import type { ProductSummary } from "../types/product.types";
import type { ProductCardModel } from "../types/product-card.types";

export function mapProductSummaryToCard(product: ProductSummary): ProductCardModel {
  return {
    id: product.id,
    name: product.name,
    price: {
      amount: product.price.amount,
      currency: product.price.currency,
      unit: product.price.unit,
      originalAmount: product.price.originalAmount,
    },
    minOrderQuantity: product.minOrderQuantity,
    rating: product.rating,
    reviewCount: product.reviewCount,
    supplier: {
      id: product.supplier.id,
      name: product.supplier.name,
      verified: product.supplier.verified,
    },
    shipping: product.shipping,
    discountPercentage: product.discountPercentage,
    image: product.thumbnail,
    stockStatus: product.stockStatus,
    category: product.category?.name,
    brand: product.brand?.name,
    featured: product.featured,
    bestseller: product.bestseller,
    newArrival: product.newArrival,
  };
}
