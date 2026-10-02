import type { ApiResponse, PageResponse } from "@/lib/api/contracts";
import { apiClient } from "@/lib/api/http-client";
import type {
  BackendProductResponse,
} from "../types/product-api.types";
import type {
  ProductDetails,
  ProductListResponse,
  ProductSummary,
} from "../types/product.types";
import type { ProductFilters } from "../types/product-filter.types";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


function mapBackendProduct(product: BackendProductResponse): ProductSummary {
  const discount = Math.max(
    0,
    Math.min(100, Number(product.discountPercentage ?? 0)),
  );
  const originalAmount =
    discount > 0
      ? Number((product.price / Math.max(0.01, 1 - discount / 100)).toFixed(2))
      : undefined;

  const image = product.primaryImageUrl ?? product.images[0];

  return {
    id: String(product.id),
    sku: product.sku ?? "",
    name: product.name,
    slug: product.slug,
    shortDescription: product.description ?? "",
    price: {
      amount: Number(product.price),
      currency: product.currency || "SAR",
      unit: "piece",
      originalAmount,
      discountPercentage: discount > 0 ? discount : undefined,
    },
    minOrderQuantity: 1,
    rating: 0,
    reviewCount: 0,
    supplier: {
      id: "ali-store-fulfillment",
      name: "ALI STORE",
      verified: true,
    },
    shipping: "يُحدد الشحن عند الدفع",
    thumbnail: image
      ? {
          id: `product-${product.id}-primary`,
          url: image,
          alt: product.name,
          sortOrder: 0,
        }
      : undefined,
    discountPercentage: discount > 0 ? discount : undefined,
    category: {
      id: String(product.categoryId),
      name: product.categoryName,
      slug: slugify(product.categoryName),
    },
    brand: product.brandId
      ? {
          id: String(product.brandId),
          name: product.brandName ?? "ALI STORE",
          slug: slugify(product.brandName ?? "ALI STORE"),
        }
      : undefined,
    stockQuantity: product.availability === "IN_STOCK" ? 1 : 0,
    availableQuantity: product.availability === "IN_STOCK" ? 1 : 0,
    stockStatus: mapAvailability(product.availability),
    availability: product.availability,
    status: "active",
    featured: false,
    bestseller: false,
    newArrival: false,
    tags: [],
    createdAt: "",
    updatedAt: "",
  };
}

async function requestProducts(
  filters: ProductFilters,
): Promise<ProductListResponse> {
  const params = new URLSearchParams();
  const backendPage = Math.max(0, filters.page - 1);

  if (filters.search.trim()) params.set("q", filters.search.trim());

  if (filters.categoryId && /^\d+$/.test(filters.categoryId)) {
    params.set("category", filters.categoryId);
  }

  if (filters.brand && /^\d+$/.test(filters.brand)) {
    params.set("brand", filters.brand);
  }

  if (filters.minPrice !== undefined) {
    params.set("minPrice", String(Math.max(0, filters.minPrice)));
  }

  if (filters.maxPrice !== undefined) {
    params.set("maxPrice", String(Math.max(0, filters.maxPrice)));
  }

  if (filters.inStockOnly) params.set("availability", "IN_STOCK");
  if (filters.discountOnly) params.set("discountOnly", "true");

  const backendSort =
    filters.sort === "price_asc" ||
    filters.sort === "price_desc" ||
    filters.sort === "relevance" ||
    filters.sort === "newest"
      ? filters.sort
      : "relevance";

  params.set("sort", backendSort);
  params.set("page", String(backendPage));
  params.set("pageSize", String(Math.min(100, Math.max(1, filters.pageSize))));

  const response = await apiClient.request<
    ApiResponse<PageResponse<BackendProductResponse>>
  >(`/api/v1/products?${params.toString()}`);

  return {
    items: response.data.content.map(mapBackendProduct),
    pagination: {
      page: response.data.pageNumber + 1,
      pageSize: response.data.pageSize,
      totalItems: response.data.totalElements,
      totalPages: response.data.totalPages,
      hasNextPage: !response.data.last,
      hasPreviousPage: response.data.pageNumber > 0,
    },
  };
}

export async function getProducts(
  filters: ProductFilters,
): Promise<ProductListResponse> {
  return requestProducts(filters);
}

export async function getProductById(
  id: string,
): Promise<ProductDetails | null> {
  const path =
    /^\d+$/.test(id)
      ? `/api/v1/products/${encodeURIComponent(id)}`
      : `/api/v1/products/slug/${encodeURIComponent(id)}`;

  try {
    const response = await apiClient.request<
      ApiResponse<BackendProductResponse>
    >(path);
    const summary = mapBackendProduct(response.data);
    const image = response.data.primaryImageUrl ?? response.data.images[0];

    return {
      ...summary,
      description: response.data.description ?? "",
      images: response.data.images.map((url, index) => ({
        id: `product-${response.data.id}-${index}`,
        url,
        alt: response.data.name,
        sortOrder: index,
      })),
      videos: [],
      variants: [],
      specifications: [
        {
          key: "sku",
          label: "SKU",
          value: response.data.sku ?? "—",
          group: "Product",
        },
        {
          key: "category",
          label: "Category",
          value: response.data.categoryName,
          group: "Product",
        },
      ],
      priceTiers: [],
      shippingMethods: [],
      reviewSummary: {
        rating: 0,
        reviewCount: 0,
        distribution: {
          five: 0,
          four: 0,
          three: 0,
          two: 0,
          one: 0,
        },
      },
      seo: {
        title: `${response.data.name} | ALI STORE`,
        description: response.data.description ?? `${response.data.name} — ALI STORE`,
        keywords: [
          response.data.name,
          response.data.categoryName,
          response.data.brandName ?? "ALI STORE",
        ],
      },
      relatedProductIds: [],
      thumbnail: image
        ? {
            id: `product-${response.data.id}-primary`,
            url: image,
            alt: response.data.name,
          }
        : undefined,
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
  const response = await requestProducts({
    search: "",
    categoryId,
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
    pageSize: Math.max(limit + 1, 8),
  });

  return response.items
    .filter((product) => product.id !== productId)
    .slice(0, limit);
}

export async function searchProducts(
  query: string,
): Promise<ProductSummary[]> {
  const response = await requestProducts({
    search: query,
    categoryId: undefined,
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
