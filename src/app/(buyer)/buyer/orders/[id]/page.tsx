"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Package, Truck } from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { orderApi, type BackendOrder } from "@/features/orders/services/order-api.service";

export default function BuyerOrderPage() {
  const [id, setId] = useState("");
  const [order, setOrder] = useState<BackendOrder | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const orderId = window.location.pathname.split("/").filter(Boolean).at(-1) ?? "";
    setId(orderId);
    if (!/^\d+$/.test(orderId)) {
      setError("رقم الطلب غير صحيح.");
      return;
    }
    void orderApi.get(orderId)
      .then(setOrder)
      .catch((e) => setError(e instanceof Error ? e.message : "تعذر تحميل الطلب."));
  }, []);

  if (error) {
    return <AccountWorkspace activeTab="orders" title={id ? `الطلب #${id}` : "الطلب"} description=""><div role="alert" className="rounded-2xl border border-danger-100 bg-danger-surface p-6 text-sm font-bold text-danger-600">{error}</div></AccountWorkspace>;
  }

  if (!order) {
    return <AccountWorkspace activeTab="orders" title={id ? `الطلب #${id}` : "الطلب"} description=""><div className="rounded-2xl border border-neutral-200 bg-surface p-10 text-center">جاري تحميل الطلب...</div></AccountWorkspace>;
  }

  return (
    <AccountWorkspace activeTab="orders" title={`الطلب #${order.id}`} description="بيانات الطلب والشحن من الخادم.">
      <div className="space-y-6">
        <section className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-xs text-muted-foreground">حالة الطلب</p><p className="mt-1 text-lg font-black">{order.status}</p></div>
            <LocalizedPrice amountUSD={order.totalAmount} className="text-2xl font-black" />
          </div>
          {order.couponCode && <p className="mt-3 text-xs font-bold text-success">الكوبون: {order.couponCode}</p>}
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm">
          <div className="flex items-center gap-3"><Truck className="h-5 w-5 text-brand" /><h2 className="text-lg font-black">الشحن</h2></div>
          {order.shipments.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">لم تُنشأ الشحنة بعد. سيتم إنشاؤها ضمن مسار التنفيذ الخارجي.</p>
          ) : (
            <div className="mt-5 space-y-3">
              {order.shipments.map((s) => (
                <div key={s.id} className="rounded-xl bg-neutral-50 p-4">
                  <p className="text-sm font-black">{s.status.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.carrier ?? "شركة الشحن لم تُحدد بعد"}</p>
                  {s.trackingNumber && <p className="mt-2 font-mono text-xs">{s.trackingNumber}</p>}
                  {s.estimatedDeliveryDate && <p className="mt-2 text-xs text-muted-foreground">موعد متوقع: {new Date(s.estimatedDeliveryDate).toLocaleDateString("ar-SA")}</p>}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm">
          <div className="flex items-center gap-3"><Package className="h-5 w-5 text-brand" /><h2 className="text-lg font-black">المنتجات</h2></div>
          <div className="mt-4 space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl bg-neutral-50 p-3">
                <div><p className="text-sm font-bold">{item.productName}</p><p className="mt-1 text-xs text-muted-foreground">الكمية: {item.quantity}</p></div>
                <LocalizedPrice amountUSD={item.subTotal} className="font-black" />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm">
          <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-brand" /><h2 className="text-lg font-black">عنوان الشحن</h2></div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{order.shippingAddress}</p>
        </section>

        <Link href="/buyer/orders" className="inline-flex items-center gap-2 text-sm font-bold text-brand"><ArrowLeft className="h-4 w-4" /> العودة إلى الطلبات</Link>
      </div>
    </AccountWorkspace>
  );
}
