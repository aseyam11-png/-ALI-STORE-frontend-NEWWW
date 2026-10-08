import { HttpApiError, apiClient } from "@/lib/api/http-client";

import type {
  ProductDetails,
  ProductListResponse,
  ProductSummary,
} from "../types/product.types";
import type { ProductFilters } from "../types/product-filter.types";
import type { ProductSort } from "../types/product-filter.types";

type BackendProduct = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number | string;
  currency: string;
  sku: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  availability: "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
  availableQuantity?: number | null;
  rating?: number | string | null;
  reviewCount?: number | null;
  originalPrice?: number | string | null;
  discountPercentage?: number | string | null;
  promotionTitle?: string | null;
  flashSale?: boolean | null;
  variants?: Array<{
    id: number;
    sku: string;
    name: string;
    value: string;
    price?: number | string | null;
    currency?: string | null;
    availableQuantity?: number | null;
    imageUrl?: string | null;
    active: boolean;
  }> | null;
  shippingMethods?: Array<{
    id: number;
    code: string;
    name: string;
    description?: string | null;
    price: number | string;
    currency: string;
    estimatedMinDays: number;
    estimatedMaxDays: number;
    countryCode?: string | null;
    active: boolean;
  }> | null;
  reviewSummary?: {
    averageRating: number | string;
    reviewCount: number;
    oneStar: number;
    twoStar: number;
    threeStar: number;
    fourStar: number;
    fiveStar: number;
  } | null;
  categoryId?: number | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  brandId?: number | null;
  brandName?: string | null;
  images?: string[] | null;
  primaryImageUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type BackendPage<T> = {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

type BackendApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

function unwrap<T>(response: BackendApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.message || "API request failed");
  }
  return response.data;
}

function parseMoney(value: number | string | null | undefined): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function parseQuantity(value: number | string | null | undefined): number {
  const quantity = Number(value);
  return Number.isFinite(quantity) && quantity >= 0
    ? Math.floor(quantity)
    : 0;
}

function mapStatus(status: BackendProduct["status"]): ProductSummary["status"] {
  switch (status) {
    case "DRAFT":
      return "draft";
    case "ARCHIVED":
      return "archived";
    default:
      return "active";
  }
}

function mapStockStatus(
  availability: BackendProduct["availability"],
  availableQuantity: number,
): ProductSummary["stockStatus"] {
  if (availability === "UNKNOWN") return "unknown";
  if (availability === "OUT_OF_STOCK") return "out_of_stock";
  if (availableQuantity <= 0) return "out_of_stock";
  return availableQuantity <= 5 ? "low_stock" : "in_stock";
}

function mapProduct(product: BackendProduct): ProductSummary {
  const price = parseMoney(product.price);
  const availableQuantity = parseQuantity(product.availableQuantity);
  const imageUrl = product.primaryImageUrl ?? product.images?.[0] ?? undefined;
  const createdAt = product.createdAt ?? new Date(0).toISOString();
  const brandName = product.brandName?.trim();

  return {
    id: String(product.id),
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    shortDescription: product.description ?? "",
    price: {
      amount: price,
      currency: product.currency || "USD",
      unit: "piece",
      originalAmount: product.originalPrice != null ? parseMoney(product.originalPrice) : undefined,
      discountPercentage: product.discountPercentage != null ? parseMoney(product.discountPercentage) : undefined,
    },
    minOrderQuantity: 1,
    rating: Math.max(0, Math.min(5, Number(product.rating ?? 0))),
    reviewCount: Math.max(0, Number(product.reviewCount ?? 0)),
    // Customer-facing supplier identity is intentionally the merchant,
    // not the external fulfillment partner.
    supplier: {
      id: "ali-store",
      name: "ALI STORE",
      verified: true,
    },
    shipping: product.shippingMethods?.[0]?.name
      ? product.shippingMethods[0].name
      : "Shipping details available at checkout",
    thumbnail: imageUrl
      ? {
          id: `product-${product.id}-primary`,
          url: imageUrl,
          alt: product.name,
          sortOrder: 0,
        }
      : undefined,
    category: product.categoryId != null
      ? {
          id: String(product.categoryId),
          name: product.categoryName ?? "Category",
          slug: product.categorySlug ?? "",
        }
      : undefined,
    brand: brandName
      ? {
          id: product.brandId != null ? String(product.brandId) : "brand",
          name: brandName,
          slug: brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        }
      : undefined,
    availableQuantity,
    stockQuantity: availableQuantity,
    stockStatus: mapStockStatus(product.availability, availableQuantity),
    status: mapStatus(product.status),
    featured: false,
    flashSale: Boolean(product.flashSale),
    bestseller: false,
    newArrival: false,
    tags: [],
    createdAt,
    updatedAt: product.updatedAt ?? createdAt,
  };
}

