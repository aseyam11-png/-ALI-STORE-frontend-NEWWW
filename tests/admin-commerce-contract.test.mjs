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