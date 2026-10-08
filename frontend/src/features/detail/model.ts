import { COLORS, DEVICES, DIRECTIONS, FORMATS, INDUSTRIES, LANGUAGES, SECTION_TYPES, STACKS, STYLES, TYPOGRAPHIES, getTaxonomyEntry } from "@/config/taxonomy";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";
import { serializeExploreParams } from "@/lib/explore-state";
import { getSimilarSections } from "@/lib/query-engine";
import { availableDevices } from "@/lib/section-crop";
import { findPageBySlug, findSourceBySlug, pageSlug, sourceSlug } from "@/lib/slugs";
import { MOCK_PAGES, MOCK_SECTIONS, MOCK_SOURCES } from "@/mocks/fixtures";
import type { Asset, Device, Direction, Locale, Section, Source } from "@/types/domain";
import {
  assetById,
  deviceAvailabilityLabel,
  pageById,
  pageImage,
  pageSections,
  sectionById,
  sectionCrops,
  sourcePages,
  sourceSections,
  toPageCard,
  toSectionCard,
  toSourceCard,
} from "@/features/gallery/card-model";
import type { PageCardData, SectionCardData, SourceCardData } from "@/features/gallery/types";
import type {
  CategoriesIndexData,
  CategoryEntry,
  CategoryGroup,
  ContextSibling,
  DetailImage,
  PageDetailData,
  PageDeviceView,
  PageSectionView,
  PagesIndexData,
  SectionDetailData,
  SectionDeviceView,
  SourceDetailData,
  SourcePageSummary,
  SourcesIndexData,
} from "./types";

/**
 * The Phase 07 view models. Everything here is a pure function of the fixture,
 * the locale and the request, so the detail routes' rules — which crop belongs
 * to which device, what a section is related to, what a breadcrumb says — are
 * unit-testable without a server context. The `server-only` loader that adds the
 * service boundary lives in `data.ts`.
 *
 * Every user-facing string comes from the i18n catalogue (global rules: no
 * literals in components), and every date is formatted in UTC so a server render
 * and any later client render of the same record agree.
 */

const deviceLabel = (locale: SupportedLocale, device: Device) =>
  t(locale, DEVICES.find((entry) => entry.id === device)!.labelKey);

const languageLabel = (locale: SupportedLocale, language: Locale) =>
  t(locale, LANGUAGES.find((entry) => entry.id === language)!.labelKey);

const directionLabel = (locale: SupportedLocale, direction: Direction) =>
  t(locale, DIRECTIONS.find((entry) => entry.id === direction)!.labelKey);

const imageOf = (asset: Asset, alt: string): DetailImage => ({
  src: asset.url,
  width: asset.width,
  height: asset.height,
  alt,
});

const sectionAlt = (source: Source, section: Section) => `${source.name}: ${section.title}`;

/** A stable desktop-then-mobile order, so a switcher never reshuffles between renders. */
const orderedDevices = (crops: ReturnType<typeof sectionCrops>): Device[] => availableDevices(crops);

const toContextSibling = (locale: SupportedLocale, device: Device, section: Section): ContextSibling | undefined => {
  const crop = sectionCrops(section.id).find((entry) => entry.device === device);
  if (!crop) return undefined;
  return {
    id: section.id,
    title: section.title,
    crop: { cropX: crop.cropX, cropY: crop.cropY, cropWidth: crop.cropWidth, cropHeight: crop.cropHeight },
  };
};

const orderedPageSections = (pageId: string) =>
  pageSections(pageId).sort((left, right) => left.order - right.order);

/**
 * A date rendered in UTC. Detail pages are server-rendered, so a locale-time
 * formatter would produce one string on the server and another in the client's
 * zone; pinning the zone keeps the two identical and the tests deterministic.
 */
export function formatDate(value: string, locale: SupportedLocale): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(date);
}

/* ------------------------------------------------------------------ *
 * Section detail
 * ------------------------------------------------------------------ */

