import { describe, expect, it } from "vitest";
import { parseSearchQuery } from "@/lib/search-parser";
import { COLORS, SECTION_TYPES, INDUSTRIES, STACKS, STYLES, TYPOGRAPHIES } from "@/config/taxonomy";

describe("parseSearchQuery", () => {
  it("detects taxonomy filters and preserves free text", () => {
    const result = parseSearchQuery("Arabic SaaS Hero", { sectionTypes: SECTION_TYPES, industries: INDUSTRIES, styles: STYLES, typographies: TYPOGRAPHIES, colors: COLORS, stacks: STACKS });

    expect(result.filters).toMatchObject({ language: "ar", industryId: "saas", sectionTypeId: "hero" });
    expect(result.q).toBe("");
  });

  it("supports the required examples from the spec", () => {
    const rtl = parseSearchQuery("RTL fintech pricing mobile", { sectionTypes: SECTION_TYPES, industries: INDUSTRIES, styles: STYLES, typographies: TYPOGRAPHIES, colors: COLORS, stacks: STACKS });
    expect(rtl.filters).toMatchObject({ direction: "rtl", industryId: "fintech", sectionTypeId: "pricing", device: "mobile" });

    const dark = parseSearchQuery("Dark ecommerce navbar", { sectionTypes: SECTION_TYPES, industries: INDUSTRIES, styles: STYLES, typographies: TYPOGRAPHIES, colors: COLORS, stacks: STACKS });
    expect(dark.filters).toMatchObject({ styleId: "dark", industryId: "ecommerce", sectionTypeId: "navbar" });
  });

  it("interprets RTL as direction rather than language", () => {
    const result = parseSearchQuery("RTL fintech pricing mobile", { sectionTypes: SECTION_TYPES, industries: INDUSTRIES, styles: STYLES, typographies: TYPOGRAPHIES, colors: COLORS, stacks: STACKS });

    expect(result.filters).toMatchObject({ direction: "rtl", industryId: "fintech", sectionTypeId: "pricing", device: "mobile" });
    expect(result.filters.language).toBeUndefined();
  });

  it("detects a repeated canonical style id without consuming it as free text", () => {
    const result = parseSearchQuery("dark dark unknown brand navbar", { sectionTypes: SECTION_TYPES, industries: INDUSTRIES, styles: STYLES, typographies: TYPOGRAPHIES, colors: COLORS, stacks: STACKS });

    expect(result.filters).toMatchObject({ styleId: "dark", sectionTypeId: "navbar" });
    expect(result.q).toBe("unknown brand");
  });

  it("keeps unknown words in the remaining query and handles duplicates safely", () => {
    const result = parseSearchQuery("dark dark unknown brand navbar", { sectionTypes: SECTION_TYPES, industries: INDUSTRIES, styles: STYLES, typographies: TYPOGRAPHIES, colors: COLORS, stacks: STACKS });
    expect(result.filters.styleId).toBe("dark");
    expect(result.filters.sectionTypeId).toBe("navbar");
    expect(result.q).toContain("unknown");
    expect(result.q).toContain("brand");
  });
});

