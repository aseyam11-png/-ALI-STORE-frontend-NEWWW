import { getProducts } from "@/features/products/services/product.service";
import { mapProductSummaryToCard } from "@/features/products/services/product-card.mapper";

import { Tabs } from "@/components/ui/tabs";
import { ProductCard } from "./ProductCard";

export async function ProductDiscovery() {
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

  const featured = response.items.map(mapProductSummaryToCard);
  const bestSellers = [...featured];

  if (featured.length === 0) {
    return null;
  }

  const renderGrid = (products: typeof featured) => (
    <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:gap-6 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <h2 className="text-h2 font-bold tracking-tight text-foreground lg:text-h1">
          اكتشف المنتجات
        </h2>

        <Tabs
          className="mt-8"
          ariaLabel="اكتشف المنتجات"
          items={[
            {
              id: "featured",
              label: "المتاحة الآن",
              content: renderGrid(featured),
            },
            {
              id: "best-sellers",
              label: "جميع المنتجات",
              content: renderGrid(bestSellers),
            },
          ]}
        />
      </div>
    </section>
  );
}
