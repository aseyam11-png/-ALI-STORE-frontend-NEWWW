"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CheckCircle2, CreditCard, MapPin, ShieldCheck, Truck } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { CouponInput } from "@/components/checkout/CouponInput";
import { useSession } from "@/features/auth/session";
import { getServerAddresses } from "@/features/addresses/services/address-api.service";
import { syncLocalCart } from "@/features/cart/services/cart-api.service";
import {
  createServerOrder,
  processServerPayment,
} from "@/features/orders/services/order-api.service";
import { getShippingQuote } from "@/features/shipping/services/shipping-api.service";
import { useCartStore } from "@/stores/cart-store";
import { formatSAR } from "@/features/localization/services/currency.service";

type ShippingMethod = "STANDARD" | "EXPRESS";
type PaymentMethod = "CREDIT_CARD" | "PAYPAL" | "CASH_ON_DELIVERY";

export default function CheckoutPage() {
  const router = useRouter();
  const session = useSession();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethod>("STANDARD");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("CASH_ON_DELIVERY");
  const [selectedAddressId, setSelectedAddressId] =
    useState<number | null>(null);
  const [shippingAddress, setShippingAddress] = useState("");
  const [couponCode, setCouponCode] = useState<string | undefined>();
  const [couponPreview, setCouponPreview] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ),
    [items],
  );

  const addressesQuery = useQuery({
    queryKey: ["server-addresses"],
    queryFn: getServerAddresses,
    enabled: session.status === "authenticated",
    staleTime: 30_000,
  });

  const shippingQuery = useQuery({
    queryKey: ["shipping-quote", shippingMethod, subtotal],
    queryFn: () => getShippingQuote(shippingMethod, subtotal),
    enabled: items.length > 0,
    staleTime: 10_000,
  });

  const addresses = addressesQuery.data ?? [];
  const selectedAddress = addresses.find(
    (address) => address.id === selectedAddressId,
  );

  const activeAddress = selectedAddress
    ? [
        selectedAddress.street,
        selectedAddress.city,
        selectedAddress.state,
        selectedAddress.country,
        selectedAddress.postalCode,
      ]
        .filter(Boolean)
        .join(", ")
    : shippingAddress.trim();

  const shippingQuote = shippingQuery.data;
  const shippingCost = shippingQuote?.amount ?? 0;
  const estimatedDelivery =
    shippingQuery.data?.estimatedDelivery ??
    "تظهر المدة بعد اختيار الشحن";
  const previewTotal = Math.max(
    0,
    subtotal + shippingCost - couponPreview,
  );

  const placeOrder = async () => {
    setError("");

    if (session.status !== "authenticated") {
      router.push("/login?next=/shop/checkout");
      return;
    }

    if (items.length === 0) {
      setError("السلة فارغة.");
      return;
    }

    if (!activeAddress) {
      setError("اختر عنوانًا محفوظًا أو أدخل عنوان الشحن.");
      return;
    }

    if (!shippingQuery.data) {
      setError("تعذر حساب تكلفة الشحن. أعد المحاولة.");
      return;
    }

    setSubmitting(true);

    try {
      await syncLocalCart(items);

      const order = await createServerOrder({
        shippingAddress: activeAddress,
        shippingMethod,
        couponCode,
      });

      const payment = await processServerPayment({
        orderId: order.id,
        amount: Number(order.totalAmount),
        method: paymentMethod,
      });

      if (payment.status === "FAILED") {
        throw new Error("فشل الدفع ولم يتم تفعيل الطلب.");
      }

      clearCart();
      router.replace(
        "/buyer/orders/" +
          encodeURIComponent(String(order.id)) +
          "/confirmation",
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "تعذر إتمام الطلب حاليًا.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (session.status === "loading") {
    return (
      <AppShell>
        <main className="min-h-screen bg-background">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
            <div className="animate-pulse rounded-2xl border border-neutral-200 bg-surface p-8">
              <div className="h-8 w-48 rounded bg-neutral-100" />
              <div className="mt-4 h-5 w-80 rounded bg-neutral-100" />
            </div>
          </div>
        </main>
      </AppShell>
    );
  }

  if (session.status !== "authenticated") {
    return (
      <AppShell>
        <main className="min-h-screen bg-background">
          <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
            <ShieldCheck className="mx-auto h-10 w-10 text-brand" />
            <h1 className="mt-5 text-3xl font-bold text-foreground">
              تسجيل الدخول مطلوب
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              نحتاج إلى ربط طلبك بحسابك قبل إنشاء الطلب والدفع بشكل آمن.
            </p>
            <Link
              href="/login?next=/shop/checkout"
              className="mt-7 inline-flex h-12 items-center rounded-xl bg-brand px-6 text-sm font-bold text-white hover:bg-brand-hover"
            >
              تسجيل الدخول
            </Link>
          </div>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
          <div>
            <p className="text-label font-medium uppercase tracking-wide text-brand">
              Checkout
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
              إتمام الطلب
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              يتم تثبيت السعر والمخزون والدفع من الخادم عند تأكيد الطلب.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-2xl border border-danger-100 bg-danger-surface px-4 py-3 text-sm font-medium text-danger-700"
            >
              {error}
            </div>
          )}

          {items.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-neutral-200 bg-surface p-10 text-center">
              <h2 className="text-xl font-bold text-foreground">
                السلة فارغة
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                أضف منتجات قبل الوصول إلى الدفع.
              </p>
              <Link
                href="/shop/products"
                className="mt-6 inline-flex h-11 items-center rounded-xl bg-brand px-5 text-sm font-bold text-white"
              >
                العودة للمتجر
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_380px]">
              <section className="space-y-6">
                <div className="rounded-2xl border border-neutral-200 bg-surface p-6">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-brand" />
                    <h2 className="text-lg font-bold text-foreground">
                      عنوان الشحن
                    </h2>
                  </div>

                  {addressesQuery.isLoading ? (
                    <div className="mt-5 h-24 animate-pulse rounded-xl bg-neutral-100" />
                  ) : (
                    <>
                      {addresses.length > 0 && (
                        <div className="mt-5 grid gap-3">
                          {addresses.map((address) => {
                            const value = [
                              address.street,
                              address.city,
                              address.state,
                              address.country,
                              address.postalCode,
                            ]
                              .filter(Boolean)
                              .join(", ");

                            const selected =
                              selectedAddressId === address.id ||
                              (selectedAddressId === null &&
                                address.isDefault);

                            return (
                              <button
                                key={address.id}
                                type="button"
                                onClick={() => {
                                  setSelectedAddressId(address.id);
                                  setShippingAddress(value);
                                }}
                                className={
                                  "w-full rounded-xl border p-4 text-start transition " +
                                  (selected
                                    ? "border-brand bg-primary-50"
                                    : "border-neutral-200 bg-background hover:border-primary-200")
                                }
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-sm font-bold text-foreground">
                                    {address.city}
                                  </span>
                                  {address.isDefault && (
                                    <span className="rounded-full bg-success-surface px-2 py-1 text-[10px] font-bold text-success-700">
                                      افتراضي
                                    </span>
                                  )}
                                </div>
                                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                  {value}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <textarea
                        value={shippingAddress}
                        onChange={(event) => {
                          setSelectedAddressId(null);
                          setShippingAddress(event.target.value);
                        }}
                        rows={4}
                        placeholder="أدخل العنوان بالتفصيل..."
                        className="mt-4 w-full rounded-xl border border-neutral-200 bg-background p-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-primary-100"
                      />

                      <p className="mt-2 text-xs text-muted-foreground">
                        العنوان يُحفظ مع الطلب على الخادم كنسخة شحن ثابتة.
                      </p>
                    </>
                  )}
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-surface p-6">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-brand" />
                    <h2 className="text-lg font-bold text-foreground">
                      طريقة الشحن
                    </h2>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {(["STANDARD", "EXPRESS"] as ShippingMethod[]).map(
                      (method) => {
                        const selected = shippingMethod === method;
                        const isCurrentQuote =
                          shippingQuery.data?.method === method;

                        return (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setShippingMethod(method)}
                            className={
                              "rounded-xl border p-4 text-start transition " +
                              (selected
                                ? "border-brand bg-primary-50"
                                : "border-neutral-200")
                            }
                          >
                            <p className="text-sm font-bold text-foreground">
                              {method === "STANDARD"
                                ? "شحن عادي"
                                : "شحن سريع"}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {isCurrentQuote
                                ? formatSAR(shippingQuery.data.amount)
                                : "حساب التكلفة..."}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {isCurrentQuote
                                ? shippingQuery.data.estimatedDelivery
                                : ""}
                            </p>
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-surface p-6">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-brand" />
                    <h2 className="text-lg font-bold text-foreground">
                      طريقة الدفع
                    </h2>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {(
                      [
                        "CASH_ON_DELIVERY",
                        "CREDIT_CARD",
                        "PAYPAL",
                      ] as PaymentMethod[]
                    ).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={
                          "rounded-xl border p-4 text-start transition " +
                          (paymentMethod === method
                            ? "border-brand bg-primary-50"
                            : "border-neutral-200")
                        }
                      >
                        <p className="text-sm font-bold text-foreground">
                          {method === "CASH_ON_DELIVERY"
                            ? "الدفع عند الاستلام"
                            : method === "CREDIT_CARD"
                              ? "بطاقة بنكية"
                              : "PayPal"}
                        </p>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-success-600" />
                    الخادم يعيد التحقق من الطلب والمبلغ قبل تسجيل الدفع.
                  </div>
                </div>

                <CouponInput
                  subtotal={subtotal}
                  onApply={({ code, discountAmount }) => {
                    setCouponCode(code);
                    setCouponPreview(discountAmount);
                  }}
                  onRemove={() => {
                    setCouponCode(undefined);
                    setCouponPreview(0);
                  }}
                />
              </section>

              <aside className="h-fit rounded-2xl border border-neutral-200 bg-surface p-6 lg:sticky lg:top-24">
                <h2 className="text-lg font-bold text-foreground">
                  ملخص الطلب
                </h2>

                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">المنتجات</span>
                    <span className="font-bold">{formatSAR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">الشحن</span>
                    <span className="font-bold">
                      {formatSAR(shippingCost)}
                    </span>
                  </div>
                  {couponPreview > 0 && (
                    <div className="flex justify-between gap-4 text-success-700">
                      <span>الخصم المبدئي</span>
                      <span className="font-bold">
                        -{formatSAR(couponPreview)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-neutral-200 pt-4">
                    <div className="flex justify-between gap-4">
                      <span className="text-base font-bold text-foreground">
                        الإجمالي المتوقع
                      </span>
                      <span className="text-2xl font-black text-foreground">
                        {formatSAR(previewTotal)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {estimatedDelivery}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void placeOrder()}
                  disabled={
                    submitting ||
                    shippingQuery.isLoading ||
                    shippingQuery.isError
                  }
                  className="mt-7 inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-bold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-neutral-300"
                >
                  {submitting
                    ? "جاري تأكيد الطلب..."
                    : "تأكيد الطلب والدفع"}
                </button>

                <p className="mt-4 flex items-center justify-center gap-2 text-center text-[11px] leading-5 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-success-600" />
                  السعر النهائي يعاد حسابه وتثبيته على الخادم.
                </p>
              </aside>
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
