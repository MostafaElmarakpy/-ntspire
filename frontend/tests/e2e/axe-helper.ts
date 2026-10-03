import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

export async function expectAccessible(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const seriousViolations = results.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
  return seriousViolations;
}
