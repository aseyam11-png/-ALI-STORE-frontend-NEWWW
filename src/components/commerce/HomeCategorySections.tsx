import { getCategories, flattenCategoryTree } from "@/features/catalog/services/category-api.service";

import { HomeCategorySection } from "@/components/commerce/HomeCategorySection";

const GROUPS = [
  {
    key: "clothing",
    title: "الملابس",
    description: "ملابس مختارة من أقسام الرجال والنساء والأطفال.",
    slugs: [
      "men-clothing",
      "women-clothing",
      "boys-clothing",
      "girls-clothing",
      "baby-clothing",
    ],
    href: "/shop/categories/fashion",
  },
  {
    key: "watches",
    title: "الساعات",
    description: "ساعات متاحة فعليًا في كتالوج ALI STORE.",
    slugs: ["watches"],
    href: "/shop/categories/watches",
  },
  {
    key: "accessories",
    title: "الإكسسوارات",
    description: "إكسسوارات مختارة مثل المجوهرات والنظارات والأحزمة والحقائب.",
    slugs: [
      "jewelry",
      "sunglasses",
      "belts",
      "hats",
      "wallets",
      "accessory-bags",
      "backpacks",
      "hair-accessories",
      "men-accessories",
      "women-accessories",
      "boys-accessories",
      "girls-accessories",
      "baby-accessories",
    ],
    href: "/shop/categories/accessories",
  },
  {
    key: "shoes",
    title: "الأحذية",
    description: "أحذية يومية ورياضية ورسمية حسب المتوفر في الكتالوج.",
    slugs: [
      "men-shoes",
      "women-shoes",
      "boys-shoes",
      "girls-shoes",
      "baby-shoes",
    ],
    href: "/shop/products",
  },
] as const;

export async function HomeCategorySections() {
  let bySlug: Map<string, Awaited<ReturnType<typeof getCategories>>[number]> | null = null;

  try {
    const categories = flattenCategoryTree(await getCategories());
    bySlug = new Map(categories.map((category) => [category.slug, category]));
  } catch {
    return null;
  }

  return (
    <>
      {GROUPS.map((group) => {
        const categoryIds = group.slugs
          .map((slug) => bySlug?.get(slug)?.id)
          .filter((id): id is string => Boolean(id));

        return (
          <HomeCategorySection
            key={group.key}
            title={group.title}
            description={group.description}
            categoryIds={Array.from(new Set(categoryIds))}
            href={group.href}
          />
        );
      })}
    </>
  );
}
