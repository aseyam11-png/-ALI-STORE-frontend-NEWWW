"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  Locale,
} from "@/features/localization/types/localization.types";

interface LocalizationState {
  locale: Locale;

  setLocale: (locale: Locale) => void;
}

// Language only — currency is not part of this store. ALI STORE prices are
// always SAR regardless of the selected language (see
// features/localization/services/currency.service.ts); the two are
// intentionally not linked.
//
// `persist` keeps the chosen language across reloads (previously every
// reload silently reset the app to Arabic/RTL regardless of what the user
// picked, since the root <html dir/lang> in src/app/layout.tsx is static
// and this store had no storage). The very first paint of a fresh session
// is still the server-rendered ar/rtl default until the persisted value
// rehydrates on the client — that one-frame flash is an accepted limitation
// of a client-only fix; a flash-free fix would need server-side locale
// detection (a cookie read in the root layout), which is a backend/infra
// change outside this task's frontend-only scope.
export const useLocalizationStore = create<LocalizationState>()(
  persist(
    (set) => ({
      /*
       * IMPORTANT:
       * Keep the initial state deterministic.
       * Do not read localStorage/navigator during store creation.
       * This guarantees identical SSR and first client render.
       */
      locale: "ar",

      setLocale: (locale) => {
        set({ locale });

        if (typeof document !== "undefined") {
          document.documentElement.lang = locale;
          document.documentElement.dir =
            locale === "ar" ? "rtl" : "ltr";
        }
      },
    }),
    {
      name: "alistore-locale",
      partialize: (state) => ({ locale: state.locale }),
    },
  ),
);
