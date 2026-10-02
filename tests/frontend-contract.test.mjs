import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function read(path) {
  return readFile(new URL("../" + path, import.meta.url), "utf8");
}

test("critical customer catalog paths use the backend API", async () => {
  const productService = await read("src/features/products/services/product.service.ts");
  const listing = await read("src/app/(shop)/shop/products/page.tsx");
  const discovery = await read("src/components/commerce/ProductDiscovery.tsx");
  const deals = await read("src/components/commerce/FlashDeals.tsx");

  assert.match(productService, //api/v1/products/);
  assert.match(listing, /useSearchParams/);
  assert.doesNotMatch(discovery, /from ["']@/mocks/products["']/);
  assert.doesNotMatch(deals, /from ["']@/mocks/products["']/);
});

test("customer state is persistent and hydrated centrally", async () => {
  const cart = await read("src/stores/cart-store.ts");
  const wishlist = await read("src/stores/wishlist-store.ts");
  const address = await read("src/stores/address-store.ts");
  const providers = await read("src/components/providers.tsx");

  assert.match(cart, /persist(/);
  assert.match(wishlist, /persist(/);
  assert.match(address, /persist(/);
  assert.match(providers, /persist.rehydrate/);
});

test("checkout uses server order, payment and shipping services", async () => {
  const checkout = await read("src/app/(shop)/shop/checkout/page.tsx");

  assert.match(checkout, /createBackendOrder/);
  assert.match(checkout, /processBackendPayment/);
  assert.match(checkout, /getShippingQuote/);
  assert.doesNotMatch(checkout, /useOrderStore/);
});

test("route authorization exists for buyer and admin areas", async () => {
  const gate = await read("src/components/auth/AuthGate.tsx");
  const buyer = await read("src/app/(buyer)/layout.tsx");
  const admin = await read("src/app/(admin)/layout.tsx");

  assert.match(gate, //login?next=/);
  assert.match(admin, /requiredRole="ROLE_ADMIN"/);
  assert.match(buyer, /<AuthGate>/);
});

test("legacy warehouse/support public surfaces are no longer separate implementations", async () => {
  const warehouse = await read("src/app/(warehouse)/warehouse/page.tsx");
  const support = await read("src/app/(support)/support/page.tsx");

  assert.match(warehouse, /redirect\(["']\/admin\/products["']\)/);
  assert.match(support, /redirect\(["']\/buyer\/support["']\)/);
});
