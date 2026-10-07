# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: explore.spec.ts >> Quick View is image-only, independent, accessible, and dismissible
- Location: tests\e2e\explore.spec.ts:269:1

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 1
Received:    187.546875
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
          - generic:
            - generic:
              - button
            - button: Sign in
            - button
      - main:
        - generic:
          - generic:
            - heading [level=1] [aria-hidden]: Explore references
            - generic:
              - generic:
                - generic:
                  - generic:
                    - button [aria-hidden]: Filters
                    - paragraph: Showing 12 of 42 references
                  - generic [aria-hidden]:
                    - generic: Sort by
                    - combobox
                - region [aria-hidden]:
                  - generic:
                    - article:
                      - link:
                        - /url: /en/sections/section-papercrane-collaboration-1
                        - generic: "Open reference: Nothing great is made alone"
                      - generic:
                        - paragraph: Hero · Papercrane
                      - link:
                        - /url: /en/sources/papercrane
                        - text: P
                      - group [ref=e1]:
                        - button [ref=e2]
                        - button [expanded] [ref=e3]
                    - article:
                      - link:
                        - /url: /en/sections/section-papercrane-collaboration-2
                        - generic: "Open reference: Bring everyone into the process"
                      - generic:
                        - paragraph: Team · Papercrane
                      - link:
                        - /url: /en/sources/papercrane
                        - text: P
                      - group [ref=e4]:
                        - button [ref=e5]
                        - button [ref=e6]
                    - article:
                      - link:
                        - /url: /en/sections/section-papercrane-collaboration-3
                        - generic: "Open reference: Start designing together"
                      - generic:
                        - paragraph: Signup · Papercrane
                      - link:
                        - /url: /en/sources/papercrane
                        - text: P
                      - group [ref=e7]:
                        - button [ref=e8]
                        - button [ref=e9]
                    - article:
                      - link:
                        - /url: /en/sections/section-papercrane-config-1
                        - generic: "Open reference: Your design profile"
                      - generic:
                        - paragraph: Profile · Papercrane
                      - link:
                        - /url: /en/sources/papercrane
                        - text: P
                      - group [ref=e10]:
                        - button [ref=e11]
                        - button [ref=e12]
                    - article:
                      - link:
                        - /url: /en/sections/section-papercrane-config-2
                        - generic: "Open reference: Workspace preferences"
                      - generic:
                        - paragraph: Settings · Papercrane
                      - link:
                        - /url: /en/sources/papercrane
                        - text: P
                      - group [ref=e13]:
                        - button [ref=e14]
                        - button [ref=e15]
                    - article:
                      - link:
                        - /url: /en/sections/section-papercrane-config-3
                        - generic: "Open reference: Welcome back to Papercrane"
                      - generic:
                        - paragraph: Login · Papercrane
                      - link:
                        - /url: /en/sources/papercrane
                        - text: P
                      - group [ref=e16]:
                        - button [ref=e17]
                        - button [ref=e18]
                    - article:
                      - link:
                        - /url: /en/sections/section-rafif-store-1
                        - generic: "Open reference: أنشئ متجرك في دقائق"
                      - generic:
                        - paragraph: Hero · رفيف
                      - link:
                        - /url: /en/sources/rafif
                        - text: ر
                      - group [ref=e19]:
                        - button [ref=e20]
                        - button [ref=e21]
                    - article:
                      - link:
                        - /url: /en/sections/section-rafif-store-2
                        - generic: "Open reference: اختر خطتك"
                      - generic:
                        - paragraph: Pricing · رفيف
                      - link:
                        - /url: /en/sources/rafif
                        - text: ر
                      - group [ref=e22]:
                        - button [ref=e23]
                        - button [ref=e24]
                    - article:
                      - link:
                        - /url: /en/sections/section-rafif-store-3
                        - generic: "Open reference: قصص نجاح التجار"
                      - generic:
                        - paragraph: Testimonials · رفيف
                      - link:
                        - /url: /en/sources/rafif
                        - text: ر
                      - group [ref=e25]:
                        - button [ref=e26]
                        - button [ref=e27]
                    - article:
                      - link:
                        - /url: /en/sections/section-subul-mobility-1
                        - generic: "Open reference: كل مشاويرك في مكان واحد"
                      - generic:
                        - paragraph: Hero · سبل
                      - link:
                        - /url: /en/sources/subul
                        - text: س
                      - group [ref=e28]:
                        - button [ref=e29]
                        - button [ref=e30]
                    - article:
                      - link:
                        - /url: /en/sections/section-subul-mobility-2
                        - generic: "Open reference: نحن في خدمتك"
                      - generic:
                        - paragraph: Stats · سبل
                      - link:
                        - /url: /en/sources/subul
                        - text: س
                      - group [ref=e31]:
                        - button [ref=e32]
                        - button [ref=e33]
                    - article:
                      - link:
                        - /url: /en/sections/section-subul-mobility-3
                        - generic: "Open reference: ابدأ رحلتك الآن"
                      - generic:
                        - paragraph: Call to action · سبل
                      - link:
                        - /url: /en/sources/subul
                        - text: س
                      - group [ref=e34]:
                        - button [ref=e35]
                        - button [ref=e36]
                - generic [aria-hidden]:
                  - button: Load more
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
  - alert
  - dialog [ref=e38]:
    - 'heading "Quick view: Nothing great is made alone" [level=2] [ref=e39]'
    - 'img "Papercrane: Nothing great is made alone" [ref=e40]'
    - button "Close" [active] [ref=e41]
