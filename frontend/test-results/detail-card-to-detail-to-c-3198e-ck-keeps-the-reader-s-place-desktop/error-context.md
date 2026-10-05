# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: detail.spec.ts >> card to detail to context to download and back keeps the reader's place
- Location: tests\e2e\detail.spec.ts:266:1

# Error details

```
Error: expect(locator).toBeInViewport() failed

Locator:  getByTestId('context-highlight')
Expected: in viewport
Received: viewport ratio 0
Timeout:  5000ms

Call log:
  - Expect "toBeInViewport" getByTestId('context-highlight') with timeout 5000ms
  - waiting for getByTestId('context-highlight')
    14 × locator resolved to <div aria-hidden="true" data-device="mobile" data-testid="context-highlight" class="pointer-events-none absolute rounded-sm border-2 border-primary bg-primary/20 outline-none"></div>
       - unexpected value "viewport ratio 0"

```

# Page snapshot

```yaml
- generic:
  - generic:
    - generic:
      - link [aria-hidden]:
        - /url: "#main-content"
        - text: Skip to content
      - banner [aria-hidden]:
        - generic:
          - link:
            - /url: /en
            - text: ntspire
          - navigation:
            - link:
              - /url: /en/explore
              - text: Explore
            - link:
              - /url: /en/sources
              - text: Websites
            - link:
              - /url: /en/pages
              - text: Pages
            - link:
              - /url: /en/explore
              - text: Sections
            - link:
              - /url: /en/explore?device=mobile
              - text: Mobile
            - link:
              - /url: /en/categories
              - text: Categories
            - button:
              - generic: Search
          - generic:
            - button
            - button: Sign in
      - main:
        - generic:
          - article:
            - navigation [aria-hidden]:
              - list:
                - listitem:
                  - link:
                    - /url: /en/sources
                    - text: Sources
                - listitem [aria-hidden]
                - listitem:
                  - link:
                    - /url: /en/sources/flowbase
                    - text: Flowbase
                - listitem [aria-hidden]
                - listitem:
                  - link:
                    - /url: /en/pages/flowbase-home
                    - text: Flowbase product homepage
                - listitem [aria-hidden]
                - listitem:
                  - link [disabled]: Everything in one connected workspace
            - generic [aria-hidden]:
              - paragraph: Features
              - heading [level=1]: Everything in one connected workspace
            - generic [aria-hidden]:
              - generic:
                - radiogroup:
                  - radio: Desktop
                  - radio [checked]: Mobile
                - figure:
                  - generic: Mobile capture
                - group:
                  - button:
                    - generic: Save
                  - button: Save as image
                  - button: Send to Figma
                  - button [expanded]: View in context
              - complementary:
                - generic:
                  - generic:
                    - term: Language
                    - definition: English
                  - generic:
                    - term: Direction
                    - definition: Left to right
                  - generic:
                    - term: Devices
                    - definition: Desktop and mobile
                  - generic:
                    - term: Industry
                    - definition: SaaS
                  - generic:
                    - term: Style
                    - definition: Modern
                  - generic:
                    - term: Captured
                    - definition: January 8, 2024
                  - generic:
                    - term: Attribution
                    - definition: Flowbase
                - list:
                  - listitem:
                    - generic: workflow
                  - listitem:
                    - generic: dashboard
                  - listitem:
                    - generic: collaboration
                - generic:
                  - heading [level=2]: About the source
                  - paragraph: A focused workspace for product teams.
                  - generic:
                    - link:
                      - /url: /en/sources/flowbase
                      - text: View source
                    - link:
                      - /url: /en/pages/flowbase-home
                      - text: View page
            - generic:
              - heading "No similar sections yet" [level=2]
              - paragraph: This is the only reference of its type and industry in the library so far.
      - contentinfo [aria-hidden]:
        - generic:
          - generic:
            - link:
              - /url: /en
              - generic: ntspire
            - paragraph: Independent references for thoughtful digital work.
          - generic:
            - navigation:
              - heading [level=2]: Library
              - list:
                - listitem:
                  - link:
                    - /url: /en
                    - text: Home
            - paragraph: © ntspire
    - region "Notifications alt+T"
  - alert: Everything in one connected workspace — ntspire
  - dialog [ref=e2]:
    - generic [ref=e3]:
      - heading "Page context" [level=2] [ref=e4]
      - paragraph [ref=e5]: The highlighted band is where this section sits on the page it was captured from.
    - paragraph [ref=e6]: "This section: Everything in one connected workspace"
    - group "Page context" [active] [ref=e7]:
      - img "Flowbase product homepage" [ref=e9]
    - generic [ref=e10]:
      - heading "Other sections on this page" [level=3] [ref=e11]
      - list [ref=e12]:
        - listitem [ref=e13]:
          - link "Product navigation" [ref=e14] [cursor=pointer]:
            - /url: /en/sections/section-flowbase-home-1
        - listitem [ref=e15]:
          - link "The product development system" [ref=e16] [cursor=pointer]:
            - /url: /en/sections/section-flowbase-home-2
    - button "Close context view" [ref=e18]
    - button "Close context view" [ref=e19]
```

