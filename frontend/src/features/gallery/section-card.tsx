"use client";

import Image from "next/image";
import Link from "next/link";
import { Maximize2 } from "lucide-react";
import { useState } from "react";
import { DevArabicMarker } from "@/components/dev-arabic-marker";
import { SaveButton } from "@/components/save-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const quickViewLabel = `${t(locale, "gallery.quickViewLabel")}: ${card.title}`;

  return (
    <article id={`card-${card.id}`} className="group relative overflow-hidden rounded-md bg-transparent">
      <Link href={openHref} aria-label={openLabel} data-section-card-open={card.id} className="absolute inset-0 z-0 rounded-md focus-visible:ring-2 focus-visible:ring-ring">
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
          className="h-auto w-full rounded-md"
        />
        <p className="truncate pt-3 pb-1 text-xs text-muted-foreground">
          {card.sectionType}<span aria-hidden="true"> · </span>{card.sourceName}
        </p>
      </div>

      <Link
        href={`/${locale}/sources/${card.sourceSlug}`}
        aria-label={`${t(locale, "gallery.viewSourceLabel")}: ${card.sourceName}`}
        onClick={(event) => event.stopPropagation()}
        className="absolute start-3 bottom-4 z-30 flex size-9 items-center justify-center rounded-full border-2 border-white bg-secondary text-sm font-semibold text-secondary-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-ring"
      >
        {card.sourceInitial}
      </Link>

      <div
        role="group"
        aria-label={t(locale, "gallery.actionsLabel")}
        className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-end gap-2 p-2 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100"
      >
        <SaveButton sectionId={card.id} locale={locale} presentation="overlay" />
        <Dialog open={quickViewOpen} onOpenChange={setQuickViewOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="secondary"
              size="icon-lg"
              aria-label={quickViewLabel}
              onClick={(event) => event.stopPropagation()}
              className="rounded-full border border-border bg-card/95 shadow-sm"
            >
              <Maximize2 aria-hidden="true" />
            </Button>
          </DialogTrigger>
          <DialogContent closeLabel={t(locale, "shell.close")} className="max-w-[min(96vw,88rem)] overflow-hidden border-0 bg-transparent p-2 shadow-none sm:max-w-[min(96vw,88rem)]">
            <DialogTitle className="sr-only">{t(locale, "gallery.quickViewDialogLabel")}: {card.title}</DialogTitle>
            <Image
              src={card.image.src}
              alt={card.image.alt}
              width={card.image.width}
              height={card.image.height}
              sizes="96vw"
              className="mx-auto h-auto max-h-[82dvh] w-auto max-w-full rounded-md object-contain"
            />
          </DialogContent>
        </Dialog>
      </div>
    </article>
  );
}
