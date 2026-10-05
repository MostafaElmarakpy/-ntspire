import { describe, expect, it } from "vitest";
import { MOCK_ASSETS, MOCK_PAGES, MOCK_SECTION_CROPS, MOCK_SECTIONS, MOCK_SOURCES } from "@/mocks/fixtures";
import { pickSectionCrop } from "@/features/gallery/card-model";
import { cropRectToPercent } from "@/lib/section-crop";
import { sourceSlug } from "@/lib/slugs";
import {
  buildCategoriesIndex,
  buildPageDetail,
  buildPagesIndex,
  buildSectionDetail,
  buildSourceDetail,
  buildSourcesIndex,
  emptyCategoriesIndex,
  emptyPageDetail,
  emptyPagesIndex,
  emptySectionDetail,
  emptySourceDetail,
  emptySourcesIndex,
  formatDate,
} from "./model";

/** The manifest gives these three sections a page with both device captures. */
const BOTH_DEVICES_ID = "section-flowbase-home-2";
const DESKTOP_ONLY_ID = "section-flowbase-pricing-1";
const MOBILE_ONLY_ID = "section-cloudloom-browser-1";
/** A both-device section whose type/industry/style another reference also matches. */
const HAS_RELATED_ID = "section-nimbus-pay-home-2";

const section = (id: string) => MOCK_SECTIONS.find((entry) => entry.id === id)!;

