import {
  flattenCategoryTree,
  getCategories,
  getCategoryBySlug,
  getCategoryPathFromTree,
  getTopLevelCategories,
} from "./category-api.service";

import type { CategoryNode } from "../types/category.types";

export {
  getCategories,
  getCategoryBySlug,
  getTopLevelCategories,
  flattenCategoryTree,
  getCategoryPathFromTree,
};

export async function flattenCategories(
  nodes?: CategoryNode[],
): Promise<CategoryNode[]> {
  const categories =
    nodes ?? (await getCategories());

  return flattenCategoryTree(categories);
}

export async function findCategory(
  slug: string,
): Promise<CategoryNode | undefined> {
  return getCategoryBySlug(slug);
}

export async function getCategoryPath(
  slug: string,
): Promise<CategoryNode[]> {
  const categories = await getCategories();
  return getCategoryPathFromTree(
    categories,
    slug,
  );
}

export async function getChildren(
  slug: string,
): Promise<CategoryNode[]> {
  const category = await getCategoryBySlug(slug);
  return category?.children ?? [];
}
