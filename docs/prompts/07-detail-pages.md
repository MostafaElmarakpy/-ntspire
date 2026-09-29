# Phase 7 — Section / Page / Source detail, View in Context, downloads

Read first: `00-global-rules.md`; spec §9–11, §19, §22–24, §44; master prompt §20–22, §24.

## Goal
The full Source → Page → Section hierarchy, with correct per-device crops.

## In scope
- P7-01 Routes: `/[locale]/sections/[id]`, `/[locale]/pages/[slug]`, `/[locale]/sources/[slug]` plus index routes `/sources` (Websites) and `/pages`, and `/categories` (taxonomy index with counts linking to Explore). Enable the matching nav items. Proper `notFound()` for bad ids/slugs.
- P7-02 **Section detail**: breadcrumbs (Source → Page → Section), large screenshot, title, section type, source, parent page, language, direction, device availability, industry, style, tags, capture date, attribution; actions Save (SaveButton), Save as Image, Send to Figma (mock), View in Context; Related sections via `getSimilarSections()`; related page/source.
- P7-03 **Desktop/Mobile switcher** reads the matching `SectionCrop` (never reuses desktop coordinates for mobile); disabled/hidden when the variant doesn't exist; selection reflected in URL (`?device=`); mobile preview may use a phone-style frame (presentation only, never alters the asset). Analytics `mobile_viewed`/`desktop_viewed`.
- P7-04 **View in Context**: shows the parent page screenshot for the CURRENT device, visibly highlights the selected section rectangle (computed from that crop's `cropX/Y/Width/Height` scaled to the rendered size), scrolls it into view, keyboard accessible, works at all widths, other sections of the page can be navigated from it. Analytics `view_context`.
- P7-05 **Save as Image**: real browser download of the device-appropriate rendered asset with a sensible filename (`ntspire-<source>-<type>-<device>.<ext>`), no backend. Analytics `image_downloaded`.
- P7-06 **Send to Figma**: mock only — dialog/toast clearly saying the integration is coming; never pretends to work. Analytics `figma_clicked`.
- P7-07 **Page detail**: page screenshot with desktop/mobile toggle, sections listed with region highlights, links to each section and to the source.
- P7-08 **Source detail**: header with attribution/metadata, list of pages, sections in the masonry grid. Analytics `source_opened`, `section_viewed`.
- P7-09 Navigation never loses context: every level links up and down (Source ⇄ Page ⇄ Section), including from cards created in Phase 4 (cards' Open action now works).
- P7-10 Loading/empty/error states on each route (`loading.tsx`, `error.tsx`, not-found), verified via `__mock`.

## Out of scope
Collections UI, homepage, metadata/SEO polish (Phase 9), Arabic.

## Required tests
Crop selection by device (desktop-only, mobile-only, both), context-rect math (unit test the coordinate→CSS conversion incl. scaled sizes), similar/related links, breadcrumb correctness, download trigger + filename, Figma mock behavior, not-found handling, e2e: card → detail → switch device → context → download (Playwright download event) → back; every new route loads clean; axe clean.

## Exit
Global gate + report.
