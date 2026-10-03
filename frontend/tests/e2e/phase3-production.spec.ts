import { expect, test } from "./fixtures";

test("development design-system route is unavailable in production", async ({ cleanPage }) => {
  cleanPage.expectResponse({ path: "/en/dev/design-system", status: 404 });
  const response = await cleanPage.goto("/en/dev/design-system");
  expect(response?.status()).toBe(404);
  await expect(cleanPage.getByRole("heading", { name: "Page not found" })).toBeVisible();
});