function mapDetails(product: BackendProduct): ProductDetails {
  const summary = mapProduct(product);
  const imageUrls = product.images ?? [];
  const images = imageUrls.map((url, index) => ({
    id: `product-${product.id}-image-${index}`,
    url,
    alt: product.name,
    sortOrder: index,
  }));
  const finalImages =
    images.length > 0
      ? images
      : summary.thumbnail
        ? [summary.thumbnail]
        : [];

  return {
    ...summary,
    description: product.description ?? "",
    images: finalImages,
    videos: [],
    variants: (product.variants ?? []).map((variant) => ({
      id: String(variant.id),
      sku: variant.sku,
      name: variant.name,
      price: variant.price != null ? {
        amount: parseMoney(variant.price),
        currency: variant.currency ?? product.currency,
        unit: "piece",
      } : undefined,
      stockQuantity: parseQuantity(variant.availableQuantity),
      availableQuantity: parseQuantity(variant.availableQuantity),
      options: [{ id: String(variant.id), name: variant.name, value: variant.value }],
      image: variant.imageUrl ? {
        id: "variant-" + variant.id,
        url: variant.imageUrl,
        alt: product.name + " - " + variant.value,
        sortOrder: 0,
      } : undefined,
      active: variant.active,
    })),
    specifications: [
      { key: "sku", label: "SKU", value: product.sku, group: "Product" },
      {
        key: "availability",
        label: "Availability",
        value: product.availability,
        group: "Inventory",
      },
      {
        key: "category",
        label: "Category",
        value: product.categoryName ?? "Category",
        group: "Product",
      },
      {
        key: "brand",
        label: "Brand",
        value: product.brandName ?? "Unbranded",
        group: "Product",
      },
    ],
    priceTiers: [],
    shippingMethods: (product.shippingMethods ?? []).map((method) => ({
      id: String(method.id),
      name: method.name,
      description: method.description ?? undefined,
      price: parseMoney(method.price),
      currency: method.currency,
      estimatedMinDays: method.estimatedMinDays,
      estimatedMaxDays: method.estimatedMaxDays,
      available: method.active,
    })),
    reviewSummary: {
      rating: product.reviewSummary?.averageRating != null
        ? parseMoney(product.reviewSummary.averageRating)
        : summary.rating,
      reviewCount: product.reviewSummary?.reviewCount ?? summary.reviewCount,
      distribution: {
        five: product.reviewSummary?.fiveStar ?? 0,
        four: product.reviewSummary?.fourStar ?? 0,
        three: product.reviewSummary?.threeStar ?? 0,
        two: product.reviewSummary?.twoStar ?? 0,
        one: product.reviewSummary?.oneStar ?? 0,
      },
    },
    seo: {
      title: `${product.name} | ALI STORE`,
      description:
        product.description ?? `Buy ${product.name} from ALI STORE.`,
      keywords: [product.name, product.categoryName ?? "", product.brandName ?? ""]
        .filter(Boolean),
    },
    relatedProductIds: [],
  };
}

