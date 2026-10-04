import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("checkout does not create an order for an unavailable online payment method", async () => {
  const source = await readFile(
    "src/app/(shop)/shop/checkout/page.tsx",
    "utf8",
  );

  assert.match(source, /useState\("cod"\)/);
  assert.match(
    source,
    /NEXT_PUBLIC_ONLINE_PAYMENTS_ENABLED === "true"/,
  );
  assert.match(
    source,
    /paymentMethod !== "cod" && !onlinePaymentsEnabled/,
  );

  const guardIndex = source.indexOf(
    'paymentMethod !== "cod" && !onlinePaymentsEnabled',
  );
  const createOrderIndex = source.indexOf(
    "const order = await createBackendOrder",
  );

  assert.ok(guardIndex >= 0);
  assert.ok(createOrderIndex > guardIndex);
});

test("checkout disables online methods in the customer payment selector", async () => {
  const source = await readFile(
    "src/app/(shop)/shop/checkout/page.tsx",
    "utf8",
  );

  assert.match(source, /value: "card"/);
  assert.match(source, /value: "wallet"/);
  assert.match(source, /available: onlinePaymentsEnabled/);
  assert.match(source, /disabled={!option.available}/);
  assert.match(source, /غير متاح حاليًا/);
});
