"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Hash,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  RefreshCcw,
  Search,
  ShoppingBag,
  Truck,
  UserRound,
} from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import {
  getAdminOrders,
  updateAdminOrderStatus,
  type AdminOrder,
} from "@/features/admin/orders/services/admin-order-api.service";

const statusLabels: Record<AdminOrder["status"], string> = {
  PENDING: "بانتظار الدفع",
  PROCESSING: "قيد المعالجة",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التوصيل",
  CANCELLED: "ملغي",
};

const statusOptions: Record<AdminOrder["status"], AdminOrder["status"][]> = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const allStatuses: AdminOrder["status"][] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function statusTone(status: AdminOrder["status"]) {
  if (status === "DELIVERED") return "success" as const;
  if (status === "CANCELLED") return "danger" as const;
  if (status === "SHIPPED") return "brand" as const;
  return "warning" as const;
}

function shipmentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "قيد الانتظار",
    PROCESSING: "قيد التجهيز",
    SHIPPED: "تم الشحن",
    IN_TRANSIT: "في الطريق",
    DELIVERED: "تم التوصيل",
    CANCELLED: "ملغي",
  };
  return labels[status] ?? status;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatAmount(amount: number, currency?: string | null) {
  const formatted = new Intl.NumberFormat("ar", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return [formatted, currency].filter(Boolean).join(" ");
}

/** Build WhatsApp links only when the saved phone number includes an international prefix. */
function getWhatsAppUrl(phone?: string | null): string | null {
  const value = phone?.trim();
  if (!value || (!value.startsWith("+") && !value.startsWith("00"))) return null;

  const digits = value.startsWith("00")
    ? value.slice(2).replace(/\D/g, "")
    : value.replace(/\D/g, "");

  if (digits.length < 8 || digits.length > 15) return null;
  return `https://wa.me/${digits}`;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | AdminOrder["status"]>("ALL");
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setOrders((await getAdminOrders(0, 100)).content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل الطلبات.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    getAdminOrders(0, 100)
      .then((page) => {
        if (active) setOrders(page.content);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "تعذر تحميل الطلبات.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function changeStatus(orderId: number, status: AdminOrder["status"]) {
    setUpdatingOrderId(orderId);
    setError("");
    try {
      const updated = await updateAdminOrderStatus(orderId, status);
      setOrders((current) => current.map((order) => order.id === updated.id ? updated : order));
    } catch (err) {
      setError(err instanceof Error ? err.message : "رفض الخادم انتقال الطلب.");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  const summary = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((order) => order.status === "PENDING").length,
    processing: orders.filter((order) => order.status === "PROCESSING").length,
    shipped: orders.filter((order) => order.status === "SHIPPED").length,
  }), [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ar");
    return orders.filter((order) => {
      if (statusFilter !== "ALL" && order.status !== statusFilter) return false;
      if (!normalizedQuery) return true;

      const searchable = [
        String(order.id),
        order.customerName,
        order.customerEmail ?? "",
        order.customerPhone ?? "",
        order.shippingAddress,
        ...order.items.flatMap((item) => [
          item.productName,
          String(item.productId),
          item.productSku ?? "",
        ]),
      ].join(" ").toLocaleLowerCase("ar");

      return searchable.includes(normalizedQuery);
    });
  }, [orders, query, statusFilter]);

  return (
    <AdminShell>
      <main className="min-h-screen bg-background">
        <AdminPageHeader
          eyebrow="الطلبات"
          title="إدارة الطلبات"
          description="راجع بيانات العملاء والمنتجات والعناوين، وتابع حالة كل طلب. الخادم هو مصدر الحقيقة للرقم والحالة والأسعار."
          actions={
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-surface px-4 text-body-sm font-medium text-neutral-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-brand disabled:opacity-50"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
              تحديث
            </button>
          }
        />

        <div className="container-shell py-8">
          {error && (
            <div role="alert" className="mb-5 rounded-xl border border-danger-100 bg-danger-surface p-4 text-body-sm font-medium text-danger-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminMetricCard icon={Package} label="إجمالي الطلبات" value={String(summary.total)} detail="ضمن النتائج المحمّلة" />
            <AdminMetricCard icon={CalendarClock} label="بانتظار الإجراء" value={String(summary.pending)} tone="warning" />
            <AdminMetricCard icon={RefreshCcw} label="قيد المعالجة" value={String(summary.processing)} tone="brand" />
            <AdminMetricCard icon={Truck} label="تم الشحن" value={String(summary.shipped)} tone="success" />
          </div>

          <section className="mt-7 overflow-hidden rounded-2xl border border-neutral-200 bg-surface shadow-raised">
            <div className="flex flex-col gap-4 border-b border-neutral-100 px-5 py-5 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-h3 font-bold text-foreground">طلبات العملاء</h2>
                  <p className="mt-1 text-caption text-muted-foreground">
                    عرض {filteredOrders.length} من {orders.length} طلب محمّل
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                <label className="relative block">
                  <span className="sr-only">ابحث في الطلبات</span>
                  <Search className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="ابحث برقم الطلب أو اسم العميل أو المنتج..."
                    className="h-11 w-full rounded-xl border border-neutral-200 bg-surface ps-4 pe-10 text-body-sm text-foreground outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </label>
                <label className="block">
                  <span className="sr-only">تصفية حسب حالة الطلب</span>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as "ALL" | AdminOrder["status"])}
                    className="h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-body-sm text-foreground outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  >
                    <option value="ALL">كل الحالات</option>
                    {allStatuses.map((status) => (
                      <option key={status} value={status}>{statusLabels[status]}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {loading ? (
              <LoadingRows />
            ) : filteredOrders.length === 0 ? (
              <div className="px-6 py-16 text-center text-body-sm text-muted-foreground">
                {orders.length === 0 ? "لا توجد طلبات عملاء حاليًا." : "لا توجد طلبات تطابق البحث أو الحالة المحددة."}
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {filteredOrders.map((order) => {
                  const whatsAppUrl = getWhatsAppUrl(order.customerPhone);
                  const allowedStatuses = statusOptions[order.status];

                  return (
                    <article key={order.id} className="p-5 transition-colors hover:bg-neutral-50/70 sm:p-6">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 px-3 py-1.5 font-mono text-body-sm font-bold text-foreground">
                              <Hash className="h-3.5 w-3.5" aria-hidden="true" />
                              {order.id}
                            </span>
                            <AdminStatusPill label={statusLabels[order.status]} tone={statusTone(order.status)} />
                            <span className="inline-flex items-center gap-1 text-caption text-muted-foreground">
                              <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                              {formatDate(order.createdAt)}
                            </span>
                          </div>

                          <div className="mt-4 grid gap-4 lg:grid-cols-2">
                            <div className="rounded-xl border border-neutral-200 bg-surface p-4">
                              <div className="flex items-center gap-2 text-body-sm font-semibold text-foreground">
                                <UserRound className="h-4 w-4 text-neutral-500" aria-hidden="true" />
                                بيانات العميل
                              </div>
                              <p className="mt-3 font-semibold text-foreground">{order.customerName || "اسم العميل غير متوفر"}</p>
                              {order.customerEmail ? (
                                <p className="mt-1 break-all text-caption text-muted-foreground" dir="ltr">{order.customerEmail}</p>
                              ) : null}
                              <div className="mt-2 flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center gap-1.5 text-body-sm text-muted-foreground" dir="ltr">
                                  <Phone className="h-4 w-4" aria-hidden="true" />
                                  {order.customerPhone || "لا يوجد رقم هاتف محفوظ"}
                                </span>
                                {whatsAppUrl ? (
                                  <a
                                    href={whatsAppUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-success-200 px-3 text-label font-semibold text-success-700 transition hover:bg-success-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-300"
                                  >
                                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                                    فتح واتساب
                                  </a>
                                ) : order.customerPhone ? (
                                  <span className="text-caption text-muted-foreground">يلزم حفظ الرقم بمقدمة دولية لفتح واتساب مباشرةً</span>
                                ) : null}
                              </div>
                            </div>

                            <div className="rounded-xl border border-neutral-200 bg-surface p-4">
                              <div className="flex items-center gap-2 text-body-sm font-semibold text-foreground">
                                <MapPin className="h-4 w-4 text-neutral-500" aria-hidden="true" />
                                عنوان الطلب
                              </div>
                              <p className="mt-3 whitespace-pre-wrap break-words text-body-sm leading-6 text-foreground">
                                {order.shippingAddress || "عنوان التوصيل غير محفوظ"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="w-full rounded-xl border border-neutral-200 bg-surface p-4 xl:w-64 xl:shrink-0">
                          <p className="text-caption text-muted-foreground">إجمالي الطلب</p>
                          <p className="mt-1 text-xl font-bold text-foreground">{formatAmount(order.totalAmount, order.currency)}</p>
                          {order.discountAmount > 0 ? (
                            <p className="mt-2 text-caption text-success-700">
                              الخصم: {formatAmount(order.discountAmount, order.currency)}
                              {order.couponCode ? ` · ${order.couponCode}` : ""}
                            </p>
                          ) : null}
                          <p className="mt-2 text-caption text-muted-foreground">{order.items.length} بندًا في الطلب</p>
                        </div>
                      </div>

                      <div className="mt-5 rounded-xl border border-neutral-200 bg-surface p-4">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4 text-neutral-500" aria-hidden="true" />
                          <h3 className="text-body-sm font-semibold text-foreground">المنتجات المطلوبة</h3>
                        </div>

                        {order.items.length === 0 ? (
                          <p className="mt-2 text-caption text-muted-foreground">لا توجد تفاصيل منتجات في استجابة الطلب.</p>
                        ) : (
                          <div className="mt-3 space-y-3">
                            {order.items.map((item) => (
                              <div key={item.id} className="grid gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                                <div className="min-w-0">
                                  <p className="break-words font-semibold text-foreground">{item.productName}</p>
                                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-caption text-muted-foreground">
                                    <span>رقم المنتج: <bdi dir="ltr">#{item.productId}</bdi></span>
                                    {item.productSku ? <span>رمز المنتج: <bdi dir="ltr">{item.productSku}</bdi></span> : null}
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3 text-end text-caption sm:min-w-64">
                                  <div>
                                    <p className="text-muted-foreground">الكمية</p>
                                    <p className="mt-1 font-semibold text-foreground">{item.quantity}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">سعر الوحدة</p>
                                    <p className="mt-1 font-semibold text-foreground">{formatAmount(item.price, order.currency)}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">الإجمالي</p>
                                    <p className="mt-1 font-semibold text-foreground">{formatAmount(item.subTotal, order.currency)}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-neutral-500" aria-hidden="true" />
                          <p className="text-body-sm font-medium text-foreground">الشحنات</p>
                        </div>

                        {order.shipments.length === 0 ? (
                          <p className="mt-2 text-caption text-muted-foreground">لم يتم إنشاء شحنة لهذا الطلب بعد.</p>
                        ) : (
                          <div className="mt-3 space-y-2">
                            {order.shipments.map((shipment) => (
                              <div key={shipment.id} className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <AdminStatusPill label={shipmentStatusLabel(shipment.status)} tone="neutral" />
                                    <span className="text-caption font-medium text-foreground">
                                      {shipment.carrier ?? "لم يتم تعيين شركة نقل"}
                                    </span>
                                  </div>
                                  <p className="mt-1 truncate font-mono text-label text-muted-foreground">
                                    {shipment.trackingNumber ?? "لم يتم تعيين رقم تتبع"}
                                  </p>
                                </div>
                                <p className="text-label text-muted-foreground">
                                  {shipment.estimatedDeliveryDate
                                    ? `متوقع ${new Date(shipment.estimatedDeliveryDate).toLocaleDateString("ar")}`
                                    : "موعد التسليم غير متاح"}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {allowedStatuses.length > 0 ? (
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span className="me-1 text-caption font-medium text-muted-foreground">تحديث الحالة:</span>
                          {allowedStatuses.map((status) => (
                            <button
                              key={status}
                              type="button"
                              disabled={updatingOrderId !== null}
                              onClick={() => void changeStatus(order.id, status)}
                              className="min-h-9 rounded-lg border border-neutral-200 px-3 text-label font-medium text-neutral-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {updatingOrderId === order.id ? "جارٍ الحفظ..." : statusLabels[status]}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-4 text-caption text-muted-foreground">هذه حالة نهائية؛ لا توجد انتقالات متاحة من الواجهة.</p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </AdminShell>
  );
}

function LoadingRows() {
  return (
    <div aria-label="جاري تحميل الطلبات" className="divide-y divide-neutral-100">
      {[1, 2, 3].map((row) => (
        <div key={row} className="animate-pulse p-6">
          <div className="h-4 w-1/3 rounded bg-neutral-100" />
          <div className="mt-3 h-3 w-1/2 rounded bg-neutral-100" />
          <div className="mt-5 h-20 rounded-xl bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}
