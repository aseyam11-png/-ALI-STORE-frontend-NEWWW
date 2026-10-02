"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { useSession } from "@/features/auth/session";
import {
  createServerAddress,
  deleteServerAddress,
  getServerAddresses,
  setServerDefaultAddress,
  updateServerAddress,
  type AddressInput,
  type BackendAddress,
} from "@/features/addresses/services/address-api.service";

const emptyForm: AddressInput = {
  street: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  isDefault: false,
};

export default function BuyerAddressesPage() {
  const session = useSession();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AddressInput>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const addressesQuery = useQuery({
    queryKey: ["server-addresses"],
    queryFn: getServerAddresses,
    enabled: session.status === "authenticated",
    staleTime: 30_000,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) return updateServerAddress(editingId, form);
      return createServerAddress(form);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["server-addresses"] });
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      setError("");
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "تعذر حفظ العنوان.",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteServerAddress,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["server-addresses"] }),
    onError: (mutationError) => {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "تعذر حذف العنوان.",
      );
    },
  });

  const defaultMutation = useMutation({
    mutationFn: setServerDefaultAddress,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["server-addresses"] }),
    onError: (mutationError) => {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "تعذر تحديث العنوان الافتراضي.",
      );
    },
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
  };

  const openEdit = (address: BackendAddress) => {
    setEditingId(address.id);
    setForm({
      street: address.street,
      city: address.city,
      state: address.state ?? "",
      country: address.country,
      postalCode: address.postalCode ?? "",
      isDefault: address.isDefault,
    });
    setShowForm(true);
    setError("");
  };

  const submit = () => {
    if (!form.street.trim() || !form.city.trim() || !form.country.trim()) {
      setError("أكمل الشارع والمدينة والدولة.");
      return;
    }

    saveMutation.mutate();
  };

  return (
    <AccountWorkspace
      activeTab="addresses"
      title="العناوين"
      description="إدارة عناوين الشحن المحفوظة على حسابك."
    >
      {session.status !== "authenticated" ? (
        <div className="rounded-2xl border border-neutral-200 bg-surface p-10 text-center">
          <MapPin className="mx-auto h-9 w-9 text-neutral-300" />
          <h2 className="mt-4 text-xl font-bold text-foreground">
            سجّل الدخول لإدارة عناوينك
          </h2>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {addressesQuery.data?.length ?? 0} عنوان محفوظ
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-white hover:bg-brand-hover"
            >
              <Plus className="h-4 w-4" />
              إضافة عنوان
            </button>
          </div>

          {error && (
            <p role="alert" className="mt-5 rounded-xl border border-danger-100 bg-danger-surface px-4 py-3 text-sm font-medium text-danger-700">
              {error}
            </p>
          )}

          {showForm && (
            <section className="mt-6 rounded-2xl border border-neutral-200 bg-surface p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-foreground">
                  {editingId ? "تعديل العنوان" : "عنوان جديد"}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-sm font-bold text-muted-foreground hover:text-foreground"
                >
                  إلغاء
                </button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <input
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                  placeholder="الشارع والعنوان"
                  className="h-11 rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-brand"
                />
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="المدينة"
                  className="h-11 rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-brand"
                />
                <input
                  value={form.state ?? ""}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="المنطقة / المحافظة"
                  className="h-11 rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-brand"
                />
                <input
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder="الدولة"
                  className="h-11 rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-brand"
                />
                <input
                  value={form.postalCode ?? ""}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  placeholder="الرمز البريدي"
                  className="h-11 rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-brand"
                />
              </div>

              <label className="mt-5 flex items-center gap-3 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={Boolean(form.isDefault)}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  className="h-5 w-5 accent-brand"
                />
                اجعل هذا العنوان افتراضيًا
              </label>

              <button
                type="button"
                onClick={submit}
                disabled={saveMutation.isPending}
                className="mt-6 h-11 rounded-xl bg-brand px-5 text-sm font-bold text-white disabled:opacity-50"
              >
                {saveMutation.isPending ? "جاري الحفظ..." : "حفظ العنوان"}
              </button>
            </section>
          )}

          <div className="mt-7 grid gap-4">
            {addressesQuery.isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-32 animate-pulse rounded-2xl bg-neutral-100" />
              ))
            ) : addressesQuery.data?.length ? (
              addressesQuery.data.map((address) => (
                <article
                  key={address.id}
                  className="rounded-2xl border border-neutral-200 bg-surface p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-brand">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-foreground">
                            {address.city}
                          </h3>
                          {address.isDefault && (
                            <span className="rounded-full bg-success-surface px-2.5 py-1 text-[10px] font-bold text-success-700">
                              افتراضي
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {[
                            address.street,
                            address.city,
                            address.state,
                            address.country,
                            address.postalCode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!address.isDefault && (
                        <button
                          type="button"
                          onClick={() => defaultMutation.mutate(address.id)}
                          disabled={defaultMutation.isPending}
                          className="inline-flex h-9 items-center rounded-lg border border-neutral-200 px-3 text-xs font-bold hover:border-brand hover:text-brand disabled:opacity-50"
                        >
                          جعله افتراضيًا
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openEdit(address)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-muted-foreground hover:text-brand"
                        aria-label="تعديل العنوان"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("حذف هذا العنوان؟")) {
                            deleteMutation.mutate(address.id);
                          }
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-danger-600 hover:bg-danger-surface"
                        aria-label="حذف العنوان"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-neutral-200 bg-surface p-10 text-center">
                <MapPin className="mx-auto h-9 w-9 text-neutral-300" />
                <h2 className="mt-4 text-xl font-bold text-foreground">لا توجد عناوين</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  أضف عنوانك مرة واحدة واستخدمه لاحقًا في checkout.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </AccountWorkspace>
  );
}
