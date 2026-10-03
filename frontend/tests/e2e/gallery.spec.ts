import { expect, test } from "./fixtures";

test("the development gallery is not reachable in a production build", async ({ cleanPage }) => {
  cleanPage.expectResponse({ path: "/en/dev/gallery", status: 404 });
  const response = await cleanPage.goto("/en/dev/gallery");

  expect(response?.status()).toBe(404);
  await expect(cleanPage.getByRole("heading", { name: "Page not found" })).toBeVisible();
});
