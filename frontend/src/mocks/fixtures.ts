import manifest from "@/mocks/mock-manifest.json";
import { CATEGORY_IDS, getTaxonomyEntry } from "@/config/taxonomy";
import { Asset, Category, Device, Direction, Locale, Page, Section, SectionCrop, Source, Tag, Theme } from "@/types/domain";

type Manifest = typeof manifest;
type ManifestPage = Manifest["pages"][number];

const DESKTOP_WIDTH = 1440;
const MOBILE_WIDTH = 390;
const SECTION_HEIGHTS: Record<string, number> = {
  navbar: 120,
  hero: 640,
  value_proposition: 520,
  features: 920,
  logo_cloud: 360,
  stats: 420,
  testimonials: 620,
  pricing: 960,
  cta: 420,
  faq: 680,
  contact: 560,
  team: 720,
  gallery: 820,
  blog: 760,
  login: 580,
  signup: 580,
  dashboard: 880,
  checkout: 720,
  profile: 560,
  settings: 640,
  footer: 300,
};

const getSectionHeight = (type: string, device: "desktop" | "mobile") => {
  const height = SECTION_HEIGHTS[type] ?? 560;
  return device === "mobile" ? Math.round(height * 1.35) : height;
};

const getPageBlueprint = (pageId: string) => manifest.pages.find((page) => page.id === pageId);

const getPageDimensions = (page: ManifestPage, device: "desktop" | "mobile") => ({
  width: device === "desktop" ? DESKTOP_WIDTH : MOBILE_WIDTH,
  height: page.sections.reduce((total, section) => total + getSectionHeight(section.type, device), 0),
});

export const MOCK_SOURCES: Source[] = manifest.sources.map((source) => ({ ...source }));

export const MOCK_PAGES: Page[] = manifest.pages.map((page) => ({
  id: page.id,
  sourceId: page.sourceId,
  title: page.title,
  path: page.path,
  language: page.language as Locale,
  direction: page.direction as Direction,
  createdAt: MOCK_SOURCES.find((source) => source.id === page.sourceId)?.createdAt ?? "2024-01-01T00:00:00Z",
  devices: page.devices as Device[],
}));

const getCategoryId = (industryId: string) => CATEGORY_IDS[industryId] ?? `category-${industryId}`;

export const MOCK_SECTIONS: Section[] = manifest.pages.flatMap((page) => {
  const source = MOCK_SOURCES.find((candidate) => candidate.id === page.sourceId);
  return page.sections.map((section, index) => ({
    id: `section-${page.id}-${index + 1}`,
    pageId: page.id,
    sourceId: page.sourceId,
    title: section.title,
    sectionTypeId: section.type,
    order: index + 1,
    language: page.language as Locale,
    direction: page.direction as Direction,
    industryId: source?.industryId ?? "saas",
    styleId: section.style,
    themeId: section.theme as Theme,
    categoryId: getCategoryId(source?.industryId ?? "saas"),
    tags: section.tags,
    createdAt: source?.createdAt ?? "2024-01-01T00:00:00Z",
    publishedAt: `${source?.createdAt.slice(0, 10) ?? "2024-01-01"}T12:00:00Z`,
    attribution: source?.attribution ?? source?.name ?? "ntspire archive",
    capturedAt: source?.capturedAt ?? "2024-01-01T00:00:00Z",
  }));
});

const getAssetId = (pageId: string, device: "desktop" | "mobile") => `page-${pageId}-${device}`;
const getCropAssetId = (sectionId: string, device: "desktop" | "mobile") => `crop-${sectionId}-${device}`;

export const MOCK_ASSETS: Asset[] = MOCK_PAGES.flatMap((page) =>
  page.devices.map((device) => {
    const dimensions = getPageDimensions(getPageBlueprint(page.id)!, device);
    return {
      id: getAssetId(page.id, device),
      url: `/mock-assets/${getAssetId(page.id, device)}.svg`,
      width: dimensions.width,
      height: dimensions.height,
      mimeType: "image/svg+xml",
    };
  }),
).concat(
  MOCK_SECTIONS.flatMap((section) => {
    const page = MOCK_PAGES.find((candidate) => candidate.id === section.pageId)!;
    return page.devices.map((device) => {
      const width = device === "desktop" ? DESKTOP_WIDTH : MOBILE_WIDTH;
      return {
        id: getCropAssetId(section.id, device),
        url: `/mock-assets/${getCropAssetId(section.id, device)}.svg`,
        width,
        height: getSectionHeight(section.sectionTypeId, device),
        mimeType: "image/svg+xml",
      };
    });
  }),
);

export const MOCK_SECTION_CROPS: SectionCrop[] = MOCK_SECTIONS.flatMap((section) => {
  const page = MOCK_PAGES.find((candidate) => candidate.id === section.pageId)!;
  const blueprint = getPageBlueprint(page.id)!;
  return page.devices.map((device) => {
    const cropIndex = section.order - 1;
    const cropY = blueprint.sections
      .slice(0, cropIndex)
      .reduce((total, item) => total + getSectionHeight(item.type, device), 0);
    const height = getSectionHeight(section.sectionTypeId, device);
    const width = device === "desktop" ? DESKTOP_WIDTH : MOBILE_WIDTH;
    return {
      id: `section-crop-${section.id}-${device}`,
      sectionId: section.id,
      device,
      assetId: getAssetId(page.id, device),
      cropX: 0,
      cropY,
      cropWidth: width,
      cropHeight: height,
      renderedAssetId: getCropAssetId(section.id, device),
      width,
      height,
    };
  });
});

export const MOCK_TAGS: Tag[] = Array.from(new Set(MOCK_SECTIONS.flatMap((section) => section.tags)))
  .sort()
  .map((tag) => ({ id: tag, name: tag }));

export const MOCK_CATEGORIES: Category[] = Array.from(new Set(MOCK_SOURCES.map((source) => source.industryId)))
  .sort()
  .map((industryId) => ({ id: getCategoryId(industryId), nameKey: getTaxonomyEntry("industry", industryId)?.labelKey ?? industryId, industryId }));

export const MOCK_FIXTURE = {
  assets: MOCK_ASSETS,
  categories: MOCK_CATEGORIES,
  crops: MOCK_SECTION_CROPS,
  pages: MOCK_PAGES,
  sections: MOCK_SECTIONS,
  sources: MOCK_SOURCES,
  tags: MOCK_TAGS,
} as const;
