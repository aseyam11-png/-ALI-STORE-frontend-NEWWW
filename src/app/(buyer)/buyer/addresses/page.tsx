"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { useSession } from "@/features/auth/session";
import type { CustomerAddress } from "@/features/addresses/types/address.types";
import { useAddressStore } from "@/stores/address-store";

type AddressForm = {
  label: string;
  country: string;
  city: string;
  area: string;
  street: string;
  postalCode: string;
  isDefault: boolean;
};

const emptyForm: AddressForm = {
  label: "",
  country: "Palestine",
  city: "",
  area: "",
  street: "",
  postalCode: "",
  isDefault: false,
};

export default function BuyerAddressesPage() {
  const {
    status: sessionStatus,
    user,
  } = useSession();

  const addresses =
    useAddressStore(
      (state) =>
        state.addresses,
    );
  const hydrate =
    useAddressStore(
      (state) => state.hydrate,
    );
  const addAddress =
    useAddressStore(
      (state) => state.addAddress,
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
  ] = useState<string | null>(null);

  const [
    showForm,
    setShowForm,
  ] = useState(false);

  const [
    form,
    setForm,
  ] = useState<AddressForm>(
    emptyForm,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    if (
      sessionStatus !==
      "authenticated"
    ) {
      return;
    }

    setLoading(true);
    setError("");

    void hydrate()
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load addresses.",
        );
      })
      .finally(() =>
        setLoading(false),
      );
  }, [
    sessionStatus,
    hydrate,
  ]);

  const startAdd = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      isDefault:
        addresses.length === 0,
    });
    setShowForm(true);
    setError("");
  };

  const startEdit = (
    address: CustomerAddress,
  ) => {
    setEditingId(
      address.id,
    );
    setForm({
      label:
        address.label ||
        "Address",
      country:
        address.country,
      city:
        address.city,
      area:
        address.area,
      street:
        address.street,
      postalCode:
        address.postalCode ??
        "",
      isDefault:
        address.isDefault,
    });
    setShowForm(true);
    setError("");
  };

  const save = async () => {
    if (
      !form.city.trim() ||
      !form.street.trim() ||
      !form.country.trim()
    ) {
      setError(
        "Country, city and street are required.",
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        label:
          form.label.trim() ||
          "Address",
        recipientName:
          user
            ? `${user.firstName} ${user.lastName}`.trim()
            : "",
        phone:
          user?.phoneNumber ??
          "",
        customerId:
          user
            ? String(user.id)
            : "",
        country:
          form.country.trim(),
        city:
          form.city.trim(),
        area:
          form.area.trim(),
        street:
          form.street.trim(),
        postalCode:
          form.postalCode.trim(),
        isDefault:
          form.isDefault,
      };

      if (editingId) {
        await updateAddress(
          editingId,
          payload,
        );
      } else {
        await addAddress(
          payload,
        );
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save address.",
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (
    id: string,
  ) => {
    if (
      !window.confirm(
        "Delete this address?",
      )
    ) {
      return;
    }

    setError("");

    try {
      await deleteAddress(
        id,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete address.",
      );
    }
  };

  const makeDefault = async (
    id: string,
  ) => {
    setError("");

    try {
      await setDefaultAddress(
        id,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update the default address.",
      );
    }
  };

  const accountName =
    user
      ? `${user.firstName} ${user.lastName}`.trim()
      : "Account";

  return (
    <AppShell>
      <main className="min-h-screen bg-[#F8FAFC]">
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
                  Saved addresses used by checkout.
                </p>
              </div>

              <button
                type="button"
                onClick={startAdd}
                disabled={
                  sessionStatus !==
                  "authenticated"
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add address
              </button>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1100px] px-4 py-7 sm:px-6 lg:px-8">
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-danger-100 bg-danger-surface px-4 py-3 text-sm font-bold text-danger-700"
            >
              {error}
            </div>
          )}

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
                    The store saves the delivery location and default selection.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowForm(false)
                  }
                  className="text-xs font-black text-slate-400 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Address label"
                  value={form.label}
                  placeholder="Home, Work..."
                  onChange={(value) =>
                    setForm(
                      (current) => ({
                        ...current,
                        label:
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
                  onChange={(value) =>
                    setForm(
                      (current) => ({
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
                  onChange={(value) =>
                    setForm(
                      (current) => ({
                        ...current,
                        city: value,
                      }),
                    )
                  }
                />

                <Field
                  label="Area / district"
                  value={
                    form.area
                  }
                  onChange={(value) =>
                    setForm(
                      (current) => ({
                        ...current,
                        area: value,
                      }),
                    )
                  }
                />

                <Field
                  label="Street"
                  value={
                    form.street
                  }
                  onChange={(value) =>
                    setForm(
                      (current) => ({
                        ...current,
                        street:
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
                  onChange={(value) =>
                    setForm(
                      (current) => ({
                        ...current,
                        postalCode:
                          value,
                      }),
                    )
                  }
                />

                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={
                      form.isDefault
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (current) => ({
                          ...current,
                          isDefault:
                            event
                              .target
                              .checked,
                        }),
                      )
                    }
                    className="h-4 w-4 accent-[#2563EB]"
                  />
                  <span className="text-xs font-bold text-slate-700">
                    Use this as my default delivery address
                  </span>
                </label>
              </div>

              <button
                type="button"
                onClick={() => {
                  void save();
                }}
                disabled={
                  saving
                }
                className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#2563EB] px-5 text-sm font-black text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving…"
                  : editingId
                    ? "Save changes"
                    : "Save address"}
              </button>
            </section>
          )}

          {loading ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <p className="text-sm font-bold text-slate-500">
                Loading addresses…
              </p>
            </section>
          ) : addresses.length ===
            0 ? (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <MapPin className="mx-auto h-9 w-9 text-slate-300" />
              <h2 className="mt-4 text-xl font-black text-slate-900">
                No saved addresses
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Add your first delivery address to speed up checkout.
              </p>
            </section>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {addresses.map(
                (address) => (
                  <article
                    key={address.id}
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
                              {address.label ||
                                "Address"}
                            </h2>

                            {address.isDefault && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[9px] font-black text-[#2563EB]">
                                <CheckCircle2 className="h-3 w-3" />
                                Default
                              </span>
                            )}
                          </div>

                          <p className="mt-2 text-sm font-bold text-slate-800">
                            {accountName}
                          </p>
                          {user?.phoneNumber && (
                            <p className="mt-1 text-xs text-slate-400">
                              {user.phoneNumber}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          void remove(
                            address.id,
                          );
                        }}
                        aria-label={`Delete ${address.label} address`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-5 space-y-1 text-xs leading-5 text-slate-500">
                      <p>
                        {address.street}
                      </p>
                      <p>
                        {address.area
                          ? `${address.area}, `
                          : ""}
                        {address.city},{" "}
                        {address.country}
                      </p>
                      {address.postalCode && (
                        <p>
                          Postal code:{" "}
                          {
                            address.postalCode
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
                          onClick={() => {
                            void makeDefault(
                              address.id,
                            );
                          }}
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
          )}
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
    `address-field-${label
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
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}
