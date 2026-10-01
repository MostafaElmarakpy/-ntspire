# Phase 03 Report — Design system and app shell

## Requirement Table

| ID | Requirement | Status | Evidence |
| --- | --- | --- | --- |
| P3-01 | CSS design tokens: light palette, type, spacing, radii, shadows, masonry gap, focus ring, ntspire identity; document choices. | TODO | `frontend/src/app/globals.css`; architecture notes. |
| P3-02 | Install/restyle only required shadcn primitives: button, input, badge, dialog, sheet, dropdown menu, tabs, tooltip, skeleton, breadcrumb, toggle-group/select, toast. | TODO | `frontend/src/components/ui/`; design-system route. |
| P3-03 | Reusable Container, selectable/removable Chip, EmptyState, retryable ErrorState, card skeleton, PageHeader, Wordmark. | TODO | Component tests and design-system route. |
| P3-04 | Desktop navbar with configured nav/user links, sign-in explanation dialog, reserved locale-switcher slot. | TODO | Shell component tests and rendered route. |
| P3-05 | Nav route availability drives rendered links; only existing routes render; link-resolution assertion. | TODO | Nav config/unit test and shell e2e link checks. |
| P3-06 | Accessible mobile sheet with focus trap, Escape, focus return, and 44px minimum targets. | TODO | Mobile menu interaction tests and mobile e2e. |
| P3-07 | Footer with wordmark, existing-route links only, ntspire copyright. | TODO | Footer component test and route link assertions. |
| P3-08 | Dev-only `/[locale]/dev/design-system` component/state showcase, production 404. | TODO | Dev-server e2e plus production 404 assertion. |
| P3-09 | Skip link, landmarks, visible focus, reduced motion, heading hierarchy. | TODO | Accessibility tests, axe, and shell component assertions. |
| P3-10 | Install `@axe-core/playwright`, add axe helper, run on design-system route. | TODO | Playwright helper and dev-route axe e2e at desktop/mobile. |

## Verification Results

Pending implementation and final gate.

## Manual Verification

Pending desktop/mobile route review and saved screenshots.

## Not done / deviations

None identified yet.

## Bugs found & fixed

None identified yet.

## Phase handoff

Pending Phase 03 exit audit.
