import { B2CProductCard } from "@/components/commerce/B2CProductCard";
import { normalizeB2CProduct } from "@/features/products/services/b2c-product.mapper";
import type { ProductSummary } from "@/features/products/types/product.types";

interface RelatedProductsProps {
  products: ProductSummary[];
}

// Sourced from the real product pipeline (product.service.ts ->
// product.mapper.ts -> mocks/products.ts) via getRelatedProducts — no
// longer the old parallel mock/type system that showed empty images and
// per-product supplier trust data. Reuses B2CProductCard, the same card
// already used on /shop/products, so wishlist/cart/pricing behave
// identically here.
export function RelatedProducts({
  products,
}: RelatedProductsProps) {
  if (!products.length) {
    return null;
  }

  return (
    <section
      aria-labelledby="related-products-heading"
      className="mt-12"
    >
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-brand">
            You may also like
          </p>

          <h2
            id="related-products-heading"
            className="mt-1 text-2xl font-black tracking-tight text-foreground"
          >
            Related products
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {products.map((product) => (
          <B2CProductCard
            key={product.id}
            product={normalizeB2CProduct(
              product,
            )}
          />
        ))}
      </div>
    </section>
  );
}
