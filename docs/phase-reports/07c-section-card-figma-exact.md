# 07c — SectionCard rebuilt to Figma Card 19:325

One component, exact spec: radius 16, `#F5F5F5`-tone fill, hairline, 8px
overlay row — 32px rounded-square source avatar top-left, Save (bookmark) +
Open (arrow-up-right) 32px radius-10 actions top-right with 4px gap.

## What changed

- `features/gallery/section-card.tsx`: image-only card (caption removed),
  avatar moved bottom→top-left and reshaped circle→`rounded-[10px]` `size-8`,
  actions group narrowed to `end-0` auto width, Quick View lightbox removed,
  arrow action links to the detail route. Stretched body link, Save behavior,
  hover/touch overlay visibility, and uncropped image rules unchanged.
- `components/dev-arabic-marker.tsx`: moved top→bottom so it never covers
  the avatar (dev-only, aria-hidden, unchanged contract).
- `features/gallery/gallery-experience.tsx`: dev sections grid
  `eagerRows` 3→12 — the suites scroll the whole dataset, and a tall
  scrolled-to lazy image was winning LCP under the clean-run fixture.
  Production feeds keep lazy below-the-fold.
- Estimator `CARD_FOOTER_ALLOWANCE` intentionally untouched (uniform
  constant; placement self-consistent).

## Deliberate deviations from Figma

- Fill uses `bg-muted` token, not literal `#F5F5F5`.
- Avatar content stays the source monogram (no source logo assets exist).
- Arrow accessible name is the bare title (the stretched link already owns
  "Open reference: {title}"; duplicates break strict queries).
- No Quick View: the Figma behavior set has no lightbox. Its tests were
  rewritten to the arrow-open contract, not deleted silently (see below).

## Test contract changes

- `cards.test.tsx`: caption tests → image-only test; actions test asserts
  arrow link (`data-section-card-arrow`) + href; Quick View lightbox test →
  arrow stopPropagation test; device-caption matrix removed with the caption.
- `explore.spec.ts`: Quick View modal test → "overlays keep stable bounds
  and the arrow opens the detail modal" (bounds poll, axe, modal open via
  arrow, Escape dismissal). Modal focus-restore stays covered by the card-body
  modal test (close restores to the card link, not the arrow).
- `gallery.dev.spec.ts`: Quick View bounds probe → Save-toggle bounds probe
  (uses the renamed "Remove reference from saved" button).

## Bugs

- BUG-020: full-width actions overlay intercepted avatar clicks — fixed with
  `end-0` auto-width group.

## Verification

typecheck ✅ · unit 288/288 ✅ · build ✅ · explore e2e 26/26 ✅ ·
gallery.dev 19/19 ✅ · lint clean on touched files (2 pre-existing warnings
removed with the deleted tests).
