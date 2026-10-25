import type { ProductCardModel } from "@/features/products/types/product-card.types";
import type { ActivePromotion } from "./promotion-api.service";

function mapStock(availability: ActivePromotion["availability"], quantity: number): ProductCardModel["stockStatus"] {
  if (availability === "UNKNOWN") return "unknown";
  if (availability === "OUT_OF_STOCK" || quantity <= 0) return "out_of_stock";
  return quantity <= 5 ? "low_stock" : "in_stock";
}

export function mapPromotionToProductCard(promotion: ActivePromotion): ProductCardModel {
  const image = promotion.productImageUrl
    ? {
        id: "promotion-" + promotion.id + "-image",
        url: promotion.productImageUrl,
        alt: promotion.productName,
        sortOrder: 0,
      }
    : undefined;

  return {
    id: String(promotion.productId),
    name: promotion.productName,
    price: {
      amount: promotion.price,
      currency: promotion.currency,
      unit: "piece",
      originalAmount: promotion.originalPrice > promotion.price
        ? promotion.originalPrice
        : undefined,
      discountPercentage: promotion.discountPercentage > 0
        ? promotion.discountPercentage
        : undefined,
    },
    minOrderQuantity: 1,
    rating: 0,
    reviewCount: 0,
    supplier: {
      id: "ali-store",
      name: "ALI STORE",
      verified: true,
    },
    shipping: "Shipping details available at checkout",
    discountPercentage: promotion.discountPercentage > 0
      ? promotion.discountPercentage
      : undefined,
    image,
    stockStatus: mapStock(promotion.availability, promotion.availableQuantity),
    featured: promotion.flashSale,
    bestseller: false,
    newArrival: false,
  };
}