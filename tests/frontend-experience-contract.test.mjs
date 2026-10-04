import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

test("shared experience primitives are wired into both app shells", () => {
  const appShell = read("src/components/layout/AppShell.tsx");
  const customerShell = read("src/components/commerce/CustomerShell.tsx");
  const mobileBar = read("src/components/navigation/MobileStoreBar.tsx");

  assert.match(appShell, /MobileStoreBar/);
  assert.match(customerShell, /MobileStoreBar/);
  assert.match(mobileBar, /aria-current/);
  assert.match(mobileBar, /useCartStore/);
  assert.match(mobileBar, /useWishlistStore/);
});

test("admin workspace uses semantic UI primitives instead of legacy hardcoded palette", () => {
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

test("admin shell exposes keyboard-accessible collapse and mobile navigation", () => {
  const source = read("src/components/layout/AdminShell.tsx");
  assert.match(source, /PanelLeftClose/);
  assert.match(source, /PanelLeftOpen/);
  assert.match(source, /aria-controls="admin-mobile-nav"/);
  assert.match(source, /event.key === "Escape"/);
  assert.match(source, /event.key !== "Tab"/);
});

test("storefront hero has explicit visual-search and catalog entry points", () => {
  const source = read("src/components/commerce/HomeHero.tsx");
  assert.match(source, /\/shop\/visual-search/);
  assert.match(source, /\/shop\/products/);
  assert.doesNotMatch(source, /rgba\(/);
});
