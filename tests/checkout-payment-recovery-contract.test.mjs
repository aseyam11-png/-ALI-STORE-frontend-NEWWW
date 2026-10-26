import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

test("checkout keeps a created order recoverable when payment is not confirmed", async () => {
  const source = await read("src/app/(shop)/shop/checkout/page.tsx");

  const orderIndex = source.indexOf("const order = await createBackendOrder");
  const paymentIndex = source.indexOf("const payment = await processBackendPayment");
  const clearIndex = source.indexOf("clearCart();");

  assert.ok(orderIndex >= 0);
  assert.ok(paymentIndex > orderIndex);
  assert.ok(clearIndex > paymentIndex);

  assert.match(source, /let createdOrderId = ""/);
  assert.match(source, /createdOrderId = String\(order\.id\)/);
  assert.match(source, /setPaymentRecoveryOrderId\(createdOrderId\)/);
  assert.match(source, /Do not place a second order/);
  assert.match(source, /payment\.status === "COMPLETED"/);
  assert.match(source, /payment\.method === "CASH_ON_DELIVERY"/);
  assert.match(source, /payment\.status === "PENDING"/);
});

test("order confirmation does not present non-confirmed payments as success", async () => {
  const source = await read("src/app/(buyer)/buyer/orders/[id]/confirmation/page.tsx");

  assert.match(source, /paymentNeedsAttention/);
  assert.match(source, /AlertCircle/);
  assert.match(source, /REQUIRES_RECONCILIATION/);
  assert.match(source, /authoritative checkout record/);
});
