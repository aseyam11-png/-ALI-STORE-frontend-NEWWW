import type {
  RecommendationProduct,
  RecommendationType,
} from "../types/recommendation.types";
import { getProducts } from "@/features/products/services/product.service";

export async function getRecommendations(
  type: RecommendationType,
): Promise<RecommendationProduct[]> {
  if (type === "RECENTLY_VIEWED") {
    return [];
  }

  const response = await getProducts({
    search: "",
    categoryId: undefined,
    subcategoryId: undefined,
    brand: undefined,
    supplierId: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    minRating: undefined,
    verifiedSupplierOnly: false,
    discountOnly: false,
    inStockOnly: true,
    featuredOnly: false,
    bestsellerOnly: false,
    newArrivalOnly: false,
    sort: "relevance",
    page: 1,
    pageSize: 8,
  });

  return response.items.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price.amount,
    stock: product.availableQuantity,
    image: product.thumbnail?.url,
    brand: product.brand?.name,
    category: product.category?.name,
    rating: product.rating,
    reviewCount: product.reviewCount,
    originalPrice: product.price.originalAmount,
    discountPercentage: product.price.discountPercentage,
    href: "/shop/products/" + encodeURIComponent(product.id),
    shipping: product.shipping,
    currency: product.price.currency,
    reason: type,
  }));
}
