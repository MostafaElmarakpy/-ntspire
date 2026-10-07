# Phase 07c — Section detail viewer: two-panel layout

Read first: `00-global-rules.md`; `docs/phase-reports/07b-card-redesign-detail-modal.md`;
`docs/phase-reports/07-detail-pages.md`; spec §19, §14.2.4, §45.
This phase runs AFTER 07b is fully green.

## Authorization note
This intentionally restructures the internal layout of the shared Section detail
presentation used by BOTH the intercepting modal (`app/[locale]/explore/@modal`) and the
standalone `/sections/[id]` page. You are authorized to change that markup and to retarget
07b/07 test selectors where the markup genuinely changes. You are NOT authorized to weaken
an assertion, change routing, or change data flow.

## Problem being fixed (log it in bug-fix.md first)
In the current modal the Desktop/Mobile switcher, thumbnail, action buttons and the metadata
list overlap or crowd each other (labels like SOURCE sit under the switcher; buttons overlap
values). Cause: single-column stack with mixed absolute/flow positioning inside one narrow
container. Find the actual cause in the code and record it.

## Prerequisites — do these before any layout work
- P7c-00a Run `explore.spec.ts` "Quick View is image-only…" on the mobile project 3 times in a
  row. It must pass all 3. If it fails, fix the root cause (never the <=1px tolerance) before
  continuing.
- P7c-00b Start from a clean 5-command gate. Paste it.

## Goal
ONE viewer (never two dialogs) sharing one selected-reference state:
LEFT = information sidebar, RIGHT = dominant media panel. Calm, minimal, editorial, image-first.

## In scope
- P7c-01 Two-panel layout at >= 1024px: sidebar left (clamp ~300–380px), media panel takes the
  rest. Sidebar and media panel scroll independently; the page behind never scrolls.
- P7c-02 Viewer fills the screen: inset from the viewport edges by a spacing token using
  viewport units — NO fixed pixel max-width. Verify no dead gutters at layout viewports
  1440 / 1600 / 1800 and 1920 / 2133 / 2400 (= 100 / 90 / 80% browser zoom).
- P7c-03 Sidebar built with real flex/grid, no absolute positioning for text:
  controls row → eyebrow (section type) + title → source (avatar + name, links to Source) →
  metadata list (`<dl>`, consistent label/value rows, generous spacing) → actions block pinned
  at the bottom (Save, Save as image, Send to Figma, View in context). Actions must never overlap
  metadata; if metadata is long, only the metadata scrolls.
- P7c-04 The Desktop/Mobile switcher moves into the media panel (above or below the image), not
  the sidebar flow.
- P7c-05 Controls: Previous, Next and Close become ICON-ONLY buttons (remove the visible
  "Previous reference" / "Next reference" text). Keep accessible names ("Previous reference",
  "Next reference", "Close") via aria-label; hit area >= 44px on touch; ArrowLeft / ArrowRight /
  Escape unchanged; Prev/Next still walk the CURRENT filtered Explore result set.
- P7c-06 Media: natural aspect ratio, `contain` inside the panel, never cropped or distorted;
  very tall screenshots scroll inside the media panel; wide ones fit width. Keep existing alt
  text. Preload current / previous / next only. Broken or missing image shows a graceful state.
- P7c-07 Fields: ONLY what the Section model already has — section type, industry, style,
  language, direction, device availability, tags, captured date, attribution, source. Omit any
  absent field gracefully. No new taxonomy dimensions, no invented values.
- P7c-08 Responsive: tablet — split if >= 900px wide, otherwise stacked; mobile (< 768px) —
  stacked: media on top (bounded height), info scrolls beneath, actions sticky at the bottom.
  No horizontal overflow at 375px.
- P7c-09 Context preserved: closing the viewer (X, Escape, outside click, Back) returns to the
  same Explore state — same URL and filters, same scroll position, focus on the originating
  card. Add an e2e that proves scroll position before open equals scroll position after close.
- P7c-10 Motion (CSS only, no new library): open/close = backdrop fade + blur, viewer fade +
  subtle scale; Previous/Next = media and sidebar content slide-fade directionally; 150–220 ms;
  `prefers-reduced-motion` disables it. Motion must not delay focus management or make tests flaky.
- P7c-11 The standalone `/sections/[id]` page uses the same split layout components in-page
  (no modal chrome) and its existing e2e tests pass unchanged.
- P7c-12 Automated no-overlap proof: an e2e that measures bounding boxes and asserts the
  actions block and every metadata row do not intersect, at 1440 (100%), 1800 (80% zoom
  equivalent), 1024 and 390 widths, with a long-metadata record.

## Out of scope
Data flow, intercepting-route architecture, Explore grid / MasonryGrid, taxonomy, Save /
Save-as-image / Send-to-Figma / View-in-context behavior (placement only), Quick View lightbox
(must keep working), any new dependency, copying or naming any third-party site.

## Before coding
Report briefly: the real cause of the overlap, which 07b components you will reuse, where the
selected-reference state lives, how Prev/Next derive from the filtered set, the layout hierarchy,
and the motion plan. Then implement.

## Required tests
No-overlap geometry (P7c-12), icon-only controls keep accessible names and keyboard nav,
Prev/Next stay within the filtered set, scroll restoration (P7c-09), reduced-motion, tall / wide /
missing-image cases, axe clean on modal and standalone page, all 07b and 07 suites still green.

## Exit
Global gate (all five commands, one clean run) + `docs/phase-reports/07c-detail-viewer-layout.md`
with a full requirement table. Then STOP.
