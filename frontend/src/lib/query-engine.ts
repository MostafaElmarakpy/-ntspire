import { MOCK_SECTION_CROPS } from "@/mocks/fixtures";
import { SearchFacets, Section, Source } from "@/types/domain";
import { SearchRequest } from "@/types/services";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

export interface QueryResult {
  items: Section[];
  total: number;
  facets: SearchFacets;
  nextCursor?: string;
}

const normalized = (value: string) => value.trim().toLocaleLowerCase();
const toCursor = (offset: number) => Buffer.from(String(offset), "utf8").toString("base64url");
const fromCursor = (cursor?: string) => {
  if (!cursor) return 0;
  const parsed = Number.parseInt(Buffer.from(cursor, "base64url").toString("utf8"), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

const createFacets = (sections: Section[]): SearchFacets => {
  const facet = (values: string[]) => values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
  return {
    sectionTypes: facet(sections.map((section) => section.sectionTypeId)),
    industries: facet(sections.map((section) => section.industryId)),
    styles: facet(sections.map((section) => section.styleId)),
    typographies: facet(sections.map((section) => section.typographyId)),
    colors: facet(sections.map((section) => section.colorId)),
    stacks: facet(sections.map((section) => section.stackId)),
    formats: facet(sections.map((section) => section.formatId)),
    languages: facet(sections.map((section) => section.language)),
    devices: sections.reduce<Record<string, number>>((counts, section) => {
      for (const device of ["desktop", "mobile"] as const) {
        if (MOCK_SECTION_CROPS.some((crop) => crop.sectionId === section.id && crop.device === device)) counts[device] = (counts[device] ?? 0) + 1;
      }
      return counts;
    }, {}),
    directions: facet(sections.map((section) => section.direction)),
    themes: facet(sections.map((section) => section.themeId)),
    sources: facet(sections.map((section) => section.sourceId)),
  };
};

export const querySections = (sections: Section[], sources: Source[], request: SearchRequest = {}): QueryResult => {
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const query = normalized(request.q ?? "");
  const filtered = sections.filter((section) => {
    const source = sourceById.get(section.sourceId);
    const hasDevice = request.device
      ? MOCK_SECTION_CROPS.some((crop) => crop.sectionId === section.id && crop.device === request.device)
      : true;
    const searchFields = [section.title, source?.name ?? "", ...section.tags, section.sectionTypeId].map(normalized);
    return (!request.sectionTypeId || section.sectionTypeId === request.sectionTypeId)
      && (!request.industryId || section.industryId === request.industryId)
      && (!request.styleId || section.styleId === request.styleId)
      && (!request.typographyId || section.typographyId === request.typographyId)
      && (!request.colorId || section.colorId === request.colorId)
      && (!request.stackId || section.stackId === request.stackId)
      && (!request.formatId || section.formatId === request.formatId)
      && (!request.language || section.language === request.language)
      && (!request.direction || section.direction === request.direction)
      && (!request.theme || section.themeId === request.theme)
      && (!request.sourceId || section.sourceId === request.sourceId)
      && hasDevice
      && (!query || searchFields.some((field) => field.includes(query)));
  });

  const sorted = [...filtered].sort((left, right) => {
    if (request.sortBy === "featured") {
      const tagDifference = right.tags.length - left.tags.length;
      if (tagDifference !== 0) return tagDifference;
    }
    const dateDifference = right.publishedAt.localeCompare(left.publishedAt);
    return dateDifference !== 0 ? dateDifference : left.id.localeCompare(right.id);
  });
  const total = sorted.length;
  const limit = Math.min(Math.max(request.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
  const offset = Math.min(fromCursor(request.cursor), total);
  const items = sorted.slice(offset, offset + limit);
  const nextOffset = offset + items.length;
  return {
    items,
    total,
    facets: createFacets(sorted),
    ...(nextOffset < total ? { nextCursor: toCursor(nextOffset) } : {}),
  };
};

export const compareSharedTags = (left: Section, right: Section) => {
  const rightTags = new Set(right.tags);
  return left.tags.reduce((count, tag) => count + (rightTags.has(tag) ? 1 : 0), 0);
};

export const getSimilarSections = (sections: Section[], selected: Section, limit = 6) => sections
  .filter((section) => section.id !== selected.id && section.sectionTypeId === selected.sectionTypeId && (section.industryId === selected.industryId || section.styleId === selected.styleId))
  .sort((left, right) => compareSharedTags(right, selected) - compareSharedTags(left, selected) || left.id.localeCompare(right.id))
  .slice(0, Math.min(Math.max(limit, 0), 6));
