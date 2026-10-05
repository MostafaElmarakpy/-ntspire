import { expect, test, type CleanPage } from "./fixtures";
import { expectAccessible } from "./axe-helper";
import type { Locator } from "@playwright/test";

/**
 * The Phase 07 detail flow, end to end against a production build.
 *
 * Both projects run everything here (desktop 1440×900 and mobile 390×844), so
 * the few assertions that depend on the responsive shell — the header nav and
 * the Explore filter sheet — are branched on the project name and say why.
 *
 * The fixtures these specs lean on:
 *   flowbase-home   3 sections, captured for desktop and mobile
 *   flowbase-pricing  desktop only
 *   cloudloom-browser mobile only
 *   nimbus-pay-home-2 is the one hero whose related set is exactly one section
 */

const SECTION_ID = "section-flowbase-home-3";
const SECTION_PATH = `/en/sections/${SECTION_ID}`;
const PAGE_PATH = "/en/pages/flowbase-home";
const SOURCE_PATH = "/en/sources/flowbase";

/** The section preview: the only `figure` on a section detail page. */
function preview(cleanPage: CleanPage): Locator {
  return cleanPage.locator("figure img").first();
}

function deviceSwitcher(cleanPage: CleanPage): Locator {
  return cleanPage.getByRole("radiogroup", { name: "Preview device" });
}

function contextHighlight(cleanPage: CleanPage): Locator {
  return cleanPage.getByTestId("context-highlight");
}

/** One `<dd>` out of a fact list, matched through its own `<dt>` label. */
function factValue(cleanPage: CleanPage, label: string): Locator {
  return cleanPage
    .locator("dl > div")
    .filter({ has: cleanPage.locator("dt", { hasText: new RegExp(`^${label}$`) }) })
    .locator("dd");
}

/**
 * Runs axe with CSS animations frozen.
 *
 * The dialogs fade in over 200ms, and a scan taken mid-fade blends the text and
 * its background through the partial opacity — reporting a contrast failure that
 * does not exist once the dialog settles. The persistent state is what has to
 * meet contrast, so the transient one is switched off rather than waited out.
 */
async function scanAccessibility(cleanPage: CleanPage, label: string): Promise<void> {
  await cleanPage.addStyleTag({
    content: "*, *::before, *::after { animation: none !important; transition: none !important; }",
  });
  const violations = await expectAccessible(cleanPage);
  expect(violations, `${label}: ${JSON.stringify(violations.map(({ id, help }) => ({ id, help })))}`).toEqual([]);
}

test("the index routes list what the library holds and link into it", async ({ cleanPage }) => {
  await cleanPage.goto("/en/sources");
  await expect(cleanPage.getByRole("heading", { level: 1, name: "Sources" })).toBeVisible();
  await expect(cleanPage.getByRole("link", { name: /^Open reference: / })).toHaveCount(10);
  await expect(cleanPage.getByRole("link", { name: "Open reference: Flowbase", exact: true })).toHaveAttribute(
    "href",
    SOURCE_PATH,
  );

  await cleanPage.goto("/en/pages");
  await expect(cleanPage.getByRole("heading", { level: 1, name: "Pages" })).toBeVisible();
  await expect(cleanPage.getByRole("link", { name: /^Open reference: / })).toHaveCount(14);
  await expect(
    cleanPage.getByRole("link", { name: "Open reference: Flowbase product homepage", exact: true }),
  ).toHaveAttribute("href", PAGE_PATH);

  await cleanPage.goto("/en/categories");
  await expect(cleanPage.getByRole("heading", { level: 1, name: "Categories" })).toBeVisible();
  for (const group of ["Industries", "Section type", "Style"]) {
    await expect(cleanPage.getByRole("region", { name: group })).toBeVisible();
  }
  // A category entry hands Explore exactly the filter it counts, spelled the
  // way Explore's own parser reads it.
  await expect(cleanPage.locator('a[href="/en/explore?industry=saas"]')).toBeVisible();
  await expect(cleanPage.locator('a[href="/en/explore?sectionType=hero"]')).toBeVisible();
});

