# Phase 07b — Section card redesign & click-to-open dual overlay

Read first: 00-global-rules.md; spec §18, §19, §14.2.4, §46; Phase
04 report (docs/phase-reports/04-masonry-cards-save.md) and Phase 07
report — this phase runs AFTER both.

## Important: this intentionally revises Phase 04's SectionCard footer
This is an explicit, user-approved design change, not an agent-initiated
rewrite. You are authorized to modify SectionCard's existing footer/overlay
markup from Phase 04 — this does not violate the "don't rewrite earlier
phases" rule, because the change is explicitly specified below. Do NOT
touch PageCard or SourceCard's click behavior; this phase applies to
SectionCard only.

## In scope

- P7b-01 Replace the current always-visible footer badge row with:
  a circular source avatar/favicon badge (~32–40px) absolutely positioned
  over the image's bottom-left corner, with a white ring/border, linking to
  the Source detail page, and calling stopPropagation() so it never also
  triggers the card's own click-to-open behavior (P7b-03).
- P7b-02 Save action becomes a top-right image overlay, hover-only on
  pointer devices, always-visible on touch (`@media (hover: none)`) per
  the existing rule (spec §18/§27) — no regression here, same accessibility
  contract as Phase 04's SaveButton, just repositioned.
- Keep one slim muted caption line below the image: Section Type + Source
  name only (smaller/secondary typography than before). Required for fast
  scanning (spec §3) — do not remove it.
- None of this changes card height computation (masonry rules, spec
  §14.1) — avatar/hover icons are overlays only, never add to measured
  height. Add/extend a test asserting height is unchanged by these overlays.
- P7b-03 Clicking the image/card body (not the avatar, not hover icons)
  opens a Detail Modal via a Next.js intercepting route
  (e.g. `app/(...)sections/[slug]`): a centered dialog over a
  dimmed/blurred backdrop of the grid, showing EXACTLY the same fields and
  actions as the standalone Section Detail page (Phase 07) — title, type,
  source (avatar + name, linking to Source), parent page, language,
  direction, industry, style, tags, captured date, attribution, Save, plus
  Prev/Next controls moving to the adjacent item in the current Explore/
  search result set without closing the modal. Screenshot at natural
  aspect ratio, never cropped.
- The modal must be reachable by a direct, shareable URL: visiting that
  URL cold (not navigated-to from the grid) must render the full
  standalone Section Detail page instead, per Next.js intercepting-route
  semantics. The standalone page remains canonical for SEO (spec §46) and
  for no-JS/cold visits — do not remove it.
- Close via ✕ control, Escape, and click-outside, matching the search
  overlay's dismissal rules (spec §14.2.4). Focus trap + focus return.
- P7b-04 A separate, lighter Quick-View lightbox (image only, no metadata
  panel, same backdrop, Esc/click-outside) opens from a small "expand"
  icon next to the hover-revealed Save icon — this is the concrete
  behavior for the "quick view" hover action already named in spec §18.

## Out of scope
- Any change to the Section/SectionCrop/Asset data model.
- Any change to the masonry sizing or column-placement algorithm
  (Phase 04's distributeIntoColumns stays untouched).
- Removing the standalone Section Detail page.
- Applying this interaction to Page/Source cards.

## Required tests
Avatar click stops propagation and does not open the modal; Save overlay
hover/touch visibility unchanged from Phase 04's contract; card height
identical with/without overlays rendered; intercepting route opens the
modal from Explore/search navigation but a direct/cold visit to the same
URL renders the full page (no modal shell); Prev/Next within the modal
updates content and URL without closing it; Escape/click-outside/✕ all
close the modal and return focus to the originating card; Quick-View
lightbox opens independently of the Detail Modal and shows image only;
axe clean on both overlays; e2e at desktop and mobile widths.

## Exit
Global gate + report. Explicitly confirm in the report that Phase 04's
masonry/height computation and Phase 07's standalone detail page both
still pass their existing test suites unchanged.
