import { describe, expect, it } from "vitest";
import { SUGGESTION_LIMIT, buildSuggestions } from "@/lib/search-suggestions";
import type { Source } from "@/types/domain";

/**
 * Suggestions are the overlay's guess at what the user means. They must be
 * deterministic, drawn from the shared taxonomy, and — the part that is easy to
 * get wrong — they must offer nothing at all when the query matches nothing.
 */

const source = (id: string, name: string): Source => ({
  id,
  name,
  url: `https://example.com/${id}`,
  description: `${name} is a fictional reference source.`,
  industryId: "saas",
  createdAt: "2026-01-01T00:00:00.000Z",
  attribution: "Example Studio",
  capturedAt: "2026-01-01T00:00:00.000Z",
});

const sources = [
  source("src-barstow", "Barstow"),
  source("src-flobar", "Flobar"),
  source("src-zenith", "Zenith Labs"),
];

const ids = (query: string) => buildSuggestions(query, sources).map((suggestion) => suggestion.id);

describe("buildSuggestions", () => {
  it("offers nothing for an empty or whitespace-only query", () => {
    expect(buildSuggestions("", sources)).toEqual([]);
    expect(buildSuggestions("   ", sources)).toEqual([]);
  });

  it("offers nothing when no term contains what was typed", () => {
    expect(buildSuggestions("zzzzz", sources)).toEqual([]);
  });

  it("ranks a name that starts with the query above one that only contains it", () => {
    const ranked = ids("bar");
    expect(ranked[0]).toBe("src-barstow");
    expect(ranked.indexOf("src-barstow")).toBeLessThan(ranked.indexOf("src-flobar"));
  });

  it("prefers an entry's own id over another entry's alias for the same word", () => {
    // "Finance" is both the `finance` industry's id and an alias of `fintech`.
    expect(ids("finance").slice(0, 2)).toEqual(["finance", "fintech"]);
  });

  it("matches multi-word aliases", () => {
    expect(ids("above the")[0]).toBe("hero");
  });

  it("ignores case, hyphens and punctuation", () => {
    expect(ids("E-Commerce")[0]).toBe("ecommerce");
    expect(ids("dark ui")[0]).toBe("dark");
  });

  it("describes a taxonomy suggestion by id alone, leaving the label to the caller", () => {
    expect(buildSuggestions("hero", sources)[0]).toEqual({ kind: "sectionType", id: "hero" });
  });

  it("carries a source's name as its label, because sources are data, not taxonomy", () => {
    expect(buildSuggestions("zenith", sources)[0]).toEqual({ kind: "source", id: "src-zenith", label: "Zenith Labs" });
  });

  it("caps the list at the requested limit, and at the shared default otherwise", () => {
    expect(buildSuggestions("a", sources, 3)).toHaveLength(3);
    expect(buildSuggestions("a", sources).length).toBeLessThanOrEqual(SUGGESTION_LIMIT);
  });

  it("returns the same list for the same input every time", () => {
    expect(buildSuggestions("pri", sources)).toEqual(buildSuggestions("pri", sources));
  });
});
