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

/**
 * PROOF: The clean-run fixture MUST fail if a declared expectation is not met.
 * We prove this by asserting that the fixture itself throws an error when we intentionally break it.
 * Note: Since the fixture logic runs AFTER the test body (in the teardown phase of the extend),
 * we cannot easily use a try/catch inside a single test to catch a fixture failure.
 * Instead, we rely on Playwright's 'fail' mode to demonstrate the fixture is working.
 * To avoid the "red X" in the summary for a successful proof of failure, 
 * we use the 'expected failure' documentation in the report.
 */
test("clean-run fixture proof: fails if a declared expected response does not occur", async ({ cleanPage }) => {
  test.fail(true, "Intentional failure to prove fixture catches missing expected responses");
  cleanPage.expectResponse({ path: "/en", status: 404 });
  await cleanPage.goto("/en");
});
