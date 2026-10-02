"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, MapPin, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { CheckoutAddressSelector } from "@/components/checkout/CheckoutAddressSelector";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { couponApi } from "@/features/coupons/services/coupon-api.service";
import { orderApi } from "@/features/orders/services/order-api.service";
import { HttpApiError } from "@/lib/api/http-client";
import { useAuthStore } from "@/stores/auth-store";
import { useAddressStore } from "@/stores/address-store";
import { useCartStore } from "@/stores/cart-store";

type PaymentMethod = "CREDIT_CARD" | "PAYPAL" | "CASH_ON_DELIVERY";

export default function CheckoutPage() {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const items = useCartStore((state) => state.items);
  const syncing = useCartStore((state) => state.syncing);
  const hydrateCart = useCartStore((state) => state.hydrateRemote);
  const clearCart = useCartStore((state) => state.clearCart);
  const addresses = useAddressStore((state) => state.addresses);
  const selectedAddressId = useAddressStore((state) => state.selectedAddressId);

  const [address, setAddress] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH_ON_DELIVERY");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [successId, setSuccessId] = useState<number | null>(null);

  useEffect(() => {
    if (status === "authenticated") void hydrateCart(false);
  }, [status, hydrateCart]);

  useEffect(() => {
    const selected = addresses.find((item) => item.id === selectedAddressId);
    if (!selected) return;
    setAddress([
      selected.street,
      selected.building ? `Building ${selected.building}` : "",
      selected.apartment ? `Apt ${selected.apartment}` : "",
      selected.area,
      selected.city,
      selected.country,
      selected.postalCode || "",
    ].filter(Boolean).join(", "));
  }, [addresses, selectedAddressId]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const previewTotal = Math.max(0, subtotal - discount);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponMessage("");
    try {
      const coupon = await couponApi.validate(couponCode);
      if (coupon.minimumOrderAmount && subtotal < coupon.minimumOrderAmount) {
        setDiscount(0);
        setCouponMessage(`الحد الأدنى لهذا الكوبون هو ${coupon.minimumOrderAmount}.`);
        return;
      }
      const amount = Math.min(subtotal, subtotal * Number(coupon.discountPercentage) / 100);
      setDiscount(Number(amount.toFixed(2)));
      setCouponMessage(`تم تطبيق خصم ${coupon.discountPercentage}%.`);
    } catch (e) {
      setDiscount(0);
      setCouponMessage(e instanceof HttpApiError ? e.message : "تعذر التحقق من الكوبون.");
    }
  };

  const placeOrder = async () => {
    setError("");
    if (status !== "authenticated") {
      router.push("/login?next=/shop/checkout");
      return;
    }
    if (!items.length) {
      setError("السلة فارغة.");
      return;
    }
    if (!address.trim()) {
      setError("أدخل عنوان الشحن.");
      return;
    }

    setBusy(true);
    try {
      const order = await orderApi.create({
        shippingAddress: address.trim(),
        couponCode: couponCode.trim() || undefined,
      });

      await orderApi.pay({
        orderId: order.id,
        amount: Number(order.totalAmount),
        method: paymentMethod,
      });

      clearCart();
      setSuccessId(order.id);
    } catch (e) {
      setError(e instanceof HttpApiError ? e.message : "تعذر إتمام الطلب.");
    } finally {
      setBusy(false);
    }
  };

  if (status === "loading" || syncing) {
    return <AppShell><div className="flex min-h-[60vh] items-center justify-center text-sm font-bold">جاري تجهيز السلة والدفع...</div></AppShell>;
  }

  if (successId !== null) {
    return (
      <AppShell>
        <main className="min-h-screen bg-background">
          <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
            <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
            <h1 className="mt-5 text-3xl font-black">تم إنشاء الطلب</h1>
            <p className="mt-2 text-sm text-muted-foreground">رقم الطلب: <span dir="ltr">#{successId}</span></p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button type="button" onClick={() => router.push(`/buyer/orders/${successId}/confirmation`)} className="h-11 rounded-xl bg-brand px-6 text-sm font-black text-white">عرض الطلب</button>
              <button type="button" onClick={() => router.push("/shop/products")} className="h-11 rounded-xl border border-neutral-200 bg-surface px-6 text-sm font-black">متابعة التسوق</button>
            </div>
          </div>
        </main>
      </AppShell>
    );
  }

  if (status !== "authenticated" || !user) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-neutral-300" />
          <h1 className="mt-4 text-2xl font-black">تسجيل الدخول مطلوب لإتمام الطلب</h1>
          <button type="button" onClick={() => router.push("/login?next=/shop/checkout")} className="mt-6 h-11 rounded-xl bg-brand px-6 text-sm font-black text-white">تسجيل الدخول</button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black tracking-tight">إتمام الطلب</h1>
          <p className="mt-2 text-sm text-muted-foreground">السعر والمخزون والدفع يتم التحقق منها على الخادم.</p>

          {error && <div role="alert" className="mt-6 rounded-2xl border border-danger-100 bg-danger-surface p-4 text-sm font-bold text-danger-600">{error}</div>}

          <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <CheckoutAddressSelector
                onAddressChange={(id) => {
                  const selected = addresses.find((item) => item.id === id);
                  if (selected) {
                    setAddress([
                      selected.street,
                      selected.building ? `Building ${selected.building}` : "",
                      selected.apartment ? `Apt ${selected.apartment}` : "",
                      selected.area,
                      selected.city,
                      selected.country,
                      selected.postalCode || "",
                    ].filter(Boolean).join(", "));
                  }
                }}
              />

              <section className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm">
                <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-brand" /><h2 className="text-lg font-black">عنوان الشحن</h2></div>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={4} className="mt-5 w-full rounded-xl border border-neutral-200 bg-background p-3 text-sm outline-none focus:border-brand" />
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm">
                <div className="flex items-center gap-3"><CreditCard className="h-5 w-5 text-brand" /><h2 className="text-lg font-black">طريقة الدفع</h2></div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    ["CASH_ON_DELIVERY", "الدفع عند الاستلام"],
                    ["CREDIT_CARD", "بطاقة ائتمان"],
                    ["PAYPAL", "PayPal"],
                  ].map(([value, label]) => (
                    <button key={value} type="button" onClick={() => setPaymentMethod(value as PaymentMethod)} className={`rounded-xl border p-4 text-start text-sm font-black ${paymentMethod === value ? "border-brand bg-primary-50 text-brand" : "border-neutral-200"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <aside className="h-fit rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm lg:sticky lg:top-24">
              <h2 className="text-lg font-black">ملخص الطلب</h2>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">العناصر</span><b>{items.length}</b></div>
                <div className="flex justify-between"><span className="text-muted-foreground">الإجمالي الحالي</span><LocalizedPrice amountUSD={subtotal} className="font-bold" /></div>
                {discount > 0 && <div className="flex justify-between text-success"><span>الخصم</span><LocalizedPrice amountUSD={discount} className="font-bold" /></div>}
              </div>
              <div className="mt-6 border-t border-neutral-100 pt-5">
                <div className="flex justify-between"><span className="font-bold text-muted-foreground">المعاينة</span><LocalizedPrice amountUSD={previewTotal} className="text-2xl font-black" /></div>
                <p className="mt-2 text-[11px] leading-5 text-muted-foreground">المبلغ النهائي الذي يعتمده الخادم قد يختلف عن المعاينة بعد إعادة التسعير/التحقق.</p>
              </div>
              <div className="mt-5 flex gap-2">
                <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-background px-3 text-sm font-bold" placeholder="كود الخصم" />
                <button type="button" onClick={applyCoupon} className="rounded-xl border border-brand px-4 text-xs font-black text-brand">تطبيق</button>
              </div>
              {couponMessage && <p className="mt-2 text-xs font-bold text-muted-foreground">{couponMessage}</p>}
              <button type="button" onClick={placeOrder} disabled={busy || !items.length} className="mt-6 h-12 w-full rounded-xl bg-brand text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-neutral-300">{busy ? "جارٍ إنشاء الطلب والدفع..." : "تأكيد الطلب والدفع"}</button>
            </aside>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
