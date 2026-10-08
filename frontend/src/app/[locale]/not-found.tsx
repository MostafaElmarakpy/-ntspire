import Link from "next/link";
import { Button } from "@/components/ui/button";
import { supportedLocales, type SupportedLocale } from "@/i18n/config";
import { t } from "@/i18n/messages";

/**
 * The not-found page for a bad id or slug on a detail route.
 *
 * `not-found.js` receives no props, so there is no per-request locale to read;
 * the app currently ships one locale, and this takes it from the same list the
 * router validates against rather than hardcoding a language.
 */
const locale: SupportedLocale = supportedLocales[0];

export default function LocaleNotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center py-16 text-center">
      <h1 className="text-[26px] font-medium leading-[1.2] tracking-[-0.01em] sm:text-[28px]">{t(locale, "notFound.title")}</h1>
      <p className="mt-3 text-muted-foreground">{t(locale, "notFound.description")}</p>
      <Button asChild className="mt-6 min-h-11 px-5">
        <Link href={`/${locale}/explore`}>{t(locale, "shell.explore")}</Link>
      </Button>
    </div>
  );
}
