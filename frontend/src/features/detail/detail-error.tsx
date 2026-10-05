"use client";

import { ErrorState } from "@/components/error-state";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";

/**
 * Retry reloads the route, minus the `?__mock=` mode that forced the failure.
 *
 * A real service failure is transient, so reloading the route is the retry. The
 * forced mock mode is the one thing a reload could never get past — it lives in
 * the URL and would fail again identically — so it is dropped first. That keeps
 * the button honest in the states the suite can actually reach, and matches how
 * Explore's retry reissues its request without the mock mode.
 */
function retryRoute(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete("__mock");
  window.location.replace(url);
}

/**
 * The state a detail route renders when the service layer failed. A failed load
 * is not a missing reference, so it never becomes a not-found page: the route
 * stays on its URL and offers a retry.
 */
export function DetailError({ locale }: { locale: SupportedLocale }) {
  return (
    <ErrorState
      title={t(locale, "ui.errorTitle")}
      description={t(locale, "ui.errorDescription")}
      retryLabel={t(locale, "ui.retry")}
      onRetry={retryRoute}
    />
  );
}
