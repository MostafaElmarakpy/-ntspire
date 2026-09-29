import { expect, test as base, type Page } from "@playwright/test";

type AllowedResponse = Readonly<{ pathname: string; status: number }>;

export type CleanPage = Page & {
  allowExpectedResponse(pathname: string, status: number): void;
};

export const test = base.extend<{ cleanPage: CleanPage }>({
  cleanPage: async ({ page }, completeFixture) => {
    const allowedResponses: AllowedResponse[] = [];
    const failures: string[] = [];
    const cleanPage = Object.assign(page, {
      allowExpectedResponse(pathname: string, status: number) {
        allowedResponses.push({ pathname, status });
      },
    });

    page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning") {
        failures.push(`console ${message.type()}: ${message.text()}`);
      }
    });
    page.on("pageerror", (error) => failures.push(`page error: ${error.message}`));
    page.on("requestfailed", (request) => failures.push(`request failed: ${request.url()}`));
    page.on("response", (response) => {
      if (response.status() < 400) return;

      const pathname = new URL(response.url()).pathname;
      const allowed = allowedResponses.some(
        (entry) => entry.pathname === pathname && entry.status === response.status(),
      );

      if (!allowed) failures.push(`HTTP ${response.status()}: ${response.url()}`);
    });

    await completeFixture(cleanPage);
    expect(failures).toEqual([]);
  },
});

export { expect };