export function buildSectionDetail(sectionId: string, locale: SupportedLocale): SectionDetailData | undefined {
  const section = sectionById(sectionId);
  if (!section) return undefined;

  const source = toSourceCard(section.sourceId, locale);
  const page = pageById(section.pageId);
  const sectionType = getTaxonomyEntry("sectionType", section.sectionTypeId);
  const industry = getTaxonomyEntry("industry", section.industryId);
  const style = getTaxonomyEntry("style", section.styleId);
  if (!source || !page || !sectionType || !industry || !style) return undefined;

  const crops = sectionCrops(section.id);
  const sourceRecord = MOCK_SOURCES.find((entry) => entry.id === section.sourceId)!;
  const pageScreenshot = pageImage(page);

  const devices: SectionDeviceView[] = [];
  for (const device of orderedDevices(crops)) {
    const crop = crops.find((entry) => entry.device === device)!;
    const rendered = assetById(crop.renderedAssetId);
    const screenshot = assetById(crop.assetId);
    if (!rendered || !screenshot) continue;

    devices.push({
      device,
      deviceLabel: deviceLabel(locale, device),
      // The rendered crop is this device's own asset: a mobile view never shows
      // the desktop crop, and never places a rectangle from the desktop page.
      image: imageOf(rendered, sectionAlt(sourceRecord, section)),
      imageMimeType: rendered.mimeType,
      pageImage: imageOf(screenshot, page.title),
      crop: { cropX: crop.cropX, cropY: crop.cropY, cropWidth: crop.cropWidth, cropHeight: crop.cropHeight },
      siblings: orderedPageSections(page.id)
        .filter((sibling) => sibling.id !== section.id)
        .map((sibling) => toContextSibling(locale, device, sibling))
        .filter((sibling): sibling is ContextSibling => Boolean(sibling)),
    });
  }
  if (devices.length === 0) return undefined;

  // The desktop view leads when it exists, so the related-page thumbnail and the
  // default device agree with the rest of the library.
  const primary = devices.find((view) => view.device === "desktop") ?? devices[0];

  const related = getSimilarSections(MOCK_SECTIONS, section)
    .map((candidate) => toSectionCard(candidate, locale))
    .filter((card): card is SectionCardData => Boolean(card));

  return {
    id: section.id,
    title: section.title,
    isArabic: section.language === "ar",
    sectionType: t(locale, sectionType.labelKey),
    sectionTypeId: section.sectionTypeId,
    sourceName: sourceRecord.name,
    sourceSlug: sourceSlug(sourceRecord.id),
    pageTitle: page.title,
    pageSlug: pageSlug(page.id),
    facts: [
      { label: t(locale, "detail.factSource"), value: sourceRecord.name },
      { label: t(locale, "detail.factLanguage"), value: languageLabel(locale, section.language) },
      { label: t(locale, "detail.factDirection"), value: directionLabel(locale, section.direction) },
      { label: t(locale, "detail.factDevices"), value: deviceAvailabilityLabel(locale, devices.map((view) => view.device)) },
      { label: t(locale, "detail.factIndustry"), value: t(locale, industry.labelKey) },
      { label: t(locale, "detail.factStyle"), value: t(locale, style.labelKey) },
      { label: t(locale, "detail.factCaptured"), value: formatDate(section.capturedAt, locale) },
      { label: t(locale, "detail.factAttribution"), value: section.attribution },
    ],
    tags: section.tags,
    devices,
    related,
    relatedPage: { title: page.title, slug: pageSlug(page.id), image: primary.pageImage },
    relatedSource: {
      name: sourceRecord.name,
      slug: sourceSlug(sourceRecord.id),
      description: sourceRecord.description,
      image: pageScreenshot ?? primary.pageImage,
    },
  };
}

/** The `?__mock=empty` shape: the record still resolves, its collections do not. */
export function emptySectionDetail(detail: SectionDetailData): SectionDetailData {
  return {
    ...detail,
    related: [],
    devices: detail.devices.map((view) => ({ ...view, siblings: [] })),
  };
}

/* ------------------------------------------------------------------ *
 * Page detail
 * ------------------------------------------------------------------ */

