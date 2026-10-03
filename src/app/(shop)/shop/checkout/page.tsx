"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  MapPin,
  Package,
  ShieldCheck,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { useCartStore } from "@/stores/cart-store";
import type { CustomerAddress } from "@/features/addresses/types/address.types";
import { getMyAddresses } from "@/features/addresses/services/address-api.service";
import { useSession } from "@/features/auth/session";
import { useRouter } from "next/navigation";
import { CheckoutAddressSelector } from "@/components/checkout/CheckoutAddressSelector";
import { CouponInput } from "@/components/checkout/CouponInput";
import type { AppliedCoupon } from "@/features/coupons/types/coupon.types";
import {
  createBackendOrder,
  getBackendCart,
  mapBackendCartToLocal,
  processBackendPayment,
  replaceBackendCart,
  type BackendPayment,
} from "@/features/commerce/services/checkout-api.service";

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
}

const initialForm: FormState = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  postalCode: "",
};

export default function CheckoutPage() {
  const items = useCartStore(
    (state) => state.items,
  );

  const clearCart = useCartStore(
    (state) => state.clearCart,
  );
  const replaceItems = useCartStore(
    (state) => state.replaceItems,
  );

  const session = useSession();
  const router = useRouter();

  const [form, setForm] =
    useState<FormState>(initialForm);

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] =
    useState("card");

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [serverCartTotal, setServerCartTotal] =
    useState<number | null>(null);
  const [serverCartCurrency, setServerCartCurrency] =
    useState<string | undefined>(undefined);

  const [error, setError] =
    useState("");

  const [successOrderId, setSuccessOrderId] =
    useState("");
  const idempotencyKeyRef = useRef<string | null>(null);
  const [successPaymentStatus, setSuccessPaymentStatus] =
    useState<BackendPayment["status"]>("PENDING");

  useEffect(() => {
    if (session.status !== "authenticated") {
      return;
    }

    let active = true;

    const syncBackendCart = async () => {
      try {
        const localItems = useCartStore.getState().items;
        const backend = await getBackendCart();

        if (!active) return;

        if (backend.items.length === 0 && localItems.length > 0) {
          const migrated = await replaceBackendCart(localItems);
          if (!active) return;
          const mapped = mapBackendCartToLocal(migrated, localItems);
          replaceItems(mapped);
          setServerCartTotal(migrated.totalPrice);
          setServerCartCurrency(
            migrated.currency ?? mapped[0]?.currency,
          );
          return;
        }

        const mapped = mapBackendCartToLocal(backend, localItems);
        replaceItems(mapped);
        setServerCartTotal(backend.totalPrice);
        setServerCartCurrency(
          backend.currency ?? mapped[0]?.currency,
        );
      } catch (caughtError) {
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "تعذر مزامنة السلة مع الخادم.",
          );
        }
      }
    };

    void syncBackendCart();

    return () => {
      active = false;
    };
  }, [session.status, replaceItems]);

  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.replace("/login?next=/shop/checkout");
      return;
    }

    if (session.status !== "authenticated") return;

    getMyAddresses()
      .then((nextAddresses) => {
        setAddresses(nextAddresses);
        const defaultAddress = nextAddresses.find((address) => address.isDefault) ?? nextAddresses[0];
        if (!defaultAddress) return;
        setSelectedAddressId(defaultAddress.id);
        setForm((current) => ({
          ...current,
          fullName: defaultAddress.recipientName,
          phone: defaultAddress.phone,
          address: [
            defaultAddress.street,
            defaultAddress.building,
            defaultAddress.apartment ? `Apt ${defaultAddress.apartment}` : "",
            defaultAddress.area,
          ].filter(Boolean).join(", "),
          city: defaultAddress.city,
          country: defaultAddress.country,
          postalCode: defaultAddress.postalCode ?? "",
        }));
      })
      .catch(() => {
        setAddresses([]);
      });
  }, [router, session.status, session.user?.email]);

  const effectiveEmail = form.email || session.user?.email || "";

  if (session.status !== "authenticated") {
    return (
      <AppShell>
        <main className="min-h-screen bg-background">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center text-body-sm text-muted-foreground">
            جارٍ التحقق من الحساب...
          </div>
        </main>
      </AppShell>
    );
  }

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const cartSubtotal =
    serverCartTotal ?? subtotal;

  const couponDiscount =
    appliedCoupon?.finalDiscount ?? 0;

  const total = Math.max(
    0,
    cartSubtotal - couponDiscount,
  );

  const setField = (
    key: keyof FormState,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const validate = () => {
    const required: Array<
      keyof FormState
    > = [
      "fullName",
      "phone",
      "address",
      "city",
      "country",
    ];

    return required.every(
      (field) =>
        field === "email"
          ? effectiveEmail.trim().length > 0
          : form[field].trim().length > 0,
    );
  };

  const placeOrder = async () => {
    setError("");

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!validate()) {
      setError("Please complete all required shipping information.");
      return;
    }

    try {
      const synchronizedCart = await replaceBackendCart(items);
      const synchronizedItems = mapBackendCartToLocal(
        synchronizedCart,
        items,
      );
      replaceItems(synchronizedItems);
      setServerCartTotal(synchronizedCart.totalPrice);
      setServerCartCurrency(
        synchronizedCart.currency ??
          synchronizedItems[0]?.currency ??
          "USD",
      );

      idempotencyKeyRef.current ??= crypto.randomUUID();

      const order = await createBackendOrder({
        idempotencyKey: idempotencyKeyRef.current,
        shippingAddress: [
          form.fullName,
          form.phone,
          form.address,
          form.city,
          form.country,
          form.postalCode,
        ].filter(Boolean).join(", "),
        couponCode: appliedCoupon?.coupon.code,
      });

      const backendPaymentMethod =
        paymentMethod === "cod"
          ? "CASH_ON_DELIVERY"
          : paymentMethod === "wallet"
            ? "PAYPAL"
            : "CREDIT_CARD";

      // The backend order creation consumes the persisted cart. Clear the
      // local presentation copy immediately so a later retry cannot recreate
      // a cart that no longer exists server-side.
      replaceItems([]);

      const payment = await processBackendPayment({
        orderId: order.id,
        amount: order.totalAmount,
        method: backendPaymentMethod,
      });

      clearCart();
      setSuccessOrderId(String(order.id));
      setSuccessPaymentStatus(payment.status);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to place the order. Please try again.";
      setError(message);
    }
  };

  if (successOrderId) {
    return (
      <AppShell>
        <main className="min-h-screen bg-background">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">

            <section className="rounded-3xl border border-neutral-200 bg-surface p-8 text-center shadow-sm sm:p-12">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success-surface text-success-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <p className="mt-6 text-[10px] font-black uppercase tracking-[0.18em] text-success-600">
                Order confirmed
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-ink">
                Thank you for your order
              </h1>

              <p className="mt-3 text-sm leading-6 text-neutral-500">
                Your order has been created and the payment status below comes directly
                from the payment service. Tracking appears after fulfillment begins.
              </p>

              <div className="mx-auto mt-7 max-w-md rounded-2xl bg-neutral-50 p-5 text-start">

                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">
                    Order number
                  </span>

                  <span className="text-sm font-black text-brand-ink">
                    {successOrderId}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-neutral-400">
                    Payment
                  </span>

                  <span className="rounded-full bg-success-surface px-2.5 py-1 text-[10px] font-black text-success-700">
                    {successPaymentStatus === "COMPLETED"
                      ? "PAID"
                      : successPaymentStatus === "FAILED"
                        ? "FAILED"
                        : "PENDING"}
                  </span>
                </div>

              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">

                <Link
                  href="/buyer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-black text-white"
                >
                  View my orders
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/shop/products"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 px-5 text-sm font-bold text-neutral-700"
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
      <main className="min-h-screen bg-background">

        <section className="border-b border-neutral-200 bg-surface">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">

            <Link
              href="/shop/cart"
              className="inline-flex items-center gap-2 text-xs font-black text-brand"
            >
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              Back to cart
            </Link>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-brand-ink sm:text-4xl">
              Checkout
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
              One secure payment for your order.
            </p>

          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">

          {items.length === 0 ? (
            <section className="rounded-2xl border border-dashed border-neutral-300 bg-surface p-12 text-center">

              <Package className="mx-auto h-8 w-8 text-neutral-300" />

              <h2 className="mt-5 text-xl font-black text-foreground">
                Your cart is empty
              </h2>

              <Link
                href="/shop/products"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-black text-white"
              >
                Browse products
                <ArrowRight className="h-4 w-4" />
              </Link>

            </section>
          ) : (
            <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_380px]">

              <div className="space-y-6">

                {/* Saved addresses */}
                          <CheckoutAddressSelector
                  addresses={addresses}
                  selectedAddressId={selectedAddressId}
                  onSelect={(selected) => {
                    setSelectedAddressId(selected.id);
                    setForm((current) => ({
                      ...current,
                      fullName: selected.recipientName,
                      phone: selected.phone,
                      address: [
                        selected.street,
                        selected.building,
                        selected.apartment ? `Apt ${selected.apartment}` : "",
                        selected.area,
                      ].filter(Boolean).join(", "),
                      city: selected.city,
                      country: selected.country,
                      postalCode: selected.postalCode ?? "",
                    }));
                  }}
                />

                {/* Contact */}
                <section className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm">

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info-surface text-brand">
                      <MapPin className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-lg font-black text-foreground">
                        Delivery information
                      </h2>

                      <p className="mt-1 text-xs text-neutral-400">
                        Where should we deliver your order?
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="full-name"
                        className="text-xs font-black text-neutral-600"
                      >
                        Full name *
                      </label>

                      <input
                        id="full-name"
                        value={
                          form.fullName
                        }
                        onChange={(
                          event,
                        ) =>
                          setField(
                            "fullName",
                            event.target.value,
                          )
                        }
                        className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-primary-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="text-xs font-black text-neutral-600"
                      >
                        Email *
                      </label>

                      <input
                        id="email"
                        type="email"
                        value={
                          form.email || session.user?.email || ""
                        }
                        onChange={(
                          event,
                        ) =>
                          setField(
                            "email",
                            event.target.value,
                          )
                        }
                        className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-primary-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="text-xs font-black text-neutral-600"
                      >
                        Phone *
                      </label>

                      <input
                        id="phone"
                        type="tel"
                        value={
                          form.phone
                        }
                        onChange={(
                          event,
                        ) =>
                          setField(
                            "phone",
                            event.target.value,
                          )
                        }
                        className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-primary-100"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="address"
                        className="text-xs font-black text-neutral-600"
                      >
                        Address *
                      </label>

                      <input
                        id="address"
                        value={
                          form.address
                        }
                        onChange={(
                          event,
                        ) =>
                          setField(
                            "address",
                            event.target.value,
                          )
                        }
                        className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-primary-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="city"
                        className="text-xs font-black text-neutral-600"
                      >
                        City *
                      </label>

                      <input
                        id="city"
                        value={
                          form.city
                        }
                        onChange={(
                          event,
                        ) =>
                          setField(
                            "city",
                            event.target.value,
                          )
                        }
                        className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-primary-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="country"
                        className="text-xs font-black text-neutral-600"
                      >
                        Country *
                      </label>

                      <input
                        id="country"
                        value={
                          form.country
                        }
                        onChange={(
                          event,
                        ) =>
                          setField(
                            "country",
                            event.target.value,
                          )
                        }
                        className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-primary-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="postal-code"
                        className="text-xs font-black text-neutral-600"
                      >
                        Postal code
                      </label>

                      <input
                        id="postal-code"
                        value={
                          form.postalCode
                        }
                        onChange={(
                          event,
                        ) =>
                          setField(
                            "postalCode",
                            event.target.value,
                          )
                        }
                        className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-primary-100"
                      />
                    </div>

                  </div>
                </section>

                {/* Payment */}
                <section className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm">

                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-brand" />

                    <div>
                      <h2 className="text-lg font-black text-foreground">
                        Payment
                      </h2>

                      <p className="mt-1 text-xs text-neutral-400">
                        Choose how you&apos;d like to pay.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">

                    {[
                      {
                        value: "card",
                        label: "Credit / Debit Card",
                      },
                      {
                        value: "wallet",
                        label: "PayPal",
                      },
                      {
                        value: "cod",
                        label: "Cash on Delivery",
                      },
                    ].map(
                      (option) => (
                        <button
                          key={
                            option.value
                          }
                          type="button"
                          onClick={() =>
                            setPaymentMethod(
                              option.value,
                            )
                          }
                          className={`rounded-2xl border p-4 text-start transition ${
                            paymentMethod ===
                            option.value
                              ? "border-[#2563EB] bg-info-surface"
                              : "border-neutral-200 hover:bg-neutral-50"
                          }`}
                        >
                          <p className="text-xs font-black text-foreground">
                            {option.label}
                          </p>
                        </button>
                      ),
                    )}

                  </div>

                </section>

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-danger-100 bg-danger-surface px-4 py-3 text-sm font-bold text-danger-700"
                  >
                    {error}
                  </div>
                )}

              </div>

              {/* Summary */}
              <aside className="h-fit rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm xl:sticky xl:top-24">

                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-brand" />

                  <h2 className="text-lg font-black text-foreground">
                    Your order
                  </h2>
                </div>

                <div className="mt-6 space-y-2">

                  {items.map(
                    (item) => (
                      <div
                        key={`${item.productId}-${item.variantId ?? "default"}`}
                        className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 p-3"
                      >
                        <p className="min-w-0 truncate text-xs font-bold text-neutral-700">
                          {item.name}{" "}
                          <span className="text-neutral-400">
                            × {item.quantity}
                          </span>
                        </p>

                        <p className="shrink-0 text-xs font-black text-foreground">
                          <LocalizedPrice
                            amountUSD={item.price * item.quantity}
                            currency={item.currency ?? serverCartCurrency}
                          />
                        </p>
                      </div>
                    ),
                  )}

                </div>

                <div className="mt-5 rounded-xl bg-neutral-50 p-3 text-[11px] text-neutral-400">
                  Shipping is calculated and confirmed by the backend when the
                  order is created.
                </div>

                <div className="mt-5">
                  <CouponInput
                    subtotal={cartSubtotal}
                    onApply={setAppliedCoupon}
                    onRemove={() => setAppliedCoupon(null)}
                  />
                </div>

                <div className="mt-6 space-y-3 border-t border-neutral-100 pt-5">

                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">
                      Subtotal
                    </span>

                    <LocalizedPrice
                      amountUSD={cartSubtotal}
                      currency={serverCartCurrency}
                      className="font-bold text-neutral-800"
                    />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">
                      Shipping
                    </span>

                    <span className="font-bold text-neutral-800">
                      Confirmed by backend at order creation
                    </span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">
                        Discount
                      </span>

                      <span className="font-bold text-success-600">
                        −<LocalizedPrice
                          amountUSD={couponDiscount}
                          currency={serverCartCurrency}
                        />
                      </span>
                    </div>
                  )}

                </div>

                <div className="mt-5 border-t border-neutral-100 pt-5">

                  <div className="flex items-end justify-between">

                    <span className="text-sm font-bold text-neutral-500">
                      Total
                    </span>

                    <LocalizedPrice
                      amountUSD={total}
                      currency={serverCartCurrency}
                      className="text-3xl font-black text-brand-ink"
                    />

                  </div>

                </div>

                <button
                  type="button"
                  onClick={placeOrder}
                  className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-black text-white transition hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                >
                  <LockKeyhole className="h-4 w-4" />
                  Place order
                </button>

                <div className="mt-4 rounded-xl bg-success-surface p-3">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-success-600" />

                    <p className="text-[11px] leading-5 text-success-700">
                      Your payment is processed securely by ALI STORE.
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