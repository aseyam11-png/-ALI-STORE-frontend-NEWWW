import { apiClient } from "@/lib/api/http-client";

export type ActivePromotion = {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string | null;
  title: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  originalPrice: number;
  price: number;
  discountPercentage: number;
  currency: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
  flashSale: boolean;
  priority: number;
};

export async function getActivePromotions(
  flashOnly = false,
): Promise<ActivePromotion[]> {
  return apiClient.requestData<ActivePromotion[]>(
    "/api/v1/promotions/active?flashOnly=" + String(flashOnly),
  );
}