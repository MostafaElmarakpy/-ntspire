import { expect, test, type CleanPage } from "./fixtures";
import { expectAccessible } from "./axe-helper";
import type { Locator } from "@playwright/test";

/**
 * The shell offers the overlay from three places — the desktop navigation entry,
 * the compact icon beside it and the row inside the mobile menu — so each test
 * opens it the way a person at that breakpoint would.
 */

const PLACEHOLDER = "Sites, Categories, Sections or Styles…";

function panel(cleanPage: CleanPage): Locator {
  // The header search pill's overlay is the primary one; use last() to get the
  // header search pill's overlay (the compact search overlay in the mobile menu
  // shares the same test ID but renders first in the DOM).
  // The close button is in the DialogContent which wraps the search-overlay div.
  return cleanPage.locator('[data-testid="search-overlay"]').last().locator('..');
}

/**
 * The desktop shell shows the navigation entry and the compact icon at the same
 * time, so the visible trigger is pinned to the landmark that holds it.
 * On mobile, the header search pill is the primary trigger.
 */
function trigger(cleanPage: CleanPage, viewport: string): Locator {
  if (viewport === "mobile") {
    // Use the header search pill (not the compact icon or mobile menu)
    return cleanPage.locator("header").getByRole("button", { name: "Search", exact: true });
  }
  return cleanPage.getByRole("navigation", { name: "Primary navigation" }).getByRole("button", { name: "Search" });
}

async function openOverlay(cleanPage: CleanPage, viewport: string): Promise<Locator> {
  if (viewport === "mobile") {
    // Use the header navigation button specifically (not the sidebar one)
    await cleanPage.locator("header").getByRole("button", { name: "Open navigation menu" }).click();
    await cleanPage.getByRole("dialog").getByRole("button", { name: "Search", exact: true }).click();
  } else {
    await trigger(cleanPage, viewport).click();
  }

  const overlay = panel(cleanPage);
  await expect(overlay).toBeVisible();
  return overlay;
}

/**
 * Submitting is a soft navigation, and the overlay also reads counts and
 * suggestions while it is open. Letting the network fall quiet keeps those
 * requests from being cut short by the next navigation — or by the end of the
 * test — which would otherwise read as a failed request.
 */
async function settle(cleanPage: CleanPage): Promise<void> {
  await cleanPage.waitForLoadState("networkidle");
}

test("the visible trigger opens the overlay, focuses the field, and Escape returns focus", async ({ cleanPage }, testInfo) => {
  const viewport = testInfo.project.name;
  await cleanPage.goto("/en");

  const open = trigger(cleanPage, viewport);
  await open.click();

  const overlay = panel(cleanPage);
  await expect(overlay).toBeVisible();
  await expect(overlay.getByRole("combobox")).toBeFocused();
  await expect(overlay.getByRole("combobox")).toHaveAttribute("placeholder", PLACEHOLDER);
  await expect(overlay.getByRole("tab", { name: "Trending" })).toBeVisible();
  await expect(overlay.getByText(/^\d+ references$/)).toBeVisible();

  if (viewport === "mobile") {
    // A virtual keyboard must not be able to push the submit control off screen.
    const box = await overlay.boundingBox();
    expect(box?.width ?? 0).toBeLessThanOrEqual(390);
    await expect(overlay.getByRole("button", { name: "View all results" })).toBeInViewport();
  }

  await cleanPage.keyboard.press("Escape");
  await expect(overlay).toBeHidden();
  await expect(open).toBeFocused();
});

test("Ctrl+K and / open the overlay from the keyboard", async ({ cleanPage }) => {
  await cleanPage.goto("/en");

  await cleanPage.keyboard.press("Control+k");
  await expect(panel(cleanPage)).toBeVisible();
  // Close via the close button (more reliable than Escape key in test env)
  await expect(panel(cleanPage).getByRole("button", { name: "Close" })).toBeVisible({ timeout: 10000 });
  await panel(cleanPage).getByRole("button", { name: "Close" }).click();
  await expect(panel(cleanPage)).toBeHidden();

  await cleanPage.keyboard.press("/");
  await expect(panel(cleanPage)).toBeVisible();
  await panel(cleanPage).getByRole("button", { name: "Close" }).click();
  await expect(panel(cleanPage)).toBeHidden();
});

