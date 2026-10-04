import { expect, test as base, type Page, type Request } from "@playwright/test";
import { getMissingResponseErrors } from "../../src/lib/clean-run-expectations";

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
    /** Requests that already produced a response, so a later cancellation is not a failure. */
    const answered = new WeakSet<Request>();

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
    page.on("requestfailed", (request) => {
      /*
        A client-side navigation streams its RSC payload, and the router cancels
        that stream once the new route has rendered. Chromium reports the
        cancellation as an aborted request even though the response arrived with a
        200, so a request that was already answered is not a failure — the page it
        was fetching for rendered fine. A request that never received a response
        is still reported, whatever the reason.
      */
      if (answered.has(request) && request.failure()?.errorText === "net::ERR_ABORTED") return;
      failures.push(`request failed (${request.method()}, ${request.failure()?.errorText ?? "unknown"}): ${request.url()}`);
    });
    page.on("response", (response) => {
      answered.add(response.request());
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

    failures.push(...getMissingResponseErrors(expectations));

    expect(failures).toEqual([]);
  },
});

export { expect };
