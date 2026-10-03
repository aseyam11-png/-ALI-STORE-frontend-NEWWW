import { apiClient } from "@/lib/api/http-client";

import type {
  ProductDetails,
  ProductListResponse,
  ProductSummary,
} from "../types/product.types";

import type { ProductFilters } from "../types/product-filter.types";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type BackendProduct = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  currency: string;
  sku?: string | null;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  availability: "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
  availableQuantity: number;
  lowStock?: boolean | null;
  inventoryLastSyncedAt?: string | null;
  categoryId: number;
  categoryName: string;
  brandId?: number | null;
  brandName?: string | null;
  images: string[];
  primaryImageUrl?: string | null;
};

type BackendPage<T> = {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
};

function asFrontendId(id: number): string {
  return String(id);
}

function mapBackendProduct(product: BackendProduct): ProductSummary {
  const available = Math.max(0, product.availableQuantity ?? 0);
  const status =
    product.availability === "OUT_OF_STOCK"
      ? "out_of_stock"
      : product.availability === "IN_STOCK"
        ? product.lowStock
          ? "low_stock"
          : "in_stock"
        : "out_of_stock";

  const images = Array.from(
    new Set(
      [
        product.primaryImageUrl,
        ...(product.images ?? []),
      ].filter((value): value is string => Boolean(value?.trim())),
    ),
  );

  return {
    id: asFrontendId(product.id),
    sku: product.sku ?? `PRODUCT-${product.id}`,
    name: product.name,
    slug: product.slug,
    shortDescription: product.description ?? undefined,
    price: {
      amount: Number(product.price),
      currency: product.currency || "USD",
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
    shipping: "Calculated at checkout",
    thumbnail: images[0]
      ? {
          id: `${product.id}-primary`,
          url: images[0],
          alt: product.name,
          sortOrder: 0,
        }
      : undefined,
    category: {
      id: String(product.categoryId),
      name: product.categoryName,
      slug: product.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    },
    brand: product.brandName
      ? {
          id: String(product.brandId ?? "unknown"),
          name: product.brandName,
          slug: product.brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        }
      : undefined,
    stockQuantity: available,
    availableQuantity: available,
    stockStatus: status,
    status: product.status === "ARCHIVED" ? "archived" : product.status === "DRAFT" ? "draft" : "active",
    featured: false,
    bestseller: false,
    newArrival: false,
    tags: [],
    createdAt: product.inventoryLastSyncedAt ?? new Date(0).toISOString(),
    updatedAt: product.inventoryLastSyncedAt ?? new Date(0).toISOString(),
  };
}

function buildQuery(filters: ProductFilters): string {
  const params = new URLSearchParams();

  if (filters.search.trim()) params.set("q", filters.search.trim());

  const categoryId = Number(filters.categoryId);
  if (filters.categoryId && Number.isFinite(categoryId)) {
    params.set("category", String(categoryId));
  }

  const brandId = Number(filters.brand);
  if (filters.brand && Number.isFinite(brandId)) {
    params.set("brand", String(brandId));
  }

  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));

  if (filters.inStockOnly) params.set("availability", "IN_STOCK");

  const serverSort =
    filters.sort === "price_asc" || filters.sort === "price_desc"
      ? filters.sort
      : "relevance";

  params.set("sort", serverSort);
  params.set("page", String(Math.max(0, filters.page - 1)));
  params.set("pageSize", String(Math.max(1, Math.min(100, filters.pageSize))));

  return params.toString();
}

export async function getProducts(
  filters: ProductFilters,
): Promise<ProductListResponse> {
  const query = buildQuery(filters);
  const response = await apiClient.request<ApiResponse<BackendPage<BackendProduct>>>(
    `/api/v1/products?${query}`,
  );

  const page = response.data;

  return {
    items: page.content.map(mapBackendProduct),
    pagination: {
      page: page.pageNumber + 1,
      pageSize: page.pageSize,
      totalItems: page.totalElements,
      totalPages: page.totalPages,
      hasNextPage: !page.isLast,
      hasPreviousPage: page.pageNumber > 0,
    },
  };
}

export async function getProductById(
  id: string,
): Promise<ProductDetails | null> {
  if (!/^\d+$/.test(id)) return null;

  try {
    const response = await apiClient.request<ApiResponse<BackendProduct>>(
      `/api/v1/products/${encodeURIComponent(id)}`,
    );

    const summary = mapBackendProduct(response.data);
    const image = summary.thumbnail;

    return {
      ...summary,
      description: response.data.description ?? summary.name,
      images: image ? [image] : [],
      videos: [],
      variants: [
        {
          id: `${summary.id}-default`,
          sku: summary.sku,
          name: "Standard",
          price: summary.price,
          stockQuantity: summary.stockQuantity,
          availableQuantity: summary.availableQuantity,
          options: [],
          image,
          active: true,
        },
      ],
      specifications: [
        {
          key: "sku",
          label: "SKU",
          value: summary.sku,
          group: "Product",
        },
        {
          key: "availability",
          label: "Availability",
          value: summary.stockStatus,
          group: "Inventory",
        },
      ],
      priceTiers: [],
      shippingMethods: [
        {
          id: `${summary.id}-standard`,
          name: "Standard Shipping",
          description: "Shipping is calculated from the current fulfillment data.",
          price: 0,
          currency: summary.price.currency,
          estimatedMinDays: 0,
          estimatedMaxDays: 0,
          available: true,
        },
      ],
      reviewSummary: {
        rating: 0,
        reviewCount: 0,
        distribution: { five: 0, four: 0, three: 0, two: 0, one: 0 },
      },
      seo: {
        title: `${summary.name} | ALI STORE`,
        description: summary.shortDescription ?? summary.name,
        keywords: [summary.name, summary.sku],
      },
      relatedProductIds: [],
    };
  } catch {
    return null;
  }
}

export async function getRelatedProducts(
  productId: string,
  categoryId?: string,
  limit = 4,
): Promise<ProductSummary[]> {
  const categoryNumber = Number(categoryId);
  const response = await getProducts({
    search: "",
    categoryId: Number.isFinite(categoryNumber) ? categoryId : undefined,
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
    pageSize: Math.max(limit + 1, 5),
  });

  return response.items.filter((product) => product.id !== productId).slice(0, limit);
}

export async function searchProducts(query: string): Promise<ProductSummary[]> {
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
    pageSize: 96,
  });

  return response.items;
}
