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

export function SectionCard({ card, locale, openHref, priority = false }: SectionCardProps) {
  const openLabel = `${t(locale, "gallery.openLabel")}: ${card.title}`;

  return (
    <article id={`card-${card.id}`} className="group relative overflow-hidden rounded-md border border-border bg-card">
      <DevArabicMarker isArabic={card.isArabic} locale={locale} />
      {/*
        Hover overlay. Absolutely positioned so showing or hiding the actions can
        never change the measured card height, and forced visible on touch devices
        that have no hover state.
      */}
      <div
        role="group"
        aria-label={t(locale, "gallery.actionsLabel")}
        className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-end gap-2 p-3 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100"
      >
        <SaveButton sectionId={card.id} locale={locale} presentation="overlay" />
        <Link
          href={openHref}
          aria-label={openLabel}
          className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-sm transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowUpRight className="size-5" aria-hidden="true" />
        </Link>
      </div>

      <Link href={openHref} className="block focus-visible:outline-none">
        <Image
          src={card.image.src}
          alt={card.image.alt}
          width={card.image.width}
          height={card.image.height}
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, (max-width: 1439px) 33vw, 25vw"
          loading={priority ? "eager" : "lazy"}
          className="h-auto w-full"
        />
      </Link>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{card.title}</h3>
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
          {card.language} <span aria-hidden="true">·</span> {card.devicesLabel}
        </p>
      </div>
    </article>
  );
}