test("the overlay hands the typed query, its detected filters and the device to Explore", async ({ cleanPage }, testInfo) => {
  const viewport = testInfo.project.name;
  await cleanPage.goto("/en");

  const overlay = await openOverlay(cleanPage, viewport);
  await settle(cleanPage);

  const violations = await expectAccessible(cleanPage);
  expect(violations, JSON.stringify(violations.map(({ id, help }) => ({ id, help })))).toEqual([]);

  await overlay.getByRole("combobox").fill("Arabic E-commerce Hero");
  const detected = overlay.getByTestId("detected-filters");
  await expect(detected.getByRole("button", { name: "Remove detected filter: Arabic" })).toBeVisible();
  await expect(detected.getByRole("button", { name: "Remove detected filter: E-commerce" })).toBeVisible();
  await expect(detected.getByRole("button", { name: "Remove detected filter: Hero" })).toBeVisible();

  await overlay.getByRole("button", { name: "Desktop" }).click();
  await settle(cleanPage);
  await overlay.getByRole("button", { name: "View all results" }).click();

  await expect(cleanPage).toHaveURL("/en/explore?sectionType=hero&industry=ecommerce&language=ar&device=desktop");
  await expect(cleanPage.getByRole("button", { name: "Remove filter Section type: Hero" })).toBeVisible();
  await expect(cleanPage.getByRole("button", { name: "Remove filter Industry: E-commerce" })).toBeVisible();
  await expect(cleanPage.getByRole("button", { name: "Remove filter Language: Arabic" })).toBeVisible();
  await expect(cleanPage.getByRole("button", { name: "Remove filter Device: Desktop" })).toBeVisible();
  await expect(cleanPage.locator('p[aria-live="polite"]')).toHaveText(/Showing [1-9]\d* of [1-9]\d* references/);
  await expect(cleanPage.locator("article img").first()).toBeVisible();
  await settle(cleanPage);
});

test("the permanent Arabic Websites chip searches the Arabic references", async ({ cleanPage }, testInfo) => {
  const viewport = testInfo.project.name;
  await cleanPage.goto("/en");

  const overlay = await openOverlay(cleanPage, viewport);
  const chip = overlay.getByRole("button", { name: "Arabic websites" });
  await expect(chip).toHaveAttribute("aria-pressed", "false");
  await chip.click();
  await expect(chip).toHaveAttribute("aria-pressed", "true");
  await settle(cleanPage);

  await overlay.getByRole("button", { name: "View all results" }).click();

  await expect(cleanPage).toHaveURL("/en/explore?language=ar");
  await expect(cleanPage.getByRole("button", { name: "Remove filter Language: Arabic" })).toBeVisible();
  await expect(cleanPage.locator("article img").first()).toBeVisible();
  await settle(cleanPage);
});

test("arrows walk the suggestions and Enter applies the highlighted one", async ({ cleanPage }, testInfo) => {
  const viewport = testInfo.project.name;
  await cleanPage.goto("/en");

  const overlay = await openOverlay(cleanPage, viewport);
  const input = overlay.getByRole("combobox");
  await input.fill("her");

  await expect(overlay.getByRole("listbox", { name: "Search suggestions" })).toBeVisible();
  await expect(overlay.getByRole("option", { selected: true })).toHaveCount(0);

  await input.press("ArrowDown");
  const highlighted = overlay.getByRole("option", { selected: true });
  await expect(highlighted).toHaveCount(1);
  await expect(highlighted).toContainText("Hero");

  await input.press("Enter");

  // Enter selected the highlighted suggestion instead of running the search:
  // the overlay stays open and nothing was navigated to.
  await expect(input).toHaveValue("");
  await expect(overlay).toBeVisible();
  await expect(cleanPage).toHaveURL("/en");
  await settle(cleanPage);
});

test("a submitted query is offered again as a recent search", async ({ cleanPage }, testInfo) => {
  const viewport = testInfo.project.name;
  await cleanPage.goto("/en");

  const overlay = await openOverlay(cleanPage, viewport);
  await overlay.getByRole("combobox").fill("dark ecommerce navbar");
  await settle(cleanPage);
  await overlay.getByRole("button", { name: "View all results" }).click();

  // The third required inference case, end to end: every word was recognised, so
  // no free text is left over to search on.
  await expect(cleanPage).toHaveURL("/en/explore?sectionType=navbar&industry=ecommerce&style=dark");
  await settle(cleanPage);

  await cleanPage.goto("/en");
  const reopened = await openOverlay(cleanPage, viewport);
  await expect(reopened.getByText("Recent searches")).toBeVisible();
  await expect(reopened.getByRole("button", { name: "dark ecommerce navbar" })).toBeVisible();
  await settle(cleanPage);
});
