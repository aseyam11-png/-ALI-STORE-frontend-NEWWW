export interface SearchFilters {
  brand?: string[];
  rating?: number;
  availability?: "in-stock";
  shipping?: "free";
  discount?: "sale";
  attributes?: Record<string, string[]>;
}

export interface SearchQuery {
  q?: string;
  category?: string;
  page: number;
  pageSize: number;
  sort: "featured" | "price-low" | "price-high";
  filters: SearchFilters;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  query: SearchQuery;
}
