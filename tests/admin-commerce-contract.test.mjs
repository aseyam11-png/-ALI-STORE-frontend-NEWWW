import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

test("admin pricing service uses backend pricing rule endpoints", async () => {
  const source = await read("src/features/admin/pricing/services/pricing-rule-api.service.ts");
  assert.match(source, /\/api\/v1\/admin\/pricing\/rules/);
  assert.match(source, /reprice\/product/);
});

test("admin order service uses server-side order transitions", async () => {
  const source = await read("src/features/admin/orders/services/admin-order-api.service.ts");
  assert.match(source, /\/api\/v1\/admin\/orders/);
  assert.match(source, /PATCH/);
});

test("admin payment service exposes reconciliation and COD operations", async () => {
  const source = await read("src/features/admin/payments/services/admin-payment-api.service.ts");
  assert.match(source, /reconcile/);
  assert.match(source, /cod\/collect/);
});

test("customer notifications use persistent backend endpoints", async () => {
  const source = await read("src/features/notifications/services/notification-api.service.ts");
  assert.match(source, /\/api\/v1\/notifications\/me/);
  assert.match(source, /notifications/);
  assert.match(source, /numericId/);
});

test("admin finance screen does not use the local finance store", async () => {
  const source = await read("src/app/(admin)/admin/finance/page.tsx");
  assert.doesNotMatch(source, /useStoreFinanceStore/);
  assert.match(source, /getAdminPayments/);
});

