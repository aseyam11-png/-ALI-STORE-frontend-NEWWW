"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { CheckoutAddressSelector } from "@/components/checkout/CheckoutAddressSelector";
import { CouponInput } from "@/components/checkout/CouponInput";
import { useAddressStore } from "@/stores/address-store";
import { useCartStore } from "@/stores/cart-store";
import { useSession } from "@/features/auth/session";
import {
  getBackendCart,
  mapBackendCart,
  synchronizeCart,
} from "@/features/cart/services/cart-api.service";
import {
  createBackendOrder,
  type BackendOrder,
} from "@/features/orders/services/order-api.service";
import {
  getBackendPaymentByOrderId,
  processBackendPayment,
  type BackendPayment,
} from "@/features/payments/services/payment-api.service";
import type { AppliedCoupon } from "@/features/coupons/types/coupon.types";

interface FormState {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
}

const initialForm: FormState = {
  fullName: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  postalCode: "",
};

type PaymentChoice = "card" | "paypal" | "cod";

function mapPaymentMethod(choice: PaymentChoice): BackendPayment["method"] {
  switch (choice) {
    case "paypal":
      return "PAYPAL";
    case "cod":
      return "CASH_ON_DELIVERY";
    default:
      return "CREDIT_CARD";
  }
}

function formatShippingAddress(form: FormState): string {
  return [
    form.fullName.trim(),
    form.phone.trim(),
    form.address.trim(),
    form.city.trim(),
    form.country.trim(),
    form.postalCode.trim(),
  ]
    .filter(Boolean)
    .join(", ");
}

function mapOrderError(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return "تعذر إكمال الطلب. لم يتم تأكيد عملية الدفع.";
}

