"use client";

import Link from "next/link";
import { EmptyState } from "@/components/content-states";
import { PageCard } from "@/features/gallery/page-card";
import { SourceCard } from "@/features/gallery/source-card";
import { MasonryGrid } from "@/features/gallery/masonry-grid";
import { estimateMasonryHeight } from "@/lib/masonry";
import { sourceSlug } from "@/lib/slugs";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";
import { CardLink } from "./card-link";
import type { CategoriesIndexData, PagesIndexData, SourcesIndexData } from "./types";

export function SourcesIndex({ locale, data }: { locale: SupportedLocale; data: SourcesIndexData }) {
  if (data.sources.length === 0) {
    return (
      <EmptyState
        title={t(locale, "detail.sourcesEmptyTitle")}
        description={t(locale, "detail.sourcesEmptyDescription")}
      />
    );
  }

  return (
    <MasonryGrid
      items={data.sources}
      getKey={(card) => card.id}
      heightEstimator={(card) => estimateMasonryHeight(card.image)}
      renderItem={(card) => (
        <CardLink href={`/${locale}/sources/${sourceSlug(card.id)}`} label={`${t(locale, "gallery.openLabel")}: ${card.name}`}>
          <SourceCard card={card} locale={locale} />
        </CardLink>
      )}
      label={t(locale, "gallery.sourcesLabel")}
    />
  );
}

export function PagesIndex({ locale, data }: { locale: SupportedLocale; data: PagesIndexData }) {
  if (data.pages.length === 0) {
    return (
      <EmptyState
        title={t(locale, "detail.pagesEmptyTitle")}
        description={t(locale, "detail.pagesEmptyDescription")}
      />
    );
  }

  return (
    <MasonryGrid
      items={data.pages}
      getKey={(card) => card.id}
      heightEstimator={(card) => estimateMasonryHeight(card.image)}
      renderItem={(card) => (
        <CardLink href={`/${locale}/pages/${card.id}`} label={`${t(locale, "gallery.openLabel")}: ${card.title}`}>
          <PageCard card={card} locale={locale} />
        </CardLink>
      )}
      label={t(locale, "gallery.pagesLabel")}
    />
  );
}

export function CategoriesIndex({ locale, data }: { locale: SupportedLocale; data: CategoriesIndexData }) {
  if (data.groups.length === 0) {
    return (
      <EmptyState
        title={t(locale, "detail.categoriesEmptyTitle")}
        description={t(locale, "detail.categoriesEmptyDescription")}
      />
    );
  }

  return (
    <div className="space-y-12">
      {data.groups.map((group) => (
        <section key={group.id} aria-label={group.title} className="space-y-4">
          <h2 className="text-base font-semibold tracking-[-0.01em]">{group.title}</h2>
          <ul className="flex flex-wrap gap-2">
            {group.entries.map((entry) => (
              <li key={entry.id}>
                <Link
                  href={entry.href}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <span className="font-medium">{entry.label}</span>
                  <span className="text-muted-foreground">{entry.count}</span>
                  <span className="sr-only">{t(locale, "detail.categoryCount")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
