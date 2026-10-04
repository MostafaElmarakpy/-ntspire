import { MasonrySkeleton } from "@/features/gallery/masonry-skeleton";
import { t } from "@/i18n/messages";

export default function ExploreLoading() {
  return (
    <section aria-label={t("en", "explore.resultsLabel")} aria-busy="true">
      <div className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10">
        <div className="hidden space-y-3 lg:block">
          <div className="h-5 w-24 animate-pulse rounded-sm bg-muted/50" />
          <div className="h-9 animate-pulse rounded-md bg-muted/50" />
          <div className="h-9 animate-pulse rounded-md bg-muted/50" />
          <div className="h-5 w-24 animate-pulse rounded-sm bg-muted/50" />
          <div className="h-9 animate-pulse rounded-md bg-muted/50" />
        </div>
        <div className="space-y-6">
          <div className="h-11 animate-pulse rounded-md bg-muted/50" />
          <MasonrySkeleton label={t("en", "ui.loading")} />
        </div>
      </div>
    </section>
  );
}
