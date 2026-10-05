import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { loadPagesIndex, mockQueryFrom } from "@/features/detail/data";
import { DetailError } from "@/features/detail/detail-error";
import { DetailLoading } from "@/features/detail/detail-loading";
import { PagesIndex } from "@/features/detail/index-views";
import { isSupportedLocale, type SupportedLocale } from "@/i18n/config";
import { t } from "@/i18n/messages";

interface PagesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: PagesPageProps): Promise<Metadata> {
  const { locale } = await params;
  return isSupportedLocale(locale) ? { title: `${t(locale, "detail.pagesTitle")} — ntspire` } : {};
}

export default async function PagesPage({ params, searchParams }: PagesPageProps) {
  const [{ locale }, rawParams] = await Promise.all([params, searchParams]);
  if (!isSupportedLocale(locale)) notFound();

  return (
    <div className="space-y-10">
      <PageHeader
        title={t(locale, "detail.pagesTitle")}
        description={t(locale, "detail.pagesDescription")}
      />
      <Suspense fallback={<DetailLoading locale={locale} />}>
        <PagesIndexContent locale={locale} mockQuery={mockQueryFrom(rawParams.__mock)} />
      </Suspense>
    </div>
  );
}

async function PagesIndexContent({ locale, mockQuery }: { locale: SupportedLocale; mockQuery: string | undefined }) {
  const result = await loadPagesIndex(locale, mockQuery);
  if (result.status === "error") return <DetailError locale={locale} />;
  return <PagesIndex locale={locale} data={result.data} />;
}
