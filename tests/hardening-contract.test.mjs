import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

test("browser cookie mutations bootstrap CSRF and fail closed when token setup fails", () => {
  const client = read("src/lib/api/http-client.ts");
  assert.match(client, /const shouldPrepareCsrf/);
  assert.doesNotMatch(client, /csrfExemptMutationPaths/);
  assert.match(client, /credentials: "include"/);
  assert.match(client, /CSRF token is unavailable; the request was not sent/);
  assert.match(client, /usesBearerAuthentication/);
});

test("product API enforces SAR and unknown product states do not become active", () => {
  const products = read("src/features/products/services/product.service.ts");
  assert.match(products, /normalized !== "SAR"/);
  assert.match(
    products,
    /Unknown upstream states must never make a product purchasable/,
  );
  assert.match(
    products,
    /default:\s*\/\/ Unknown upstream states must never make a product purchasable\.?\s*return "archived";/,
  );
});

test("checkout validates contact details and keeps apartment data separate", () => {
  const checkout = read("src/app/(shop)/shop/checkout/page.tsx");
  assert.match(checkout, /phoneDigits\.length < 7/);
  assert.match(checkout, /phoneDigits\.length > 15/);
  assert.match(checkout, /emailPattern\.test/);
  assert.match(checkout, /htmlFor="apartment"/);
  assert.match(checkout, /form\.apartment\.trim\(\)/);
  assert.match(checkout, /function requireSarCurrency/);
  assert.doesNotMatch(
    checkout,
    /synchronizedItems\[0\]\?\.currency\s*\?\?\s*"USD"/,
  );
});

test("unsupported cart variants are rejected rather than downgraded to base products", () => {
  const cart = read("src/features/cart/services/cart-api.service.ts");
  assert.match(cart, /if \(item\.variantId\)\s*\{\s*throw new Error/);
  assert.match(cart, /backend contract does not support them yet/);
});

test("server-side backend transport validates HTTPS and fails closed on invalid targets", () => {
  const helper = read("src/lib/server/backend-proxy.ts");
  const route = read("src/app/api/v1/[[...path]]/route.ts");
  const config = read("next.config.ts");

  assert.match(helper, /process\.env\.BACKEND_INTERNAL_URL/);
  assert.match(helper, /Backend API is not configured/);
  assert.match(helper, /new URL\(configuredBackend\)/);
  assert.match(helper, /backend\.protocol !== "https:"/);
  assert.match(helper, /backend\.username/);
  assert.match(helper, /backend\.password/);
  assert.match(helper, /status,?\s*503/);
  assert.match(route, /runtime = "nodejs"/);
  assert.match(route, /proxyBackendRequest/);
  assert.doesNotMatch(config, /async rewrites\(/);
});
