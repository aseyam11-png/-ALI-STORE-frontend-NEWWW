"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/features/auth/session";
import {
  createBackendAddress,
  deleteBackendAddress,
  getBackendAddresses,
  setBackendDefaultAddress,
  updateBackendAddress,
} from "@/features/addresses/services/address-api.service";

import { AppShell } from "@/components/layout/AppShell";

import {
  useAddressStore,
} from "@/stores/address-store";

import type {
  CustomerAddress,
} from "@/features/addresses/types/address.types";

const emptyForm = {
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
};

export default function BuyerAddressesPage() {
  const session = useSession();

  const addresses =
    useAddressStore(
      (state) => state.addresses,
    );

  const replaceAddresses =
    useAddressStore(
      (state) => state.replaceAddresses,
    );

  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const addressesQuery = useQuery({
    queryKey: ["shipping-addresses"],
    queryFn: getBackendAddresses,
    enabled: session.status === "authenticated",
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!addressesQuery.data) return;

    replaceAddresses(
      addressesQuery.data.map((address) => ({
        id: String(address.id),
        customerId: String(session.user?.id ?? ""),
        label: address.label ?? "Address",
        recipientName: address.recipientName ?? "",
        phone: address.phone ?? "",
        country: address.country,
        city: address.city,
        area: address.area ?? "",
        street: address.street,
        building: address.building ?? "",
        apartment: address.apartment ?? "",
        postalCode: address.postalCode ?? "",
        notes: address.notes ?? "",
        isDefault: Boolean(address.isDefault),
      })),
    );
  }, [addressesQuery.data, replaceAddresses, session.user?.id]);

  const addAddress =
    useAddressStore(
      (state) =>
        state.addAddress,
    );

  const updateAddress =
    useAddressStore(
      (state) =>
        state.updateAddress,
    );

  const deleteAddress =
    useAddressStore(
      (state) =>
        state.deleteAddress,
    );

  const setDefaultAddress =
    useAddressStore(
      (state) =>
        state.setDefaultAddress,
    );

  const [
    editingId,
    setEditingId,
  ] = useState<
    string | null
  >(null);

  const [
    showForm,
    setShowForm,
  ] = useState(false);

  const [
    form,
    setForm,
  ] = useState(emptyForm);

  const startAdd =
    () => {
      setEditingId(
        null,
      );
      setForm(
        emptyForm,
      );
      setShowForm(
        true,
      );
    };

  const startEdit = (
    address: CustomerAddress,
  ) => {
    setEditingId(
      address.id,
    );

    setForm({
      label:
        address.label,
      recipientName:
        address.recipientName,
      phone:
        address.phone,
      country:
        address.country,
      city:
        address.city,
      area:
        address.area,
      street:
        address.street,
      building:
        address.building ??
        "",
      apartment:
        address.apartment ??
        "",
      postalCode:
        address.postalCode ??
        "",
      notes:
        address.notes ??
        "",
    });

    setShowForm(
      true,
    );
  };

  const save = async () => {
    setActionError("");

    if (
      !form.label.trim() ||
      !form.recipientName.trim() ||
      !form.phone.trim() ||
      !form.city.trim() ||
      !form.area.trim() ||
      !form.street.trim()
    ) {
      setActionError("أكمل بيانات العنوان المطلوبة.");
      return;
    }

    if (session.status !== "authenticated") {
      setActionError("سجّل الدخول أولًا لحفظ العنوان.");
      return;
    }

    setSaving(true);

    const payload = {
      label: form.label.trim(),
      recipientName: form.recipientName.trim(),
      phone: form.phone.trim(),
      country: form.country.trim() || "Palestine",
      city: form.city.trim(),
      area: form.area.trim(),
      street: form.street.trim(),
      building: form.building.trim(),
      apartment: form.apartment.trim(),
      postalCode: form.postalCode.trim(),
      notes: form.notes.trim(),
      isDefault: editingId
        ? Boolean(addresses.find((item) => item.id === editingId)?.isDefault)
        : addresses.length === 0,
    };

    try {
      if (editingId) {
        await updateBackendAddress(Number(editingId), payload);
      } else {
        await createBackendAddress(payload);
      }

      await addressesQuery.refetch();

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "تعذر حفظ العنوان.",
      );
    } finally {
      setSaving(false);
    }
  };

  const removeAddress = async (id: string) => {
    if (saving) return;
    setActionError("");
    setSaving(true);

    try {
      await deleteBackendAddress(Number(id));
      await addressesQuery.refetch();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "تعذر حذف العنوان.",
      );
    } finally {
      setSaving(false);
    }
  };

  const makeDefaultAddress = async (id: string) => {
    if (saving) return;
    setActionError("");
    setSaving(true);

    try {
      await setBackendDefaultAddress(Number(id));
      await addressesQuery.refetch();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "تعذر تعيين العنوان الافتراضي.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <main className="min-h-screen bg-[#F8FAFC]">

        {actionError && (
          <div
            role="alert"
            className="mx-auto mt-5 max-w-[1100px] rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700 sm:mx-6 lg:mx-auto"
          >
            {actionError}
          </div>
        )}

        <section className="border-b border-slate-200 bg-white">

          <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 lg:px-8">

            <Link
              href="/buyer"
              className="inline-flex items-center gap-2 text-xs font-black text-[#2563EB]"
            >
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              Account
            </Link>

            <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#2563EB]">
                  Delivery
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-tight text-[#0F172A]">
                  My addresses
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Manage saved shipping addresses for faster checkout.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  startAdd
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-black text-white"
              >
                <Plus className="h-4 w-4" />
                Add address
              </button>

            </div>

          </div>
        </section>

        <div className="mx-auto max-w-[1100px] px-4 py-7 sm:px-6 lg:px-8">

          {showForm && (
            <section className="mb-6 rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between gap-4">

                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {editingId
                      ? "Edit address"
                      : "Add new address"}
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Required fields must be completed before saving.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowForm(
                      false,
                    )
                  }
                  className="text-xs font-black text-slate-400 hover:text-slate-700"
                >
                  Cancel
                </button>

              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">

                <Field
                  label="Address label"
                  value={
                    form.label
                  }
                  placeholder="Home, Work..."
                  onChange={(
                    value,
                  ) =>
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,
                        label:
                          value,
                      }),
                    )
                  }
                />

                <Field
                  label="Recipient name"
                  value={
                    form.recipientName
                  }
                  placeholder="Full name"
                  onChange={(
                    value,
                  ) =>
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,
                        recipientName:
                          value,
                      }),
                    )
                  }
                />

                <Field
                  label="Phone"
                  value={
                    form.phone
                  }
                  placeholder="+970..."
                  onChange={(
                    value,
                  ) =>
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,
                        phone:
                          value,
                      }),
                    )
                  }
                />

                <Field
                  label="Country"
                  value={
                    form.country
                  }
                  placeholder="Country"
                  onChange={(
                    value,
                  ) =>
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,
                        country:
                          value,
                      }),
                    )
                  }
                />

                <Field
                  label="City"
                  value={
                    form.city
                  }
                  placeholder="City"
                  onChange={(
                    value,
                  ) =>
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,
                        city:
                          value,
                      }),
                    )
                  }
                />

                <Field
                  label="Area"
                  value={
                    form.area
                  }
                  placeholder="Area / district"
                  onChange={(
                    value,
                  ) =>
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,
                        area:
                          value,
                      }),
                    )
                  }
                />

                <Field
                  label="Street"
                  value={
                    form.street
                  }
                  placeholder="Street"
                  onChange={(
                    value,
                  ) =>
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,
                        street:
                          value,
                      }),
                    )
                  }
                />

                <Field
                  label="Building"
                  value={
                    form.building
                  }
                  placeholder="Building number"
                  onChange={(
                    value,
                  ) =>
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,
                        building:
                          value,
                      }),
                    )
                  }
                />

                <Field
                  label="Apartment"
                  value={
                    form.apartment
                  }
                  placeholder="Apartment"
                  onChange={(
                    value,
                  ) =>
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,
                        apartment:
                          value,
                      }),
                    )
                  }
                />

                <Field
                  label="Postal code"
                  value={
                    form.postalCode
                  }
                  placeholder="Optional"
                  onChange={(
                    value,
                  ) =>
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,
                        postalCode:
                          value,
                      }),
                    )
                  }
                />

                <div className="sm:col-span-2">

                  <label
                    htmlFor="address-notes"
                    className="text-xs font-black text-slate-600"
                  >
                    Delivery notes
                  </label>

                  <textarea
                    id="address-notes"
                    rows={3}
                    value={
                      form.notes
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (
                          current,
                        ) => ({
                          ...current,
                          notes:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    placeholder="Optional delivery instructions"
                    className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100"
                  />

                </div>

              </div>

              <button
                type="button"
                onClick={
                  save
                }
                className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#2563EB] px-5 text-sm font-black text-white"
              >
                {editingId
                  ? "Save changes"
                  : "Save address"}
              </button>

            </section>
          )}

          <div className="grid gap-5 md:grid-cols-2">

            {addresses.map(
              (address) => (
                <article
                  key={
                    address.id
                  }
                  className={`rounded-2xl border bg-white p-5 shadow-sm ${
                    address.isDefault
                      ? "border-blue-300 ring-2 ring-blue-50"
                      : "border-slate-200"
                  }`}
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                        <MapPin className="h-5 w-5" />
                      </div>

                      <div>

                        <div className="flex flex-wrap items-center gap-2">

                          <h2 className="text-sm font-black text-slate-900">
                            {
                              address.label
                            }
                          </h2>

                          {address.isDefault && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[9px] font-black text-[#2563EB]">
                              <CheckCircle2 className="h-3 w-3" />
                              Default
                            </span>
                          )}

                        </div>

                        <p className="mt-2 text-sm font-bold text-slate-800">
                          {
                            address.recipientName
                          }
                        </p>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void removeAddress(
                          address.id,
                        )
                      }
                      aria-label={`Delete ${address.label} address`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                  </div>

                  <div className="mt-5 space-y-1 text-xs leading-5 text-slate-500">

                    <p>
                      {
                        address.phone
                      }
                    </p>

                    <p>
                      {
                        address.street
                      }
                      {address.building
                        ? ` · Building ${address.building}`
                        : ""}
                      {address.apartment
                        ? ` · Apt ${address.apartment}`
                        : ""}
                    </p>

                    <p>
                      {
                        address.area
                      }
                      ,{" "}
                      {
                        address.city
                      }
                      ,{" "}
                      {
                        address.country
                      }
                    </p>

                    {address.notes && (
                      <p className="pt-2 text-slate-400">
                        Note:{" "}
                        {
                          address.notes
                        }
                      </p>
                    )}

                  </div>

                  <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">

                    <button
                      type="button"
                      onClick={() =>
                        startEdit(
                          address,
                        )
                      }
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-[10px] font-black text-slate-600"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>

                    {!address.isDefault && (
                      <button
                        type="button"
                        onClick={() =>
                          void makeDefaultAddress(
                            address.id,
                          )
                        }
                        className="inline-flex h-9 items-center rounded-lg bg-blue-50 px-3 text-[10px] font-black text-[#2563EB]"
                      >
                        Set default
                      </button>
                    )}

                  </div>

                </article>
              ),
            )}

          </div>

        </div>
      </main>
    </AppShell>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (
    value: string,
  ) => void;
}) {
  const id =
    `field-${label
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-",
      )}`;

  return (
    <div>
      <label
        htmlFor={id}
        className="text-xs font-black text-slate-600"
      >
        {label}
      </label>

      <input
        id={id}
        value={value}
        placeholder={
          placeholder
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}