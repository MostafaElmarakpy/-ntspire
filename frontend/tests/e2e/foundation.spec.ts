import { expect, test } from "./fixtures";

test("root redirects to the English home page", async ({ cleanPage }) => {
  await cleanPage.goto("/");

  await expect(cleanPage).toHaveURL(/\/en$/);
  await expect(cleanPage).toHaveTitle("ntspire — Visual design references");
});

test("English home page loads the wordmark", async ({ cleanPage }) => {
  await cleanPage.goto("/en");

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
