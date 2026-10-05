"use client";

import { estimateMasonryHeight } from "@/lib/masonry";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";
import { MasonryGrid } from "./masonry-grid";
import { PageCard } from "./page-card";
import { SectionCard } from "./section-card";
import { SourceCard } from "./source-card";
import type { GalleryData } from "./types";

interface GalleryExperienceProps {
  locale: SupportedLocale;
  data: GalleryData;
}

export function GalleryExperience({ locale, data }: GalleryExperienceProps) {
  return (
    <div className="space-y-14">
      <section aria-labelledby="gallery-sections-heading">
        <h2 id="gallery-sections-heading" className="mb-5 font-serif text-2xl">{t(locale, "gallery.sectionsTitle")}</h2>
        <MasonryGrid
          items={data.sections}
          getKey={(card) => card.id}
          heightEstimator={(card) => estimateMasonryHeight(card.image)}
          renderItem={(card, { priority }) => (
            <SectionCard card={card} locale={locale} openHref={`/${locale}/sections/${card.id}`} priority={priority} />
          )}
          label={t(locale, "gallery.sectionsLabel")}
          eagerRows={3}
        />
      </section>

      <section aria-labelledby="gallery-pages-heading">
        <h2 id="gallery-pages-heading" className="mb-5 font-serif text-2xl">{t(locale, "gallery.pagesTitle")}</h2>
        <MasonryGrid
          items={data.pages}
          getKey={(card) => card.id}
          heightEstimator={(card) => estimateMasonryHeight(card.image)}
          renderItem={(card) => <PageCard card={card} locale={locale} />}
          label={t(locale, "gallery.pagesLabel")}
        />
      </section>

      <section aria-labelledby="gallery-sources-heading">
        <h2 id="gallery-sources-heading" className="mb-5 font-serif text-2xl">{t(locale, "gallery.sourcesTitle")}</h2>
        <MasonryGrid
          items={data.sources}
          getKey={(card) => card.id}
          heightEstimator={(card) => estimateMasonryHeight(card.image)}
          renderItem={(card) => <SourceCard card={card} locale={locale} />}
          label={t(locale, "gallery.sourcesLabel")}
        />
      </section>
    </div>
  );
}