export default function CheckoutPage() {
  const session = useSession();

  const localItems = useCartStore((state) => state.items);
  const replaceItems = useCartStore((state) => state.replaceItems);
  const clearCart = useCartStore((state) => state.clearCart);

  const addresses = useAddressStore((state) => state.addresses);
  const selectedAddressId = useAddressStore(
    (state) => state.selectedAddressId,
  );

  const [form, setForm] = useState<FormState>(() => {
    const state = useAddressStore.getState();
    const initialAddress =
      state.addresses.find((address) => address.id === state.selectedAddressId) ??
      state.addresses.find((address) => address.isDefault) ??
      state.addresses[0];

    if (!initialAddress) {
      return initialForm;
    }

    return {
      ...initialForm,
      fullName: initialAddress.recipientName,
      phone: initialAddress.phone,
      address: [
        initialAddress.street,
        initialAddress.building ? `Building ${initialAddress.building}` : "",
        initialAddress.apartment ? `Apt ${initialAddress.apartment}` : "",
        initialAddress.area,
      ]
        .filter(Boolean)
        .join(", "),
      city: initialAddress.city,
      country: initialAddress.country,
      postalCode: initialAddress.postalCode ?? "",
    };
  });
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentChoice>("card");
  const [appliedCoupon, setAppliedCoupon] =
    useState<AppliedCoupon | null>(null);
  const [serverCartTotal, setServerCartTotal] = useState(0);
  const [serverCurrency, setServerCurrency] = useState("USD");
  const [syncing, setSyncing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<BackendOrder | null>(null);
  const [payment, setPayment] = useState<BackendPayment | null>(null);

  useEffect(() => {
    if (session.status !== "authenticated") {
      return;
    }

    let cancelled = false;

    const sync = async () => {
      setSyncing(true);
      setError("");

      try {
        const currentLocalItems = useCartStore.getState().items;
        const backend = await synchronizeCart(currentLocalItems);

        if (cancelled) {
          return;
        }

        const mapped = mapBackendCart(backend, currentLocalItems);
        replaceItems(mapped);
        setServerCartTotal(Number(backend.totalPrice ?? 0));
        setServerCurrency(backend.currency ?? mapped[0]?.currency ?? "USD");
      } catch (syncError) {
        if (!cancelled) {
          setError(mapOrderError(syncError));
        }
      } finally {
        if (!cancelled) {
          setSyncing(false);
        }
      }
    };

    void sync();

    return () => {
      cancelled = true;
    };
  }, [session.status, replaceItems]);

  const setField = (key: keyof FormState, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const validForm = useMemo(
    () =>
      [
        form.fullName,
        form.phone,
        form.address,
        form.city,
        form.country,
      ].every((value) => value.trim().length > 0),
    [form],
  );

  const paymentLabel =
    payment?.method === "CASH_ON_DELIVERY"
      ? "Cash on Delivery"
      : payment?.method === "PAYPAL"
        ? "PayPal"
        : "Credit / Debit Card";

  const paymentMessage =
    payment?.status === "COMPLETED"
      ? "Payment confirmed successfully."
      : payment?.status === "PENDING"
        ? "Order accepted. Payment is pending collection/confirmation."
        : "Payment requires further action.";

  const placeOrder = async () => {
    setError("");

    if (session.status !== "authenticated") {
      setError("سجّل الدخول أولًا لإكمال الطلب.");
      return;
    }

    if (localItems.length === 0) {
      setError("السلة فارغة.");
      return;
    }

    if (!validForm) {
      setError("أكمل بيانات التسليم المطلوبة.");
      return;
    }

    setSubmitting(true);

    try {
      const latestLocalItems = useCartStore.getState().items;
      const backendCart = await synchronizeCart(latestLocalItems);
      const mappedItems = mapBackendCart(backendCart, latestLocalItems);
      replaceItems(mappedItems);
      setServerCartTotal(Number(backendCart.totalPrice ?? 0));
      setServerCurrency(
        backendCart.currency ?? mappedItems[0]?.currency ?? "USD",
      );

      if (backendCart.items.length === 0) {
        throw new Error("السلة على الخادم فارغة. أضف المنتجات ثم حاول مرة أخرى.");
      }

      const createdOrder = await createBackendOrder({
        shippingAddress: formatShippingAddress(form),
        couponCode: appliedCoupon?.coupon.code,
      });

      setOrder(createdOrder);

      try {
        const processedPayment = await processBackendPayment({
          orderId: createdOrder.id,
          amount: Number(createdOrder.totalAmount),
          method: mapPaymentMethod(paymentMethod),
        });

        setPayment(processedPayment);

        const paymentAccepted =
          processedPayment.status === "COMPLETED" ||
          processedPayment.method === "CASH_ON_DELIVERY";

        if (paymentAccepted) {
          clearCart();
          const freshCart = await getBackendCart().catch(() => null);
          if (freshCart) {
            setServerCartTotal(Number(freshCart.totalPrice ?? 0));
          }
        }
      } catch (paymentError) {
        // A provider timeout can leave a durable PENDING/REQUIRES_RECONCILIATION
        // record. Never recreate the order/cart until that server state is known.
        const recordedPayment = await getBackendPaymentByOrderId(
          String(createdOrder.id),
        ).catch(() => null);

        if (recordedPayment) {
          setPayment(recordedPayment);
          if (
            recordedPayment.status === "REQUIRES_RECONCILIATION" ||
            recordedPayment.status === "PENDING"
          ) {
            setError(
              "تم إنشاء الطلب، لكن نتيجة الدفع لم تُحسم بعد. لا تعِد المحاولة حتى تتم تسوية الدفعة.",
            );
            return;
          }
        }

        throw paymentError;
      }
    } catch (orderError) {
      setError(mapOrderError(orderError));
    } finally {
      setSubmitting(false);
    }
  };

  if (session.status === "loading") {
    return (
      <AppShell>
        <main className="min-h-screen bg-[#F8FAFC] p-8">
          <div className="mx-auto h-96 max-w-[1200px] animate-pulse rounded-3xl bg-white" />
        </main>
      </AppShell>
    );
  }

  if (session.status === "unauthenticated") {
    return (
      <AppShell>
        <main className="min-h-screen bg-[#F8FAFC]">
          <div className="mx-auto max-w-3xl px-4 py-16">
            <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <ShieldCheck className="mx-auto h-10 w-10 text-[#2563EB]" />
              <h1 className="mt-5 text-3xl font-black text-[#0F172A]">
                سجّل الدخول لإكمال الدفع
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
                Cart and checkout are tied to your secure ALI STORE account so
                prices, inventory, order ownership, and payment status remain
                server-authoritative.
              </p>
              <Link
                href="/login"
                className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-6 text-sm font-black text-white"
              >
                تسجيل الدخول
                <ArrowRight className="h-4 w-4" />
              </Link>
            </section>
          </div>
        </main>
      </AppShell>
    );
  }

  if (order && payment) {
    return (
      <AppShell>
        <main className="min-h-screen bg-[#F8FAFC]">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <p className="mt-6 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
                Order created
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-[#0F172A]">
                Thank you for your order
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {paymentMessage}
              </p>

              <div className="mx-auto mt-7 max-w-md rounded-2xl bg-slate-50 p-5 text-start">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Order number
                  </span>
                  <span className="text-sm font-black text-[#0F2747]">
                    #{order.id}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Total</span>
                  <span className="text-sm font-black text-[#0F2747]">
                    <LocalizedPrice
                      amountUSD={Number(order.totalAmount)}
                      currency={order.currency}
                    />
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Payment</span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                    {payment.status}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Method</span>
                  <span className="text-xs font-bold text-slate-700">
                    {paymentLabel}
                  </span>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/buyer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-black text-white"
                >
                  View my orders
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/shop/products"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700"
                >
                  Continue shopping
                </Link>
              </div>
            </section>
          </div>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
            <Link
              href="/shop/cart"
              className="inline-flex items-center gap-2 text-xs font-black text-[#2563EB]"
            >
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              Back to cart
            </Link>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl">
              Checkout
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Final price, inventory, order total, and payment state are
              confirmed by the ALI STORE backend.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
          {syncing ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <p className="text-sm font-bold text-slate-600">
                Syncing your cart with the server…
              </p>
            </section>
          ) : localItems.length === 0 ? (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Package className="mx-auto h-8 w-8 text-slate-300" />
              <h2 className="mt-5 text-xl font-black text-slate-900">
                Your cart is empty
              </h2>
              <Link
                href="/shop/products"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-black text-white"
              >
                Browse products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </section>
          ) : (
            <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_380px]">
              <div className="space-y-6">
                <CheckoutAddressSelector
                  onAddressChange={(addressId) => {
                    const selected = addresses.find(
                      (address) => address.id === addressId,
                    );
                    if (!selected) return;

                    setForm((current) => ({
                      ...current,
                      fullName: selected.recipientName,
                      phone: selected.phone,
                      address: [
                        selected.street,
                        selected.building
                          ? `Building ${selected.building}`
                          : "",
                        selected.apartment
                          ? `Apt ${selected.apartment}`
                          : "",
                        selected.area,
                      ]
                        .filter(Boolean)
                        .join(", "),
                      city: selected.city,
                      country: selected.country,
                      postalCode: selected.postalCode ?? "",
                    }));
                  }}
                />

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-[#2563EB]" />
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Delivery information
                      </h2>
                      <p className="mt-1 text-xs text-slate-400">
                        The backend stores this address with the order snapshot.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {(
                      [
                        ["fullName", "Full name"],
                                        ["phone", "Phone"],
                        ["address", "Address"],
                        ["city", "City"],
                        ["country", "Country"],
                        ["postalCode", "Postal code"],
                      ] as Array<[keyof FormState, string]>
                    ).map(([field, label]) => (
                      <div
                        key={field}
                        className={field === "address" ? "sm:col-span-2" : ""}
                      >
                        <label
                          htmlFor={`checkout-${field}`}
                          className="text-xs font-black text-slate-600"
                        >
                          {label}
                          {field !== "postalCode" ? " *" : ""}
                        </label>
                        <input
                          id={`checkout-${field}`}
                          type={field === "email" ? "email" : "text"}
                          value={form[field]}
                          onChange={(event) =>
                            setField(field, event.target.value)
                          }
                          className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100"
                        />
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-emerald-600" />
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Delivery
                      </h2>
                      <p className="mt-1 text-xs text-slate-400">
                        Shipping pricing and delivery estimates are not
                        fabricated in the browser.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm font-black text-slate-900">
                      Standard delivery
                    </p>
                    <p className="mt-1 text-xs leading-6 text-slate-500">
                      Shipping is currently confirmed by the backend order
                      contract. No client-side express surcharge is applied.
                    </p>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-[#2563EB]" />
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Payment
                      </h2>
                      <p className="mt-1 text-xs text-slate-400">
                        Payment is processed by the backend payment boundary.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {(
                      [
                        ["card", "Credit / Debit Card"],
                        ["paypal", "PayPal"],
                        ["cod", "Cash on Delivery"],
                      ] as Array<[PaymentChoice, string]>
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPaymentMethod(value)}
                        className={`rounded-2xl border p-4 text-start transition ${
                          paymentMethod === value
                            ? "border-[#2563EB] bg-blue-50"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <p className="text-xs font-black text-slate-900">
                          {label}
                        </p>
                      </button>
                    ))}
                  </div>
                </section>

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
                  >
                    {error}
                  </div>
                )}
              </div>

              <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:sticky xl:top-24">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-[#2563EB]" />
                  <h2 className="text-lg font-black text-slate-900">
                    Your order
                  </h2>
                </div>

                <div className="mt-6 space-y-2">
                  {localItems.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId ?? "default"}`}
                      className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"
                    >
                      <p className="min-w-0 truncate text-xs font-bold text-slate-700">
                        {item.name}{" "}
                        <span className="text-slate-400">
                          × {item.quantity}
                        </span>
                      </p>
                      <p className="shrink-0 text-xs font-black text-slate-900">
                        <LocalizedPrice
                          amountUSD={item.price * item.quantity}
                          currency={item.currency ?? serverCurrency}
                        />
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <CouponInput
                    subtotal={serverCartTotal}
                    onApply={setAppliedCoupon}
                    onRemove={() => setAppliedCoupon(null)}
                  />
                  <p className="mt-2 text-[10px] leading-5 text-slate-400">
                    Coupon eligibility and the final discount are revalidated
                    by the server when the order is created.
                  </p>
                </div>

                <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Cart total</span>
                    <LocalizedPrice
                      amountUSD={serverCartTotal}
                      currency={serverCurrency}
                      className="font-bold text-slate-800"
                    />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Shipping</span>
                    <span className="font-bold text-slate-800">
                      Confirmed at order creation
                    </span>
                  </div>

                  {appliedCoupon && appliedCoupon.finalDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Coupon preview</span>
                      <span className="font-bold text-emerald-600">
                        −
                        <LocalizedPrice
                          amountUSD={appliedCoupon.finalDiscount}
                          currency={serverCurrency}
                        />
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={submitting || syncing}
                  className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] text-sm font-black text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <LockKeyhole className="h-4 w-4" />
                  {submitting ? "Processing…" : "Place order"}
                </button>

                <div className="mt-4 rounded-xl bg-emerald-50 p-3">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600" />
                    <p className="text-[11px] leading-5 text-emerald-700">
                      The server is the source of truth for inventory, order
                      totals, payment status, and fulfillment eligibility.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
