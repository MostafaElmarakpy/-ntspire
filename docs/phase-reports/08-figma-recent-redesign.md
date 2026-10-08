# Figma / recent.design reimagining — implementation report

Scope: apply the Figma `ntspire` file (Desktop 1–3, Sidebar frame, Button /
Avatar / Logo components, pulled via Composio Figma MCP) and recent.design
feed behavior (fetched live: header groups, scrollable single-select category
pills, stretched-link cards, sponsor + jobs slots) to Explore, the header,
cards, and the Sources landing — without breaking phase guards.

## Requirement table

| ID | Requirement | Status | Evidence |
|----|-------------|--------|----------|
| R-01 | Typography, Color, Stack, Format (+ retail/transport/entertainment/technology industries) as real taxonomy with mock data behind every value | Done | `config/taxonomy.ts` new lists; `fixtures.ts` derivation tables; manifest reassigns cedarline→retail, subul→transport, cloudloom→technology; `data-integrity.test.ts` lengths + per-section resolution |
| R-02 | Filters, facets, URL params, inference, suggestions, overlay, sidebar, categories index read the new dims | Done | `query-engine.ts`, `explore-state.ts` (`typography/color/stack/format`), `filter-options.ts`, `search-parser.ts` (new ranks after existing), `search-suggestions.ts`, `search-overlay.tsx`, `model.ts` categories groups; new unit tests in each file |
| R-03 | No pill/chip without data | Done | `EXPLORE_QUICK_PILLS` facet-gated (`> 0`); entertainment (0 sections) excluded automatically; parser tie-break keeps `monochrome`→style |
| R-04 | Figma icon-button spec (32px, r10, hairline, 16px icon) | Done | `button.tsx` `overlay` + `icon-overlay`; Save overlay + Quick View + sign-in avatar use it |
| R-05 | Borderless header: logo, Browse/Resources, centered search pill, icon actions | Done | `site-header.tsx`, `header-search-pill.tsx` (controlled overlay + shortcuts), `BROWSE_NAV`/`RESOURCE_NAV`; `+`/bookmark deferred (no routes) |
| R-06 | Exported Figma logo + local display font, zero remote requests | Done | `public/brand/ntspire-logo.svg` (Composio export), `Wordmark` renders it with `priority`; Oswald VF self-hosted, `font-hero` token; trial fonts not shipped |
| R-07 | Explore D2 feed: quick-pill row, sidebar caption + OG Images + sponsor | Done | `explore-quick-pills.tsx` (+ tests), sidebar Discover 4th entry (+ tests), `SponsorSlot` in desktop aside |
| R-08 | D3 hero + sponsor + jobs on Sources landing | Done | `HeroPanel`, `SponsorSlot`, `JobsTeaser` (static rows, mailto only); sources page composes them |
| R-09 | Cards keep 07b structure/behavior | Done | Monogram position, caption, modal/Quick View flows untouched; `cards.test.tsx`, gallery + detail e2e pass |
| R-10 | Full gate green (modulo pre-existing failures) | Done with notes | typecheck ✅; unit 285 ✅; build ✅; explore e2e 26/26 (twice) ✅; foundation/gallery/phase3/overlay 28 ✅; gallery.dev 19 ✅; design-system.dev 4 ✅; detail e2e 24/25 mobile+desktop except pre-existing desktop homepage-nav failure |

## Bugs found

- BUG-015 (this session): Quick View e2e measured the card before first layout — fixed by polling non-zero height.
- BUG-016 (this session): exported logo tripped Next LCP warning under the clean-run fixture — fixed with `priority`.

## Known limitations / not done

- `npm run lint` fails on 3 pre-existing errors in committed `debug-*.cjs/js` helpers (HEAD commit, untouched).
- `detail.spec.ts` desktop "every level of the flow" fails on `/en` Primary navigation: the in-progress homepage stream hides `SiteHeader` there (verified pre-existing via stash before this work). Mobile passes.
- Entertainment industry has 0 sections (no 11th/12th source added, keeping the 42-section totals e2e asserts); excluded from pills by facet gating.
- Figma variables API is 403 for this token, so semantic color tokens came from node fills; no variable sync.
- `+`/bookmark header actions, rotating sponsors, linked job postings, Tools/Skills/Jobs routes: deferred to their owning phases.
