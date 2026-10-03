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
  Truck,
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

  const shipping = useCartStore(
    (state) =>
      state.getShippingInfo(),
  );

  const clearCart = useCartStore(
    (state) => state.clearCart,
  );

  const session = useSession();
  const router = useRouter();

  const [form, setForm] =
    useState<FormState>(initialForm);

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

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

  const [paymentMethod, setPaymentMethod] =
    useState("card");

  const [shippingMode, setShippingMode] =
    useState("standard");

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  const [error, setError] =
    useState("");

  const [successOrderId, setSuccessOrderId] =
    useState("");
  const idempotencyKeyRef = useRef<string | null>(null);
  const [successPaymentStatus, setSuccessPaymentStatus] =
    useState<BackendPayment["status"]>("PENDING");

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

  const shippingCost =
    shippingMode === "express" &&
    items.length > 0
      ? shipping.cost + 8
      : shipping.cost;

  const couponDiscount =
    appliedCoupon?.finalDiscount ?? 0;

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
      await replaceBackendCart(items);

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
                Your order has been created successfully. We&apos;ll send tracking
                information as soon as your order ships.
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