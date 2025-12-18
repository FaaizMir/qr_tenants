import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "zh", "ms", "th", "vi", "id", "ko", "ja", "hi", "ar"],
  defaultLocale: "en",
  localePrefix: "always",
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);

export const rtlLocales = ["ar"];

export function getTextDirection(locale) {
  return rtlLocales.includes(locale) ? "rtl" : "ltr";
}

export function getLocaleDisplayName(locale) {
  const localeNames = {
    en: "English",
    zh: "中文",
    ms: "Bahasa Melayu",
    th: "ไทย",
    vi: "Tiếng Việt",
    id: "Bahasa Indonesia",
    ko: "한국어",
    ja: "日本語",
    hi: "हिन्दी",
    ar: "العربية",
  };
  return localeNames[locale] || locale;
}
