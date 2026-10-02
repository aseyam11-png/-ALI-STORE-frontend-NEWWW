"use client";

import {
  CheckCircle2,
  MapPin,
  Plus,
} from "lucide-react";

import Link from "next/link";

import {
  useAddressStore,
} from "@/stores/address-store";

interface CheckoutAddressSelectorProps {
  addresses: CustomerAddress[];
  selectedAddressId: string | null;
  onSelect: (address: CustomerAddress) => void;
}

export function CheckoutAddressSelector({
  addresses,
  selectedAddressId,
  onSelect,
}: CheckoutAddressSelectorProps) {

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
            <MapPin className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-black text-slate-900">
              Delivery address
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Choose where your order should be delivered.
            </p>
          </div>

        </div>

        <Link
          href="/buyer/addresses"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-[10px] font-black text-slate-600"
        >
          <Plus className="h-3.5 w-3.5" />
          Manage addresses
        </Link>

      </div>

      <div className="mt-5 grid gap-3">

        {addresses.map(
          (address) => {
            const selected =
              address.id ===
              selectedAddressId;

            return (
              <button
                key={
                  address.id
                }
                type="button"
                onClick={() => onSelect(address)}
                className={`w-full rounded-xl border p-4 text-start transition ${
                  selected
                    ? "border-blue-300 bg-blue-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >

                <div className="flex items-start gap-3">

                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      selected
                        ? "border-[#2563EB] bg-[#2563EB] text-white"
                        : "border-slate-300 text-transparent"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>

                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2">

                      <p className="text-sm font-black text-slate-900">
                        {
                          address.label
                        }
                      </p>

                      {address.isDefault && (
                        <span className="rounded-full bg-white px-2 py-1 text-[9px] font-black text-[#2563EB]">
                          Default
                        </span>
                      )}

                    </div>

                    <p className="mt-1 text-xs font-bold text-slate-700">
                      {
                        address.recipientName
                      }
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">

                      {
                        address.street
                      }

                      {address.building
                        ? ` · ${address.building}`
                        : ""}

                      {address.apartment
                        ? ` · Apt ${address.apartment}`
                        : ""}

                      {" · "}

                      {
                        address.area
                      }

                      {" · "}

                      {
                        address.city
                      }

                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      {
                        address.phone
                      }
                    </p>

                  </div>

                </div>

              </button>
            );
          },
        )}

        {addresses.length ===
          0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-7 text-center">

            <MapPin className="mx-auto h-6 w-6 text-slate-300" />

            <p className="mt-3 text-sm font-black text-slate-700">
              No shipping address
            </p>

            <Link
              href="/buyer/addresses"
              className="mt-4 inline-flex h-10 items-center rounded-lg bg-[#2563EB] px-4 text-xs font-black text-white"
            >
              Add address
            </Link>

          </div>
        )}

      </div>

    </section>
  );
}