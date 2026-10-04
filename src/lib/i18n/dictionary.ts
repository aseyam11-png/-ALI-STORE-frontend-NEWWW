import { useLocalizationStore } from "@/stores/localization-store";
import type { Locale } from "@/features/localization/types/localization.types";

// The store's minimal, real translation layer. `useLocalizationStore`
// already owns the single source of truth for the active locale (and
// already flips document dir/lang from it) — this file adds the one thing
// it was missing: actual string translation, driven by that same locale
// state rather than a second, competing locale mechanism. `next-intl` is an
// installed dependency with no working setup (no message catalogs, no
// provider) anywhere in the app; standing that up is a separate, larger
// initiative. This dictionary exists so customer-facing components that
// currently hardcode one language's text can read the active locale
// instead — start with the keys real components need, grow it as more
// components migrate off hardcoded strings.
const dictionary = {
  addToCart: { ar: "أضف إلى السلة", en: "Add to cart" },
  outOfStock: { ar: "غير متوفر", en: "Out of stock" },
  inStock: { ar: "متوفر", en: "In stock" },
  onlyXLeft: { ar: "متبقي {count} فقط", en: "Only {count} left" },
  viewProduct: { ar: "عرض {name}", en: "View {name}" },
  addToWishlist: { ar: "إضافة {name} إلى المفضلة", en: "Add {name} to wishlist" },
  removeFromWishlist: { ar: "إزالة {name} من المفضلة", en: "Remove {name} from wishlist" },
  reviewsCount: { ar: "({count} تقييم)", en: "({count} reviews)" },
  shippedByAliStore: { ar: "يُشحن من ALI STORE", en: "Shipped by ALI STORE" },
  freeShipping: { ar: "شحن مجاني", en: "Free shipping" },
  noImage: { ar: "لا توجد صورة", en: "No image" },
  closeQuickView: { ar: "إغلاق العرض السريع", en: "Close quick view" },
  noReviews: { ar: "لا توجد تقييمات بعد", en: "No reviews yet" },
  sku: { ar: "رمز المنتج", en: "SKU" },
  availabilityChecking: { ar: "جارٍ التحقق من التوفر", en: "Availability is being confirmed" },
  available: { ar: "متوفر", en: "available" },
  delivery: { ar: "التوصيل", en: "Delivery" },
  returns: { ar: "الإرجاع", en: "Returns" },
  returnsUnavailable: { ar: "معلومات الإرجاع غير متاحة هنا.", en: "Returns information is not available here." },
  securePayment: { ar: "دفع آمن", en: "Secure payment" },
  paymentProcessedByAliStore: { ar: "تتم معالجة الدفع بأمان عبر ALI STORE.", en: "Payment is processed securely by ALI STORE." },
  fulfillment: { ar: "تنفيذ الطلب", en: "Fulfillment" },
  fulfillmentByAliStore: { ar: "تتم متابعة تنفيذ الطلب عبر ALI STORE.", en: "Order fulfillment is coordinated by ALI STORE." },
  quantity: { ar: "الكمية", en: "Quantity" },
  estimatedSubtotal: { ar: "الإجمالي الفرعي", en: "Estimated subtotal" },
  adding: { ar: "جارٍ الإضافة…", en: "Adding..." },
  checkingAvailability: { ar: "جارٍ التحقق من التوفر", en: "Checking availability" },
  unavailable: { ar: "المنتج غير متاح حاليًا", en: "This product is currently unavailable" },
  buyNow: { ar: "اشترِ الآن", en: "Buy now" },
  productAddedToCart: { ar: "تمت إضافة المنتج إلى السلة.", en: "Product added to cart." },
  invalidProductId: { ar: "معرّف المنتج غير صالح.", en: "Invalid product id." },
  unableToAddToCart: { ar: "تعذر إضافة المنتج إلى السلة.", en: "Unable to add this product to the cart." },
  variantCartUnsupported: { ar: "هذا المنتج يحتوي على خيارات، لكن السلة الحالية لا تدعم حفظ الخيار المحدد بعد.", en: "This product has variants, but the current cart API does not persist variants yet." },
  decreaseQuantity: { ar: "تقليل الكمية", en: "Decrease quantity" },
  increaseQuantity: { ar: "زيادة الكمية", en: "Increase quantity" },

  introSkip: { ar: "تخطي", en: "Skip" },
  introShopNow: { ar: "تسوّق الآن", en: "Shop now" },
  introReplay: { ar: "إعادة عرض الافتتاحية", en: "Replay opening" },
  introAriaLabel: {
    ar: "مشهد افتتاحي لـALI STORE",
    en: "ALI STORE cinematic opening",
  },
} satisfies Record<string, Record<Locale, string>>;

export type TranslationKey = keyof typeof dictionary;

function interpolate(
  template: string,
  vars?: Record<string, string | number>,
) {
  if (!vars) return template;

  return Object.entries(vars).reduce(
    (result, [key, value]) =>
      result.replace(`{${key}}`, String(value)),
    template,
  );
}

export function translate(
  key: TranslationKey,
  locale: Locale,
  vars?: Record<string, string | number>,
) {
  return interpolate(dictionary[key][locale], vars);
}

export function useTranslation() {
  const locale = useLocalizationStore((state) => state.locale);

  return {
    locale,
    t: (
      key: TranslationKey,
      vars?: Record<string, string | number>,
    ) => translate(key, locale, vars),
  };
}