function backendPageToProductList(
  page: BackendPage<BackendProduct>,
): ProductListResponse {
  return {
    items: page.content.map(mapProduct),
    pagination: {
      page: page.pageNumber + 1,
      pageSize: page.pageSize,
      totalItems: page.totalElements,
      totalPages: page.totalPages,
      hasNextPage: page.pageNumber + 1 < page.totalPages,
      hasPreviousPage: page.pageNumber > 0,
    },
  };
}

function mapSort(sort: ProductSort): string {
  switch (sort) {
    case "price_asc":
    case "price_desc":
    case "relevance":
      return sort;
    default:
      return "relevance";
  }
}

function toLong(value: string | undefined): number | undefined {
  if (!value?.trim()) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function requireFilterId(
  field: "categoryId" | "brand",
  value: string | undefined,
): number | undefined {
  if (!value?.trim()) return undefined;

  const parsed = toLong(value);
  if (parsed === undefined) {
    throw new Error(
      `${field} must use the backend numeric identifier.`,
    );
  }

  return parsed;
}

export async function getProducts(
  filters: ProductFilters,
): Promise<ProductListResponse> {
  const params = new URLSearchParams();

  if (filters.search.trim()) params.set("q", filters.search.trim());

  const categoryId = requireFilterId(
    "categoryId",
    filters.categoryId,
  );
  if (categoryId !== undefined) {
    params.set("category", String(categoryId));
  }

  const brandId = requireFilterId(
    "brand",
    filters.brand,
  );
  if (brandId !== undefined) {
    params.set("brand", String(brandId));
  }

  if (filters.minPrice !== undefined) {
    params.set("minPrice", String(filters.minPrice));
  }
  if (filters.maxPrice !== undefined) {
    params.set("maxPrice", String(filters.maxPrice));
  }
  if (filters.inStockOnly) {
    params.set("availability", "IN_STOCK");
  }

  params.set("sort", mapSort(filters.sort));
  params.set("page", String(Math.max(0, filters.page - 1)));
  params.set("pageSize", String(Math.min(100, Math.max(1, filters.pageSize))));

  const response = await apiClient.request<
    BackendApiResponse<BackendPage<BackendProduct>>
  >(`/api/v1/products?${params.toString()}`);

  return backendPageToProductList(unwrap(response));
}

export async function getProductById(
  idOrSlug: string,
): Promise<ProductDetails | null> {
  try {
    const encoded = encodeURIComponent(idOrSlug);
    const endpoint = /^\d+$/.test(idOrSlug)
      ? `/api/v1/products/${encoded}`
      : `/api/v1/products/slug/${encoded}`;

    const response = await apiClient.request<
      BackendApiResponse<BackendProduct>
    >(endpoint);

    return mapDetails(unwrap(response));
  } catch (error) {
    if (error instanceof HttpApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function getRelatedProducts(
  productId: string,
  categoryId?: string,
  limit = 4,
): Promise<ProductSummary[]> {
  const params = new URLSearchParams();

  const numericCategoryId = requireFilterId(
    "categoryId",
    categoryId,
  );
  if (numericCategoryId !== undefined) {
    params.set("category", String(numericCategoryId));
  }
  params.set("page", "0");
  params.set("pageSize", String(Math.min(100, Math.max(8, limit))));
  params.set("sort", "relevance");

  const response = await apiClient.request<
    BackendApiResponse<BackendPage<BackendProduct>>
  >(`/api/v1/products?${params.toString()}`);

  return unwrap(response)
    .content
    .map(mapProduct)
    .filter((product) => product.id !== productId)
    .slice(0, limit);
}

export async function searchProducts(
  query: string,
): Promise<ProductSummary[]> {
  const response = await getProducts({
    search: query,
    categoryId: undefined,
    subcategoryId: undefined,
    brand: undefined,
    supplierId: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    minRating: undefined,
    verifiedSupplierOnly: false,
    discountOnly: false,
    inStockOnly: false,
    featuredOnly: false,
    bestsellerOnly: false,
    newArrivalOnly: false,
    sort: "relevance",
    page: 1,
    pageSize: 24,
  });

  return response.items;
}
