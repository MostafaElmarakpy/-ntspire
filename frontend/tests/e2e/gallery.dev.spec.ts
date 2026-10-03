import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type CleanPage } from "./fixtures";
import { expectAccessible } from "./axe-helper";

const screenshotsDirectory = path.resolve(process.cwd(), "../docs/phase-reports/screenshots");

/**
 * The fixtures module imports the manifest as JSON, which Playwright's ESM loader
 * rejects without an import attribute, so the spec reads the manifest directly.
 */
interface MockManifest {
  sources: unknown[];
  pages: { id: string; sections: unknown[] }[];
}

const manifest = JSON.parse(
  readFileSync(path.resolve(process.cwd(), "src/mocks/mock-manifest.json"), "utf8"),
) as MockManifest;

/** Section ids follow the fixture rule `section-<pageId>-<order>`, in manifest order. */
const SECTION_IDS = manifest.pages.flatMap((page) => page.sections.map((_, index) => `section-${page.id}-${index + 1}`));

/** The masonry breakpoints the grid is expected to use, largest first. */
const BREAKPOINTS: readonly (readonly [number, number])[] = [
  [1440, 4],
  [1024, 3],
  [768, 2],
  [390, 1],
];

const expectedColumns = (width: number) => BREAKPOINTS.find(([minWidth]) => width >= minWidth)?.[1] ?? 1;

const sectionsRegion = (page: CleanPage) => page.getByRole("region", { name: "Section references" });
/** The masonry columns are the region's own children; the cards sit inside them. */
const sectionColumns = (page: CleanPage) => sectionsRegion(page).locator(":scope > div");
const sectionCards = (page: CleanPage) => sectionsRegion(page).locator("article");

/**
 * Hydration paints the single-column server snapshot first and then swaps in the
 * measured column count, which moves every card. Geometry and interaction
 * assertions start here so they never race that swap.
 */
async function openGallery(page: CleanPage, width?: number): Promise<void> {
  if (width !== undefined) await page.setViewportSize({ width, height: 900 });
  await page.goto("/en/dev/gallery");
  const viewport = page.viewportSize() ?? { width: 1440, height: 900 };
  await expect(sectionColumns(page)).toHaveCount(expectedColumns(width ?? viewport.width));
  await expect(sectionCards(page).first()).toBeVisible();
}

/** Reads the rendered and natural ratio of the first two cards of every column, i.e. the eager top rows. */
const measureTopImages = (page: CleanPage) => sectionColumns(page).evaluateAll((columns) => columns.flatMap((column) => (
  Array.from(column.querySelectorAll("article")).slice(0, 2).map((card) => {
    const image = card.querySelector("img") as HTMLImageElement;
    const bounds = image.getBoundingClientRect();
    return {
      loaded: image.complete && image.naturalWidth > 0,
      rendered: bounds.height > 0 ? bounds.width / bounds.height : 0,
      natural: image.naturalWidth / image.naturalHeight,
      objectFit: getComputedStyle(image).objectFit,
    };
  })
)));

test("dev gallery renders the full mock dataset in a waterfall grid", async ({ cleanPage }) => {
  await cleanPage.goto("/en/dev/gallery");

  await expect(cleanPage.getByRole("heading", { name: "Gallery", level: 1 })).toBeVisible();
  await expect(cleanPage.getByRole("heading", { name: "Sections", level: 2 })).toBeVisible();
  await expect(cleanPage.getByRole("heading", { name: "Pages", level: 2 })).toBeVisible();
  await expect(cleanPage.getByRole("heading", { name: "Sources", level: 2 })).toBeVisible();

  await expect(sectionCards(cleanPage)).toHaveCount(SECTION_IDS.length);
  await expect(cleanPage.getByRole("region", { name: "Page references" }).locator("article")).toHaveCount(manifest.pages.length);
  await expect(cleanPage.getByRole("region", { name: "Source references" }).locator("article")).toHaveCount(manifest.sources.length);
});

test("the highest-ranked references fill the top row in ranking order", async ({ cleanPage }) => {
  await openGallery(cleanPage, 1440);

  const expected = SECTION_IDS.slice(0, 4).map((id) => `card-${id}`);
  expect(await sectionColumns(cleanPage).evaluateAll((columns) => columns.map((column) => column.querySelector("article")?.id ?? null))).toEqual(expected);

  // The whole first row stays above everything that is ranked below it.
  const topRow = await sectionColumns(cleanPage).evaluateAll((columns) => columns.map((column) => {
    const card = column.querySelector("article");
    return card ? card.getBoundingClientRect().top : Number.NaN;
  }));
  expect(Math.max(...topRow) - Math.min(...topRow)).toBeLessThanOrEqual(1);
});

