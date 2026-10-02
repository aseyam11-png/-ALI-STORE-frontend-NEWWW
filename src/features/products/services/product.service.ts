import { apiClient } from "@/lib/api/http-client";
import type {
  BackendProduct,
  PageResponse,
} from "@/lib/api/contracts";

import type {
  ProductDetails,
  ProductImage,
  ProductListResponse,
  ProductSummary,
  ProductStockStatus,
} from "../types/product.types";

import type {
  ProductFilters,
} from "../types/product-filter.types";

function toStockStatus(
  availability: BackendProduct["availability"],
): ProductStockStatus {
  switch (availability) {
    case "IN_STOCK":
      return "in_stock";
    case "OUT_OF_STOCK":
      return "out_of_stock";
    default:
      return "unknown";
  }
}

function mapImage(
  url: string,
  index: number,
  productName: string,
): ProductImage {
  return {
    id: `${productName}-image-${index}`,
    url,
    alt: productName,
    sortOrder: index,
  };
}

function mapBackendProduct(
  product: BackendProduct,
): ProductSummary {
  const images = product.images
    .filter(Boolean)
    .map((url, index) =>
      mapImage(url, index, product.name),
    );

  const primaryUrl =
    product.primaryImageUrl ??
    product.images[0];

  const thumbnail =
    primaryUrl
      ? mapImage(
          primaryUrl,
          0,
          product.name,
        )
      : undefined;

  return {
    id: String(product.id),
    sku:
      product.sku ??
      `PRODUCT-${product.id}`,
    name: product.name,
    slug: product.slug,
    shortDescription:
      product.description ??
      undefined,
    price: {
      amount: Number(product.price),
      currency: product.currency,
      unit: "unit",
    },
    minOrderQuantity: 1,
    rating: 0,
    reviewCount: 0,
    // Customer UI must never expose the external supplier identity.
    // Supplier execution remains a backend/fulfillment concern.
    supplier: {
      id: "internal-fulfillment",
      name: "ALI STORE",
      verified: true,
    },
    shipping: "Tracked delivery",
    thumbnail,
    category: {
      id: String(product.categoryId),
      name: product.categoryName,
      slug: product.categoryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    },
    brand:
      product.brandId != null &&
      product.brandName
        ? {
            id: String(product.brandId),
            name: product.brandName,
            slug: product.brandName
              .toLowerCase()
              .replace(
                /[^a-z0-9]+/g,
                "-",
              )
              .replace(
                /^-|-$/g,
                "",
              ),
          }
        : undefined,
    stockQuantity: 0,
    availableQuantity: 0,
    stockStatus: toStockStatus(
      product.availability,
    ),
    status:
      product.status === "ACTIVE"
        ? "active"
        : product.status ===
            "ARCHIVED"
          ? "archived"
          : "draft",
    featured: false,
    bestseller: false,
    newArrival: false,
    tags: [],
    createdAt:
      product.createdAt ??
      "",
    updatedAt:
      product.updatedAt ??
      "",
  };
}

function mapPage(
  page: PageResponse<BackendProduct>,
): ProductListResponse {
  return {
    items: page.content.map(
      mapBackendProduct,
    ),
    pagination: {
      page: page.pageNumber + 1,
      pageSize: page.pageSize,
      totalItems:
        page.totalElements,
      totalPages:
        page.totalPages,
      hasNextPage:
        page.pageNumber + 1 <
        page.totalPages,
      hasPreviousPage:
        page.pageNumber > 0,
    },
  };
}

function backendSort(
  sort: ProductFilters["sort"],
): string {
  switch (sort) {
    case "price_asc":
      return "price_asc";
    case "price_desc":
      return "price_desc";
    default:
      return "relevance";
  }
}

export async function getProducts(
  filters: ProductFilters,
): Promise<ProductListResponse> {
  const params =
    new URLSearchParams();

  if (filters.search.trim()) {
    params.set(
      "q",
      filters.search.trim(),
    );
  }

  if (filters.categoryId) {
    params.set(
      "category",
      filters.categoryId,
    );
  }

  if (
    filters.minPrice !==
    undefined
  ) {
    params.set(
      "minPrice",
      String(filters.minPrice),
    );
  }

  if (
    filters.maxPrice !==
    undefined
  ) {
    params.set(
      "maxPrice",
      String(filters.maxPrice),
    );
  }

  if (filters.inStockOnly) {
    params.set(
      "availability",
      "IN_STOCK",
    );
  }

  params.set(
    "sort",
    backendSort(filters.sort),
  );

  params.set(
    "page",
    String(
      Math.max(
        0,
        filters.page - 1,
      ),
    ),
  );

  params.set(
    "pageSize",
    String(
      Math.min(
        100,
        Math.max(
          1,
          filters.pageSize,
        ),
      ),
    ),
  );

  const query =
    params.toString();

  const page =
    await apiClient.request<
      PageResponse<BackendProduct>
    >(
      `/api/v1/products${query ? `?${query}` : ""}`,
    );

  let response =
    mapPage(page);

  // Backend does not currently expose rating, supplier-verified, discount,
  // featured or newest metadata. Never fabricate those filters/sorts.
  // Name sorting is safe client-side because the backend already returned
  // the canonical product records.
  if (
    filters.brand &&
    filters.brand !== "all"
  ) {
    response = {
      ...response,
      items:
        response.items.filter(
          (product) =>
            product.brand?.name
              .toLowerCase() ===
            filters.brand!.toLowerCase(),
        ),
    };
  }

  return response;
}

