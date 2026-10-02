export type SearchSuggestionType =
  | "PRODUCT"
  | "CATEGORY"
  | "BRAND"
  | "QUERY";

export interface SearchSuggestion {
  id: string;
  label: string;
  type: SearchSuggestionType;
  subtitle?: string;
  image?: string;
  href?: string;
}