import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL("../" + path, import.meta.url), "utf8");
}

test("public product service is backend-backed", async () => {
  const value = await source("src/features/products/services/product.service.ts");
  assert.match(value, /\/api\/v1\/products/);
  assert.doesNotMatch(value, /@\/mocks\/products/);
});

test("catalog page preserves URL search/filter state", async () => {
  const value = await source("src/app/(shop)/shop/products/page.tsx");
  assert.match(value, /useSearchParams/);
  assert.match(value, /getProducts/);
  assert.match(value, /discountOnly/);
});

test("checkout uses server order, payment and shipping", async () => {
  const value = await source("src/app/(shop)/shop/checkout/page.tsx");
  assert.match(value, /syncLocalCart/);
  assert.match(value, /createServerOrder/);
  assert.match(value, /processServerPayment/);
  assert.match(value, /getShippingQuote/);
});

test("protected areas have a route-level auth boundary", async () => {
  const value = await source("src/middleware.ts");
  assert.match(value, /ali_store_session/);
  assert.match(value, /\/admin\/:path\*/);
  assert.match(value, /\/buyer\/:path\*/);
});

test("session is backed by the Spring Boot session endpoint", async () => {
  const value = await source("src/features/auth/session.ts");
  assert.match(value, /\/api\/v1\/auth\/session/);
  assert.match(value, /\/api\/v1\/auth\/login/);
  assert.match(value, /\/api\/v1\/auth\/logout/);
});
