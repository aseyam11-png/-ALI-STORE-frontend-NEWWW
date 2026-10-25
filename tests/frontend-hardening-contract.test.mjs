import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

test("shipping address client matches the complete backend CRUD contract", async () => {
  const source = await read("src/features/addresses/services/address-api.service.ts");

  assert.match(source, /POST/);
  assert.match(source, /PUT/);
  assert.match(source, /DELETE/);
  assert.match(source, /PATCH/);
  assert.match(source, /recipientName/);
  assert.match(source, /phone/);
  assert.match(source, /building/);
  assert.match(source, /apartment/);
  assert.match(source, /notes/);
});

test("order status client sends only backend-supported order states", async () => {
  const service = await read("src/features/orders/services/order.service.ts");
  const adminPage = await read("src/app/(admin)/admin/orders/page.tsx");
  const buyerOrdersPage = await read("src/app/(buyer)/buyer/orders/page.tsx");
  const buyerDashboardPage = await read("src/app/(buyer)/buyer/page.tsx");
  const buyerOrderDetailPage = await read("src/app/(buyer)/buyer/orders/[id]/page.tsx");

  for (const [label, source] of [
    ["order service", service],
    ["admin orders page", adminPage],
    ["buyer orders page", buyerOrdersPage],
    ["buyer dashboard", buyerDashboardPage],
    ["buyer order detail", buyerOrderDetailPage],
  ]) {
    assert.doesNotMatch(
      source,
      /FULFILLMENT_FAILED/,
      `${label} must not reference an unsupported backend order status`,
    );
  }

  assert.match(service, /"PENDING"/);
  assert.match(service, /"PROCESSING"/);
  assert.match(service, /"SHIPPED"/);
  assert.match(service, /"DELIVERED"/);
  assert.match(service, /"CANCELLED"/);
  assert.match(
    buyerOrdersPage,
    /PENDING:\s*"بانتظار الدفع"/,
    "customer orders must localize a pending shipment/order status",
  );
});

test("guest cart uses persistent browser storage and additive authentication migration", async () => {
  const storage = await read("src/features/cart/services/guest-cart-storage.ts");
  const service = await read("src/features/cart/services/cart-api.service.ts");
  const provider = await read("src/components/providers.tsx");

  assert.match(storage, /localStorage/);
  assert.match(storage, /alistore:guest-cart:v1/);
  assert.match(service, /mergeCartLines/);
  assert.match(service, /existing\.quantity \+ toPositiveQuantity\(item\.quantity\)/);
  assert.match(provider, /readGuestCart/);
  assert.match(provider, /clearGuestCart/);
});

test("guest wishlist is persisted but cleared from guest storage after successful account hydration", async () => {
  const storage = await read("src/features/wishlist/services/guest-wishlist-storage.ts");
  const provider = await read("src/components/providers.tsx");

  assert.match(storage, /localStorage/);
  assert.match(storage, /alistore:guest-wishlist:v1/);
  assert.match(provider, /readGuestWishlist/);
  assert.match(provider, /addToWishlist/);
  assert.match(provider, /clearGuestWishlist/);
});

test("authentication loss restores guest state instead of leaking authenticated state", async () => {
  const provider = await read("src/components/providers.tsx");

  assert.match(provider, /session.status === "unauthenticated"/);
  assert.match(provider, /replaceCart\(readGuestCart\(\)\)/);
  assert.match(provider, /replaceWishlist\(readGuestWishlist\(\)\)/);
  assert.match(provider, /replaceNotifications\(\[\]\)/);
  assert.match(provider, /Never carry authenticated client state into a guest session/);
});

test("production SSR cannot silently fall back to localhost", async () => {
  const source = await read("src/lib/api/http-client.ts");

  assert.match(source, /process.env.NODE_ENV === "production"/);
  assert.match(source, /Production API is not configured/);
  assert.ok(
    source.indexOf("Production API is not configured.") >
      source.indexOf("async request<T>"),
    "production API configuration must fail at request time, not module import",
  );
  assert.match(source, /http:\/\/localhost:8080/);
});


test("frontend repository does not carry a second backend source tree", async () => {
  await assert.rejects(
    () => read("backend/pom.xml"),
    /ENOENT|no such file/i,
  );
});

test("cookie-authenticated browser mutations fail closed without a CSRF token", async () => {
  const source = (await read("src/lib/api/http-client.ts")).replace(/\r\n/g, "\n");
  const guard = source.indexOf('if (!csrfToken) {\n        throw new HttpApiError({');
  const request = source.indexOf('const response = await fetch(this.baseUrl + path');
  const csrfBootstrap = source.indexOf('await fetch(this.baseUrl + "/api/v1/auth/csrf"');

  assert.notEqual(csrfBootstrap, -1, "CSRF bootstrap endpoint must be called when the token is missing");
  assert.match(
    source,
    /csrfResponse\.headers\.get\("X-XSRF-TOKEN"\)/,
    "cross-origin SPA must use the CORS-exposed CSRF response header when it cannot read the cookie",
  );
  assert.notEqual(guard, -1, "missing CSRF token must cause a local error");
  assert.notEqual(request, -1, "ordinary API requests must still be sent when preconditions pass");
  assert.ok(guard < request, "token guard must execute before the mutation request");
  assert.match(source, /new Headers\(init\?\.headers\)/);
  assert.match(source, /requestHeaders\.set\("X-XSRF-TOKEN", csrfToken\)/);
});

test("all browser unsafe requests, including auth endpoints, require CSRF bootstrap", async () => {
  const source = await read("src/lib/api/http-client.ts");

  assert.match(source, /const shouldPrepareCsrf =\s*unsafeMethod\s*&&\s*typeof window !== "undefined"/);
  assert.doesNotMatch(source, /csrfExemptMutationPaths/);
  assert.doesNotMatch(source, /!csrfExemptMutationPaths\.has\(path\)/);
});
