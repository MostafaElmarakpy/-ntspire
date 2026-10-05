import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { loadCategoriesIndex, mockQueryFrom } from "@/features/detail/data";
import { DetailError } from "@/features/detail/detail-error";
import { DetailLoading } from "@/features/detail/detail-loading";
import { CategoriesIndex } from "@/features/detail/index-views";
import { isSupportedLocale, type SupportedLocale } from "@/i18n/config";
import { t } from "@/i18n/messages";

interface CategoriesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: CategoriesPageProps): Promise<Metadata> {
  const { locale } = await params;
  return isSupportedLocale(locale) ? { title: `${t(locale, "detail.categoriesTitle")} — ntspire` } : {};
}

export default async function CategoriesPage({ params, searchParams }: CategoriesPageProps) {
  const [{ locale }, rawParams] = await Promise.all([params, searchParams]);
  if (!isSupportedLocale(locale)) notFound();

  return (
    <div className="space-y-10">
      <PageHeader
        title={t(locale, "detail.categoriesTitle")}
        description={t(locale, "detail.categoriesDescription")}
      />
      <Suspense fallback={<DetailLoading locale={locale} />}>
        <CategoriesIndexContent locale={locale} mockQuery={mockQueryFrom(rawParams.__mock)} />
      </Suspense>
    </div>
  );
}

async function CategoriesIndexContent({ locale, mockQuery }: { locale: SupportedLocale; mockQuery: string | undefined }) {
  const result = await loadCategoriesIndex(locale, mockQuery);
  if (result.status === "error") return <DetailError locale={locale} />;
  return <CategoriesIndex locale={locale} data={result.data} />;
}
