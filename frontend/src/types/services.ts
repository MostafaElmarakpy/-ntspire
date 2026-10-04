import { ID, Source, Page, Section, SearchResult, Locale, Direction, Device, Theme } from "@/types/domain";

export interface SearchRequest {
  q?: string;
  sectionTypeId?: string;
  industryId?: string;
  styleId?: string;
  language?: Locale;
  direction?: Direction;
  device?: Device;
  theme?: Theme;
  sourceId?: string;
  sortBy?: "latest" | "featured";
  cursor?: string;
  limit?: number;
  mockQuery?: string;
}

export interface SourceService {
  getById(id: ID): Promise<Source | null>;
  list(): Promise<Source[]>;
}

export interface PageService {
  getById(id: ID): Promise<Page | null>;
  list(): Promise<Page[]>;
  listBySourceId(sourceId: ID): Promise<Page[]>;
}

export interface SectionService {
  getById(id: ID): Promise<Section | null>;
  list(): Promise<Section[]>;
  listByPageId(pageId: ID): Promise<Section[]>;
  getSimilar(id: ID, limit?: number): Promise<Section[]>;
}

export type SearchSuggestionKind = "sectionType" | "industry" | "style" | "source";

export interface SearchSuggestion {
  kind: SearchSuggestionKind;
  /** Taxonomy id, or the source id when `kind` is `source`. */
  id: string;
  /** `label` is only set for data-backed entries (sources have a name, not a label key). */
  label?: string;
}

export interface SearchService {
  search(request: SearchRequest): Promise<SearchResult<Section>>;
  suggest?(request: { q?: string; limit?: number }): Promise<SearchSuggestion[]>;
}
