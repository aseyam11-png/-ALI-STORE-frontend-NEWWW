import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("admin route group and warehouse require authenticated admin role", () => {
  const layout = read("src/app/(admin)/layout.tsx");
  const warehouseLayout = read("src/app/warehouse/layout.tsx");
  const guard = read("src/components/admin/AdminRouteGuard.tsx");

  assert.match(layout, /AdminRouteGuard/);
  assert.match(warehouseLayout, /AdminRouteGuard/);
  assert.match(guard, /useSession\(\)/);
  assert.match(guard, /replace\(\/\^ROLE_\//);
  assert.match(guard, /role === "ADMIN"/);
  assert.match(guard, /403/);
  assert.match(guard, /return children/);
});

test("security headers include clickjacking, content-type and referrer protections", () => {
  const source = read("next.config.ts");
  for (const header of [
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "Cross-Origin-Opener-Policy",
    "Strict-Transport-Security",
  ]) {
    assert.match(source, new RegExp(header));
  }
  assert.match(source, /process\.env\.NODE_ENV === "production"/);
});

test("SEO endpoints use the validated site URL and live catalog", () => {
  const siteUrl = read("src/lib/seo/site-url.ts");
  const robots = read("src/app/robots.ts");
  const sitemap = read("src/app/sitemap.ts");
  const productPage = read("src/app/(shop)/shop/products/[id]/page.tsx");
  const categoryPage = read("src/app/(shop)/shop/categories/[slug]/page.tsx");

  assert.match(siteUrl, /NEXT_PUBLIC_SITE_URL/);
  assert.match(siteUrl, /VERCEL_PROJECT_PRODUCTION_URL/);
  assert.match(robots, /sitemap\.xml/);
  assert.match(robots, /\/buyer/);
  assert.match(sitemap, /getProducts\(/);
  assert.match(sitemap, /getCategories\(/);
  assert.match(productPage, /application\/ld\+json/);
  assert.match(productPage, /AggregateRating/);
  assert.match(productPage, /ALI STORE/);
  assert.match(categoryPage, /generateMetadata/);
  assert.match(categoryPage, /canonical/);
});

test("patched Next.js, SWC binaries and @next/env are pinned consistently with lock integrity", () => {
  const pkg = JSON.parse(read("package.json"));
  const lock = JSON.parse(read("package-lock.json"));

  assert.equal(lock.packages[""].dependencies.next, pkg.dependencies.next);
  assert.equal(lock.packages["node_modules/next"].version, "16.3.8");
  assert.equal(lock.packages["node_modules/@next/env"].version, "16.3.8");
  assert.match(pkg.dependencies.next, /16\.3\.8/);

  const entries = [
    "node_modules/next",
    "node_modules/@next/env",
    ...[
      "darwin-arm64",
      "darwin-x64",
      "linux-arm64-gnu",
      "linux-arm64-musl",
      "linux-x64-gnu",
      "linux-x64-musl",
      "win32-arm64-msvc",
      "win32-x64-msvc",
    ].map((platform) => "node_modules/@next/swc-" + platform),
  ];

  for (const entry of entries) {
    const item = lock.packages[entry];
    assert.ok(item, "Missing lockfile entry: " + entry);
    assert.equal(item.version, "16.3.8", "Unexpected version for " + entry);
    assert.match(item.resolved, /-16\.3\.8\.tgz$/);
    assert.match(item.integrity, /^sha512-/);
    assert.equal(Buffer.from(item.integrity.slice("sha512-".length), "base64").byteLength, 64);
  }
});

test("release verification always runs TypeScript before packaging", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.equal(pkg.scripts.typecheck, "tsc --noEmit");
  assert.match(pkg.scripts.verify, /npm run typecheck/);
  assert.match(pkg.scripts["quality:advanced"], /npm run typecheck/);
});
