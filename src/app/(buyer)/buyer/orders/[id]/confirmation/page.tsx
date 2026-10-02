"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, MapPin, Package, Truck } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { getBackendOrder } from "@/features/orders/services/order-api.service";

export default function OrderConfirmationPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id ?? "";

  const query = useQuery({
    queryKey: ["orders", "confirmation", orderId],
    queryFn: () => getBackendOrder(orderId),
    enabled: Boolean(orderId),
  });

  if (query.isPending) {
    return (
      <AppShell>
        <main className="min-h-screen bg-background">
          <div className="mx-auto max-w-3xl px-4 py-12">
            <div className="h-72 animate-pulse rounded-3xl bg-neutral-100" />
          </div>
        </main>
      </AppShell>
    );
  }

  if (query.isError || !query.data) {
    return (
      <AppShell>
        <main className="min-h-screen bg-background">
          <div className="mx-auto max-w-3xl px-4 py-12 text-center">
            <Package className="mx-auto h-9 w-9 text-neutral-300" />
            <h1 className="mt-5 text-2xl font-black text-foreground">تعذر العثور على الطلب</h1>
            <Link href="/buyer/orders" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-black text-white">
              طلباتي
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </main>
      </AppShell>
    );
  }

  const order = query.data;
  const paymentConfirmed = order.paymentStatus === "COMPLETED";
  const shipment = order.shipments[0];

  return (
    <AppShell>
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <section className="rounded-3xl border border-neutral-200 bg-surface p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success-surface text-success">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.18em] text-success">
              {paymentConfirmed ? "Order confirmed" : "Order created"}
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
              {paymentConfirmed ? "تم تأكيد طلبك" : "تم إنشاء طلبك"}
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {paymentConfirmed
                ? "تم تأكيد الدفع، وسيتم تحديث حالة الشحن تلقائيًا."
                : "الطلب محفوظ، والدفع ما زال قيد المعالجة. لا تعِد إرسال الطلب."}
            </p>

            <div className="mx-auto mt-7 max-w-md rounded-2xl bg-neutral-50 p-5 text-start">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-neutral-400">رقم الطلب</span>
                <span className="text-sm font-black text-foreground">#{order.id}</span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-4">
                <span className="text-xs text-neutral-400">حالة الدفع</span>
                <span className="rounded-full bg-info-surface px-2.5 py-1 text-[10px] font-black text-brand">
                  {order.paymentStatus}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-4">
                <span className="text-xs text-neutral-400">الإجمالي</span>
                <LocalizedPrice amountUSD={Number(order.totalAmount)} className="text-lg font-black" />
              </div>
              <div className="mt-4 flex items-start gap-2 border-t border-neutral-200 pt-4">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span className="text-xs leading-5 text-neutral-500">{order.shippingAddress}</span>
              </div>
              <div className="mt-4 flex items-start gap-2">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span className="text-xs leading-5 text-neutral-500">
                  {shipment?.carrier ?? "شركة الشحن ستظهر عند الإسناد"}
                  {shipment?.trackingNumber ? " · " + shipment.trackingNumber : ""}
                </span>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href={`/buyer/orders/${order.id}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-black text-white">
                تتبّع الطلب
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
              <Link href="/shop/products" className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 px-5 text-sm font-bold text-foreground">
                مواصلة التسوق
              </Link>
            </div>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
