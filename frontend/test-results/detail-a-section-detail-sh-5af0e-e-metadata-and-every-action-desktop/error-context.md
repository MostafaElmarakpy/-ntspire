# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: detail.spec.ts >> a section detail shows its provenance, metadata and every action
- Location: tests\e2e\detail.spec.ts:100:1

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: locator('dl > div').filter({ has: locator('dt').filter({ hasText: /^Source$/ }) }).locator('dd')
Expected: "Flowbase"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveText" locator('dl > div').filter({ has: locator('dt').filter({ hasText: /^Source$/ }) }).locator('dd') with timeout 5000ms
  - waiting for locator('dl > div').filter({ has: locator('dt').filter({ hasText: /^Source$/ }) }).locator('dd')

```

```yaml
- link "Skip to content":
  - /url: "#main-content"
- banner:
  - link "Home":
    - /url: /en
    - text: ntspire
  - navigation "Primary navigation":
    - link "Explore":
      - /url: /en/explore
    - link "Websites":
      - /url: /en/sources
    - link "Pages":
      - /url: /en/pages
    - link "Sections":
      - /url: /en/explore
    - link "Mobile":
      - /url: /en/explore?device=mobile
    - link "Categories":
      - /url: /en/categories
    - button "Search"
  - button "Search"
  - button "Sign in"
- main:
  - article:
    - navigation "Breadcrumb":
      - list:
        - listitem:
          - link "Sources":
            - /url: /en/sources
        - listitem:
          - link "Flowbase":
            - /url: /en/sources/flowbase
        - listitem:
          - link "Flowbase product homepage":
            - /url: /en/pages/flowbase-home
        - listitem:
          - link "Everything in one connected workspace" [disabled]
    - paragraph: Features
    - heading "Everything in one connected workspace" [level=1]
    - radiogroup "Preview device":
      - radio "Desktop" [checked]
      - radio "Mobile"
    - figure:
      - 'img "Flowbase: Everything in one connected workspace"'
    - group "Reference actions":
      - button "Save reference": Save
      - button "Save as image"
      - button "Send to Figma"
      - button "View in context"
    - complementary:
      - term: Language
      - definition: English
      - term: Direction
      - definition: Left to right
      - term: Devices
      - definition: Desktop and mobile
      - term: Industry
      - definition: SaaS
      - term: Style
      - definition: Modern
      - term: Captured
      - definition: January 8, 2024
      - term: Attribution
      - definition: Flowbase
      - list "Reference tags":
        - listitem: workflow
        - listitem: dashboard
        - listitem: collaboration
      - heading "About the source" [level=2]
      - paragraph: A focused workspace for product teams.
      - link "View source":
        - /url: /en/sources/flowbase
      - link "View page":
        - /url: /en/pages/flowbase-home
    - heading "No similar sections yet" [level=2]
    - paragraph: This is the only reference of its type and industry in the library so far.
