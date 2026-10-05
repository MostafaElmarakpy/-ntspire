import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sectionById } from "@/features/gallery/card-model";
import * as detail from "@/features/detail/data";
import { DetailError } from "@/features/detail/detail-error";
import { DetailLoading } from "@/features/detail/detail-loading";
import { buildSectionDetail } from "@/features/detail/model";
import { SectionDetail } from "@/features/detail/section-detail";
import { isSupportedLocale, type SupportedLocale } from "@/i18n/config";
import { t } from "@/i18n/messages";
import type { Device } from "@/types/domain";

interface SectionDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: SectionDetailPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  if (!isSupportedLocale(locale)) return {};
  const title = buildSectionDetail(id, locale)?.title;
  return { title: title ? `${title} — ntspire` : `${t(locale, "gallery.sectionsTitle")} — ntspire` };
}

export default async function SectionDetailPage({ params, searchParams }: SectionDetailPageProps) {
  const [{ locale, id }, rawParams] = await Promise.all([params, searchParams]);
  if (!isSupportedLocale(locale)) notFound();

  // The existence guard is synchronous and runs before anything suspends: a
  // boundary above it would flush a `200` first and the 404 below would be lost.
  if (!sectionById(id)) notFound();

  return (
    <Suspense fallback={<DetailLoading locale={locale} />}>
      <SectionDetailContent
        locale={locale}
        id={id}
        mockQuery={detail.mockQueryFrom(rawParams.__mock)}
        requestedDevice={detail.requestedDevice(rawParams)}
      />
    </Suspense>
  );
}

interface SectionDetailContentProps {
  locale: SupportedLocale;
  id: string;
  mockQuery: string | undefined;
  requestedDevice: Device | undefined;
}

async function SectionDetailContent({ locale, id, mockQuery, requestedDevice }: SectionDetailContentProps) {
  const result = await detail.loadSectionDetail(id, locale, mockQuery);
  if (result.status === "missing") notFound();
  if (result.status === "error") return <DetailError locale={locale} />;

  return (
    <SectionDetail
      locale={locale}
      detail={result.data}
      initialDevice={detail.resolveInitialDevice(result.data.devices, requestedDevice)}
    />
  );
}
