# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: foundation.spec.ts >> clean-run fixture fails if a declared expected response does not occur
- Location: tests\e2e\foundation.spec.ts:32:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "expected response { path: \"/en\", status: 404 } did not occur",
+ ]
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - link "Skip to content" [ref=e4] [cursor=pointer]:
      - /url: "#main-content"
    - banner [ref=e5]:
      - generic [ref=e6]:
        - link "Home" [ref=e7] [cursor=pointer]:
          - /url: /en
          - text: ntspire
        - generic [ref=e8]:
          - button "Search" [ref=e10]
          - button "Sign in" [ref=e11]
          - button "Open navigation menu" [ref=e12]
    - main [ref=e13]:
      - heading "ntspire" [level=1] [ref=e15]
    - contentinfo "ntspire footer" [ref=e16]:
      - generic [ref=e17]:
        - generic [ref=e18]:
          - link "Home" [ref=e19] [cursor=pointer]:
            - /url: /en
            - generic [ref=e20]: ntspire
          - paragraph [ref=e21]: Independent references for thoughtful digital work.
        - generic [ref=e22]:
          - navigation "Footer navigation" [ref=e23]:
            - heading "Library" [level=2] [ref=e24]
            - list [ref=e25]:
              - listitem [ref=e26]:
                - link "Home" [ref=e27] [cursor=pointer]:
                  - /url: /en
          - paragraph [ref=e28]: © ntspire
  - region "Notifications alt+T"
```

# Test source

```ts
  1  | import { expect, test as base, type Page, type Request } from "@playwright/test";
  2  | import { getMissingResponseErrors } from "../../src/lib/clean-run-expectations";
  3  | 
  4  | type TrackedExpectation = {
  5  |   path: string;
  6  |   status: number;
  7  |   received: boolean;
  8  | };
  9  | 
  10 | export type CleanPage = Page & {
  11 |   expectResponse(expectation: { path: string; status: number }): void;
  12 |   allowExpectedResponse(path: string, status: number): void;
  13 | };
  14 | 
  15 | export const test = base.extend<{ cleanPage: CleanPage }>({
  16 |   cleanPage: async ({ page }, completeFixture) => {
  17 |     const expectations: TrackedExpectation[] = [];
  18 |     const failures: string[] = [];
  19 |     /** Requests that already produced a response, so a later cancellation is not a failure. */
  20 |     const answered = new WeakSet<Request>();
  21 | 
  22 |     const cleanPage = Object.assign(page, {
  23 |       expectResponse({ path, status }: { path: string; status: number }) {
  24 |         expectations.push({ path, status, received: false });
  25 |       },
  26 |       allowExpectedResponse(path: string, status: number) {
  27 |         expectations.push({ path, status, received: false });
  28 |       },
  29 |     });
  30 | 
  31 |     page.on("console", (message) => {
  32 |       if (message.type() === "error" || message.type() === "warning") {
  33 |         const text = message.text();
  34 |         const isExpectedConsoleError = expectations.some(
  35 |           (exp) => text.includes(exp.path) || (exp.status >= 400 && text.includes(String(exp.status)))
  36 |         );
  37 |         if (!isExpectedConsoleError) {
  38 |           failures.push(`console ${message.type()}: ${text}`);
  39 |         }
  40 |       }
  41 |     });
  42 |     page.on("pageerror", (error) => failures.push(`page error: ${error.message}`));
  43 |     page.on("requestfailed", (request) => {
  44 |       /*
  45 |         A client-side navigation streams its RSC payload, and the router cancels
  46 |         that stream once the new route has rendered. Chromium reports the
  47 |         cancellation as an aborted request even though the response arrived with a
  48 |         200, so a request that was already answered is not a failure — the page it
  49 |         was fetching for rendered fine. A request that never received a response
  50 |         is still reported, whatever the reason.
  51 |       */
  52 |       if (answered.has(request) && request.failure()?.errorText === "net::ERR_ABORTED") return;
  53 |       failures.push(`request failed (${request.method()}, ${request.failure()?.errorText ?? "unknown"}): ${request.url()}`);
  54 |     });
  55 |     page.on("response", (response) => {
  56 |       answered.add(response.request());
  57 |       const status = response.status();
  58 |       const url = response.url();
  59 |       const pathname = new URL(url).pathname;
  60 | 
  61 |       const matched = expectations.find(
  62 |         (exp) => exp.path === pathname && exp.status === status,
  63 |       );
  64 | 
  65 |       if (matched) {
  66 |         matched.received = true;
  67 |       } else if (status >= 400) {
  68 |         failures.push(`HTTP ${status}: ${url}`);
  69 |       }
  70 |     });
  71 | 
  72 |     await completeFixture(cleanPage);
  73 | 
  74 |     failures.push(...getMissingResponseErrors(expectations));
  75 | 
> 76 |     expect(failures).toEqual([]);
     |                      ^ Error: expect(received).toEqual(expected) // deep equality
  77 |   },
  78 | });
  79 | 
  80 | export { expect };
  81 | 
```