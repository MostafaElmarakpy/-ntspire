import { applyMockConfig } from "@/config/mock-config";
import { getSimilarSections, querySections } from "@/lib/query-engine";
import { buildSuggestions } from "@/lib/search-suggestions";
import { MOCK_FIXTURE } from "@/mocks/fixtures";
import { Page, Section, Source } from "@/types/domain";
import { PageService, SearchRequest, SearchService, SectionService, SourceService } from "@/types/services";

const sourceService: SourceService = {
  async getById(id) { return applyMockConfig(() => MOCK_FIXTURE.sources.find((source) => source.id === id) ?? null, undefined, null); },
  async list() { return applyMockConfig(() => [...MOCK_FIXTURE.sources], undefined, []); },
};

const pageService: PageService = {
  async getById(id) { return applyMockConfig(() => MOCK_FIXTURE.pages.find((page) => page.id === id) ?? null, undefined, null); },
  async list() { return applyMockConfig(() => [...MOCK_FIXTURE.pages], undefined, []); },
  async listBySourceId(sourceId) { return applyMockConfig(() => MOCK_FIXTURE.pages.filter((page) => page.sourceId === sourceId), undefined, []); },
};

const sectionService: SectionService = {
  async getById(id) { return applyMockConfig(() => MOCK_FIXTURE.sections.find((section) => section.id === id) ?? null, undefined, null); },
  async list() { return applyMockConfig(() => [...MOCK_FIXTURE.sections], undefined, []); },
  async listByPageId(pageId) { return applyMockConfig(() => MOCK_FIXTURE.sections.filter((section) => section.pageId === pageId), undefined, []); },
  async getSimilar(id, limit = 6) {
    return applyMockConfig(() => {
      const selected = MOCK_FIXTURE.sections.find((section) => section.id === id);
      if (!selected) return [];
      return getSimilarSections(MOCK_FIXTURE.sections, selected, limit);
    }, undefined, []);
  },
};

const searchService: SearchService = {
  async search(request: SearchRequest) {
    return applyMockConfig(() => querySections(MOCK_FIXTURE.sections, MOCK_FIXTURE.sources, request), request.mockQuery, {
      items: [],
      total: 0,
      facets: { sectionTypes: {}, industries: {}, styles: {}, typographies: {}, colors: {}, stacks: {}, formats: {}, languages: {}, devices: {}, directions: {}, themes: {}, sources: {} },
    });
  },
  // Suggestions rank the same taxonomy the parser reads, so a suggested term is
  // always a term the search itself understands.
  async suggest({ q, limit }) {
    return applyMockConfig(() => buildSuggestions(q ?? "", MOCK_FIXTURE.sources, limit), undefined, []);
  },
};

export const mockSourceService = sourceService;
export const mockPageService = pageService;
export const mockSectionService = sectionService;
export const mockSearchService = searchService;

export const mockServices = {
  pages: mockPageService,
  search: mockSearchService,
  sections: mockSectionService,
  sources: mockSourceService,
} as const satisfies Record<string, SourceService | PageService | SectionService | SearchService>;

export type MockServiceEntity = Source | Page | Section;
