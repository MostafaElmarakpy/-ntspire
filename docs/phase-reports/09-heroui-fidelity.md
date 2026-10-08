# HeroUI adoption + Nimbus fidelity — implementation report

Scope: adopt HeroUI (`@heroui/react@3.2.6`, v3 Tailwind-v4/React-19 line)
following the Figma + recent.design structure, via pilot-then-expand, plus a
Stripe-like fidelity theme for fictional Nimbus Pay test imagery (no real
Stripe pixels — fictional-brands rule, `.example` URLs, and §61 stand).

## Lanes and outcomes

| Lane | Content | Status | Evidence |
|------|---------|--------|----------|
| A | Install (pinned), per-component CSS + token bridge, SSR smoke | Done | `package.json`, `globals.css` imports/bridge; build + typecheck + explore 26/26 on CSS-only change |
| B pilot | FilterChip→Chip, skeleton→Skeleton, Sheets→Drawer | Done | Unit 292 green; Drawer.Trigger fix (below); explore 26/26; design-system.dev 4/4 |
| C expand | Badge, Input, Tabs, Select swapped; Breadcrumb + Tooltip reverted; Toggle/Button/Sonner kept | Done | Unit 292 green; detail breadcrumb flows green |
| D images | Nimbus Pay premium SVG theme (dark hero, gradients, blobs, bento, stats band) | Done | 12 regenerated SVGs; `src/mocks/` 10/10 green; dimensions/ids unchanged |
| E docs | This report, ARCHITECTURE + NEXT_STEPS updates, BUG-017/018/019 | Done | Files below |

Kept custom with rationale: Button (cva + `asChild` SPA links in 6 detail flows + Figma overlay spec), Breadcrumb (SPA links), Toggle/ToggleGroup (radiogroup contract, 5 DeviceSwitcher tests), Tooltip (forced nesting wrapper), search-overlay internals, masonry, SaveButton logic, sonner (1 usage).

## Bugs found

- BUG-017: trigger-less Drawer Root warns (RAC DialogTrigger press-wraps children) — fixed with in-Root `Drawer.Trigger`.
- BUG-018: Badge defaults to absolute corner dot — fixed with `static [transform:none]` pill override.
- BUG-019: Breadcrumbs render-function assumption wrong (crash) + Tooltip nesting + tabs `--muted` text collision + unlabeled demo Select — breadcrumb/tooltip reverted, tabs scoped, select labeled.
- BUG-016 (earlier): logo LCP warning — `priority`.

## Verification

typecheck ✅ · unit 292/292 ✅ · build ✅ · explore 26/26 (twice) ✅ ·
foundation/gallery/phase3/overlay 28 ✅ · gallery.dev 19 ✅ ·
design-system.dev 4/4 ✅ · detail e2e: only pre-existing desktop
homepage-nav failure (WIP stream hides header on `/en`; verified via stash) ·
lint: only 3 pre-existing errors in committed debug helpers.

## Known limitations / not done

- Entertainment industry still 0 sections (facet-gated out of pills).
- Figma `+`/bookmark header actions, rotating sponsors, linked jobs, Tools/Skills/Jobs routes: still deferred to owning phases.
- HeroUI v3 churn risk: versions pinned; future bumps need the pilot gates re-run.
- Detail `:404` mock-modes test flaked once post-swap (green isolated + twice after); watch item, likely skeleton-paint timing.
