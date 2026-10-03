import { describe, expect, it } from "vitest";
import { MOCK_SECTIONS, MOCK_SOURCES } from "@/mocks/fixtures";
import { compareSharedTags, getSimilarSections, querySections } from "@/lib/query-engine";

describe("querySections", () => {
  it("combines taxonomy, device, source, theme, and text filters", () => {
    const result = querySections(MOCK_SECTIONS, MOCK_SOURCES, { q: "hero", industryId: "saas", styleId: "dark", device: "mobile", theme: "dark" });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe("section-flowbase-home-2");
  });

  it("searches title, source name, tags, and section type", () => {
    expect(querySections(MOCK_SECTIONS, MOCK_SOURCES, { q: "Nimbus" }).items.length).toBeGreaterThan(0);
    expect(querySections(MOCK_SECTIONS, MOCK_SOURCES, { q: "navigation" }).items.length).toBeGreaterThan(0);
    expect(querySections(MOCK_SECTIONS, MOCK_SOURCES, { q: "pricing" }).items.every((section) => section.sectionTypeId === "pricing" || section.tags.includes("pricing"))).toBe(true);
  });

  it("returns Arabic references and matching facet counts", () => {
    const result = querySections(MOCK_SECTIONS, MOCK_SOURCES, { language: "ar" });

    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((section) => section.language === "ar")).toBe(true);
    expect(result.facets.languages.ar).toBe(result.total);
  });

  it("sorts, paginates at boundaries, and returns facets", () => {
    const first = querySections(MOCK_SECTIONS, MOCK_SOURCES, { sortBy: "latest", limit: 2 });
    expect(first.items).toHaveLength(2);
    expect(first.nextCursor).toBeDefined();
    const second = querySections(MOCK_SECTIONS, MOCK_SOURCES, { sortBy: "latest", limit: 2, cursor: first.nextCursor });
    expect(second.items[0].id).not.toBe(first.items[0].id);
    expect(first.facets.languages).toEqual(expect.objectContaining({ en: expect.any(Number), ar: expect.any(Number) }));
    const last = querySections(MOCK_SECTIONS, MOCK_SOURCES, { limit: 100, cursor: "invalid" });
    expect(last.items).toHaveLength(MOCK_SECTIONS.length);
    expect(last.nextCursor).toBeUndefined();
  });

  it("ranks shared-tag similarity with deterministic ties", () => {
    const base = MOCK_SECTIONS.find((section) => section.id === "section-flowbase-home-2")!;
    const candidate = MOCK_SECTIONS.find((section) => section.id === "section-papercrane-collaboration-1")!;
    expect(compareSharedTags(base, candidate)).toBe(0);
    const ranked = querySections(MOCK_SECTIONS, MOCK_SOURCES, { sectionTypeId: "hero", sortBy: "featured" });
    expect(ranked.items.length).toBeGreaterThan(0);
    const tieBase = { ...base, id: "base", sectionTypeId: "hero", industryId: "saas", styleId: "minimal", tags: ["shared"] };
    const tieLater = { ...tieBase, id: "section-zulu", industryId: "agency" };
    const tieEarlier = { ...tieBase, id: "section-alpha", industryId: "agency" };
    expect(getSimilarSections([tieBase, tieLater, tieEarlier], tieBase, 6).map((section) => section.id)).toEqual(["section-alpha", "section-zulu"]);
  });
});