export function buildPageDetail(slug: string, locale: SupportedLocale): PageDetailData | undefined {
  const page = findPageBySlug(MOCK_PAGES, slug);
  if (!page) return undefined;

  const source = toSourceCard(page.sourceId, locale);
  if (!source) return undefined;

  const sourceRecord = MOCK_SOURCES.find((entry) => entry.id === page.sourceId)!;
  const sections = orderedPageSections(page.id);

  const devices: PageDeviceView[] = [];
  for (const device of (["desktop", "mobile"] as const).filter((entry) => page.devices.includes(entry))) {
    const screenshot = assetById(`page-${page.id}-${device}`);
    if (!screenshot) continue;

    const sectionViews: PageSectionView[] = sections
      .map((section) => {
        const crop = sectionCrops(section.id).find((entry) => entry.device === device);
        const rendered = assetById(crop?.renderedAssetId);
        const sectionType = getTaxonomyEntry("sectionType", section.sectionTypeId);
        if (!crop || !rendered || !sectionType) return undefined;
        return {
          id: section.id,
          title: section.title,
          sectionType: t(locale, sectionType.labelKey),
          image: imageOf(rendered, sectionAlt(sourceRecord, section)),
          crop: { cropX: crop.cropX, cropY: crop.cropY, cropWidth: crop.cropWidth, cropHeight: crop.cropHeight },
        };
      })
      .filter((view): view is PageSectionView => Boolean(view));

    devices.push({
      device,
      deviceLabel: deviceLabel(locale, device),
      image: imageOf(screenshot, page.title),
      sections: sectionViews,
    });
  }
  if (devices.length === 0) return undefined;

  return {
    id: page.id,
    slug: pageSlug(page.id),
    title: page.title,
    isArabic: page.language === "ar",
    sourceName: sourceRecord.name,
    sourceSlug: sourceSlug(sourceRecord.id),
    facts: [
      { label: t(locale, "detail.factSource"), value: sourceRecord.name },
      { label: t(locale, "detail.factPath"), value: page.path },
      { label: t(locale, "detail.factLanguage"), value: languageLabel(locale, page.language) },
      { label: t(locale, "detail.factDirection"), value: directionLabel(locale, page.direction) },
      { label: t(locale, "detail.factDevices"), value: deviceAvailabilityLabel(locale, page.devices) },
      { label: t(locale, "detail.factCaptured"), value: formatDate(sourceRecord.capturedAt, locale) },
    ],
    devices,
  };
}

export function emptyPageDetail(detail: PageDetailData): PageDetailData {
  return { ...detail, devices: detail.devices.map((view) => ({ ...view, sections: [] })) };
}

/* ------------------------------------------------------------------ *
 * Source detail
 * ------------------------------------------------------------------ */

export function buildSourceDetail(slug: string, locale: SupportedLocale): SourceDetailData | undefined {
  const source = findSourceBySlug(MOCK_SOURCES, slug);
  if (!source) return undefined;

  const industry = getTaxonomyEntry("industry", source.industryId);
  const card = toSourceCard(source.id, locale);
  if (!industry || !card) return undefined;

  const pages: SourcePageSummary[] = sourcePages(source.id)
    .map((page) => {
      const pageCard = toPageCard(page, locale);
      if (!pageCard) return undefined;
      return {
        id: pageCard.id,
        slug: pageSlug(page.id),
        title: pageCard.title,
        image: pageCard.image,
        language: pageCard.language,
        devicesLabel: pageCard.devicesLabel,
        sectionCount: pageCard.sectionCount,
        isArabic: pageCard.isArabic,
      };
    })
    .filter((summary): summary is SourcePageSummary => Boolean(summary));

  const sections = sourceSections(source.id)
    .map((section) => toSectionCard(section, locale))
    .filter((sectionCard): sectionCard is SectionCardData => Boolean(sectionCard));

  return {
    id: source.id,
    slug: sourceSlug(source.id),
    name: source.name,
    description: source.description,
    url: source.url,
    isArabic: card.isArabic,
    facts: [
      { label: t(locale, "detail.factIndustry"), value: t(locale, industry.labelKey) },
      { label: t(locale, "detail.factWebsite"), value: source.url },
      // The label already names the noun, so the value is the bare count: a
      // source with one page would otherwise read "1 pages".
      { label: t(locale, "detail.factPages"), value: String(pages.length) },
      { label: t(locale, "detail.factSections"), value: String(sections.length) },
      { label: t(locale, "detail.factCaptured"), value: formatDate(source.capturedAt, locale) },
      { label: t(locale, "detail.factAttribution"), value: source.attribution },
    ],
    pages,
    sections,
  };
}

