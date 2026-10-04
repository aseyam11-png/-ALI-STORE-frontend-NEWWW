"use client";

import {
  CheckCircle2,
  MapPin,
  Plus,
} from "lucide-react";

import Link from "next/link";
import type { CustomerAddress } from "@/features/addresses/types/address.types";

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
    <section className="rounded-2xl border border-neutral-200 bg-surface p-5 shadow-sm">

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info-surface text-brand">
            <MapPin className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-black text-foreground">
              عنوان التوصيل
            </h2>

            <p className="mt-1 text-xs text-neutral-400">
              اختر العنوان الذي تريد استلام طلبك عليه.
            </p>
          </div>

        </div>

        <Link
          href="/buyer/addresses"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-neutral-200 px-3 text-[10px] font-black text-neutral-600"
        >
          <Plus className="h-3.5 w-3.5" />
          إدارة العناوين
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
                key={address.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onSelect(address)}
                className={`w-full rounded-xl border p-4 text-start transition ${
                  selected
                    ? "border-primary-300 bg-info-surface"
                    : "border-neutral-200 bg-surface hover:bg-neutral-50"
                }`}
              >

                <div className="flex items-start gap-3">

                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      selected
                        ? "border-brand bg-brand text-white"
                        : "border-neutral-300 text-transparent"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>

                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2">

                      <p className="text-sm font-black text-foreground">
                        {
                          address.label
                        }
                      </p>

                      {address.isافتراضي && (
                        <span className="rounded-full bg-surface px-2 py-1 text-[9px] font-black text-brand">
                          Default
                        </span>
                      )}

                    </div>

                    <p className="mt-1 text-xs font-bold text-neutral-700">
                      {
                        address.recipientName
                      }
                    </p>

                    <p className="mt-1 text-xs leading-5 text-neutral-500">

                      {
                        address.street
                      }

                      {address.building
                        ? ` · ${address.building}`
                        : ""}

                      {address.apartment
                        ? ` · شقة ${address.apartment}`
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

                    <p className="mt-1 text-[10px] text-neutral-400">
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
          <div className="rounded-xl border border-dashed border-neutral-300 p-7 text-center">

            <MapPin className="mx-auto h-6 w-6 text-neutral-300" />

            <p className="mt-3 text-sm font-black text-neutral-700">
              لا يوجد عنوان توصيل
            </p>

            <Link
              href="/buyer/addresses"
              className="mt-4 inline-flex h-10 items-center rounded-lg bg-brand px-4 text-xs font-black text-white"
            >
              إضافة عنوان
            </Link>

          </div>
        )}

      </div>

    </section>
  );
}