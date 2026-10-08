"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DevArabicMarker } from "@/components/dev-arabic-marker";
import { SaveButton } from "@/components/save-button";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";
import type { SectionCardData } from "./types";

interface SectionCardProps {
  card: SectionCardData;
  locale: SupportedLocale;
  /** Destination for the Open action. Supplied by the caller so no route is assumed. */
  openHref: string;
  /** Only the card above the fold sets this; every other image stays lazy. */
  priority?: boolean;
}

/**
 * Reference card: a 12px-radius white image card with 8px overlay actions —
 * source monogram top-left, Save + Open top-right. The whole body links to
 * the detail route; Save toggles the browser-local save; the arrow opens the
 * same detail destination. Hover is a calm 1.01 image zoom over 200ms.
 */
export function SectionCard({ card, locale, openHref, priority = false }: SectionCardProps) {
  const openLabel = `${t(locale, "gallery.openLabel")}: ${card.title}`;

  return (
    <article id={`card-${card.id}`} className="group relative overflow-hidden rounded-xl border border-border bg-card">
      <Link href={openHref} aria-label={openLabel} data-section-card-open={card.id} className="absolute inset-0 z-0 rounded-xl focus-visible:ring-2 focus-visible:ring-ring">
        <span className="sr-only">{openLabel}</span>
      </Link>

      <div className="pointer-events-none relative z-10">
        <DevArabicMarker isArabic={card.isArabic} locale={locale} />
        <Image
          src={card.image.src}
          alt={card.image.alt}
          width={card.image.width}
          height={card.image.height}
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, (max-width: 1439px) 33vw, 25vw"
          loading={priority ? "eager" : "lazy"}
          style={{ aspectRatio: `${card.image.width} / ${card.image.height}` }}
          className="h-auto w-full transition-transform duration-200 ease-out group-hover:scale-[1.01]"
        />
      </div>

      <Link
        href={`/${locale}/sources/${card.sourceSlug}`}
        aria-label={`${t(locale, "gallery.viewSourceLabel")}: ${card.sourceName}`}
        onClick={(event) => event.stopPropagation()}
        className="absolute start-2 top-2 z-30 flex size-8 items-center justify-center rounded-lg border border-border bg-secondary text-xs font-semibold text-secondary-foreground shadow-soft focus-visible:ring-2 focus-visible:ring-ring"
      >
        {card.sourceInitial}
      </Link>

      <div
        role="group"
        aria-label={t(locale, "gallery.actionsLabel")}
        className="pointer-events-none absolute end-0 top-0 z-30 flex items-start justify-end gap-1 p-2 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100"
      >
        <SaveButton sectionId={card.id} locale={locale} presentation="overlay" />
        <Link
          href={openHref}
          aria-label={card.title}
          data-section-card-arrow={card.id}
          onClick={(event) => event.stopPropagation()}
          className="pointer-events-auto flex size-8 items-center justify-center rounded-lg border border-border bg-card/90 text-foreground shadow-soft transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