test("gallery column counts follow the viewport breakpoints", async ({ cleanPage }) => {
  await openGallery(cleanPage);

  for (const [width, expected] of BREAKPOINTS) {
    await cleanPage.setViewportSize({ width, height: 900 });
    await expect(sectionColumns(cleanPage), `columns at ${width}px`).toHaveCount(expected);
  }

  await cleanPage.setViewportSize({ width: 375, height: 812 });
  expect(await cleanPage.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test("cards keep their natural aspect ratio, so the columns have uneven heights", async ({ cleanPage }) => {
  await openGallery(cleanPage);

  const heights = await sectionCards(cleanPage).evaluateAll((cards) => cards.slice(0, 12).map((card) => Math.round(card.getBoundingClientRect().height)));
  expect(heights.length).toBeGreaterThan(3);
  expect(new Set(heights).size).toBeGreaterThan(3);

  await expect.poll(async () => (await measureTopImages(cleanPage)).every((image) => image.loaded)).toBe(true);

  for (const image of await measureTopImages(cleanPage)) {
    expect(image.natural).toBeGreaterThan(0);
    expect(image.rendered / image.natural).toBeGreaterThan(0.97);
    expect(image.rendered / image.natural).toBeLessThan(1.03);
    expect(image.objectFit).toBe("fill");
  }
});

test("hover actions are reachable and never change the card height", async ({ cleanPage }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "hover requires a pointer device");
  await openGallery(cleanPage);

  const card = sectionCards(cleanPage).first();
  await expect(card).toBeVisible();
  const before = (await card.boundingBox())!;
  const actions = card.getByRole("group", { name: "Reference actions" });

  await expect(actions).toHaveCSS("opacity", "0");
  await card.hover();
  await expect(actions).toHaveCSS("opacity", "1");
  await expect(card.getByRole("link", { name: /^Open reference:/ })).toBeVisible();

  const after = (await card.boundingBox())!;
  expect(Math.abs(after.height - before.height)).toBeLessThanOrEqual(1);
  expect(Math.abs(after.width - before.width)).toBeLessThanOrEqual(1);
});

test("actions are reachable by keyboard and stay visible on touch devices", async ({ cleanPage }, testInfo) => {
  await openGallery(cleanPage);
  const card = sectionCards(cleanPage).first();
  const actions = card.getByRole("group", { name: "Reference actions" });
  const save = card.getByRole("button", { name: "Save reference" });

  await save.focus();
  await expect(save).toBeFocused();
  await expect(actions).toHaveCSS("opacity", "1");

  if (testInfo.project.name === "mobile") {
    // A touch device has no hover, so the actions must already be interactive.
    await expect(actions).toHaveCSS("opacity", "1");
    await save.click();
    await expect(card.getByRole("button", { name: "Remove reference from saved" })).toHaveAttribute("aria-pressed", "true");
  }
});

test("saving a reference survives a reload", async ({ cleanPage }, testInfo) => {
  await openGallery(cleanPage);
  const card = sectionCards(cleanPage).first();
  if (testInfo.project.name === "desktop") await card.hover();

  const save = card.getByRole("button", { name: "Save reference" });
  await expect(save).toHaveAttribute("aria-pressed", "false");
  await save.click();
  await expect(card.getByRole("button", { name: "Remove reference from saved" })).toHaveAttribute("aria-pressed", "true");

  await cleanPage.reload();
  const reloadedCard = sectionCards(cleanPage).first();
  await expect(reloadedCard.getByRole("button", { name: "Remove reference from saved" })).toHaveAttribute("aria-pressed", "true");
});

test("gallery loading, empty, and error states follow the mock query modes", async ({ cleanPage }) => {
  const navigation = cleanPage.goto("/en/dev/gallery?__mock=slow", { waitUntil: "commit" });
  await expect(cleanPage.getByRole("status").first()).toBeVisible();
  await navigation;
  await expect(cleanPage.getByRole("heading", { name: "Gallery", level: 1 })).toBeVisible();

  await cleanPage.goto("/en/dev/gallery?__mock=empty");
  await expect(cleanPage.getByRole("heading", { name: "No references to show" })).toBeVisible();

  await cleanPage.goto("/en/dev/gallery?__mock=error");
  await expect(cleanPage.getByRole("heading", { name: "The gallery could not load" })).toBeVisible();
  await expect(cleanPage.getByRole("button", { name: "Try again" })).toBeVisible();
});

test("gallery is accessible at every breakpoint and captured for the phase report", async ({ cleanPage }, testInfo) => {
  await openGallery(cleanPage);

  const violations = await expectAccessible(cleanPage);
  expect(violations, JSON.stringify(violations.map(({ id, help }) => ({ id, help })))).toEqual([]);

  mkdirSync(screenshotsDirectory, { recursive: true });
  const widths = testInfo.project.name === "mobile" ? [390] : BREAKPOINTS.map(([width]) => width);
  for (const width of widths) {
    await cleanPage.setViewportSize({ width, height: 900 });
    await expect(sectionColumns(cleanPage)).toHaveCount(expectedColumns(width));
    await cleanPage.evaluate(() => window.scrollTo(0, 0));
    await cleanPage.screenshot({ path: path.join(screenshotsDirectory, `04-gallery-${width}.png`) });
  }
});
