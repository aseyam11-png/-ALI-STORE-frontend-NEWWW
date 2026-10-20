// Homepage editorial imagery is presentation-only. Product truth, category
// truth, prices, inventory, shipping and discounts continue to come from
// the live catalog/API services.

const IMAGE_PARAMS = "auto=format&fit=crop&w=1800&q=82";

export interface HomeHeroSlide {
  id: string;
  title: string;
  description: string;
  href: string;
  image: string;
  alt: string;
}

export const HERO_SLIDES: HomeHeroSlide[] = [
  {
    id: "watches",
    title: "ساعات فاخرة",
    description: "اختيارات أنيقة بإطلالة هادئة تركز على التفاصيل.",
    href: "/shop/products",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?" +
      IMAGE_PARAMS,
    alt: "ساعة يد فاخرة على خلفية أنيقة",
  },
  {
    id: "clothing",
    title: "ملابس مختارة",
    description: "ستايلات عصرية للوك اليومي والمناسبات.",
    href: "/shop/products",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?" +
      IMAGE_PARAMS,
    alt: "ملابس عصرية في مشهد تحريري",
  },
  {
    id: "shoes",
    title: "أحذية مميزة",
    description: "تصاميم تجمع بين الحركة والإطلالة اليومية.",
    href: "/shop/products",
    image:
      "https://assets.lummi.ai/assets/QmVQpu4r4f57Uuiwtx11CoaZtp4BThSE1SJ4jS23XU8uYq?auto=format&w=1800&q=82",
    alt: "حذاء بلون بيج بتصميم بسيط دون شعار ظاهر",
  },
  {
    id: "accessories",
    title: "إكسسوارات تكمل الإطلالة",
    description: "تفاصيل صغيرة تصنع فرقًا كبيرًا في المظهر.",
    href: "/shop/products",
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?" +
      IMAGE_PARAMS,
    alt: "إكسسوارات ومجوهرات بتكوين تحريري",
  },
];

export function getCategoryNavImage(slug: string, label: string): string | undefined {
  const source = (slug + " " + label).toLocaleLowerCase("ar");

  if (/(watch|watches|ساعة|ساعات)/.test(source)) return HERO_SLIDES[0].image;
  if (/(shoe|shoes|footwear|حذاء|أحذية)/.test(source)) return HERO_SLIDES[2].image;
  if (/(fashion|clothing|apparel|ملابس|أزياء|موضة)/.test(source)) return HERO_SLIDES[1].image;
  if (/(accessor|إكسسوارات|مجوهرات|حقائب)/.test(source)) return HERO_SLIDES[3].image;

  return undefined;
}

export const CATEGORY_IMAGE_URL: Record<string, string> = {
  fashion: HERO_SLIDES[1].image,
  accessories: HERO_SLIDES[3].image,
  "beauty-care":
    "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?" +
    IMAGE_PARAMS,
};
