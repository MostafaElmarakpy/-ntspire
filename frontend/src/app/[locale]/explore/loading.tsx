import { SectionSkeleton } from "@/components/content-states";
import { t } from "@/i18n/messages";

const SKELETON_SIZES = [
  { width: 1440, height: 640 },
  { width: 1440, height: 420 },
  { width: 1440, height: 960 },
  { width: 1440, height: 560 },
];

export default function ExploreLoading() {
  return (
    <section className="space-y-6" aria-label={t("en", "explore.resultsLabel")} aria-busy="true">
      <div className="h-24 animate-pulse border-b border-border bg-muted/50" />
      <div className="h-14 animate-pulse bg-muted/50" />
      <div className="columns-1 gap-[var(--masonry-gap)] sm:columns-2 xl:columns-3 2xl:columns-4" role="status" aria-label={t("en", "ui.loading")}>
        {SKELETON_SIZES.map((size, index) => <SectionSkeleton key={index} {...size} />)}
      </div>
    </section>
  );
}
