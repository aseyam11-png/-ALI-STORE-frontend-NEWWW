import { getProducts } from "@/features/products/services/product.service";
import { mapProductSummaryToCard } from "@/features/products/services/product-card.mapper";
import { ProductCard } from "./ProductCard";
import { Tabs } from "@/components/ui/tabs";

export async function ProductDiscovery() {
  let products = [];
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
      discountOnly: false,
      inStockOnly: true,
      featuredOnly: false,
      bestsellerOnly: false,
      newArrivalOnly: false,
      sort: "relevance",
      page: 1,
      pageSize: 12,
    });
    products = response.items.map(mapProductSummaryToCard);
  } catch {
    products = [];
  }

  if (!products.length) return null;

  const bestSellers = [...products].sort(
    (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
  );

  const renderGrid = (items: typeof products) => (
    <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:gap-6 xl:grid-cols-4">
      {items.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  );

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-h2 font-bold tracking-tight text-foreground lg:text-h1">اكتشف المنتجات</h2>
          <span className="text-xs font-medium text-muted-foreground">من الكتالوج المنشور</span>
        </div>
        <Tabs
          className="mt-8"
          ariaLabel="اكتشف المنتجات"
          items={[
            { id: "featured", label: "المتاحة الآن", content: renderGrid(products) },
            { id: "best-sellers", label: "الأعلى تقييمًا", content: renderGrid(bestSellers) },
          ]}
        />
      </div>
    </section>
  );
}
