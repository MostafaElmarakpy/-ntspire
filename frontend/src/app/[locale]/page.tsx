import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HomeExperience } from "@/features/home/home-experience";
import { emptyExplorePageData, toExplorePageData } from "@/features/explore/server-data";
import { isSupportedLocale } from "@/i18n/config";
import { t } from "@/i18n/messages";
import { parseExploreParams, serializeExploreParams } from "@/lib/explore-state";
import { mockSearchService } from "@/mocks/services";

type LocalePageProps = Readonly<{
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;
  return isSupportedLocale(locale) ? { title: t(locale, "home.heroTitle") } : {};
}

const MOCK_MODES = ["slow", "empty", "error"] as const;
const HOME_PAGE_SIZE = 50;

export default async function LocaleHomePage({ params, searchParams }: LocalePageProps) {
  const [{ locale }, rawParams] = await Promise.all([params, searchParams]);

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const state = parseExploreParams(rawParams);
  const requestedMockMode = Array.isArray(rawParams.__mock) ? rawParams.__mock[0] : rawParams.__mock;
  const mockMode = MOCK_MODES.find((mode) => mode === requestedMockMode);
  const mockQuery = mockMode ? `?__mock=${mockMode}` : undefined;
  let initialError = false;
  let initialData = emptyExplorePageData();

  try {
    const result = await mockSearchService.search({ ...state, limit: HOME_PAGE_SIZE, mockQuery });
    initialData = toExplorePageData(result, locale, state.device);
  } catch {
    initialError = true;
  }

  return (
    <HomeExperience
      key={serializeExploreParams(state)}
      locale={locale}
      state={state}
      data={initialData}
      initialError={initialError}
    />
  );
}
