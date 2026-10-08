import { expect, test, type CleanPage } from "./fixtures";
import { expectAccessible } from "./axe-helper";
import type { Locator } from "@playwright/test";

/**
 * The Explore controls live in a persistent sidebar on desktop and in the same
 * sidebar rendered inside the filter Sheet on mobile. Both breakpoints share one
 * filter implementation, so the helpers below only differ in which container
 * they scope to.
 */

const SIDEBAR_LABEL = "Browse and filter references";

function sidebar(cleanPage: CleanPage, viewport: string): Locator {
  return viewport === "mobile"
    ? cleanPage.getByRole("dialog")
    : cleanPage.getByRole("complementary", { name: SIDEBAR_LABEL });
}

async function openSidebar(cleanPage: CleanPage, viewport: string): Promise<void> {
  if (viewport !== "mobile") return;
  await cleanPage.getByRole("button", { name: "Filters", exact: true }).click();
  await expect(cleanPage.getByRole("dialog")).toBeVisible();
}

/** The Industry list is always open; the remaining filters are collapsible groups. */
async function selectIndustry(cleanPage: CleanPage, viewport: string, option: string): Promise<void> {
  await openSidebar(cleanPage, viewport);
  const scope = sidebar(cleanPage, viewport);
  await scope.getByRole("region", { name: "Industries" }).getByRole("button", { name: option }).click();
  if (viewport === "mobile") await scope.getByRole("button", { name: "Apply filters" }).click();
}

async function selectFilterOption(
  cleanPage: CleanPage,
  viewport: string,
  group: string,
  option: string,
): Promise<void> {
  await openSidebar(cleanPage, viewport);
  const scope = sidebar(cleanPage, viewport);
  const toggle = scope.getByRole("button", { name: group, exact: true });
  if ((await toggle.getAttribute("aria-expanded")) === "false") await toggle.click();
  await scope.getByRole("button", { name: option }).click();
  if (viewport === "mobile") await scope.getByRole("button", { name: "Apply filters" }).click();
}