test("an unknown section id, page slug or source slug is a real 404", async ({ cleanPage }) => {
  for (const path of ["/en/sections/not-a-section", "/en/pages/not-a-page", "/en/sources/not-a-source"]) {
    cleanPage.expectResponse({ path, status: 404 });
    const response = await cleanPage.goto(path);
    // The status matters as much as the page: a missing reference must not be
    // served as a 200 with a friendly message.
    expect(response?.status()).toBe(404);
    await expect(cleanPage.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
    await expect(cleanPage.locator("#main-content").getByRole("link", { name: "Explore" })).toBeVisible();
  }
});

test("a section detail shows its provenance, metadata and every action", async ({ cleanPage }) => {
  await cleanPage.goto(SECTION_PATH);

  await expect(cleanPage.getByRole("heading", { level: 1, name: "Everything in one connected workspace" })).toBeVisible();
  await expect(cleanPage.locator("main").getByText("Features", { exact: true })).toBeVisible();

  const crumbs = cleanPage.getByRole("navigation", { name: "Breadcrumb" });
  await expect(crumbs.getByRole("link", { name: "Sources", exact: true })).toHaveAttribute("href", "/en/sources");
  await expect(crumbs.getByRole("link", { name: "Flowbase", exact: true })).toHaveAttribute("href", SOURCE_PATH);
  await expect(crumbs.getByRole("link", { name: "Flowbase product homepage", exact: true })).toHaveAttribute(
    "href",
    PAGE_PATH,
  );
  await expect(crumbs.locator('[aria-current="page"]')).toHaveText("Everything in one connected workspace");

  await expect(factValue(cleanPage, "Source")).toHaveText("Flowbase");
  await expect(factValue(cleanPage, "Language")).toHaveText("English");
  await expect(factValue(cleanPage, "Direction")).toHaveText("Left to right");
  await expect(factValue(cleanPage, "Devices")).toHaveText("Desktop and mobile");
  await expect(factValue(cleanPage, "Industry")).toHaveText("SaaS");
  await expect(factValue(cleanPage, "Style")).toHaveText("Modern");
  await expect(factValue(cleanPage, "Captured")).toHaveText("January 8, 2024");
  await expect(factValue(cleanPage, "Attribution")).toHaveText("Flowbase");

  await expect(cleanPage.getByRole("complementary").getByRole("list", { name: "Reference tags" })).toBeVisible();

  const actions = cleanPage.getByRole("group", { name: "Reference actions" });
  for (const label of ["Save reference", "Save as image", "Send to Figma", "View in context"]) {
    await expect(actions.getByRole("button", { name: label })).toBeVisible();
  }

  // This section is the only one of its type and industry, so the honest
  // related state is the empty one.
  await expect(cleanPage.getByRole("heading", { name: "No similar sections yet" })).toBeVisible();

  await expect(cleanPage.getByRole("link", { name: "View source" })).toHaveAttribute("href", SOURCE_PATH);
  await expect(cleanPage.getByRole("link", { name: "View page" })).toHaveAttribute("href", PAGE_PATH);
});

test("related sections link to their own detail pages", async ({ cleanPage }) => {
  await cleanPage.goto("/en/sections/section-nimbus-pay-home-2");

  const related = cleanPage.getByRole("region", { name: "Similar sections" });
  await expect(related.getByRole("heading", { name: "Similar sections" })).toBeVisible();

  // Exactly one related section in the fixture. Its Open action is revealed on
  // hover, so the pointer has to be over the card before the action is clickable.
  const card = related.locator("article").first();
  await card.hover();
  const open = card.getByRole("link", { name: /^Open reference: / });
  await expect(open).toBeVisible();
  await open.click();
  await expect(cleanPage).toHaveURL("/en/sections/section-rafif-store-1");
  await expect(cleanPage.getByRole("heading", { level: 1, name: "أنشئ متجرك في دقائق" })).toBeVisible();
});

test("the device switcher shows each device's own capture and disables the one never taken", async ({ cleanPage }) => {
  await cleanPage.goto(SECTION_PATH);

  const switcher = deviceSwitcher(cleanPage);
  const desktop = switcher.getByRole("radio", { name: "Desktop", exact: true });
  const mobile = switcher.getByRole("radio", { name: "Mobile", exact: true });

  await expect(desktop).toBeChecked();
  await expect(preview(cleanPage)).toHaveAttribute("src", /crop-section-flowbase-home-3-desktop\.svg/);

  await mobile.click();
  await expect(mobile).toBeChecked();
  // The mobile view is the mobile crop, never the desktop one rescaled.
  await expect(preview(cleanPage)).toHaveAttribute("src", /crop-section-flowbase-home-3-mobile\.svg/);
  await expect(cleanPage).toHaveURL(`${SECTION_PATH}?device=mobile`);

  // The choice is request-scoped, so a cold visit to that URL opens on mobile.
  await cleanPage.goto(`${SECTION_PATH}?device=mobile`);
  await expect(preview(cleanPage)).toHaveAttribute("src", /crop-section-flowbase-home-3-mobile\.svg/);

  // Desktop-only: the mobile variant is offered as unavailable, not as a
  // control that silently keeps showing desktop coordinates.
  await cleanPage.goto("/en/sections/section-flowbase-pricing-1");
  await expect(deviceSwitcher(cleanPage).getByRole("radio", { name: /^Desktop/ })).toBeChecked();
  await expect(deviceSwitcher(cleanPage).getByRole("radio", { name: /^Mobile/ })).toBeDisabled();
  await expect(preview(cleanPage)).toHaveAttribute("src", /crop-section-flowbase-pricing-1-desktop\.svg/);
  expect(new URL(cleanPage.url()).searchParams.has("device")).toBe(false);

  // Mobile-only is the mirror image.
  await cleanPage.goto("/en/sections/section-cloudloom-browser-1");
  await expect(deviceSwitcher(cleanPage).getByRole("radio", { name: /^Mobile/ })).toBeChecked();
  await expect(deviceSwitcher(cleanPage).getByRole("radio", { name: /^Desktop/ })).toBeDisabled();
  await expect(preview(cleanPage)).toHaveAttribute("src", /crop-section-cloudloom-browser-1-mobile\.svg/);
});

test("a page detail highlights each section's region for the device being shown", async ({ cleanPage }) => {
  await cleanPage.goto(PAGE_PATH);

  await expect(cleanPage.getByRole("heading", { level: 1, name: "Flowbase product homepage" })).toBeVisible();
  await expect(cleanPage.getByTestId("page-region")).toHaveCount(3);

  // The bands are placed in catalogue order, top to bottom.
  const tops = await cleanPage.getByTestId("page-region").evaluateAll((regions) =>
    regions.map((region) => Number.parseFloat((region as HTMLElement).style.top)),
  );
  expect(tops).toEqual([...tops].sort((a, b) => a - b));
  for (const region of await cleanPage.getByTestId("page-region").all()) {
    const box = await region.evaluate((element) => {
      const style = (element as HTMLElement).style;
      return {
        top: Number.parseFloat(style.top),
        height: Number.parseFloat(style.height),
        left: Number.parseFloat(style.left),
        width: Number.parseFloat(style.width),
      };
    });
    expect(box.top).toBeGreaterThanOrEqual(0);
    expect(box.left).toBeGreaterThanOrEqual(0);
    expect(box.top + box.height).toBeLessThanOrEqual(100);
    expect(box.left + box.width).toBeLessThanOrEqual(100);
  }

  const desktopCapture = cleanPage.getByTestId("page-region").first();
  const desktopBox = await desktopCapture.boundingBox();

  await cleanPage.getByRole("radio", { name: "Mobile", exact: true }).click();
  await expect(cleanPage.getByRole("radio", { name: "Mobile", exact: true })).toBeChecked();
  await expect(cleanPage).toHaveURL(`${PAGE_PATH}?device=mobile`);
  // The mobile page capture is its own asset, and each region is re-measured
  // against it: the bands are never carried over from the desktop screenshot.
  await expect(cleanPage.locator('img[src*="page-flowbase-home-mobile.svg"]')).toBeVisible();
  await expect(cleanPage.locator('img[src*="page-flowbase-home-desktop.svg"]')).toHaveCount(0);
  await expect(cleanPage.getByTestId("page-region").first()).toBeVisible();
  const mobileBox = await cleanPage.getByTestId("page-region").first().boundingBox();
  expect(mobileBox?.y).not.toBe(desktopBox?.y);

  // Every catalogued section is one click away, and the source is one up.
  await expect(cleanPage.getByRole("link", { name: /Product navigation/ })).toHaveAttribute(
    "href",
    "/en/sections/section-flowbase-home-1",
  );
  await expect(cleanPage.getByRole("link", { name: "View source" })).toHaveAttribute("href", SOURCE_PATH);
  await expect(factValue(cleanPage, "Path")).toHaveText("/");
});

test("a source detail lists its pages and sections with their attribution", async ({ cleanPage }) => {
  await cleanPage.goto(SOURCE_PATH);

  await expect(cleanPage.getByRole("heading", { level: 1, name: "Flowbase" })).toBeVisible();
  await expect(cleanPage.getByText("A focused workspace for product teams.")).toBeVisible();

  // The label names the noun, so the counts carry no unit.
  await expect(factValue(cleanPage, "Pages")).toHaveText("2");
  await expect(factValue(cleanPage, "Sections")).toHaveText("6");
  await expect(factValue(cleanPage, "Industry")).toHaveText("SaaS");
  await expect(factValue(cleanPage, "Attribution")).toHaveText("Flowbase");

  const pages = cleanPage.getByRole("region", { name: "Pages" });
  await expect(pages.getByRole("link", { name: /Flowbase product homepage/ })).toHaveAttribute("href", PAGE_PATH);
  await expect(pages.getByRole("link", { name: /Flowbase pricing/ })).toHaveAttribute(
    "href",
    "/en/pages/flowbase-pricing",
  );

  const sections = cleanPage.getByRole("region", { name: "Sections" });
  await expect(sections.getByRole("link", { name: /^Open reference: / })).toHaveCount(6);

  await scanAccessibility(cleanPage, SOURCE_PATH);
});

test("card to detail to context to download and back keeps the reader's place", async ({ cleanPage }) => {
  // 1. A card created in Phase 04 opens its section.
  await cleanPage.goto(PAGE_PATH);
  await cleanPage.getByRole("link", { name: /Everything in one connected workspace/ }).click();
  await expect(cleanPage).toHaveURL(SECTION_PATH);
  await expect(cleanPage.getByRole("heading", { level: 1, name: "Everything in one connected workspace" })).toBeVisible();

  // 2. Switch device. The switch replaces rather than pushes, so Back still
  //    points at the page detail the reader came from.
  await cleanPage.getByRole("radio", { name: "Mobile", exact: true }).click();
  await expect(cleanPage).toHaveURL(`${SECTION_PATH}?device=mobile`);

  // 3. View in context: the mobile crop on the mobile page capture.
  await cleanPage.getByRole("button", { name: "View in context" }).click();
  const dialog = cleanPage.getByTestId("context-dialog");
  await expect(dialog).toBeVisible();
  await expect(contextHighlight(cleanPage)).toHaveAttribute("data-device", "mobile");
  await expect(dialog.locator('img[src*="page-flowbase-home-mobile.svg"]')).toBeVisible();

  const scroller = cleanPage.getByTestId("context-scroll");
  // The band is scrolled into view rather than left below the fold, and the
  // frame takes focus so the region is keyboard scrollable.
  await expect(contextHighlight(cleanPage)).toBeInViewport({ ratio: 0.1 });
  await expect(scroller).toBeFocused();
  const { scrollTop, scrollHeight, clientHeight } = await scroller.evaluate((element) => ({
    scrollTop: element.scrollTop,
    scrollHeight: element.scrollHeight,
    clientHeight: element.clientHeight,
  }));
  // When the capture is taller than the frame, reaching the band required a scroll.
  if (scrollHeight > clientHeight) expect(scrollTop).toBeGreaterThan(0);

  // 4. Another section on the page is reachable from inside the context view.
  await expect(dialog.getByRole("link", { name: "Product navigation" })).toHaveAttribute(
    "href",
    "/en/sections/section-flowbase-home-1",
  );
  await cleanPage.getByTestId("context-close").click();
  await expect(dialog).toBeHidden();

  // 5. Save as image downloads the mobile asset under its device-qualified name.
  const download = cleanPage.waitForEvent("download");
  await cleanPage.getByTestId("download-action").click();
  expect((await download).suggestedFilename()).toBe("ntspire-flowbase-features-mobile.svg");

  await scanAccessibility(cleanPage, `${SECTION_PATH} (after a download)`);

  // 6. Back returns to the originating page, not to the device switch.
  await cleanPage.goBack();
  await expect(cleanPage).toHaveURL(PAGE_PATH);
  await expect(cleanPage.getByRole("heading", { level: 1, name: "Flowbase product homepage" })).toBeVisible();
});

test("the desktop crop downloads under its own name", async ({ cleanPage }) => {
  await cleanPage.goto(SECTION_PATH);

  const download = cleanPage.waitForEvent("download");
  await cleanPage.getByTestId("download-action").click();
  // Same section, different device, different file: the two can never collide.
  expect((await download).suggestedFilename()).toBe("ntspire-flowbase-features-desktop.svg");
});

test("Send to Figma says the integration is not connected and sends nothing", async ({ cleanPage }) => {
  const external: string[] = [];
  cleanPage.on("request", (request) => {
    if (/figma/i.test(request.url())) external.push(request.url());
  });

  await cleanPage.goto(SECTION_PATH);
  await cleanPage.getByTestId("figma-action").click();

  const dialog = cleanPage.getByTestId("figma-dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Figma export is not connected yet" })).toBeVisible();
  await expect(dialog).toContainText("ntspire has no Figma integration yet, so nothing was sent.");
  // Nothing claims success, and there is somewhere to go: closing it.
  await expect(dialog.getByRole("link")).toHaveCount(0);
  expect(await dialog.locator('a[href*="figma.com"]').count()).toBe(0);

  await cleanPage.getByTestId("figma-dialog").getByRole("button", { name: "Close" }).last().click();
  await expect(dialog).toBeHidden();
  expect(external).toEqual([]);
});

