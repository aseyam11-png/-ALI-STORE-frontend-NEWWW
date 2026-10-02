import {
  categoryFilterConfigs,
} from "../data/category-filters";

import type {
  CategoryFilterConfig,
} from "../types/filter.types";

export function getCategoryFilters(
  categorySlug: string,
): CategoryFilterConfig {
  const exact =
    categoryFilterConfigs.find(
      (config) =>
        config.categorySlug ===
        categorySlug,
    );

  if (exact) {
    return exact;
  }

  // No category-specific facets configured for this slug — return no
  // filters rather than borrowing another department's irrelevant facets.
  return {
    categorySlug,
    filters: [],
  };
}