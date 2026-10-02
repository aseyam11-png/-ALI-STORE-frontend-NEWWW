import {
  flattenCategories,
} from "@/features/catalog/services/category.service";

export default function generateStaticParams() {
  return flattenCategories().map(
    (category) => ({
      slug: category.slug,
    }),
  );
}