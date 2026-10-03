# Phase 03 Report — Design system and app shell

## Requirement Table

| ID    | Requirement                                                                                                                                                           | Status | Evidence                                                                                                                                                                                      |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P3-01 | CSS design tokens: light palette, type, spacing, radii, shadows, masonry gap, focus ring, ntspire identity; document choices.                                         | TODO   | `frontend/src/app/globals.css`; architecture notes.                                                                                                                                           |
| P3-02 | Install/restyle only required shadcn primitives: button, input, badge, dialog, sheet, dropdown menu, tabs, tooltip, skeleton, breadcrumb, toggle-group/select, toast. | TODO   | `frontend/src/components/ui/`; design-system route.                                                                                                                                           |
| P3-03 | Reusable Container, selectable/removable Chip, EmptyState, retryable ErrorState, card skeleton, PageHeader, Wordmark.                                                 | TODO   | Component tests and design-system route.                                                                                                                                                      |
| P3-04 | Desktop navbar with configured nav/user links, sign-in explanation dialog, reserved locale-switcher slot.                                                             | DONE   | `site-header.tsx`, `navigation.ts`, and `sign-in-dialog.tsx` expose sign-in dialog and reserved slot while future routes remain configured but unavailable.                                   |
| P3-05 | Nav route availability drives rendered links; only existing routes render; link-resolution assertion.                                                                 | DONE   | `navigation.test.ts` checks availability; `design-system.dev.spec.ts` requests every rendered internal link and asserts HTTP 200.                                                             |
| P3-06 | Accessible mobile sheet with focus trap, Escape, focus return, and 44px minimum targets.                                                                              | DONE   | `mobile-nav-menu.tsx` uses the modal sheet primitive with 44px triggers/close control and >=44px rows; dev e2e verifies Tab containment, Escape, trigger focus return, and 375px no-overflow. |
| P3-07 | Footer with wordmark, existing-route links only, ntspire copyright.                                                                                                   | DONE   | `site-footer.tsx` renders only the available Home link, ntspire wordmark/copyright, and is checked by the dev route link assertion.                                                           |
| P3-08 | Dev-only `/[locale]/dev/design-system` component/state showcase, production 404.                                                                                      | DONE   | `src/app/[locale]/dev/design-system/page.tsx`; `phase3-production.spec.ts` declares and verifies exact production 404; dev e2e captures 1440px and 390px screenshots.                         |
| P3-09 | Skip link, landmarks, visible focus, reduced motion, heading hierarchy.                                                                                               | DONE   | `app-shell.tsx`, global `:focus-visible` and `prefers-reduced-motion` rules; design-system e2e checks skip link, landmarks, heading, and axe serious/critical results.                        |
| P3-10 | Install `@axe-core/playwright`, add axe helper, run on design-system route.                                                                                           | DONE   | `@axe-core/playwright`, `tests/e2e/axe-helper.ts`, and `design-system.dev.spec.ts`; desktop/mobile run reports zero serious/critical violations.                                              |

## Verification Results

Implementation checks are passing. The full five-command phase gate is pending.

## Manual Verification

Reviewed the design-system route at 1440px and 390px. Screenshots are saved as `screenshots/03-design-system-1440.png` and `screenshots/03-design-system-390.png`; the 375px overflow check passes.

## Not done / deviations

No Phase 03 requirements are currently outstanding.

## Bugs found & fixed

See `bug-fix.md` BUG-001 for the server/client boundary, mobile overflow, and tab-contrast issues found and fixed during Phase 03.

## Phase handoff

Phase 04 may use the design tokens, `Container`, `FilterChip`, content-state components, and shared UI primitives. Do not expose mock source links until the inherited real-brand mock fixtures are replaced with fictional brands under the updated global rules.
