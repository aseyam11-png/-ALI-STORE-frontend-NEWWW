import { featuredProducts } from "@/mocks/products";
import { mapLegacyProductToCard } from "@/features/products";

import { Tabs } from "@/components/ui/tabs";
import { ProductCard } from "./ProductCard";

// One section, one dataset source, two honest views of it: "Featured" is the
// catalog's editorial order, "Best Sellers" re-sorts the same real products
// by rating/review count. No separate section, no invented metrics.
export function ProductDiscovery() {
  const featured = featuredProducts.map(mapLegacyProductToCard);

  const bestSellers = [...featured].sort(
    (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
  );

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
              label: "المميزة",
              content: renderGrid(featured),
            },
            {
              id: "best-sellers",
              label: "الأكثر مبيعًا",
              content: renderGrid(bestSellers),
            },
          ]}
        />
      </div>
    </section>
  );
}
