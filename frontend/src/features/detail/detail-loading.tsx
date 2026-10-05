import { Skeleton } from "@/components/ui/skeleton";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";

/**
 * The shape of a detail page before its data arrives: breadcrumb, heading,
 * capture, metadata. Used both as the in-page Suspense fallback (so the shell is
 * already interactive while the record resolves) and, indirectly, as the loading
 * contract the routes are verified against.
 */
export function DetailLoading({ locale }: { locale: SupportedLocale }) {
  return (
    <div className="space-y-10" role="status" aria-busy="true" aria-label={t(locale, "detail.loadingLabel")}>
      <Skeleton className="h-5 w-64" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full max-w-2xl" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
        <div className="space-y-5">
          <Skeleton className="h-11 w-56 rounded-md" />
          <Skeleton className="h-64 w-full rounded-md sm:h-96" />
          <Skeleton className="h-11 w-full max-w-lg rounded-md" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
    </div>
  );
}
