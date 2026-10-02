const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("API client uses same-origin proxy and unwraps backend envelopes", () => {
  const source = read("src/lib/api/http-client.ts");
  assert.match(source, /credentials:\s*"include"/);
  assert.match(source, /NEXT_PUBLIC_API_BASE_URL \?\? "\/api\/backend"/);
  assert.match(source, /"success" in body/);
  assert.match(source, /"data" in body/);
});

test("catalog is backend sourced and URL filters are first-class", () => {
  const service = read("src/features/products/services/product.service.ts");
  const page = read("src/app/(shop)/shop/products/page.tsx");
  assert.doesNotMatch(service, /@\/mocks\/products|featuredProducts/);
  assert.match(service, /fetchProducts/);
  assert.match(page, /useSearchParams/);
  assert.match(page, /searchParams\.get\("q"\)/);
  assert.match(page, /searchParams\.get\("category"\)/);
});

test("guest cart and wishlist state are durable while authenticated state syncs remotely", () => {
  const cart = read("src/stores/cart-store.ts");
  const wishlist = read("src/stores/wishlist-store.ts");
  assert.match(cart, /persist\(/);
  assert.match(cart, /hydrateRemote/);
  assert.match(wishlist, /persist\(/);
  assert.match(wishlist, /hydrateRemote/);
  assert.match(wishlist, /toggleItem/);
});

test("checkout never marks payment successful locally", () => {
  const checkout = read("src/app/(shop)/shop/checkout/page.tsx");
  assert.match(checkout, /orderApi\.create/);
  assert.match(checkout, /orderApi\.pay/);
  assert.doesNotMatch(checkout, /paymentStatus\s*:\s*"PAID"/);
  assert.doesNotMatch(checkout, /status\s*:\s*"PAID"/);
});

test("admin navigation is guarded by authenticated admin session", () => {
  const admin = read("src/components/layout/AdminShell.tsx");
  assert.match(admin, /status !== "authenticated"/);
  assert.match(admin, /role\.includes\("ADMIN"\)/);
  assert.match(admin, /router\.replace\("\/login"\)/);
});

test("support uses one shared conversation store and persists it", () => {
  const store = read("src/stores/support-chat-store.ts");
  const publicSupport = read("src/app/(support)/support/page.tsx");
  assert.match(store, /persist\(/);
  assert.match(publicSupport, /SupportConversation/);
  assert.doesNotMatch(publicSupport, /getBotReply|initialMessages/);
});
