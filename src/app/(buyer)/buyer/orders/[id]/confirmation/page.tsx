"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Package, Truck } from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { getServerOrder } from "@/features/orders/services/order-api.service";
import { formatSAR } from "@/features/localization/services/currency.service";

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const query = useQuery({
    queryKey: ["order-confirmation", id],
    queryFn: () => getServerOrder(id),
    staleTime: 10_000,
  });

  return (
    <AccountWorkspace
      activeTab="orders"
      title="تم استلام طلبك"
      description="التأكيد مبني على الطلب الموجود فعليًا في الخادم."
    >
      {query.isLoading ? (
        <div className="h-80 animate-pulse rounded-3xl bg-neutral-100" />
      ) : query.isError || !query.data ? (
        <div className="rounded-2xl border border-danger-100 bg-danger-surface p-8 text-center text-sm font-medium text-danger-700">
          تعذر تحميل بيانات الطلب.
        </div>
      ) : (
        <div className="mx-auto max-w-2xl rounded-3xl border border-success-100 bg-surface p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success-surface text-success-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-success-700">
            Order confirmed
          </p>
          <h1 className="mt-2 text-3xl font-black text-foreground">
            شكراً لطلبك
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            رقم الطلب{" "}
            <span className="font-black text-foreground">#{query.data.id}</span>
            {" "}— الإجمالي{" "}
            <span className="font-black text-foreground">
              {formatSAR(Number(query.data.totalAmount))}
            </span>
            .
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-neutral-50 p-4 text-start">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Package className="h-4 w-4 text-brand" />
                حالة الطلب
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {query.data.status}
              </p>
            </div>

            <div className="rounded-2xl bg-neutral-50 p-4 text-start">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Truck className="h-4 w-4 text-brand" />
                الشحن
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {query.data.shippingMethod === "EXPRESS"
                  ? "شحن سريع"
                  : "شحن عادي"}
                {query.data.shipments[0]?.trackingNumber
                  ? " · " + query.data.shipments[0].trackingNumber
                  : ""}
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href={"/buyer/orders/" + query.data.id}
              className="inline-flex h-11 items-center rounded-xl bg-brand px-5 text-sm font-bold text-white"
            >
              تتبع الطلب
            </Link>
            <Link
              href="/shop/products"
              className="inline-flex h-11 items-center rounded-xl border border-neutral-200 px-5 text-sm font-bold text-foreground"
            >
              متابعة التسوق
            </Link>
          </div>
        </div>
      )}
    </AccountWorkspace>
  );
}
