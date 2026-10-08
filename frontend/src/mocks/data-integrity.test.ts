import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { COLORS, DEVICES, DIRECTIONS, FORMATS, INDUSTRIES, SECTION_TYPES, STACKS, STYLES, QUICK_FILTER_CHIPS, TYPOGRAPHIES } from "@/config/taxonomy";
import { MOCK_ASSETS, MOCK_CATEGORIES, MOCK_FIXTURE, MOCK_SECTION_CROPS, MOCK_SECTIONS } from "@/mocks/fixtures";

const assetDirectory = path.join(process.cwd(), "public", "mock-assets");
const dimensionsFromSvg = (assetId: string) => {
  const svg = fs.readFileSync(path.join(assetDirectory, `${assetId}.svg`), "utf8");
  const match = svg.match(/<svg width="(\d+)" height="(\d+)"/);
  return match ? { width: Number(match[1]), height: Number(match[2]) } : null;
};

describe("Phase 02 mock data integrity", () => {
  it("meets dataset minimums and has mixed language/device content", () => {
    expect(MOCK_FIXTURE.sources.length).toBeGreaterThanOrEqual(8);
    expect(MOCK_FIXTURE.sources.length).toBeLessThanOrEqual(12);
    expect(MOCK_FIXTURE.pages.length).toBeGreaterThanOrEqual(12);
    expect(MOCK_FIXTURE.pages.length).toBeLessThanOrEqual(20);
    expect(MOCK_SECTIONS.length).toBeGreaterThanOrEqual(30);
    expect(MOCK_SECTIONS.length).toBeLessThanOrEqual(50);
    expect(MOCK_SECTIONS.some((section) => section.language === "ar" && /[\u0600-\u06ff]/u.test(section.title))).toBe(true);
    expect(MOCK_SECTIONS.some((section) => MOCK_FIXTURE.pages.find((page) => page.id === section.pageId)?.devices.includes("desktop"))).toBe(true);
    expect(MOCK_SECTIONS.some((section) => MOCK_FIXTURE.pages.find((page) => page.id === section.pageId)?.devices.includes("mobile"))).toBe(true);
    expect(new Set(MOCK_ASSETS.map((asset) => asset.width / asset.height)).size).toBeGreaterThanOrEqual(6);
  });

  it("has unique IDs and resolves every reference", () => {
    for (const collection of [MOCK_FIXTURE.sources, MOCK_FIXTURE.pages, MOCK_FIXTURE.sections, MOCK_FIXTURE.crops, MOCK_FIXTURE.assets, MOCK_FIXTURE.tags, MOCK_CATEGORIES]) {
      expect(new Set(collection.map((item) => item.id)).size).toBe(collection.length);
    }
    for (const section of MOCK_SECTIONS) {
      expect(MOCK_FIXTURE.pages.some((page) => page.id === section.pageId && page.sourceId === section.sourceId)).toBe(true);
      expect(MOCK_SECTION_CROPS.filter((crop) => crop.sectionId === section.id).length).toBeGreaterThanOrEqual(1);
      expect(SECTION_TYPES.some((entry) => entry.id === section.sectionTypeId)).toBe(true);
      expect(INDUSTRIES.some((entry) => entry.id === section.industryId)).toBe(true);
      expect(STYLES.some((entry) => entry.id === section.styleId)).toBe(true);
      expect(TYPOGRAPHIES.some((entry) => entry.id === section.typographyId)).toBe(true);
      expect(COLORS.some((entry) => entry.id === section.colorId)).toBe(true);
      expect(STACKS.some((entry) => entry.id === section.stackId)).toBe(true);
      expect(FORMATS.some((entry) => entry.id === section.formatId)).toBe(true);
      expect(DIRECTIONS.some((entry) => entry.id === section.direction)).toBe(true);
    }
  });

  it("matches declared SVG dimensions and keeps crops inside page assets", () => {
    for (const asset of MOCK_ASSETS) expect(dimensionsFromSvg(asset.id)).toEqual({ width: asset.width, height: asset.height });
    for (const crop of MOCK_SECTION_CROPS) {
      const pageAsset = MOCK_ASSETS.find((asset) => asset.id === crop.assetId)!;
      const renderedAsset = MOCK_ASSETS.find((asset) => asset.id === crop.renderedAssetId)!;
      expect(crop.cropX + crop.cropWidth).toBeLessThanOrEqual(pageAsset.width);
      expect(crop.cropY + crop.cropHeight).toBeLessThanOrEqual(pageAsset.height);
      expect({ width: crop.width, height: crop.height }).toEqual({ width: renderedAsset.width, height: renderedAsset.height });
    }
  });

  it("keeps every quick filter backed by a real taxonomy value", () => {
    expect(SECTION_TYPES).toHaveLength(21);
    expect(INDUSTRIES).toHaveLength(16);
    expect(STYLES).toHaveLength(11);
    expect(TYPOGRAPHIES).toHaveLength(4);
    expect(COLORS).toHaveLength(7);
    expect(STACKS).toHaveLength(8);
    expect(FORMATS).toHaveLength(2);
    expect(INDUSTRIES.find((entry) => entry.id === "ecommerce")?.aliases.en).toContain("ecommerce");
    for (const chip of QUICK_FILTER_CHIPS) {
      if (chip.type === "language") expect(["en", "ar"]).toContain(chip.value);
      if (chip.type === "sectionType") expect(SECTION_TYPES.some((entry) => entry.id === chip.value)).toBe(true);
      if (chip.type === "industry") expect(INDUSTRIES.some((entry) => entry.id === chip.value)).toBe(true);
      if (chip.type === "style") expect(STYLES.some((entry) => entry.id === chip.value)).toBe(true);
    }
    expect(QUICK_FILTER_CHIPS.find((chip) => chip.id === "arabic-websites")).toMatchObject({ type: "language", value: "ar" });
    expect(DEVICES.map((device) => device.id)).toEqual(["desktop", "mobile"]);
  });
});
