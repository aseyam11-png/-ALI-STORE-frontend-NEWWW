import { getCategories, flattenCategoryTree } from "@/features/catalog/services/category-api.service";

import { HomeCategorySection } from "@/components/commerce/HomeCategorySection";

const GROUPS = [
  {
    key: "clothing",
    title: "الملابس",
    description: "ملابس مختارة من أقسام الرجال والنساء والأطفال.",
    keywords: ["clothing", "fashion", "apparel", "ملابس", "أزياء"],
    href: "/shop/categories/fashion",
  },
  {
    key: "watches",
    title: "الساعات",
    description: "ساعات متاحة فعليًا في كتالوج ALI STORE.",
    keywords: ["watch", "watches", "ساعات"],
    href: "/shop/categories/watches",
  },
  {
    key: "accessories",
    title: "الإكسسوارات",
    description: "إكسسوارات مختارة مثل المجوهرات والنظارات والأحزمة والحقائب.",
    keywords: [
      "accessor",
      "jewelry",
      "sunglasses",
      "belts",
      "hats",
      "wallet",
      "bag",
      "backpack",
      "hair-accessories",
      "إكسسوارات",
      "مجوهرات",
      "نظارات",
      "أحزمة",
      "حقائب",
    ],
    href: "/shop/categories/accessories",
  },
  {
    key: "shoes",
    title: "الأحذية",
    description: "أحذية يومية ورياضية ورسمية حسب المتوفر في الكتالوج.",
    keywords: ["shoe", "shoes", "footwear", "أحذية"],
    href: "/shop/products",
  },
] as const;

function categoryMatchesGroup(
  category: Awaited<ReturnType<typeof getCategories>>[number],
  keywords: readonly string[],
) {
  const haystack = `${category.slug} ${category.name}`.toLocaleLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword));
}

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
        const categoryIds = Array.from(
          new Set(
            (bySlug ? Array.from(bySlug.values()) : [])
              .filter((category) =>
                categoryMatchesGroup(category, group.keywords),
              )
              .map((category) => category.id),
          ),
        ).slice(0, 8);

        return (
          <HomeCategorySection
            key={group.key}
            title={group.title}
            description={group.description}
            categoryIds={categoryIds}
            href={group.href}
          />
        );
      })}
    </>
  );
}
