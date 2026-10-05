"use client";

import { useParams } from "next/navigation";
import { ErrorState } from "@/components/error-state";
import { isSupportedLocale, type SupportedLocale } from "@/i18n/config";
import { t } from "@/i18n/messages";

/**
 * The error boundary for every route under a locale.
 *
 * A failed render is not a missing reference, so this keeps the reader on the
 * URL, keeps the navigation shell around them, and offers a retry that re-renders
 * the segment rather than reloading the document.
 */
export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // An error boundary receives no props of its own, so the locale comes from the
  // route it is rendering inside of.
  const params = useParams<{ locale?: string }>();
  const locale: SupportedLocale = typeof params?.locale === "string" && isSupportedLocale(params.locale)
    ? params.locale
    : "en";

  return (
    <ErrorState
      title={t(locale, "ui.errorTitle")}
      description={t(locale, "ui.errorDescription")}
      retryLabel={t(locale, "ui.retry")}
      onRetry={reset}
      key={error.digest ?? "locale-error"}
    />
  );
}