test("every level of the flow links both up and down", async ({ cleanPage }, testInfo) => {
  // Detail to detail.
  await cleanPage.goto(SECTION_PATH);
  await cleanPage.getByRole("link", { name: "View source" }).click();
  await expect(cleanPage).toHaveURL(SOURCE_PATH);
  await cleanPage.getByRole("link", { name: /Flowbase product homepage/ }).click();
  await expect(cleanPage).toHaveURL(PAGE_PATH);
  await cleanPage.getByRole("link", { name: /Everything in one connected workspace/ }).click();
  await expect(cleanPage).toHaveURL(SECTION_PATH);

  // Breadcrumb back up, one level at a time.
  const crumbs = cleanPage.getByRole("navigation", { name: "Breadcrumb" });
  await crumbs.getByRole("link", { name: "Flowbase product homepage", exact: true }).click();
  await expect(cleanPage).toHaveURL(PAGE_PATH);
  await crumbs.getByRole("link", { name: "Flowbase", exact: true }).click();
  await expect(cleanPage).toHaveURL(SOURCE_PATH);
  await crumbs.getByRole("link", { name: "Sources", exact: true }).click();
  await expect(cleanPage).toHaveURL("/en/sources");

  // The shell reaches every index, and none of them is a dead end.
  await cleanPage.goto("/en");
  const links = [
    { label: "Explore", href: "/en/explore" },
    { label: "Websites", href: "/en/sources" },
    { label: "Pages", href: "/en/pages" },
    { label: "Categories", href: "/en/categories" },
  ];
  // The header nav is desktop-only; below `lg` the same entries live in the menu.
  const nav = testInfo.project.name === "mobile"
    ? await (async () => {
        await cleanPage.getByRole("button", { name: "Open navigation menu" }).click();
        return cleanPage.getByRole("dialog").getByRole("navigation", { name: "Primary navigation" });
      })()
    : cleanPage.getByRole("navigation", { name: "Primary navigation" });
  for (const entry of links) {
    await expect(nav.getByRole("link", { name: entry.label, exact: true })).toHaveAttribute("href", entry.href);
  }

  // The Explore sidebar's Discover entry points at the source index, not at a
  // route that does not exist.
  await cleanPage.goto("/en/explore");
  if (testInfo.project.name === "mobile") {
    await cleanPage.getByRole("button", { name: "Filters", exact: true }).click();
  }
  const sidebar = testInfo.project.name === "mobile"
    ? cleanPage.getByRole("dialog")
    : cleanPage.getByRole("complementary", { name: "Browse and filter references" });
  const website = sidebar.getByRole("link", { name: "Website" });
  await expect(website).toHaveAttribute("href", "/en/sources");
  await website.click();
  await expect(cleanPage).toHaveURL("/en/sources");
  await expect(cleanPage.getByRole("heading", { level: 1, name: "Sources" })).toBeVisible();
});

