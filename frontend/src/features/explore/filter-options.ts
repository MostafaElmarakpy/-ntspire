import { COLORS, DIRECTIONS, DEVICES, FORMATS, INDUSTRIES, LANGUAGES, SECTION_TYPES, STACKS, STYLES, THEMES, TYPOGRAPHIES } from "@/config/taxonomy";
import { t } from "@/i18n/messages";
import type { MessageKey } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";
import type { SearchFacets } from "@/types/domain";

export type FilterKey = "sectionTypeId" | "industryId" | "styleId" | "typographyId" | "colorId" | "stackId" | "formatId" | "language" | "direction" | "device" | "theme";
export type FacetKey = keyof Pick<SearchFacets, "sectionTypes" | "industries" | "styles" | "typographies" | "colors" | "stacks" | "formats" | "languages" | "directions" | "devices" | "themes">;
export type FilterOption = { id: string; labelKey: MessageKey };
export type FilterDefinition = { key: FilterKey; labelKey: MessageKey; facetKey: FacetKey; options: FilterOption[] };

export const EXPLORE_FILTERS: FilterDefinition[] = [
  { key: "sectionTypeId", labelKey: "explore.sectionType", facetKey: "sectionTypes", options: SECTION_TYPES },
  { key: "industryId", labelKey: "explore.industry", facetKey: "industries", options: INDUSTRIES },
  { key: "styleId", labelKey: "explore.style", facetKey: "styles", options: STYLES },
  { key: "typographyId", labelKey: "explore.typography", facetKey: "typographies", options: TYPOGRAPHIES },
  { key: "colorId", labelKey: "explore.color", facetKey: "colors", options: COLORS },
  { key: "stackId", labelKey: "explore.stack", facetKey: "stacks", options: STACKS },
  { key: "formatId", labelKey: "explore.format", facetKey: "formats", options: FORMATS },
  { key: "language", labelKey: "explore.language", facetKey: "languages", options: LANGUAGES },
  { key: "direction", labelKey: "explore.direction", facetKey: "directions", options: DIRECTIONS },
  { key: "device", labelKey: "explore.device", facetKey: "devices", options: DEVICES },
  { key: "theme", labelKey: "explore.theme", facetKey: "themes", options: THEMES },
];

export const FILTER_LABELS: Record<FilterKey, MessageKey> = Object.fromEntries(
  EXPLORE_FILTERS.map(({ key, labelKey }) => [key, labelKey]),
) as Record<FilterKey, MessageKey>;

/**
 * The D2 quick-pill row: a curated, horizontally scrollable set of
 * single-select toggles over the same `EXPLORE_FILTERS` state the sidebar
 * owns — not a second filter system. Entries render only when the live facets
 * show data behind them, so no pill ever ships without results.
 */
export interface QuickPill {
  key: FilterKey;
  value: string;
}

export const EXPLORE_QUICK_PILLS: readonly QuickPill[] = [
  { key: "sectionTypeId", value: "hero" },
  { key: "sectionTypeId", value: "pricing" },
  { key: "industryId", value: "saas" },
  { key: "industryId", value: "ecommerce" },
  { key: "styleId", value: "minimal" },
  { key: "styleId", value: "dark" },
  { key: "typographyId", value: "serif" },
  { key: "stackId", value: "react" },
  { key: "formatId", value: "og-image" },
  { key: "language", value: "ar" },
];

export function getExploreFilterLabel(locale: SupportedLocale, key: FilterKey, value: string): string {
  const option = EXPLORE_FILTERS.find((filter) => filter.key === key)?.options.find((candidate) => candidate.id === value);
  return option ? t(locale, option.labelKey) : value;
}
