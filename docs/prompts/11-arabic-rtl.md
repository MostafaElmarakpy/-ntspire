# Phase 11 — Arabic / English localization & RTL/LTR  (run ONLY after Phase 10 is human-approved)

Read first: `00-global-rules.md`; spec §6–7, §14.1 (RTL), §14.2.1, §46–47, §73; master prompt §16, §26.

## Goal
Enable the `ar` locale with true RTL, without breaking anything that already works.

## In scope
- P11-01 Enable `ar` in the locale config: `/ar/...` routes for every page; `<html lang="ar" dir="rtl">`; locale switcher (EN/AR) in navbar and mobile menu that preserves the current path and query/filters.
- P11-02 `messages/ar.ts` with FULL parity with `en.ts` (TypeScript-enforced type + a test that key sets are identical). Arabic taxonomy labels. UI chrome/taxonomy/metadata are localized; reference-content titles stay in their own language.
- P11-03 Arabic search aliases in the taxonomy config (عربي, العربية → language=ar; RTL, يمين لليسار, اتجاه يمين لليسار → direction=rtl; common Arabic names for section types/industries/styles/devices). `parseSearchQuery` handles Arabic input, normalizes Arabic text (diacritics/tatweel, alef/ya/ta-marbuta variants). Tests for mixed Arabic+English queries.
- P11-04 RTL layout across every page: logical properties already used — fix any leftovers; direction-sensitive icons (chevrons, arrows, back links, breadcrumbs separators) flip; overlay, sheets, tabs, filters, toasts, forms behave correctly.
- P11-05 **Masonry in RTL**: pass `direction="rtl"` so the first visual column is the rightmost. Image content is NEVER mirrored: no `scaleX(-1)`/mirror transforms on screenshots, phone frames or context highlights (context highlight rectangle must map correctly in RTL).
- P11-06 Arabic typography: system Arabic-capable font stack (or committed local font), correct line-height, no clipped glyphs, numerals/dates via `Intl` with the locale.
- P11-07 SEO: `alternates.languages` (hreflang) between `/en` and `/ar`, per-locale canonical, localized title/description, `og:locale`, sitemap entries for both locales, `robots` unchanged in intent.
- P11-08 Mock analytics/`trackEvent` unaffected; saved data (localStorage) shared across locales.

## Out of scope
Additional locales, machine translation services, backend.

## Required tests
Message parity, Arabic parser cases, locale switch preserves path+query, `dir`/`lang` attributes, masonry RTL DOM order and bounding-box order (first item rightmost), no mirrored images (computed `transform` none on `img`), context-highlight correctness in RTL, metadata alternates, e2e of the whole main flow in `/ar` at both viewports, route crawl in both locales (clean console, no broken links, no overflow), axe in `/ar`, re-run ALL earlier English tests (no regression).

## Exit
Global gate + report + manual RTL checklist for the human (`docs/phase-reports/11-manual-rtl-checklist.md`).
