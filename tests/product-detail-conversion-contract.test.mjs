import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

test("product actions expose a mobile sticky purchase bar without duplicating cart logic", async () => {
  const source = await read("src/components/commerce/product/ProductActions.tsx");

  assert.match(
    source,
    /fixed inset-x-0 bottom-0 z-50[^\n]*md:hidden/,
  );
  assert.match(source, /onClick=\{\(\) => void addToCart\(\)\}/);
  assert.match(source, /onClick=\{\(\) => void handleBuyNow\(\)\}/);
  assert.equal(
    (source.match(/addBackendCartItem\(/g) || []).length,
    1,
    "sticky actions must reuse the existing backend cart mutation",
  );
  assert.match(source, /messageTone === "error" \? "alert" : "status"/);
  assert.match(source, /pb-24/);
  assert.match(source, /pb-\[env\(safe-area-inset-bottom\)\]/);
});

test("product actions disable both sticky purchase controls when availability is not confirmed", async () => {
  const source = await read("src/components/commerce/product/ProductActions.tsx");

  const stickyStart = source.indexOf("fixed inset-x-0 bottom-0");
  assert.ok(stickyStart >= 0);
  const sticky = source.slice(stickyStart);

  assert.match(sticky, /disabled=\{busy \|\| !available\}/);
});
