import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^()|[\]\\]/g, "\\$&");
}

function walk(relativeDir) {
  const absolute = path.join(root, relativeDir);
  const result = [];

  function visit(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) visit(full);
      else result.push(path.relative(root, full));
    }
  }

  visit(absolute);
  return result;
}

test("release gate: all shared storefront/admin UX primitives exist", () => {
  const required = [
    "src/components/admin/AdminMetricCard.tsx",
    "src/components/admin/AdminPageHeader.tsx",
    "src/components/admin/AdminStatusPill.tsx",
    "src/components/layout/AdminShell.tsx",
    "src/components/layout/AppShell.tsx",
    "src/components/layout/Header.tsx",
    "src/components/navigation/GlobalNavigation.tsx",
    "src/components/navigation/MobileStoreBar.tsx",
  ];

  for (const file of required) {
    assert.equal(exists(file), true, "Missing required UX primitive: " + file);
  }
});

test("release gate: storefront shell keeps the single navigation hierarchy", () => {
  const appShell = read("src/components/layout/AppShell.tsx");
  const header = read("src/components/layout/Header.tsx");
  const navigation = read("src/components/navigation/GlobalNavigation.tsx");
  const mobile = read("src/components/navigation/MobileStoreBar.tsx");

  assert.match(appShell, /<TopBar\s*\/>/);
  assert.match(appShell, /<Header\s*\/>/);
  assert.match(appShell, /<GlobalNavigation\s*\/>/);
  assert.match(appShell, /<Footer\s*\/>/);
  assert.match(appShell, /<MobileStoreBar\s*\/>/);

  assert.match(header, /SmartAutocomplete/);
  assert.match(header, /\/shop\/visual-search/);
  assert.match(header, /useCartStore/);
  assert.match(header, /useWishlistStore/);

  assert.match(navigation, /getTopLevelCategories/);
  assert.match(navigation, /usePathname/);

  const requiredMobileRoutes = [
    "/",
    "/shop/products",
    "/shop/visual-search",
    "/buyer/wishlist",
    "/shop/cart",
  ];
  for (const route of requiredMobileRoutes) {
    assert.match(mobile, new RegExp(escapeRegExp(route)));
  }
});

