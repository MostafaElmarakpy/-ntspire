"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";
import { centeringScrollTop, cropRectToPercent, cropRectToPixels } from "@/lib/section-crop";
import type { SectionDeviceView } from "./types";

interface ViewInContextProps {
  locale: SupportedLocale;
  sectionTitle: string;
  /** The *current* device's view: its own page screenshot and its own rectangle. */
  view: SectionDeviceView;
  onOpen: () => void;
}

/**
 * View in context.
 *
 * The screenshot and the highlight both come from the currently shown device:
 * the mobile view highlights the mobile crop on the mobile page capture, never a
 * rectangle measured on the desktop one. The rectangle is positioned in
 * percentages of the screenshot, so it stays correct at every width without
 * measuring anything at runtime; pixels are computed only to decide how far to
 * scroll, and how far to scroll is what actually centres the band.
 */
export function ViewInContext({ locale, sectionTitle, view, onOpen }: ViewInContextProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const [loadedPageImage, setLoadedPageImage] = useState<string>();

  const highlight = cropRectToPercent(view.crop, view.pageImage);

  useEffect(() => {
    if (loadedPageImage !== view.pageImage.src) return;
    const frame = requestAnimationFrame(() => {
      const container = scrollRef.current;
      const band = highlightRef.current;
      if (!container || !band) return;

      const rect = cropRectToPixels(view.crop, view.pageImage, {
        width: band.parentElement?.clientWidth ?? 0,
        height: band.parentElement?.clientHeight ?? 0,
      });
      container.scrollTop = centeringScrollTop(rect, container.clientHeight);
      // The frame itself takes focus, not the band: the band is decoration, and
      // a keyboard user needs a focus target on the scroll region so they can
      // scroll it with the arrow keys.
      container.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [loadedPageImage, view]);

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) onOpen();
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="min-h-11 gap-2 px-4" data-testid="context-action">
          {t(locale, "detail.viewInContext")}
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={t(locale, "detail.contextClose")} className="sm:max-w-4xl" data-testid="context-dialog">
        <DialogHeader>
          <DialogTitle>{t(locale, "detail.contextTitle")}</DialogTitle>
          <DialogDescription>{t(locale, "detail.contextDescription")}</DialogDescription>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          {t(locale, "detail.contextHighlightLabel")}
          {": "}
          <span className="font-medium text-foreground">{sectionTitle}</span>
        </p>

        <div
          ref={scrollRef}
          /*
            A scrollable region has to be reachable by keyboard, so it is a tab
            stop with a name — `overflow-y: auto` alone leaves arrow-key scrolling
            unavailable to anyone not using a pointer.
          */
          role="group"
          tabIndex={0}
          aria-label={t(locale, "detail.contextTitle")}
          data-testid="context-scroll"
          className="relative max-h-[55vh] overflow-y-auto rounded-md border border-border bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <div className="relative">
            <Image
              src={view.pageImage.src}
              alt={view.pageImage.alt}
              width={view.pageImage.width}
              height={view.pageImage.height}
              sizes="(max-width: 639px) 100vw, 56rem"
              className="h-auto w-full"
              onLoad={() => setLoadedPageImage(view.pageImage.src)}
            />
            <div
              ref={highlightRef}
              aria-hidden="true"
              data-testid="context-highlight"
              data-device={view.device}
              style={{
                left: `${highlight.left}%`,
                top: `${highlight.top}%`,
                width: `${highlight.width}%`,
                height: `${highlight.height}%`,
              }}
              className="pointer-events-none absolute rounded-sm border-2 border-primary bg-primary/20 outline-none"
            />
          </div>
        </div>

        {view.siblings.length > 0
          ? (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold">{t(locale, "detail.contextOtherSections")}</h3>
              <ul className="flex flex-wrap gap-2">
                {view.siblings.map((sibling) => (
                  <li key={sibling.id}>
                    <Button asChild variant="secondary" size="sm" className="min-h-9">
                      <Link href={`/${locale}/sections/${sibling.id}`}>{sibling.title}</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          )
          : null}

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="min-h-11 px-4" data-testid="context-close">
              {t(locale, "detail.contextClose")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
