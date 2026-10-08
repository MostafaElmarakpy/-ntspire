import { describe, expect, it } from "vitest";
import { parseExploreParams, serializeExploreParams } from "@/lib/explore-state";

describe("explore-state", () => {
  it("round-trips valid params and drops invalid values", () => {
    const params = parseExploreParams("?q=hero&sectionType=hero&industry=saas&style=dark&typography=sans&color=blue&stack=react&format=og-image&language=en&direction=ltr&device=mobile&theme=dark&sort=featured&bad=1");

    expect(params).toMatchObject({
      q: "hero",
      sectionTypeId: "hero",
      industryId: "saas",
      styleId: "dark",
      typographyId: "sans",
      colorId: "blue",
      stackId: "react",
      formatId: "og-image",
      language: "en",
      direction: "ltr",
      device: "mobile",
      theme: "dark",
      sortBy: "featured",
    });

    expect(serializeExploreParams(params)).toBe("q=hero&sectionType=hero&industry=saas&style=dark&typography=sans&color=blue&stack=react&format=og-image&language=en&direction=ltr&device=mobile&theme=dark&sort=featured");
  });

  it("accepts both canonical and legacy keys and ignores unknown values", () => {
    const params = parseExploreParams(new URLSearchParams("?sectionTypeId=pricing&industryId=fintech&theme=light&sortBy=latest&device=tablet"));
    expect(params.sectionTypeId).toBe("pricing");
    expect(params.industryId).toBe("fintech");
    expect(params.theme).toBe("light");
    expect(params.sortBy).toBe("latest");
    expect(params.device).toBeUndefined();
  });

  it("selects the first valid value from duplicate parameters", () => {
    const params = parseExploreParams("?sectionType=invalid&sectionType=pricing&industry=invalid&industry=fintech&sort=unknown&sort=featured");

    expect(params).toEqual({ sectionTypeId: "pricing", industryId: "fintech", sortBy: "featured" });
  });

  it("omits invalid runtime state and keeps the canonical parameter order", () => {
    const params = serializeExploreParams({ q: "  hero  ", sectionTypeId: "unknown", industryId: "saas", styleId: "dark", sortBy: "featured" });

    expect(params).toBe("q=hero&industry=saas&style=dark&sort=featured");
  });
});
