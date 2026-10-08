import { expect, test } from "./fixtures";
import { expectAccessible } from "./axe-helper";

test("root redirects to the English home page", async ({ cleanPage }) => {
  await cleanPage.goto("/");

  await expect(cleanPage).toHaveURL(/\/en$/);
  await expect(cleanPage).toHaveTitle("ntspire — Visual design references");
});

test("English home page loads the Figma-inspired reference library", async ({ cleanPage }, testInfo) => {
  await cleanPage.goto("/en");

  await expect(cleanPage.getByRole("heading", { name: "ntspire" })).toBeVisible();
  await expect(cleanPage.getByRole("navigation", { name: "Discover" })).toBeVisible();
  if (testInfo.project.name === "mobile") {
    await expect(cleanPage.locator("details > summary")).toHaveText("Industries");
    await expect(cleanPage.getByRole("button", { name: "Search", exact: true })).toBeVisible();
  } else {
    await expect(cleanPage.getByRole("navigation", { name: "Browse by industry" })).toBeVisible();
    await expect(cleanPage.getByRole("navigation", { name: "Primary navigation" }).getByRole("button", { name: "Search" })).toBeVisible();
  }
  await expect(cleanPage.getByRole("region", { name: "Explore results" })).toBeVisible();
  await expect(cleanPage.locator("article img")).toHaveCount(42);

  const violations = await expectAccessible(cleanPage);
  expect(violations, JSON.stringify(violations.map(({ id, help }) => ({ id, help })))).toEqual([]);

  await cleanPage.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(cleanPage.getByRole("dialog")).toContainText("Sign in is not available yet");
  await cleanPage.keyboard.press("Escape");

  await cleanPage.setViewportSize({ width: 375, height: 812 });
  expect(await cleanPage.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test("home filters navigate to matching results without leaving the design", async ({ cleanPage }) => {
  await cleanPage.goto("/en");
  await cleanPage.getByRole("combobox", { name: "Industry" }).selectOption("saas");
  await cleanPage.getByRole("button", { name: "Apply filters" }).click();

  await expect(cleanPage).toHaveURL("/en?industry=saas");
  await expect(cleanPage.locator("article img").first()).toBeVisible();
  await expect(cleanPage.getByRole("heading", { name: "ntspire" })).toBeVisible();
});

test("Arabic locale is intentionally unavailable before Phase 11", async ({ cleanPage }) => {
  cleanPage.expectResponse({ path: "/ar", status: 404 });
  const response = await cleanPage.goto("/ar");

  expect(response?.status()).toBe(404);
  await expect(cleanPage.getByRole("heading", { name: "Page not found" })).toBeVisible();
});

test("unknown English paths render the not-found page", async ({ cleanPage }) => {
  cleanPage.expectResponse({ path: "/en/does-not-exist", status: 404 });
  const response = await cleanPage.goto("/en/does-not-exist");

  expect(response?.status()).toBe(404);
  await expect(cleanPage.getByRole("heading", { name: "Page not found" })).toBeVisible();
});

test("clean-run fixture fails if a declared expected response does not occur", async ({ cleanPage }) => {
  test.fail();
  cleanPage.expectResponse({ path: "/en", status: 404 });
  await cleanPage.goto("/en");
});
