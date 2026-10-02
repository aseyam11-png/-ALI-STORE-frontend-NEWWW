export interface CategoryNode {
  id: string;
  slug: string;
  name: string;
  description: string;

  parentSlug?: string;

  image?: string;

  children: CategoryNode[];

  productCount: number;
}