import Link from "next/link";
import { getProducts } from "@/features/products/services/product.service";
import { normalizeB2CProduct } from "@/features/products/services/b2c-product.mapper";
import { B2CProductCard } from "./B2CProductCard";

export async function ProductDiscovery() {
  const response = await getProducts({
    search: "",
    page: 1,
    pageSize: 8,
    sort: "newest",
    categoryId: undefined,
    subcategoryId: undefined,
    brand: undefined,
    supplierId: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    minRating: undefined,
    verifiedSupplierOnly: false,
    discountOnly: false,
    inStockOnly: false,
    featuredOnly: false,
    bestsellerOnly: false,
    newArrivalOnly: false,
  });

  const products = response.items.map(normalizeB2CProduct);

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-label font-medium uppercase tracking-wide text-muted-foreground">الكتالوج</p>
            <h2 className="mt-2 text-h2 font-bold tracking-tight text-foreground lg:text-h1">اكتشف المنتجات</h2>
          </div>
          <Link href="/shop/products" className="text-body-sm font-medium text-brand hover:text-brand-hover">عرض الكل</Link>
        </div>

        {products.length === 0 ? (
          <div className="mt-8 rounded-lg border border-neutral-200 bg-surface p-10 text-center text-body text-muted-foreground">
            لا توجد منتجات منشورة حاليًا.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:gap-6 xl:grid-cols-4">
            {products.map((product) => (
              <B2CProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
