# Phase 3 — Design system & app shell (English, LTR)

Read first: `00-global-rules.md`; spec §12–13, §41–45, §66; master prompt §8–9, §11, §25, §27.

## Goal
A reusable design system and the global shell (navbar, mobile menu, footer) with strong visual identity: editorial, image-first, dense, premium, not generic SaaS.

## In scope
- P3-01 Design tokens as CSS variables/Tailwind theme: colors (light only — the Theme filter refers to reference screenshots, not app dark mode), type scale, spacing, radii, shadows, **masonry gap token**, focus ring. One visual identity for ntspire (wordmark, palette, typography). Document choices in ARCHITECTURE.
- P3-02 Install/customize only the shadcn primitives actually needed: button, input, badge, dialog, sheet, dropdown-menu, tabs, tooltip, skeleton, breadcrumb, toggle-group/select, toast (sonner). Restyle to the ntspire identity.
- P3-03 ntspire components: `Container`, `Chip` / `FilterChip` (selectable + removable), `EmptyState`, `ErrorState` (with retry), card/section skeleton primitive, `PageHeader`, `Wordmark`.
- P3-04 Desktop navbar: nav config with Explore, Websites, Pages, Sections, Mobile, Categories, Search; user area (Sign in, Collections, Profile — UI-only mock: Sign in opens a clear "authentication arrives with the backend" dialog; no real auth). Reserve a slot for the locale switcher but do NOT render an EN/AR switcher yet.
- P3-05 **No dead links:** the nav config marks each item's route as available/unavailable; only items whose route exists are rendered; later phases flip them on. A test asserts every rendered link resolves (200). Search button is added in Phase 6.
- P3-06 Mobile navigation as a proper sheet/menu (not a squeezed desktop bar); focus trap, Esc, focus return, ≥ 44px touch targets.
- P3-07 Footer (wordmark, link groups only to existing routes, copyright "ntspire").
- P3-08 Dev-only `/[locale]/dev/design-system` route showing every component/state (returns 404 in production, excluded from sitemap later). Used for visual verification.
- P3-09 Accessibility baseline: skip link, landmark roles, visible focus, reduced-motion respected, heading hierarchy.
- P3-10 Install `@axe-core/playwright` and add an axe helper; run it on the design-system route.

## Out of scope
Homepage content, masonry, cards, filters, search overlay.

## Required tests
Component tests (chip select/remove, empty/error states, skeleton), mobile-menu behavior (open, Esc, focus return), nav link resolution, guard test still green, e2e for shell at 1440 and 390 with axe: 0 serious/critical violations.

## Exit
Global gate + `docs/phase-reports/03-design-system-shell.md` with screenshots of the design-system route at both viewports saved under `docs/phase-reports/screenshots/`.
