import "server-only";
import { toSectionCard } from "@/features/gallery/card-model";
import type { SupportedLocale } from "@/i18n/config";
import type { SearchFacets, SearchResult, Section } from "@/types/domain";
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

/**
 * Explore renders the Phase 04 `SectionCard`, so its results are built by the
 * same view-model builder the gallery and the detail pages use. The only
 * Explore-specific input is which of a section's crops the card shows: a
 * mobile-filtered search shows the mobile crop, and a section that has no mobile
 * crop still shows its own desktop one.
 */
export function toExplorePageData(
  result: SearchResult<Section>,
  locale: SupportedLocale,
  preferredDevice?: "desktop" | "mobile",
): ExplorePageData {
  const items = result.items.map((section) => {
    const card = toSectionCard(section, locale, preferredDevice);
    if (!card) throw new Error(`Explore data is incomplete for section ${section.id}`);
    return card;
  });

  return {
    items,
    total: result.total,
    facets: result.facets ?? emptyFacets(),
    ...(result.nextCursor ? { nextCursor: result.nextCursor } : {}),
  };
}
