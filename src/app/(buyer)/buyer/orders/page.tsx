"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Package } from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { orderApi, type BackendOrder } from "@/features/orders/services/order-api.service";
import { HttpApiError } from "@/lib/api/http-client";

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    orderApi.list()
      .then((page) => { if (active) setOrders(page.content); })
      .catch((e) => { if (active) setError(e instanceof HttpApiError ? e.message : "تعذر تحميل الطلبات."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <AccountWorkspace activeTab="orders" title="طلباتي" description="الطلبات وحالة الشحن من الخادم.">
      {loading ? (
        <div className="rounded-2xl border border-neutral-200 bg-surface p-10 text-center">جاري تحميل الطلبات...</div>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-danger-100 bg-danger-surface p-6 text-sm font-bold text-danger-600">{error}</div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-surface p-10 text-center">
          <Package className="mx-auto h-9 w-9 text-neutral-300" />
          <h2 className="mt-4 text-xl font-black">لا توجد طلبات</h2>
          <Link href="/shop/products" className="mt-6 inline-flex h-11 items-center rounded-xl bg-brand px-6 text-sm font-black text-white">ابدأ التسوق</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/buyer/orders/${order.id}`} className="block rounded-2xl border border-neutral-200 bg-surface p-5 shadow-sm transition hover:border-primary-200 hover:shadow-md">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black">طلب <span dir="ltr">#{order.id}</span></p>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString("ar-SA")}</p>
                  <span className="mt-3 inline-flex rounded-full bg-info-surface px-2.5 py-1 text-[10px] font-black text-brand">{order.status}</span>
                </div>
                <LocalizedPrice amountUSD={order.totalAmount} className="text-xl font-black" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </AccountWorkspace>
  );
}
