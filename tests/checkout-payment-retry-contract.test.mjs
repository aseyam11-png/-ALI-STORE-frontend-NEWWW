import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("order confirmation retries only a definitively failed non-COD payment on the same order", async () => {
  const source = await readFile(
    "src/app/(buyer)/buyer/orders/[id]/confirmation/page.tsx",
    "utf8",
  );

  assert.match(source, /processBackendPayment/);
  assert.match(source, /payment\?\.status === "FAILED"/);
  assert.match(source, /payment.method !== "CASH_ON_DELIVERY"/);
  assert.match(source, /orderId: order.id/);
  assert.match(source, /amount: Number\(order\.totalAmount\)/);
  assert.match(source, /method: payment.method/);
  assert.match(source, /إعادة محاولة الدفع/);
  assert.match(source, /setPayment\(nextPayment\)/);
});
