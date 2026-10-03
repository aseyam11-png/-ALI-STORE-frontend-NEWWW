import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getTopLevelCategories } from "@/features/catalog/services/category-api.service";
import { CATEGORY_LABEL_AR } from "@/features/categories/data/category-labels.ar";
import { CATEGORY_IMAGE_URL } from "./home-imagery";

const CTA_LABEL_AR: Record<string, string> = {
  fashion: "تسوق الأزياء",
  accessories: "تسوق الإكسسوارات",
  "beauty-care": "اكتشف الجمال",
};

export async function CategoryGrid() {
  let categories = [];
  try {
    categories = await getTopLevelCategories();
  } catch {
    categories = [];
  }

  if (!categories.length) return null;

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <h2 className="text-h2 font-bold tracking-tight text-foreground lg:text-h1">
          تسوّق حسب القسم
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {categories.map((category) => {
            const imageUrl = CATEGORY_IMAGE_URL[category.slug];
            const label = CATEGORY_LABEL_AR[category.slug] ?? category.name;
            const cta = CTA_LABEL_AR[category.slug] ?? label;

            return (
              <Link
                key={category.id}
                href={"/shop/categories/" + encodeURIComponent(category.slug)}
                className="group relative flex aspect-[4/5] overflow-hidden rounded-lg bg-ink-900 shadow-raised transition-transform duration-200 ease-brand hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 sm:aspect-[3/4] lg:aspect-[4/5]"
              >
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={label}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/10 to-transparent" />
                <div className="relative mt-auto flex flex-col items-start gap-2 p-6">
                  <span className="text-h3 font-bold text-white lg:text-h2">{label}</span>
                  <span className="inline-flex items-center gap-1.5 text-body-sm font-medium text-white/90">
                    {cta}
                    <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
