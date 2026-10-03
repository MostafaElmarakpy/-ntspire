import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";
import { MasonrySkeleton } from "./masonry-skeleton";

/**
 * The gallery loading state (P4-08). It is used as an in-page Suspense fallback
 * rather than a route-level `loading.tsx`, because a route-level boundary wraps
 * the whole page and flushes a `200` shell before the page reaches its
 * `notFound()` guard — which would make the dev route reachable in production.
 */
export function GalleryLoading({ locale }: { locale: SupportedLocale }) {
  return (
    <section className="space-y-10" aria-busy="true">
      <div className="h-24 animate-pulse border-b border-border bg-muted/50" />
      <MasonrySkeleton label={`${t(locale, "gallery.title")} — ${t(locale, "ui.loading")}`} />
    </section>
  );
}