```

# Test source

```ts
  184 |   await cleanPage.goto("/en/explore");
  185 |   if (testInfo.project.name === "desktop") {
  186 |     await expect(cleanPage.getByRole("button", { name: "Search", exact: true })).toHaveCount(1);
  187 |     return;
  188 |   }
  189 | 
  190 |   await cleanPage.getByRole("button", { name: "Open navigation menu" }).click();
  191 |   const menu = cleanPage.getByRole("dialog");
  192 |   const searchTrigger = menu.getByRole("button", { name: "Search", exact: true });
  193 |   await expect(searchTrigger).toHaveCount(1);
  194 |   await searchTrigger.click();
  195 |   await expect(cleanPage.getByRole("dialog", { name: "Search" })).toBeVisible();
  196 | });
  197 | 
  198 | test("the source avatar opens the Source page without opening the Section modal", async ({ cleanPage }) => {
  199 |   await cleanPage.goto("/en/explore");
  200 |   const card = cleanPage.locator("article").first();
  201 |   const sourceLink = card.getByRole("link", { name: /^View source:/ });
  202 |   const sourceHref = await sourceLink.getAttribute("href");
  203 | 
  204 |   await sourceLink.click();
  205 |   await expect(cleanPage).toHaveURL(new RegExp(`${sourceHref}$`));
  206 |   await expect(cleanPage.getByRole("heading", { level: 1 })).toBeVisible();
  207 |   await expect(cleanPage.getByRole("dialog")).toHaveCount(0);
  208 | });
  209 | 
  210 | test("card body opens the Section modal with adjacent Explore results and restores focus", async ({ cleanPage }) => {
  211 |   await cleanPage.goto("/en/explore?sort=latest");
  212 |   const firstCard = cleanPage.locator("article").first();
  213 |   const firstOpen = firstCard.getByRole("link", { name: /^Open reference:/ });
  214 |   const firstHref = await firstOpen.getAttribute("href");
  215 |   expect(firstHref).toBeTruthy();
  216 | 
  217 |   const firstUrl = new URL(firstHref!, cleanPage.url());
  218 |   const resultParams = new URLSearchParams(firstUrl.searchParams);
  219 |   resultParams.set("locale", "en");
  220 |   const resultResponse = await cleanPage.request.get(`/api/explore?${resultParams.toString()}`);
  221 |   expect(resultResponse.status()).toBe(200);
  222 |   const resultSet = await resultResponse.json() as { data: { items: Array<{ id: string }> } };
  223 |   const currentId = firstUrl.pathname.split("/").at(-1)!;
  224 |   const currentIndex = resultSet.data.items.findIndex((item) => item.id === currentId);
  225 |   expect(currentIndex).toBeGreaterThanOrEqual(0);
  226 |   const expectedNextId = resultSet.data.items[currentIndex + 1]?.id;
  227 |   expect(expectedNextId).toBeTruthy();
  228 | 
  229 |   await firstOpen.click();
  230 |   const dialog = cleanPage.getByRole("dialog");
  231 |   await expect(dialog).toBeVisible();
  232 |   await expect(cleanPage).toHaveURL(firstHref!);
  233 |   await expect(dialog.getByRole("heading", { level: 1 })).toBeVisible();
  234 |   await expect(dialog.getByRole("radiogroup", { name: "Preview device" })).toBeVisible();
  235 |   const detailActions = dialog.getByRole("group", { name: "Reference actions" }).first();
  236 |   for (const label of ["Save reference", "Save as image", "Send to Figma", "View in context"]) {
  237 |     await expect(detailActions.getByRole("button", { name: label })).toBeVisible();
  238 |   }
  239 | 
  240 |   const violations = await expectAccessible(cleanPage);
  241 |   expect(violations, JSON.stringify(violations.map(({ id, help }) => ({ id, help })))).toEqual([]);
  242 | 
  243 |   await dialog.getByRole("link", { name: "Next reference" }).click();
  244 |   await expect(cleanPage).toHaveURL(new RegExp(`/sections/${expectedNextId}\\?sort=latest$`));
  245 |   await expect(dialog).toBeVisible();
  246 |   await dialog.getByRole("link", { name: "Previous reference" }).click();
  247 |   await expect(cleanPage).toHaveURL(firstHref!);
  248 |   await expect(dialog).toBeVisible();
  249 | 
  250 |   await dialog.getByRole("button", { name: "Close", exact: true }).click();
  251 |   await expect(dialog).toHaveCount(0);
  252 |   await expect(cleanPage).toHaveURL("/en/explore?sort=latest");
  253 |   await expect(firstOpen).toBeFocused();
  254 | 
  255 |   await firstOpen.click();
  256 |   await expect(cleanPage.getByRole("dialog")).toBeVisible();
  257 |   await cleanPage.keyboard.press("Escape");
  258 |   await expect(cleanPage.getByRole("dialog")).toHaveCount(0);
  259 |   await expect(firstOpen).toBeFocused();
  260 | 
  261 |   await firstOpen.click();
  262 |   const outsideClick = cleanPage.locator('[data-slot="dialog-overlay"]').last();
  263 |   await expect(cleanPage.getByRole("dialog")).toBeVisible();
  264 |   await outsideClick.click({ position: { x: 3, y: 3 } });
  265 |   await expect(cleanPage.getByRole("dialog")).toHaveCount(0);
  266 |   await expect(firstOpen).toBeFocused();
  267 | });
  268 | 
  269 | test("Quick View is image-only, independent, accessible, and dismissible", async ({ cleanPage }, testInfo) => {
  270 |   await cleanPage.goto("/en/explore");
  271 |   const card = cleanPage.locator("article").first();
  272 |   if (testInfo.project.name === "desktop") await card.hover();
  273 |   const quickView = card.getByRole("button", { name: /^Quick view image:/ });
  274 |   const cardBounds = await card.boundingBox();
  275 |   await quickView.click();
  276 | 
  277 |   const dialog = cleanPage.getByRole("dialog", { name: /^Quick view:/ });
  278 |   await expect(dialog).toBeVisible();
  279 |   await expect(dialog.getByRole("img")).toBeVisible();
  280 |   await expect(dialog.getByRole("heading")).toHaveCount(1);
  281 |   await expect(dialog.getByText("Hero", { exact: true })).toHaveCount(0);
  282 |   await expect(cleanPage).toHaveURL(/\/en\/explore(?:\?|$)/);
  283 |   const afterBounds = await card.boundingBox();
> 284 |   expect(Math.abs((afterBounds?.height ?? 0) - (cardBounds?.height ?? 0))).toBeLessThanOrEqual(1);
      |                                                                            ^ Error: expect(received).toBeLessThanOrEqual(expected)
  285 | 
  286 |   const violations = await expectAccessible(cleanPage);
  287 |   expect(violations, JSON.stringify(violations.map(({ id, help }) => ({ id, help })))).toEqual([]);
  288 | 
  289 |   await cleanPage.keyboard.press("Escape");
  290 |   await expect(dialog).toHaveCount(0);
  291 |   await expect(quickView).toBeFocused();
  292 | 
  293 |   await quickView.click();
  294 |   await expect(dialog).toBeVisible();
  295 |   await cleanPage.locator('[data-slot="dialog-overlay"]').last().click({ position: { x: 3, y: 3 } });
  296 |   await expect(dialog).toHaveCount(0);
  297 |   await expect(quickView).toBeFocused();
  298 | });
  299 | 
  300 | test("a cold Section URL renders the standalone detail page, not a modal", async ({ cleanPage }) => {
  301 |   await cleanPage.goto("/en/sections/section-flowbase-home-3");
  302 |   await expect(cleanPage.getByRole("heading", { level: 1, name: "Everything in one connected workspace" })).toBeVisible();
  303 |   await expect(cleanPage.getByRole("dialog")).toHaveCount(0);
  304 | });
  305 | 
  306 | test("Load more appends pages and reaches a stable end state", async ({ cleanPage }) => {
  307 |   await cleanPage.goto("/en/explore");
  308 |   for (const count of [24, 36, 42]) {
  309 |     await cleanPage.getByRole("button", { name: "Load more" }).click();
  310 |     await expect(cleanPage.getByText(`Showing ${count} of 42 references`)).toBeVisible();
  311 |   }
  312 |   await expect(cleanPage.getByText("You have reached the end of the results.")).toBeVisible();
  313 |   await expect(cleanPage.getByRole("button", { name: "Load more" })).toHaveCount(0);
  314 | });
  315 | 
  316 | test("loading, empty, and retryable error states follow mock query modes", async ({ cleanPage }, testInfo) => {
  317 |   const viewport = testInfo.project.name;
  318 |   const navigation = cleanPage.goto("/en/explore?__mock=slow", { waitUntil: "commit" });
  319 |   await expect(cleanPage.getByRole("status").first()).toBeVisible();
  320 |   await navigation;
  321 |   await expect(cleanPage.getByText("Showing 12 of 42 references")).toBeVisible();
  322 | 
  323 |   await cleanPage.goto("/en/explore?__mock=empty");
  324 |   await expect(cleanPage.getByRole("heading", { name: "No references match these filters" })).toBeVisible();
  325 |   await openSidebar(cleanPage, viewport);
  326 |   await expect(sidebar(cleanPage, viewport).getByRole("region", { name: "Industries" })).toBeVisible();
  327 |   if (viewport === "mobile") await cleanPage.keyboard.press("Escape");
  328 |   await cleanPage.getByRole("button", { name: "Clear filters" }).click();
  329 |   await expect(cleanPage).toHaveURL("/en/explore");
  330 |   await expect(cleanPage.getByText("Showing 12 of 42 references")).toBeVisible();
  331 | 
  332 |   await cleanPage.goto("/en/explore?__mock=error");
  333 |   await expect(cleanPage.getByRole("heading", { name: "Explore could not load" })).toBeVisible();
  334 |   await expect(cleanPage.getByRole("button", { name: "Try again" })).toBeVisible();
  335 |   await cleanPage.getByRole("button", { name: "Try again" }).click();
  336 |   await expect(cleanPage.getByText("Showing 12 of 42 references")).toBeVisible();
  337 | });
  338 | 
```