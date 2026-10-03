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


test("cart replacement is atomic and uses the backend PUT contract", async () => {
  const source = await read("src/features/commerce/services/checkout-api.service.ts");
  assert.match(source, /requestData<BackendCart>\("\/api\/v1\/cart",\s*\{\s*method:\s*"PUT"/s);
  assert.doesNotMatch(source, /clearBackendCart\(\)/);
  assert.doesNotMatch(source, /addBackendCartItem\(/);
  assert.match(source, /seenProductIds/);
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
