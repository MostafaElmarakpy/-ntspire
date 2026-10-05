import { describe, expect, it } from "vitest";
import { MOCK_PAGES, MOCK_SOURCES } from "@/mocks/fixtures";
import { findPageBySlug, findSourceBySlug, pageSlug, sourceSlug } from "@/lib/slugs";

describe("slugs", () => {
  it("strips the entity prefix from a source id", () => {
    expect(sourceSlug("source-flowbase")).toBe("flowbase");
    expect(sourceSlug("source-nimbus-pay")).toBe("nimbus-pay");
    // An id without the prefix is already its own slug rather than an empty one.
    expect(sourceSlug("flowbase")).toBe("flowbase");
  });

  it("keeps page ids as slugs", () => {
    expect(pageSlug("flowbase-home")).toBe("flowbase-home");
  });

  it("resolves every mock source and page from its slug, in both directions", () => {
    for (const source of MOCK_SOURCES) {
      expect(findSourceBySlug(MOCK_SOURCES, sourceSlug(source.id))?.id).toBe(source.id);
    }
    for (const page of MOCK_PAGES) {
      expect(findPageBySlug(MOCK_PAGES, pageSlug(page.id))?.id).toBe(page.id);
    }
  });

  it("returns nothing for an unknown or empty slug", () => {
    expect(findSourceBySlug(MOCK_SOURCES, "flowbas")).toBeUndefined();
    expect(findSourceBySlug(MOCK_SOURCES, "")).toBeUndefined();
    expect(findPageBySlug(MOCK_PAGES, "flowbase home")).toBeUndefined();
    expect(findPageBySlug(MOCK_PAGES, "")).toBeUndefined();
  });

  it("keeps the source and page slug spaces separate", () => {
    // A source slug is never a page slug: `flowbase` addresses the source, and
    // only `flowbase-home` addresses a page.
    const sourceSlugs = new Set(MOCK_SOURCES.map((source) => sourceSlug(source.id)));
    expect(sourceSlugs.has("flowbase")).toBe(true);
    expect(findPageBySlug(MOCK_PAGES, "flowbase")).toBeUndefined();
    expect(findSourceBySlug(MOCK_SOURCES, "flowbase-home")).toBeUndefined();
  });
});
