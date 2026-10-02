export type CategoryFilterType =
  | "SELECT"
  | "CHECKBOX"
  | "RANGE";

export interface CategoryFilterOption {
  value: string;
  label: string;
}

export interface CategoryFilter {
  id: string;
  label: string;
  type: CategoryFilterType;
  options?: CategoryFilterOption[];
  min?: number;
  max?: number;
  unit?: string;
}

export interface CategoryNode {
  id: string;
  slug: string;
  name: string;
  description: string;

  icon?: string;

  parentSlug?: string;

  children: CategoryNode[];

  filters: CategoryFilter[];
}