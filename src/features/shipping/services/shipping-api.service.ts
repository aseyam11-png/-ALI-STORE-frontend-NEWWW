import { apiClient } from "@/lib/api/http-client";

const COUNTRY_CODES: Record<string, string> = {
  palestine: "PS",
  "state of palestine": "PS",
  "palestinian territories": "PS",
  "west bank": "PS",
  gaza: "PS",
  "gaza strip": "PS",
  "فلسطين": "PS",
  "دولة فلسطين": "PS",
  "الضفة الغربية": "PS",
  "قطاع غزة": "PS",
  jordan: "JO",
  "الأردن": "JO",
  egypt: "EG",
  "مصر": "EG",
  israel: "IL",
  "إسرائيل": "IL",
  "saudi arabia": "SA",
  "السعودية": "SA",
  "المملكة العربية السعودية": "SA",
  "united arab emirates": "AE",
  uae: "AE",
  "الإمارات": "AE",
  "الإمارات العربية المتحدة": "AE",
  qatar: "QA",
  "قطر": "QA",
  kuwait: "KW",
  "الكويت": "KW",
  lebanon: "LB",
  "لبنان": "LB",
  iraq: "IQ",
  "العراق": "IQ",
  oman: "OM",
  "عمان": "OM",
  bahrain: "BH",
  "البحرين": "BH",
  yemen: "YE",
  "اليمن": "YE",
  turkey: "TR",
  türkiye: "TR",
  "تركيا": "TR",
  "united states": "US",
  "united states of america": "US",
  usa: "US",
  "الولايات المتحدة": "US",
  canada: "CA",
  "كندا": "CA",
  "united kingdom": "GB",
  uk: "GB",
  britain: "GB",
  "المملكة المتحدة": "GB",
  germany: "DE",
  "ألمانيا": "DE",
  france: "FR",
  "فرنسا": "FR",
  australia: "AU",
  "أستراليا": "AU",
};

export function normalizeShippingCountryCode(country?: string): string | undefined {
  if (!country?.trim()) return undefined;
  const normalized = country.trim().toLocaleLowerCase().replace(/\\s+/g, " ");
  if (/^[a-z]{2}$/i.test(country.trim())) return country.trim().toUpperCase();
  return COUNTRY_CODES[normalized];
}

export type ShippingMethod = {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  estimatedMinDays: number;
  estimatedMaxDays: number;
  countryCode?: string | null;
  active: boolean;
};

export async function getShippingMethods(
  country?: string,
  currency?: string,
): Promise<ShippingMethod[]> {
  const params = new URLSearchParams();
  const countryCode = normalizeShippingCountryCode(country);
  if (countryCode) params.set("country", countryCode);
  if (currency?.trim()) params.set("currency", currency.trim().toUpperCase());

  const query = params.toString();
  return apiClient.requestData<ShippingMethod[]>(
    "/api/v1/shipping/methods" + (query ? "?" + query : ""),
  );
}