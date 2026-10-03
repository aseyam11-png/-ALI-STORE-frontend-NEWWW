import type { RecommendationItem } from "../types/recommendation.types";

/**
 * There is no backend recommendation contract for similarity or
 * co-purchase data yet. Returning an empty set is safer than presenting
 * arbitrary catalog products as behaviorally derived recommendations.
 */
export function getSimilarProducts(
  _productId: string,
  _limit = 4,
): RecommendationItem[] {
  return [];
}

export function getFrequentlyBoughtProducts(
  _productId: string,
  _limit = 3,
): RecommendationItem[] {
  return [];
}
