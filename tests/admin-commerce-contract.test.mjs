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
  assert.match(wishlist, /getSession\(\)/);
  assert.doesNotMatch(wishlist, /useSession\(\)/);
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


test("customer product cards do not create one session request per card render", async () => {
  const files = [
    "src/components/commerce/ProductCard.tsx",
    "src/components/commerce/B2CProductCard.tsx",
    "src/components/commerce/WishlistButton.tsx",
    "src/components/commerce/recommendations/RecommendationCard.tsx",
  ];

  for (const path of files) {
    const source = await read(path);
    assert.doesNotMatch(source, /useSession\(\)/);
    assert.match(source, /getSession\(\)/);
  }
});

test("live product detail contract does not fabricate variants or shipping estimates", async () => {
  const source = await read("src/features/products/services/product.service.ts");
  assert.match(source, /variants:\s*\[\]/);
  assert.match(source, /shippingMethods:\s*\[\]/);
  assert.match(source, /priceTiers:\s*\[\]/);
  assert.doesNotMatch(source, /estimatedMinDays:\s*7/);
  assert.doesNotMatch(source, /name:\s*"Standard Shipping"/);
});

test("catalog category service is backed by the backend category API", async () => {
  const source = await read("src/features/catalog/services/category.service.ts");
  assert.match(source, /\.\/category-api\.service/);
  assert.match(source, /getCategories/);
  assert.doesNotMatch(source, /categoryTree/);
});

test("support pages do not contain seeded customer, order, shipment or chat data", async () => {
  const publicSupport = await read("src/app/(support)/support/page.tsx");
  const buyerSupport = await read("src/app/(buyer)/buyer/support/page.tsx");
  const conversation = await read("src/app/(buyer)/buyer/support/[id]/page.tsx");
  const supportContent = await read("src/components/support/SupportCenterContent.tsx");

  for (const source of [
    publicSupport,
    buyerSupport,
    conversation,
    supportContent,
  ]) {
    assert.doesNotMatch(source, /customer-001|AS-2026-10482|SHIP-1001|CHAT-1001/);
  }

  assert.match(
    supportContent,
    /المحادثة المباشرة غير متصلة حاليًا/,
  );
});

test("protected buyer order and address pages do not request APIs before authentication", async () => {
  const orders = await read("src/app/(buyer)/buyer/orders/page.tsx");
  const addresses = await read("src/app/(buyer)/buyer/addresses/page.tsx");

  assert.match(orders, /session\.status !== "authenticated"/);
  assert.match(addresses, /session\.status !== "authenticated"/);
  assert.match(orders, /\/login\?next=\/buyer\/orders/);
  assert.match(addresses, /\/login\?next=\/buyer\/addresses/);
});


test("checkout displays the authoritative cart subtotal before coupon and applies the coupon to that subtotal", async () => {
  const source = await read("src/app/(shop)/shop/checkout/page.tsx");
  assert.match(source, /const cartSubtotal\s*=\s*serverCartTotal\s*\?\?\s*subtotal/);
  assert.match(source, /amountUSD=\{cartSubtotal\}/);
  assert.match(source, /amountUSD=\{total\}/);
  assert.doesNotMatch(source, /amountUSD=\{serverCartTotal \?\? total\}/);
});

test("checkout clears the local cart after successful order creation before payment processing", async () => {
  const source = await read("src/app/(shop)/shop/checkout/page.tsx");
  const orderIndex = source.indexOf("createBackendOrder(");
  const clearIndex = source.indexOf("replaceItems([]);", orderIndex);
  const paymentIndex = source.indexOf("processBackendPayment(", orderIndex);
  assert.ok(orderIndex >= 0);
  assert.ok(clearIndex > orderIndex);
  assert.ok(paymentIndex > clearIndex);
});


test("customer notification state has no seeded data and is hydrated from backend", async () => {
  const store = await read("src/stores/notification-store.ts");
  const provider = await read("src/components/providers.tsx");
  const bell = await read("src/components/notifications/NotificationBell.tsx");

  assert.match(store, /notifications:\s*\[\]/);
  assert.doesNotMatch(
    store,
    /NOTIF-1001|customer-001|AS-2026-10482|CHAT-1001/,
  );
  assert.match(provider, /getMyNotifications/);
  assert.match(provider, /replaceNotifications/);
  assert.match(bell, /markNotificationAsRead/);
});

test("buyer notifications use the canonical notification store rather than a parallel local truth", async () => {
  const source = await read("src/app/(buyer)/buyer/notifications/page.tsx");
  assert.match(source, /useNotificationStore/);
  assert.match(source, /getMyNotifications/);
  assert.match(source, /markNotificationAsRead/);
  assert.match(source, /deleteNotification/);
  assert.doesNotMatch(source, /useState<BackendNotification\[\]>/);
});

