import type { RecommendationProduct, RecommendationType } from "../types/recommendation.types";

export async function getRecommendations(
  type: RecommendationType,
): Promise<RecommendationProduct[]> {
  // No recommendation endpoint exists in the current backend contract.
  // Never expose hard-coded products as if they were behavior-driven recommendations.
  void type;
  return [];
}
