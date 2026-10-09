import { getSiteUrl } from "@/lib/seo/site-url";
import type { MetadataRoute } from "next";

import {
  getCategories,
  flattenCategoryTree,
} from "@/features/catalog/services/category-api.service";
import {
  getProducts,
} from "@/features/products/services/product.service";
import { defaultProductFilters } from "@/features/products/types/product-filter.types";


export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return [];

  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = [
    { url: siteUrl + "/", changeFrequency: "daily", priority: 1 },
    { url: siteUrl + "/shop/products", changeFrequency: "daily", priority: 0.9 },
    { url: siteUrl + "/shop/deals", changeFrequency: "hourly", priority: 0.7 },
  ];

  let categoryEntries: MetadataRoute.Sitemap = [];
  try {
    const tree = await getCategories();
    categoryEntries = flattenCategoryTree(tree).map((category) => ({
      url: siteUrl + "/shop/categories/" + encodeURIComponent(category.slug),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {
    // The sitemap still returns its stable public routes if the catalog is offline.
  }

  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const firstPage = await getProducts({
      ...defaultProductFilters,
      page: 1,
      pageSize: 100,
    });
    const pagesToFetch = Math.min(Math.max(firstPage.pagination.totalPages, 1), 100);
    const productPages = [firstPage];

    for (let start = 2; start <= pagesToFetch; start += 5) {
      const pageNumbers = Array.from(
        { length: Math.min(5, pagesToFetch - start + 1) },
        (_, index) => start + index,
      );

      const pages = await Promise.all(
        pageNumbers.map((page) =>
          getProducts({
            ...defaultProductFilters,
            page,
            pageSize: 100,
          }).catch(() => null),
        ),
      );

      productPages.push(...pages.filter((page) => page !== null));
    }

    productEntries = productPages
      .flatMap((page) => page.items)
      .filter((product) => product.status === "active" && Boolean(product.slug))
      .map((product) => {
        const updatedAt = Date.parse(product.updatedAt);
        return {
          url: siteUrl + "/shop/products/" + encodeURIComponent(product.id),
          ...(Number.isFinite(updatedAt) && updatedAt > Date.UTC(2000, 0, 1)
            ? { lastModified: new Date(updatedAt) }
            : {}),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        };
      });
  } catch {
    // Product URLs are omitted if the backend cannot provide a verified catalog.
  }

  // A single sitemap must remain within the common 50,000-URL limit.
  return [...staticEntries, ...categoryEntries, ...productEntries].slice(0, 50_000);
}
