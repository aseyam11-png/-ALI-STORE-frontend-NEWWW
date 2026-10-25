import { getActivePromotions } from "@/features/promotions/services/promotion-api.service";
import { mapPromotionToProductCard } from "@/features/promotions/services/promotion.mapper";
import { FlashDealsLazy } from "./FlashDealsLazy";

export async function FlashDeals() {
  let promotions;
  try {
    promotions = await getActivePromotions(true);
  } catch {
    return null;
  }

  const products = promotions
    .filter((promotion) => promotion.active && promotion.flashSale)
    .map(mapPromotionToProductCard)
    .filter((product) => product.stockStatus !== "out_of_stock");

  if (products.length === 0) return null;

  return (
    <section className="bg-brand-ink px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-200">
              Flash deals
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              عروض فعلية من كتالوج ALI STORE
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
              الأسعار والخصومات والمخزون مأخوذة من الخادم، بدون بيانات ترويجية مصطنعة.
            </p>
          </div>
          <span className="text-sm font-bold text-white/70">{products.length} عروض نشطة</span>
        </div>
        <FlashDealsLazy products={products} />
      </div>
    </section>
  );
}
