import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("checkout prices only a backend-configured shipping method and sends its code to order creation", async () => {
  const source = await readFile(
    "src/app/(shop)/shop/checkout/page.tsx",
    "utf8",
  );
  const api = await readFile(
    "src/features/shipping/services/shipping-api.service.ts",
    "utf8",
  );
  const backendContract = await readFile(
    "src/features/commerce/services/checkout-api.service.ts",
    "utf8",
  );

  assert.match(api, /\/api\/v1\/shipping\/methods/);
  assert.match(source, /getShippingMethods\(form\.country, serverCartCurrency\)/);
  assert.match(source, /shippingAmount = selectedShippingMethod\?\.price/);
  assert.match(source, /shippingMethodCode: selectedShippingMethodCode/);
  assert.match(source, /shippingCountry: normalizeShippingCountryCode\(form\.country\)/);
  assert.match(source, /selectedShippingMethod\.price/);
  assert.match(backendContract, /shippingMethodCode/);
  assert.match(backendContract, /shippingCountry/);
  assert.doesNotMatch(source, /تُحدد عند تأكيد بيانات الشحن/);
});
