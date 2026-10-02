import { apiClient, HttpApiError } from "@/lib/api/http-client";

import type {
  ProductDetails,
  ProductListResponse,
  ProductSummary,
  ProductStatus,
} from "../types/product.types";

import type { ProductFilters } from "../types/product-filter.types";

type BackendAvailability = "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
type BackendStatus = "ACTIVE" | "DRAFT" | "ARCHIVED" | "DISCONTINUED";

interface BackendProductResponse {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  currency: string;
  sku: string;
  status: BackendStatus;
  availability: BackendAvailability;
  categoryId?: number | null;
  categoryName?: string | null;
  brandId?: number | null;
  brandName?: string | null;
  images: string[];
  primaryImageUrl?: string | null;
}

interface BackendPageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

function slugify(value: string | null | undefined) {
  return (value ?? "general")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "") || "general";
}

function mapStatus(status: BackendStatus): ProductStatus {
  switch (status) {
    case "ARCHIVED":
      return "archived";
    case "DRAFT":
      return "draft";
    case "DISCONTINUED":
      return "discontinued";
    default:
      return "active";
  }
}

function availabilityToStockStatus(
  availability: BackendAvailability,
): ProductSummary["stockStatus"] {
  switch (availability) {
    case "IN_STOCK":
      return "in_stock";
    case "OUT_OF_STOCK":
      return "out_of_stock";
    default:
      return "out_of_stock";
  }
}

function mapBackendProductToSummary(
  product: BackendProductResponse,
): ProductSummary {
  const imageUrl =
    product.primaryImageUrl ??
    product.images[0] ??
    "";

  const categoryName =
    product.categoryName ??
    "General";

  const brandName =
    product.brandName ??
    "ALI STORE";

  const stockStatus =
    availabilityToStockStatus(
      product.availability,
    );

  const available =
    stockStatus === "in_stock";

  const image = imageUrl
    ? {
        id: `${product.id}-primary`,
        url: imageUrl,
        alt: product.name,
        sortOrder: 0,
      }
    : undefined;

  return {
    id: String(product.id),
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    shortDescription:
      product.description ?? undefined,
    price: {
      amount: Number(product.price),
      currency: product.currency,
      unit: "unit",
    },
    minOrderQuantity: 1,
    rating: 0,
    reviewCount: 0,
    supplier: {
      id: "alistore-fulfillment",
      name: "ALI STORE",
      verified: true,
    },
    shipping:
      "Delivery estimate available at checkout",
    thumbnail: image,
    category: {
      id: product.categoryId
        ? String(product.categoryId)
        : slugify(categoryName),
      name: categoryName,
      slug: slugify(categoryName),
    },
    brand: {
      id: product.brandId
        ? String(product.brandId)
        : slugify(brandName),
      name: brandName,
      slug: slugify(brandName),
    },
    stockQuantity: available ? 1 : 0,
    availableQuantity: available ? 1 : 0,
    stockStatus,
    status: mapStatus(product.status),
    featured: false,
    bestseller: false,
    newArrival: false,
    tags: [],
    createdAt: "",
    updatedAt: "",
  };
}

function mapBackendProductToDetails(
  product: BackendProductResponse,
): ProductDetails {
  const summary =
    mapBackendProductToSummary(product);

  const images: ProductDetails["images"] =
    product.images
      .filter(Boolean)
      .map((url, index) => ({
        id: `${product.id}-image-${index}`,
        url,
        alt: product.name,
        sortOrder: index,
      }));

  if (
    images.length === 0 &&
    summary.thumbnail
  ) {
    images.push({
      ...summary.thumbnail,
      sortOrder: summary.thumbnail.sortOrder ?? 0,
    });
  }

  return {
    ...summary,
    description:
      product.description ?? summary.name,
    images,
    videos: [],
    variants: [],
    specifications: [],
    priceTiers: [],
    shippingMethods: [
      {
        id: `${product.id}-standard`,
        name: "Standard delivery",
        description:
          "Delivery estimate is confirmed during checkout.",
        price: 0,
        currency: product.currency,
        estimatedMinDays: 0,
        estimatedMaxDays: 0,
        available: true,
      },
    ],
    reviewSummary: {
      rating: summary.rating,
      reviewCount: summary.reviewCount,
      distribution: {
        five: 0,
        four: 0,
        three: 0,
        two: 0,
        one: 0,
      },
    },
    seo: {
      title: `${product.name} | ALI STORE`,
      description:
        product.description ??
        `Shop ${product.name} from ALI STORE.`,
      keywords: [product.name, categoryName(product.categoryName)],
    },
    relatedProductIds: [],
  };
}

