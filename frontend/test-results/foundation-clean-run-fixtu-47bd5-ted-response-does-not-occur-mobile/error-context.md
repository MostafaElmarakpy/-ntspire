# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: foundation.spec.ts >> clean-run fixture proof: fails if a declared expected response does not occur
- Location: tests\e2e\foundation.spec.ts:41:1

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
- generic [active] [ref=e1]:
  - main [ref=e3]:
    - heading "ntspire" [level=1] [ref=e4]
  - alert [ref=e5]
```

# Test source

```ts
  1  | import { expect, test as base, type Page } from "@playwright/test";
  2  | 
  3  | type TrackedExpectation = {
  4  |   path: string;
  5  |   status: number;
  6  |   received: boolean;
  7  | };
  8  | 
  9  | export type CleanPage = Page & {
  10 |   expectResponse(expectation: { path: string; status: number }): void;
  11 |   allowExpectedResponse(path: string, status: number): void;
  12 | };
  13 | 
  14 | export const test = base.extend<{ cleanPage: CleanPage }>({
  15 |   cleanPage: async ({ page }, completeFixture) => {
  16 |     const expectations: TrackedExpectation[] = [];
  17 |     const failures: string[] = [];
  18 | 
  19 |     const cleanPage = Object.assign(page, {
  20 |       expectResponse({ path, status }: { path: string; status: number }) {
  21 |         expectations.push({ path, status, received: false });
  22 |       },
  23 |       allowExpectedResponse(path: string, status: number) {
  24 |         expectations.push({ path, status, received: false });
  25 |       },
  26 |     });
  27 | 
  28 |     page.on("console", (message) => {
  29 |       if (message.type() === "error" || message.type() === "warning") {
  30 |         const text = message.text();
  31 |         const isExpectedConsoleError = expectations.some(
  32 |           (exp) => text.includes(exp.path) || (exp.status >= 400 && text.includes(String(exp.status)))
  33 |         );
  34 |         if (!isExpectedConsoleError) {
  35 |           failures.push(`console ${message.type()}: ${text}`);
  36 |         }
  37 |       }
  38 |     });
  39 |     page.on("pageerror", (error) => failures.push(`page error: ${error.message}`));
  40 |     page.on("requestfailed", (request) => failures.push(`request failed: ${request.url()}`));
  41 |     page.on("response", (response) => {
  42 |       const status = response.status();
  43 |       const url = response.url();
  44 |       const pathname = new URL(url).pathname;
  45 | 
  46 |       const matched = expectations.find(
  47 |         (exp) => exp.path === pathname && exp.status === status,
  48 |       );
  49 | 
  50 |       if (matched) {
  51 |         matched.received = true;
  52 |       } else if (status >= 400) {
  53 |         failures.push(`HTTP ${status}: ${url}`);
  54 |       }
  55 |     });
  56 | 
  57 |     await completeFixture(cleanPage);
  58 | 
  59 |     for (const exp of expectations) {
  60 |       if (!exp.received) {
  61 |         failures.push(`expected response { path: "${exp.path}", status: ${exp.status} } did not occur`);
  62 |       }
  63 |     }
  64 | 
> 65 |     expect(failures).toEqual([]);
     |                      ^ Error: expect(received).toEqual(expected) // deep equality
  66 |   },
  67 | });
  68 | 
  69 | export { expect };
  70 | 
```