describe("buildSectionDetail", () => {
  it("gives each device that device's own crop and that device's own page capture", () => {
    const detail = buildSectionDetail(BOTH_DEVICES_ID, "en");
    expect(detail?.devices.map((view) => view.device)).toEqual(["desktop", "mobile"]);

    const desktop = detail!.devices.find((view) => view.device === "desktop")!;
    const mobile = detail!.devices.find((view) => view.device === "mobile")!;
    const desktopCrop = MOCK_SECTION_CROPS.find((crop) => crop.sectionId === BOTH_DEVICES_ID && crop.device === "desktop")!;
    const mobileCrop = MOCK_SECTION_CROPS.find((crop) => crop.sectionId === BOTH_DEVICES_ID && crop.device === "mobile")!;

    expect(desktop.crop).toEqual({
      cropX: desktopCrop.cropX, cropY: desktopCrop.cropY, cropWidth: desktopCrop.cropWidth, cropHeight: desktopCrop.cropHeight,
    });
    expect(mobile.crop).toEqual({
      cropX: mobileCrop.cropX, cropY: mobileCrop.cropY, cropWidth: mobileCrop.cropWidth, cropHeight: mobileCrop.cropHeight,
    });

    // The two devices are captured from different screenshots at different sizes.
    expect(desktop.pageImage.src).toContain("-desktop.svg");
    expect(mobile.pageImage.src).toContain("-mobile.svg");
    expect(desktop.pageImage.src).not.toBe(mobile.pageImage.src);
    expect(desktop.image.src).toContain("-desktop.svg");
    expect(mobile.image.src).toContain("-mobile.svg");
    expect(desktop.image.width).toBe(1440);
    expect(mobile.image.width).toBe(390);

    // And the mobile rectangle is never the desktop rectangle in disguise.
    expect(mobile.crop.cropY).not.toBe(desktop.crop.cropY);
  });

  it("reports a desktop-only section with a single desktop view", () => {
    const detail = buildSectionDetail(DESKTOP_ONLY_ID, "en");
    expect(detail?.devices.map((view) => view.device)).toEqual(["desktop"]);
    expect(detail?.facts.find((fact) => fact.label === "Devices")?.value).toBe("Desktop only");
  });

  it("reports a mobile-only section with a single mobile view and a mobile capture", () => {
    const detail = buildSectionDetail(MOBILE_ONLY_ID, "en");
    expect(detail?.devices.map((view) => view.device)).toEqual(["mobile"]);
    expect(detail?.facts.find((fact) => fact.label === "Devices")?.value).toBe("Mobile only");
    expect(detail?.devices[0].pageImage.src).toContain("-mobile.svg");
    expect(detail?.devices[0].image.width).toBe(390);
  });

  it("lists the page's other sections as context siblings, for the shown device only", () => {
    const detail = buildSectionDetail(BOTH_DEVICES_ID, "en")!;
    const pageSectionIds = MOCK_SECTIONS.filter((entry) => entry.pageId === section(BOTH_DEVICES_ID).pageId).map((entry) => entry.id);

    for (const view of detail.devices) {
      expect(view.siblings.map((sibling) => sibling.id)).not.toContain(BOTH_DEVICES_ID);
      expect(view.siblings).toHaveLength(pageSectionIds.length - 1);
      expect(view.siblings.map((sibling) => sibling.id).sort()).toEqual(pageSectionIds.filter((id) => id !== BOTH_DEVICES_ID).sort());

      // A sibling's rectangle is that sibling's own crop for this device.
      for (const sibling of view.siblings) {
        const crop = MOCK_SECTION_CROPS.find((entry) => entry.sectionId === sibling.id && entry.device === view.device);
        expect(crop).toBeDefined();
        expect(sibling.crop).toEqual({
          cropX: crop!.cropX, cropY: crop!.cropY, cropWidth: crop!.cropWidth, cropHeight: crop!.cropHeight,
        });
      }
    }
  });

  it("places every context highlight inside the screenshot it belongs to", () => {
    const detail = buildSectionDetail(BOTH_DEVICES_ID, "en")!;
    for (const view of detail.devices) {
      for (const band of [view.crop, ...view.siblings.map((sibling) => sibling.crop)]) {
        const rect = cropRectToPercent(band, view.pageImage);
        expect(rect.left).toBeGreaterThanOrEqual(0);
        expect(rect.top).toBeGreaterThanOrEqual(0);
        expect(rect.left + rect.width).toBeLessThanOrEqual(100);
        expect(rect.top + rect.height).toBeLessThanOrEqual(100);
      }
    }
  });

  it("carries the breadcrumb trail's source, page and section identities", () => {
    const detail = buildSectionDetail(BOTH_DEVICES_ID, "en")!;
    const source = MOCK_SOURCES.find((entry) => entry.id === section(BOTH_DEVICES_ID).sourceId)!;
    const page = MOCK_PAGES.find((entry) => entry.id === section(BOTH_DEVICES_ID).pageId)!;

    expect(detail.sourceName).toBe(source.name);
    expect(detail.sourceSlug).toBe(sourceSlug(source.id));
    expect(detail.pageTitle).toBe(page.title);
    expect(detail.pageSlug).toBe(page.id);
    expect(detail.title).toBe(section(BOTH_DEVICES_ID).title);
    expect(detail.sectionTypeId).toBe("hero");
    expect(detail.sectionType).toBe("Hero");

    // Every crumb's slug resolves back to the record it names.
    expect(MOCK_SOURCES.find((entry) => sourceSlug(entry.id) === detail.sourceSlug)?.id).toBe(source.id);
    expect(MOCK_PAGES.find((entry) => entry.id === detail.pageSlug)?.id).toBe(page.id);
  });

  it("describes the section's own metadata, not the page's", () => {
    const detail = buildSectionDetail(BOTH_DEVICES_ID, "en")!;
    const labels = detail.facts.map((fact) => fact.label);
    expect(labels).toEqual([
      "Language", "Direction", "Devices", "Industry", "Style", "Captured", "Attribution",
    ]);
    expect(detail.facts.find((fact) => fact.label === "Language")?.value).toBe("English");
    expect(detail.facts.find((fact) => fact.label === "Direction")?.value).toBe("Left to right");
    expect(detail.facts.find((fact) => fact.label === "Attribution")?.value).toBe(section(BOTH_DEVICES_ID).attribution);
    expect(detail.facts.find((fact) => fact.label === "Captured")?.value).toBe(formatDate(section(BOTH_DEVICES_ID).capturedAt, "en"));
    expect(detail.tags).toEqual(section(BOTH_DEVICES_ID).tags);
  });

  it("returns related sections that satisfy the similar-sections rule and never itself", () => {
    const selected = section(HAS_RELATED_ID);
    const detail = buildSectionDetail(HAS_RELATED_ID, "en")!;

    // The rule, applied here independently of the builder: a different section of
    // the same type that also shares the industry or the style.
    const expected = MOCK_SECTIONS.filter(
      (candidate) =>
        candidate.id !== selected.id &&
        candidate.sectionTypeId === selected.sectionTypeId &&
        (candidate.industryId === selected.industryId || candidate.styleId === selected.styleId),
    ).map((candidate) => candidate.id);

    expect(expected.length).toBeGreaterThan(0);
    expect(detail.related.map((card) => card.id).sort()).toEqual([...expected].sort());
    expect(detail.related.length).toBeLessThanOrEqual(6);
    expect(detail.related.map((card) => card.id)).not.toContain(HAS_RELATED_ID);

    for (const card of detail.related) {
      const related = section(card.id);
      expect(related.sectionTypeId).toBe(selected.sectionTypeId);
      expect(related.industryId === selected.industryId || related.styleId === selected.styleId).toBe(true);
      // A related card is a full, openable card, not a bare id.
      expect(card.image.src).toContain("/mock-assets/");
      expect(card.title.length).toBeGreaterThan(0);
    }
  });

  it("related cards carry the related section's own desktop crop, not the current one's", () => {
    const detail = buildSectionDetail(HAS_RELATED_ID, "en")!;
    for (const card of detail.related) {
      const relatedSection = section(card.id);
      const crop = pickSectionCrop(card.id, "desktop")!;
      expect(crop.sectionId).toBe(card.id);
      expect(card.image.src).toBe(`/mock-assets/${crop.renderedAssetId}.svg`);
      expect(card.image.alt).toBe(
        `${MOCK_SOURCES.find((entry) => entry.id === relatedSection.sourceId)!.name}: ${relatedSection.title}`,
      );
    }
  });

  it("says so honestly when nothing in the library is similar", () => {
    // Flowbase's hero is the only saas hero and the only dark hero, so the
    // similar-sections rule matches nothing — the page must render an empty state.
    const detail = buildSectionDetail(BOTH_DEVICES_ID, "en")!;
    expect(detail.related).toEqual([]);
  });

  it("returns nothing for an unknown id", () => {
    expect(buildSectionDetail("section-does-not-exist", "en")).toBeUndefined();
    expect(buildSectionDetail("", "en")).toBeUndefined();
  });

  it("builds every section in the fixture", () => {
    for (const entry of MOCK_SECTIONS) {
      const detail = buildSectionDetail(entry.id, "en");
      expect(detail, entry.id).toBeDefined();
      expect(detail!.devices.length).toBeGreaterThan(0);
    }
  });
});

