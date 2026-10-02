"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, CreditCard, Loader2, MapPin, Truck, AlertCircle } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { CouponInput } from "@/components/checkout/CouponInput";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { useSession } from "@/features/auth/session";
import { createBackendOrder, processPayment } from "@/features/orders/services/order-api.service";
import { getShippingQuote } from "@/features/products/services/product-api.service";
import { syncCart } from "@/features/cart/services/cart-api.service";
import { useCartStore } from "@/stores/cart-store";

type PaymentMethod = "CASH_ON_DELIVERY" | "CREDIT_CARD" | "PAYPAL";
type ShippingMethod = "STANDARD" | "EXPRESS";

export default function CheckoutPage() {
  const router = useRouter();
  const session = useSession();
  const items = useCartStore((state) => state.items);
  const clearLocalCart = useCartStore((state) => state.clearCart);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Palestine");
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("STANDARD");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH_ON_DELIVERY");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items],
  );

  const currency = items[0]?.currency ?? "USD";

  const shippingQuery = useQuery({
    queryKey: ["checkout-shipping", subtotal, couponDiscount, shippingMethod, currency],
    queryFn: () =>
      getShippingQuote(
        Math.max(0, subtotal - couponDiscount),
        shippingMethod,
        currency,
      ),
    enabled: items.length > 0,
  });

  const shippingQuote = shippingQuery.data;
  const loadingQuote = shippingQuery.isPending || shippingQuery.isFetching;
  const shippingAmount = shippingQuote?.amount ?? 0;
  const shippingError =
    shippingQuery.error instanceof Error
      ? shippingQuery.error.message
      : "";

  const estimatedTotal = Math.max(
    0,
    subtotal - couponDiscount + shippingAmount,
  );

  const placeOrder = async () => {
    setError("");

    if (session.status !== "authenticated") {
      router.push("/login?next=/shop/checkout");
      return;
    }

    if (!items.length) {
      setError("السلة فارغة.");
      return;
    }

    const cleanName = fullName.trim();
    const cleanAddress = address.trim();
    const cleanCity = city.trim();
    const cleanCountry = country.trim() || "Palestine";

    if (
      !cleanName ||
      !email.trim() ||
      !phone.trim() ||
      !cleanAddress ||
      !cleanCity
    ) {
      setError("أكمل بيانات الشحن المطلوبة.");
      return;
    }

    if (
      items.some(
        (item) =>
          !Number.isInteger(Number(item.productId)) ||
          Number(item.productId) < 1,
      )
    ) {
      setError(
        "يوجد منتج محلي غير مرتبط بمنتج حي في الكتالوج. أعد إضافة المنتج من صفحة المتجر.",
      );
      return;
    }

    setPlacing(true);

    try {
      await syncCart(
        items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      );

      const order = await createBackendOrder({
        shippingAddress:
          cleanName +
          " | " +
          phone.trim() +
          " | " +
          cleanAddress +
          " | " +
          cleanCity +
          " | " +
          cleanCountry,
        shippingMethod,
        couponCode: couponCode || undefined,
      });

      const payment = await processPayment(
        order.id,
        order.totalAmount,
        paymentMethod,
      );

      const accepted =
        payment.status === "COMPLETED" ||
        (paymentMethod === "CASH_ON_DELIVERY" &&
          payment.status === "PENDING");

      if (!accepted) {
        throw new Error("لم يتم تأكيد الدفع. لم يتم اعتبار الطلب مكتملًا.");
      }

      clearLocalCart();
      router.replace("/buyer/orders/" + order.id + "/confirmation");
    } catch (placeOrderError) {
      setError(
        placeOrderError instanceof Error
          ? placeOrderError.message
          : "تعذر إتمام الطلب. حاول مرة أخرى.",
      );
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <AppShell>
        <main className="min-h-screen bg-background">
          <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
              <Truck className="h-6 w-6" />
            </div>
            <h1 className="mt-5 text-3xl font-black text-foreground">السلة فارغة</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              أضف منتجًا واحدًا على الأقل قبل إتمام الشراء.
            </p>
            <Link
              href="/shop/products"
              className="mt-7 inline-flex h-11 items-center rounded-xl bg-brand px-6 text-sm font-black text-white"
            >
              متابعة التسوق
            </Link>
          </div>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-brand">
              Checkout
            </span>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
              إتمام الطلب
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              السعر النهائي والشحن والتحقق من المخزون والدفع تُحسم على الخادم.
            </p>
          </div>

          {session.status !== "authenticated" && (
            <section className="mb-6 flex items-center gap-3 rounded-2xl border border-warning-100 bg-warning-surface p-4">
              <AlertCircle className="h-5 w-5 shrink-0 text-warning-600" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-foreground">يلزم تسجيل الدخول</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  سيتم حفظ الطلب في حسابك وتتبع حالته من صفحة الطلبات.
                </p>
              </div>
              <Link
                href="/login?next=/shop/checkout"
                className="inline-flex h-10 items-center rounded-xl bg-brand px-4 text-xs font-black text-white"
              >
                تسجيل الدخول
              </Link>
            </section>
          )}

          {(error || shippingError) && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-2xl border border-danger-100 bg-danger-surface p-4 text-sm font-bold text-danger-700"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{error || shippingError}</span>
            </div>
          )}

          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_380px]">
            <section className="space-y-6">
              <section className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-brand" />
                  <h2 className="text-lg font-black text-foreground">بيانات الشحن</h2>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="الاسم الكامل *" autoComplete="name" className="h-11 rounded-xl border border-neutral-200 bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-primary-100" />
                  <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="البريد الإلكتروني *" type="email" autoComplete="email" className="h-11 rounded-xl border border-neutral-200 bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-primary-100" />
                  <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="رقم الهاتف *" autoComplete="tel" className="h-11 rounded-xl border border-neutral-200 bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-primary-100" />
                  <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="المدينة *" autoComplete="address-level2" className="h-11 rounded-xl border border-neutral-200 bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-primary-100" />
                  <input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="العنوان التفصيلي *" autoComplete="street-address" className="h-11 rounded-xl border border-neutral-200 bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-primary-100 sm:col-span-2" />
                  <input value={country} onChange={(event) => setCountry(event.target.value)} placeholder="الدولة" autoComplete="country-name" className="h-11 rounded-xl border border-neutral-200 bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-primary-100" />
                </div>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-brand" />
                  <h2 className="text-lg font-black text-foreground">طريقة الشحن</h2>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {(["STANDARD", "EXPRESS"] as const).map((method) => {
                    const selected = shippingMethod === method;

                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setShippingMethod(method)}
                        className={
                          "rounded-2xl border p-4 text-start transition " +
                          (selected
                            ? "border-brand bg-info-surface"
                            : "border-neutral-200 bg-surface hover:border-primary-200")
                        }
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-black">
                              {method === "STANDARD" ? "شحن عادي" : "شحن سريع"}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {shippingQuote && method === shippingMethod && !loadingQuote
                                ? String(shippingQuote.estimatedMinDays) +
                                  "-" +
                                  String(shippingQuote.estimatedMaxDays) +
                                  " يوم عمل"
                                : method === shippingMethod
                                  ? "جاري حساب المدة..."
                                  : "سيتم الحساب عند الاختيار"}
                            </p>
                          </div>
                          {selected && <CheckCircle2 className="h-5 w-5 text-brand" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-brand" />
                  <h2 className="text-lg font-black text-foreground">الدفع</h2>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    { value: "CASH_ON_DELIVERY", label: "الدفع عند الاستلام" },
                    { value: "CREDIT_CARD", label: "بطاقة" },
                    { value: "PAYPAL", label: "PayPal" },
                  ].map((method) => {
                    const selected = paymentMethod === method.value;

                    return (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setPaymentMethod(method.value as PaymentMethod)}
                        className={
                          "rounded-2xl border p-4 text-sm font-black transition " +
                          (selected
                            ? "border-brand bg-info-surface text-brand"
                            : "border-neutral-200 hover:border-primary-200")
                        }
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span>{method.label}</span>
                          {selected && <CheckCircle2 className="h-4 w-4" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <CouponInput
                subtotal={subtotal}
                shipping={shippingAmount}
                onApply={({ coupon, discountAmount }) => {
                  setCouponCode(coupon.code);
                  setCouponDiscount(discountAmount);
                }}
                onRemove={() => {
                  setCouponCode("");
                  setCouponDiscount(0);
                }}
              />
            </section>

            <aside className="h-fit rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm lg:sticky lg:top-24">
              <h2 className="text-lg font-black text-foreground">ملخص الطلب</h2>

              <div className="mt-6 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.productId + ":" + (item.variantId ?? "base")}
                    className="flex items-start justify-between gap-4 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-bold text-foreground">{item.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        الكمية: {item.quantity}
                      </p>
                    </div>
                    <LocalizedPrice
                      amountUSD={item.price * item.quantity}
                      currency={item.currency}
                      className="shrink-0 font-black"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3 border-t border-neutral-100 pt-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الإجمالي الفرعي</span>
                  <LocalizedPrice amountUSD={subtotal} currency={currency} />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الخصم</span>
                  <LocalizedPrice amountUSD={couponDiscount} currency={currency} />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الشحن</span>
                  {loadingQuote ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LocalizedPrice
                      amountUSD={shippingAmount}
                      currency={shippingQuote?.currency ?? currency}
                    />
                  )}
                </div>
              </div>

              <div className="mt-6 border-t border-neutral-100 pt-5">
                <div className="flex items-end justify-between gap-4">
                  <span className="font-black text-foreground">الإجمالي</span>
                  <LocalizedPrice
                    amountUSD={estimatedTotal}
                    currency={shippingQuote?.currency ?? currency}
                    className="text-2xl font-black text-foreground"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => void placeOrder()}
                disabled={
                  placing ||
                  loadingQuote ||
                  session.status === "loading" ||
                  Boolean(shippingQuery.error)
                }
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-black text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                {placing && <Loader2 className="h-5 w-5 animate-spin" />}
                {placing ? "جارٍ تنفيذ الطلب..." : "تأكيد الطلب والدفع"}
              </button>
            </aside>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
