# Phase 04 — Masonry Gallery, Cards & Save Core

> Retroactive report. Phase 04 was skipped during the original build (the project
> went 03 → 05); it was implemented from scratch in this session, and the Explore
> page that had been built on the missing prerequisite was corrected to use it.
> See `bug-fix.md` BUG-004 for the root cause and the scoped Phase 05 correction.

## Requirement evidence

| ID    | Requirement                                                                                                                                                                                                                                  | Status | Evidence                                                                                                                                                                                                                                                                                                                       |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P4-01 | `MasonryGrid` with real shortest-column placement, responsive column count (4/3/2/1–2), column-following card width, token gap, preserved ranking order, no `flex-wrap` hack, no hydration mismatch, no layout jump on image load, resize recompute. | DONE   | `frontend/src/lib/masonry.ts` (`distributeIntoColumns`, `getColumnCount`, `MASONRY_BREAKPOINTS`); `frontend/src/features/gallery/masonry-grid.tsx` subscribes to the breakpoint media queries through `useSyncExternalStore` with a constant one-column server snapshot (no hydration mismatch) and children are `flex-1 min-w-0` so card width follows the column; gap is `var(--masonry-gap)`; `masonry.test.ts` covers balance, ordering, ties, empty and single column. |
| P4-02 | Pure unit-tested `distributeIntoColumns(items, columnCount, heightEstimator)`; height from `width`/`height` metadata + footer allowance; accepts `direction` (default `"ltr"`), `"rtl"` puts the first column rightmost.                        | DONE   | `frontend/src/lib/masonry.ts` — `distributeIntoColumns` is pure and exported with `estimateMasonryHeight` (ratio + `CARD_FOOTER_ALLOWANCE`); `masonry.test.ts` asserts shortest-column placement, stability of input order within a column, and that `direction: "rtl"` reverses the column array only.                            |
| P4-03 | Natural aspect ratio from known `width`/`height`, `width:100%`, no `object-cover`, no fixed-height card, lazy loading, reserved space.                                                                                                        | DONE   | `frontend/src/features/gallery/section-card.tsx`, `page-card.tsx`, `source-card.tsx` all render `next/image` with explicit `width`/`height`, `h-auto w-full`, and breakpoint `sizes`; `loading` is `lazy` unless the card is above the fold; `cards.test.tsx` asserts the `h-auto w-full` classes, the absence of `object-cover`, and that no fixed `h-<n>` card class is present. |
| P4-04 | `SectionCard`: screenshot, section type, source, ≤3 tags, language badge, device-availability indicator, Save + Open; hover overlay actions that do not change card height; touch actions visible without hover.                                | DONE   | `frontend/src/features/gallery/section-card.tsx` — the action row is an absolutely positioned overlay (`absolute inset-x-0 top-0`) revealed with `opacity`, so it never participates in layout; the default crop is the desktop crop with the mobile crop as fallback (`gallery-data.ts` `pickSectionCrop`, P4-04 comment); `cards.test.tsx` covers the ≤3 tags rule, both device labels, the accessible names, the `role="group"` name "Reference actions", and the Save toggle; `gallery.dev.spec.ts` asserts `opacity 0 → 1` on hover with ≤1px height/width drift, keyboard focus visibility, and `@media (hover: none)` always-visible actions with `hasTouch`. |
| P4-05 | `PageCard` and `SourceCard` with the same flexible-width / natural-height rule.                                                                                                                                                               | DONE   | `frontend/src/features/gallery/page-card.tsx`, `frontend/src/features/gallery/source-card.tsx`; both are rendered through the same `MasonryGrid` in `gallery-experience.tsx`; `cards.test.tsx` asserts their fields and that `SourceCard` exposes no action buttons. |
| P4-06 | Save core: `SaveService` + `MockSaveService` (localStorage), idempotent save/unsave, optimistic `useSaved`, server-authoritative shape, safe with unavailable/corrupt storage, analytics `saved`/`unsaved`; accessible `SaveButton` pressed state. | DONE   | `frontend/src/lib/save-service.ts`, `frontend/src/lib/saved-store.ts`, `frontend/src/hooks/use-saved.ts`, `frontend/src/components/save-button.tsx`; `save-service.test.ts` (idempotency, corrupt/unavailable storage), `saved-store.test.ts` (optimistic flip, service-authoritative rollback, analytics only after settle, persisted load, notify-on-change), `cards.test.tsx` (rolled-back toggle, `aria-pressed`, localStorage payload). |
| P4-07 | Dev route `/[locale]/dev/gallery` rendering the full mock dataset in the masonry grid with `?__mock=` support, 404 in production.                                                                                                              | DONE   | `frontend/src/app/[locale]/dev/gallery/page.tsx` (`notFound()` when `NODE_ENV === "production"`, guard placed above the Suspense boundary); `gallery.dev.spec.ts` renders the full manifest dataset; `gallery.spec.ts` asserts a real `404` status in the production build. |
| P4-08 | Loading state: gallery skeleton with varied ratios; error and empty variants reuse the Phase 3 components.                                                                                                                                    | DONE   | `frontend/src/features/gallery/gallery-loading.tsx` + `masonry-skeleton.tsx` (`role="status"`, four varied-ratio column groups, no CSS `columns-*`); `?__mock=empty` renders `EmptyState` and `?__mock=error` renders `ErrorState` from `@/components/content-states` and `@/components/error-state`; all three modes covered by `gallery.dev.spec.ts`. |

