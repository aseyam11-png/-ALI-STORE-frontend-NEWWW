import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

test("recently viewed stays client-side, bounded and separate from commerce state", async () => {
  const service = await read("src/features/recently-viewed/services/recently-viewed.service.ts");
  const component = await read("src/components/commerce/recently-viewed/RecentlyViewedSection.tsx");
  const detail = await read("src/app/(shop)/shop/products/[id]/page.tsx");

  assert.match(service, /alistore\.recently-viewed/);
  assert.match(service, /MAX_ITEMS = 12/);
  assert.match(service, /localStorage/);
  assert.match(service, /recordRecentlyViewed/);
  assert.match(service, /removeRecentlyViewed/);
  assert.match(service, /clearRecentlyViewed/);

  assert.match(component, /useSyncExternalStore/);
  assert.match(component, /recordRecentlyViewed/);
  assert.match(component, /آخر سعر معروف/);
  assert.doesNotMatch(component, /addBackendCartItem|createBackendOrder|processBackendPayment/);

  assert.match(detail, /RecentlyViewedSection/);
});