- contentinfo "ntspire footer":
  - link "Home":
    - /url: /en
    - text: ntspire
  - paragraph: Independent references for thoughtful digital work.
  - navigation "Footer navigation":
    - heading "Library" [level=2]
    - list:
      - listitem:
        - link "Home":
          - /url: /en
  - paragraph: © ntspire
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  15  |  *   cloudloom-browser mobile only
  16  |  *   nimbus-pay-home-2 is the one hero whose related set is exactly one section
  17  |  */
  18  | 
  19  | const SECTION_ID = "section-flowbase-home-3";
  20  | const SECTION_PATH = `/en/sections/${SECTION_ID}`;
  21  | const PAGE_PATH = "/en/pages/flowbase-home";
  22  | const SOURCE_PATH = "/en/sources/flowbase";
  23  | 
  24  | /** The section preview: the only `figure` on a section detail page. */
  25  | function preview(cleanPage: CleanPage): Locator {
  26  |   return cleanPage.locator("figure img").first();
  27  | }
  28  | 
  29  | function deviceSwitcher(cleanPage: CleanPage): Locator {
  30  |   return cleanPage.getByRole("radiogroup", { name: "Preview device" });
  31  | }
  32  | 
  33  | function contextHighlight(cleanPage: CleanPage): Locator {
  34  |   return cleanPage.getByTestId("context-highlight");
  35  | }
  36  | 
  37  | /** One `<dd>` out of a fact list, matched through its own `<dt>` label. */
  38  | function factValue(cleanPage: CleanPage, label: string): Locator {
  39  |   return cleanPage
  40  |     .locator("dl > div")
  41  |     .filter({ has: cleanPage.locator("dt", { hasText: new RegExp(`^${label}$`) }) })
  42  |     .locator("dd");
  43  | }
  44  | 
  45  | /**
  46  |  * Runs axe with CSS animations frozen.
  47  |  *
  48  |  * The dialogs fade in over 200ms, and a scan taken mid-fade blends the text and
  49  |  * its background through the partial opacity — reporting a contrast failure that
  50  |  * does not exist once the dialog settles. The persistent state is what has to
  51  |  * meet contrast, so the transient one is switched off rather than waited out.
  52  |  */
  53  | async function scanAccessibility(cleanPage: CleanPage, label: string): Promise<void> {
  54  |   await cleanPage.addStyleTag({
  55  |     content: "*, *::before, *::after { animation: none !important; transition: none !important; }",
  56  |   });
  57  |   const violations = await expectAccessible(cleanPage);
  58  |   expect(violations, `${label}: ${JSON.stringify(violations.map(({ id, help }) => ({ id, help })))}`).toEqual([]);
  59  | }
  60  | 
  61  | test("the index routes list what the library holds and link into it", async ({ cleanPage }) => {
  62  |   await cleanPage.goto("/en/sources");
  63  |   await expect(cleanPage.getByRole("heading", { level: 1, name: "Sources" })).toBeVisible();
  64  |   await expect(cleanPage.getByRole("link", { name: /^Open reference: / })).toHaveCount(10);
  65  |   await expect(cleanPage.getByRole("link", { name: "Open reference: Flowbase", exact: true })).toHaveAttribute(
  66  |     "href",
  67  |     SOURCE_PATH,
  68  |   );
  69  | 
  70  |   await cleanPage.goto("/en/pages");
  71  |   await expect(cleanPage.getByRole("heading", { level: 1, name: "Pages" })).toBeVisible();
  72  |   await expect(cleanPage.getByRole("link", { name: /^Open reference: / })).toHaveCount(14);
  73  |   await expect(
  74  |     cleanPage.getByRole("link", { name: "Open reference: Flowbase product homepage", exact: true }),
  75  |   ).toHaveAttribute("href", PAGE_PATH);
  76  | 
  77  |   await cleanPage.goto("/en/categories");
  78  |   await expect(cleanPage.getByRole("heading", { level: 1, name: "Categories" })).toBeVisible();
  79  |   for (const group of ["Industries", "Section type", "Style"]) {
  80  |     await expect(cleanPage.getByRole("region", { name: group })).toBeVisible();
  81  |   }
  82  |   // A category entry hands Explore exactly the filter it counts, spelled the
  83  |   // way Explore's own parser reads it.
  84  |   await expect(cleanPage.locator('a[href="/en/explore?industry=saas"]')).toBeVisible();
  85  |   await expect(cleanPage.locator('a[href="/en/explore?sectionType=hero"]')).toBeVisible();
  86  | });
  87  | 
  88  | test("an unknown section id, page slug or source slug is a real 404", async ({ cleanPage }) => {
  89  |   for (const path of ["/en/sections/not-a-section", "/en/pages/not-a-page", "/en/sources/not-a-source"]) {
  90  |     cleanPage.expectResponse({ path, status: 404 });
  91  |     const response = await cleanPage.goto(path);
  92  |     // The status matters as much as the page: a missing reference must not be
  93  |     // served as a 200 with a friendly message.
  94  |     expect(response?.status()).toBe(404);
  95  |     await expect(cleanPage.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
  96  |     await expect(cleanPage.locator("#main-content").getByRole("link", { name: "Explore" })).toBeVisible();
  97  |   }
  98  | });
  99  | 
  100 | test("a section detail shows its provenance, metadata and every action", async ({ cleanPage }) => {
  101 |   await cleanPage.goto(SECTION_PATH);
  102 | 
  103 |   await expect(cleanPage.getByRole("heading", { level: 1, name: "Everything in one connected workspace" })).toBeVisible();
  104 |   await expect(cleanPage.locator("main").getByText("Features", { exact: true })).toBeVisible();
  105 | 
  106 |   const crumbs = cleanPage.getByRole("navigation", { name: "Breadcrumb" });
  107 |   await expect(crumbs.getByRole("link", { name: "Sources", exact: true })).toHaveAttribute("href", "/en/sources");
  108 |   await expect(crumbs.getByRole("link", { name: "Flowbase", exact: true })).toHaveAttribute("href", SOURCE_PATH);
  109 |   await expect(crumbs.getByRole("link", { name: "Flowbase product homepage", exact: true })).toHaveAttribute(
  110 |     "href",
  111 |     PAGE_PATH,
  112 |   );
  113 |   await expect(crumbs.locator('[aria-current="page"]')).toHaveText("Everything in one connected workspace");
  114 | 
> 115 |   await expect(factValue(cleanPage, "Source")).toHaveText("Flowbase");
      |                                                ^ Error: expect(locator).toHaveText(expected) failed
  116 |   await expect(factValue(cleanPage, "Language")).toHaveText("English");
  117 |   await expect(factValue(cleanPage, "Direction")).toHaveText("Left to right");
  118 |   await expect(factValue(cleanPage, "Devices")).toHaveText("Desktop and mobile");
  119 |   await expect(factValue(cleanPage, "Industry")).toHaveText("SaaS");
  120 |   await expect(factValue(cleanPage, "Style")).toHaveText("Modern");
  121 |   await expect(factValue(cleanPage, "Captured")).toHaveText("January 8, 2024");
  122 |   await expect(factValue(cleanPage, "Attribution")).toHaveText("Flowbase");
  123 | 
  124 |   await expect(cleanPage.getByRole("complementary").getByRole("list", { name: "Reference tags" })).toBeVisible();
  125 | 
  126 |   const actions = cleanPage.getByRole("group", { name: "Reference actions" });
  127 |   for (const label of ["Save reference", "Save as image", "Send to Figma", "View in context"]) {
  128 |     await expect(actions.getByRole("button", { name: label })).toBeVisible();
  129 |   }
  130 | 
  131 |   // This section is the only one of its type and industry, so the honest
  132 |   // related state is the empty one.
  133 |   await expect(cleanPage.getByRole("heading", { name: "No similar sections yet" })).toBeVisible();
  134 | 
  135 |   await expect(cleanPage.getByRole("link", { name: "View source" })).toHaveAttribute("href", SOURCE_PATH);
  136 |   await expect(cleanPage.getByRole("link", { name: "View page" })).toHaveAttribute("href", PAGE_PATH);
  137 | });
  138 | 
  139 | test("related sections link to their own detail pages", async ({ cleanPage }) => {
  140 |   await cleanPage.goto("/en/sections/section-nimbus-pay-home-2");
  141 | 
  142 |   const related = cleanPage.getByRole("region", { name: "Similar sections" });
  143 |   await expect(related.getByRole("heading", { name: "Similar sections" })).toBeVisible();
  144 | 
  145 |   // Exactly one related section in the fixture. Its Open action is revealed on
  146 |   // hover, so the pointer has to be over the card before the action is clickable.
  147 |   const card = related.locator("article").first();
  148 |   await card.hover();
  149 |   const open = card.getByRole("link", { name: /^Open reference: / });
  150 |   await expect(open).toBeVisible();
  151 |   await open.click();
  152 |   await expect(cleanPage).toHaveURL("/en/sections/section-rafif-store-1");
  153 |   await expect(cleanPage.getByRole("heading", { level: 1, name: "أنشئ متجرك في دقائق" })).toBeVisible();
  154 | });
  155 | 
  156 | test("the device switcher shows each device's own capture and disables the one never taken", async ({ cleanPage }) => {
  157 |   await cleanPage.goto(SECTION_PATH);
  158 | 
  159 |   const switcher = deviceSwitcher(cleanPage);
  160 |   const desktop = switcher.getByRole("radio", { name: "Desktop", exact: true });
  161 |   const mobile = switcher.getByRole("radio", { name: "Mobile", exact: true });
  162 | 
  163 |   await expect(desktop).toBeChecked();
  164 |   await expect(preview(cleanPage)).toHaveAttribute("src", /crop-section-flowbase-home-3-desktop\.svg/);
  165 | 
  166 |   await mobile.click();
  167 |   await expect(mobile).toBeChecked();
  168 |   // The mobile view is the mobile crop, never the desktop one rescaled.
  169 |   await expect(preview(cleanPage)).toHaveAttribute("src", /crop-section-flowbase-home-3-mobile\.svg/);
  170 |   await expect(cleanPage).toHaveURL(`${SECTION_PATH}?device=mobile`);
  171 | 
  172 |   // The choice is request-scoped, so a cold visit to that URL opens on mobile.
  173 |   await cleanPage.goto(`${SECTION_PATH}?device=mobile`);
  174 |   await expect(preview(cleanPage)).toHaveAttribute("src", /crop-section-flowbase-home-3-mobile\.svg/);
  175 | 
  176 |   // Desktop-only: the mobile variant is offered as unavailable, not as a
  177 |   // control that silently keeps showing desktop coordinates.
  178 |   await cleanPage.goto("/en/sections/section-flowbase-pricing-1");
  179 |   await expect(deviceSwitcher(cleanPage).getByRole("radio", { name: /^Desktop/ })).toBeChecked();
  180 |   await expect(deviceSwitcher(cleanPage).getByRole("radio", { name: /^Mobile/ })).toBeDisabled();
  181 |   await expect(preview(cleanPage)).toHaveAttribute("src", /crop-section-flowbase-pricing-1-desktop\.svg/);
  182 |   expect(new URL(cleanPage.url()).searchParams.has("device")).toBe(false);
  183 | 
  184 |   // Mobile-only is the mirror image.
  185 |   await cleanPage.goto("/en/sections/section-cloudloom-browser-1");
  186 |   await expect(deviceSwitcher(cleanPage).getByRole("radio", { name: /^Mobile/ })).toBeChecked();
  187 |   await expect(deviceSwitcher(cleanPage).getByRole("radio", { name: /^Desktop/ })).toBeDisabled();
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
```