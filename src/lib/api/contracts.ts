/**
 * Frontend-only contracts. They intentionally do not pretend to be the final Spring Boot DTOs.
 * During integration these types will be aligned with the backend source of truth.
 */
export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type ProductSummary = {
  id: string;
  name: string;
  price?: number;
  currency?: string;
};