describe("emptySectionDetail", () => {
  it("keeps the record and its captures but empties every collection", () => {
    const detail = buildSectionDetail(BOTH_DEVICES_ID, "en")!;
    const emptied = emptySectionDetail(detail);

    expect(emptied.related).toEqual([]);
    expect(emptied.devices.every((view) => view.siblings.length === 0)).toBe(true);
    // The record itself is still there, with the same device captures.
    expect(emptied.id).toBe(detail.id);
    expect(emptied.title).toBe(detail.title);
    expect(emptied.devices.map((view) => view.device)).toEqual(detail.devices.map((view) => view.device));
    expect(emptied.devices[0].image).toEqual(detail.devices[0].image);
  });
});

describe("buildPageDetail", () => {
  it("offers each device the page's capture for that device, with that device's regions", () => {
    const detail = buildPageDetail("flowbase-home", "en")!;
    expect(detail.devices.map((view) => view.device)).toEqual(["desktop", "mobile"]);

    for (const view of detail.devices) {
      expect(view.image.src).toBe(`/mock-assets/page-flowbase-home-${view.device}.svg`);
      expect(view.sections).toHaveLength(3);
      for (const region of view.sections) {
        const crop = MOCK_SECTION_CROPS.find((entry) => entry.sectionId === region.id && entry.device === view.device)!;
        expect(region.crop).toEqual({
          cropX: crop.cropX, cropY: crop.cropY, cropWidth: crop.cropWidth, cropHeight: crop.cropHeight,
        });
        // Every region is a band of this page, never the full capture.
        const rect = cropRectToPercent(region.crop, view.image);
        expect(rect.height).toBeGreaterThan(0);
        expect(rect.height).toBeLessThan(100);
      }
    }
  });

  it("orders the page's sections by their order on the page", () => {
    const detail = buildPageDetail("flowbase-home", "en")!;
    const expected = MOCK_SECTIONS
      .filter((entry) => entry.pageId === "flowbase-home")
      .sort((left, right) => left.order - right.order)
      .map((entry) => entry.id);
    expect(detail.devices[0].sections.map((region) => region.id)).toEqual(expected);
    expect(detail.devices[1].sections.map((region) => region.id)).toEqual(expected);
  });

  it("shows only the devices the page was captured for", () => {
    expect(buildPageDetail("flowbase-pricing", "en")!.devices.map((view) => view.device)).toEqual(["desktop"]);
    expect(buildPageDetail("cloudloom-browser", "en")!.devices.map((view) => view.device)).toEqual(["mobile"]);
  });

  it("names its source with a slug that resolves back to it", () => {
    const detail = buildPageDetail("flowbase-home", "en")!;
    expect(detail.sourceName).toBe("Flowbase");
    expect(MOCK_SOURCES.find((entry) => sourceSlug(entry.id) === detail.sourceSlug)?.id).toBe("source-flowbase");
  });

  it("returns nothing for an unknown slug", () => {
    expect(buildPageDetail("flowbase", "en")).toBeUndefined();
    expect(buildPageDetail("flowbase-home-2", "en")).toBeUndefined();
  });

  it("builds every page in the fixture", () => {
    for (const page of MOCK_PAGES) {
      expect(buildPageDetail(page.id, "en"), page.id).toBeDefined();
    }
  });
});

