import type { RecommendationItem } from "../types/recommendation.types";

/**
 * There is no backend recommendation contract for similarity or
 * co-purchase data yet. Returning an empty set is safer than presenting
 * arbitrary catalog products as behaviorally derived recommendations.
 */
export function getSimilarProducts(
  productId: string,
  limit = 4,
): RecommendationItem[] {
  void productId;
  void limit;
  return [];
}

export function getFrequentlyBoughtProducts(
  productId: string,
  limit = 3,
): RecommendationItem[] {
  void productId;
  void limit;
  return [];
}
