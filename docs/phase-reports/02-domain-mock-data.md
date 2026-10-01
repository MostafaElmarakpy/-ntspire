# Phase 02 Report — Domain mock data

## Requirement Table

| ID    | Requirement                                                                                                                                         | Status | Evidence                                                                                                                                                                                             |
| :---- | :-------------------------------------------------------------------------------------------------------------------------------------------------- | :----- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P2-01 | Types (`src/types`): Source, Page, Section, SectionCrop, Asset, Tag, Category, Collection, CollectionItem, Save, SearchResult. Required dimensions. | DONE   | `src/types/domain.ts`, `src/types/services.ts`, and `src/mocks/data-integrity.test.ts` cover the complete model; `Asset` and `SectionCrop` require dimensions and `Section` has no crop coordinates. |
| P2-02 | Single taxonomy config (`src/config/taxonomy.ts`): 21 types, 12 industries, 11 styles, etc. Stable IDs and aliases.                                 | DONE   | `src/config/taxonomy.ts`; integrity test verifies 21/12/11 counts, language/direction/device/theme values, empty Arabic aliases, and the lowercase `ecommerce` alias.                                |
| P2-03 | Quick-filter chip config referencing taxonomy IDs. Includes "Arabic Websites".                                                                      | DONE   | `QUICK_FILTER_CHIPS` plus the chip-resolution test verify every chip resolves and `arabic-websites` maps to `language = ar`.                                                                         |
| P2-04 | Mock data: 8–12 sources, 12–20 pages, 30–50 sections. Mixed English/Arabic, LTR/RTL, desktop/mobile.                                                | DONE   | `src/mocks/mock-manifest.json` derives 10 sources, 14 pages, 42 sections with Arabic text, metadata, tags, categories, and varied device availability; minimum/range and reference tests pass.       |
| P2-05 | Local image generation: `npm run mock:assets` generates deterministic SVG wireframes and stacked page screenshots.                                  | DONE   | `scripts/generate-mock-assets.mjs` generated 88 local SVGs; `data-integrity.test.ts` compares SVG dimensions, crop bounds, and at least six aspect ratios.                                           |
| P2-06 | Data-integrity tests: unique IDs, resolved references, crop validity, aspect ratios, dataset minimums.                                              | DONE   | `src/mocks/data-integrity.test.ts` covers unique IDs, entity references, taxonomy references, required crops, dimensions, bounds, ranges, and aspect-ratio variety.                                  |
| P2-07 | Service interfaces + mock implementations (async): Source, Page, Section, Search.                                                                   | DONE   | `src/types/services.ts` and `src/mocks/services.ts` expose async source/page/section/search services; `services.test.ts` verifies Promise contracts and results.                                     |
| P2-08 | Pure query engine: filters, free-text `q`, sorting, pagination, facet counts.                                                                       | DONE   | `src/lib/query-engine.ts` and `query-engine.test.ts` cover taxonomy/device/source/theme filters, title/source/tag/type search, latest/featured sorting, cursor boundaries, and facets.               |
| P2-09 | `getSimilarSections()` logic: same type + (industry OR style), ordered by tags, deterministic tie-break.                                            | DONE   | `mockSectionService.getSimilar()` applies the exact rule, six-item cap, shared-tag descending order, and ID tie-break; service test proves a shared-style/tag match.                                 |
| P2-10 | Dev-only mock controls (`mockConfig`): artificial delay, forced error, forced empty (env + query param).                                            | DONE   | `src/config/mock-config.ts`, its tests, and search service tests verify env/query controls, slow delay configuration, error/empty modes, and production ignoring controls.                           |
| P2-11 | Docs: ARCHITECTURE (domain, taxonomy, image strategy, service layer) and NEXT_STEPS.                                                                | DONE   | `ARCHITECTURE.md` and `NEXT_STEPS.md` document the Phase 02 model, asset strategy, query/service boundary, API replacement path, and Phase 03 handoff.                                               |

## Implementation Details

### Domain & Taxonomy

- [x] Define types in `src/types/domain.ts`
- [x] Create `src/config/taxonomy.ts`
- [x] Define quick-filter chips in the shared taxonomy module

### Mock Assets

- [x] Update `frontend/scripts/generate-mock-assets.mjs` to generate wireframes and stacked pages.
- [x] Run `npm run mock:assets` and verify `public/mock-assets/` (88 SVGs).

### Mock Data

- [x] Populate `src/mocks/mock-manifest.json` and derive typed fixtures in `src/mocks/fixtures.ts`.

### Service Layer & Query Engine

- [x] Implement `src/types/services.ts` interfaces.
- [x] Implement `src/lib/query-engine.ts`.
- [x] Implement `src/mocks/services.ts`.

## Verification Results

### Automated Tests

- [x] `npm run test`: 8 test files, 19 tests passed
- [x] `npm run typecheck`: passed
- [x] `npm run lint`: passed
- [x] `npm run build`: passed; Next.js compiled and generated the existing four routes
- [x] `npm run test:e2e`: 10 tests reported passed; 8 functional tests passed and 2 intentional fixture-proof expected failures were correctly caught

### Manual Verification

- [x] Checked the generated local SVG set: 88 assets, including page stacks and section wireframes.
- [x] Verified crop dimensions/bounds against generated SVGs through the integrity test.
- [x] Verified `?__mock=slow|error|empty` and production ignoring controls through mock-config/service tests.

## Not done / deviations

- No Phase 02 requirements remain outstanding.
- E2E retains the two intentional expected-failure fixture-proof tests from Phase 01; Playwright reports them with `✘` while the overall run exits successfully. No UI or new route was added in this phase.
- The working tree contains test-run artifacts and earlier-phase changes; they were not reverted or folded into this phase.

## Bugs found & fixed

- Fixed the initial placeholder fixture/asset mismatch by making the manifest, generator, typed fixtures, and crop geometry share one deterministic model.
- Fixed the mock empty mode to return typed empty values rather than `undefined`.

## Next Phase Prep

- Phase 03 can use `mockServices` and preserve the declared `Asset`/`SectionCrop` dimensions for stable image layout.
- Keep UI components behind the service boundary; do not import `MOCK_FIXTURE` directly.
