import type {
  RecommendationProduct,
  RecommendationType,
} from "../types/recommendation.types";

const MOCK_RECOMMENDATIONS: RecommendationProduct[] = [
  {
    id: "rec-001",
    name: "USB-C Fast Charging Cable",
    brand: "PowerLink",
    price: 12.99,
    supplierPrice: 7.99,
    originalPrice: 18.99,
    currency: "SAR",
    image: undefined,
    rating: 4.8,
    reviewCount: 1821,
    stock: 42,
    shipping: "Free shipping",
  },
  {
    id: "rec-002",
    name: "Wireless Charging Pad",
    brand: "VoltOne",
    price: 24.99,
    supplierPrice: 14.99,
    originalPrice: 34.99,
    currency: "SAR",
    image: undefined,
    rating: 4.7,
    reviewCount: 934,
    stock: 18,
    shipping: "Free shipping",
  },
  {
    id: "rec-003",
    name: "Protective Travel Case",
    brand: "SafeCarry",
    price: 19.99,
    supplierPrice: 11.99,
    currency: "SAR",
    image: undefined,
    rating: 4.6,
    reviewCount: 623,
    stock: 27,
    shipping: "Standard shipping",
  },
  {
    id: "rec-004",
    name: "Bluetooth Audio Adapter",
    brand: "SoundCore",
    price: 29.99,
    supplierPrice: 17.99,
    originalPrice: 39.99,
    currency: "SAR",
    image: undefined,
    rating: 4.7,
    reviewCount: 1102,
    stock: 14,
    shipping: "Free shipping",
  },
];

export async function getRecommendations(
  type: RecommendationType,
): Promise<RecommendationProduct[]> {
  void type;

  /*
    Later:
      Next.js
        ↓
      Spring Boot
        ↓
      Recommendation Service
        ↓
      User behavior / Orders / ML
  */

  return MOCK_RECOMMENDATIONS;
}

