import { MasonrySkeleton } from "@/features/gallery/masonry-skeleton";
import { t } from "@/i18n/messages";

export default function ExploreLoading() {
  return (
    <section className="space-y-6" aria-label={t("en", "explore.resultsLabel")} aria-busy="true">
      <div className="h-24 animate-pulse border-b border-border bg-muted/50" />
      <div className="h-14 animate-pulse bg-muted/50" />
      <MasonrySkeleton label={t("en", "ui.loading")} />
    </section>
  );
}
