# Bug Fix Log

This file contains only real bugs discovered during development or testing.

### BUG-001 — Phase 03 shell runtime and responsive defects

- Status: Fixed
- Severity: Medium
- Area: Frontend shell, design-system route, accessibility
- Date: 2026-10-01
- Reproduction: Open `/en/dev/design-system`; inspect the 375px viewport and run axe.
- Expected: The route renders cleanly, fits mobile width, and has no serious/critical accessibility violations.
- Actual: The server/client boundary rejected an ErrorState callback (500); a hidden width-constrained target caused 20px overflow; inactive tabs missed AA contrast.
- Root Cause: An interactive retry handler crossed a Server Component boundary; the skip target reused the page Container; generated tab text used reduced-opacity foreground.
- Fix: Isolated ErrorState as a client leaf with self-contained retry, replaced the hidden Container with a plain target, and restored full-contrast inactive tab text.
- Tests: `ui-states.test.tsx`; `design-system.dev.spec.ts` at desktop/mobile including axe and 375px overflow.
- Notes: Final dev-route run passed all four tests with zero serious/critical axe violations.

### BUG-002 — Explore mock states unavailable in production e2e

- Status: Fixed
- Severity: Medium
- Area: Explore mock-state testing
- Date: 2026-10-03
- Reproduction: Open `/en/explore?__mock=empty` or `?__mock=error` under the production Playwright server.
- Expected: Explicit query modes drive the empty/error UI states for deterministic end-to-end testing.
- Actual: `mockConfig` ignored all mock controls in production, so the Explore state could not be exercised by the production e2e suite.
- Root Cause: Production handling returned `normal` before reading the explicit query mode.
- Fix: Continue ignoring environment-wide mock flags in production while honoring validated `?__mock=` query modes.
- Tests: `src/config/mock-config.test.ts`; `tests/e2e/explore.spec.ts` covers slow, empty, error, and retry modes.
- Notes: No external service or persistent mock configuration is enabled.

### BUG-003 — Dev e2e readiness did not wait for route compilation

- Status: Fixed
- Severity: Medium
- Area: Development Playwright server startup
- Date: 2026-10-03
- Reproduction: Run the full production e2e suite followed by the development suite on the slow workspace filesystem.
- Expected: The dev suite starts after its internal link targets are ready to answer requests.
- Actual: Port-only readiness could start tests while `/en` still needed a cold development compile, intermittently exceeding the unchanged 30-second request timeout.
- Root Cause: Playwright checked that port 3101 was accepting connections, not that the first route compiled and responded.
- Fix: Set the dev webServer readiness URL to `/en`, so Playwright waits for that route before starting tests.
- Tests: `playwright.dev.config.ts`; full `design-system.dev.spec.ts` suite passes 4/4 with the original timeout values.
- Notes: The route rendered successfully in isolated runs; no design-system or Explore route defect was found.

### BUG-004 — Phase 04 skipped, so Explore was built on CSS multi-columns