## Verification

### Unit tests added

| File                                            | Covers                                                                                              |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `src/lib/masonry.test.ts`                       | P4-01/P4-02 column counts per breakpoint, shortest-column placement, order stability, `rtl` reversal |
| `src/features/gallery/cards.test.tsx`           | P4-03/P4-04/P4-05 card rendering rules and the `SaveButton` toggle/rollback                          |
| `src/lib/save-service.test.ts`                  | P4-06 idempotency and corrupt/unavailable storage                                                    |
| `src/lib/saved-store.test.ts`                   | P4-06 optimistic flip, service-authoritative result, analytics, persistence                          |
| `src/features/explore/explore-order.test.ts`    | Phase 05 correction — ranked result order is preserved by the masonry column assignment              |

### E2E

- `tests/e2e/gallery.dev.spec.ts` (dev config, desktop + mobile): full-dataset counts,
  top-row ranking order at 1440, column counts at 1440/1024/768/390 with no horizontal
  overflow at 375, natural aspect ratio (`objectFit: fill`, rendered/natural ratio within
  3%), uneven column heights, hover actions, keyboard + touch reachability, save across
  reload, the three `?__mock=` states, axe, and the four breakpoint screenshots.
- `tests/e2e/gallery.spec.ts` (production config): `/en/dev/gallery` returns `404`.
- Regression: the whole Phase 05 suite (`explore.spec.ts`) was re-run unchanged after
  the Explore correction and still passes on both projects.

### Gate

Run from `frontend/` on 2026-10-03, after the production-404 fix described below:

| Command            | Result                                                              |
| ------------------ | ------------------------------------------------------------------- |
| `npm run typecheck`| exit 0                                                              |
| `npm run lint`     | exit 0                                                              |
| `npm run test`     | 20 files passed, 86 tests passed                                    |
| `npm run build`    | exit 0 — route table includes `ƒ /[locale]/dev/gallery`             |
| `npm run test:e2e` | exit 0 — production `26 passed`; dev `21 passed, 1 skipped`          |

This table is the final run, taken after the BUG-005 follow-up (`mock-content.test.ts`
raised the unit count from 83 to 86). The earlier run, taken immediately after the
production-404 fix, was identical apart from `npm run test` reporting 19/83.

The one skipped dev test is the hover assertion on the mobile project, which is
skipped by design because a touch project has no hover.

The first `npm run test:e2e` run of this phase **failed** the production-404 test:
the route returned `200`. Root cause was the route-level `loading.tsx`, which makes
Next.js wrap the whole page in a Suspense boundary and flush a `200` shell before
the page component reaches its `notFound()` guard — `/en/dev/design-system` has no
`loading.tsx`, which is why its equivalent test passed. Diagnosed by removing
`loading.tsx` and re-running the single test (it passed), then fixed by keeping the
same skeleton as an in-page Suspense fallback placed below the guard.

### Screenshots

`docs/phase-reports/screenshots/04-gallery-1440.png`, `-1024.png`, `-768.png`, `-390.png`.

Phase 04's exit criterion "no blank gaps in the columns" is asserted two ways: the
columns are uneven in height (so the grid is not a fixed-height row layout) while the
top of every column aligns, and the shortest-column placement is unit-tested against the
real fixture crops so no column can be left empty while another holds two extra items.

## Not done / deviations

- `SectionCard`'s **Open** action is a real, resolving link, but in Phase 04 it can
  only point at a destination that exists: the dev gallery passes an in-page anchor
  (`#card-<id>`). The real destination `/[locale]/sections/[id]` arrives in Phase 07
  (P7-01); Phase 07 repoints the card. This is a documented forward reference, not an
  inert button.
- The dev gallery marks **three** ranked rows as above-the-fold eager rather than one.
  Next.js warns when the Largest Contentful Paint image is lazy, and at 390px a
  single-row window is only one card wide, so the warning migrated down the column
  until every above-the-fold image was eager. Everything below that stays lazy.
- Explore kept its own `ExploreSectionCard` during the Phase 05 correction because
  that correction was explicitly scoped to the gallery rendering mechanism only.
  Explore adopts the Phase 04 `SectionCard` (Save + Open) when Phase 07 wires the
  detail route.

## Bugs found & fixed

- `bug-fix.md` BUG-004 — Phase 04 skipped; Explore built on CSS multi-columns.
- `bug-fix.md` BUG-005 — mock Source names were real companies (status: **fixed**
  after this phase's gate, in the follow-up commit described under "Gate" below; it
  was a Phase 02 fixture-content issue, not a Phase 04 defect).

## Phase handoff

Phase 07 should pass `openHref={`/${locale}/sections/${id}`}` into `SectionCard` and
reuse `SaveButton` for P7-02. Phase 08 should mount "Add to collection" next to
`SaveButton` (P8-02) and keep the `saved`/`unsaved` analytics from `useSaved` (P8-06).
