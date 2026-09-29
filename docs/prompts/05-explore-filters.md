# Phase 5 — Explore page, filters & URL state

Read first: `00-global-rules.md`; spec §14, §33–34, §43; master prompt §12, §19, §33.

## Goal
The primary discovery surface driven entirely by URL state and the shared SearchService.

## In scope
- P5-01 Route `/[locale]/explore` (enable the "Explore" and "Sections" nav items; "Mobile" → `explore?device=mobile`).
- P5-02 **URL state module** in `lib/`: `parseExploreParams(searchParams)` and `serializeExploreParams(state)`; typed, validates unknown/invalid values (ignored safely, never crashes), stable canonical param order, round-trips. State: `q`, section type, industry, style, language, direction, device, theme, sort, (multi-value where sensible). Shareable/bookmarkable.
- P5-03 Filters (from the shared taxonomy config — no redefinition): Section Type, Industry, Style, Language, Direction, Device, Theme. Desktop: filter bar/sidebar. Mobile: filters in a Sheet with apply/clear. Selected filters shown as removable chips; "Clear all". Facet counts next to options (from SearchService facets).
- P5-04 Sorting (latest, featured), result count, **Load more** (or cursor pagination) with correct end-of-results state; scroll position/URL sane.
- P5-05 Uses `SearchService.search()` — the same abstraction the overlay will use in Phase 6. Server-render the first page where sensible; client only for interactive parts.
- P5-06 States: loading skeleton, empty (explains + "clear filters"), error (retry), success; driven/testable via `?__mock=`.
- P5-07 The `language=ar` option works (Arabic-language references appear; English UI). `q` from the URL is applied and shown as a chip (the search input/overlay arrives in Phase 6).
- P5-08 Analytics: `filter_applied`, `mobile_viewed`/`desktop_viewed` where device filter used.
- P5-09 Back/forward browser navigation restores filter state correctly.

## Out of scope
Search overlay, inference parser, detail pages.

## Required tests
URL parse/serialize (invalid values, duplicates, round-trip, ordering), filter combinations returning correct sets and counts, pagination end, state-driven components, e2e: apply several filters → URL updates → reload restores → back button works; mobile filter sheet; empty/error/loading via `__mock`; no console errors; axe clean at both viewports.

## Exit
Global gate + report.
