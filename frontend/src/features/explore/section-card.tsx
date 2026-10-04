import Image from "next/image";
import { DevArabicMarker } from "@/components/dev-arabic-marker";
import type { SupportedLocale } from "@/i18n/config";
import type { ExploreCardData } from "./types";

export function ExploreSectionCard({ card, locale, priority = false }: { card: ExploreCardData; locale: SupportedLocale; priority?: boolean }) {
  return (
    <article className="relative overflow-hidden rounded-md border border-border bg-card">
      <DevArabicMarker isArabic={card.isArabic} locale={locale} />
      <Image
        src={card.image.src}
        alt={card.image.alt}
        width={card.image.width}
        height={card.image.height}
        sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, (max-width: 1439px) 33vw, 25vw"
        loading={priority ? "eager" : "lazy"}
        className="h-auto w-full"
      />
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate font-semibold">{card.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{card.sectionType}</p>
          </div>
          <span className="shrink-0 text-xs font-medium text-primary">{card.sourceName}</span>
        </div>
        <ul className="flex flex-wrap gap-2" aria-label={card.tagsLabel}>
          {card.tags.slice(0, 3).map((tag) => (
            <li key={tag} className="rounded-sm bg-secondary px-2 py-1 text-xs text-secondary-foreground">{tag}</li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          {card.language} <span aria-hidden="true">·</span> {card.direction} <span aria-hidden="true">·</span> {card.devices.join(" / ")}
        </p>
      </div>
    </article>
  );
}