test("admin support routes do not expose seeded conversation data", async () => {
  const list = await read("src/app/(admin)/admin/support/page.tsx");
  const detail = await read("src/app/(admin)/admin/support/[id]/page.tsx");
  assert.doesNotMatch(
    list + detail,
    /CHAT-1001|customer-001|AS-2026-10482|SHIP-1001|admin-001/,
  );
  assert.match(list, /redirect\(["\']\/admin["\']/);
  assert.match(detail, /redirect\(["\']\/admin\/support["\']/);
});

test("search query contract exposes only backend-supported sort values", async () => {
  const types = await read("src/features/search/types/search-query.types.ts");
  const query = await read("src/features/search/services/search-query.service.ts");
  const api = await read("src/features/search/services/search-api.service.ts");

  assert.doesNotMatch(types, /\| "rating"\| "reviews"\| "discount"/);
  assert.doesNotMatch(query, /"rating"|"reviews"|"discount"/);
  assert.doesNotMatch(api, /rating_desc|reviews_desc|discount_desc/);
  assert.match(api, /price_asc/);
  assert.match(api, /price_desc/);
});

test("product detail retains the complete backend image gallery", async () => {
  const source = await read("src/features/products/services/b2c-product.mapper.ts");
  assert.match(source, /Array\.isArray\(product\.images\)/);
  assert.match(source, /product\.images\.map/);
});


test("logout clears customer-only client state after the backend session is terminated", async () => {
  const session = await read("src/features/auth/session.ts");
  const provider = await read("src/components/providers.tsx");

  assert.match(session, /api\/v1\/auth\/logout/);
  assert.match(session, /alistore:logout/);
  assert.match(provider, /window\.addEventListener\("alistore:logout"/);
  assert.match(provider, /replaceCart\(\[\]\)/);
  assert.match(provider, /replaceWishlist\(\[\]\)/);
  assert.match(provider, /replaceNotifications\(\[\]\)/);
});


test("catalog filter UI resolves category slugs to numeric backend ids before querying products", async () => {
  const source = await read("src/components/commerce/products/ProductsPageContent.tsx");
  assert.match(source, /categoryIdForApi/);
  assert.match(source, /getProducts\(filters\)/);
  assert.match(source, /categoryId:\s*categoryIdForApi/);
  assert.doesNotMatch(source, /categoryId:\s*category\s*\|\|\s*undefined/);
});

test("catalog filter UI sends brand ids rather than unsupported brand names", async () => {
  const source = await read("src/components/commerce/products/ProductsPageContent.tsx");
  const service = await read("src/features/products/services/product.service.ts");
  assert.match(source, /brandIdForApi/);
  assert.match(source, /brandOptions\.map/);
  assert.match(source, /item\.id/);
  assert.match(service, /params\.set\("brand",\s*String\(brandId\)/);
  assert.doesNotMatch(service, /params\.set\(\"brandName\"/);
});

test("product service rejects non-numeric category and brand filters", async () => {
  const source = await read("src/features/products/services/product.service.ts");
  assert.match(source, /requireFilterId/);
  assert.match(source, /\$\{field\} must use the backend numeric identifier/);
  assert.match(source, /field: "categoryId" \| "brand"/);
  assert.doesNotMatch(source, /params\.set\("categorySlug"/);
  assert.doesNotMatch(source, /params\.set\("brandName"/);
});

test("related products use the backend category id contract", async () => {
  const page = await read("src/app/(shop)/shop/products/[id]/page.tsx");
  const service = await read("src/features/products/services/product.service.ts");
  assert.match(page, /productDetails\.category\?\.id/);
  assert.match(service, /numericCategoryId/);
  assert.match(service, /params\.set\("category", String\(numericCategoryId\)\)/);
  assert.doesNotMatch(service, /params\.set\("categorySlug"/);
});

test("product detail review UI uses the live review API and not the removed moderation store", async () => {
  const page = await read("src/app/(shop)/shop/products/[id]/page.tsx");
  const reviews = await read("src/components/commerce/reviews/LiveProductReviews.tsx");
  assert.match(page, /components\/commerce\/reviews\/ProductReviews/);
  assert.match(reviews, /getProductReviews/);
  assert.match(reviews, /addProductReview/);
  assert.doesNotMatch(reviews, /review-moderation-store/);
});

test("admin review routes use the consolidated dashboard", async () => {
  const page = await read("src/app/(admin)/admin/reviews/page.tsx");
  const detail = await read("src/app/(admin)/admin/reviews/[id]/page.tsx");
  const dashboard = await read("src/app/(admin)/admin/page.tsx");
  assert.match(page, /redirect\(["']\/admin["']\)/);
  assert.match(detail, /redirect\(["']\/admin\/reviews["']\)/);
  assert.match(dashboard, /مراجعة التقييمات/);
  assert.doesNotMatch(dashboard, /REV-1001|REV-1004/);
});

test("system monitoring uses the consolidated dashboard instead of a standalone fake metrics page", async () => {
  const source = await read("src/app/(system)/system/page.tsx");
  const dashboard = await read("src/app/(admin)/admin/page.tsx");
  assert.match(source, /redirect\(["']\/admin["']\)/);
  assert.match(dashboard, /المراقبة/);
  assert.doesNotMatch(dashboard, /99\.98%|99\.99%|99\.95%|99\.91%|48ms|100%/);
});

test("review legacy local store and summary are removed", async () => {
  await assert.rejects(
    () => read("src/stores/review-moderation-store.ts"),
    /ENOENT|no such file/i,
  );
  await assert.rejects(
    () => read("src/components/commerce/reviews/ReviewSummary.tsx"),
    /ENOENT|no such file/i,
  );
});


test("shipments are consolidated into order operations while preserving the old route", async () => {
  const orders = await read("src/app/(admin)/admin/orders/page.tsx");
  const shipments = await read("src/app/(admin)/admin/shipments/page.tsx");
  const dashboard = await read("src/app/(admin)/admin/page.tsx");
  assert.match(orders, /الشحنات/);
  assert.match(orders, /order\.shipments\.map/);
  assert.match(shipments, /redirect\(["']\/admin\/orders["']\)/);
  assert.match(dashboard, /الطلبات والشحن/);
});

test("support is consolidated into the admin dashboard instead of keeping an unavailable full page", async () => {
  const support = await read("src/app/(admin)/admin/support/page.tsx");
  const dashboard = await read("src/app/(admin)/admin/page.tsx");
  assert.match(support, /redirect\(["']\/admin["']\)/);
  assert.match(dashboard, /الدعم/);
  assert.match(dashboard, /لا توجد محادثات دعم محفوظة/);
});

test("customer pages use one storefront shell with shared header, navigation and footer", async () => {
  const shell = await read("src/components/commerce/CustomerShell.tsx");
  assert.match(shell, /import \{ AppShell \}/);
  assert.match(shell, /return <AppShell>\{children\}<\/AppShell>/);
});

test("admin navigation contains only consolidated live modules", async () => {
  const shell = await read("src/components/layout/AdminShell.tsx");
  assert.match(shell, /href: "\/admin\/orders"/);
  assert.match(shell, /href: "\/admin\/finance"/);
  assert.match(shell, /href: "\/warehouse"/);
  assert.doesNotMatch(shell, /href: "\/admin\/reviews"/);
  assert.doesNotMatch(shell, /href: "\/admin\/shipments"/);
  assert.doesNotMatch(shell, /href: "\/admin\/support"/);
  assert.doesNotMatch(shell, /href: "\/system"/);
});

test("shared storefront header exposes the core discovery actions without changing routes", async () => {
  const header = await read("src/components/layout/Header.tsx");
  assert.match(header, /\/shop\/visual-search/);
  assert.match(header, /\/buyer\/wishlist/);
  assert.match(header, /\/shop\/cart/);
  assert.match(header, /NotificationBell/);
  assert.match(header, /bg-primary-50/);
});

test("storefront purchase pages use the shared visual token system", async () => {
  const files = [
    "src/app/(shop)/shop/products/page.tsx",
    "src/app/(shop)/shop/categories/[slug]/page.tsx",
    "src/app/(shop)/shop/cart/page.tsx",
    "src/app/(shop)/shop/checkout/page.tsx",
    "src/app/(shop)/shop/deals/page.tsx",
    "src/app/(shop)/shop/visual-search/page.tsx",
    "src/components/commerce/product/ProductInfo.tsx",
  ];

  for (const path of files) {
    const source = await read(path);
    assert.doesNotMatch(source, /#2563EB|#0F2747|#0F172A|#F8FAFC/);
    assert.match(source, /bg-background|bg-surface|text-brand|text-brand-ink/);
  }
});

test("product detail does not show a fake zero rating", async () => {
  const source = await read("src/components/commerce/product/ProductInfo.tsx");
  assert.match(source, /product.reviewCount > 0/);
  assert.match(source, /No reviews yet/);
  const ratingOccurrences = source.match(/product\.rating\.toFixed\(1\)/g) ?? [];
  assert.equal(ratingOccurrences.length, 1);
  assert.ok(
    source.indexOf("product.reviewCount > 0") <
      source.indexOf("product.rating.toFixed(1)"),
  );
});