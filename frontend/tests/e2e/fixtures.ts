import { expect, test as base, type Page } from "@playwright/test";

type TrackedExpectation = {
  path: string;
  status: number;
  received: boolean;
};

export type CleanPage = Page & {
  expectResponse(expectation: { path: string; status: number }): void;
  allowExpectedResponse(path: string, status: number): void;
};

export const test = base.extend<{ cleanPage: CleanPage }>({
  cleanPage: async ({ page }, completeFixture) => {
    const expectations: TrackedExpectation[] = [];
    const failures: string[] = [];

    const cleanPage = Object.assign(page, {
      expectResponse({ path, status }: { path: string; status: number }) {
        expectations.push({ path, status, received: false });
      },
      allowExpectedResponse(path: string, status: number) {
        expectations.push({ path, status, received: false });
      },
    });

    page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning") {
        const text = message.text();
        const isExpectedConsoleError = expectations.some(
          (exp) => text.includes(exp.path) || (exp.status >= 400 && text.includes(String(exp.status)))
        );
        if (!isExpectedConsoleError) {
          failures.push(`console ${message.type()}: ${text}`);
        }
      }
    });
    page.on("pageerror", (error) => failures.push(`page error: ${error.message}`));
    page.on("requestfailed", (request) => failures.push(`request failed: ${request.url()}`));
    page.on("response", (response) => {
      const status = response.status();
      const url = response.url();
      const pathname = new URL(url).pathname;

      const matched = expectations.find(
        (exp) => exp.path === pathname && exp.status === status,
      );

      if (matched) {
        matched.received = true;
      } else if (status >= 400) {
        failures.push(`HTTP ${status}: ${url}`);
      }
    });

    await completeFixture(cleanPage);

    for (const exp of expectations) {
      if (!exp.received) {
        failures.push(`expected response { path: "${exp.path}", status: ${exp.status} } did not occur`);
      }
    }

    expect(failures).toEqual([]);
  },
});

export { expect };