test("warehouse route does not contain fake inventory and forwards to canonical admin fulfillment", async () => {
  const source = await read("src/app/(warehouse)/warehouse/page.tsx");
  assert.match(source, /redirect\(["']\/admin\/shipments["']\)/);
  assert.doesNotMatch(source, /94,700|Primary Fulfillment Center|LOW STOCK|Recent movements/);
  assert.doesNotMatch(source, /useState|useMemo/);
});

test("recommendations are sourced from the live catalog and do not expose supplier pricing", async () => {
  const source = await read("src/features/recommendations/services/recommendations.service.ts");
  assert.match(source, /getProducts/);
  assert.match(source, /inStockOnly:\s*true/);
  assert.doesNotMatch(source, /MOCK_RECOMMENDATIONS|supplierPrice|@\/mocks\/products/);
});

test("Next image configuration supports the configured media backend", async () => {
  const source = await read("next.config.ts");
  assert.match(source, /NEXT_PUBLIC_MEDIA_BASE_URL/);
  assert.match(source, /pathname:\s*["']\/\*\*["']/);
});

test("frontend environment contract documents the optional media backend", async () => {
  const source = await read(".env.example");
  assert.match(source, /NEXT_PUBLIC_API_BASE_URL/);
  assert.match(source, /NEXT_PUBLIC_MEDIA_BASE_URL/);
});


test("direct cart replacement rejects duplicate product lines", async () => {
  const source = await read("src/features/cart/services/cart-api.service.ts");
  assert.match(source, /method:\s*"PUT"/);
  assert.match(source, /seenProductIds/);
  assert.match(source, /appears more than once/);
  assert.doesNotMatch(source, /await clearBackendCart\(\)/);
});

test("cart UI mutates an exact product + variant line", async () => {
  const source = await read("src/app/(shop)/shop/cart/page.tsx");
  assert.match(source, /handleQuantityChange\([\s\S]*item\.productId[\s\S]*item\.variantId/);
  assert.match(source, /handleRemove\([\s\S]*item\.productId[\s\S]*item\.variantId/);
});

test("shipping address frontend contract matches persisted backend fields", async () => {
  const source = await read("src/features/addresses/services/address-api.service.ts");
  assert.match(source, /recipientName/);
  assert.match(source, /phone/);
  assert.match(source, /building/);
  assert.match(source, /apartment/);
  assert.match(source, /notes/);
  assert.match(source, /area:\s*address\.state/);
});

test("shipping address backend persists storefront checkout fields and enforces one default", async () => {
  const entity = await read("backend/src/main/java/com/store/shipping/entity/ShippingAddress.java");
  const response = await read("backend/src/main/java/com/store/shipping/dto/ShippingAddressResponse.java");
  const migration = await read("backend/src/main/resources/db/migration/V16__shipping_address_contract.sql");
  assert.match(entity, /recipient_name/);
  assert.match(entity, /private String building/);
  assert.match(entity, /private String apartment/);
  assert.match(response, /recipientName/);
  assert.match(response, /phone/);
  assert.match(migration, /ux_shipping_addresses_one_default_per_user/);
  assert.match(migration, /WHERE is_default = TRUE/);
});

test("autocomplete and search suggestions use the live catalog instead of mock products", async () => {
  const autocomplete = await read("src/features/search/services/autocomplete.service.ts");
  const search = await read("src/features/search/services/search.service.ts");
  assert.match(autocomplete, /getProducts/);
  assert.match(search, /getProducts/);
  assert.doesNotMatch(autocomplete, /@\/mocks\/products/);
  assert.doesNotMatch(search, /@\/mocks\/products/);
});

test("smart autocomplete handles asynchronous backend suggestions outside render", async () => {
  const source = await read("src/components/search/SmartAutocomplete.tsx");
  assert.match(source, /useEffect\(\(\) => \{/);
  assert.match(source, /getAutocompleteSuggestions\(query, 8\)/);
  assert.match(source, /suggestionsLoading/);
  assert.match(source, /suggestionsError/);
  assert.doesNotMatch(source, /useMemo\(/);
  assert.doesNotMatch(source, /setTrackedDebouncedValue/);
});


test("live B2C mapping preserves backend availability", async () => {
  const source = await read("src/features/products/services/b2c-product.mapper.ts");
  assert.match(source, /stock:\s*product\.availableQuantity/);
  assert.doesNotMatch(source, /stock:\s*0\s*,/);
});

test("product actions format totals using product currency", async () => {
  const source = await read("src/components/commerce/product/ProductActions.tsx");
  assert.match(source, /formatCurrency\(subtotal,\s*product\.currency\)/);
  assert.doesNotMatch(source, /formatSAR\(subtotal\)/);
});

test("authenticated wishlist state is hydrated globally", async () => {
  const source = await read("src/components/providers.tsx");
  assert.match(source, /getMyWishlist/);
  assert.match(source, /replaceWishlist/);
});

test("product cards use backend cart mutations and shared wishlist behavior", async () => {
  const card = await read("src/components/commerce/ProductCard.tsx");
  const b2cCard = await read("src/components/commerce/B2CProductCard.tsx");
  const wishlist = await read("src/components/commerce/WishlistButton.tsx");
  assert.match(card, /addBackendCartItem/);
  assert.match(b2cCard, /addBackendCartItem/);
  assert.doesNotMatch(b2cCard, /@\/stores\/inventory-store/);
  assert.match(wishlist, /addToWishlist/);
  assert.match(wishlist, /removeFromWishlist/);
  assert.match(wishlist, /session\.status === "authenticated"/);
});


test("product detail does not fabricate variants or delivery tiers", async () => {
  const service = await read("src/features/products/services/product.service.ts");
  const mapper = await read("src/features/products/services/b2c-product.mapper.ts");
  assert.match(service, /variants:\s*\[\]/);
  assert.match(service, /priceTiers:\s*\[\]/);
  assert.match(service, /shippingMethods:\s*\[\]/);
  assert.match(mapper, /variants:\s*\[\]/);
  assert.doesNotMatch(service, /estimatedMinDays:\s*7/);
  assert.doesNotMatch(service, /Standard Shipping/);
});

test("backend product contract exposes the live category slug", async () => {
  const dto = await read("backend/src/main/java/com/store/product/dto/ProductResponse.java");
  const service = await read("backend/src/main/java/com/store/product/service/ProductService.java");
  assert.match(dto, /private String categorySlug;/);
  assert.match(service, /\.categorySlug\(product\.getCategory\(\)\.getSlug\(\)\)/);
});

test("storefront category navigation uses the live backend category adapter", async () => {
  const adapter = await read("src/features/catalog/services/category-api.service.ts");
  const page = await read("src/app/(shop)/shop/categories/[slug]/page.tsx");
  const hero = await read("src/components/commerce/HomeHero.tsx");
  const grid = await read("src/components/commerce/CategoryGrid.tsx");
  assert.match(adapter, /\/api\/v1\/categories/);
  assert.match(page, /getCategories/);
  assert.match(hero, /category-api\.service/);
  assert.match(grid, /category-api\.service/);
});

test("static category generation is removed so backend category changes are visible", async () => {
  await assert.rejects(
    () => read("src/app/(shop)/shop/categories/[slug]/generateStaticParams.ts"),
    /ENOENT|no such file/i,
  );
});

test("frontend price rendering never assumes a currency when the backend did not provide one", async () => {
  const price = await read("src/components/localization/LocalizedPrice.tsx");
  assert.match(price, /currency\?\s*:\s*string/);
  assert.match(price, /currency\s*\?/);
  assert.doesNotMatch(price, /currency = "SAR"/);
});

test("recommendation card uses backend cart mutation and real image data", async () => {
  const source = await read("src/components/commerce/recommendations/RecommendationCard.tsx");
  assert.match(source, /addBackendCartItem/);
  assert.match(source, /product\.image/);
  assert.doesNotMatch(source, /formatSAR/);
});
