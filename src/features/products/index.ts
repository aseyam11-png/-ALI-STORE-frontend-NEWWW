export type {
  ProductId,
  ProductPrice,
  ProductImage,
  ProductVideo,
  ProductVariant,
  ProductVariantOption,
  ProductSpecification,
  ProductCategory,
  ProductBrand,
  ProductSupplierSummary,
  ProductShippingMethod,
  ProductPriceTier,
  ProductRatingDistribution,
  ProductReviewSummary,
  ProductSeo,
  ProductSummary,
  ProductDetails,
  ProductPagination,
  ProductListResponse,
  ProductApiError,
} from "./types/product.types";

export type { ProductCardModel } from "./types/product-card.types";

export type {
  ProductSort,
  ProductPriceRange,
  ProductRatingFilter,
  ProductFilters,
  ProductFilterUpdate,
} from "./types/product-filter.types";

export { defaultProductFilters } from "./types/product-filter.types";

export {
  getProducts,
  getProductById,
  searchProducts,
  getRelatedProducts,
} from "./services/product.service";

export { mapProductSummaryToCard } from "./services/product-card.mapper";

export {
  calculateDiscountedPrice,
  calculateSavings,
} from "./utils/product-price.utils";

export {
  normalizeProductSearch,
  calculateDiscountPercentage,
  calculateTierPrice,
  isProductAvailable,
  formatProductQuantity,
} from "./utils/product.utils";

export { validateProductFilters } from "./utils/product-validation.utils";
