import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) =>
  fs.readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("checkout is server-owned", () => {
  const source = read("src/app/(shop)/shop/checkout/page.tsx");
  assert.match(source, /createBackendOrder/);
  assert.match(source, /processPayment/);
  assert.doesNotMatch(source, /useOrderStore/);
  assert.doesNotMatch(source, /paymentStatus:\s*"PAID"/);
});

test("catalog route consumes URL search state", () => {
  const source = read("src/app/(shop)/shop/products/page.tsx");
  assert.match(source, /useSearchParams/);
  assert.match(source, /searchParams\.get\("q"\)/);
  assert.match(source, /searchParams\.get\("category"\)/);
  assert.match(source, /searchParams\.get\("brand"\)/);
});

test("wishlist is persistent and cannot silently ignore string toggles", () => {
  const source = read("src/stores/wishlist-store.ts");
  assert.match(source, /persist\(/);
  assert.match(source, /toggle:\s*\(product:\s*WishlistProduct\)/);
  assert.match(source, /get\(\)\.toggleItem\(product\)/);
});

test("cart is persistent", () => {
  const source = read("src/stores/cart-store.ts");
  assert.match(source, /persist\(/);
  assert.match(source, /name:\s*"alistore-cart"/);
});

test("admin and checkout boundaries are present", () => {
  const proxy = read("proxy.ts");
  assert.match(proxy, /"\/admin"/);
  assert.match(proxy, /"\/shop\/checkout"/);
  assert.match(proxy, /ali_store_session/);
});

test("homepage product discovery does not depend on mocks", () => {
  const source = read("src/components/commerce/ProductDiscovery.tsx");
  assert.match(source, /getProducts/);
  assert.doesNotMatch(source, /@\/mocks\/products/);
});


test("legacy warehouse surface is removed", () => {
  const source = read("src/app/(admin)/admin/page.tsx");
  assert.doesNotMatch(source, /warehouse|Boxes/i);
});
