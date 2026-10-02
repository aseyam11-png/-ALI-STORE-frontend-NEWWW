import type { ProductFilters } from "../types/product-filter.types";

export function validateProductFilters(
  filters: ProductFilters,
): string[] {
  const errors: string[] = [];

  if (
    filters.minPrice !== undefined &&
    filters.minPrice < 0
  ) {
    errors.push(
      "Minimum price cannot be negative.",
    );
  }

  if (
    filters.maxPrice !== undefined &&
    filters.maxPrice < 0
  ) {
    errors.push(
      "Maximum price cannot be negative.",
    );
  }

  if (
    filters.minPrice !== undefined &&
    filters.maxPrice !== undefined &&
    filters.minPrice >
      filters.maxPrice
  ) {
    errors.push(
      "Minimum price cannot exceed maximum price.",
    );
  }

  if (
    filters.minRating !== undefined &&
    (
      filters.minRating < 0 ||
      filters.minRating > 5
    )
  ) {
    errors.push(
      "Rating must be between 0 and 5.",
    );
  }

  if (filters.page < 1) {
    errors.push(
      "Page must be greater than zero.",
    );
  }

  if (filters.pageSize < 1) {
    errors.push(
      "Page size must be greater than zero.",
    );
  }

  return errors;
}
