"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/content-states";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";
import { cropRectToPercent } from "@/lib/section-crop";
import type { Device } from "@/types/domain";
import { trackDeviceViewed } from "./analytics";
import { DetailBreadcrumbs } from "./detail-breadcrumbs";
import { FactList } from "./detail-facts";
import { DeviceSwitcher } from "./device-switcher";
import { useDeviceParam } from "./use-device-param";
import type { PageDetailData, PageDeviceView } from "./types";

interface PageDetailProps {
  locale: SupportedLocale;
  detail: PageDetailData;
  initialDevice: Device;
}

/**
 * The page capture with each catalogued section's region drawn on it.
 *
 * The regions are the highlighted band for the device currently shown: a region
 * is placed from that device's own `SectionCrop` and positioned in percentages
 * of the screenshot, so it lands correctly however wide the capture is rendered.
 * The regions themselves are decoration — the numbered list below carries the
 * links, so the page has one accessible route to each section rather than two
 * competing ones.
 */
function PageCapture({ locale, view }: { locale: SupportedLocale; view: PageDeviceView }) {
  const isMobile = view.device === "mobile";
  return (
    <div
      className={isMobile
        ? "mx-auto w-full max-w-[22rem] overflow-hidden rounded-[2rem] border-4 border-foreground/80 bg-card p-2"
        : "overflow-hidden rounded-md border border-border bg-card"}
    >
      <div className="relative">
        <Image
          src={view.image.src}
          alt={view.image.alt}
          width={view.image.width}
          height={view.image.height}
          sizes="(max-width: 1023px) 100vw, 60vw"
          priority
          className={isMobile ? "h-auto w-full rounded-[1.5rem]" : "h-auto w-full"}
        />
        {view.sections.map((section, index) => {
          const region = cropRectToPercent(section.crop, view.image);
          return (
            <span
              key={section.id}
              aria-hidden="true"
              data-testid="page-region"
              data-section-id={section.id}
              style={{
                left: `${region.left}%`,
                top: `${region.top}%`,
                width: `${region.width}%`,
                height: `${region.height}%`,
              }}
              className="pointer-events-none absolute flex items-start justify-start rounded-sm border border-primary bg-primary/10 p-1"
            >
              <span className="rounded-sm bg-primary px-1 text-[0.625rem] font-semibold text-primary-foreground">
                {index + 1}
              </span>
            </span>
          );
        })}
      </div>
      {isMobile ? <span className="sr-only">{t(locale, "detail.mobileFrameLabel")}</span> : null}
    </div>
  );
}

export function PageDetail({ locale, detail, initialDevice }: PageDetailProps) {
  const [device, setDevice] = useDeviceParam(initialDevice);
  const view = detail.devices.find((entry) => entry.device === device) ?? detail.devices[0];

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
          { label: detail.title },
        ]}
      />

      <header className="space-y-3">
        <p className="text-xs font-semibold tracking-wide text-primary uppercase">{detail.sourceName}</p>
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
          <PageCapture locale={locale} view={view} />
        </div>

        <aside className="min-w-0 space-y-7">
          <FactList facts={detail.facts} className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-1" />
          <div className="border-t border-border pt-6">
            <Button asChild variant="outline" className="min-h-11 px-4">
              <Link href={`/${locale}/sources/${detail.sourceSlug}`}>{t(locale, "detail.viewSource")}</Link>
            </Button>
          </div>
        </aside>
      </div>

      <section aria-label={t(locale, "detail.pageSectionsTitle")} className="space-y-5">
        <h2 className="font-serif text-2xl">{t(locale, "detail.pageSectionsTitle")}</h2>
        {view.sections.length > 0
          ? (
            <ol className="grid gap-3 sm:grid-cols-2">
              {view.sections.map((section, index) => (
                <li key={section.id} className="min-w-0">
                  <Link
                    href={`/${locale}/sections/${section.id}`}
                    className="flex min-h-11 items-center gap-3 rounded-md border border-border bg-card p-3 transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-primary text-xs font-semibold text-primary-foreground"
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{section.title}</span>
                      <span className="block text-sm text-muted-foreground">{section.sectionType}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )
          : (
            <EmptyState
              title={t(locale, "detail.pageSectionsEmptyTitle")}
              description={t(locale, "detail.pageSectionsEmptyDescription")}
            />
          )}
      </section>
    </article>
  );
}
