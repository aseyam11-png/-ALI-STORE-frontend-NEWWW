export type Locale = "en" | "ar";

export interface LocaleConfig {
  code: Locale;
  name: string;
  nativeName: string;
  dir: "ltr" | "rtl";
}

export const LOCALES: LocaleConfig[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    dir: "ltr",
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    dir: "rtl",
  },
];

// ALI STORE frontend is single-currency: Saudi Riyal (SAR) only. There is
// intentionally no Currency type/config here anymore — see
// features/localization/services/currency.service.ts for the one canonical
// price formatter. Currency is not tied to locale: language may change,
// price display does not.