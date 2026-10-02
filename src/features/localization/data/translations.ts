import type { Locale } from "../types/localization.types";

type TranslationKey =
  | "search"
  | "products"
  | "categories"
  | "deals"
  | "cart"
  | "account"
  | "wishlist"
  | "support"
  | "addToCart"
  | "buyNow"
  | "checkout"
  | "freeShipping"
  | "inStock"
  | "outOfStock"
  | "orderSummary"
  | "continueShopping";

export const translations: Record<
  Locale,
  Record<TranslationKey, string>
> = {
  en: {
    search: "Search",
    products: "Products",
    categories: "Categories",
    deals: "Deals",
    cart: "Cart",
    account: "Account",
    wishlist: "Wishlist",
    support: "Support",
    addToCart: "Add to cart",
    buyNow: "Buy now",
    checkout: "Checkout",
    freeShipping: "Free shipping",
    inStock: "In stock",
    outOfStock: "Out of stock",
    orderSummary: "Order summary",
    continueShopping: "Continue shopping",
  },

  ar: {
    search: "بحث",
    products: "المنتجات",
    categories: "التصنيفات",
    deals: "العروض",
    cart: "السلة",
    account: "الحساب",
    wishlist: "المفضلة",
    support: "الدعم",
    addToCart: "أضف إلى السلة",
    buyNow: "اشترِ الآن",
    checkout: "إتمام الطلب",
    freeShipping: "شحن مجاني",
    inStock: "متوفر",
    outOfStock: "غير متوفر",
    orderSummary: "ملخص الطلب",
    continueShopping: "متابعة التسوق",
  },
};

export type {
  TranslationKey,
};

export function translate(
  locale: Locale,
  key: TranslationKey,
): string {
  return (
    translations[locale][key] ??
    translations.en[key]
  );
}
