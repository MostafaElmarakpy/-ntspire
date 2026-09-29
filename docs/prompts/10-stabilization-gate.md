# Phase 10 — STABILIZATION GATE (English/LTR complete — human sign-off required)

Read first: `00-global-rules.md`; spec §38–40, §43, §45, §57, §63, §78; master prompt §31–32, §45–46, §34.

## Goal
Prove the whole English/LTR product works end to end with zero errors. No new features. This phase ends with a human decision to proceed to Arabic.

## In scope
- P10-01 **Main user flow e2e** (spec/master §32) on desktop AND mobile viewports: Home → Search (detect filters) → Explore results → open Section → switch desktop/mobile → Save → Add to collection → Download image → back to Explore → change filters.
- P10-02 **Route crawl e2e**: visit every route (including all mock sources/pages/sections, collections, categories, dev routes in non-prod, not-found) and assert clean console, no failed requests, no broken internal links (crawl all `<a href>`), no horizontal overflow at 375, 768, 1024, 1440.
- P10-03 **Accessibility sweep**: axe on every route × 2 viewports, 0 serious/critical; manual keyboard walkthrough notes for overlay, filter sheet, menus, dialogs; focus order and visible focus verified; reduced-motion honored.
- P10-04 **Masonry verification**: at 4 widths verify column counts, mixed heights, no blank gaps (compute column bottoms and assert their spread is within one card height), no image cropped/stretched (rendered ratio ≈ declared ratio), no layout shift on load (measure CLS in Playwright, target ≈ 0).
- P10-05 **State verification**: loading/empty/error states on Explore, detail routes, collections, home blocks via `__mock`.
- P10-06 **Performance sanity**: `next build` route/bundle output reviewed; list every Client Component and justify or fix unnecessary ones; lazy loading confirmed; no oversized dependencies; note results.
- P10-07 **Code health**: find dead code/unused exports/components/dependencies (e.g. `knip` or equivalent; if it cannot be installed offline, do it manually), duplicated taxonomy/logic, magic values, giant components, `any`, eslint/ts suppressions. Fix all Critical and Important findings.
- P10-08 **Regression audit**: confirm every requirement ID in `docs/phase-reports/01…09` is still DONE with evidence; re-run and list any that regressed.
- P10-09 Fill `system-review.md` completely (Critical / Important / Nice to Have) and fix Critical + Important items now.
- P10-10 Confirm RTL-readiness: guard test green, no hardcoded UI strings (scan), masonry accepts `direction`, locale scaffold intact.
- P10-11 Produce `docs/phase-reports/10-manual-checklist.md`: a checklist the HUMAN will walk through in a real browser (routes, viewports, interactions) with expected results.

## Out of scope
New features, Arabic/RTL. Do NOT start Phase 11.

## Exit
Global gate + report. End your report with: "Ready for human sign-off — do not proceed to Phase 11 until the human confirms."
