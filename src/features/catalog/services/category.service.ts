import {
  categoryTree,
} from "../data/category-tree";

import type {
  CategoryNode,
} from "../types/category.types";

// The canonical customer-facing category access boundary. `category-tree.ts`
// is the one category source this service reads — UI should call these
// functions rather than importing `categoryTree` (or any other category
// array) directly, so there is exactly one place that ever decides what
// "the categories" are.
export function getTopLevelCategories(): CategoryNode[] {
  return categoryTree;
}

export function flattenCategories(
  nodes: CategoryNode[] = categoryTree,
): CategoryNode[] {
  return nodes.flatMap(
    (node) => [
      node,
      ...flattenCategories(
        node.children,
      ),
    ],
  );
}

export function findCategory(
  slug: string,
): CategoryNode | undefined {
  return flattenCategories().find(
    (category) =>
      category.slug === slug,
  );
}

export function getCategoryPath(
  slug: string,
): CategoryNode[] {
  const category =
    findCategory(slug);

  if (!category) {
    return [];
  }

  const path: CategoryNode[] = [
    category,
  ];

  let parentSlug =
    category.parentSlug;

  while (parentSlug) {
    const parent =
      findCategory(
        parentSlug,
      );

    if (!parent) {
      break;
    }

    path.unshift(parent);
    parentSlug =
      parent.parentSlug;
  }

  return path;
}

export function getChildren(
  slug: string,
): CategoryNode[] {
  return (
    findCategory(slug)
      ?.children ?? []
  );
}