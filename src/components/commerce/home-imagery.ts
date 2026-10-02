// Editorial imagery for the homepage Hero and CategoryGrid — kept in one
// place so both consumers reuse the exact same verified sources instead of
// duplicating URLs. Fashion/Accessories reuse PRODUCT_IMAGE_URL entries that
// are already wired into the live catalog (mocks/products.ts) and were
// confirmed logo-free during this pass — several other entries in that map
// (sneaker, sunglasses, watch, handbag, perfume, makeup, skincare tube) were
// checked too and show a real third-party brand mark, so they're
// deliberately excluded from any large/prominent placement here even though
// they're fine as small product-card thumbnails elsewhere.
//
// The one genuinely new asset — Beauty & Care has no logo-free candidate in
// PRODUCT_IMAGE_URL — was sourced the same way every image in this codebase
// is: downloaded and visually inspected in this pass (via
// images.unsplash.com, the only host next.config.ts allows for remote
// images) to confirm it's a real, generic (no visible brand mark) product
// photo before being wired in.
const IMAGE_PARAMS = "auto=format&fit=crop&w=1600&q=78";

export const HERO_IMAGE_URL = `https://images.unsplash.com/photo-1595777457583-95e059d581b8?${IMAGE_PARAMS}`; // red evening dress — same photo as prod-001, reused at hero resolution

export const CATEGORY_IMAGE_URL: Record<string, string> = {
  fashion: `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?${IMAGE_PARAMS}`, // white t-shirt — same photo as prod-002
  accessories: `https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?${IMAGE_PARAMS}`, // pearl necklace — same photo as prod-008
  "beauty-care": `https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?${IMAGE_PARAMS}`, // amber dropper serum bottle, no visible brand mark
};
