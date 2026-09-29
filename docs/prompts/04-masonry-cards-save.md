# Phase 4 — Masonry gallery, cards & Save core

Read first: `00-global-rules.md`; spec §14.1, §18, §18.1, §20, §38–39; master prompt §13–14, §23.

## Goal
The critical waterfall gallery and the reference cards, working with the mock dataset.

## In scope
- P4-01 `MasonryGrid`: real masonry (shortest-column placement). Choose the simplest reliable approach, justify it in ARCHITECTURE, and satisfy ALL of: responsive column count via breakpoint config (4 large / 3 / 2 tablet / 1–2 mobile), card width follows the column (no fixed px width), gap from the design token, **reading order preserved** (item n is placed before n+1 in ranking order), no `flex-wrap` hack, no hydration mismatch, no layout jump when images load, recomputes on resize.
- P4-02 Pure, unit-tested `distributeIntoColumns(items, columnCount, heightEstimator)`; height derived from `width/height` metadata (+ footer allowance). Accepts `direction` (default `"ltr"`): in `"rtl"` the first column is the rightmost. Do not enable RTL in the UI yet, but test the function with `"rtl"`.
- P4-03 Image rendering: natural aspect ratio from known `width/height` (`aspect-ratio`), `width:100%`, **no `object-cover`, no fixed-height card**, lazy loading, reserved space (skeleton sized to the ratio). Local SVG via `next/image` (`unoptimized` with justification) or `<img>` with lint-clean justification.
- P4-04 `SectionCard`: screenshot, section type, source name, ≤ 3 tags, language badge, device-availability indicator (desktop/mobile/both), Save + Open. Desktop: hover overlay actions (absolutely positioned, must not change card height). Touch/mobile: actions visible without hover (`@media (hover: none)` or always-visible compact buttons). Default image = desktop crop, fallback mobile.
- P4-05 `PageCard` and `SourceCard` (website reference card): same flexible-width/natural-height rule, no forced crop.
- P4-06 Save core: `SaveService` interface + `MockSaveService` (localStorage), idempotent save/unsave, optimistic UI via a `useSaved` hook, server-authoritative shape (service result wins on mismatch), safe when localStorage is unavailable/corrupt, analytics `saved`/`unsaved`. `SaveButton` component with accessible pressed state and label. (Add-to-collection is Phase 8.)
- P4-07 Dev route `/[locale]/dev/gallery` rendering the full mock dataset in the masonry grid with `?__mock=` support, used for verification (404 in production).
- P4-08 Loading state: gallery skeleton with varied ratios; error and empty variants use the Phase 3 components.

## Out of scope
Filters/URL state, Explore page, detail pages, collections.

## Required tests
`distributeIntoColumns` (balance, order, ties, empty, 1 column, rtl), column-count breakpoint mapping, card rendering states (desktop-only/mobile-only/both crops, long titles, many tags), save/unsave idempotency + corrupt-storage handling, optimistic rollback, no `object-cover`/fixed-height in card classes (assertion), e2e: gallery at 1440/1024/768/390 shows expected column counts, cards have different heights, no horizontal overflow, hover actions don't change height, touch viewport shows actions, save persists after reload, axe clean.

## Exit
Global gate + report with screenshots of the gallery at 4 widths. Explicitly state in the report how you verified no blank gaps in columns.
