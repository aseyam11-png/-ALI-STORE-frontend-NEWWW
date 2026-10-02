import Link from "next/link";
import { ArrowLeft, Flame } from "lucide-react";
import { getProducts } from "@/features/products/services/product.service";
import { normalizeB2CProduct } from "@/features/products/services/b2c-product.mapper";
import { B2CProductCard } from "./B2CProductCard";

export async function FlashDeals() {
  const response = await getProducts({
    search: "",
    page: 1,
    pageSize: 8,
    sort: "discount_desc",
    categoryId: undefined,
    subcategoryId: undefined,
    brand: undefined,
    supplierId: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    minRating: undefined,
    verifiedSupplierOnly: false,
    discountOnly: true,
    inStockOnly: false,
    featuredOnly: false,
    bestsellerOnly: false,
    newArrivalOnly: false,
  });

  const deals = response.items.map(normalizeB2CProduct);

  if (deals.length === 0) {
    return null;
  }

  return (
    <section className="bg-ink-900">
      <div className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-sm bg-discount px-3 py-1.5 text-label font-medium text-white">
              <Flame className="h-3.5 w-3.5" />
              عروض فعلية
            </div>
            <h2 className="mt-4 text-h2 font-bold tracking-tight text-white lg:text-h1">عروض اليوم</h2>
          </div>

          <Link href="/shop/deals" className="inline-flex items-center gap-2 text-body-sm font-medium text-white hover:text-primary-300">
            تصفّح جميع العروض
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {deals.map((product) => (
            <B2CProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
