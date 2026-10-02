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
import { useCartStore } from "@/stores/cart-store";
import { useCustomerStore } from "@/stores/customer-store";
import { useAddressStore } from "@/stores/address-store";
import { CheckoutAddressSelector } from "@/components/checkout/CheckoutAddressSelector";
import { CouponInput } from "@/components/checkout/CouponInput";
import type { AppliedCoupon } from "@/features/coupons/types/coupon.types";
import { replaceBackendCart } from "@/features/cart/services/cart-api.service";
import { createBackendOrder } from "@/features/orders/services/order-api.service";
import { processBackendPayment } from "@/features/payments/services/payment-api.service";
import { getShippingQuote, type ShippingQuote } from "@/features/shipping/services/shipping-api.service";


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

  const shipping = useCartStore(
    (state) =>
      state.getShippingInfo(),
  );

  const clearCart = useCartStore(
    (state) => state.clearCart,
  );

  const getDefaultAddress = useCustomerStore(
    (state) => state.getDefaultAddress,
  );

  const selectedAddressId = useAddressStore(
    (state) => state.selectedAddressId,
  );

  const addresses = useAddressStore(
    (state) => state.addresses,
  );

  const [form, setForm] =
    useState<FormState>(
      initialForm,
    );

  const [paymentMethod, setPaymentMethod] =
    useState<"CREDIT_CARD" | "PAYPAL" | "CASH_ON_DELIVERY">("CREDIT_CARD");

  const [shippingMode, setShippingMode] =
    useState<"STANDARD" | "EXPRESS">("STANDARD");

  const [shippingQuote, setShippingQuote] =
    useState<ShippingQuote | null>(null);

  const [quoteLoading, setQuoteLoading] =
    useState(false);

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  const [error, setError] =
    useState("");

  const defaultAddress = getDefaultAddress();

  const selectedAddress = addresses.find(
    (address) =>
      address.id === selectedAddressId,
  );

  const addressSyncKey =
    selectedAddress?.id ??
    (defaultAddress ? `default:${defaultAddress.fullName}` : null);

  const [syncedAddressKey, setSyncedAddressKey] =
    useState<string | null>(null);

  if (addressSyncKey !== syncedAddressKey) {
    setSyncedAddressKey(addressSyncKey);

    if (selectedAddress) {
      setForm((current) => ({
        fullName:
          selectedAddress.recipientName,
        email:
          current.email,
        phone:
          selectedAddress.phone,
        address:
          [
            selectedAddress.street,
            selectedAddress.building
              ? `Building ${selectedAddress.building}`
              : "",
            selectedAddress.apartment
              ? `Apt ${selectedAddress.apartment}`
              : "",
            selectedAddress.area,
          ]
            .filter(Boolean)
            .join(", "),
        city:
          selectedAddress.city,
        country:
          selectedAddress.country,
        postalCode:
          selectedAddress.postalCode ?? "",
      }));
    } else if (defaultAddress) {
      setForm((current) => ({
        ...current,
        fullName:
          current.fullName ||
          defaultAddress.fullName,
        phone:
          current.phone ||
          defaultAddress.phone,
        address:
          current.address ||
          defaultAddress.addressLine1,
        city:
          current.city ||
          defaultAddress.city,
        country:
          current.country ||
          defaultAddress.country,
        postalCode:
          current.postalCode ||
          defaultAddress.postalCode ||
          "",
      }));
    }
  }

  const [successOrderId, setSuccessOrderId] =
    useState("");

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          item.price *
            item.quantity,
        0,
      ),
    [items],
  );

  const couponDiscount =
    appliedCoupon?.finalDiscount ?? 0;

  useEffect(() => {
    let cancelled = false;

    if (items.length === 0) {
      setShippingQuote(null);
      return;
    }

    setQuoteLoading(true);
    void getShippingQuote(
      Math.max(0, subtotal - couponDiscount),
      shippingMode,
    )
      .then((quote) => {
        if (!cancelled) setShippingQuote(quote);
      })
      .catch(() => {
        if (!cancelled) setShippingQuote(null);
      })
      .finally(() => {
        if (!cancelled) setQuoteLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [items.length, subtotal, couponDiscount, shippingMode]);

  const shippingCost = Number(shippingQuote?.amount ?? 0);

  const total =
    Math.max(
      0,
      subtotal +
        shippingCost -
        couponDiscount,
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
      "email",
      "phone",
      "address",
      "city",
      "country",
    ];

    return required.every(
      (field) =>
        form[field].trim().length > 0,
    );
  };

  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"PENDING" | "COMPLETED" | "FAILED">("PENDING");

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

    if (!shippingQuote || quoteLoading) {
      setError("جاري تحديث تكلفة الشحن. حاول مرة أخرى بعد لحظة.");
      return;
    }

    setPlacingOrder(true);

    try {
      const backendItems = items.map((item) => {
        const productId = Number(item.productId);
        if (!Number.isInteger(productId) || productId <= 0) {
          throw new Error("يوجد منتج قديم في السلة. أعد إضافة المنتج من الكتالوج.");
        }
        return {
          productId,
          quantity: Math.max(1, Math.floor(item.quantity)),
        };
      });

      await replaceBackendCart(backendItems);

      const shippingAddress = [
        form.fullName,
        form.phone,
        form.address,
        form.city,
        form.country,
        form.postalCode,
      ].filter(Boolean).join(", ");

      const order = await createBackendOrder({
        shippingAddress,
        couponCode: appliedCoupon?.coupon.code,
        shippingMethod: shippingMode,
      });

      const payment = await processBackendPayment({
        orderId: order.id,
        amount: Number(order.totalAmount),
        method: paymentMethod,
      });

      setPaymentStatus(payment.status);
      setSuccessOrderId(String(order.id));
      clearCart();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذر إتمام الطلب.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (successOrderId) {
    return (
      <AppShell>
        <main className="min-h-screen bg-[#F8FAFC]">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">

            <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <p className="mt-6 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
                Order confirmed
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-[#0F172A]">
                Thank you for your order
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {paymentStatus === "COMPLETED"
                  ? "تم تأكيد الدفع. سنرسل معلومات التتبع عند بدء الشحن."
                  : paymentStatus === "PENDING"
                    ? "تم إنشاء الطلب، والدفع قيد المعالجة. سنحدّث الحالة فور تأكيد العملية."
                    : "تم إنشاء الطلب، لكن الدفع لم يكتمل."}
              </p>

              <div className="mx-auto mt-7 max-w-md rounded-2xl bg-slate-50 p-5 text-start">

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Order number
                  </span>

                  <span className="text-sm font-black text-[#0F2747]">
                    {successOrderId}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Payment
                  </span>

                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                    PAID
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
              One secure payment for your order.
            </p>

          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">

          {items.length === 0 ? (
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

                {/* Saved addresses */}
                <CheckoutAddressSelector
                  onAddressChange={(addressId) => {
                    const selected =
                      addresses.find(
                        (address) =>
                          address.id ===
                          addressId,
                      );

                    if (!selected) {
                      return;
                    }

                    setForm((current) => ({
                      ...current,
                      fullName:
                        selected.recipientName,
                      phone:
                        selected.phone,
                      address:
                        [
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
                      city:
                        selected.city,
                      country:
                        selected.country,
                      postalCode:
                        selected.postalCode ??
                        "",
                    }));
                  }}
                />

                {/* Contact */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                      <MapPin className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Delivery information
                      </h2>

                      <p className="mt-1 text-xs text-slate-400">
                        Where should we deliver your order?
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="full-name"
                        className="text-xs font-black text-slate-600"
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
                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="text-xs font-black text-slate-600"
                      >
                        Email *
                      </label>

                      <input
                        id="email"
                        type="email"
                        value={
                          form.email
                        }
                        onChange={(
                          event,
                        ) =>
                          setField(
                            "email",
                            event.target.value,
                          )
                        }
                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="text-xs font-black text-slate-600"
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
                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="address"
                        className="text-xs font-black text-slate-600"
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
                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="city"
                        className="text-xs font-black text-slate-600"
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
                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="country"
                        className="text-xs font-black text-slate-600"
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
                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="postal-code"
                        className="text-xs font-black text-slate-600"
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
                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                  </div>
                </section>

                {/* Shipping */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-emerald-600" />

                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Delivery speed
                      </h2>

                      <p className="mt-1 text-xs text-slate-400">
                        Applied to your entire order.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">

                    <button
                      type="button"
                      onClick={() => setShippingMode("STANDARD")}
                      className={`rounded-2xl border p-4 text-start transition ${
                        shippingMode === "STANDARD"
                          ? "border-[#2563EB] bg-blue-50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <p className="text-sm font-black text-slate-900">
                        Standard
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Best available rate
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShippingMode("EXPRESS")}
                      className={`rounded-2xl border p-4 text-start transition ${
                        shippingMode === "EXPRESS"
                          ? "border-[#2563EB] bg-blue-50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <p className="text-sm font-black text-slate-900">
                        Express
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        أسرع توصيل — {shippingQuote
                          ? (shippingQuote.free
                            ? "مجاني"
                            : "+" + shippingQuote.amount + " " + shippingQuote.currency)
                          : "جاري الحساب…"}
                      </p>
                    </button>

                  </div>

                </section>

                {/* Payment */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-[#2563EB]" />

                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Payment
                      </h2>

                      <p className="mt-1 text-xs text-slate-400">
                        Choose how you&apos;d like to pay.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">

                    {[
                      {
                        value: "CREDIT_CARD",
                        label: "Credit / Debit Card",
                      },
                      {
                        value: "PAYPAL",
                        label: "Digital Wallet",
                      },
                      {
                        value: "CASH_ON_DELIVERY",
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
                              ? "border-[#2563EB] bg-blue-50"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <p className="text-xs font-black text-slate-900">
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
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
                  >
                    {error}
                  </div>
                )}

              </div>

              {/* Summary */}
              <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:sticky xl:top-24">

                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-[#2563EB]" />

                  <h2 className="text-lg font-black text-slate-900">
                    Your order
                  </h2>
                </div>

                <div className="mt-6 space-y-2">

                  {items.map(
                    (item) => (
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
                          />
                        </p>
                      </div>
                    ),
                  )}

                </div>

                <div className="mt-5 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-400">
                  {shipping.method}
                  {shipping.estimatedDelivery
                    ? ` · ${shipping.estimatedDelivery}`
                    : ""}
                </div>

                <div className="mt-5">
                  <CouponInput
                    subtotal={subtotal}
                    shipping={shippingCost}
                    onApply={setAppliedCoupon}
                    onRemove={() => setAppliedCoupon(null)}
                  />
                </div>

                <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Subtotal
                    </span>

                    <LocalizedPrice
                      amountUSD={subtotal}
                      className="font-bold text-slate-800"
                    />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Shipping
                    </span>

                    <span className="font-bold text-slate-800">
                      {shippingCost === 0 ? (
                        "FREE"
                      ) : (
                        <LocalizedPrice
                          amountUSD={shippingCost}
                        />
                      )}
                    </span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        Discount
                      </span>

                      <span className="font-bold text-emerald-600">
                        −<LocalizedPrice
                          amountUSD={couponDiscount}
                        />
                      </span>
                    </div>
                  )}

                </div>

                <div className="mt-5 border-t border-slate-100 pt-5">

                  <div className="flex items-end justify-between">

                    <span className="text-sm font-bold text-slate-500">
                      Total
                    </span>

                    <LocalizedPrice
                      amountUSD={total}
                      className="text-3xl font-black text-[#0F2747]"
                    />

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() => void placeOrder()}
                  className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] text-sm font-black text-white transition hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                >
                  <LockKeyhole className="h-4 w-4" />
                  Place order
                </button>

                <div className="mt-4 rounded-xl bg-emerald-50 p-3">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600" />

                    <p className="text-[11px] leading-5 text-emerald-700">
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
