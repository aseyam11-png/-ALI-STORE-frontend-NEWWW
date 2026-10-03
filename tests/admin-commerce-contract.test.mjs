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
