import type {
  ProductDetails,
  ProductListResponse,
  ProductSummary,
} from "../types/product.types";
import type { ProductFilters } from "../types/product-filter.types";
import type { ProductSort } from "../types/product-filter.types";
import { apiClient } from "@/lib/api/http-client";

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
  availableQuantity?: number;
  rating?: number | string;
  reviewCount?: number;
  categoryId?: number;
  categoryName?: string;
  categorySlug?: string;
  brandId?: number;
  brandName?: string;
  brandSlug?: string;
  images?: string[];
  primaryImageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type BackendPage<T> = {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
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

function parseMoney(value: number | string | undefined): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
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

function mapProduct(product: BackendProduct): ProductSummary {
  const price = parseMoney(product.price);
  const availableQuantity = Math.max(0, Math.floor(Number(product.availableQuantity ?? 0)));
  const imageUrl = product.primaryImageUrl ?? product.images?.[0];
  const categorySlug = product.categorySlug ?? "";
  const brandName = product.brandName ?? "ALI STORE";
  const brandSlug = product.brandSlug ?? brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return {
    id: String(product.id),
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    shortDescription: product.description ?? "",
    price: {
      amount: price,
      currency: product.currency || "SAR",
      unit: "piece",
    },
    minOrderQuantity: 1,
    rating: Math.max(0, Math.min(5, Number(product.rating ?? 0))),
    reviewCount: Math.max(0, Number(product.reviewCount ?? 0)),
    supplier: {
      id: "ali-store-fulfillment",
      name: "ALI STORE",
      verified: true,
    },
    shipping: "Calculated at checkout",
    thumbnail: imageUrl
      ? {
          id: `product-${product.id}-primary`,
          url: imageUrl,
          alt: product.name,
          sortOrder: 0,
        }
      : undefined,
    category: product.categoryId
      ? {
          id: String(product.categoryId),
          name: product.categoryName ?? "Category",
          slug: categorySlug,
        }
      : undefined,
    brand: {
      id: product.brandId ? String(product.brandId) : "ali-store",
      name: brandName,
      slug: brandSlug,
    },
    availableQuantity,
    stockQuantity: availableQuantity,
    stockStatus:
      product.availability === "UNKNOWN"
        ? "out_of_stock"
        : availableQuantity <= 0
          ? "out_of_stock"
          : availableQuantity <= 5
            ? "low_stock"
            : "in_stock",
    status: mapStatus(product.status),
    featured: true,
    bestseller: Number(product.rating ?? 0) >= 4.8,
    newArrival: Boolean(
      product.createdAt &&
        Date.now() - new Date(product.createdAt).getTime() <= 1000 * 60 * 60 * 24 * 60,
    ),
    tags: [],
    createdAt: product.createdAt ?? new Date(0).toISOString(),
    updatedAt: product.updatedAt ?? product.createdAt ?? new Date(0).toISOString(),
  };
}

function mapDetails(product: BackendProduct): ProductDetails {
  const summary = mapProduct(product);
  const images = (product.images ?? []).map((url, index) => ({
    id: `product-${product.id}-image-${index}`,
    url,
    alt: product.name,
    sortOrder: index,
  }));

  const primaryImage = summary.thumbnail;
  const finalImages = images.length > 0
    ? images
    : primaryImage
      ? [primaryImage]
      : [];

  const stock = summary.availableQuantity;

  return {
    ...summary,
    description: product.description ?? "",
    images: finalImages,
    videos: [],
    variants: [
      {
        id: `product-${product.id}-default`,
        sku: product.sku,
        name: "Standard",
        price: summary.price,
        stockQuantity: stock,
        availableQuantity: stock,
        options: [],
        image: finalImages[0],
        active: stock > 0,
      },
    ],
    specifications: [
      { key: "sku", label: "SKU", value: product.sku, group: "Product" },
      {
        key: "availability",
        label: "Availability",
        value: product.availability,
        group: "Inventory",
      },
      {
        key: "shipping",
        label: "Shipping",
        value: "Calculated at checkout",
        group: "Logistics",
      },
    ],
    priceTiers: [
      {
        minQuantity: 1,
        unitPrice: summary.price.amount,
        currency: summary.price.currency,
      },
    ],
    shippingMethods: [
      {
        id: `product-${product.id}-standard`,
        name: "Standard Shipping",
        description: "Calculated from your order subtotal at checkout.",
        price: 0,
        currency: summary.price.currency,
        estimatedMinDays: 7,
        estimatedMaxDays: 15,
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
      description: product.description ?? `Buy ${product.name} from ALI STORE.`,
      keywords: [product.name, product.categoryName ?? "", product.brandName ?? "ALI STORE"].filter(Boolean),
    },
    relatedProductIds: [],
  };
}

function backendPageToProductList(page: BackendPage<BackendProduct>): ProductListResponse {
  const items = page.content.map(mapProduct);
  return {
    items,
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
    case "newest":
      return sort;
    default:
      return "relevance";
  }
}

export async function getProducts(filters: ProductFilters): Promise<ProductListResponse> {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set("q", filters.search.trim());
  if (filters.categoryId?.trim()) params.set("categorySlug", filters.categoryId.trim());
  if (filters.brand?.trim()) params.set("brandSlug", filters.brand.trim());
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters.inStockOnly) params.set("availability", "IN_STOCK");
  params.set("sort", mapSort(filters.sort));
  params.set("page", String(Math.max(0, filters.page - 1)));
  params.set("pageSize", String(Math.min(100, Math.max(1, filters.pageSize))));

  const response = await apiClient.request<BackendApiResponse<BackendPage<BackendProduct>>>(
    `/api/v1/products?${params.toString()}`,
  );
  return backendPageToProductList(unwrap(response));
}

export async function getProductById(idOrSlug: string): Promise<ProductDetails | null> {
  try {
    const isNumeric = /^\d+$/.test(idOrSlug);
    const endpoint = isNumeric
      ? `/api/v1/products/${encodeURIComponent(idOrSlug)}`
      : `/api/v1/products/slug/${encodeURIComponent(idOrSlug)}`;
    const response = await apiClient.request<BackendApiResponse<BackendProduct>>(endpoint);
    return mapDetails(unwrap(response));
  } catch (error) {
    if (error instanceof Error && /not found/i.test(error.message)) return null;
    throw error;
  }
}

export async function getRelatedProducts(
  productId: string,
  categorySlug?: string,
  limit = 4,
): Promise<ProductSummary[]> {
  const params = new URLSearchParams();
  if (categorySlug) params.set("categorySlug", categorySlug);
  params.set("page", "0");
  params.set("pageSize", String(Math.min(100, Math.max(limit, 8))));
  params.set("sort", "relevance");

  const response = await apiClient.request<BackendApiResponse<BackendPage<BackendProduct>>>(
    `/api/v1/products?${params.toString()}`,
  );

  return unwrap(response)
    .content
    .map(mapProduct)
    .filter((product) => product.id !== productId)
    .slice(0, limit);
}

export async function searchProducts(query: string): Promise<ProductSummary[]> {
  const response = await getProducts({
    search: query,
    sort: "relevance",
    page: 1,
    pageSize: 24,
    verifiedSupplierOnly: false,
    discountOnly: false,
    inStockOnly: false,
    featuredOnly: false,
    bestsellerOnly: false,
    newArrivalOnly: false,
  });
  return response.items;
}
