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

function getSiteUrl(): string | undefined {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\\/$/, "");
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  return vercelHost
    ? "https://" + vercelHost.replace(/^https?:\\/\\//, "").replace(/\\/$/, "")
    : undefined;
}

function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
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

  const siteUrl = getSiteUrl();
  const canonicalUrl = siteUrl
    ? siteUrl + "/shop/products/" + encodeURIComponent(productDetails.id)
    : undefined;

  return {
    title: productDetails.seo.title,
    description: productDetails.seo.description,
    keywords: productDetails.seo.keywords,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    openGraph: {
      title: productDetails.seo.title,
      description: productDetails.seo.description,
      type: "website",
      url: canonicalUrl,
      images: productDetails.images[0]?.url
        ? [{ url: productDetails.images[0].url, alt: productDetails.name }]
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

  const siteUrl = getSiteUrl();
  const canonicalUrl = siteUrl
    ? siteUrl + "/shop/products/" + encodeURIComponent(productDetails.id)
    : undefined;
  const availabilityUrl =
    product.stockStatus === "in_stock" || product.stockStatus === "low_stock"
      ? "https://schema.org/InStock"
      : product.stockStatus === "out_of_stock"
        ? "https://schema.org/OutOfStock"
        : product.stockStatus === "pre_order"
          ? "https://schema.org/PreOrder"
          : undefined;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productDetails.name,
    description: productDetails.description,
    sku: productDetails.sku,
    image: productDetails.images.map((image) => image.url),
    ...(canonicalUrl ? { url: canonicalUrl } : {}),
    ...(productDetails.brand?.name
      ? { brand: { "@type": "Brand", name: productDetails.brand.name } }
      : {}),
    ...(productDetails.reviewSummary.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: productDetails.reviewSummary.rating,
            reviewCount: productDetails.reviewSummary.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: productDetails.price.currency,
      price: productDetails.price.amount.toFixed(2),
      seller: { "@type": "Organization", name: "ALI STORE" },
      ...(canonicalUrl ? { url: canonicalUrl } : {}),
      ...(availabilityUrl ? { availability: availabilityUrl } : {}),
    },
  };

  return (
    <AppShell>
      <main className="min-h-screen bg-background">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(productJsonLd) }}
        />

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