- Status: Fixed
- Severity: High
- Area: Gallery layout (Phase 04 / Phase 05)
- Date: 2026-10-03
- Reproduction: Open `/en/explore` in a 3- or 4-column viewport and compare the left-to-right positions of the first cards against the search-result ranking.
- Expected: The gallery is a true waterfall grid with shortest-column placement, and the highest-ranked references fill the top row in ranking order (`docs/prompts/04-masonry-cards-save.md` P4-01, P4-02; result ordering in `docs/product-spec.md`).
- Actual: Phase 04 was never implemented — the batch moved from Phase 03 straight to Phase 05 — so Explore rendered its results with Tailwind `columns-3`/`columns-4`. CSS multi-column balances by height, so ranked items 1, 2 and 3 could all land in the same column and the ranking order was not visible across the page.
- Root Cause: A missing prerequisite. Phase 05 was built against a gallery mechanism that Phase 04 was supposed to provide, and nothing detected the gap because Phase 05's own tests asserted only that columns rendered, never that column placement followed ranking order.
- Fix: Implemented the real Phase 04 scope (MasonryGrid with `distributeIntoColumns`, SaveService/MockSaveService/useSaved/SaveButton, PageCard/SourceCard, the dev gallery, and this phase's report), then made one scoped change to Explore: its results now render through the shared `MasonryGrid` instead of CSS `columns-*`. Explore's URL state, filters, sorting, pagination, mock states and accessibility behavior were not touched.
- Tests: `src/lib/masonry.test.ts` (placement, balance, breakpoints, RTL); `src/features/explore/explore-order.test.ts` targets this regression directly — it asserts the ranked order survives the column assignment (the first card of every column is one of results 1..n, and the top three never share a column); `tests/e2e/gallery.dev.spec.ts` asserts the 1440px top row is ranked items 1-4. The whole Phase 05 suite was then re-run unchanged and still passes.
- Notes: `ExploreSectionCard` was kept so the correction stayed limited to the rendering mechanism; Explore adopts the Phase 04 `SectionCard` (Save + Open) when Phase 07 wires the detail route.

### BUG-005 — Mock Source names were real companies

- Status: Fixed
- Severity: Medium
- Area: Mock fixture content (Phase 02 fixtures, generated assets, tests)
- Date: 2026-10-03
- Reproduction: Inspect `frontend/src/mocks/mock-manifest.json` — `sources[].name`, `sources[].url`, `attribution`, and page titles such as "Linear product homepage".
- Expected: `docs/prompts/00-global-rules.md` § "Mock data content rules": mock Source names must be realistic but fictional and never the name of a real, identifiable company, product or website. The rule applies everywhere mock content is generated or referenced — fixture data, generated SVG filenames and content, page titles, attribution text, and test fixtures/assertions.
- Actual: All ten mock sources used real company names (Linear, Revolut, Notion, Arc Browser, Airtable, Patagonia, Figma, plus Arabic-market brands). Because the fixture ids were derived from those names, the branding also reached the generated SVG filenames and the page and section titles written into the SVG bodies, and it was asserted directly in `src/lib/query-engine.test.ts` and `src/mocks/services.test.ts`.
- Root Cause: The Phase 02 fixture generator picked real products as "realistic" references. The rule lives in the global prompt rather than in the generator, so nothing failed when the names were written and no test asserted anything about the names themselves.
- Fix: Renamed all ten sources to realistic-but-fictional brands, keeping the count, industry, language and style spread identical — Flowbase, Nimbus Pay, Arcadia Docs, Cloudloom Browser, Brightloom, Cedarline, ركائز, سبل, رفيف, Papercrane. The source ids, the page ids derived from them and the two section titles that named a brand were renamed with them, the assets were regenerated with `npm run mock:assets` (the generator clears the directory first, so no stale files remain), every source `url` now points at a reserved `.example` domain so no real site is referenced, and the fixture assertions that named the old ids were updated.
- Tests: New `src/mocks/mock-content.test.ts` scans the fixture data, the asset filenames and the asset bodies for a denylist of the old real brands, requires every source URL to sit on a `.example` domain, and fails if the asset directory and the fixtures disagree in either direction — so a future rename cannot leave stale branding or orphan files behind. `data-integrity.test.ts`, `query-engine.test.ts` and `services.test.ts` still pass, and their behavior is unchanged apart from the renamed fixture ids.
- Notes: `Figma` is still named in `ARCHITECTURE.md`, `NEXT_STEPS.md`, `docs/product-spec.md`, `docs/prompts/` and the `figma_clicked` analytics event, but every one of those refers to the real future integration the product spec deliberately defers to Phase 11, not to mock content, so they are correct as written.

### BUG-006 — Explore used a page header and a horizontal dropdown bar instead of a sidebar

- Status: Fixed
- Severity: Medium
- Area: Explore layout (Phase 05)
- Date: 2026-10-04
- Reproduction: Open `/en/explore` at desktop width.
- Expected: Explore's controls are a persistent left sidebar — a Discover section for the reference types, an Industry list with live result counts, and the remaining filters below it — with the result count, sort control, chips and masonry grid in the content column.
- Actual: Phase 05 shipped an "Explore references" H1 with a description line, a horizontal row of seven Select dropdowns plus Sort, and the result count in the page header. That bar is a different information architecture from the approved design, and its dropdowns hid the industry taxonomy and its counts behind a closed control.
- Root Cause: Phase 05 implemented the filter _capability_ from `docs/product-spec.md` §14 without the sidebar layout the approved design calls for; the shipped tests asserted the dropdown-bar DOM (`getByLabel("Section type")`), so they pinned the wrong structure rather than the required behaviour.
- Fix: Replaced the header and the dropdown bar with the sidebar. `explore-sidebar.tsx` renders a Discover section (Website, Sections as the default active entry, Mobile as the `device=mobile` shortcut), an always-open Industry list with each industry's live facet count and the filtered total on "All", and one collapsible group per remaining filter (Section type, Style, Language, Direction, Device, Theme) driven by the same `EXPLORE_FILTERS` taxonomy config. `explore-filters.tsx` now only supplies the two containers: a sticky desktop column at `lg`+ and, below `lg`, the pre-existing bottom Sheet, which mounts the identical sidebar with its draft/apply step — no second mobile pattern was added. Sort and the result count moved into the results toolbar. The visible H1 and description were removed; a visually hidden `h1` keeps the document's top-level heading. `SearchService`, `query-engine.ts`, `explore-state.ts`, the chips row, the pagination and the Phase 04 `MasonryGrid` were not touched.
- Tests: New `frontend/src/features/explore/explore-sidebar.test.tsx` covers the counts, apply/toggle/clear, the Discover device shortcut, group expansion, the visible "Soon" badge on the unavailable Sources entry, and a guard that every filter the dropdown bar exposed is still reachable. `frontend/tests/e2e/explore.spec.ts` was retargeted at the sidebar — filter application, URL/history restoration, chip removal, clear, an applied group starting expanded, the Discover device switch, and the mobile Sheet path — with no assertion weakened. `explore-order.test.ts` and the Phase 04 masonry/card suites were re-run unchanged and still pass.
- Notes: The Discover "Website" entry is the Sources index destination, which Phase 07 has not built, so it renders disabled from `ROUTE_AVAILABILITY.websites` rather than linking to a route that does not exist; it carries a visible "Soon" badge, because a disabled entry with no marker reads as broken rather than unbuilt, and becomes a real link automatically once that route is enabled. The navbar Search entry point was left exactly as it was — the overlay is Phase 06. The Explore `h1` stays visually hidden rather than being deleted, and the sidebar keeps scrolling internally inside its sticky column rather than with the page; both were confirmed as the intended behaviour, so neither was changed.

### BUG-007 — Section detail omitted the Source metadata fact

- Status: Fixed
- Severity: Medium
- Area: Phase 07 Section detail metadata
- Date: 2026-10-05
- Reproduction: Open `/en/sections/section-flowbase-home-3` and inspect the metadata list.
- Expected: The detail page includes Source, language, direction, devices, industry, style, captured date, and attribution.
- Actual: Source appeared in breadcrumbs and source context but was absent from the facts list.
- Root Cause: `buildSectionDetail()` omitted the already-typed `detail.factSource` field.
- Fix: Add the Source fact from the section's existing source record; scope the component test's duplicate-value assertion by its `<dt>` row.
- Tests: `features/detail/model.test.ts`; unchanged `tests/e2e/detail.spec.ts` source-fact assertions.
- Notes: The same `SectionDetail` now supplies this field in both the standalone page and intercepted modal.

### BUG-008 — View in Context scrolled before its page image loaded

- Status: Fixed
- Severity: Medium
- Area: Phase 07 View in Context
- Date: 2026-10-05
- Reproduction: Open a Section detail, switch to Mobile, then open View in Context.
- Expected: The current device's section highlight scrolls into the visible area of the page capture.
- Actual: The one-frame scroll calculation could run before the lazy page screenshot had rendered dimensions, leaving the highlight below the scroll viewport.
- Root Cause: Scroll geometry was measured on the first animation frame after opening rather than after the active device image loaded.
- Fix: Wait for the active page screenshot's `onLoad` before computing rendered crop pixels and centering the scroll frame.
- Tests: Unchanged `tests/e2e/detail.spec.ts` View in Context flow passes for desktop and mobile; `features/detail/components.test.tsx` retains crop-per-device coordinate tests.
- Notes: The crop rectangles and device data model are unchanged.

## Bug Template

### BUG-001 — Title

- Status:
- Severity:
- Area:
- Date:
- Reproduction:
- Expected:
- Actual:
- Root Cause:
- Fix:
- Tests:
- Notes:
