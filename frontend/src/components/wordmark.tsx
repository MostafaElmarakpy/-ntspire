import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";

export function Wordmark({ locale = "en" }: { locale?: SupportedLocale }) {
  return <span className="font-serif text-[1.65rem] font-semibold leading-none">{t(locale, "wordmark")}</span>;
}
