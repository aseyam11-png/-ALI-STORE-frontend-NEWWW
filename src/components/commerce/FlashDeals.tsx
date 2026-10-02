import { getProducts } from "@/features/products/services/product.service";
import { mapProductSummaryToCard } from "@/features/products/services/product-card.mapper";
import { FlashDealsLazy } from "./FlashDealsLazy";
import Link from "next/link";
import { Flame, ArrowLeft } from "lucide-react";

export async function FlashDeals() {
  let deals = [];
  try {
    const response = await getProducts({
      search: "",
      categoryId: undefined,
      subcategoryId: undefined,
      brand: undefined,
      supplierId: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      verifiedSupplierOnly: false,
      discountOnly: true,
      inStockOnly: true,
      featuredOnly: false,
      bestsellerOnly: false,
      newArrivalOnly: false,
      sort: "price_desc",
      page: 1,
      pageSize: 12,
    });
    deals = response.items.filter((item) => (item.discountPercentage ?? 0) > 0).map(mapProductSummaryToCard);
  } catch {
    deals = [];
  }

  if (!deals.length) return null;

  return (
    <section className="bg-ink-900">
      <div className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-sm bg-discount px-3 py-1.5 text-label font-medium text-white">
              <Flame className="h-3.5 w-3.5" /> عروض محدودة
            </div>
            <h2 className="mt-4 text-h2 font-bold tracking-tight text-white lg:text-h1">عروض اليوم</h2>
          </div>
          <Link href="/shop/deals" className="inline-flex items-center gap-2 text-body-sm font-medium text-white hover:text-primary-300">
            تصفّح جميع العروض <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
        <div className="mt-10"><FlashDealsLazy products={deals} /></div>
      </div>
    </section>
  );
}
