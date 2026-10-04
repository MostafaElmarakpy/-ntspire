import "server-only";
import { getTaxonomyEntry, DEVICES, DIRECTIONS, LANGUAGES } from "@/config/taxonomy";
import { MOCK_ASSETS, MOCK_SECTION_CROPS, MOCK_SOURCES } from "@/mocks/fixtures";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";
import type { SearchResult, Section, SearchFacets } from "@/types/domain";
import type { ExplorePageData } from "./types";

const emptyFacets = (): SearchFacets => ({
  sectionTypes: {},
  industries: {},
  styles: {},
  languages: {},
  devices: {},
  directions: {},
  themes: {},
  sources: {},
});

export function emptyExplorePageData(): ExplorePageData {
  return { items: [], total: 0, facets: emptyFacets() };
}

export function toExplorePageData(
  result: SearchResult<Section>,
  locale: SupportedLocale,
  preferredDevice?: "desktop" | "mobile",
): ExplorePageData {
  const items = result.items.map((section) => {
    const crops = MOCK_SECTION_CROPS.filter((crop) => crop.sectionId === section.id);
    const crop = crops.find((candidate) => candidate.device === preferredDevice)
      ?? crops.find((candidate) => candidate.device === "desktop")
      ?? crops[0];
    const asset = MOCK_ASSETS.find((candidate) => candidate.id === crop?.renderedAssetId);
    const source = MOCK_SOURCES.find((candidate) => candidate.id === section.sourceId);
    const sectionType = getTaxonomyEntry("sectionType", section.sectionTypeId);

    if (!crop || !asset || !source || !sectionType) {
      throw new Error(`Explore data is incomplete for section ${section.id}`);
    }

    return {
      id: section.id,
      title: section.title,
      sectionType: t(locale, sectionType.labelKey),
      sourceName: source.name,
      tagsLabel: t(locale, "explore.referenceTags"),
      tags: section.tags,
      language: t(locale, LANGUAGES.find((entry) => entry.id === section.language)!.labelKey),
      isArabic: section.language === "ar",
      direction: t(locale, DIRECTIONS.find((entry) => entry.id === section.direction)!.labelKey),
      devices: crops.map((entry) => t(locale, DEVICES.find((device) => device.id === entry.device)!.labelKey)),
      image: {
        src: asset.url,
        width: crop.width,
        height: crop.height,
        alt: `${source.name}: ${section.title}`,
      },
    };
  });

  return {
    items,
    total: result.total,
    facets: result.facets ?? emptyFacets(),
    ...(result.nextCursor ? { nextCursor: result.nextCursor } : {}),
  };
}
