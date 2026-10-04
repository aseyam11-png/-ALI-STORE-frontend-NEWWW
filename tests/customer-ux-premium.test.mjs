import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

test("customer UX: checkout exposes only truthful online payment options", () => {
  const source = read("src/app/(shop)/shop/checkout/page.tsx");
  assert.match(source, /useState\("cod"\)/);
  assert.match(source, /const onlinePaymentsEnabled = false/);
  assert.match(source, /disabled=!option\.enabled/);
  assert.match(source, /غير متاح حاليًا/);
  assert.match(source, /role="radiogroup"/);
  assert.match(source, /role="radio"/);
});

test("customer UX: checkout does not promise an online gateway that backend does not currently provide", () => {
  const source = read("src/app/(shop)/shop/checkout/page.tsx");
  assert.doesNotMatch(source, /Payment attention needed|Credit \/ Debit Card/);
  assert.match(source, /بطاقة ائتمان \/ خصم/);
  assert.match(source, /الدفع عند الاستلام/);
});

test("customer UX: order tracking maps backend shipment enums to human labels", () => {
  const source = read("src/app/(buyer)/buyer/orders/[id]/page.tsx");
  assert.match(source, /قيد التجهيز/);
  assert.match(source, /في الطريق/);
  assert.match(source, /تم التوصيل/);
  assert.doesNotMatch(source, />\s*\{shipment\.status\}\s*</);
  assert.doesNotMatch(source, />\s*\{aggregateShipmentStatus\(order\)\}\s*</);
});

test("customer UX: mobile catalog filters behave as an accessible modal surface", () => {
  const source = read("src/components/commerce/products/ProductsPageContent.tsx");
  assert.match(source, /z-\[var\(--z-overlay\)\]/);
  assert.match(source, /document\.body\.style\.overflow = "hidden"/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /إغلاق الفلاتر/);
  assert.match(source, /role="button"|type="button"/);
});

test("customer UX: customer account does not reference unsupported password management", () => {
  const profile = read("src/app/(buyer)/buyer/profile/page.tsx");
  assert.doesNotMatch(profile, /تغيير كلمة المرور موجود في صفحة الأمان/);
  assert.match(profile, /إدارة الجلسة وتسجيل الخروج الآمن من صفحة الأمان/);
});

test("customer UX: checkout, category, visual search, cart and trust surfaces avoid known English UI leakage", () => {
  const cases = [
    ["src/app/(shop)/shop/checkout/page.tsx", /\b(Checkout|Your cart is empty|Place order|Payment|Delivery information|Full name|Phone|Address)\b/],
    ["src/app/(shop)/shop/categories/[slug]/page.tsx", /\b(Shop this category|Browse|Explore category|View products)\b/],
    ["src/app/(shop)/shop/visual-search/page.tsx", /\b(Find products by image|Upload a photo|Products)\b/],
    ["src/components/layout/TopBar.tsx", /\b(Product information|Shipping details|Secure checkout|Help Center)\b/],
    ["src/components/checkout/CouponInput.tsx", /\b(Coupon applied|Apply|Checking\.\.\.|Remove coupon)\b/],
    ["src/components/commerce/product/ProductTrust.tsx", /\b(Secure checkout|Returns|AliStore support|Shipping cost)\b/],
  ];

  for (const [file, pattern] of cases) {
    assert.doesNotMatch(read(file), pattern, "English UI leakage in " + file);
  }
});

test("customer UX: category tree uses semantic design tokens", () => {
  const source = read("src/components/commerce/category/CategoryTree.tsx");
  assert.doesNotMatch(source, /#[0-9A-Fa-f]{6}\b/);
  assert.doesNotMatch(source, /(?:bg|text|border)-(?:slate|blue|red|emerald|amber)-/);
  assert.doesNotMatch(source, /Collapse |Expand /);
  assert.match(source, /طي |فتح /);
});

test("customer UX: product detail keeps unknown return policy truthful", () => {
  const source = read("src/components/commerce/product/ProductInfo.tsx");
  assert.match(source, /سيتم عرض سياسة الإرجاع عند توفرها/);
  assert.match(source, /selectedVariant/);
});

test("customer UX: gallery labels are Arabic and touch-safe", () => {
  const source = read("src/components/commerce/product/ProductGallery.tsx");
  assert.match(source, /عرض الصورة بالحجم الكامل/);
  assert.match(source, /عرض صورة/);
  assert.match(source, /لا توجد صور للمنتج/);
});


test("customer UX: product and deals surfaces do not leak English customer copy", () => {
  assert.doesNotMatch(
    read("src/components/commerce/product/ProductInfo.tsx"),
    />\s*(Delivery|Returns|Secure payment|Fulfillment|No reviews yet)\s*</,
  );
  assert.doesNotMatch(
    read("src/app/(shop)/shop/deals/page.tsx"),
    />\s*Active deals\s*</,
  );
  assert.match(
    read("src/app/(shop)/shop/deals/page.tsx"),
    /العروض النشطة/,
  );
});

test("customer UX: product card and catalog shipping fallbacks are Arabic", () => {
  assert.doesNotMatch(
    read("src/components/commerce/B2CProductCard.tsx"),
    /Unable to add this product to the cart\./,
  );
  assert.doesNotMatch(
    read("src/components/commerce/ProductCard.tsx"),
    /Unable to add the product to your cart\./,
  );
  assert.match(
    read("src/features/products/services/b2c-product.mapper.ts"),
    /يُحدد الشحن عند إتمام الطلب/,
  );
  assert.match(
    read("src/features/products/services/b2c-product.mapper.ts"),
    /يُحدد موعد التوصيل عند إتمام الطلب/,
  );
});
