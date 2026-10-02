export type AutocompleteSuggestionType =
  | "PRODUCT"
  | "CATEGORY"
  | "BRAND";

export interface AutocompleteSuggestion {
  id: string;

  type: AutocompleteSuggestionType;

  title: string;

  subtitle?: string;

  href: string;

  image?: string;

  score: number;
}