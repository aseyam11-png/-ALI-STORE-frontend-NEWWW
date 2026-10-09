import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";

import { ProductBreadcrumb } from "@/components/commerce/product/ProductBreadcrumb";
import { ProductDescription } from "@/components/commerce/product/ProductDescription";
import { ProductInfo } from "@/components/commerce/product/ProductInfo";
import { ProductReviews } from "@/components/commerce/reviews/ProductReviews";
import { ProductSpecifications } from "@/components/commerce/product/ProductSpecifications";
import { ProductTrust } from "@/components/commerce/product/ProductTrust";
import { ProductShippingOptions } from "@/components/commerce/product/ProductShippingOptions";
import { RelatedProducts } from "@/components/commerce/product/RelatedProducts";
import { RecentlyViewedSection } from "@/components/commerce/recently-viewed/RecentlyViewedSection";

import {
  getProductById,
  getRelatedProducts,
} from "@/features/products/services/product.service";
import { normalizeB2CProduct } from "@/features/products/services/b2c-product.mapper";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const productDetails = await getProductById(id);

  if (!productDetails) {
    return {
      title: "Product not found | AliStore",
    };
  }

  return {
    title: productDetails.seo.title,
    description: productDetails.seo.description,
    keywords: productDetails.seo.keywords,
    openGraph: {
      title: productDetails.seo.title,
      description: productDetails.seo.description,
      type: "website",
      images: productDetails.images[0]?.url
        ? [{ url: productDetails.images[0].url }]
        : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const productDetails = await getProductById(id);

  if (!productDetails) {
    notFound();
  }

  const category =
    productDetails.category?.name ?? "General";

  const product = normalizeB2CProduct(productDetails);

  const primaryShippingMethod =
    productDetails.shippingMethods[0];

  const estimatedDelivery =
    primaryShippingMethod
      ? `${primaryShippingMethod.estimatedMinDays}-${primaryShippingMethod.estimatedMaxDays} business days`
      : undefined;

  const relatedProducts =
    await getRelatedProducts(
      productDetails.id,
      productDetails.category?.id,
      4,
    );

  return (
    <AppShell>
      <main className="min-h-screen bg-background">

        <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">

          <ProductBreadcrumb
            category={category}
            productName={productDetails.name}
          />

          <section className="mt-4 rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm sm:p-8">
            <ProductInfo
              product={product}
            />
          </section>

          <div className="mt-8">
            <ProductTrust
              estimatedDelivery={estimatedDelivery}
              returnPolicy={product.returnPolicy}
            />
          </div>

          <ProductShippingOptions methods={productDetails.shippingMethods} />

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">

            <ProductDescription
              description={
                productDetails.description
              }
            />

            <ProductSpecifications
              specifications={productDetails.specifications.map(
                (specification) => ({
                  name: specification.label,
                  value: specification.value,
                }),
              )}
            />

          </div>

          <section className="mt-8">
            <ProductReviews
              productId={productDetails.id}
              summary={productDetails.reviewSummary}
            />
          </section>

          <RecentlyViewedSection
            product={{
              id: product.id,
              name: product.name,
              imageUrl: product.images[0]?.url,
              price: product.price,
              currency: product.currency,
            }}
          />

          <RelatedProducts
            products={relatedProducts}
          />

        </div>

      </main>
    </AppShell>
  );
}
