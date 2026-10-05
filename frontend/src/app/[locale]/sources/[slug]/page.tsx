import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import * as detail from "@/features/detail/data";
import { DetailError } from "@/features/detail/detail-error";
import { DetailLoading } from "@/features/detail/detail-loading";
import { buildSourceDetail } from "@/features/detail/model";
import { SourceDetail } from "@/features/detail/source-detail";
import { findSourceBySlug } from "@/lib/slugs";
import { MOCK_SOURCES } from "@/mocks/fixtures";
import { isSupportedLocale, type SupportedLocale } from "@/i18n/config";
import { t } from "@/i18n/messages";

interface SourceDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: SourceDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale)) return {};
  const title = buildSourceDetail(slug, locale)?.name;
  return { title: title ? `${title} — ntspire` : `${t(locale, "detail.sourcesTitle")} — ntspire` };
}

export default async function SourceDetailPage({ params, searchParams }: SourceDetailPageProps) {
  const [{ locale, slug }, rawParams] = await Promise.all([params, searchParams]);
  if (!isSupportedLocale(locale)) notFound();

  // Synchronous, before anything can suspend, so a real 404 status survives.
  if (!findSourceBySlug(MOCK_SOURCES, slug)) notFound();

  return (
    <Suspense fallback={<DetailLoading locale={locale} />}>
      <SourceDetailContent locale={locale} slug={slug} mockQuery={detail.mockQueryFrom(rawParams.__mock)} />
    </Suspense>
  );
}

interface SourceDetailContentProps {
  locale: SupportedLocale;
  slug: string;
  mockQuery: string | undefined;
}

async function SourceDetailContent({ locale, slug, mockQuery }: SourceDetailContentProps) {
  const result = await detail.loadSourceDetail(slug, locale, mockQuery);
  if (result.status === "missing") notFound();
  if (result.status === "error") return <DetailError locale={locale} />;

  return <SourceDetail locale={locale} detail={result.data} />;
}
