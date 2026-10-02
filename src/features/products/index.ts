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

export type {
  ProductCardModel,
} from "./types/product-card.types";

export type {
  ProductSort,
  ProductPriceRange,
  ProductRatingFilter,
  ProductFilters,
  ProductFilterUpdate,
} from "./types/product-filter.types";

export {
  defaultProductFilters,
} from "./types/product-filter.types";

export type {
  ProductQueryParams,
  ProductApiResponse,
  ProductDetailsResponse,
  ProductSearchResponse,
  ProductRequestState,
  ProductServiceResult,
  ProductEntityMap,
} from "./types/product-api.types";

export type {
  ProductReview,
  ProductReviewPage,
} from "./types/product-review.types";

export {
  getProducts,
  getProductById,
  searchProducts,
} from "./services/product.service";

export {
  mapMockProductToSummary,
  mapMockProductToDetails,
} from "./services/product.mapper";

export {
  mapProductSummaryToCard,
  mapLegacyProductToCard,
} from "./services/product-card.mapper";

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

export {
  validateProductFilters,
} from "./utils/product-validation.utils";
