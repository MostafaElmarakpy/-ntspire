import { expect, test, type CleanPage } from "./fixtures";
import { expectAccessible } from "./axe-helper";

async function chooseFilter(
  cleanPage: CleanPage,
  viewport: string,
  label: string,
  value: string,
) {
  if (viewport === "mobile") {
    await cleanPage.getByRole("button", { name: "Filters", exact: true }).click();
    const sheet = cleanPage.getByRole("dialog");
    await expect(sheet).toBeVisible();
    await sheet.getByLabel(label).selectOption(value);
    await sheet.getByRole("button", { name: "Apply filters" }).click();
  } else {
    await cleanPage.getByLabel(label).selectOption(value);
  }
}

test("Explore renders shared search results, responsive masonry, and accessible filters", async ({ cleanPage }) => {
  await cleanPage.goto("/en/explore");

  await expect(cleanPage.getByRole("heading", { name: "Explore references", level: 1 })).toBeVisible();
  await expect(cleanPage.getByText("Showing 12 of 42 references")).toBeVisible();
  await expect(cleanPage.locator("article img")).toHaveCount(12);
  await expect(cleanPage.getByLabel("Section type")).toBeAttached();

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
  await cleanPage.goto("/en/explore");
  await chooseFilter(cleanPage, testInfo.project.name, "Industry", "saas");
  await expect(cleanPage).toHaveURL(/industry=saas/);
  await expect(cleanPage.getByRole("button", { name: "Remove filter Industry: SaaS" })).toBeVisible();
  await expect(cleanPage.locator('p[aria-live="polite"]')).toHaveText(/Showing [1-9]\d* of/);

  await chooseFilter(cleanPage, testInfo.project.name, "Style", "dark");
  await expect(cleanPage).toHaveURL(/industry=saas.*style=dark/);
  await expect(cleanPage.getByRole("button", { name: "Remove filter Style: Dark" })).toBeVisible();
  await expect(cleanPage.locator('p[aria-live="polite"]')).toHaveText(/Showing [1-9]\d* of/);

  if (testInfo.project.name === "mobile") {
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

test("Arabic language and query parameters are applied and shown as removable chips", async ({ cleanPage }) => {
  await cleanPage.goto("/en/explore?language=ar");
  await expect(cleanPage.locator("article img").first()).toBeVisible();
  await expect(cleanPage.getByRole("button", { name: "Remove filter Language: Arabic" })).toBeVisible();

  await cleanPage.goto("/en/explore?q=Hero");
  await expect(cleanPage.getByRole("button", { name: "Remove filter Search query: Hero" })).toBeVisible();
  await expect(cleanPage.getByText("Showing", { exact: false })).toBeVisible();
});

test("Mobile navigation shortcut opens Explore with the mobile device filter", async ({ cleanPage }) => {
  await cleanPage.setViewportSize({ width: 390, height: 844 });
  await cleanPage.goto("/en");
  await cleanPage.getByRole("button", { name: "Open navigation menu" }).click();
  await cleanPage.getByRole("link", { name: "Mobile", exact: true }).click();

  await expect(cleanPage).toHaveURL("/en/explore?device=mobile");
  await expect(cleanPage.getByRole("button", { name: "Remove filter Device: Mobile" })).toBeVisible();
  await expect(cleanPage.locator("article img").first()).toBeVisible();
  await cleanPage.waitForLoadState("networkidle");
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

test("loading, empty, and retryable error states follow mock query modes", async ({ cleanPage }) => {
  const navigation = cleanPage.goto("/en/explore?__mock=slow", { waitUntil: "commit" });
  await expect(cleanPage.getByRole("status").first()).toBeVisible();
  await navigation;
  await expect(cleanPage.getByRole("heading", { name: "Explore references", level: 1 })).toBeVisible();

  await cleanPage.goto("/en/explore?__mock=empty");
  await expect(cleanPage.getByRole("heading", { name: "No references match these filters" })).toBeVisible();
  await expect(cleanPage.getByRole("button", { name: "Clear filters" })).toBeVisible();
  await cleanPage.getByRole("button", { name: "Clear filters" }).click();
  await expect(cleanPage).toHaveURL("/en/explore");
  await expect(cleanPage.getByText("Showing 12 of 42 references")).toBeVisible();

  await cleanPage.goto("/en/explore?__mock=error");
  await expect(cleanPage.getByRole("heading", { name: "Explore could not load" })).toBeVisible();
  await expect(cleanPage.getByRole("button", { name: "Try again" })).toBeVisible();
  await cleanPage.getByRole("button", { name: "Try again" }).click();
  await expect(cleanPage.getByText("Showing 12 of 42 references")).toBeVisible();
});
