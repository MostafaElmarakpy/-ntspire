import { notFound } from "next/navigation";
import { DetailError } from "@/features/detail/detail-error";
import { loadSectionDetail, mockQueryFrom, requestedDevice, resolveInitialDevice } from "@/features/detail/data";
import { SectionDetail } from "@/features/detail/section-detail";
import { SectionDetailModal } from "@/features/detail/section-detail-modal";
import { sectionById } from "@/features/gallery/card-model";
import { isSupportedLocale, type SupportedLocale } from "@/i18n/config";
import { parseExploreParams, serializeExploreParams } from "@/lib/explore-state";
import { mockSearchService } from "@/mocks/services";

interface ModalSectionPageProps {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const RESULT_SET_LIMIT = 50;

export default async function InterceptedSectionPage({ params, searchParams }: ModalSectionPageProps) {
  const [{ locale, id }, rawParams] = await Promise.all([params, searchParams]);
  if (!isSupportedLocale(locale)) notFound();

  // Resolve missing ids before the detail service can suspend so the URL remains a real 404.
  const section = sectionById(id);
  if (!section) notFound();

  return (
    <SectionDetailModalPage
      locale={locale}
      id={id}
      title={section.title}
      rawParams={rawParams}
    />
  );
}

async function SectionDetailModalPage({
  locale,
  id,
  title,
  rawParams,
}: {
  locale: SupportedLocale;
  id: string;
  title: string;
  rawParams: Record<string, string | string[] | undefined>;
}) {
  const state = parseExploreParams(rawParams);
  const query = serializeExploreParams(state);
  let previousHref: string | undefined;
  let nextHref: string | undefined;

  try {
    const resultSet = await mockSearchService.search({ ...state, limit: RESULT_SET_LIMIT });
    const ids = resultSet.items.map((section) => section.id);
    const index = ids.indexOf(id);
    const sectionHref = (sectionId: string) => `/${locale}/sections/${sectionId}${query ? `?${query}` : ""}`;
    if (index > 0) previousHref = sectionHref(ids[index - 1]);
    if (index >= 0 && index < ids.length - 1) nextHref = sectionHref(ids[index + 1]);
  } catch {
    // Modal detail remains available if the optional adjacent-result lookup fails.
  }

  const result = await loadSectionDetail(id, locale, mockQueryFrom(rawParams.__mock));
  if (result.status === "missing") notFound();

  return (
    <SectionDetailModal locale={locale} title={title} originSectionId={id} previousHref={previousHref} nextHref={nextHref}>
      {result.status === "error"
        ? <DetailError locale={locale} />
        : <SectionDetail locale={locale} detail={result.data} initialDevice={resolveInitialDevice(result.data.devices, requestedDevice(rawParams))} />}
    </SectionDetailModal>
  );
}
