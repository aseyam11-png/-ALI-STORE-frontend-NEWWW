import { apiClient } from "@/lib/api/http-client";
import type { CategoryNode } from "../types/category.types";

type BackendCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  active?: boolean | null;
  parentId?: number | null;
  parentName?: string | null;
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

function unwrap<T>(response: T | ApiEnvelope<T>): T {
  if (
    typeof response === "object" &&
    response !== null &&
    "data" in response
  ) {
    const envelope = response as ApiEnvelope<T>;
    if (envelope.success === false) {
      throw new Error(envelope.message || "Category request failed");
    }
    return envelope.data;
  }
  return response as T;
}

function buildTree(categories: BackendCategory[]): CategoryNode[] {
  const nodes = new Map<number, CategoryNode>();

  for (const category of categories) {
    if (category.active === false) continue;

    nodes.set(category.id, {
      id: String(category.id),
      slug: category.slug,
      name: category.name,
      description: category.description ?? "",
      image: category.imageUrl ?? undefined,
      children: [],
    });
  }

  const roots: CategoryNode[] = [];

  for (const category of categories) {
    const node = nodes.get(category.id);
    if (!node) continue;

    if (
      category.parentId != null &&
      nodes.has(category.parentId)
    ) {
      const parent = nodes.get(category.parentId)!;
      node.parentSlug = parent.slug;
      parent.children.push(node);
    } else if (category.parentId == null) {
      roots.push(node);
    }
  }

  const sortNodes = (items: CategoryNode[]) => {
    items.sort((a, b) => a.name.localeCompare(b.name));
    for (const item of items) sortNodes(item.children);
  };

  sortNodes(roots);
  return roots;
}

export async function getCategories(): Promise<CategoryNode[]> {
  const response = await apiClient.request<
    BackendCategory[] | ApiEnvelope<BackendCategory[]>
  >("/api/v1/categories");

  return buildTree(unwrap(response));
}

export async function getCategoryBySlug(
  slug: string,
): Promise<CategoryNode | undefined> {
  const normalized = slug.trim();
  if (!normalized) return undefined;

  const categories = await getCategories();
  return flattenCategoryTree(categories).find(
    (category) => category.slug === normalized,
  );
}

export async function getTopLevelCategories(): Promise<CategoryNode[]> {
  return getCategories();
}

export function flattenCategoryTree(
  categories: CategoryNode[],
): CategoryNode[] {
  return categories.flatMap((category) => [
    category,
    ...flattenCategoryTree(category.children),
  ]);
}

export function getCategoryPathFromTree(
  categories: CategoryNode[],
  slug: string,
): CategoryNode[] {
  const target = flattenCategoryTree(categories).find(
    (category) => category.slug === slug,
  );

  if (!target) return [];

  const bySlug = new Map(
    flattenCategoryTree(categories).map((category) => [
      category.slug,
      category,
    ]),
  );

  const path: CategoryNode[] = [target];
  let parentSlug = target.parentSlug;

  while (parentSlug) {
    const parent = bySlug.get(parentSlug);
    if (!parent) break;
    path.unshift(parent);
    parentSlug = parent.parentSlug;
  }

  return path;
}
