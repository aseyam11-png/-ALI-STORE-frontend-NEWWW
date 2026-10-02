"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Clock3, CreditCard, MapPin, Package, Truck } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { getBackendOrder } from "@/features/orders/services/order-api.service";

function progressFor(status: string) {
  switch (status) {
    case "PROCESSING": return 20;
    case "PACKED": return 40;
    case "SHIPPED": return 60;
    case "IN_TRANSIT": return 75;
    case "OUT_FOR_DELIVERY": return 90;
    case "DELIVERED": return 100;
    default: return 0;
  }
}

const labels: Record<string, string> = {
  PROCESSING: "قيد التجهيز",
  PACKED: "تم التغليف",
  SHIPPED: "تم الشحن",
  IN_TRANSIT: "في الطريق",
  OUT_FOR_DELIVERY: "خارج للتوصيل",
  DELIVERED: "تم التوصيل",
  PENDING: "قيد الانتظار",
  CANCELLED: "ملغى",
};

export default function BuyerOrderTrackingPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id ?? "";

  const query = useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => getBackendOrder(orderId),
    enabled: Boolean(orderId),
    staleTime: 10_000,
    refetchInterval: 30_000,
  });

  if (query.isPending) {
    return (
      <AppShell>
        <main className="min-h-screen bg-background">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="h-64 animate-pulse rounded-2xl bg-neutral-100" />
          </div>
        </main>
      </AppShell>
    );
  }

  if (query.isError || !query.data) {
    return (
      <AppShell>
        <main className="min-h-screen bg-background">
          <div className="mx-auto max-w-4xl px-4 py-12 text-center">
            <Package className="mx-auto h-9 w-9 text-neutral-300" />
            <h1 className="mt-5 text-2xl font-black text-foreground">تعذر العثور على الطلب</h1>
            <p className="mt-2 text-sm text-muted-foreground">قد يكون الرابط غير صحيح أو لا تملك صلاحية عرض هذا الطلب.</p>
            <Link href="/buyer/orders" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-black text-white">
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              طلباتي
            </Link>
          </div>
        </main>
      </AppShell>
    );
  }

  const order = query.data;
  const shipment = order.shipments[0];
  const shipmentStatus = shipment?.status ?? order.status;
  const progress = progressFor(shipmentStatus);

  return (
    <AppShell>
      <main className="min-h-screen bg-background">
        <section className="border-b border-neutral-200 bg-surface">
          <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
            <Link href="/buyer/orders" className="inline-flex items-center gap-2 text-xs font-black text-brand">
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              طلباتي
            </Link>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400">Order</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">#{order.id}</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString("ar-SA")}
                </p>
              </div>

              <LocalizedPrice amountUSD={Number(order.totalAmount)} className="text-2xl font-black text-foreground" />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 lg:px-8">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
            <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-surface">
              <div className="border-b border-neutral-100 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-brand">
                      <Truck className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-black text-foreground">
                        {labels[shipmentStatus] ?? shipmentStatus}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {shipment?.carrier ?? "بانتظار تعيين شركة الشحن"}
                        {shipment?.trackingNumber ? " · " + shipment.trackingNumber : ""}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-info-surface px-3 py-1.5 text-[10px] font-black text-brand">
                    {order.paymentStatus}
                  </span>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-foreground">تقدم التوصيل</span>
                    <span className="text-xs font-black text-brand">{progress}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div className="h-full rounded-full bg-brand transition-all" style={{ width: progress + "%" }} />
                  </div>
                </div>
              </div>

              <div className="p-5">
                <h2 className="text-sm font-black text-foreground">محتويات الطلب</h2>
                <div className="mt-4 space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl bg-neutral-50 p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">{item.productName}</p>
                        <p className="mt-1 text-xs text-neutral-400">الكمية: {item.quantity}</p>
                      </div>
                      <LocalizedPrice amountUSD={Number(item.subTotal)} className="shrink-0 text-sm font-black" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-neutral-100 p-5">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <div>
                    <p className="text-xs font-black text-foreground">عنوان التوصيل</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{order.shippingAddress}</p>
                  </div>
                </div>
              </div>
            </section>

            <aside className="h-fit space-y-5 lg:sticky lg:top-24">
              <section className="rounded-2xl border border-neutral-200 bg-surface p-6">
                <h2 className="text-lg font-black text-foreground">ملخص الدفع</h2>
                <div className="mt-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">قيمة المنتجات</span>
                    <LocalizedPrice amountUSD={Number(order.totalAmount) + Number(order.discountAmount ?? 0) - Number(order.shippingAmount)} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الشحن</span>
                    <LocalizedPrice amountUSD={Number(order.shippingAmount)} />
                  </div>
                  {Number(order.discountAmount ?? 0) > 0 && (
                    <div className="flex justify-between text-sm text-success">
                      <span>الخصم</span>
                      <LocalizedPrice amountUSD={-Number(order.discountAmount)} className="font-black" />
                    </div>
                  )}
                  <div className="border-t border-neutral-100 pt-4">
                    <div className="flex items-end justify-between">
                      <span className="font-bold text-muted-foreground">الإجمالي</span>
                      <LocalizedPrice amountUSD={Number(order.totalAmount)} className="text-2xl font-black text-foreground" />
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-primary-50 p-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-brand" />
                    <span className="text-xs font-black text-brand">{order.paymentMethod ?? "غير محدد"}</span>
                  </div>
                  <p className="mt-1 text-[10px] text-neutral-500">
                    حالة الدفع: {order.paymentStatus}
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-surface p-5">
                <div className="flex items-start gap-3">
                  {order.paymentStatus === "COMPLETED" ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
                  ) : (
                    <Clock3 className="mt-0.5 h-4 w-4 text-warning" />
                  )}
                  <p className="text-xs leading-5 text-muted-foreground">
                    حالة الطلب والدفع تُقرأ مباشرة من حسابك في النظام، وتتحدث تلقائيًا أثناء التوصيل.
                  </p>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
