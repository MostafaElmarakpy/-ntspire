export const supportedLocales = ["en"] as const;

export type SupportedLocale = (typeof supportedLocales)[number];
export type TextDirection = "ltr" | "rtl";

const localeConfig: Record<SupportedLocale, { code: SupportedLocale; direction: TextDirection }> = {
  en: { code: "en", direction: "ltr" },
};

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return supportedLocales.some((supportedLocale) => supportedLocale === locale);
}

export function getLocaleConfig(locale: SupportedLocale) {
  return localeConfig[locale];
}