export function emptySourceDetail(detail: SourceDetailData): SourceDetailData {
  return { ...detail, pages: [], sections: [] };
}

/* ------------------------------------------------------------------ *
 * Index routes
 * ------------------------------------------------------------------ */

export function buildSourcesIndex(locale: SupportedLocale): SourcesIndexData {
  return {
    sources: MOCK_SOURCES.map((source) => toSourceCard(source.id, locale)).filter(
      (card): card is SourceCardData => Boolean(card),
    ),
  };
}

export function emptySourcesIndex(): SourcesIndexData {
  return { sources: [] };
}

export function buildPagesIndex(locale: SupportedLocale): PagesIndexData {
  return {
    pages: MOCK_PAGES.map((page) => toPageCard(page, locale)).filter((card): card is PageCardData => Boolean(card)),
  };
}

export function emptyPagesIndex(): PagesIndexData {
  return { pages: [] };
}

const exploreHref = (locale: SupportedLocale, state: Parameters<typeof serializeExploreParams>[0]) =>
  `/${locale}/explore?${serializeExploreParams(state)}`;

/**
 * The taxonomy index. Each entry carries the number of references that match it
 * and links into Explore with that one filter applied — the same serialization
 * Explore itself uses, so the URL the index produces is one Explore can read.
 */
export function buildCategoriesIndex(locale: SupportedLocale): CategoriesIndexData {
  const countBy = (pick: (section: Section) => string) =>
    MOCK_SECTIONS.reduce<Record<string, number>>((counts, section) => {
      const key = pick(section);
      counts[key] = (counts[key] ?? 0) + 1;
      return counts;
    }, {});

  const sectionTypeCounts = countBy((section) => section.sectionTypeId);
  const industryCounts = countBy((section) => section.industryId);
  const styleCounts = countBy((section) => section.styleId);
  const typographyCounts = countBy((section) => section.typographyId);
  const colorCounts = countBy((section) => section.colorId);
  const stackCounts = countBy((section) => section.stackId);
  const formatCounts = countBy((section) => section.formatId);

  const entries = (
    taxonomy: typeof SECTION_TYPES,
    counts: Record<string, number>,
    state: (id: string) => Parameters<typeof serializeExploreParams>[0],
  ): CategoryEntry[] =>
    taxonomy.map((entry) => ({
      id: entry.id,
      label: t(locale, entry.labelKey),
      count: counts[entry.id] ?? 0,
      href: exploreHref(locale, state(entry.id)),
    }));

  const groups: CategoryGroup[] = [
    {
      id: "industries",
      title: t(locale, "explore.industries"),
      entries: entries(INDUSTRIES, industryCounts, (id) => ({ industryId: id })),
    },
    {
      id: "sectionTypes",
      title: t(locale, "explore.sectionType"),
      entries: entries(SECTION_TYPES, sectionTypeCounts, (id) => ({ sectionTypeId: id })),
    },
    {
      id: "styles",
      title: t(locale, "explore.style"),
      entries: entries(STYLES, styleCounts, (id) => ({ styleId: id })),
    },
    {
      id: "typographies",
      title: t(locale, "explore.typography"),
      entries: entries(TYPOGRAPHIES, typographyCounts, (id) => ({ typographyId: id })),
    },
    {
      id: "colors",
      title: t(locale, "explore.color"),
      entries: entries(COLORS, colorCounts, (id) => ({ colorId: id })),
    },
    {
      id: "stacks",
      title: t(locale, "explore.stack"),
      entries: entries(STACKS, stackCounts, (id) => ({ stackId: id })),
    },
    {
      id: "formats",
      title: t(locale, "explore.format"),
      entries: entries(FORMATS, formatCounts, (id) => ({ formatId: id })),
    },
  ];

  return { groups };
}

export function emptyCategoriesIndex(): CategoriesIndexData {
  return { groups: [] };
}
