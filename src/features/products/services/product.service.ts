import { apiClient } from "@/lib/api/http-client";
import type {
  ProductDetails,
  ProductListResponse,
  ProductSummary,
  ProductCategory,
  ProductBrand,
} from "../types/product.types";
import type { ProductFilters, ProductSort } from "../types/product-filter.types";

type BackendAvailability = "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
type BackendStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

type BackendProduct = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  currency: string;
  sku: string;
  status: BackendStatus;
  availability: BackendAvailability;
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

const SORT_MAP: Record<ProductSort, string> = {
  relevance: "relevance",
  price_asc: "price_asc",
  price_desc: "price_desc",
  rating_desc: "rating_desc",
  reviews_desc: "reviews_desc",
  name_asc: "relevance",
  name_desc: "relevance",
  discount_desc: "relevance",
  newest: "relevance",
};

function toQuery(filters: ProductFilters): string {
  const params = new URLSearchParams();

  if (filters.search.trim()) params.set("q", filters.search.trim());

  const categoryId = Number(filters.categoryId);
  if (filters.categoryId && Number.isInteger(categoryId) && categoryId > 0) {
    params.set("category", String(categoryId));
  }

  const brandId = Number(filters.brand);
  if (filters.brand && Number.isInteger(brandId) && brandId > 0) {
    params.set("brand", String(brandId));
  }

  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));

  if (filters.inStockOnly) params.set("availability", "IN_STOCK");

  params.set("sort", SORT_MAP[filters.sort] ?? "relevance");
  params.set("page", String(Math.max(0, filters.page - 1)));
  params.set("pageSize", String(Math.min(100, Math.max(1, filters.pageSize))));

  return params.toString();
}

function toCategory(product: BackendProduct): ProductCategory {
  return {
    id: String(product.categoryId),
    name: product.categoryName,
    slug: product.categoryName.toLowerCase().replace(/\s+/g, "-"),
  };
}

function toBrand(product: BackendProduct): ProductBrand | undefined {
  if (!product.brandId || !product.brandName) return undefined;

  return {
    id: String(product.brandId),
    name: product.brandName,
    slug: product.brandName.toLowerCase().replace(/\s+/g, "-"),
  };
}

function toStockStatus(availability: BackendAvailability): ProductSummary["stockStatus"] {
  switch (availability) {
    case "IN_STOCK":
      return "in_stock";
    case "OUT_OF_STOCK":
      return "out_of_stock";
    default:
      return "unknown";
  }
}

function mapBackendProduct(product: BackendProduct): ProductSummary {
  const images = product.images ?? [];
  const image = product.primaryImageUrl ?? images[0];

  return {
    id: String(product.id),
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    shortDescription: product.description ?? undefined,
    price: {
      amount: Number(product.price),
      currency: product.currency,
      unit: "item",
    },
    minOrderQuantity: 1,
    rating: 0,
    reviewCount: 0,
    // Customer views must never expose the external supplier identity.
    supplier: {
      id: "store-fulfillment",
      name: "ALI STORE",
      verified: false,
    },
    shipping: "Calculated at checkout",
    thumbnail: image
      ? {
          id: `${product.id}-primary`,
          url: image,
          alt: product.name,
          sortOrder: 0,
        }
      : undefined,
    discountPercentage: undefined,
    category: toCategory(product),
    brand: toBrand(product),
    stockQuantity: product.availability === "IN_STOCK" ? 1 : 0,
    availableQuantity: product.availability === "IN_STOCK" ? 1 : 0,
    stockStatus: toStockStatus(product.availability),
    status: product.status.toLowerCase() as ProductSummary["status"],
    featured: false,
    bestseller: false,
    newArrival: false,
    tags: [],
    createdAt: "",
    updatedAt: "",
  };
}

function mapPage(page: BackendPage<BackendProduct>): ProductListResponse {
  const items = page.content.map(mapBackendProduct);

  return {
    items,
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

export async function getProducts(filters: ProductFilters): Promise<ProductListResponse> {
  const page = await apiClient.request<BackendPage<BackendProduct>>(
    `/api/v1/products?${toQuery(filters)}`,
  );
  return mapPage(page);
}

export async function getProductById(id: string): Promise<ProductDetails | null> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) return null;

  try {
    const product = await apiClient.request<BackendProduct>(
      `/api/v1/products/${numericId}`,
    );
    const summary = mapBackendProduct(product);
    const images = (product.images ?? []).map((url, index) => ({
      id: `${product.id}-image-${index}`,
      url,
      alt: product.name,
      sortOrder: index,
    }));

    return {
      ...summary,
      description: product.description ?? "",
      images,
      videos: [],
      variants: [],
      specifications: [],
      priceTiers: [],
      shippingMethods: [],
      reviewSummary: {
        rating: 0,
        reviewCount: 0,
        distribution: { five: 0, four: 0, three: 0, two: 0, one: 0 },
      },
      seo: {
        title: product.name,
        description: product.description ?? undefined,
      },
      relatedProductIds: [],
    };
  } catch (error) {
    if (error instanceof Error && "status" in error && (error as { status?: number }).status === 404) {
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
  const filters: ProductFilters = {
    search: "",
    categoryId: categoryId && /^\d+$/.test(categoryId) ? categoryId : undefined,
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
    pageSize: Math.max(limit + 1, 5),
  };

  const response = await getProducts(filters);
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
