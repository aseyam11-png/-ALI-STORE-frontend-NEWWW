import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("checkout exposes only configured payment methods and rejects unavailable online payment", async () => {
  const source = await readFile(
    "src/app/(shop)/shop/checkout/page.tsx",
    "utf8",
  );

  assert.match(source, /useState\("cod"\)/);
  assert.match(source, /const onlinePaymentsEnabled = false/);
  assert.match(
    source,
    /paymentMethod !== "cod" && !onlinePaymentsEnabled/,
  );
  assert.match(source, /value: "card"/);
  assert.match(source, /value: "wallet"/);
  assert.match(source, /enabled: onlinePaymentsEnabled/);
  assert.match(source, /disabled={!option.enabled}/);
  assert.match(source, /غير متاح حاليًا/);
});
