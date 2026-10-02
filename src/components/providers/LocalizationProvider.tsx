"use client";

import {
  useEffect,
  type ReactNode,
} from "react";

import {
  useLocalizationStore,
} from "@/stores/localization-store";

interface LocalizationProviderProps {
  children: ReactNode;
}

export function LocalizationProvider({
  children,
}: LocalizationProviderProps) {
  const locale = useLocalizationStore(
    (state) => state.locale,
  );

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir =
      locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return <>{children}</>;
}
