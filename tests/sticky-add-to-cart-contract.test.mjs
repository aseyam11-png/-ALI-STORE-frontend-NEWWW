import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("mobile sticky add-to-cart delegates to the canonical product action", async () => {
  const sticky = await readFile(
    "src/components/commerce/product/StickyAddToCart.tsx",
    "utf8",
  );
  const actions = await readFile(
    "src/components/commerce/product/ProductActions.tsx",
    "utf8",
  );
  const info = await readFile(
    "src/components/commerce/product/ProductInfo.tsx",
    "utf8",
  );

  assert.match(sticky, /lg:hidden/);
  assert.match(sticky, /primary-product-add-to-cart/);
  assert.match(sticky, /button.click()/);
  assert.match(sticky, /disabled={!available}/);
  assert.match(actions, /id="primary-product-add-to-cart"/);
  assert.match(info, /<StickyAddToCart[\s\S]*selectedVariant=\{selectedVariant\}/);
  assert.match(info, /pb-20/);
});
