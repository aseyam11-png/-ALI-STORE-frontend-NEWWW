"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Package, Truck } from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { getMyOrders, type BackendOrder } from "@/features/orders/services/order-api.service";

const labels: Record<string, string> = {
  PENDING: "قيد الدفع",
  PROCESSING: "قيد التجهيز",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التوصيل",
  CANCELLED: "ملغي",
};

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void getMyOrders(0, 20)
      .then((response) => setOrders(response.content))
      .catch((requestError) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "تعذر تحميل الطلبات.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AccountWorkspace
      activeTab="orders"
      title="طلباتي"
      description="الطلبات الحقيقية المرتبطة بحسابك من قاعدة بيانات المتجر."
    >
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-neutral-200 bg-surface p-12">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-danger-100 bg-danger-surface p-6 text-sm font-bold text-danger-700">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-surface p-10 text-center">
          <Package className="mx-auto h-9 w-9 text-neutral-300" />
          <h2 className="mt-4 text-xl font-black text-foreground">لا توجد طلبات</h2>
          <p className="mt-2 text-sm text-muted-foreground">بعد أول شراء سيظهر الطلب هنا بشكل دائم من الخادم.</p>
          <Link href="/shop/products" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-6 text-sm font-black text-white">
            ابدأ التسوق <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-neutral-200 bg-surface p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">رقم الطلب</p>
                  <p className="mt-1 text-base font-black text-foreground" dir="ltr">#{order.id}</p>
                  <span className="mt-2 inline-flex rounded-full bg-info-surface px-3 py-1 text-[11px] font-black text-brand">
                    {labels[order.status] ?? order.status}
                  </span>
                </div>
                <div className="text-start sm:text-end">
                  <p className="text-xs text-muted-foreground">الإجمالي</p>
                  <LocalizedPrice amountUSD={order.totalAmount} currency="USD" className="mt-1 text-xl font-black" />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("ar-SA")}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                <Truck className="h-4 w-4 text-success-600" />
                {order.shipments?.length
                  ? order.shipments[0].status
                  : "بانتظار بدء الشحن"}
              </div>

              <Link
                href={"/buyer/orders/" + order.id}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 px-4 text-xs font-black text-foreground hover:border-primary-200 hover:text-brand"
              >
                عرض التفاصيل
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </article>
          ))}
        </div>
      )}
    </AccountWorkspace>
  );
}
