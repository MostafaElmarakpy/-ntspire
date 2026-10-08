import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HeroPanel } from "@/components/hero-panel";
import { JobsTeaser } from "@/components/jobs-teaser";
import { SponsorSlot } from "@/components/sponsor-slot";
import { mockQueryFrom, loadSourcesIndex } from "@/features/detail/data";
import { DetailError } from "@/features/detail/detail-error";
import { DetailLoading } from "@/features/detail/detail-loading";
import { SourcesIndex } from "@/features/detail/index-views";
import { isSupportedLocale, type SupportedLocale } from "@/i18n/config";
import { t } from "@/i18n/messages";

interface SourcesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: SourcesPageProps): Promise<Metadata> {
  const { locale } = await params;
  return isSupportedLocale(locale) ? { title: `${t(locale, "detail.sourcesTitle")} — ntspire` } : {};
}

export default async function SourcesPage({ params, searchParams }: SourcesPageProps) {
  const [{ locale }, rawParams] = await Promise.all([params, searchParams]);
  if (!isSupportedLocale(locale)) notFound();

  return (
    <div className="space-y-8">
      <HeroPanel
        title={t(locale, "sources.heroTitle")}
        description={t(locale, "detail.sourcesDescription")}
      />
      <Suspense fallback={<DetailLoading locale={locale} />}>
        <SourcesIndexContent locale={locale} mockQuery={mockQueryFrom(rawParams.__mock)} />
      </Suspense>
      <div className="grid gap-6 lg:grid-cols-2">
        <SponsorSlot locale={locale} />
        <JobsTeaser locale={locale} />
      </div>
    </div>
  );
}

async function SourcesIndexContent({ locale, mockQuery }: { locale: SupportedLocale; mockQuery: string | undefined }) {
  const result = await loadSourcesIndex(locale, mockQuery);
  if (result.status === "error") return <DetailError locale={locale} />;
  return <SourcesIndex locale={locale} data={result.data} />;
}