export async function getProductById(
  id: string,
): Promise<ProductDetails | null> {
  let product: BackendProduct;

  try {
    product =
      await apiClient.request<BackendProduct>(
        `/api/v1/products/${encodeURIComponent(id)}`,
      );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      Number(
        (error as { status?: unknown })
          .status,
      ) === 404
    ) {
      return null;
    }

    throw error;
  }

  const summary =
    mapBackendProduct(product);

  const images =
    product.images
      .filter(Boolean)
      .map(
        (url, index) =>
          mapImage(
            url,
            index,
            product.name,
          ),
      );

  const primary =
    images.find(
      (image) =>
        image.url ===
        product.primaryImageUrl,
    ) ??
    images[0];

  const shippingMethod = {
    id: `${summary.id}-standard`,
    name: "Tracked delivery",
    description:
      "Delivery estimate is confirmed by fulfillment.",
    price: 0,
    currency:
      summary.price.currency,
    estimatedMinDays: 0,
    estimatedMaxDays: 0,
    available: true,
  };

  return {
    ...summary,
    description:
      product.description ??
      "",
    images,
    videos: [],
    variants: [
      {
        id: `${summary.id}-default`,
        sku: summary.sku,
        name: "Standard",
        price: summary.price,
        stockQuantity: 0,
        availableQuantity: 0,
        options: [
          {
            id: `${summary.id}-type`,
            name: "Type",
            value: "Standard",
          },
        ],
        image: primary,
        active:
          summary.stockStatus ===
          "in_stock",
      },
    ],
    specifications: [
      {
        key: "sku",
        label: "SKU",
        value: summary.sku,
      },
      {
        key: "category",
        label: "Category",
        value:
          product.categoryName,
      },
      ...(product.brandName
        ? [
            {
              key: "brand",
              label: "Brand",
              value:
                product.brandName,
            },
          ]
        : []),
    ],
    priceTiers: [
      {
        minQuantity: 1,
        unitPrice:
          summary.price.amount,
        currency:
          summary.price.currency,
      },
    ],
    shippingMethods: [
      shippingMethod,
    ],
    reviewSummary: {
      rating: summary.rating,
      reviewCount:
        summary.reviewCount,
      distribution: {
        five: 0,
        four: 0,
        three: 0,
        two: 0,
        one: 0,
      },
    },
    seo: {
      title: `${summary.name} | AliStore`,
      description:
        summary.shortDescription ??
        summary.name,
      keywords: [
        summary.name,
        product.categoryName,
      ],
    },
    relatedProductIds: [],
  };
}

export async function getRelatedProducts(
  productId: string,
  categoryId?: string,
  limit = 4,
): Promise<ProductSummary[]> {
  const response =
    await getProducts({
      search: "",
      categoryId,
      subcategoryId:
        undefined,
      brand: undefined,
      supplierId:
        undefined,
      minPrice:
        undefined,
      maxPrice:
        undefined,
      minRating:
        undefined,
      verifiedSupplierOnly:
        false,
      discountOnly:
        false,
      inStockOnly:
        false,
      featuredOnly:
        false,
      bestsellerOnly:
        false,
      newArrivalOnly:
        false,
      sort: "relevance",
      page: 1,
      pageSize: Math.max(
        limit + 1,
        5,
      ),
    });

  return response.items
    .filter(
      (product) =>
        product.id !==
        productId,
    )
    .slice(0, limit);
}

export async function searchProducts(
  query: string,
): Promise<ProductSummary[]> {
  const response =
    await getProducts({
      search: query,
      categoryId:
        undefined,
      subcategoryId:
        undefined,
      brand: undefined,
      supplierId:
        undefined,
      minPrice:
        undefined,
      maxPrice:
        undefined,
      minRating:
        undefined,
      verifiedSupplierOnly:
        false,
      discountOnly:
        false,
      inStockOnly:
        false,
      featuredOnly:
        false,
      bestsellerOnly:
        false,
      newArrivalOnly:
        false,
      sort: "relevance",
      page: 1,
      pageSize: 100,
    });

  return response.items;
}
