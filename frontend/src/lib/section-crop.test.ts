import { describe, expect, it } from "vitest";
import { MOCK_ASSETS, MOCK_SECTION_CROPS } from "@/mocks/fixtures";
import type { SectionCrop } from "@/types/domain";
import {
  availableDevices,
  centeringScrollTop,
  cropRectToPercent,
  cropRectToPixels,
  hasCropFor,
  pickCrop,
} from "@/lib/section-crop";

const crop = (device: SectionCrop["device"], overrides: Partial<SectionCrop> = {}): SectionCrop => ({
  id: `crop-${device}`,
  sectionId: "section-one",
  device,
  assetId: "page-one-desktop",
  cropX: 0,
  cropY: 100,
  cropWidth: 1440,
  cropHeight: 640,
  renderedAssetId: `crop-section-one-${device}`,
  width: 1440,
  height: 640,
  ...overrides,
});

describe("pickCrop", () => {
  const both = [crop("desktop", { cropY: 0 }), crop("mobile", { cropY: 480, width: 390, height: 864 })];
  const desktopOnly = [crop("desktop")];
  const mobileOnly = [crop("mobile", { cropY: 300, width: 390, height: 864 })];

  it("returns the requested device's own crop when it exists", () => {
    expect(pickCrop(both, "mobile")?.device).toBe("mobile");
    expect(pickCrop(both, "desktop")?.device).toBe("desktop");
    expect(pickCrop(mobileOnly, "mobile")?.cropY).toBe(300);
  });

  it("falls back to the desktop crop when no device was asked for", () => {
    expect(pickCrop(both)?.device).toBe("desktop");
    expect(pickCrop(mobileOnly)?.device).toBe("mobile");
  });

  it("falls back to the only available crop when the section is desktop-only", () => {
    expect(pickCrop(desktopOnly, "mobile")?.device).toBe("desktop");
    expect(hasCropFor(desktopOnly, "mobile")).toBe(false);
    expect(availableDevices(desktopOnly)).toEqual(["desktop"]);
  });

  it("falls back to the only available crop when the section is mobile-only", () => {
    expect(pickCrop(mobileOnly, "desktop")?.device).toBe("mobile");
    expect(pickCrop(mobileOnly, "desktop")?.cropY).toBe(300);
    expect(hasCropFor(mobileOnly, "desktop")).toBe(false);
    expect(availableDevices(mobileOnly)).toEqual(["mobile"]);
  });

  it("reports both devices when the section has both, and keeps the two geometries apart", () => {
    expect(availableDevices(both)).toEqual(["desktop", "mobile"]);
    expect(pickCrop(both, "desktop")).toMatchObject({ cropY: 0 });
    expect(pickCrop(both, "mobile")).toMatchObject({ cropY: 480, width: 390, height: 864 });
  });

  it("returns nothing for a section with no crops at all", () => {
    expect(pickCrop([])).toBeUndefined();
    expect(availableDevices([])).toEqual([]);
  });

  it("never moves one device's coordinates onto another device's request", () => {
    // The mobile crop's geometry is the mobile crop's, whichever device was
    // asked for — a desktop request can only ever receive the desktop crop.
    const mixed = [crop("desktop", { cropY: 0, cropHeight: 120 }), crop("mobile", { cropY: 120, cropHeight: 300 })];
    expect(pickCrop(mixed, "desktop")).toMatchObject({ cropY: 0, cropHeight: 120 });
    expect(pickCrop(mixed, "mobile")).toMatchObject({ cropY: 120, cropHeight: 300 });
  });

  it("picks the real desktop and mobile crops from the fixture", () => {
    const sectionId = MOCK_SECTION_CROPS[0].sectionId;
    const crops = MOCK_SECTION_CROPS.filter((entry) => entry.sectionId === sectionId);
    for (const device of availableDevices(crops)) {
      const picked = pickCrop(crops, device);
      expect(picked?.device).toBe(device);
      expect(picked?.sectionId).toBe(sectionId);
    }
  });
});

describe("cropRectToPercent", () => {
  it("converts a rectangle at the asset's own size into percentages", () => {
    const rect = cropRectToPercent({ cropX: 0, cropY: 720, cropWidth: 1440, cropHeight: 360 }, { width: 1440, height: 1440 });
    expect(rect).toEqual({ left: 0, top: 50, width: 100, height: 25 });
  });

  it("keeps the same percentages when the rendered size is scaled", () => {
    const geometry = { cropX: 120, cropY: 480, cropWidth: 720, cropHeight: 240 };
    const image = { width: 1440, height: 2400 };
    const natural = cropRectToPercent(geometry, image);
    // The screenshot renders at half scale; percentages are size-independent, so
    // the same numbers describe the highlight on both.
    const scaled = cropRectToPixels(geometry, image, { width: 720, height: 1200 });
    expect(natural).toEqual({ left: 120 / 1440 * 100, top: 20, width: 50, height: 10 });
    expect(scaled.left).toBeCloseTo(60);
    expect(scaled.top).toBeCloseTo(240);
    expect(scaled.width).toBeCloseTo(360);
    expect(scaled.height).toBeCloseTo(120);
  });

  it("scales to an arbitrary rendered width, not only halves", () => {
    const geometry = { cropX: 0, cropY: 0, cropWidth: 1440, cropHeight: 640 };
    const image = { width: 1440, height: 3200 };
    const rendered = { width: 390, height: 866.6667 };
    const rect = cropRectToPixels(geometry, image, rendered);
    expect(rect.left).toBe(0);
    expect(rect.width).toBeCloseTo(390);
    expect(rect.height).toBeCloseTo(173.3333, 3);
  });

  it("clamps a rectangle that would run past the screenshot", () => {
    const rect = cropRectToPercent({ cropX: 1200, cropY: 2000, cropWidth: 800, cropHeight: 800 }, { width: 1440, height: 2400 });
    expect(rect.left + rect.width).toBeLessThanOrEqual(100);
    expect(rect.top + rect.height).toBeLessThanOrEqual(100);
  });

  it("returns an empty rectangle for a degenerate image size", () => {
    expect(cropRectToPercent({ cropX: 0, cropY: 0, cropWidth: 10, cropHeight: 10 }, { width: 0, height: 0 }))
      .toEqual({ left: 0, top: 0, width: 0, height: 0 });
  });

  it("places every real fixture crop inside its own page screenshot", () => {
    for (const entry of MOCK_SECTION_CROPS) {
      const pageAsset = MOCK_ASSETS.find((asset) => asset.id === entry.assetId);
      if (!pageAsset) throw new Error(`Missing page asset ${entry.assetId}`);

      const rect = cropRectToPercent(entry, pageAsset);
      expect(rect.left).toBeGreaterThanOrEqual(0);
      expect(rect.top).toBeGreaterThanOrEqual(0);
      expect(rect.width).toBeGreaterThan(0);
      expect(rect.height).toBeGreaterThan(0);
      // The highlight can never spill outside the screenshot it was cut from.
      expect(rect.left + rect.width).toBeLessThanOrEqual(100);
      expect(rect.top + rect.height).toBeLessThanOrEqual(100);
      // And it is the section's own band, not the whole page.
      expect(rect.height).toBeLessThan(100);
    }
  });
});

describe("centeringScrollTop", () => {
  it("centres a rectangle inside the visible height", () => {
    expect(centeringScrollTop({ left: 0, top: 1000, width: 100, height: 200 }, 400)).toBe(900);
  });

  it("never scrolls above the top of the container", () => {
    expect(centeringScrollTop({ left: 0, top: 0, width: 100, height: 100 }, 400)).toBe(0);
  });
});
