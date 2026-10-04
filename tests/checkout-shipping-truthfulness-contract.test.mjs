import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("checkout does not present shipping as a confirmed backend quote before one exists", async () => {
  const source = await readFile(
    "src/app/(shop)/shop/checkout/page.tsx",
    "utf8",
  );

  assert.doesNotMatch(
    source,
    /Shipping is calculated and confirmed by the backend when the order is created/,
  );
  assert.doesNotMatch(
    source,
    /Confirmed by backend at order creation/,
  );
  assert.match(
    source,
    /تكلفة الشحن غير متاحة كقيمة مؤكدة في هذه المرحلة/,
  );
  assert.match(
    source,
    /تُحدد عند تأكيد بيانات الشحن/,
  );
});
