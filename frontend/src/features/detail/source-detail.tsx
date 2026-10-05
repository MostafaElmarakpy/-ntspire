"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/content-states";
import { DevArabicMarker } from "@/components/dev-arabic-marker";
import { SectionCard } from "@/features/gallery/section-card";
import { MasonryGrid } from "@/features/gallery/masonry-grid";
import { estimateMasonryHeight } from "@/lib/masonry";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";
import { trackSourceOpened } from "./analytics";
import { DetailBreadcrumbs } from "./detail-breadcrumbs";
import { FactList } from "./detail-facts";
import type { SourceDetailData } from "./types";

interface SourceDetailProps {
  locale: SupportedLocale;
  detail: SourceDetailData;
}

export function SourceDetail({ locale, detail }: SourceDetailProps) {
  useEffect(() => {
    trackSourceOpened(detail.id);
  }, [detail.id]);

  return (
    <article className="space-y-10">
      <DetailBreadcrumbs
        locale={locale}
        trail={[
          { label: t(locale, "detail.sourcesTitle"), href: `/${locale}/sources` },
          { label: detail.name },
        ]}
      />

      <header className="space-y-4">
        <h1 className="font-serif text-3xl leading-tight sm:text-4xl">{detail.name}</h1>
        <p className="max-w-2xl text-base text-muted-foreground">{detail.description}</p>
        <FactList facts={detail.facts} className="grid gap-x-8 gap-y-4 border-t border-border pt-6 sm:grid-cols-2 lg:grid-cols-3" />
      </header>

      <section aria-label={t(locale, "detail.sourcePagesTitle")} className="space-y-5">
        <h2 className="font-serif text-2xl">{t(locale, "detail.sourcePagesTitle")}</h2>
        {detail.pages.length > 0
          ? (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {detail.pages.map((page) => (
                <li key={page.id} className="min-w-0">
                  <Button asChild variant="outline" className="h-auto w-full justify-start px-4 py-3 text-start">
                    <Link href={`/${locale}/pages/${page.slug}`}>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="truncate font-medium">{page.title}</span>
                          <DevArabicMarker isArabic={page.isArabic} locale={locale} />
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {page.language} <span aria-hidden="true">·</span> {page.devicesLabel}{" "}
                          <span aria-hidden="true">·</span> {page.sectionCount} {t(locale, "gallery.sectionCount")}
                        </span>
                      </span>
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          )
          : (
            <EmptyState
              title={t(locale, "detail.sourcePagesEmptyTitle")}
              description={t(locale, "detail.sourcePagesEmptyDescription")}
            />
          )}
      </section>

      <section aria-label={t(locale, "detail.sourceSectionsTitle")} className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-serif text-2xl">{t(locale, "detail.sourceSectionsTitle")}</h2>
          <Badge variant="secondary">{detail.sections.length}</Badge>
        </div>
        {detail.sections.length > 0
          ? (
            <MasonryGrid
              items={detail.sections}
              getKey={(card) => card.id}
              heightEstimator={(card) => estimateMasonryHeight(card.image)}
              renderItem={(card, { priority }) => (
                <SectionCard
                  card={card}
                  locale={locale}
                  openHref={`/${locale}/sections/${card.id}`}
                  priority={priority}
                />
              )}
              label={t(locale, "gallery.sectionsLabel")}
            />
          )
          : (
            <EmptyState
              title={t(locale, "detail.sourceSectionsEmptyTitle")}
              description={t(locale, "detail.sourceSectionsEmptyDescription")}
            />
          )}
      </section>
    </article>
  );
}
