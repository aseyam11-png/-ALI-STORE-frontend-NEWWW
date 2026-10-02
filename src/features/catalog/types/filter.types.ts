export type FilterControl =
  | "select"
  | "multi-select"
  | "checkbox"
  | "range";

export interface CategoryFilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface CategoryFilterDefinition {
  id: string;
  label: string;
  control: FilterControl;

  options?: CategoryFilterOption[];

  min?: number;
  max?: number;
  step?: number;
}

export interface CategoryFilterConfig {
  categorySlug: string;
  filters: CategoryFilterDefinition[];
}