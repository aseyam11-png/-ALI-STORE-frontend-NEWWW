import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

test("product quick view uses canonical B2C product data and accessible dialog semantics", async () => {
  const source = await read("src/components/commerce/ProductQuickView.tsx");

  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /aria-labelledby={titleId}/);
  assert.match(source, /event.key === "Escape"/);
  assert.match(source, /product.price/);
  assert.match(source, /product.stockStatus/);
  assert.match(source, /product.shipping.method/);
  assert.match(source, /href={.*\/shop\/products\//);
});

test("B2C product cards expose quick view without changing the existing add-to-cart handler", async () => {
  const source = await readFile("src/components/commerce/B2CProductCard.tsx", "utf8");

  assert.match(source, /ProductQuickView/);
  assert.ok(source.includes("setQuickViewOpen(true)"));
  assert.ok(source.includes("onAddToCart={() => void handleCart()}"));
  assert.ok(source.includes("disabled={!available || cartBusy}"));
});
