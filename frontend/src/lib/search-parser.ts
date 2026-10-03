import { INDUSTRIES, SECTION_TYPES, STYLES } from "@/config/taxonomy";

export type SearchParserResult = {
  q: string;
  filters: {
    sectionTypeId?: string;
    industryId?: string;
    styleId?: string;
    language?: "en" | "ar";
    direction?: "ltr" | "rtl";
    device?: "desktop" | "mobile";
  };
};

const normalize = (value: string) => value.toLowerCase().replace(/[_-]/g, " ").replace(/\s+/g, " ").trim();

type TaxonomyEntry = { id: string; aliases?: { en?: string[] } };

const createAliasMap = (entries: TaxonomyEntry[]) => {
  const aliases: Array<[string, string]> = [];
  for (const entry of entries) {
    aliases.push([normalize(entry.id), entry.id]);
    for (const alias of entry.aliases?.en ?? []) {
      aliases.push([normalize(alias), entry.id]);
    }
  }
  return new Map(aliases);
};

const languageAliases = new Map<string, "en" | "ar">([
  ["english", "en"],
  ["en", "en"],
  ["arabic", "ar"],
  ["ar", "ar"],
  ["arabic websites", "ar"],
]);

const directionAliases = new Map<string, "ltr" | "rtl">([
  ["ltr", "ltr"],
  ["left to right", "ltr"],
  ["right to left", "rtl"],
  ["rtl", "rtl"],
]);

const deviceAliases = new Map<string, "desktop" | "mobile">([
  ["desktop", "desktop"],
  ["mobile", "mobile"],
]);

export function parseSearchQuery(input: string, taxonomy?: { sectionTypes?: Array<{ id: string; aliases?: { en: string[] } }>; industries?: Array<{ id: string; aliases?: { en: string[] } }>; styles?: Array<{ id: string; aliases?: { en: string[] } }> }): SearchParserResult {
  const query = input.trim();
  const filters: SearchParserResult["filters"] = {};
  const tokens = query.split(/\s+/).filter(Boolean);
  const remaining: string[] = [];

  const syntax = {
    sectionTypes: taxonomy?.sectionTypes ?? SECTION_TYPES,
    industries: taxonomy?.industries ?? INDUSTRIES,
    styles: taxonomy?.styles ?? STYLES,
  };

  const sectionTypeAliases = createAliasMap(syntax.sectionTypes);
  const industryAliases = createAliasMap(syntax.industries);
  const styleAliases = createAliasMap(syntax.styles);

  for (const token of tokens) {
    const normalizedToken = normalize(token);
    const sectionId = sectionTypeAliases.get(normalizedToken);
    const industryId = industryAliases.get(normalizedToken);
    const styleId = styleAliases.get(normalizedToken);

    if (sectionId) {
      filters.sectionTypeId ??= sectionId;
      continue;
    }

    if (industryId) {
      filters.industryId ??= industryId;
      continue;
    }

    if (styleId) {
      filters.styleId ??= styleId;
      continue;
    }

    const language = languageAliases.get(normalizedToken);
    if (language) {
      filters.language = language;
      continue;
    }

    const direction = directionAliases.get(normalizedToken);
    if (direction) {
      filters.direction = direction;
      continue;
    }

    const device = deviceAliases.get(normalizedToken);
    if (device) {
      filters.device = device;
      continue;
    }

    if (normalizedToken === "saas" || normalizedToken === "software as a service") {
      filters.industryId = "saas";
      continue;
    }

    if (normalizedToken === "ecommerce" || normalizedToken === "e commerce" || normalizedToken === "online store") {
      filters.industryId = "ecommerce";
      continue;
    }

    remaining.push(token);
  }

  if (!filters.sectionTypeId) {
    filters.sectionTypeId = sectionTypeAliases.get(normalize(query));
  }

  if (!filters.industryId) {
    filters.industryId = industryAliases.get(normalize(query));
  }

  if (!filters.styleId) {
    filters.styleId = styleAliases.get(normalize(query));
  }

  const q = remaining.join(" ").trim();

  return {
    q,
    filters,
  };
}
