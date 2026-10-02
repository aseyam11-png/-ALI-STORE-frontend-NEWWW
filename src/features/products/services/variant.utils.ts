import type {
  B2CProduct,
  B2CProductVariant,
} from "../types/b2c-product.types";

export function getVariantGroups(
  variants: B2CProductVariant[],
) {
  const groups =
    new Map<
      string,
      B2CProductVariant[]
    >();

  for (const variant of variants) {
    const key =
      variant.name ||
      "Option";

    const existing =
      groups.get(key) ?? [];

    existing.push(variant);

    groups.set(
      key,
      existing,
    );
  }

  return Array.from(
    groups.entries(),
  );
}

export function getVariantById(
  product: B2CProduct,
  variantId?: string,
) {
  if (!variantId) {
    return undefined;
  }

  return product.variants.find(
    (variant) =>
      variant.id === variantId,
  );
}

export function getVariantPrice(
  product: B2CProduct,
  variant?: B2CProductVariant,
) {
  return (
    variant?.price ??
    product.price
  );
}

export function getVariantStock(
  product: B2CProduct,
  variant?: B2CProductVariant,
) {
  if (!variant) {
    return product.stock;
  }

  return Math.max(
    0,
    variant.stock ??
      (variant.available
        ? product.stock
        : 0),
  );
}

export function getVariantImage(
  product: B2CProduct,
  variant?: B2CProductVariant,
) {
  if (variant?.image) {
    return variant.image;
  }

  return product.images[0]?.url;
}

export function getVariantLabel(
  variant?: B2CProductVariant,
) {
  if (!variant) {
    return undefined;
  }

  return `${variant.name}: ${variant.value}`;
}