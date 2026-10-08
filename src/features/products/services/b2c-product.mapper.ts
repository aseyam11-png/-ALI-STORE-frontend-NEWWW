import type { ProductDetails, ProductSummary } from "../types/product.types";
import type { B2CProduct } from "../types/b2c-product.types";

export function normalizeB2CProduct(
  product: ProductSummary | ProductDetails,
): B2CProduct {
  return {
    id: product.id,
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    brand: product.brand?.name ?? "",

    category:
      product.category?.name ??
      "General",

    subcategory: undefined,

    description:
      product.shortDescription ??
      "",

    price: product.price.amount,
    supplierPrice: undefined,
    originalPrice:
      product.price.originalAmount,

    currency:
      product.price.currency,

    discountPercentage:
      product.price.discountPercentage,

    stock:
      product.availableQuantity,

    stockStatus:
      product.stockStatus,

    images: "images" in product && Array.isArray(product.images)
      ? product.images.map((image) => ({
          url: image.url,
          alt: image.alt,
        }))
      : product.thumbnail?.url
        ? [
            {
              url: product.thumbnail.url,
              alt: product.thumbnail.alt,
            },
          ]
        : [],

    variants: "variants" in product && Array.isArray(product.variants)
      ? product.variants.map((variant) => ({
          id: variant.id,
          name: variant.options[0]?.name ?? variant.name,
          value: variant.options[0]?.value ?? variant.name,
          type:
            (variant.options[0]?.name?.toLowerCase().includes("color") ? "color"
              : variant.options[0]?.name?.toLowerCase().includes("size") ? "size"
              : "option") as "color" | "size" | "storage" | "material" | "option",
          available: variant.active && variant.availableQuantity > 0,
          price: variant.price?.amount,
          originalPrice: variant.price?.originalAmount,
          stock: variant.availableQuantity,
          image: variant.image?.url,
          attributes: Object.fromEntries(
            variant.options.map((option) => [option.name, option.value]),
          ),
        }))
      : [],

    rating:
      product.rating,

    reviewCount:
      product.reviewCount,

    shipping: {
      free: false,
      method:
        product.shipping ||
        "يُحدد الشحن عند إتمام الطلب",
      estimatedDelivery:
        "يُحدد موعد التوصيل عند إتمام الطلب",
    },

    returnPolicy: undefined,

    featured: false,
    flashSale: false,
    tags:
      product.tags,
  };
}