test("release gate: cart and wishlist actions remain backend/state driven", () => {
  const productCard = read("src/components/commerce/ProductCard.tsx");
  const b2cCard = read("src/components/commerce/B2CProductCard.tsx");
  const wishlist = read("src/components/commerce/WishlistButton.tsx");

  assert.match(productCard, /addBackendCartItem/);
  assert.match(b2cCard, /addBackendCartItem/);
  assert.match(wishlist, /addToWishlist/);
  assert.match(wishlist, /removeFromWishlist/);

  assert.doesNotMatch(b2cCard, /useStoreInventoryStore|useStore\(\s*inventory/);
  assert.doesNotMatch(productCard, /MOCK_PRODUCTS|@\/mocks\/products/);
});

test("release gate: admin navigation contains only live operational modules", () => {
  const shell = read("src/components/layout/AdminShell.tsx");
  const requiredRoutes = [
    "/admin",
    "/admin/products",
    "/admin/orders",
    "/admin/pricing",
    "/admin/finance",
    "/warehouse",
  ];

  for (const route of requiredRoutes) {
    assert.match(shell, new RegExp(escapeRegExp(route)));
  }

  for (const legacyRoute of [
    "/admin/reviews",
    "/admin/shipments",
    "/admin/support",
    "/system",
  ]) {
    assert.doesNotMatch(shell, new RegExp("href:\\s*[\"']" + escapeRegExp(legacyRoute)));
  }
});

test("release gate: admin navigation is keyboard and mobile accessible", () => {
  const shell = read("src/components/layout/AdminShell.tsx");

  assert.match(shell, /aria-expanded=\{mobileNavOpen\}/);
  assert.match(shell, /aria-controls="admin-mobile-nav"/);
  assert.match(shell, /aria-modal="true"/);
  assert.match(shell, /event\.key === "Escape"/);
  assert.match(shell, /event\.key !== "Tab"/);
  assert.match(shell, /focusable/);
  assert.match(shell, /trigger\?\.focus\(\)/);
});

test("release gate: semantic UI tokens are used in consolidated admin workspaces", () => {
  const files = [
    "src/app/(admin)/admin/page.tsx",
    "src/app/(admin)/admin/products/page.tsx",
    "src/app/(admin)/admin/orders/page.tsx",
    "src/app/(admin)/admin/pricing/page.tsx",
    "src/app/(admin)/admin/finance/page.tsx",
  ];

  for (const file of files) {
    const source = read(file);
    assert.doesNotMatch(source, /#(?:F8FAFC|0F172A|2563EB|0F2747)/i);
    assert.doesNotMatch(source, /(?:bg|text|border)-(?:slate|blue|red|emerald|amber)-/);
  }
});

test("release gate: admin workspaces expose real loading/error/empty states", () => {
  for (const file of [
    "src/app/(admin)/admin/page.tsx",
    "src/app/(admin)/admin/products/page.tsx",
    "src/app/(admin)/admin/orders/page.tsx",
    "src/app/(admin)/admin/pricing/page.tsx",
    "src/app/(admin)/admin/finance/page.tsx",
  ]) {
    const source = read(file);
    assert.match(source, /loading|Loading/i);
    assert.match(source, /error|Error/i);
    assert.match(source, /empty|Empty|لا توجد|لا يوجد/i);
  }
});

test("release gate: no obvious B2B/mock supplier truth leaks into storefront source", () => {
  const sourceFiles = walk("src").filter((file) => /\.(ts|tsx|js|jsx)$/.test(file));
  const forbidden = [
    /\bb2b\b/i,
    /supplierPrice/i,
    /sellerId/i,
    /MOCK_/i,
    /customer-001/i,
    /AS-2026-10482/i,
    /SHIP-1001/i,
    /CHAT-1001/i,
    /94,700/i,
    /99\.9[58]%/i,
  ];

  for (const file of sourceFiles) {
    const source = read(file);
    for (const pattern of forbidden) {
      assert.doesNotMatch(
        source,
        pattern,
        "Forbidden legacy/mock truth found in " + file + ": " + pattern,
      );
    }
  }
});

test("release gate: visual search remains an explicit first-class discovery path", () => {
  const hero = read("src/components/commerce/HomeHero.tsx");
  const header = read("src/components/layout/Header.tsx");
  const mobile = read("src/components/navigation/MobileStoreBar.tsx");

  assert.match(hero, /\/shop\/visual-search/);
  assert.match(header, /\/shop\/visual-search/);
  assert.match(mobile, /\/shop\/visual-search/);
  assert.doesNotMatch(hero, /rgba\(/);
});

test("release gate: global interaction layer is accessible and motion-safe", () => {
  const css = read("src/app/globals.css");

  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /scroll-behavior:\s*smooth/);
  assert.match(css, /scroll-surface/);
  assert.match(css, /media-frame/);
});

test("release gate: product presentation only exposes rating/discount signals when backed by data", () => {
  const card = read("src/components/commerce/ProductCard.tsx");
  const b2cCard = read("src/components/commerce/B2CProductCard.tsx");

  assert.match(card, /reviewCount/);
  assert.match(b2cCard, /reviewCount/);
  assert.match(b2cCard, /discount/);
  assert.match(b2cCard, /availableQuantity|inStock|availability/i);
  assert.doesNotMatch(b2cCard, /rating:\s*5|discount:\s*50/);
});

test("release gate: checkout/search/category contracts remain backend-aligned", () => {
  const checkout = read("src/app/(shop)/shop/checkout/page.tsx");
  const search = read("src/features/search/services/search-api.service.ts");
  const products = read("src/features/products/services/product.service.ts");
  const categories = read("src/features/catalog/services/category-api.service.ts");

  assert.match(checkout, /createBackendOrder/);
  assert.match(checkout, /processBackendPayment/);
  assert.match(search, /price_asc/);
  assert.match(search, /price_desc/);
  assert.match(products, /requireFilterId/);
  assert.match(products, /brandId|categoryId/);
  assert.match(categories, /\/api\/v1\/categories/);
});

test("release gate: authentication-aware buyer surfaces are preserved", () => {
  const orders = read("src/app/(buyer)/buyer/orders/page.tsx");
  const addresses = read("src/app/(buyer)/buyer/addresses/page.tsx");
  const provider = read("src/components/providers.tsx");

  assert.match(orders, /session\.status !== "authenticated"/);
  assert.match(addresses, /session\.status !== "authenticated"/);
  assert.match(orders, /\/login\?next=\/buyer\/orders/);
  assert.match(addresses, /\/login\?next=\/buyer\/addresses/);
  assert.match(provider, /getMyWishlist/);
  assert.match(provider, /getMyNotifications/);
});

test("release gate: package test/build/lint scripts remain defined", () => {
  const pkg = JSON.parse(read("package.json"));

  assert.equal(typeof pkg.scripts?.lint, "string");
  assert.equal(pkg.scripts?.["test:contracts"], "node --test");
  assert.equal(typeof pkg.scripts?.build, "string");
});
