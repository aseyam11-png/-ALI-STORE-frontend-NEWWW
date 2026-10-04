"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { useSession } from "@/features/auth/session";
import type { CustomerAddress } from "@/features/addresses/types/address.types";
import {
  createAddress,
  deleteAddress,
  getMyAddresses,
  setDefaultAddress,
  updateAddress,
} from "@/features/addresses/services/address-api.service";

const emptyForm: Omit<CustomerAddress, "id"> = {
  customerId: "me",
  label: "",
  recipientName: "",
  phone: "",
  country: "Palestine",
  city: "",
  area: "",
  street: "",
  building: "",
  apartment: "",
  postalCode: "",
  notes: "",
  isDefault: false,
};

export default function BuyerAddressesPage() {
  const session = useSession();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const refreshAddresses = async () => {
    setLoading(true);
    setError("");

    try {
      setAddresses(await getMyAddresses());
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "تعذر تحميل العناوين.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session.status !== "authenticated") return;

    let active = true;

    const run = async () => {
      try {
        const next = await getMyAddresses();
        if (active) setAddresses(next);
      } catch (caughtError) {
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "تعذر تحميل العناوين.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [session.status]);

  const startAdd = () => {
    setError("");
    setNotice("");
    setEditingId(null);
    setForm({
      ...emptyForm,
      isDefault: addresses.length === 0,
    });
    setShowForm(true);
  };

  const startEdit = (address: CustomerAddress) => {
    setError("");
    setNotice("");
    setEditingId(address.id);
    setForm({
      customerId: "me",
      label: address.label,
      recipientName: address.recipientName,
      phone: address.phone,
      country: address.country,
      city: address.city,
      area: address.area,
      street: address.street,
      building: address.building ?? "",
      apartment: address.apartment ?? "",
      postalCode: address.postalCode ?? "",
      notes: address.notes ?? "",
      isDefault: Boolean(address.isDefault),
    });
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const save = async () => {
    if (
      !form.label.trim() ||
      !form.recipientName.trim() ||
      !form.phone.trim() ||
      !form.city.trim() ||
      !form.area.trim() ||
      !form.street.trim() ||
      !form.country.trim()
    ) {
      setError("أكمل بيانات العنوان المطلوبة.");
      setNotice("");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const input = {
        ...form,
        label: form.label.trim(),
        recipientName: form.recipientName.trim(),
        phone: form.phone.trim(),
        country: form.country.trim(),
        city: form.city.trim(),
        area: form.area.trim(),
        street: form.street.trim(),
        building: form.building?.trim() || "",
        apartment: form.apartment?.trim() || "",
        postalCode: form.postalCode?.trim() || "",
        notes: form.notes?.trim() || "",
      };

      if (editingId) {
        await updateAddress(editingId, input);
      } else {
        await createAddress(input);
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await refreshAddresses();
      setNotice(editingId ? "تم تحديث العنوان بنجاح." : "تم حفظ العنوان بنجاح.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "تعذر حفظ العنوان.",
      );
    } finally {
      setSaving(false);
    }
  };

  const makeDefault = async (id: string) => {
    setError("");
    setNotice("");

    try {
      await setDefaultAddress(id);
      await refreshAddresses();
      setNotice("تم تعيين العنوان الافتراضي.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "تعذر تحديث العنوان الافتراضي.",
      );
    }
  };

  const remove = async (id: string) => {
    setError("");
    setNotice("");

    try {
      await deleteAddress(id);
      await refreshAddresses();
      setNotice("تم حذف العنوان.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "تعذر حذف العنوان.",
      );
    }
  };

  return (
    <AccountWorkspace
      activeTab="addresses"
      title="العناوين"
      description="احفظ عناوين التوصيل لتسريع إتمام الطلب وتفادي إعادة إدخال البيانات."
    >
      {session.status === "loading" ? (
        <section className="rounded-2xl border border-neutral-200 bg-surface p-8 shadow-raised" aria-busy="true">
          <div className="animate-pulse space-y-4">
            <div className="h-5 w-40 rounded bg-neutral-100" />
            <div className="h-3 w-64 rounded bg-neutral-100" />
            <div className="h-24 rounded-2xl bg-neutral-100" />
          </div>
        </section>
      ) : session.status !== "authenticated" ? (
        <section className="rounded-2xl border border-neutral-200 bg-surface p-8 text-center shadow-raised sm:p-10">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-brand">
            <MapPin className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-h3 font-bold text-foreground">
            سجّل الدخول لإدارة عناوينك
          </h2>
          <p className="mx-auto mt-2 max-w-md text-body-sm leading-6 text-muted-foreground">
            عناوين التوصيل محفوظة داخل حسابك ولا تُعرض لغير صاحب الحساب.
          </p>
          <Link
            href="/login?next=/buyer/addresses"
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-body-sm font-bold text-white transition-all duration-200 ease-brand hover:-translate-y-0.5 hover:bg-brand-hover"
          >
            تسجيل الدخول
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </section>
      ) : (
        <div className="space-y-5">
          {(error || notice) && (
            <div
              role={error ? "alert" : "status"}
              aria-live="polite"
              className={
                "rounded-xl border px-4 py-3 text-body-sm font-bold " +
                (error
                  ? "border-danger-100 bg-danger-surface text-danger-700"
                  : "border-success-100 bg-success-surface text-success")
              }
            >
              {error || notice}
            </div>
          )}

          <section className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-surface p-5 shadow-raised sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-brand">
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-label font-bold uppercase tracking-wide text-brand">
                  عناوين التوصيل
                </p>
                <h2 className="mt-1 text-h4 font-bold text-foreground">
                  {addresses.length === 0
                    ? "لا توجد عناوين محفوظة"
                    : addresses.length + " عناوين محفوظة"}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={startAdd}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-body-sm font-bold text-white shadow-sm transition-all duration-200 ease-brand hover:-translate-y-0.5 hover:bg-brand-hover"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              إضافة عنوان
            </button>
          </section>

          {showForm && (
            <section className="overflow-hidden rounded-2xl border border-primary-100 bg-surface shadow-floating">
              <div className="border-b border-neutral-100 bg-primary-50/50 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-label font-bold uppercase tracking-wide text-brand">
                      {editingId ? "تعديل محفوظ" : "عنوان جديد"}
                    </p>
                    <h2 className="mt-1 text-h3 font-bold text-foreground">
                      {editingId ? "تعديل العنوان" : "إضافة عنوان جديد"}
                    </h2>
                    <p className="mt-1 text-body-sm text-muted-foreground">
                      املأ الحقول المطلوبة ثم احفظ العنوان لاستخدامه في Checkout.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={saving}
                    className="inline-flex h-9 items-center justify-center rounded-xl border border-neutral-200 bg-surface px-3 text-caption font-bold text-muted-foreground transition hover:border-neutral-300 hover:text-foreground disabled:opacity-50"
                  >
                    إلغاء
                  </button>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="اسم العنوان" value={form.label} required onChange={(value) => setForm((current) => ({ ...current, label: value }))} />
                  <Field label="اسم المستلم" value={form.recipientName} required onChange={(value) => setForm((current) => ({ ...current, recipientName: value }))} />
                  <Field label="الهاتف" value={form.phone} required onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
                  <Field label="الدولة" value={form.country} required onChange={(value) => setForm((current) => ({ ...current, country: value }))} />
                  <Field label="المدينة" value={form.city} required onChange={(value) => setForm((current) => ({ ...current, city: value }))} />
                  <Field label="المنطقة" value={form.area} required onChange={(value) => setForm((current) => ({ ...current, area: value }))} />
                  <Field label="الشارع" value={form.street} required onChange={(value) => setForm((current) => ({ ...current, street: value }))} />
                  <Field label="المبنى" value={form.building ?? ""} onChange={(value) => setForm((current) => ({ ...current, building: value }))} />
                  <Field label="الشقة" value={form.apartment ?? ""} onChange={(value) => setForm((current) => ({ ...current, apartment: value }))} />
                  <Field label="الرمز البريدي" value={form.postalCode ?? ""} onChange={(value) => setForm((current) => ({ ...current, postalCode: value }))} />
                  <Field label="ملاحظات" value={form.notes ?? ""} onChange={(value) => setForm((current) => ({ ...current, notes: value }))} />
                </div>

                <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-body-sm font-medium text-foreground transition-colors hover:bg-surface">
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        isDefault: event.target.checked,
                      }))
                    }
                    className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
                  />
                  <span>
                    <span className="block font-bold">اجعل هذا العنوان افتراضيًا</span>
                    <span className="mt-1 block text-caption text-muted-foreground">
                      سيظهر هذا العنوان كخيار أساسي عند إتمام الطلب.
                    </span>
                  </span>
                </label>

                <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={saving}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 px-5 text-body-sm font-bold text-foreground transition hover:bg-neutral-50 disabled:opacity-50"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void save()}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-body-sm font-bold text-white shadow-sm transition-all duration-200 ease-brand hover:-translate-y-0.5 hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "جارٍ الحفظ..." : editingId ? "حفظ التعديلات" : "حفظ العنوان"}
                  </button>
                </div>
              </div>
            </section>
          )}

          {loading ? (
            <section className="grid gap-4 lg:grid-cols-2" aria-busy="true">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-2xl border border-neutral-200 bg-surface p-6 shadow-raised"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-neutral-100" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 rounded bg-neutral-100" />
                      <div className="h-3 w-24 rounded bg-neutral-100" />
                    </div>
                  </div>
                  <div className="mt-5 h-16 rounded-xl bg-neutral-100" />
                </div>
              ))}
            </section>
          ) : addresses.length === 0 ? (
            <section className="rounded-2xl border border-dashed border-neutral-300 bg-surface p-10 text-center shadow-raised sm:p-14">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-brand">
                <MapPin className="h-7 w-7" aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-h3 font-bold text-foreground">
                لا توجد عناوين محفوظة
              </h2>
              <p className="mx-auto mt-2 max-w-md text-body-sm leading-6 text-muted-foreground">
                أضف عنوانك الأول لتجعل إتمام الشراء أسرع وأسهل.
              </p>
              <button
                type="button"
                onClick={startAdd}
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-body-sm font-bold text-white shadow-sm transition-all duration-200 ease-brand hover:-translate-y-0.5 hover:bg-brand-hover"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                إضافة عنوان
              </button>
            </section>
          ) : (
            <section className="grid gap-4 lg:grid-cols-2">
              {addresses.map((address) => (
                <article
                  key={address.id}
                  className={
                    "group rounded-2xl border bg-surface p-5 shadow-raised transition-all duration-200 ease-brand sm:p-6 " +
                    (address.isDefault
                      ? "border-primary-200 ring-1 ring-primary-100"
                      : "border-neutral-200 hover:border-neutral-300 hover:shadow-floating")
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className={
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl " +
                          (address.isDefault
                            ? "bg-primary-50 text-brand"
                            : "bg-neutral-100 text-neutral-500")
                        }
                      >
                        <MapPin className="h-5 w-5" aria-hidden="true" />
                      </span>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-body font-bold text-foreground">
                            {address.label}
                          </h2>

                          {address.isDefault && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-success-100 bg-success-surface px-2.5 py-1 text-label font-bold text-success">
                              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                              افتراضي
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-body-sm font-bold text-foreground">
                          {address.recipientName}
                        </p>
                        <p className="mt-1 text-caption text-muted-foreground" dir="ltr">
                          {address.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(address)}
                        aria-label={"تعديل " + address.label}
                        title="تعديل العنوان"
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => void remove(address.id)}
                        aria-label={"حذف " + address.label}
                        title="حذف العنوان"
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-400 transition-colors hover:bg-danger-surface hover:text-danger-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-danger-100"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl bg-neutral-50 p-4">
                    <p className="text-body-sm leading-7 text-foreground">
                      {[
                        address.street,
                        address.building,
                        address.apartment ? "شقة " + address.apartment : "",
                        address.area,
                        address.city,
                        address.country,
                      ]
                        .filter(Boolean)
                        .join("، ")}
                    </p>
                    {address.notes && (
                      <p className="mt-2 border-t border-neutral-200 pt-2 text-caption leading-5 text-muted-foreground">
                        ملاحظة: {address.notes}
                      </p>
                    )}
                  </div>

                  {!address.isDefault && (
                    <button
                      type="button"
                      onClick={() => void makeDefault(address.id)}
                      className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 text-body-sm font-bold text-foreground transition hover:border-primary-200 hover:text-brand"
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      جعل افتراضي
                    </button>
                  )}
                </article>
              ))}
            </section>
          )}

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
            <div>
              <p className="text-body-sm font-bold text-foreground">جاهز للشراء؟</p>
              <p className="mt-1 text-caption text-muted-foreground">
                اختر عنوانك عند إتمام الطلب وتابع إلى Checkout.
              </p>
            </div>
            <Link
              href="/shop/checkout"
              className="mt-3 inline-flex items-center gap-2 text-body-sm font-bold text-brand transition hover:text-brand-hover sm:mt-0"
            >
              الذهاب إلى Checkout
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </AccountWorkspace>
  );
}

function Field({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1 text-body-sm font-bold text-foreground">
        {label}
        {required ? <span className="text-danger-600" aria-hidden="true">*</span> : null}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-body outline-none transition-shadow placeholder:text-neutral-400 focus:border-brand focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}