function categoryName(value?: string | null) {
  return value?.trim() || "General";
}

function toBackendSort(
  sort: ProductFilters["sort"],
) {
  switch (sort) {
    case "price_asc":
      return "price_asc";
    case "price_desc":
      return "price_desc";
    default:
      return "relevance";
  }
}

function buildProductPath(
  filters: ProductFilters,
) {
  const params = new URLSearchParams();

  if (filters.search.trim()) {
    params.set("q", filters.search.trim());
  }

  if (filters.categoryId?.trim()) {
    const category = filters.categoryId.trim();
    params.set(/^\d+$/.test(category) ? "category" : "categoryName", category);
  }

  if (filters.brand?.trim()) {
    const brand = filters.brand.trim();
    params.set(/^\d+$/.test(brand) ? "brand" : "brandName", brand);
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

  params.set("sort", toBackendSort(filters.sort));
  params.set(
    "page",
    String(Math.max(0, filters.page - 1)),
  );
  params.set(
    "pageSize",
    String(Math.min(100, Math.max(1, filters.pageSize))),
  );

  const query = params.toString();
  return query
    ? `/api/v1/products?${query}`
    : "/api/v1/products";
}

export async function getProducts(
  filters: ProductFilters,
): Promise<ProductListResponse> {
  const data =
    await apiClient.requestApi<
      BackendPageResponse<BackendProductResponse>
    >(buildProductPath(filters));

  const items =
    data.content.map(
      mapBackendProductToSummary,
    );

  return {
    items,
    pagination: {
      page: data.pageNumber + 1,
      pageSize: data.pageSize,
      totalItems: data.totalElements,
      totalPages: data.totalPages,
      hasNextPage:
        data.pageNumber + 1 < data.totalPages,
      hasPreviousPage:
        data.pageNumber > 0,
    },
  };
}

export async function getProductById(
  id: string,
): Promise<ProductDetails | null> {
  const numericId =
    Number.parseInt(id, 10);

  if (!Number.isSafeInteger(numericId) || numericId < 1) {
    return null;
  }

  try {
    const data =
      await apiClient.requestApi<BackendProductResponse>(
        `/api/v1/products/${numericId}`,
      );

    return mapBackendProductToDetails(data);
  } catch (error) {
    if (
      error instanceof HttpApiError &&
      error.status === 404
    ) {
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
  const numericProductId =
    Number.parseInt(productId, 10);

  const data =
    await apiClient.requestApi<
      BackendPageResponse<BackendProductResponse>
    >(
      categoryId
        ? `/api/v1/products?category=${encodeURIComponent(categoryId)}&page=0&pageSize=${Math.min(100, Math.max(1, limit + 1))}`
        : `/api/v1/products?page=0&pageSize=${Math.min(100, Math.max(1, limit + 1))}`,
    );

  return data.content
    .filter(
      (product) =>
        product.id !== numericProductId,
    )
    .slice(0, limit)
    .map(mapBackendProductToSummary);
}

export async function searchProducts(
  query: string,
): Promise<ProductSummary[]> {
  const response =
    await getProducts({
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
      pageSize: 100,
    });

  return response.items;
}