# Test source

```ts
  188 |   await expect(preview(cleanPage)).toHaveAttribute("src", /crop-section-cloudloom-browser-1-mobile\.svg/);
  189 | });
  190 | 
  191 | test("a page detail highlights each section's region for the device being shown", async ({ cleanPage }) => {
  192 |   await cleanPage.goto(PAGE_PATH);
  193 | 
  194 |   await expect(cleanPage.getByRole("heading", { level: 1, name: "Flowbase product homepage" })).toBeVisible();
  195 |   await expect(cleanPage.getByTestId("page-region")).toHaveCount(3);
  196 | 
  197 |   // The bands are placed in catalogue order, top to bottom.
  198 |   const tops = await cleanPage.getByTestId("page-region").evaluateAll((regions) =>
  199 |     regions.map((region) => Number.parseFloat((region as HTMLElement).style.top)),
  200 |   );
  201 |   expect(tops).toEqual([...tops].sort((a, b) => a - b));
  202 |   for (const region of await cleanPage.getByTestId("page-region").all()) {
  203 |     const box = await region.evaluate((element) => {
  204 |       const style = (element as HTMLElement).style;
  205 |       return {
  206 |         top: Number.parseFloat(style.top),
  207 |         height: Number.parseFloat(style.height),
  208 |         left: Number.parseFloat(style.left),
  209 |         width: Number.parseFloat(style.width),
  210 |       };
  211 |     });
  212 |     expect(box.top).toBeGreaterThanOrEqual(0);
  213 |     expect(box.left).toBeGreaterThanOrEqual(0);
  214 |     expect(box.top + box.height).toBeLessThanOrEqual(100);
  215 |     expect(box.left + box.width).toBeLessThanOrEqual(100);
  216 |   }
  217 | 
  218 |   const desktopCapture = cleanPage.getByTestId("page-region").first();
  219 |   const desktopBox = await desktopCapture.boundingBox();
  220 | 
  221 |   await cleanPage.getByRole("radio", { name: "Mobile", exact: true }).click();
  222 |   await expect(cleanPage.getByRole("radio", { name: "Mobile", exact: true })).toBeChecked();
  223 |   await expect(cleanPage).toHaveURL(`${PAGE_PATH}?device=mobile`);
  224 |   // The mobile page capture is its own asset, and each region is re-measured
  225 |   // against it: the bands are never carried over from the desktop screenshot.
  226 |   await expect(cleanPage.locator('img[src*="page-flowbase-home-mobile.svg"]')).toBeVisible();
  227 |   await expect(cleanPage.locator('img[src*="page-flowbase-home-desktop.svg"]')).toHaveCount(0);
  228 |   await expect(cleanPage.getByTestId("page-region").first()).toBeVisible();
  229 |   const mobileBox = await cleanPage.getByTestId("page-region").first().boundingBox();
  230 |   expect(mobileBox?.y).not.toBe(desktopBox?.y);
  231 | 
  232 |   // Every catalogued section is one click away, and the source is one up.
  233 |   await expect(cleanPage.getByRole("link", { name: /Product navigation/ })).toHaveAttribute(
  234 |     "href",
  235 |     "/en/sections/section-flowbase-home-1",
  236 |   );
  237 |   await expect(cleanPage.getByRole("link", { name: "View source" })).toHaveAttribute("href", SOURCE_PATH);
  238 |   await expect(factValue(cleanPage, "Path")).toHaveText("/");
  239 | });
  240 | 
  241 | test("a source detail lists its pages and sections with their attribution", async ({ cleanPage }) => {
  242 |   await cleanPage.goto(SOURCE_PATH);
  243 | 
  244 |   await expect(cleanPage.getByRole("heading", { level: 1, name: "Flowbase" })).toBeVisible();
  245 |   await expect(cleanPage.getByText("A focused workspace for product teams.")).toBeVisible();
  246 | 
  247 |   // The label names the noun, so the counts carry no unit.
  248 |   await expect(factValue(cleanPage, "Pages")).toHaveText("2");
  249 |   await expect(factValue(cleanPage, "Sections")).toHaveText("6");
  250 |   await expect(factValue(cleanPage, "Industry")).toHaveText("SaaS");
  251 |   await expect(factValue(cleanPage, "Attribution")).toHaveText("Flowbase");
  252 | 
  253 |   const pages = cleanPage.getByRole("region", { name: "Pages" });
  254 |   await expect(pages.getByRole("link", { name: /Flowbase product homepage/ })).toHaveAttribute("href", PAGE_PATH);
  255 |   await expect(pages.getByRole("link", { name: /Flowbase pricing/ })).toHaveAttribute(
  256 |     "href",
  257 |     "/en/pages/flowbase-pricing",
  258 |   );
  259 | 
  260 |   const sections = cleanPage.getByRole("region", { name: "Sections" });
  261 |   await expect(sections.getByRole("link", { name: /^Open reference: / })).toHaveCount(6);
  262 | 
  263 |   await scanAccessibility(cleanPage, SOURCE_PATH);
  264 | });
  265 | 
  266 | test("card to detail to context to download and back keeps the reader's place", async ({ cleanPage }) => {
  267 |   // 1. A card created in Phase 04 opens its section.
  268 |   await cleanPage.goto(PAGE_PATH);
  269 |   await cleanPage.getByRole("link", { name: /Everything in one connected workspace/ }).click();
  270 |   await expect(cleanPage).toHaveURL(SECTION_PATH);
  271 |   await expect(cleanPage.getByRole("heading", { level: 1, name: "Everything in one connected workspace" })).toBeVisible();
  272 | 
  273 |   // 2. Switch device. The switch replaces rather than pushes, so Back still
  274 |   //    points at the page detail the reader came from.
  275 |   await cleanPage.getByRole("radio", { name: "Mobile", exact: true }).click();
  276 |   await expect(cleanPage).toHaveURL(`${SECTION_PATH}?device=mobile`);
  277 | 
  278 |   // 3. View in context: the mobile crop on the mobile page capture.
  279 |   await cleanPage.getByRole("button", { name: "View in context" }).click();
  280 |   const dialog = cleanPage.getByTestId("context-dialog");
  281 |   await expect(dialog).toBeVisible();
  282 |   await expect(contextHighlight(cleanPage)).toHaveAttribute("data-device", "mobile");
  283 |   await expect(dialog.locator('img[src*="page-flowbase-home-mobile.svg"]')).toBeVisible();
  284 | 
  285 |   const scroller = cleanPage.getByTestId("context-scroll");
  286 |   // The band is scrolled into view rather than left below the fold, and the
  287 |   // frame takes focus so the region is keyboard scrollable.
> 288 |   await expect(contextHighlight(cleanPage)).toBeInViewport({ ratio: 0.1 });
      |                                             ^ Error: expect(locator).toBeInViewport() failed
  289 |   await expect(scroller).toBeFocused();
  290 |   const { scrollTop, scrollHeight, clientHeight } = await scroller.evaluate((element) => ({
  291 |     scrollTop: element.scrollTop,
  292 |     scrollHeight: element.scrollHeight,
  293 |     clientHeight: element.clientHeight,
  294 |   }));
  295 |   // When the capture is taller than the frame, reaching the band required a scroll.
  296 |   if (scrollHeight > clientHeight) expect(scrollTop).toBeGreaterThan(0);
  297 | 
  298 |   // 4. Another section on the page is reachable from inside the context view.
  299 |   await expect(dialog.getByRole("link", { name: "Product navigation" })).toHaveAttribute(
  300 |     "href",
  301 |     "/en/sections/section-flowbase-home-1",
  302 |   );
  303 |   await cleanPage.getByTestId("context-close").click();
  304 |   await expect(dialog).toBeHidden();
  305 | 
  306 |   // 5. Save as image downloads the mobile asset under its device-qualified name.
  307 |   const download = cleanPage.waitForEvent("download");
  308 |   await cleanPage.getByTestId("download-action").click();
  309 |   expect((await download).suggestedFilename()).toBe("ntspire-flowbase-features-mobile.svg");
  310 | 
  311 |   await scanAccessibility(cleanPage, `${SECTION_PATH} (after a download)`);
  312 | 
  313 |   // 6. Back returns to the originating page, not to the device switch.
  314 |   await cleanPage.goBack();
  315 |   await expect(cleanPage).toHaveURL(PAGE_PATH);
  316 |   await expect(cleanPage.getByRole("heading", { level: 1, name: "Flowbase product homepage" })).toBeVisible();
  317 | });
  318 | 
  319 | test("the desktop crop downloads under its own name", async ({ cleanPage }) => {
  320 |   await cleanPage.goto(SECTION_PATH);
  321 | 
  322 |   const download = cleanPage.waitForEvent("download");
  323 |   await cleanPage.getByTestId("download-action").click();
  324 |   // Same section, different device, different file: the two can never collide.
  325 |   expect((await download).suggestedFilename()).toBe("ntspire-flowbase-features-desktop.svg");
  326 | });
  327 | 
  328 | test("Send to Figma says the integration is not connected and sends nothing", async ({ cleanPage }) => {
  329 |   const external: string[] = [];
  330 |   cleanPage.on("request", (request) => {
  331 |     if (/figma/i.test(request.url())) external.push(request.url());
  332 |   });
  333 | 
  334 |   await cleanPage.goto(SECTION_PATH);
  335 |   await cleanPage.getByTestId("figma-action").click();
  336 | 
  337 |   const dialog = cleanPage.getByTestId("figma-dialog");
  338 |   await expect(dialog).toBeVisible();
  339 |   await expect(dialog.getByRole("heading", { name: "Figma export is not connected yet" })).toBeVisible();
  340 |   await expect(dialog).toContainText("ntspire has no Figma integration yet, so nothing was sent.");
  341 |   // Nothing claims success, and there is somewhere to go: closing it.
  342 |   await expect(dialog.getByRole("link")).toHaveCount(0);
  343 |   expect(await dialog.locator('a[href*="figma.com"]').count()).toBe(0);
  344 | 
  345 |   await cleanPage.getByTestId("figma-dialog").getByRole("button", { name: "Close" }).last().click();
  346 |   await expect(dialog).toBeHidden();
  347 |   expect(external).toEqual([]);
  348 | });
  349 | 
  350 | test("every level of the flow links both up and down", async ({ cleanPage }, testInfo) => {
  351 |   // Detail to detail.
  352 |   await cleanPage.goto(SECTION_PATH);
  353 |   await cleanPage.getByRole("link", { name: "View source" }).click();
  354 |   await expect(cleanPage).toHaveURL(SOURCE_PATH);
  355 |   await cleanPage.getByRole("link", { name: /Flowbase product homepage/ }).click();
  356 |   await expect(cleanPage).toHaveURL(PAGE_PATH);
  357 |   await cleanPage.getByRole("link", { name: /Everything in one connected workspace/ }).click();
  358 |   await expect(cleanPage).toHaveURL(SECTION_PATH);
  359 | 
  360 |   // Breadcrumb back up, one level at a time.
  361 |   const crumbs = cleanPage.getByRole("navigation", { name: "Breadcrumb" });
  362 |   await crumbs.getByRole("link", { name: "Flowbase product homepage", exact: true }).click();
  363 |   await expect(cleanPage).toHaveURL(PAGE_PATH);
  364 |   await crumbs.getByRole("link", { name: "Flowbase", exact: true }).click();
  365 |   await expect(cleanPage).toHaveURL(SOURCE_PATH);
  366 |   await crumbs.getByRole("link", { name: "Sources", exact: true }).click();
  367 |   await expect(cleanPage).toHaveURL("/en/sources");
  368 | 
  369 |   // The shell reaches every index, and none of them is a dead end.
  370 |   await cleanPage.goto("/en");
  371 |   const links = [
  372 |     { label: "Explore", href: "/en/explore" },
  373 |     { label: "Websites", href: "/en/sources" },
  374 |     { label: "Pages", href: "/en/pages" },
  375 |     { label: "Categories", href: "/en/categories" },
  376 |   ];
  377 |   // The header nav is desktop-only; below `lg` the same entries live in the menu.
  378 |   const nav = testInfo.project.name === "mobile"
  379 |     ? await (async () => {
  380 |         await cleanPage.getByRole("button", { name: "Open navigation menu" }).click();
  381 |         return cleanPage.getByRole("dialog").getByRole("navigation", { name: "Primary navigation" });
  382 |       })()
  383 |     : cleanPage.getByRole("navigation", { name: "Primary navigation" });
  384 |   for (const entry of links) {
  385 |     await expect(nav.getByRole("link", { name: entry.label, exact: true })).toHaveAttribute("href", entry.href);
  386 |   }
  387 | 
  388 |   // The Explore sidebar's Discover entry points at the source index, not at a
```