describe("parseSearchQuery edge cases", () => {
  it("returns no filters and no free text for empty or whitespace-only input", () => {
    for (const input of ["", "   ", "\n\t  "]) {
      const result = parseSearchQuery(input);
      expect(result.filters).toEqual({});
      expect(result.q).toBe("");
    }
  });

  it("keeps a query that names no known taxonomy value entirely as free text", () => {
    const result = parseSearchQuery("unknown brand zzz");

    expect(result.filters).toEqual({});
    expect(result.q).toBe("unknown brand zzz");
  });

  it("is case-insensitive", () => {
    expect(parseSearchQuery("ARABIC SaaS HeRo").filters).toMatchObject({
      language: "ar",
      industryId: "saas",
      sectionTypeId: "hero",
    });
  });

  it("treats hyphens and underscores as word breaks, so e-commerce and ecommerce agree", () => {
    const hyphenated = parseSearchQuery("e-commerce navbar");
    const joined = parseSearchQuery("ecommerce navbar");

    expect(hyphenated.filters).toMatchObject({ industryId: "ecommerce", sectionTypeId: "navbar" });
    expect(joined.filters).toEqual(hyphenated.filters);
  });

  it("matches multi-word aliases as a unit instead of one word at a time", () => {
    expect(parseSearchQuery("value proposition").filters.sectionTypeId).toBe("value_proposition");
    expect(parseSearchQuery("logo cloud").filters.sectionTypeId).toBe("logo_cloud");
    expect(parseSearchQuery("call to action").filters.sectionTypeId).toBe("cta");
    expect(parseSearchQuery("above the fold").filters.sectionTypeId).toBe("hero");
    expect(parseSearchQuery("social proof").filters.sectionTypeId).toBe("testimonials");
    expect(parseSearchQuery("software as a service").filters.industryId).toBe("saas");
  });

  it("prefers the longest overlapping alias rather than splitting it", () => {
    const result = parseSearchQuery("arabic websites hero");

    expect(result.filters).toMatchObject({ language: "ar", sectionTypeId: "hero" });
    expect(result.q).toBe("");
  });

  it("prefers the most specific valid taxonomy match", () => {
    // "Finance" is both an alias of `fintech` and the id of the `finance`
    // industry. The entry whose id it actually is has the better claim.
    expect(parseSearchQuery("finance").filters.industryId).toBe("finance");
    expect(parseSearchQuery("fintech").filters.industryId).toBe("fintech");
  });

  it("resolves a repeated term once and never flips the earlier decision", () => {
    const result = parseSearchQuery("hero hero hero");

    expect(result.filters).toEqual({ sectionTypeId: "hero" });
    expect(result.q).toBe("");
  });

  it("drops recognised words from the free text and keeps the rest in order", () => {
    const result = parseSearchQuery("minimal pricing landing page");

    expect(result.filters).toMatchObject({ styleId: "minimal", sectionTypeId: "pricing" });
    expect(result.q).toBe("landing page");
  });

  it("leaves the unrecognised part of the query in the user's own casing", () => {
    const result = parseSearchQuery("Hero Landing Page for Acme");

    expect(result.filters.sectionTypeId).toBe("hero");
    expect(result.q).toBe("Landing Page for Acme");
  });

  it("reads Arabic aliases out of the taxonomy without a code change", () => {    // Phase 11 fills `aliases.ar`; the parser must honour it from data alone.
    const taxonomy = {
      sectionTypes: [{ id: "hero", aliases: { en: ["Hero"], ar: ["واجهة"] } }],
      industries: [],
      styles: [],
      typographies: [],
      colors: [],
      stacks: [],
    };

    expect(parseSearchQuery("واجهة", taxonomy, "ar").filters.sectionTypeId).toBe("hero");
    expect(parseSearchQuery("واجهة", taxonomy, "en").filters.sectionTypeId).toBeUndefined();
  });

  it("detects the Figma filter dimensions from the shared taxonomy", () => {
    expect(parseSearchQuery("react dark hero").filters).toMatchObject({
      stackId: "react",
      styleId: "dark",
      sectionTypeId: "hero",
    });
    expect(parseSearchQuery("serif pricing").filters).toMatchObject({
      typographyId: "serif",
      sectionTypeId: "pricing",
    });
    expect(parseSearchQuery("blue hero retail").filters).toMatchObject({
      colorId: "blue",
      sectionTypeId: "hero",
      industryId: "retail",
    });
  });

  it("keeps original resolutions when a phrase exists in several dimensions", () => {
    // "monochrome" is both a style and a color id; the older style reading wins.
    expect(parseSearchQuery("monochrome hero").filters).toMatchObject({
      styleId: "monochrome",
      sectionTypeId: "hero",
    });
    expect(parseSearchQuery("monochrome hero").filters.colorId).toBeUndefined();
  });
});
