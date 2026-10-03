import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/content-states";
import { ErrorState } from "@/components/error-state";
import { PageHeader } from "@/components/page-header";
import { GalleryExperience } from "@/features/gallery/gallery-experience";
import { GalleryLoading } from "@/features/gallery/gallery-loading";
import { emptyGalleryData, loadGalleryData } from "@/features/gallery/gallery-data";
import type { GalleryData } from "@/features/gallery/types";
import { isSupportedLocale, type SupportedLocale } from "@/i18n/config";
import { t } from "@/i18n/messages";

const MOCK_MODES = ["slow", "empty", "error"] as const;
type MockMode = (typeof MOCK_MODES)[number];

function getMockMode(value: string | string[] | undefined): MockMode | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  return MOCK_MODES.find((mode) => mode === candidate);
}

interface DevGalleryPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: DevGalleryPageProps): Promise<Metadata> {
  const { locale } = await params;
  return isSupportedLocale(locale) ? { title: `${t(locale, "gallery.title")} — ntspire` } : {};
}

export default async function DevGalleryPage({ params, searchParams }: DevGalleryPageProps) {
  const [{ locale }, rawParams] = await Promise.all([params, searchParams]);
  // Must run before anything suspends: a boundary above this guard would flush a
  // `200` response first and the production 404 below would be lost.
  if (process.env.NODE_ENV === "production" || !isSupportedLocale(locale)) notFound();

  return (
    <Suspense fallback={<GalleryLoading locale={locale} />}>
      <DevGalleryContent locale={locale} mockMode={getMockMode(rawParams.__mock)} />
    </Suspense>
  );
}

interface DevGalleryContentProps {
  locale: SupportedLocale;
  mockMode: MockMode | undefined;
}

async function DevGalleryContent({ locale, mockMode }: DevGalleryContentProps) {
  const mockQuery = mockMode ? `?__mock=${mockMode}` : undefined;

  let data: GalleryData = emptyGalleryData();
  let failed = false;
  try {
    data = await loadGalleryData(locale, mockQuery);
  } catch {
    failed = true;
  }

  const isEmpty = data.sections.length === 0 && data.pages.length === 0 && data.sources.length === 0;

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow={t(locale, "gallery.eyebrow")}
        title={t(locale, "gallery.title")}
        description={t(locale, "gallery.description")}
      />
      {failed ? (
        <ErrorState
          title={t(locale, "gallery.errorTitle")}
          description={t(locale, "gallery.errorDescription")}
          retryLabel={t(locale, "ui.retry")}
        />
      ) : isEmpty ? (
        <EmptyState title={t(locale, "gallery.emptyTitle")} description={t(locale, "gallery.emptyDescription")} />
      ) : (
        <GalleryExperience locale={locale} data={data} />
      )}
    </div>
  );
}
