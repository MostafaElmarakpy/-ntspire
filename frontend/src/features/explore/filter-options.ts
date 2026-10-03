import { DIRECTIONS, DEVICES, INDUSTRIES, LANGUAGES, SECTION_TYPES, STYLES, THEMES } from "@/config/taxonomy";
import { t } from "@/i18n/messages";
import type { MessageKey } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";
import type { SearchFacets } from "@/types/domain";

export type FilterKey = "sectionTypeId" | "industryId" | "styleId" | "language" | "direction" | "device" | "theme";
export type FacetKey = keyof Pick<SearchFacets, "sectionTypes" | "industries" | "styles" | "languages" | "directions" | "devices" | "themes">;
export type FilterOption = { id: string; labelKey: MessageKey };
export type FilterDefinition = { key: FilterKey; labelKey: MessageKey; facetKey: FacetKey; options: FilterOption[] };

export const EXPLORE_FILTERS: FilterDefinition[] = [
  { key: "sectionTypeId", labelKey: "explore.sectionType", facetKey: "sectionTypes", options: SECTION_TYPES },
  { key: "industryId", labelKey: "explore.industry", facetKey: "industries", options: INDUSTRIES },
  { key: "styleId", labelKey: "explore.style", facetKey: "styles", options: STYLES },
  { key: "language", labelKey: "explore.language", facetKey: "languages", options: LANGUAGES },
  { key: "direction", labelKey: "explore.direction", facetKey: "directions", options: DIRECTIONS },
  { key: "device", labelKey: "explore.device", facetKey: "devices", options: DEVICES },
  { key: "theme", labelKey: "explore.theme", facetKey: "themes", options: THEMES },
];

export const FILTER_LABELS: Record<FilterKey, MessageKey> = Object.fromEntries(
  EXPLORE_FILTERS.map(({ key, labelKey }) => [key, labelKey]),
) as Record<FilterKey, MessageKey>;

export function getExploreFilterLabel(locale: SupportedLocale, key: FilterKey, value: string): string {
  const option = EXPLORE_FILTERS.find((filter) => filter.key === key)?.options.find((candidate) => candidate.id === value);
  return option ? t(locale, option.labelKey) : value;
}
