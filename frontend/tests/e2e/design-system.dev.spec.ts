import { mkdirSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./fixtures";
import { expectAccessible } from "./axe-helper";

const screenshotsDirectory = path.resolve(process.cwd(), "../docs/phase-reports/screenshots");

test("design-system catalogue is usable, responsive, and accessible", async ({ cleanPage }, testInfo) => {
  await cleanPage.goto("/en/dev/design-system");
  await expect(cleanPage.getByRole("heading", { name: "Design system", level: 1 })).toBeVisible();
  await expect(cleanPage.getByRole("navigation", { name: "Footer navigation" })).toBeVisible();
  await expect(cleanPage.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main-content");

  const internalHrefs = await cleanPage.locator('a[href^="/"]').evaluateAll((anchors) => anchors.map((anchor) => (anchor as HTMLAnchorElement).getAttribute("href")!).filter(Boolean));
  for (const href of internalHrefs) {
    const response = await cleanPage.request.get(href);
    expect(response.status(), `${href} should resolve`).toBe(200);
  }

  const seriousViolations = await expectAccessible(cleanPage);
  expect(seriousViolations, JSON.stringify(seriousViolations.map(({ id, help }) => ({ id, help })))).toEqual([]);

  mkdirSync(screenshotsDirectory, { recursive: true });
  const viewportName = testInfo.project.name === "mobile" ? "390" : "1440";
  await cleanPage.screenshot({ path: path.join(screenshotsDirectory, `03-design-system-${viewportName}.png`), fullPage: true });
});

test("mobile navigation traps focus, closes on Escape, and returns focus", async ({ cleanPage }) => {
  await cleanPage.setViewportSize({ width: 390, height: 844 });
  await cleanPage.goto("/en/dev/design-system");
  const trigger = cleanPage.getByRole("button", { name: "Open navigation menu" });
  await trigger.focus();
  await trigger.press("Enter");

  const dialog = cleanPage.getByRole("dialog");
  await expect(dialog).toBeVisible();
  for (let tabCount = 0; tabCount < 8; tabCount += 1) {
    await cleanPage.keyboard.press("Tab");
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
  await cleanPage.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();

  await cleanPage.setViewportSize({ width: 375, height: 812 });
  const overflow = await cleanPage.locator("body *").evaluateAll((elements) => elements.flatMap((element) => {
    const rect = element.getBoundingClientRect();
    return rect.right > 375 || rect.left < 0 ? [`${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}.${String(element.className).slice(0, 120)} (${Math.round(rect.left)}..${Math.round(rect.right)})`] : [];
  }));
  expect(await cleanPage.evaluate(() => document.documentElement.scrollWidth), JSON.stringify(overflow)).toBeLessThanOrEqual(375);
});
