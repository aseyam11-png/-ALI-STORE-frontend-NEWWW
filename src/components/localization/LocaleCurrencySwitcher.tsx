"use client";

import {
  Globe2,
} from "lucide-react";

import {
  LOCALES,
} from "@/features/localization/types/localization.types";

import {
  useLocalizationStore,
} from "@/stores/localization-store";

// Language-only now — currency selection was removed as part of the SAR
// standardization pass (ALI STORE frontend shows Saudi Riyal everywhere,
// independent of language). Component name kept for import stability
// (single consumer: layout/TopBar.tsx).
export function LocaleCurrencySwitcher() {
  const locale =
    useLocalizationStore(
      (state) =>
        state.locale,
    );

  const setLocale =
    useLocalizationStore(
      (state) =>
        state.setLocale,
    );

  return (
    <div className="flex items-center gap-2">

      <div className="flex items-center gap-1.5 text-slate-300">
        <Globe2 className="h-3.5 w-3.5" />
      </div>

      <label
        htmlFor="locale-select"
        className="sr-only"
      >
        Language
      </label>

      <select
        id="locale-select"
        value={locale}
        onChange={(
          event,
        ) =>
          setLocale(
            event.target
              .value as
              | "en"
              | "ar",
          )
        }
        className="h-8 rounded-lg bg-transparent px-1 text-[11px] font-bold text-slate-200 outline-none"
      >
        {LOCALES.map(
          (item) => (
            <option
              key={item.code}
              value={
                item.code
              }
              className="text-slate-900"
            >
              {item.nativeName}
            </option>
          ),
        )}
      </select>

    </div>
  );
}