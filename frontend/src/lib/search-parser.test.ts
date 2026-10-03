import { describe, expect, it } from "vitest";
import { parseSearchQuery } from "@/lib/search-parser";
import { SECTION_TYPES, INDUSTRIES, STYLES } from "@/config/taxonomy";

describe("parseSearchQuery", () => {
  it("detects taxonomy filters and preserves free text", () => {
    const result = parseSearchQuery("Arabic SaaS Hero", { sectionTypes: SECTION_TYPES, industries: INDUSTRIES, styles: STYLES });

    expect(result.filters).toMatchObject({ language: "ar", industryId: "saas", sectionTypeId: "hero" });
    expect(result.q).toBe("");
  });

  it("supports the required examples from the spec", () => {
    const rtl = parseSearchQuery("RTL fintech pricing mobile", { sectionTypes: SECTION_TYPES, industries: INDUSTRIES, styles: STYLES });
    expect(rtl.filters).toMatchObject({ direction: "rtl", industryId: "fintech", sectionTypeId: "pricing", device: "mobile" });

    const dark = parseSearchQuery("Dark ecommerce navbar", { sectionTypes: SECTION_TYPES, industries: INDUSTRIES, styles: STYLES });
    expect(dark.filters).toMatchObject({ styleId: "dark", industryId: "ecommerce", sectionTypeId: "navbar" });
  });

  it("interprets RTL as direction rather than language", () => {
    const result = parseSearchQuery("RTL fintech pricing mobile", { sectionTypes: SECTION_TYPES, industries: INDUSTRIES, styles: STYLES });

    expect(result.filters).toMatchObject({ direction: "rtl", industryId: "fintech", sectionTypeId: "pricing", device: "mobile" });
    expect(result.filters.language).toBeUndefined();
  });

  it("detects a repeated canonical style id without consuming it as free text", () => {
    const result = parseSearchQuery("dark dark unknown brand navbar", { sectionTypes: SECTION_TYPES, industries: INDUSTRIES, styles: STYLES });

    expect(result.filters).toMatchObject({ styleId: "dark", sectionTypeId: "navbar" });
    expect(result.q).toBe("unknown brand");
  });

  it("keeps unknown words in the remaining query and handles duplicates safely", () => {
    const result = parseSearchQuery("dark dark unknown brand navbar", { sectionTypes: SECTION_TYPES, industries: INDUSTRIES, styles: STYLES });
    expect(result.filters.styleId).toBe("dark");
    expect(result.filters.sectionTypeId).toBe("navbar");
    expect(result.q).toContain("unknown");
    expect(result.q).toContain("brand");
  });
});