test("Explore renders the filter sidebar, shared search results, and a responsive masonry grid", async ({ cleanPage }, testInfo) => {
  const viewport = testInfo.project.name;
  await cleanPage.goto("/en/explore");

  await expect(cleanPage.getByText("Showing 12 of 42 references")).toBeVisible();
  await expect(cleanPage.locator("article img")).toHaveCount(12);

  if (viewport === "mobile") {
    await expect(cleanPage.getByRole("button", { name: "Filters", exact: true })).toBeVisible();
    await expect(cleanPage.getByRole("complementary", { name: SIDEBAR_LABEL })).toBeHidden();
    await cleanPage.getByRole("button", { name: "Filters", exact: true }).click();
    const sheet = cleanPage.getByRole("dialog");
    await expect(sheet.getByRole("navigation", { name: "Discover" })).toBeVisible();
    await expect(sheet.getByRole("region", { name: "Industries" })).toBeVisible();
    await expect(sheet.getByRole("button", { name: "Section type", exact: true })).toBeVisible();
    await cleanPage.keyboard.press("Escape");
  } else {
    const aside = cleanPage.getByRole("complementary", { name: SIDEBAR_LABEL });
    await expect(aside).toBeVisible();
    await expect(aside.getByRole("navigation", { name: "Discover" })).toBeVisible();
    await expect(aside.getByRole("region", { name: "Industries" })).toBeVisible();
    await expect(aside.getByRole("button", { name: "Section type", exact: true })).toBeVisible();
  }

  const firstImage = cleanPage.locator("article img").first();
    await expect.poll(() => firstImage.evaluate((element) => {
      const image = element as HTMLImageElement;
      return image.naturalWidth > 0 && image.naturalHeight > 0;
    })).toBe(true);
  const imageRatio = await firstImage.evaluate((image) => {
    const loadedImage = image as HTMLImageElement;
    const bounds = image.getBoundingClientRect();
    return bounds.width / bounds.height / (loadedImage.naturalWidth / loadedImage.naturalHeight);
  });
  expect(imageRatio).toBeGreaterThan(0.97);
  expect(imageRatio).toBeLessThan(1.03);

  const violations = await expectAccessible(cleanPage);
  expect(violations, JSON.stringify(violations.map(({ id, help }) => ({ id, help })))).toEqual([]);

  await cleanPage.setViewportSize({ width: 375, height: 812 });
  expect(await cleanPage.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test("filters update the URL and browser history restores applied state", async ({ cleanPage }, testInfo) => {
  const viewport = testInfo.project.name;
  await cleanPage.goto("/en/explore");
  await selectIndustry(cleanPage, viewport, "SaaS");
  await expect(cleanPage).toHaveURL(/industry=saas/);
  await expect(cleanPage.getByRole("button", { name: "Remove filter Industry: SaaS" })).toBeVisible();
  await expect(cleanPage.locator('p[aria-live="polite"]')).toHaveText(/Showing [1-9]\d* of/);

  await selectFilterOption(cleanPage, viewport, "Style", "Dark");
  await expect(cleanPage).toHaveURL(/industry=saas.*style=dark/);
  await expect(cleanPage.getByRole("button", { name: "Remove filter Style: Dark" })).toBeVisible();
  await expect(cleanPage.locator('p[aria-live="polite"]')).toHaveText(/Showing [1-9]\d* of/);

  if (viewport === "mobile") {
    await cleanPage.getByRole("button", { name: "Filters", exact: true }).click();
    const violations = await expectAccessible(cleanPage);
    expect(violations, JSON.stringify(violations.map(({ id, help }) => ({ id, help })))).toEqual([]);
    await cleanPage.keyboard.press("Escape");
  }

  await cleanPage.goBack();
  await expect(cleanPage).toHaveURL(/industry=saas$/);
  await expect(cleanPage.locator('p[aria-live="polite"]')).toHaveText(/Showing [1-9]\d* of/);
  await expect(cleanPage.getByRole("button", { name: "Remove filter Style: Dark" })).toHaveCount(0);
  await cleanPage.goForward();
  await expect(cleanPage).toHaveURL(/industry=saas.*style=dark/);
  await expect(cleanPage.locator('p[aria-live="polite"]')).toHaveText(/Showing [1-9]\d* of/);
  await cleanPage.reload();
  await expect(cleanPage.getByRole("button", { name: "Remove filter Style: Dark" })).toBeVisible();
});

test("an applied group starts expanded so the restored filter is visible", async ({ cleanPage }, testInfo) => {
  const viewport = testInfo.project.name;
  await cleanPage.goto("/en/explore?style=dark");

  await openSidebar(cleanPage, viewport);
  const scope = sidebar(cleanPage, viewport);
  await expect(scope.getByRole("button", { name: "Style", exact: true })).toHaveAttribute("aria-expanded", "true");
  await expect(scope.getByRole("button", { name: /^Dark \d+$/ })).toHaveAttribute("aria-pressed", "true");
});

test("Discover switches between the Sections grid and the mobile device view", async ({ cleanPage }, testInfo) => {
  const viewport = testInfo.project.name;
  await cleanPage.goto("/en/explore");

  await openSidebar(cleanPage, viewport);
  const scope = sidebar(cleanPage, viewport);
  await expect(scope.getByRole("button", { name: "Sections", exact: true })).toHaveAttribute("aria-current", "true");

  await scope.getByRole("button", { name: "Mobile", exact: true }).click();
  if (viewport === "mobile") await scope.getByRole("button", { name: "Apply filters" }).click();

  await expect(cleanPage).toHaveURL(/device=mobile/);
  await expect(cleanPage.getByRole("button", { name: "Remove filter Device: Mobile" })).toBeVisible();
  await openSidebar(cleanPage, viewport);
  await expect(sidebar(cleanPage, viewport).getByRole("button", { name: "Mobile", exact: true })).toHaveAttribute("aria-current", "true");

  await sidebar(cleanPage, viewport).getByRole("button", { name: "Sections", exact: true }).click();
  if (viewport === "mobile") await sidebar(cleanPage, viewport).getByRole("button", { name: "Apply filters" }).click();

  await expect(cleanPage).toHaveURL("/en/explore");
  await expect(cleanPage.locator("article img").first()).toBeVisible();
});

test("Arabic language and query parameters are applied and shown as removable chips", async ({ cleanPage }) => {
  await cleanPage.goto("/en/explore?language=ar");
  await expect(cleanPage.locator("article img").first()).toBeVisible();
  await expect(cleanPage.getByRole("button", { name: "Remove filter Language: Arabic" })).toBeVisible();

  // This suite runs against a production build, so the results above are Arabic
  // sections rendered with the dev-only Arabic marker switched off. If the
  // marker's NODE_ENV guard regressed, this count would not be zero.
  await expect(cleanPage.getByText("AR", { exact: true })).toHaveCount(0);

  await cleanPage.goto("/en/explore?q=Hero");
  await expect(cleanPage.getByRole("button", { name: "Remove filter Search query: Hero" })).toBeVisible();
  await expect(cleanPage.getByText("Showing", { exact: false })).toBeVisible();
});

test("Mobile navigation shortcut opens Explore with the mobile device filter", async ({ cleanPage }) => {
  await cleanPage.setViewportSize({ width: 390, height: 844 });
  await cleanPage.goto("/en");
  // Target the header navigation button specifically (not the sidebar one)
  await cleanPage.locator("header").getByRole("button", { name: "Open navigation menu" }).click();
  const menu = cleanPage.getByRole("dialog");
  await menu.getByRole("link", { name: "Mobile", exact: true }).click();

  await expect(cleanPage).toHaveURL("/en/explore?device=mobile");
  await expect(cleanPage.getByRole("button", { name: "Remove filter Device: Mobile" })).toBeVisible();
  await expect(cleanPage.locator("article img").first()).toBeVisible();
  await cleanPage.waitForLoadState("networkidle");
});

test("the header exposes one Search trigger in the active navigation", async ({ cleanPage }, testInfo) => {
  await cleanPage.goto("/en/explore");
  if (testInfo.project.name === "desktop") {
    await expect(cleanPage.getByRole("button", { name: "Search", exact: true })).toHaveCount(1);
    return;
  }

  await cleanPage.getByRole("button", { name: "Open navigation menu" }).click();
  const menu = cleanPage.getByRole("dialog");
  const searchTrigger = menu.getByRole("button", { name: "Search", exact: true });
  await expect(searchTrigger).toHaveCount(1);
  await searchTrigger.click();
  await expect(cleanPage.getByRole("dialog", { name: "Search" })).toBeVisible();
});

test("the source avatar opens the Source page without opening the Section modal", async ({ cleanPage }) => {
  await cleanPage.goto("/en/explore");
  const card = cleanPage.locator("article").first();
  const sourceLink = card.getByRole("link", { name: /^View source:/ });
  const sourceHref = await sourceLink.getAttribute("href");

  await sourceLink.click();
  await expect(cleanPage).toHaveURL(new RegExp(`${sourceHref}$`));
  await expect(cleanPage.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(cleanPage.getByRole("dialog")).toHaveCount(0);
});

test("card body opens the Section modal with adjacent Explore results and restores focus", async ({ cleanPage }) => {
  await cleanPage.goto("/en/explore?sort=latest");
  const firstCard = cleanPage.locator("article").first();
  const firstOpen = firstCard.getByRole("link", { name: /^Open reference:/ });
  const firstHref = await firstOpen.getAttribute("href");
  expect(firstHref).toBeTruthy();

  const firstUrl = new URL(firstHref!, cleanPage.url());
  const resultParams = new URLSearchParams(firstUrl.searchParams);
  resultParams.set("locale", "en");
  const resultResponse = await cleanPage.request.get(`/api/explore?${resultParams.toString()}`);
  expect(resultResponse.status()).toBe(200);
  const resultSet = await resultResponse.json() as { data: { items: Array<{ id: string }> } };
  const currentId = firstUrl.pathname.split("/").at(-1)!;
  const currentIndex = resultSet.data.items.findIndex((item) => item.id === currentId);
  expect(currentIndex).toBeGreaterThanOrEqual(0);
  const expectedNextId = resultSet.data.items[currentIndex + 1]?.id;
  expect(expectedNextId).toBeTruthy();

  await firstOpen.click();
  const dialog = cleanPage.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(cleanPage).toHaveURL(firstHref!);
  await expect(dialog.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(dialog.getByRole("radiogroup", { name: "Preview device" })).toBeVisible();
  const detailActions = dialog.getByRole("group", { name: "Reference actions" }).first();
  for (const label of ["Save reference", "Save as image", "Send to Figma", "View in context"]) {
    await expect(detailActions.getByRole("button", { name: label })).toBeVisible();
  }

  const violations = await expectAccessible(cleanPage);
  expect(violations, JSON.stringify(violations.map(({ id, help }) => ({ id, help })))).toEqual([]);

  await dialog.getByRole("link", { name: "Next reference" }).click();
  await expect(cleanPage).toHaveURL(new RegExp(`/sections/${expectedNextId}\\?sort=latest$`));
  await expect(dialog).toBeVisible();
  await dialog.getByRole("link", { name: "Previous reference" }).click();
  await expect(cleanPage).toHaveURL(firstHref!);
  await expect(dialog).toBeVisible();

  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(cleanPage).toHaveURL("/en/explore?sort=latest");
  await expect(firstOpen).toBeFocused();

  await firstOpen.click();
  await expect(cleanPage.getByRole("dialog")).toBeVisible();
  await cleanPage.keyboard.press("Escape");
  await expect(cleanPage.getByRole("dialog")).toHaveCount(0);
  await expect(firstOpen).toBeFocused();

  await firstOpen.click();
  const outsideClick = cleanPage.locator('[data-slot="dialog-overlay"]').last();
  await expect(cleanPage.getByRole("dialog")).toBeVisible();
  await outsideClick.click({ position: { x: 3, y: 3 } });
  await expect(cleanPage.getByRole("dialog")).toHaveCount(0);
  await expect(firstOpen).toBeFocused();
});

test("card overlays keep stable bounds and the arrow opens the detail modal", async ({ cleanPage }, testInfo) => {
  await cleanPage.goto("/en/explore");
  const card = cleanPage.locator("article").first();
  // Wait for first layout before measuring: an early boundingBox can catch the
  // pre-layout card (zero box) and flake the height comparison below.
  await expect
    .poll(async () => card.evaluate((el) => el.getBoundingClientRect().height))
    .toBeGreaterThan(0);
  if (testInfo.project.name === "desktop") await card.hover();
  const arrow = card.getByRole("link", { name: "Nothing great is made alone", exact: true });
  const cardBounds = await card.boundingBox();
  await expect(arrow).toHaveAttribute("href", /\/en\/sections\//);

  const afterBounds = await card.boundingBox();
  expect(Math.abs((afterBounds?.height ?? 0) - (cardBounds?.height ?? 0))).toBeLessThanOrEqual(1);

  const violations = await expectAccessible(cleanPage);
  expect(violations, JSON.stringify(violations.map(({ id, help }) => ({ id, help })))).toEqual([]);

  await arrow.click();
  const dialog = cleanPage.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(cleanPage).toHaveURL(/\/en\/sections\/section-papercrane-collaboration-1/);
  await cleanPage.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(cleanPage).toHaveURL("/en/explore");
});

test("a cold Section URL renders the standalone detail page, not a modal", async ({ cleanPage }) => {
  await cleanPage.goto("/en/sections/section-flowbase-home-3");
  await expect(cleanPage.getByRole("heading", { level: 1, name: "Everything in one connected workspace" })).toBeVisible();
  await expect(cleanPage.getByRole("dialog")).toHaveCount(0);
});

test("Load more appends pages and reaches a stable end state", async ({ cleanPage }) => {
  await cleanPage.goto("/en/explore");
  for (const count of [24, 36, 42]) {
    await cleanPage.getByRole("button", { name: "Load more" }).click();
    await expect(cleanPage.getByText(`Showing ${count} of 42 references`)).toBeVisible();
  }
  await expect(cleanPage.getByText("You have reached the end of the results.")).toBeVisible();
  await expect(cleanPage.getByRole("button", { name: "Load more" })).toHaveCount(0);
});

test("loading, empty, and retryable error states follow mock query modes", async ({ cleanPage }, testInfo) => {
  const viewport = testInfo.project.name;
  const navigation = cleanPage.goto("/en/explore?__mock=slow", { waitUntil: "commit" });
  await expect(cleanPage.getByRole("status").first()).toBeVisible();
  await navigation;
  await expect(cleanPage.getByText("Showing 12 of 42 references")).toBeVisible();

  await cleanPage.goto("/en/explore?__mock=empty");
  await expect(cleanPage.getByRole("heading", { name: "No references match these filters" })).toBeVisible();
  await openSidebar(cleanPage, viewport);
  await expect(sidebar(cleanPage, viewport).getByRole("region", { name: "Industries" })).toBeVisible();
  if (viewport === "mobile") await cleanPage.keyboard.press("Escape");
  // Scoped to the page: the exiting filter drawer still mounts its own Clear
  // control until its exit animation finishes.
  await cleanPage.locator("#main-content").getByRole("button", { name: "Clear filters" }).click();
  await expect(cleanPage).toHaveURL("/en/explore");
  await expect(cleanPage.getByText("Showing 12 of 42 references")).toBeVisible();

  await cleanPage.goto("/en/explore?__mock=error");
  await expect(cleanPage.getByRole("heading", { name: "Explore could not load" })).toBeVisible();
  await expect(cleanPage.getByRole("button", { name: "Try again" })).toBeVisible();
  await cleanPage.getByRole("button", { name: "Try again" }).click();
  await expect(cleanPage.getByText("Showing 12 of 42 references")).toBeVisible();
});
