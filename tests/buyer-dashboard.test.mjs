import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile("src/app/(buyer)/buyer/page.tsx", "utf8");

assert.match(page, /getOrders\(0, 8\)/, "buyer dashboard should use the real order service");
assert.match(page, /useSession\(\)/, "buyer dashboard should derive identity from the real session");
assert.match(page, /useCartStore/, "buyer dashboard should derive cart state from the existing cart store");
assert.match(page, /useWishlistStore/, "buyer dashboard should derive wishlist state from the existing wishlist store");
assert.match(page, /ordersTotal/, "order KPI should use the server-reported total");

assert.match(page, /أحدث طلباتك/, "dashboard should expose a recent-orders section");
assert.match(page, /اختصارات الحساب/, "dashboard should expose account quick actions");
assert.match(page, /إجمالي الطلبات/, "dashboard should expose the total-orders KPI");
assert.match(page, /لا نعرض بيانات تجريبية/, "dashboard should keep false-data protection in its UX");

for (const href of [
  "/buyer/orders",
  "/buyer/profile",
  "/buyer/addresses",
  "/buyer/wishlist",
  "/buyer/support",
  "/shop/products",
]) {
  assert.ok(page.includes(href), "dashboard should preserve navigation to " + href);
}

assert.doesNotMatch(
  page,
  /MOCK_PRODUCTS|fake.*order|supplierPrice|sellerId/,
  "dashboard must not introduce mock or B2B commerce data",
);

console.log("buyer-dashboard contract checks passed");
