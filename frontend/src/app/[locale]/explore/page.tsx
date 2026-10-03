import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EXPLORE_PAGE_SIZE } from "@/features/explore/constants";
import { ExploreExperience } from "@/features/explore/explore-experience";
import { emptyExplorePageData, toExplorePageData } from "@/features/explore/server-data";
import { isSupportedLocale } from "@/i18n/config";
import { t } from "@/i18n/messages";
import { parseExploreParams, serializeExploreParams } from "@/lib/explore-state";
import { mockSearchService } from "@/mocks/services";

interface ExplorePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const MOCK_MODES = ["slow", "empty", "error"] as const;
type MockMode = (typeof MOCK_MODES)[number];

function getMockMode(value: string | string[] | undefined): MockMode | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  return MOCK_MODES.find((mode) => mode === candidate);
}

export async function generateMetadata({ params }: ExplorePageProps): Promise<Metadata> {
  const { locale } = await params;
  return isSupportedLocale(locale) ? { title: `${t(locale, "explore.title")} — ntspire` } : {};
}

export default async function ExplorePage({ params, searchParams }: ExplorePageProps) {
  const [{ locale }, rawParams] = await Promise.all([params, searchParams]);
  if (!isSupportedLocale(locale)) notFound();

  const state = parseExploreParams(rawParams);
  const mockMode = getMockMode(rawParams.__mock);
  const mockQuery = mockMode ? `?__mock=${mockMode}` : undefined;
  let initialError = false;
  let initialData = emptyExplorePageData();

  try {
    const result = await mockSearchService.search({ ...state, limit: EXPLORE_PAGE_SIZE, mockQuery });
    initialData = toExplorePageData(result, locale, state.device);
  } catch {
    initialError = true;
  }

  return (
    <ExploreExperience
      key={serializeExploreParams(state)}
      locale={locale}
      state={state}
      initialData={initialData}
      initialError={initialError}
    />
  );
}