describe("emptyPageDetail", () => {
  it("keeps the page capture but drops its section list", () => {
    const detail = buildPageDetail("flowbase-home", "en")!;
    const emptied = emptyPageDetail(detail);
    expect(emptied.devices.every((view) => view.sections.length === 0)).toBe(true);
    expect(emptied.devices[0].image).toEqual(detail.devices[0].image);
    expect(emptied.title).toBe(detail.title);
  });
});

describe("buildSourceDetail", () => {
  it("lists the source's pages and sections with usable slugs", () => {
    const detail = buildSourceDetail("flowbase", "en")!;
    expect(detail.name).toBe("Flowbase");
    expect(detail.slug).toBe("flowbase");
    expect(detail.pages.map((page) => page.slug).sort()).toEqual(["flowbase-home", "flowbase-pricing"]);
    expect(detail.sections).toHaveLength(6);
    for (const page of detail.pages) {
      expect(MOCK_PAGES.find((entry) => entry.id === page.slug)?.id).toBe(page.slug);
    }
    for (const card of detail.sections) {
      expect(section(card.id).sourceId).toBe("source-flowbase");
    }
  });

  it("reports counts that match what it lists", () => {
    const detail = buildSourceDetail("flowbase", "en")!;
    // The label names the noun, so the value carries no unit and can never read
    // "1 pages".
    expect(detail.facts.find((fact) => fact.label === "Pages")?.value).toBe(String(detail.pages.length));
    expect(detail.facts.find((fact) => fact.label === "Sections")?.value).toBe(String(detail.sections.length));
  });

  it("marks a source Arabic when any of its pages is", () => {
    expect(buildSourceDetail("rakaiz", "en")!.isArabic).toBe(true);
    expect(buildSourceDetail("flowbase", "en")!.isArabic).toBe(false);
  });

  it("returns nothing for an unknown slug", () => {
    expect(buildSourceDetail("flowbase-home", "en")).toBeUndefined();
    expect(buildSourceDetail("", "en")).toBeUndefined();
  });

  it("builds every source in the fixture from its own slug", () => {
    for (const source of MOCK_SOURCES) {
      const detail = buildSourceDetail(sourceSlug(source.id), "en");
      expect(detail, source.id).toBeDefined();
      expect(detail!.pages.length).toBeGreaterThan(0);
    }
  });
});

describe("emptySourceDetail", () => {
  it("keeps the source's header but drops its pages and sections", () => {
    const detail = buildSourceDetail("flowbase", "en")!;
    const emptied = emptySourceDetail(detail);
    expect(emptied.pages).toEqual([]);
    expect(emptied.sections).toEqual([]);
    expect(emptied.name).toBe(detail.name);
    expect(emptied.facts).toEqual(detail.facts);
  });
});

