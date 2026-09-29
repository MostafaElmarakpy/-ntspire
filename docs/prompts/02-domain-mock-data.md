# Phase 2 — Domain model, taxonomy, mock data & mock services

Read first: `00-global-rules.md`; spec §2, §7–9, §15–17, §19, §33–34, §80; master prompt §2, §5–7.

## Goal
A deterministic, realistic dataset + service layer the whole UI will consume. No UI in this phase.

## In scope
- P2-01 Types (`src/types`): Source, Page, Section, SectionCrop, Asset, Tag, Category, Collection, CollectionItem, Save, SearchResult. `Asset` and `SectionCrop` have **required** `width` and `height`. Section has NO crop coordinates itself; crops live on `SectionCrop` (`device`, `assetId`, `cropX/Y/Width/Height`, `renderedAssetId`, `width`, `height`). A Section has ≥ 1 crop; may have desktop and/or mobile.
- P2-02 **Single taxonomy config** (`src/config/taxonomy.ts`): 21 section types, 12 industries, 11 styles (spec §15–17), plus language (`en`,`ar`), direction (`ltr`,`rtl`), device (`desktop`,`mobile`), theme (`light`,`dark`). Each entry: stable `id`, message key for its label, `aliases: { en: string[]; ar?: string[] }` (Arabic aliases stay empty until Phase 11). Include e.g. "ecommerce" → E-commerce as an English alias.
- P2-03 Quick-filter chip config referencing taxonomy ids only. Include the permanent **"Arabic Websites"** chip → `language = ar`. Test: every chip resolves to a real taxonomy value (no orphan chips like "location"/"brand"/"card").
- P2-04 Mock data: 8–12 sources, 12–20 pages, 30–50 sections. Mixed English/Arabic content, LTR/RTL, desktop/mobile crops (some sections desktop-only, some mobile-only, some both), varied industries/styles/types, tags, categories, attribution and capture dates. Realistic names/titles (no "Test Website 1"). Arabic-language references contain real Arabic text in their data.
- P2-05 **Local image generation**: `npm run mock:assets` deterministically generates SVG assets into `public/mock-assets/` (committed). Section crops look like simple wireframes of their type (navbar bars, hero, pricing cards, footer columns…), not flat colored rectangles. Also generate **full-page screenshots per page per device** by stacking the section wireframes so that each `SectionCrop`'s `cropX/Y/Width/Height` truly points at that section inside the page asset (needed for View in Context). Varied heights on purpose: navbar/footer short, hero medium, features/pricing tall; ≥ 6 distinct aspect ratios. Desktop ~1440 wide, mobile ~390 wide.
- P2-06 Data-integrity tests: unique ids; all references resolve; every section has ≥ 1 crop; declared `width/height` equal the real SVG dimensions; crop rectangles lie inside their page asset; aspect-ratio variety; dataset minimums; taxonomy values used in data exist in config.
- P2-07 Service interfaces + mock implementations, all async (`Promise`): `SourceService`, `PageService`, `SectionService` (`getById`, `list`, `getSimilar`), `SearchService` (`search(request)` → `{ items, total, facets, nextCursor }`; `suggest()` is added in Phase 6 — declare it now on the interface only if you can keep it honest, otherwise add later). UI must never import fixture arrays directly.
- P2-08 Pure query engine in `lib/` used by the mock SearchService: filters (section type, industry, style, language, direction, device, theme, source), free-text `q` over title/source/tags/type, sorting (latest, featured), cursor/page pagination, facet counts.
- P2-09 `getSimilarSections()` exactly per spec §19: same `sectionType` AND (shared industry OR shared style), ORDER BY shared-tag count DESC, LIMIT 6, deterministic tie-break (e.g. id).
- P2-10 Dev-only mock controls (`mockConfig`): artificial delay, forced error, forced empty — driven by an env var and a `?__mock=slow|error|empty` query param that is **ignored in production builds**. Used later for loading/error/empty states and e2e.
- P2-11 Docs: ARCHITECTURE (domain, taxonomy, image strategy, service layer, how Mock→Api replacement works), NEXT_STEPS.

## Out of scope
UI, localStorage services (Saves/Collections come in Phases 4/8), Arabic aliases.

## Required tests
Everything in P2-03, P2-06, P2-08, P2-09 (including tie-breaks and edge cases), filter combinations, pagination boundaries, mockConfig behavior.

## Exit
Global gate + `docs/phase-reports/02-domain-mock-data.md`. No UI changes; existing e2e must still pass.
