import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import * as detail from "@/features/detail/data";
import { DetailError } from "@/features/detail/detail-error";
import { DetailLoading } from "@/features/detail/detail-loading";
import { buildPageDetail } from "@/features/detail/model";
import { PageDetail } from "@/features/detail/page-detail";
import { findPageBySlug } from "@/lib/slugs";
import { MOCK_PAGES } from "@/mocks/fixtures";
import { isSupportedLocale, type SupportedLocale } from "@/i18n/config";
import { t } from "@/i18n/messages";
import type { Device } from "@/types/domain";

interface PageDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: PageDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale)) return {};
  const title = buildPageDetail(slug, locale)?.title;
  return { title: title ? `${title} — ntspire` : `${t(locale, "detail.pagesTitle")} — ntspire` };
}

export default async function PageDetailPage({ params, searchParams }: PageDetailPageProps) {
  const [{ locale, slug }, rawParams] = await Promise.all([params, searchParams]);
  if (!isSupportedLocale(locale)) notFound();

  // Synchronous, before anything can suspend, so a real 404 status survives.
  if (!findPageBySlug(MOCK_PAGES, slug)) notFound();

  return (
    <Suspense fallback={<DetailLoading locale={locale} />}>
      <PageDetailContent
        locale={locale}
        slug={slug}
        mockQuery={detail.mockQueryFrom(rawParams.__mock)}
        requestedDevice={detail.requestedDevice(rawParams)}
      />
    </Suspense>
  );
}

interface PageDetailContentProps {
  locale: SupportedLocale;
  slug: string;
  mockQuery: string | undefined;
  requestedDevice: Device | undefined;
}

async function PageDetailContent({ locale, slug, mockQuery, requestedDevice }: PageDetailContentProps) {
  const result = await detail.loadPageDetail(slug, locale, mockQuery);
  if (result.status === "missing") notFound();
  if (result.status === "error") return <DetailError locale={locale} />;

  return (
    <PageDetail
      locale={locale}
      detail={result.data}
      initialDevice={detail.resolveInitialDevice(result.data.devices, requestedDevice)}
    />
  );
}