describe("index builders", () => {
  it("lists every source and page, each with a detail route to reach", () => {
    const sources = buildSourcesIndex("en");
    const pages = buildPagesIndex("en");
    expect(sources.sources).toHaveLength(MOCK_SOURCES.length);
    expect(pages.pages).toHaveLength(MOCK_PAGES.length);
    for (const card of sources.sources) {
      expect(buildSourceDetail(sourceSlug(card.id), "en"), card.id).toBeDefined();
    }
    for (const card of pages.pages) {
      expect(buildPageDetail(card.id, "en"), card.id).toBeDefined();
    }
  });

  it("counts every section exactly once across the section-type categories", () => {
    const data = buildCategoriesIndex("en");
    const sectionTypes = data.groups.find((group) => group.id === "sectionTypes")!;
    const total = sectionTypes.entries.reduce((sum, entry) => sum + entry.count, 0);
    expect(total).toBe(MOCK_SECTIONS.length);
  });

  it("counts a category with the number of sections that match it", () => {
    const data = buildCategoriesIndex("en");
    const industries = data.groups.find((group) => group.id === "industries")!;
    const saas = industries.entries.find((entry) => entry.id === "saas")!;
    expect(saas.count).toBe(MOCK_SECTIONS.filter((entry) => entry.industryId === "saas").length);

    const sectionTypes = data.groups.find((group) => group.id === "sectionTypes")!;
    const hero = sectionTypes.entries.find((entry) => entry.id === "hero")!;
    expect(hero.count).toBe(MOCK_SECTIONS.filter((entry) => entry.sectionTypeId === "hero").length);
  });

  it("links each entry into Explore with that one filter, and every group covers the whole taxonomy", () => {
    const data = buildCategoriesIndex("en");
    const industries = data.groups.find((group) => group.id === "industries")!;
    expect(industries.entries).toHaveLength(12);
    expect(data.groups.find((group) => group.id === "sectionTypes")!.entries).toHaveLength(21);
    expect(data.groups.find((group) => group.id === "styles")!.entries).toHaveLength(11);

    expect(industries.entries.find((entry) => entry.id === "saas")!.href).toBe("/en/explore?industry=saas");
    expect(data.groups.find((group) => group.id === "sectionTypes")!.entries.find((entry) => entry.id === "hero")!.href)
      .toBe("/en/explore?sectionType=hero");
    expect(data.groups.find((group) => group.id === "styles")!.entries.find((entry) => entry.id === "dark")!.href)
      .toBe("/en/explore?style=dark");
  });

  it("empties to no entries at all", () => {
    expect(emptySourcesIndex().sources).toEqual([]);
    expect(emptyPagesIndex().pages).toEqual([]);
    expect(emptyCategoriesIndex().groups).toEqual([]);
  });
});

describe("formatDate", () => {
  it("renders an ISO instant in UTC, whatever the machine's zone is", () => {
    expect(formatDate("2024-01-08T00:00:00Z", "en")).toBe("January 8, 2024");
    expect(formatDate("2024-04-03T00:00:00Z", "en")).toBe("April 3, 2024");
  });

  it("does not shift a timestamp across a day boundary", () => {
    // 23:30 UTC would be the next day in a positive-offset zone; UTC keeps it.
    expect(formatDate("2024-03-21T23:30:00Z", "en")).toBe("March 21, 2024");
  });

  it("returns an unparseable value unchanged rather than inventing a date", () => {
    expect(formatDate("not-a-date", "en")).toBe("not-a-date");
    expect(formatDate("", "en")).toBe("");
  });
});

describe("the fixture the detail routes render", () => {
  it("has a rendered asset on disk for every crop it exposes", () => {
    for (const entry of MOCK_SECTIONS) {
      for (const view of buildSectionDetail(entry.id, "en")!.devices) {
        expect(MOCK_ASSETS.find((asset) => asset.url === view.image.src), view.image.src).toBeDefined();
        expect(MOCK_ASSETS.find((asset) => asset.url === view.pageImage.src), view.pageImage.src).toBeDefined();
      }
    }
  });
});
