"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, CreditCard } from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { orderApi, type BackendOrder } from "@/features/orders/services/order-api.service";

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<BackendOrder | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const id = parts.at(-2) ?? "";
    if (!/^\d+$/.test(id)) {
      setError("رقم الطلب غير صحيح.");
      return;
    }
    void orderApi.get(id).then(setOrder).catch((e) => setError(e instanceof Error ? e.message : "تعذر تحميل الطلب."));
  }, []);

  if (error) return <AccountWorkspace activeTab="orders" title="تأكيد الطلب" description=""><div role="alert" className="rounded-2xl border border-danger-100 bg-danger-surface p-6 text-sm font-bold text-danger-600">{error}</div></AccountWorkspace>;
  if (!order) return <AccountWorkspace activeTab="orders" title="تأكيد الطلب" description=""><div className="rounded-2xl border border-neutral-200 bg-surface p-10 text-center">جاري تحميل بيانات الطلب...</div></AccountWorkspace>;

  return (
    <AccountWorkspace activeTab="orders" title="تم إنشاء الطلب" description={`رقم الطلب #${order.id}`}>
      <div className="mx-auto max-w-2xl space-y-6">
        <section className="rounded-2xl border border-success-100 bg-success-surface p-7 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
          <h2 className="mt-4 text-2xl font-black">تم إنشاء الطلب على الخادم</h2>
          <p className="mt-2 text-sm text-muted-foreground">الحالة الحالية: {order.status}. نتيجة الدفع تُدار بالكامل بواسطة خدمة الدفع في الخادم.</p>
        </section>
        <section className="rounded-2xl border border-neutral-200 bg-surface p-6">
          <div className="flex items-center gap-3"><CreditCard className="h-5 w-5 text-brand" /><h2 className="text-lg font-black">الإجمالي</h2></div>
          <LocalizedPrice amountUSD={order.totalAmount} className="mt-4 text-3xl font-black" />
        </section>
        <Link href={`/buyer/orders/${order.id}`} className="inline-flex h-11 items-center justify-center rounded-xl bg-brand px-6 text-sm font-black text-white">متابعة الطلب</Link>
      </div>
    </AccountWorkspace>
  );
}
