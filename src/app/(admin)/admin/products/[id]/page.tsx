"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Box,
  CircleDollarSign,
  Save,
  Truck,
} from "lucide-react";
import { useParams } from "next/navigation";

import { AdminShell } from "@/components/layout/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import {
  getAdminProduct,
  updateAdminProduct,
  type AdminProduct,
} from "@/features/admin/products/services/admin-product-api.service";

const statusLabels: Record<AdminProduct["status"], string> = {
  DRAFT: "مسودة",
  ACTIVE: "نشط",
  ARCHIVED: "مؤرشف",
};

function formatMoney(amount: number | null | undefined, currency: string) {
  if (amount == null || !Number.isFinite(amount)) return "غير متاح";
  try {
    return new Intl.NumberFormat("ar", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return String(amount) + " " + currency;
  }
}

export default function AdminProductPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<AdminProduct["status"]>("DRAFT");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    let active = true;
    if (!params?.id) {
      setLoading(false);
      setError("رقم المنتج غير صالح.");
      return () => { active = false; };
    }

    getAdminProduct(params.id)
      .then((next) => {
        if (!active) return;
        setProduct(next);
        setName(next.name);
        setPrice(String(next.price));
        setStatus(next.status);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "تعذر تحميل بيانات المنتج.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [params?.id]);

  async function save() {
    if (!product) return;
    if (!name.trim()) {
      setError("اسم المنتج مطلوب.");
      return;
    }

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      setError("أدخل سعرًا صحيحًا غير سالب.");
      return;
    }

    setSaving(true);
    setError("");
    setSaved("");
    try {
      const updated = await updateAdminProduct(product.id, {
        name: name.trim(),
        price: numericPrice,
        status,
      });
      setProduct(updated);
      setName(updated.name);
      setPrice(String(updated.price));
      setStatus(updated.status);
      setSaved("تم حفظ التعديلات بنجاح.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حفظ التعديلات. راجع استجابة الخادم.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminShell>
        <main dir="rtl" className="grid min-h-screen place-items-center bg-background px-5">
          <section className="w-full max-w-md rounded-2xl border border-neutral-200 bg-surface p-6" aria-busy="true">
            <div className="h-4 w-32 animate-pulse rounded bg-neutral-100" />
            <div className="mt-4 h-3 w-full animate-pulse rounded bg-neutral-100" />
            <p className="mt-5 text-sm text-muted-foreground">جاري تحميل بيانات المنتج…</p>
          </section>
        </main>
      </AdminShell>
    );
  }

  if (!product) {
    return (
      <AdminShell>
        <main dir="rtl" className="container-shell min-h-screen py-12">
          <section role="alert" className="rounded-2xl border border-danger-100 bg-danger-surface p-6 text-sm text-danger-700">
            {error || "المنتج غير موجود أو لا تملك صلاحية عرضه."}
            <Link href="/admin/products" className="mt-4 inline-flex items-center gap-2 font-bold text-brand">
              العودة إلى المنتجات <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        </main>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <main dir="rtl" className="min-h-screen bg-background">
        <AdminPageHeader
          eyebrow="إدارة الكتالوج"
          title={product.name}
          description="إدارة بيانات المنتج وسعر البيع وحالة النشر، مع إبقاء بيانات التوريد الداخلية منفصلة وواضحة."
          actions={
            <Link
              href="/admin/products"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-surface px-4 text-body-sm font-semibold text-foreground transition hover:border-primary-200 hover:bg-primary-50"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
              العودة إلى المنتجات
            </Link>
          }
        />

        <div className="container-shell py-7">
          {error ? (
            <div role="alert" className="mb-5 rounded-xl border border-danger-100 bg-danger-surface p-4 text-body-sm text-danger-700">
              {error}
            </div>
          ) : null}
          {saved ? (
            <div role="status" className="mb-5 rounded-xl border border-success-200 bg-success-surface p-4 text-body-sm text-success-700">
              {saved}
            </div>
          ) : null}

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.9fr)]">
            <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-surface">
              <div className="flex items-center gap-3 border-b border-neutral-100 px-5 py-4 sm:px-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-brand">
                  <Box className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-h3 font-bold text-foreground">بيانات المنتج</h2>
                  <p className="mt-1 text-caption text-muted-foreground">هذه الحقول تخص عرض المنتج في متجر ALI STORE.</p>
                </div>
              </div>

              <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                <Field label="اسم المنتج" value={name} onChange={setName} required />
                <Field label={"سعر البيع (" + product.currency + ")"} value={price} onChange={setPrice} type="number" min="0" step="0.01" required />
                <label className="block text-body-sm font-semibold text-foreground">
                  حالة النشر
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value as AdminProduct["status"])}
                    className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-body-sm outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  >
                    <option value="DRAFT">مسودة</option>
                    <option value="ACTIVE">نشط</option>
                    <option value="ARCHIVED">مؤرشف</option>
                  </select>
                </label>
                <ReadOnly label="القسم" value={product.categoryName ?? "غير محدد"} />
                <ReadOnly label="العلامة التجارية" value={product.brandName ?? "بدون علامة"} />
              </div>

              <div className="flex flex-col gap-3 border-t border-neutral-100 bg-neutral-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-caption leading-5 text-muted-foreground">يُرسل التعديل إلى الـ Backend؛ لا تعتبر الواجهة التغيير ناجحًا إلا بعد استجابة الخادم.</p>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void save()}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-body-sm font-bold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save className="h-4 w-4" aria-hidden="true" />
                  {saving ? "جاري الحفظ…" : "حفظ التعديلات"}
                </button>
              </div>
            </section>

            <aside className="overflow-hidden rounded-2xl border border-neutral-200 bg-surface">
              <div className="flex items-center gap-3 border-b border-neutral-100 px-5 py-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
                  <Truck className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-h3 font-bold text-foreground">التوريد الداخلي</h2>
                  <p className="mt-1 text-caption text-muted-foreground">بيانات تشغيلية خاصة بإدارة المتجر.</p>
                </div>
              </div>

              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3 rounded-xl border border-neutral-100 bg-neutral-50/70 p-4">
                  <div>
                    <p className="text-caption text-muted-foreground">حالة المنتج</p>
                    <p className="mt-2 text-body-sm font-semibold text-foreground">{statusLabels[product.status]}</p>
                  </div>
                  <AdminStatusPill label={statusLabels[product.status]} tone={product.status === "ACTIVE" ? "success" : "neutral"} />
                </div>
                <ReadOnly label="رقم المنتج في قاعدة البيانات" value={String(product.id)} />
                <ReadOnly label="رمز المنتج في ALI STORE (SKU)" value={product.sku || "غير مخصص"} />
                <ReadOnly label="المورد الداخلي" value={product.supplierName ?? "غير مربوط"} />
                <ReadOnly label="معرّف المنتج لدى المورد" value={product.supplierProductId ?? "غير متاح"} />
                <ReadOnly label="SKU لدى المورد" value={product.supplierSku ?? "غير متاح"} />
                <div className="rounded-xl border border-neutral-200 p-4">
                  <div className="flex items-center gap-2 text-body-sm font-semibold text-foreground">
                    <CircleDollarSign className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    تكلفة التوريد
                  </div>
                  <p className="mt-2 text-lg font-bold tabular-nums text-foreground">
                    {formatMoney(product.supplierCost, product.currency)}
                  </p>
                </div>
                <div className="rounded-xl border border-primary-100 bg-primary-50/60 p-4 text-caption leading-6 text-neutral-700">
                  لا تُعرض تكلفة المورد أو معرّفاته في واجهة العميل. ALI STORE هو البائع الوحيد، والمورد جهة توريد وتنفيذ داخلية.
                </div>
                <div className="flex items-start gap-2 text-caption leading-5 text-muted-foreground">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                  يتم عرض معرّف المورد منفصلًا عن SKU الخاص بمتجر ALI STORE لتسهيل التتبع.
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </AdminShell>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  min,
  step,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  min?: string;
  step?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-body-sm font-semibold text-foreground">
      {label}
      <input
        type={type}
        min={min}
        step={step}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-body-sm font-normal outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
      />
    </label>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-neutral-100 bg-neutral-50/70 p-3">
      <p className="text-caption text-muted-foreground">{label}</p>
      <p className="mt-2 break-words text-body-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
