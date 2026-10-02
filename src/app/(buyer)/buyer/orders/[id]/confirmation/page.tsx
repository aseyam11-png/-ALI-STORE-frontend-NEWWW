"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Package } from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { getMyOrder, type BackendOrder } from "@/features/orders/services/order-api.service";

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [order, setOrder] = useState<BackendOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void params.then(({ id }) => {
      const numericId = Number(id);
      if (!Number.isInteger(numericId) || numericId < 1) {
        setError("رقم الطلب غير صالح.");
        setLoading(false);
        return;
      }

      return getMyOrder(numericId)
        .then(setOrder)
        .catch((requestError) => {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "تعذر تحميل تأكيد الطلب.",
          );
        })
        .finally(() => setLoading(false));
    });
  }, [params]);

  return (
    <AccountWorkspace
      activeTab="orders"
      title="تم استلام الطلب"
      description="تأكيد مأخوذ من الطلب الحقيقي على الخادم."
    >
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-neutral-200 bg-surface p-12">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      ) : error || !order ? (
        <div role="alert" className="rounded-2xl border border-danger-100 bg-danger-surface p-6 text-sm font-bold text-danger-700">
          {error || "تعذر العثور على الطلب."}
        </div>
      ) : (
        <section className="rounded-3xl border border-success-100 bg-success-surface p-8 text-center sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-success-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <h2 className="mt-6 text-3xl font-black text-foreground">
            تم إنشاء طلبك
          </h2>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            الطلب محفوظ على الخادم ولم يعد يعتمد على Zustand أو بيانات مؤقتة.
          </p>

          <div className="mx-auto mt-7 max-w-md rounded-2xl bg-white p-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">رقم الطلب</span>
              <span className="font-black" dir="ltr">#{order.id}</span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">الإجمالي</span>
              <LocalizedPrice amountUSD={order.totalAmount} currency="USD" className="font-black" />
            </div>
          </div>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={"/buyer/orders/" + order.id}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-black text-white"
            >
              <Package className="h-4 w-4" />
              متابعة الطلب
            </Link>
            <Link
              href="/shop/products"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 bg-white px-6 text-sm font-black text-foreground"
            >
              متابعة التسوق
            </Link>
          </div>
        </section>
      )}
    </AccountWorkspace>
  );
}
