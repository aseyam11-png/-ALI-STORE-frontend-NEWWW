import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

test("premium UX v3 keeps the storefront hierarchy and semantic surfaces aligned", async () => {
  const header = await read("src/components/layout/Header.tsx");
  const trust = await read("src/components/commerce/TrustStrip.tsx");
  const discovery = await read("src/components/commerce/ProductDiscovery.tsx");
  const catalog = await read("src/components/commerce/products/ProductsPageContent.tsx");

  assert.match(header, /بحث بالاسم أو SKU أو القسم/);
  assert.match(header, /البحث بصورة/);
  assert.match(trust, /rounded-xl bg-primary-50/);
  assert.match(discovery, /SectionHeading/);
  assert.match(discovery, /عرض الكل/);
  assert.match(catalog, /الفلاتر المطبقة/);
  assert.match(catalog, /container-shell/);
});

test("cart and buyer orders use consistent raised surfaces and customer-facing status labels", async () => {
  const cart = await read("src/app/(shop)/shop/cart/page.tsx");
  const orders = await read("src/app/(buyer)/buyer/orders/page.tsx");

  assert.match(cart, /سلة التسوق/);
  assert.match(cart, /متابعة إلى إتمام الطلب/);
  assert.match(cart, /shadow-raised/);
  assert.doesNotMatch(cart, /Confirmed at checkout|Continue to checkout|Order summary/);

  assert.match(orders, /shipmentStatusLabel/);
  assert.match(orders, /قيد التجهيز/);
  assert.match(orders, /تم التوصيل/);
  assert.match(orders, /rounded-2xl border border-neutral-200 bg-surface shadow-raised/);
});

test("premium UX changes do not introduce fake commerce data or supplier-facing marketplace language", async () => {
  const card = await read("src/components/commerce/B2CProductCard.tsx");
  const discovery = await read("src/components/commerce/ProductDiscovery.tsx");
  const orders = await read("src/app/(buyer)/buyer/orders/page.tsx");

  assert.doesNotMatch(card, /supplierCost|supplierSku|supplierId/);
  assert.doesNotMatch(discovery, /fake|mock.*product|seller marketplace/i);
  assert.doesNotMatch(orders, /supplier.*seller|seller marketplace/i);
});
