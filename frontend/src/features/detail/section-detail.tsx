"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/content-states";
import { SaveButton } from "@/components/save-button";
import { SectionCard } from "@/features/gallery/section-card";
import { MasonryGrid } from "@/features/gallery/masonry-grid";
import { estimateMasonryHeight } from "@/lib/masonry";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";
import type { Device } from "@/types/domain";
import { trackDeviceViewed, trackFigmaClicked, trackImageDownloaded, trackSectionViewed, trackViewContext } from "./analytics";
import { DetailBreadcrumbs } from "./detail-breadcrumbs";
import { FactList, TagList } from "./detail-facts";
import { DeviceSwitcher } from "./device-switcher";
import { FigmaDialog } from "./figma-dialog";
import { SaveAsImage } from "./save-as-image";
import { useDeviceParam } from "./use-device-param";
import { ViewInContext } from "./view-in-context";
import type { SectionDetailData, SectionDeviceView } from "./types";

interface SectionDetailProps {
  locale: SupportedLocale;
  detail: SectionDetailData;
  initialDevice: Device;
}

/**
 * The section's preview, in a frame that only *looks* like a device.
 *
 * The mobile frame is presentation: the crop inside it is the mobile crop the
 * server sent, and nothing here reads or rewrites a coordinate. Drawing the
 * frame must not change the image's aspect ratio, so it stays a plain border and
 * a narrower max width.
 */
function SectionPreview({ locale, view }: { locale: SupportedLocale; view: SectionDeviceView }) {
  const isMobile = view.device === "mobile";
  return (
    <figure className="min-w-0">
      <div
        className={isMobile
          ? "mx-auto w-full max-w-[20rem] rounded-[2rem] border-4 border-foreground/80 bg-card p-2 shadow-sm"
          : "overflow-hidden rounded-md border border-border bg-card"}
      >
        <Image
          src={view.image.src}
          alt={view.image.alt}
          width={view.image.width}
          height={view.image.height}
          sizes="(max-width: 1023px) 100vw, 60vw"
          priority
          className={isMobile ? "h-auto w-full rounded-[1.5rem]" : "h-auto w-full"}
        />
      </div>
      {isMobile ? <figcaption className="sr-only">{t(locale, "detail.mobileFrameLabel")}</figcaption> : null}
    </figure>
  );
}

export function SectionDetail({ locale, detail, initialDevice }: SectionDetailProps) {
  const [device, setDevice] = useDeviceParam(initialDevice);
  const view = detail.devices.find((entry) => entry.device === device) ?? detail.devices[0];

  useEffect(() => {
    // The arriving device is what was requested; later changes are the reader's
    // own switch and are counted by the switcher instead.
    trackSectionViewed(detail.id, initialDevice);
  }, [detail.id, initialDevice]);

  const handleDeviceChange = (next: Device) => {
    setDevice(next);
    trackDeviceViewed(next);
  };

  return (
    <article className="space-y-10">
      <DetailBreadcrumbs
        locale={locale}
        trail={[
          { label: t(locale, "detail.sourcesTitle"), href: `/${locale}/sources` },
          { label: detail.sourceName, href: `/${locale}/sources/${detail.sourceSlug}` },
          { label: detail.pageTitle, href: `/${locale}/pages/${detail.pageSlug}` },
          { label: detail.title },
        ]}
      />

      <header className="space-y-3">
        <p className="text-xs font-semibold tracking-wide text-primary uppercase">{detail.sectionType}</p>
        <h1 className="max-w-4xl font-serif text-3xl leading-tight sm:text-4xl">{detail.title}</h1>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
        <div className="min-w-0 space-y-5">
          <DeviceSwitcher
            locale={locale}
            available={detail.devices.map((entry) => entry.device)}
            value={view.device}
            label={t(locale, "detail.deviceSwitcherLabel")}
            onChange={handleDeviceChange}
          />

          <SectionPreview locale={locale} view={view} />

          <div
            role="group"
            aria-label={t(locale, "detail.actionsLabel")}
            className="flex flex-wrap items-start gap-3"
          >
            <SaveButton sectionId={detail.id} locale={locale} />
            <SaveAsImage
              locale={locale}
              sourceName={detail.sourceName}
              sectionTypeId={detail.sectionTypeId}
              device={view.device}
              image={view.image}
              mimeType={view.imageMimeType}
              onDownloaded={(filename) => trackImageDownloaded(detail.id, view.device, filename)}
            />
            <FigmaDialog
              locale={locale}
              sectionTitle={detail.title}
              onOpen={() => trackFigmaClicked(detail.id)}
            />
            <ViewInContext
              locale={locale}
              sectionTitle={detail.title}
              view={view}
              onOpen={() => trackViewContext(detail.id, view.device)}
            />
          </div>
        </div>

        <aside className="min-w-0 space-y-7">
          <FactList facts={detail.facts} className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-1" />
          <TagList tags={detail.tags} label={t(locale, "gallery.tagsLabel")} />

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="text-sm font-semibold">{t(locale, "detail.sourceAbout")}</h2>
            <p className="text-sm text-muted-foreground">{detail.relatedSource.description}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="min-h-11 px-4">
                <Link href={`/${locale}/sources/${detail.sourceSlug}`}>{t(locale, "detail.viewSource")}</Link>
              </Button>
              <Button asChild variant="outline" className="min-h-11 px-4">
                <Link href={`/${locale}/pages/${detail.pageSlug}`}>{t(locale, "detail.viewPage")}</Link>
              </Button>
            </div>
          </section>
        </aside>
      </div>

      {detail.related.length > 0
        ? (
          <section aria-label={t(locale, "detail.relatedTitle")}>
            <h2 className="mb-5 font-serif text-2xl">{t(locale, "detail.relatedTitle")}</h2>
            <MasonryGrid
              items={detail.related}
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
          </section>
        )
        : (
          <EmptyState
            title={t(locale, "detail.relatedEmptyTitle")}
            description={t(locale, "detail.relatedEmptyDescription")}
          />
        )}
    </article>
  );
}
