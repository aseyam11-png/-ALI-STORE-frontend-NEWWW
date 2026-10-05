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

  assert.doesNotMatch(service, /FULFILLMENT_FAILED/);
  assert.doesNotMatch(adminPage, /FULFILLMENT_FAILED/);
  assert.match(service, /"PENDING"/);
  assert.match(service, /"PROCESSING"/);
  assert.match(service, /"SHIPPED"/);
  assert.match(service, /"DELIVERED"/);
  assert.match(service, /"CANCELLED"/);
});

test("guest cart uses persistent browser storage and additive authentication migration", async () => {
  const storage = await read("src/features/cart/services/guest-cart-storage.ts");
  const service = await read("src/features/cart/services/cart-api.service.ts");
  const provider = await read("src/components/providers.tsx");

  assert.match(storage, /localStorage/);
  assert.match(storage, /alistore:guest-cart:v1/);
  assert.match(service, /mergeCartLines/);
  assert.match(service, /existing.quantity + toPositiveQuantity(item.quantity)/);
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
  assert.match(provider, /replaceCart(readGuestCart())/);
  assert.match(provider, /replaceWishlist(readGuestWishlist())/);
  assert.match(provider, /replaceNotifications([])/);
  assert.match(provider, /Never carry authenticated client state into a guest session/);
});

test("production SSR cannot silently fall back to localhost", async () => {
  const source = await read("src/lib/api/http-client.ts");

  assert.match(source, /process.env.NODE_ENV === "production"/);
  assert.match(source, /Missing BACKEND_INTERNAL_URL or NEXT_PUBLIC_API_BASE_URL/);
  assert.match(source, /http://localhost:8080/);
});


test("frontend repository does not carry a second backend source tree", async () => {
  await assert.rejects(
    () => read("backend/pom.xml"),
    /ENOENT|no such file/i,
  );
});