test("the detail routes report loading, empty and error states from their mock modes", async ({ cleanPage }) => {
  // Loading: the in-page fallback is announced while the record resolves.
  const navigation = cleanPage.goto(`${SECTION_PATH}?__mock=slow`, { waitUntil: "commit" });
  await expect(cleanPage.getByRole("status").first()).toBeVisible();
  await navigation;
  await expect(cleanPage.getByRole("heading", { level: 1, name: "Everything in one connected workspace" })).toBeVisible();

  // Empty: the record is still a record, so each route renders its own empty
  // collections instead of pretending the reference does not exist.
  await cleanPage.goto(`${SECTION_PATH}?__mock=empty`);
  await expect(cleanPage.getByRole("heading", { level: 1, name: "Everything in one connected workspace" })).toBeVisible();
  await expect(cleanPage.getByRole("heading", { name: "No similar sections yet" })).toBeVisible();

  await cleanPage.goto(`${PAGE_PATH}?__mock=empty`);
  await expect(cleanPage.getByRole("heading", { name: "No sections catalogued" })).toBeVisible();
  await expect(cleanPage.getByTestId("page-region")).toHaveCount(0);

  await cleanPage.goto(`${SOURCE_PATH}?__mock=empty`);
  await expect(cleanPage.getByRole("heading", { name: "No pages catalogued" })).toBeVisible();
  await expect(cleanPage.getByRole("heading", { name: "No sections catalogued" })).toBeVisible();

  await cleanPage.goto("/en/sources?__mock=empty");
  await expect(cleanPage.getByRole("heading", { name: "No sources to show" })).toBeVisible();
  await cleanPage.goto("/en/pages?__mock=empty");
  await expect(cleanPage.getByRole("heading", { name: "No pages to show" })).toBeVisible();
  await cleanPage.goto("/en/categories?__mock=empty");
  await expect(cleanPage.getByRole("heading", { name: "No categories to show" })).toBeVisible();

  // Error: a failed service call is not a missing reference, so the route keeps
  // its URL and offers a retry that really retries. The error state is matched by
  // its copy, because Next's route announcer is also a live alert region.
  const errorState = cleanPage.getByRole("alert").filter({ hasText: "This view could not load" });
  await cleanPage.goto(`${SECTION_PATH}?__mock=error`);
  await expect(errorState).toBeVisible();
  await cleanPage.getByRole("button", { name: "Try again" }).click();
  await expect(cleanPage).toHaveURL(SECTION_PATH);
  await expect(cleanPage.getByRole("heading", { level: 1, name: "Everything in one connected workspace" })).toBeVisible();

  await cleanPage.goto(`${SOURCE_PATH}?__mock=error`);
  await expect(errorState).toBeVisible();
  await cleanPage.getByRole("button", { name: "Try again" }).click();
  await expect(cleanPage.getByRole("heading", { level: 1, name: "Flowbase" })).toBeVisible();

  await cleanPage.goto("/en/pages?__mock=error");
  await expect(errorState).toBeVisible();
  await cleanPage.getByRole("button", { name: "Try again" }).click();
  await expect(cleanPage.getByRole("link", { name: /^Open reference: / })).toHaveCount(14);
});

test("every Phase 07 route is axe-clean and never scrolls sideways", async ({ cleanPage }) => {
  for (const path of ["/en/sources", "/en/pages", "/en/categories", SECTION_PATH, PAGE_PATH, SOURCE_PATH]) {
    await cleanPage.goto(path);
    await expect(cleanPage.getByRole("heading", { level: 1 })).toBeVisible();
    await scanAccessibility(cleanPage, path);
  }

  // The context view is part of the section route's accessible surface.
  await cleanPage.goto(SECTION_PATH);
  await cleanPage.getByRole("button", { name: "View in context" }).click();
  await expect(cleanPage.getByTestId("context-dialog")).toBeVisible();
  await scanAccessibility(cleanPage, `${SECTION_PATH} (context view)`);

  await cleanPage.setViewportSize({ width: 375, height: 812 });
  for (const path of ["/en/sources", "/en/pages", "/en/categories", SECTION_PATH, PAGE_PATH, SOURCE_PATH]) {
    await cleanPage.goto(path);
    expect(await cleanPage.evaluate(() => document.documentElement.scrollWidth), path).toBeLessThanOrEqual(375);
  }
});
