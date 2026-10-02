import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { getCatalogCategories } from "@/features/catalog/services/catalog-api.service";
import { HERO_IMAGE_URL } from "./home-imagery";

export async function HomeHero() {
  const categories = (await getCatalogCategories()).filter((category) => !category.parentId);

  return (
    <section className="relative isolate overflow-hidden bg-ink-950 lg:min-h-[640px]">
      <div className="relative mx-auto max-w-[1600px] px-4 py-14 sm:px-6 lg:px-10 lg:py-24">
        <div className="relative z-10 lg:max-w-[46%]">
          <div className="inline-flex w-fit items-center gap-2 rounded-sm bg-white/10 px-3 py-1.5 text-label font-medium text-primary-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            مباشر من ALI STORE
          </div>
          <h1 className="mt-6 max-w-xl text-h1 font-bold tracking-tight text-white lg:text-display">
            اكتشف أسلوبك، وتسوّق ما يناسبك
          </h1>
          <p className="mt-4 max-w-md text-body-lg leading-8 text-white/70">
            اختيارات من الكتالوج المنشور في ALI STORE — من الطلب حتى التوصيل عبر مسار توريد موثوق.
          </p>
          <div className="mt-8">
            <Link
              href="/shop/products"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-md bg-brand px-8 text-body font-medium text-white transition-colors duration-200 ease-brand hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100/40"
            >
              تسوق الآن
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
          {categories.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={"/shop/categories/" + category.slug}
                  className="inline-flex h-10 items-center rounded-md border border-white/15 px-4 text-body-sm font-medium text-white/85 transition-colors duration-200 ease-brand hover:border-white/30 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100/30"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute inset-y-0 end-0 hidden w-[56%] lg:block">
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-ink-950/20 to-ink-950" />
          <img
            src={HERO_IMAGE_URL}
            alt=""
            className="h-full w-full object-cover opacity-90"
          />
        </div>
      </div>
    </section>
  );
}
