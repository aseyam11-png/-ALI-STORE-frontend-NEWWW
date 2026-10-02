"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, MapPin, Pencil, Plus, Trash2 } from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
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
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const refreshAddresses = async () => {
    setLoading(true);
    setError("");
    try {
      setAddresses(await getMyAddresses());
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "تعذر تحميل العناوين.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const next = await getMyAddresses();
        if (active) setAddresses(next);
      } catch (caughtError) {
        if (active) setError(caughtError instanceof Error ? caughtError.message : "تعذر تحميل العناوين.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, []);

  const startAdd = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      isDefault: addresses.length === 0,
    });
    setShowForm(true);
  };

  const startEdit = (address: CustomerAddress) => {
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
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editingId) {
        await updateAddress(editingId, {
          ...form,
          label: form.label.trim(),
          recipientName: form.recipientName.trim(),
          phone: form.phone.trim(),
          country: form.country.trim(),
          city: form.city.trim(),
          area: form.area.trim(),
          street: form.street.trim(),
        });
      } else {
        await createAddress({
          ...form,
          label: form.label.trim(),
          recipientName: form.recipientName.trim(),
          phone: form.phone.trim(),
          country: form.country.trim(),
          city: form.city.trim(),
          area: form.area.trim(),
          street: form.street.trim(),
        });
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await refreshAddresses();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "تعذر حفظ العنوان.");
    } finally {
      setSaving(false);
    }
  };

  const makeDefault = async (id: string) => {
    setError("");
    try {
      await setDefaultAddress(id);
      await refreshAddresses();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "تعذر تحديث العنوان الافتراضي.");
    }
  };

  const remove = async (id: string) => {
    setError("");
    try {
      await deleteAddress(id);
      await load();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "تعذر حذف العنوان.");
    }
  };

  return (
    <AccountWorkspace
      activeTab="addresses"
      title="العناوين"
      description="احفظ عناوين التوصيل لتسريع إتمام الطلب."
    >
      {error && (
        <div role="alert" className="mb-6 rounded-md border border-danger-100 bg-danger-surface px-4 py-3 text-body-sm font-medium text-danger-600">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-caption text-muted-foreground">
            {addresses.length} عنوان محفوظ
          </p>
        </div>

        <button
          type="button"
          onClick={startAdd}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand px-5 text-body font-medium text-white hover:bg-brand-hover"
        >
          <Plus className="h-4 w-4" />
          إضافة عنوان
        </button>
      </div>

      {showForm && (
        <section className="mb-7 rounded-md border border-neutral-200 bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-h3 font-bold text-foreground">
                {editingId ? "تعديل العنوان" : "إضافة عنوان جديد"}
              </h2>
              <p className="mt-1 text-body-sm text-muted-foreground">
                بيانات العنوان تُحفظ في حسابك.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-body-sm font-medium text-muted-foreground hover:text-foreground"
            >
              إلغاء
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="اسم العنوان" value={form.label} onChange={(value) => setForm((v) => ({ ...v, label: value }))} />
            <Field label="اسم المستلم" value={form.recipientName} onChange={(value) => setForm((v) => ({ ...v, recipientName: value }))} />
            <Field label="الهاتف" value={form.phone} onChange={(value) => setForm((v) => ({ ...v, phone: value }))} />
            <Field label="الدولة" value={form.country} onChange={(value) => setForm((v) => ({ ...v, country: value }))} />
            <Field label="المدينة" value={form.city} onChange={(value) => setForm((v) => ({ ...v, city: value }))} />
            <Field label="المنطقة" value={form.area} onChange={(value) => setForm((v) => ({ ...v, area: value }))} />
            <Field label="الشارع" value={form.street} onChange={(value) => setForm((v) => ({ ...v, street: value }))} />
            <Field label="المبنى" value={form.building ?? ""} onChange={(value) => setForm((v) => ({ ...v, building: value }))} />
            <Field label="الشقة" value={form.apartment ?? ""} onChange={(value) => setForm((v) => ({ ...v, apartment: value }))} />
            <Field label="الرمز البريدي" value={form.postalCode ?? ""} onChange={(value) => setForm((v) => ({ ...v, postalCode: value }))} />
            <Field label="ملاحظات" value={form.notes ?? ""} onChange={(value) => setForm((v) => ({ ...v, notes: value }))} />
          </div>

          <label className="mt-5 inline-flex cursor-pointer items-center gap-2 text-body-sm font-medium text-foreground">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(event) => setForm((v) => ({ ...v, isDefault: event.target.checked }))}
              className="h-4 w-4 accent-brand"
            />
            اجعل هذا العنوان افتراضيًا
          </label>

          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-brand px-6 text-body font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "جارٍ الحفظ..." : "حفظ العنوان"}
          </button>
        </section>
      )}

      {loading ? (
        <div className="rounded-md border border-neutral-200 bg-surface p-10 text-center text-body-sm text-muted-foreground">
          جارٍ تحميل العناوين...
        </div>
      ) : addresses.length === 0 ? (
        <div className="rounded-md border border-dashed border-neutral-300 bg-surface p-12 text-center">
          <MapPin className="mx-auto h-8 w-8 text-neutral-300" />
          <h2 className="mt-4 text-h3 font-bold text-foreground">
            لا توجد عناوين محفوظة
          </h2>
          <p className="mt-2 text-body-sm text-muted-foreground">
            أضف عنوانًا ليظهر تلقائيًا في Checkout.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {addresses.map((address) => (
            <article key={address.id} className="rounded-md border border-neutral-200 bg-surface p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-50 text-brand">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-body font-bold text-foreground">{address.label}</h2>
                      {address.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success-surface px-2.5 py-1 text-label font-medium text-success">
                          <CheckCircle2 className="h-3 w-3" />
                          افتراضي
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-body-sm font-medium text-foreground">{address.recipientName}</p>
                    <p className="mt-1 text-caption text-muted-foreground">{address.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => startEdit(address)} aria-label="تعديل العنوان" className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => remove(address.id)} aria-label="حذف العنوان" className="flex h-9 w-9 items-center justify-center rounded-md text-danger-500 hover:bg-danger-surface">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="mt-5 text-body-sm leading-6 text-muted-foreground">
                {[address.street, address.building, address.apartment && `شقة ${address.apartment}`, address.area, address.city, address.country].filter(Boolean).join("، ")}
              </p>

              {!address.isDefault && (
                <button
                  type="button"
                  onClick={() => makeDefault(address.id)}
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-md border border-neutral-200 px-4 text-body-sm font-medium text-foreground hover:bg-neutral-100"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  جعل افتراضي
                </button>
              )}
            </article>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Link href="/shop/checkout" className="inline-flex items-center gap-2 text-body-sm font-medium text-brand">
          الذهاب إلى Checkout
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>
    </AccountWorkspace>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-body-sm font-medium text-foreground">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-md border border-neutral-200 bg-surface px-3 text-body outline-none focus:border-brand focus:ring-4 focus:ring-primary-100"
      />
    </label>
  );
}
