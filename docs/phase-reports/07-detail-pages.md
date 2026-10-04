# Phase 07 Report — Section / Page / Source detail, View in Context, downloads

## Requirement Table

| ID    | Requirement                                                                                                                                                    | Status | Evidence |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------- |
| P7-01 | Routes: `/[locale]/sections/[id]`, `/[locale]/pages/[slug]`, `/[locale]/sources/[slug]`, index routes `/sources` (Websites) and `/pages`, `/categories` (taxonomy index with counts linking to Explore); enable matching nav items; proper `notFound()` for bad ids/slugs. | TODO   | —        |
| P7-02 | **Section detail**: breadcrumbs (Source → Page → Section), large screenshot, title, section type, source, parent page, language, direction, device availability, industry, style, tags, capture date, attribution; actions Save (SaveButton), Save as Image, Send to Figma (mock), View in Context; Related sections via `getSimilarSections()`; related page/source. | TODO   | —        |
| P7-03 | **Desktop/Mobile switcher** reads the matching `SectionCrop` (never reuses desktop coordinates for mobile); disabled/hidden when the variant doesn't exist; selection reflected in URL (`?device=`); mobile preview may use a phone-style frame (presentation only, never alters the asset). Analytics `mobile_viewed`/`desktop_viewed`. | TODO   | —        |
| P7-04 | **View in Context**: shows the parent page screenshot for the CURRENT device, visibly highlights the selected section rectangle (computed from that crop's `cropX/Y/Width/Height` scaled to the rendered size), scrolls it into view, keyboard accessible, works at all widths, other sections of the page can be navigated from it. Analytics `view_context`. | TODO   | —        |
| P7-05 | **Save as Image**: real browser download of the device-appropriate rendered asset with a sensible filename (`ntspire-<source>-<type>-<device>.<ext>`), no backend. Analytics `image_downloaded`. | TODO   | —        |
| P7-06 | **Send to Figma**: mock only — dialog/toast clearly saying the integration is coming; never pretends to work. Analytics `figma_clicked`. | TODO   | —        |
| P7-07 | **Page detail**: page screenshot with desktop/mobile toggle, sections listed with region highlights, links to each section and to the source. | TODO   | —        |
| P7-08 | **Source detail**: header with attribution/metadata, list of pages, sections in the masonry grid. Analytics `source_opened`, `section_viewed`. | TODO   | —        |
| P7-09 | Navigation never loses context: every level links up and down (Source ⇄ Page ⇄ Section), including from cards created in Phase 4 (cards' Open action now works). | TODO   | —        |
| P7-10 | Loading/empty/error states on each route (`loading.tsx`, `error.tsx`, not-found), verified via `__mock`. | TODO   | —        |

## Required tests (from the phase prompt)

- Crop selection by device: desktop-only, mobile-only, both.
- Context-rect math: unit-test the coordinate → CSS conversion, including scaled rendered sizes.
- Similar/related links; `getSimilarSections()` deterministic ranking rule.
- Breadcrumb correctness.
- Download trigger + filename.
- Figma mock behavior.
- not-found handling.
- e2e: card → detail → switch device → context → download (Playwright download event) → back.
- Every new route loads clean; axe clean.

## Key constraints carried from the spec

- Similar sections rule: same `sectionType` AND (shared industry OR shared style), ordered by count of shared tags DESC, LIMIT 6 — deterministic, never ad hoc or random.
- Crop coordinates are per-device and must never be reused across devices; the default preview is the `desktop` crop, falling back to `mobile`.
- Download uses `SectionCrop.renderedAssetId` for the current device (not the full page asset), filename `ntspire-<source>-<type>-<device>.<ext>`.
- Figma is a mock only — it must never appear to work.
- Analytics: `mobile_viewed`, `desktop_viewed`, `view_context`, `image_downloaded`, `figma_clicked`, `source_opened`, `section_viewed`.
- Mock source names stay realistic-but-fictional; no real companies or trademarks.

## Verification Results

Not started.

## Manual Verification

Not started.

## Not done / deviations

None yet.

## Bugs found & fixed

None yet.

## Phase handoff

TBD.
