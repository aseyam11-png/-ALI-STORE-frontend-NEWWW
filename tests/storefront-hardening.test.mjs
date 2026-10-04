import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function assertNoRawCustomerColors(file) {
  const source = read(file);
  assert.doesNotMatch(
    source,
    /#[0-9A-Fa-f]{6}\b/,
    "Raw hex customer color found in " + file,
  );
  assert.doesNotMatch(
    source,
    /(?:bg|text|border)-(?:slate|blue|red|emerald|amber)-/,
    "Legacy palette utility found in " + file,
  );
}

test("storefront hardening: homepage trust appears before discovery", () => {
  const source = read("src/app/page.tsx");
  assert.ok(source.indexOf("<HomeHero />") < source.indexOf("<TrustStrip />"));
  assert.ok(source.indexOf("<TrustStrip />") < source.indexOf("<CategoryGrid />"));
  assert.ok(source.indexOf("<CategoryGrid />") < source.indexOf("<ProductDiscovery />"));
});

test("storefront hardening: single discovery list is not wrapped in fake tabs", () => {
  const source = read("src/components/commerce/ProductDiscovery.tsx");
  assert.doesNotMatch(source, /<Tabs\b/);
  assert.match(source, /<div className="mt-8">\s*\{renderGrid\(\)\}/);
});

test("storefront hardening: product variants flow into pricing, actions, and sticky CTA", () => {
  const info = read("src/components/commerce/product/ProductInfo.tsx");
  const actions = read("src/components/commerce/product/ProductActions.tsx");
  const sticky = read("src/components/commerce/product/StickyAddToCart.tsx");

  assert.match(info, /selectedVariant/);
  assert.match(info, /selectedVariantId=\{selectedVariant\?\.id\}/);
  assert.match(info, /onChange=\{setSelectedVariant\}/);
  assert.match(info, /selectedVariant=\{selectedVariant\}/);
  assert.match(actions, /selectedVariant\?: B2CProductVariant/);
  assert.match(actions, /selectedVariant\?\.id/);
  assert.match(actions, /does not persist variants yet/);
  assert.match(sticky, /getVariantPrice/);
  assert.match(sticky, /getVariantStock/);
  assert.match(sticky, /selectedVariant\?: B2CProductVariant/);
});

test("storefront hardening: authenticated variant selection cannot be silently flattened into a product-only cart line", () => {
  const actions = read("src/components/commerce/product/ProductActions.tsx");
  const cartApi = read("src/features/cart/services/cart-api.service.ts");

  assert.match(actions, /session\.status === "authenticated"/);
  assert.match(actions, /if \(selectedVariant\)/);
  assert.match(actions, /current cart API does not persist variants yet/);
  assert.match(cartApi, /variantId: undefined/);
});

test("storefront hardening: checkout enforces its visible required email field", () => {
  const checkout = read("src/app/(shop)/shop/checkout/page.tsx");
  assert.match(checkout, /"fullName",\s*"email",\s*"phone"/);
  assert.match(checkout, /Email \*/);
});

test("storefront hardening: cart does not call a subtotal-only value Total when shipping is still unknown", () => {
  const cart = read("src/app/(shop)/shop/cart/page.tsx");
  const subtotalIndex = cart.lastIndexOf("<span className=\"font-bold text-neutral-500\">");
  assert.notEqual(subtotalIndex, -1);
  assert.match(cart.slice(subtotalIndex, subtotalIndex + 180), />\s*Subtotal\s*</);
  assert.match(cart, /shipping.*confirmed at checkout/i);
});

test("storefront hardening: customer-facing palette uses ALI STORE semantic tokens", () => {
  for (const file of [
    "src/app/(buyer)/buyer/orders/[id]/page.tsx",
    "src/app/(buyer)/buyer/orders/[id]/confirmation/page.tsx",
    "src/app/(buyer)/buyer/wishlist/page.tsx",
    "src/components/checkout/CheckoutAddressSelector.tsx",
    "src/components/checkout/CouponInput.tsx",
    "src/components/commerce/WishlistButton.tsx",
    "src/components/commerce/cart/FreeShippingProgress.tsx",
    "src/components/notifications/NotificationBell.tsx",
    "src/components/search/VisualSearch.tsx",
  ]) {
    assertNoRawCustomerColors(file);
  }
});

test("storefront hardening: quick view traps focus and restores the previous trigger", () => {
  const source = read("src/components/commerce/ProductQuickView.tsx");
  assert.match(source, /useRef/);
  assert.match(source, /triggerRef/);
  assert.match(source, /closeButtonRef/);
  assert.match(source, /event\.key !== "Tab"/);
  assert.match(source, /focusable/);
  assert.match(source, /triggerRef\.current instanceof HTMLElement/);
});

test("storefront hardening: page transitions honor reduced-motion preferences", () => {
  const source = read("src/components/motion/PageTransition.tsx");
  assert.match(source, /useReducedMotion/);
  assert.match(source, /shouldReduceMotion/);
  assert.match(source, /duration: 0/);
});

test("storefront hardening: customer pages reuse one canonical shell", () => {
  const source = read("src/components/commerce/CustomerShell.tsx");
  assert.match(source, /import \{ AppShell \}/);
  assert.match(source, /return <AppShell>\{children\}<\/AppShell>/);
  assert.doesNotMatch(source, /<TopBar\s*\/>/);
  assert.doesNotMatch(source, /<Header\s*\/>/);
});

test("storefront hardening: flash deals stay empty until promotion data is real", () => {
  const source = read("src/components/commerce/FlashDeals.tsx");
  assert.match(source, /does not expose promotion\/discount fields/);
  assert.match(source, /return null/);
});
