# Phase 05 — Explore, Filters & URL State

| ID    | Requirement                                                                                                                                                                                                                                                | Status | Evidence                                                                                                                                                                                                                 |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P5-01 | Implement `/[locale]/explore`; enable Explore and Sections navigation; route Mobile to `/explore?device=mobile`.                                                                                                                                           | DONE   | `frontend/src/app/[locale]/explore/page.tsx`; `frontend/src/config/navigation.test.ts`; `frontend/tests/e2e/explore.spec.ts` mobile shortcut flow.                                                                       |
| P5-02 | Add typed `parseExploreParams(searchParams)` and `serializeExploreParams(state)` with safe validation, canonical ordering, round trips, and state for query, taxonomy filters, locale/language, direction, device, theme, sort, and sensible multi-values. | DONE   | `frontend/src/lib/explore-state.ts`; `explore-state.test.ts` covers round-trip, invalid/duplicate values, and canonical ordering. Filter values are scalar to match the `SearchRequest` contract.                        |
| P5-03 | Build taxonomy-driven Section Type, Industry, Style, Language, Direction, Device, and Theme filters; desktop filter UI; mobile Sheet with apply/clear; removable selected chips and Clear all; facet counts from SearchService.                            | DONE   | `features/explore/filter-options.ts`, `explore-filters.tsx`, and `explore-experience.tsx`; e2e filter/chip and mobile Sheet flow; facets come from `mockSearchService.search()`.                                         |
| P5-04 | Support latest/featured sorting, result count, pagination/load more, end state, and sane URL/scroll behavior.                                                                                                                                              | DONE   | `frontend/src/lib/query-engine.test.ts` sorting/cursor checks; Explore sort select, count, and load-more UI; e2e verifies 12→24→36→42 and end state.                                                                     |
| P5-05 | Use the shared `SearchService.search()` path, server-render the first page where sensible, and limit client code to interaction.                                                                                                                           | DONE   | `frontend/src/app/[locale]/explore/page.tsx` SSR calls `mockSearchService.search()`; `frontend/src/app/api/explore/route.ts` serves client reads through the same service; e2e verifies initial server-rendered results. |
| P5-06 | Provide loading skeleton, explanatory empty state with clear-filters action, retryable error state, and success state; exercise states via `?__mock=`.                                                                                                     | DONE   | `frontend/src/app/[locale]/explore/loading.tsx`, `features/explore/explore-experience.tsx`; e2e covers `slow`, `empty`, `error`, and retry.                                                                              |
| P5-07 | Make `language=ar` return Arabic-language references while the UI stays English; apply URL `q` and show it as a chip.                                                                                                                                      | DONE   | `frontend/src/lib/query-engine.test.ts` Arabic filter/facet case; e2e verifies Arabic results and removable language/query chips.                                                                                        |
| P5-08 | Emit `filter_applied` and `mobile_viewed`/`desktop_viewed` analytics for device-filter use.                                                                                                                                                                | DONE   | `features/explore/analytics.ts` and `analytics.test.ts`; `explore-experience.tsx` records applied filters and active device context.                                                                                     |
| P5-09 | Restore Explore filter state on browser back/forward navigation.                                                                                                                                                                                           | DONE   | `explore-experience.tsx` parses `popstate`; e2e applies two filters, checks back/forward, and reloads the shared URL.                                                                                                    |

## Verification

- `npm run typecheck`: passed.
- `npm run lint`: passed with no warnings.
- `npm run test`: 14 files passed; 37 tests passed.
- `npm run build`: passed; `/[locale]/explore` and `/api/explore` appear in the route manifest.
- `npm run test:e2e`: production suite 24 passed; dev suite 4 passed. The Phase 01 `test.fail()` fixture proof is expected to display as an expected failure and counts as a pass.

## Manual Verification

Playwright verified `/en/explore`, `/en/explore?language=ar`, the Mobile navigation shortcut, both responsive projects, the mobile filter Sheet, 375px horizontal overflow, axe checks, history/back/forward/reload, and pagination through the end state.

## Not done / deviations

No P5 requirements remain. Filters are single-valued because the existing `SearchRequest` contract and each taxonomy facet are scalar; repeated URL values are handled deterministically. Phase 06 was not started.

## Bugs found & fixed

See `bug-fix.md` BUG-002 for production query-driven mock states and BUG-003 for route-based dev-server readiness.

## Phase handoff

Phase 06 should reuse `parseExploreParams`, `serializeExploreParams`, and `mockSearchService.search()` through the Explore service boundary. Search overlay, suggestions, and inference remain out of scope here.
