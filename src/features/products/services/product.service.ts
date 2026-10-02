import type { ProductDetails, ProductListResponse, ProductSummary } from "../types/product.types";
import type { ProductFilters } from "../types/product-filter.types";
import { fetchProduct, fetchProducts, type BackendProduct } from "./product-api.service";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function mapProduct(product: BackendProduct): ProductSummary {
  const inStock = product.availability === "IN_STOCK";
  return {
    id: String(product.id),
    sku: product.sku ?? `PRODUCT-${product.id}`,
    name: product.name,
    slug: product.slug,
    shortDescription: product.description ?? "",
    price: { amount: Number(product.price), currency: product.currency || "SAR", unit: "piece" },
    minOrderQuantity: 1,
    rating: 0,
    reviewCount: 0,
    supplier: { id: "ali-store-fulfillment", name: "ALI STORE", verified: true },
    shipping: "Delivery confirmed at fulfillment",
    thumbnail: product.primaryImageUrl
      ? { id: `${product.id}-primary`, url: product.primaryImageUrl, alt: product.name, sortOrder: 0 }
      : undefined,
    category: product.categoryId
      ? { id: String(product.categoryId), name: product.categoryName ?? "General", slug: slugify(product.categoryName ?? "General") }
      : undefined,
    brand: product.brandId
      ? { id: String(product.brandId), name: product.brandName ?? "ALI STORE", slug: slugify(product.brandName ?? "ALI STORE") }
      : undefined,
    stockQuantity: inStock ? 1 : 0,
    availableQuantity: inStock ? 1 : 0,
    stockStatus: inStock ? "in_stock" : "out_of_stock",
    status: product.status === "ACTIVE" ? "active" : "archived",
    featured: false, bestseller: false, newArrival: false, tags: [],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
}

function mapDetails(product: BackendProduct): ProductDetails {
  const summary = mapProduct(product);
  const images = product.images.length
    ? product.images.map((url, index) => ({ id: `${product.id}-image-${index}`, url, alt: product.name, sortOrder: index }))
    : summary.thumbnail ? [summary.thumbnail] : [];
  return {
    ...summary,
    description: product.description ?? "",
    images, videos: [], variants: [], specifications: [], priceTiers: [],
    shippingMethods: [{
      id: `${product.id}-fulfillment`, name: "Supplier fulfillment",
      description: "Delivery estimate is confirmed after supplier acceptance.",
      price: 0, currency: product.currency || "SAR", estimatedMinDays: 0, estimatedMaxDays: 0,
      available: summary.availableQuantity > 0,
    }],
    reviewSummary: { rating: 0, reviewCount: 0, distribution: { five: 0, four: 0, three: 0, two: 0, one: 0 } },
    seo: { title: `${product.name} | ALI STORE`, description: product.description ?? `Shop ${product.name} at ALI STORE.`, keywords: [product.name, product.categoryName ?? ""].filter(Boolean) },
    relatedProductIds: [],
  };
}

export async function getProducts(filters: ProductFilters): Promise<ProductListResponse> {
  const response = await fetchProducts({
    q: filters.search?.trim() || undefined,
    category: filters.categoryId || undefined,
    brand: filters.brand || undefined,
    minPrice: filters.minPrice !== undefined ? String(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice !== undefined ? String(filters.maxPrice) : undefined,
    availability: filters.inStockOnly ? "IN_STOCK" : undefined,
    sort: filters.sort === "price_asc" ? "price_asc" : filters.sort === "price_desc" ? "price_desc" : "relevance",
    page: Math.max(0, filters.page - 1),
    pageSize: Math.min(100, Math.max(1, filters.pageSize)),
  });
  const page = response.pageNumber + 1;
  return {
    items: response.content.map(mapProduct),
    pagination: { page, pageSize: response.pageSize, totalItems: Number(response.totalElements), totalPages: response.totalPages, hasNextPage: !response.last, hasPreviousPage: page > 1 },
  };
}

export async function getProductById(id: string): Promise<ProductDetails | null> {
  const product = await fetchProduct(id);
  return product ? mapDetails(product) : null;
}

export async function getRelatedProducts(productId: string, categoryId?: string, limit = 4) {
  const response = await fetchProducts({ category: categoryId, page: 0, pageSize: limit + 1 });
  return response.content.map(mapProduct).filter((product) => product.id !== productId).slice(0, limit);
}

export async function searchProducts(query: string): Promise<ProductSummary[]> {
  const response = await getProducts({ search: query, categoryId: undefined, subcategoryId: undefined, brand: undefined, supplierId: undefined, minPrice: undefined, maxPrice: undefined, minRating: undefined, verifiedSupplierOnly: false, discountOnly: false, inStockOnly: false, featuredOnly: false, bestsellerOnly: false, newArrivalOnly: false, sort: "relevance", page: 1, pageSize: 100 });
  return response.items;
}
